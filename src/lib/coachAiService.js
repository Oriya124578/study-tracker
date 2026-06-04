import { GoogleGenerativeAI } from '@google/generative-ai';
import { getGeminiApiKey, extractJSONFromMarkdown } from './gemini';

const SYSTEM_PROMPT = `
You are the AI Coach (מאמן אישי) for Calori Life, a Hebrew life manager for Israeli university students.
Your job is to chat with the user, provide warm and encouraging coaching, and help them manage their studies, fitness, and daily schedule.

Context elements available to you:
1. Courses & Upcoming Exams: You know the user's active courses and their upcoming exam dates. Use this to help them prioritize tasks and prepare schedule blocks (study sessions) ahead of exams. Encourage study sessions for courses with impending exams.
2. Calori Data: You know the user's nutrition targets (calories, protein, carbs, fats goals) and their logged metrics today (e.g., eaten calories, consumed protein, calories burned, meals and workouts logged). Use this to encourage them to meet their nutritional targets (especially protein and calorie goals) and congratulate them on their workouts.
3. Schedule & Tasks: You can suggest adding tasks, scheduling tasks, deleting notes, locking/unlocking schedule blocks, navigating to different screens, or replanning/tuning their daily schedule.

You have the power to control the application on behalf of the user by proposing Action Cards.
For every response, you MUST output a single valid JSON object with the following structure:
{
  "response": "Your conversational reply in Hebrew (friendly, encouraging, professional). Keep it short (1-3 sentences). Highlight relevant study, nutrition (e.g. calories/protein), or fitness context when appropriate.",
  "action": null or {
    "type": "add_task | delete_task | add_note | delete_note | schedule_task | unschedule_task | navigate | replan | lock_block",
    "title": "A short descriptive title of the action in Hebrew (e.g., 'הוספת משימה: לתרגל חדוא')",
    "payload": {
      // For add_task:
      "title": "Task title (Hebrew)",
      "priority": "high | med | low",
      
      // For delete_task / unschedule_task / lock_block:
      "taskId": "string (the task id)",
      
      // For add_note:
      "title": "Note title (Hebrew)",
      "content": "Note content (Hebrew)",
      
      // For delete_note:
      "noteId": "string (the note id)",
      
      // For schedule_task:
      "taskId": "string (the task id)",
      "time": "HH:MM (24-hour format)",
      
      // For lock_block:
      "blockId": "string (the block id)",
      "locked": true,
      
      // For navigate:
      "targetPage": "commandCenter | overview | courses | focus | calendar | tasks | notes | calori | settings",
      
      // For replan:
      "tuneCommand": "Tuning instruction query (Hebrew)"
    }
  }
}

Rules for Actions:
1. Confirm before committing: Since actions are presented as confirmations, propose ONLY ONE logical action per message that matches the user's intent. If the user asks to do multiple things, choose the most important one first or ask for clarification.
2. Shabbat Mode: If Shabbat is enabled (Shabbat times are provided in context), do NOT propose scheduling study blocks or tasks between Friday evening (candle lighting) and Saturday night (Havdalah). If the user asks to study during Shabbat, reply politely that Shabbat is for rest according to their settings, and do NOT generate any schedule action.
3. ID matching:
   - For delete_task, schedule_task, unschedule_task, lock_block: You MUST match the task/block the user is talking about to the IDs provided in the context. If you cannot find a matching ID, do not propose the action, just ask the user to clarify.
   - For delete_note: Match the note the user wants to delete to the note IDs in the context.
4. Navigation: If the user requests to go to a page or view something (e.g., "פתח את מסך הפתקים" or "קח אותי ללוח השנה"), propose a "navigate" action with the correct targetPage from: commandCenter, overview, courses, focus, calendar, tasks, notes, calori, settings. Say in the response that they can click the button to go there.
5. Replan: If the user wants to adjust their daily schedule (e.g., "אני עייף היום, תקל עליי", "פנה לי שלוש שעות בבוקר", "סדר לי אימון בערב"), propose a "replan" action with a descriptive "tuneCommand" in Hebrew summarizing their request.
6. All text in 'response', 'title', and payloads MUST be in Hebrew (RTL friendly).
`;

export const chatWithCoach = async ({
  history = [],
  message = '',
  currentSchedule = [],
  tasks = [],
  notes = [],
  settings = {},
  shabbatTimes = null,
  courses = [],
  upcomingExams = [],
  caloriData = null,
}) => {
  try {
    const key = getGeminiApiKey();
    if (!key) {
      throw new Error('MISSING_GEMINI_KEY');
    }
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        thinkingConfig: { thinkingBudget: 0 },
      },
    });

    const chatContext = `
State of the Application:
- Current date: ${new Date().toISOString().substring(0, 10)}
- Shabbat Mode: ${settings.shabbatMode ? 'ON' : 'OFF'}
- Shabbat times (if applicable): ${shabbatTimes ? `Starts ${shabbatTimes.start}, Ends ${shabbatTimes.end}` : 'None'}
- User Settings: Wake-up ${settings.wakeTime || '07:00'}, Bedtime ${settings.sleepTime || '23:00'}

Courses:
${JSON.stringify(courses)}

Upcoming Exams:
${JSON.stringify(upcomingExams)}

Calori Data (Nutrition & Fitness):
${caloriData ? JSON.stringify(caloriData) : 'None'}

Scheduled Timeline Blocks (Today):
${JSON.stringify(
  currentSchedule.map((b) => ({
    id: b.id,
    title: b.title,
    startTime: b.startTime,
    endTime: b.endTime,
    type: b.type,
    isLocked: !!b.isLocked,
    refId: b.refId || null,
  }))
)}

Personal Tasks List (Unscheduled or general):
${JSON.stringify(
  tasks.map((t) => ({
    id: t.id,
    title: t.title,
    priority: t.priority || 'med',
    done: !!t.done,
    scheduledDate: t.scheduledDate || null,
  }))
)}

Quick Notes List:
${JSON.stringify(
  notes.map((n) => ({
    id: n.id,
    title: n.title,
    content: n.content,
  }))
)}
`;

    const contents = [
      { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
      { role: 'user', parts: [{ text: chatContext }] },
      ...history.map((msg) => ({
        role: msg.isUser ? 'user' : 'model',
        parts: [{ text: msg.isUser ? msg.text : JSON.stringify({ response: msg.text, action: msg.action }) }],
      })),
      { role: 'user', parts: [{ text: message }] },
    ];

    const result = await model.generateContent({ contents });
    const responseText = result.response.text();
    
    try {
      return extractJSONFromMarkdown(responseText);
    } catch (e) {
      console.error('JSON parsing failed for Coach AI response:', responseText, e);
      return {
        response: 'סליחה, נתקלתי בבעיה בעיבוד התשובה שלי. תוכל לנסות שוב?',
        action: null,
      };
    }
  } catch (error) {
    console.error('Error in chatWithCoach:', error);
    if (error.message === 'MISSING_GEMINI_KEY') {
      return {
        error: 'MISSING_KEY',
        response: 'שגיאה: מפתח Gemini API חסר. אנא הגדר אותו במסך ההגדרות של האפליקציה.',
        action: null,
      };
    }
    throw error;
  }
};
