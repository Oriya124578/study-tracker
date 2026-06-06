import { GoogleGenerativeAI } from '@google/generative-ai';

/** Get the configured Gemini API key from localStorage or VITE env. */
export const getGeminiApiKey = () => {
  return localStorage.getItem('gemini_api_key') || import.meta.env.VITE_GEMINI_API_KEY || '';
};

/** Initialize the Gemini API client. Throws if no key found. */
const getAIClient = () => {
  const key = getGeminiApiKey();
  if (!key) {
    throw new Error('MISSING_GEMINI_KEY');
  }
  return new GoogleGenerativeAI(key);
};

const SYSTEM_PROMPT = `
You are an advanced AI Scheduler and Personal Coach for Calori Life, a Hebrew-first life manager for Israeli university students.
Your job is to arrange the user's daily schedule into structured hourly blocks (from wake-up to bedtime) based on their settings, tasks, course exams, appointments, and fitness activities.

You must ALWAYS output a single valid JSON object with the following structure:
{
  "blocks": [
    {
      "id": "string",
      "type": "sleep | study | event | meal | workout | travel",
      "title": "string (Hebrew, descriptive)",
      "startTime": "HH:MM (24-hour format)",
      "endTime": "HH:MM (24-hour format)",
      "duration": number (minutes),
      "refId": "string (optional reference id of a task, course, or Calori session)",
      "isLocked": boolean (true for fixed classes/appointments, false for proposed items),
      "isProposed": boolean (true if suggested by AI, false if already exists/logged),
      "isCompleted": boolean,
      "notes": "string (optional detail in Hebrew)"
    }
  ],
  "coachNote": "string (A brief, encouraging explanation of the schedule in Hebrew, max 2-3 sentences)"
}

Scheduling Rules:
1. Sleep hours: Respect the user's wake and sleep hours (e.g. 07:00 to 23:00). Add 'sleep' blocks for the remaining time.
2. Morning Prayer: Immediately after the user's wake-up time (e.g., if wake time is 07:00, then from 07:00 to 07:45), ALWAYS schedule a block titled "תפילה" (type: 'event') for 45 minutes.
3. Fixed events (events, university lectures, tutorials, exams, doctor appointments): These are pre-existing and MUST NOT be moved. Mark them with isLocked = true, isProposed = false.
4. Travel blocks: For fixed events with location, check the travelTimeMinutes (provided in context) and insert a 'travel' block (e.g. "נסיעה") before and after the event.
5. Shabbat: If Shabbat starts today (Shabbat times provided in context), ensure NO blocks are scheduled from 1 hour before Shabbat starts until the end of the day. If Shabbat ends today, ensure NO blocks (like study, workout, travel) are scheduled from the start of the day until 1 hour after Shabbat ends. Shabbat time is sacred rest.
6. Calori Workouts: If there is a planned Calori workout for today (provided in context), schedule a 'workout' block (isProposed = true, type = 'workout') at an optimal time (e.g. late afternoon/evening, avoiding study hours/fixed events).
7. Study Blocks: Schedule study blocks ('study') focusing on courses with upcoming exams (exams are sorted by days remaining). Group tasks under these study blocks. A study block should ideally be around 90-120 minutes, or match the user's preferred duration. Name the block like "למידה: [Course Name]".
8. Tasks: Incorporate high/med priority tasks into appropriate study blocks or as separate task blocks, setting refId to the task id.
9. Meals: Schedule 'meal' blocks (e.g. breakfast, lunch, dinner) at normal times (e.g. 08:30, 13:00, 19:30) of about 30-45 minutes.
10. Do not overlap blocks! They must be sequential.
11. All text fields (title, notes, coachNote) MUST be in Hebrew (RTL friendly). Number/time fields should use standard numerals.
12. NEVER generate any blocks of type 'leisure' or any block representing breaks, rest, leisure, or free time (e.g. 'הפסקה קצרה', 'הפסקה', 'זמן חופשי', 'מנוחה'). The timeline MUST only contain active blocks like 'study', 'meal', 'workout', 'event', 'sleep', 'travel'. Gaps in the timeline represent free/break time and must simply have no blocks at all.
`;

export const extractJSONFromMarkdown = (text) => {
  let cleanText = text.trim();
  const match = cleanText.match(/```(?:json)?\n([\s\S]*?)```/);
  if (match) cleanText = match[1].trim();
  return JSON.parse(cleanText);
};

const parseGeminiJSON = (text) => {
  if (!text) return { blocks: [], coachNote: '' };
  try {
    return extractJSONFromMarkdown(text);
  } catch (err) {
    console.error('[Gemini Service] Failed to parse JSON:', err, text);
    return { blocks: [], coachNote: 'Failed to parse AI response' };
  }
};

/**
 * Generate a new daily schedule from scratch based on user data.
 * @param {Object} context - The user preferences, fixed events, tasks, workouts, and Shabbat times.
 */
export const generateDailySchedule = async (context) => {
  try {
    const genAI = getAIClient();
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: { 
        responseMimeType: 'application/json',
        thinkingConfig: { thinkingBudget: 0 }
      },
    });

    const prompt = `
Generate today's schedule.
Today's date is: ${context.todayDate} (Day of week: ${context.dayOfWeek}).

User settings:
- Wake up time: ${context.settings?.wakeTime || '07:00'}
- Bedtime: ${context.settings?.sleepTime || '23:00'}
- Preferred study times: ${JSON.stringify(context.settings?.studyPreferences || {})}
- Preferred study block duration: ${context.settings?.studyBlockDuration || 90} minutes
- Shabbat Mode: ${context.settings?.shabbatMode ? 'ON' : 'OFF'}
- Shabbat times (if applicable): ${context.shabbatTimes ? `Starts ${context.shabbatTimes.start}, Ends ${context.shabbatTimes.end}` : 'None'}

Input data:
- Pre-scheduled fixed events for today (do not move, lock them):
  ${JSON.stringify(context.fixedEvents)}
- Upcoming exams (courses and days remaining):
  ${JSON.stringify(context.upcomingExams)}
- Unscheduled tasks (place them in slots or link to study blocks):
  ${JSON.stringify(context.tasks)}
- Today's Calori workouts (if planned, recommend a slot for it):
  ${JSON.stringify(context.workouts)}
- Today's logged meals (already eaten, lock them):
  ${JSON.stringify(context.meals)}
${context.dailyAnalytics ? `
User's recent scheduling analytics (last 3 days):
  ${JSON.stringify(context.dailyAnalytics)}
Use this data to personalize study block durations and frequency. For example, if actualStudyDuration < plannedStudyDuration, suggest shorter blocks. If interruptionCount is high, insert more spacing between blocks.
` : ''}
${context.dayProfile ? `
User's day directive (soft global constraint — bias the whole schedule to respect this):
  "${context.dayProfile}"
` : ''}`;

    const result = await model.generateContent([
      { text: SYSTEM_PROMPT },
      { text: prompt },
    ]);
    const responseText = result.response.text();
    return parseGeminiJSON(responseText);
  } catch (error) {
    if (error.message === 'MISSING_GEMINI_KEY') {
      return { error: 'MISSING_KEY', blocks: [], coachNote: '' };
    }
    console.error('[Gemini Service] Error generating schedule:', error);
    throw error;
  }
};

/**
 * Modify an existing schedule based on a user's natural language tuning command.
 * @param {Array} currentBlocks - The current scheduled blocks.
 * @param {string} command - The user instruction (e.g. "היום אני עייף, תקל עליי").
 * @param {Object} context - User settings, Shabbat times, etc.
 */
export const tuneSchedule = async (currentBlocks, command, context) => {
  try {
    const genAI = getAIClient();
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: { 
        responseMimeType: 'application/json',
        thinkingConfig: { thinkingBudget: 0 }
      },
    });

    const prompt = `
You are tuning an existing schedule based on the user's manual feedback.
Current schedule blocks:
${JSON.stringify(currentBlocks)}

User tuning command (Hebrew):
"${command}"

User settings:
- Wake time: ${context.settings?.wakeTime || '07:00'}
- Bedtime: ${context.settings?.sleepTime || '23:00'}
- Shabbat times (if applicable): ${context.shabbatTimes ? `Starts ${context.shabbatTimes.start}, Ends ${context.shabbatTimes.end}` : 'None'}

Please modify the schedule to satisfy the user's command.
- You can resize, move, add, or delete 'study', 'meal', 'workout', and 'travel' blocks. NEVER add, suggest, or include any 'leisure' or break blocks.
- DO NOT move any 'isLocked': true blocks (like lectures, exams, or doctor appointments) unless the user's command explicitly requests changing/deleting that specific locked item.
- Provide a new coachNote explaining the adjustments made in Hebrew.
`;

    const result = await model.generateContent([
      { text: SYSTEM_PROMPT },
      { text: prompt },
    ]);
    const responseText = result.response.text();
    return parseGeminiJSON(responseText);
  } catch (error) {
    if (error.message === 'MISSING_GEMINI_KEY') {
      return { error: 'MISSING_KEY', blocks: currentBlocks, coachNote: '' };
    }
    console.error('[Gemini Service] Error tuning schedule:', error);
    throw error;
  }
};
