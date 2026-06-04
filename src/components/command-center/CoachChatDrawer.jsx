import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Bot, Check, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useTranslation } from '../../hooks/useTranslation';
import { chatWithCoach } from '../../lib/coachAiService';
import { cn } from '../../lib/utils';
import { toast } from '../../store/useToast';

export const CoachChatDrawer = ({ isOpen, onClose, dateStr, shabbatTimes, onReplan }) => {
  const {
    data,
    addPersonalTask,
    deletePersonalTask,
    addQuickNote,
    deleteQuickNote,
    scheduleTask,
    unscheduleTask,
    updatePersonalTask,
    updateEvent,
    setActiveCategory,
    draftSchedule,
    setDraftSchedule,
  } = useStore();

  const { language } = useTranslation();
  const isRTL = language === 'he';

  const [messages, setMessages] = useState([
    {
      isUser: false,
      text: 'שלום! אני מאמן ה-AI האישי שלך. איך אוכל לעזור לך לתכנן ולארגן את היום שלך?',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll chat to bottom on updates
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend) => {
    const query = textToSend || inputText.trim();
    if (!query) return;

    if (!textToSend) setInputText('');

    // Append user message
    const userMsg = { isUser: true, text: query, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      // Gather context
      const currentBlocks = (draftSchedule?.blocks?.length > 0)
        ? draftSchedule.blocks
        : getTimelineBlocks();

      const contextHistory = messages.map((m) => ({
        isUser: m.isUser,
        text: m.text,
        action: m.action || null,
      }));

      // Gather Calori metrics and totals
      const meals = data?.calori?.meals || [];
      const workouts = data?.calori?.workouts || [];
      const dayHistory = data?.calori?.dayHistory;

      const totalCalories = meals.length > 0 ? meals.reduce((s, m) => s + (m.calories || 0), 0) : (dayHistory?.calories ?? 0);
      const totalProtein  = meals.length > 0 ? meals.reduce((s, m) => s + (m.protein  || 0), 0) : (dayHistory?.protein  ?? 0);
      const totalCarbs    = meals.length > 0 ? meals.reduce((s, m) => s + (m.carbs    || 0), 0) : (dayHistory?.carbs    ?? 0);
      const totalFats     = meals.length > 0 ? meals.reduce((s, m) => s + (m.fats     || 0), 0) : (dayHistory?.fats     ?? 0);
      const totalBurned   = workouts.length > 0 ? workouts.reduce((s, w) => s + (w.caloriesBurned || 0), 0) : (dayHistory?.workout_calories ?? 0);

      const caloriContext = {
        goals: {
          calories: data?.calori?.dailyGoal || 1300,
          protein: data?.calori?.proteinGoal || 0,
          carbs: data?.calori?.carbsGoal || 0,
          fats: data?.calori?.fatsGoal || 0,
        },
        totalsToday: {
          caloriesConsumed: totalCalories,
          proteinConsumed: totalProtein,
          carbsConsumed: totalCarbs,
          fatsConsumed: totalFats,
          caloriesBurned: totalBurned,
        },
        mealsToday: meals.map(m => ({
          name: m.name,
          calories: m.calories,
          protein: m.protein,
          time: m.timestamp ? m.timestamp.substring(11, 16) : ''
        })),
        workoutsToday: workouts.map(w => ({
          name: w.name,
          caloriesBurned: w.caloriesBurned,
          duration: w.durationMinutes,
          time: w.timestamp ? w.timestamp.substring(11, 16) : ''
        }))
      };

      // Active courses
      const coursesContext = (data?.courses || []).filter(c => !c.isArchived).map(c => ({
        id: c.id,
        name: c.name,
      }));

      // Upcoming exams sorted by date
      const upcomingExams = [];
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      (data?.courses || []).filter(c => !c.isArchived).forEach((course) => {
        ['moedA', 'moedB', 'moedC'].forEach((moed) => {
          const examDate = course[moed] || course.exams?.[moed];
          if (examDate) {
            const dt = new Date(examDate);
            if (dt >= todayStart) {
              upcomingExams.push({
                courseName: course.name,
                moed: moed.replace('moed', ''),
                date: examDate.substring(0, 10),
              });
            }
          }
        });
      });
      upcomingExams.sort((a, b) => a.date.localeCompare(b.date));

      const res = await chatWithCoach({
        history: contextHistory,
        message: query,
        currentSchedule: currentBlocks,
        tasks: data?.personalTasks || [],
        notes: data?.quickNotes || [],
        settings: {
          wakeTime: data?.profile?.wakeTime || '07:00',
          sleepTime: data?.profile?.sleepTime || '23:00',
          shabbatMode: !!data?.profile?.shabbatMode,
        },
        shabbatTimes,
        courses: coursesContext,
        upcomingExams,
        caloriData: caloriContext,
      });

      // Append bot response
      setMessages((prev) => [
        ...prev,
        {
          isUser: false,
          text: res.response,
          action: res.action || null,
          actionStatus: res.action ? 'pending' : null,
          timestamp: new Date(),
        },
      ]);
    } catch {
      toast.error('החיבור לשרת ה-AI נכשל');
      setMessages((prev) => [
        ...prev,
        {
          isUser: false,
          text: 'מצטער, חלה שגיאה בחיבור למאמן ה-AI. אנא ודא שמפתח ה-API תקין.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getTimelineBlocks = () => {
    // Generate static list of scheduled blocks for context
    const blocks = [];
    (data?.events || []).forEach((ev) => {
      if (ev.start && ev.start.startsWith(dateStr)) {
        blocks.push({
          id: ev.id,
          type: ev.type || 'event',
          title: ev.title,
          startTime: ev.start.substring(11, 16) || '09:00',
          endTime: ev.end ? ev.end.substring(11, 16) : '23:59',
          isLocked: true,
        });
      }
    });

    (data?.personalTasks || []).forEach((t) => {
      if (t.scheduledDate === dateStr && t.scheduledTime) {
        const duration = t.scheduledDuration || 60;
        const [h, m] = t.scheduledTime.split(':').map(Number);
        const endMin = h * 60 + m + duration;
        const endH = String(Math.floor(endMin / 60) % 24).padStart(2, '0');
        const endM = String(endMin % 60).padStart(2, '0');
        blocks.push({
          id: `task-${t.id}`,
          type: 'study',
          title: t.title,
          startTime: t.scheduledTime,
          endTime: `${endH}:${endM}`,
          duration,
          refId: t.id,
          isLocked: !!t.isLocked,
        });
      }
    });

    return blocks.sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  // Action Executor
  const handleExecuteAction = async (msgIndex, action) => {
    try {
      const { type, payload } = action;

      if (type === 'add_task') {
        await addPersonalTask({
          title: payload.title,
          priority: payload.priority || 'med',
          list: 'personal',
        });
        toast.success(`המשימה "${payload.title}" נוספה בהצלחה`);
      } else if (type === 'delete_task') {
        await deletePersonalTask(payload.taskId);
        toast.success('המשימה נמחקה');
      } else if (type === 'add_note') {
        await addQuickNote({
          title: payload.title || 'פתק חדש',
          content: payload.content || '',
          categoryId: 'general',
        });
        toast.success('הפתק נוצר בהצלחה');
      } else if (type === 'delete_note') {
        await deleteQuickNote(payload.noteId);
        toast.success('הפתק נמחק');
      } else if (type === 'schedule_task') {
        const duration = data?.profile?.studyBlockDuration || 90;
        scheduleTask(payload.taskId, dateStr, payload.time, duration);
        toast.success(`המשימה שובצה לשעה ${payload.time}`);
      } else if (type === 'unschedule_task') {
        unscheduleTask(payload.taskId);
        toast.success('המשימה הוסרה מהלו"ז');
      } else if (type === 'lock_block') {
        if (payload.blockId.startsWith('draft-')) {
          const updatedBlocks = draftSchedule.blocks.map(b =>
            b.id === payload.blockId ? { ...b, isLocked: payload.locked } : b
          );
          setDraftSchedule({ ...draftSchedule, blocks: updatedBlocks });
        } else if (payload.blockId.startsWith('task-')) {
          updatePersonalTask(payload.blockId.replace('task-', ''), { isLocked: payload.locked });
        } else {
          updateEvent(payload.blockId, { isLocked: payload.locked });
        }
        toast.success(payload.locked ? 'הבלוק ננעל' : 'הבלוק שוחרר מנעילה');
      } else if (type === 'replan') {
        toast.info('משנה את תכנון הלו"ז בעזרת ה-AI...');
        onReplan?.(payload.tuneCommand);
        onClose(); // Close chat to let user see AI planning in background
        return;
      }

      // Mark action as executed in UI
      setMessages((prev) =>
        prev.map((m, idx) => (idx === msgIndex ? { ...m, actionStatus: 'success' } : m))
      );
    } catch {
      toast.error('ביצוע הפעולה נכשל');
    }
  };

  const handleCancelAction = (msgIndex) => {
    setMessages((prev) =>
      prev.map((m, idx) => (idx === msgIndex ? { ...m, actionStatus: 'cancelled' } : m))
    );
    toast.info('הפעולה בוטלה');
  };

  // Action chips list (Calori 1300 style)
  const SUGGESTION_CHIPS = [
    { label: 'היום אני עייף, תקל עליי', action: 'היום אני עייף, שנה לי את הלו"ז שיהיה קל יותר' },
    { label: 'פנה לי שעתיים ללימודים בבוקר', action: 'פנה לי שעתיים פנויות ללימודים בבוקר' },
    { label: 'סדר לי אימון בערב', action: 'אני רוצה לשלב אימון בערב, תמצא לי שעה טובה לזה' },
    { label: 'תעביר אותי לדף הפתקים', action: 'אני רוצה לעבור לדף הפתקים שלי' },
    { label: 'תוסיף לי משימה חדשה', action: 'אני רוצה להוסיף משימה חדשה' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/40 backdrop-blur-sm z-[90]"
          />

          {/* Slide-over chat container */}
          <motion.div
            initial={isRTL ? { x: '100%' } : { x: '-100%' }}
            animate={{ x: 0 }}
            exit={isRTL ? { x: '100%' } : { x: '-100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 220 }}
            className={cn(
              "fixed inset-y-0 w-full sm:max-w-md bg-card/95 backdrop-blur-xl border-t border-border z-[95] flex flex-col shadow-2xl overflow-hidden",
              isRTL ? "right-0 border-l" : "left-0 border-r"
            )}
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            {/* Drawer Header */}
            <div className="px-5 py-4 border-b border-border/40 flex items-center justify-between bg-card shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                  <Bot className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-extrabold text-foreground text-sm flex items-center gap-1">
                    דבר עם המאמן
                    <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
                  </h3>
                  <p className="text-[10px] text-muted-foreground font-medium">מאמן AI אישי לתזונה, כושר ולימודים</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-muted rounded-full transition-colors active:scale-95 cursor-pointer text-muted-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/10">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "flex gap-3 max-w-[85%] items-end",
                    msg.isUser ? "ms-auto flex-row-reverse" : "me-auto"
                  )}
                >
                  {/* Bot Avatar */}
                  {!msg.isUser && (
                    <div className="w-7 h-7 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center shrink-0 shadow-sm select-none">
                      <Bot className="w-3.5 h-3.5 text-primary" />
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div className="space-y-2">
                    <div
                      className={cn(
                        "p-3.5 rounded-2xl shadow-sm text-sm font-semibold leading-relaxed text-start",
                        msg.isUser
                          ? "bg-primary text-primary-foreground rounded-br-sm"
                          : "bg-card border border-border/50 text-foreground rounded-bl-sm"
                      )}
                    >
                      {msg.text}
                    </div>

                    {/* Inline Action Card */}
                    {msg.action && (
                      <div className="rounded-2xl border border-border bg-card p-3 shadow-md space-y-3 animate-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                          <span className="text-[11px] font-black text-muted-foreground tracking-wider uppercase">אישור פעולת מאמן</span>
                        </div>
                        <h4 className="font-extrabold text-xs text-foreground">{msg.action.title}</h4>

                        {/* Interactive Buttons depending on Status */}
                        {msg.actionStatus === 'pending' ? (
                          <div className="flex gap-2">
                            {msg.action.type === 'navigate' ? (
                              <button
                                onClick={() => {
                                  setActiveCategory(msg.action.payload.targetPage);
                                  toast.success(`עבר לדף ${msg.action.payload.targetPage}`);
                                  setMessages((prev) =>
                                    prev.map((m, i) => (i === idx ? { ...m, actionStatus: 'success' } : m))
                                  );
                                  onClose();
                                }}
                                className="flex-1 py-1.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1 cursor-pointer"
                              >
                                {isRTL ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                                {msg.action.title || 'עבור עכשיו'}
                              </button>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleExecuteAction(idx, msg.action)}
                                  className="flex-1 py-1.5 rounded-xl bg-[#059669] text-white font-bold text-xs hover:bg-[#059669]/90 active:scale-95 transition-all flex items-center justify-center gap-1 cursor-pointer"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  אשר ביצוע
                                </button>
                                <button
                                  onClick={() => handleCancelAction(idx)}
                                  className="py-1.5 px-3 rounded-xl border border-border bg-secondary text-foreground hover:bg-muted font-bold text-xs active:scale-95 transition-all cursor-pointer"
                                >
                                  בטל
                                </button>
                              </>
                            )}
                          </div>
                        ) : msg.actionStatus === 'success' ? (
                          <div className="flex items-center gap-1 text-[11px] font-black text-[#059669] bg-[#D1FAE5]/40 px-2 py-0.5 rounded-full w-max border border-[#059669]/20">
                            <Check className="w-3 h-3" />
                            בוצע בהצלחה ✅
                          </div>
                        ) : (
                          <div className="text-[11px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full w-max">
                            הפעולה בוטלה
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Bot Typing Wave (Calori 1300 style) */}
              {loading && (
                <div className="flex gap-3 max-w-[80%] items-end me-auto animate-in fade-in duration-300">
                  <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 shadow-sm">
                    <Bot className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div className="bg-card border border-border/50 p-3 rounded-2xl rounded-bl-sm flex items-center gap-1.5 shadow-sm">
                    <div className="flex items-center gap-1.5 py-1 px-1">
                      <div className="w-2.5 h-2.5 rounded-full bg-primary/50 typing-dot" />
                      <div className="w-2.5 h-2.5 rounded-full bg-primary/70 typing-dot" />
                      <div className="w-2.5 h-2.5 rounded-full bg-primary typing-dot" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Calori 1300 Style Action Chips scroll view */}
            <div className="relative border-t border-border/20 bg-card py-2 shrink-0 select-none">
              {/* Fade Overlays */}
              <div className="absolute top-0 bottom-0 left-0 w-8 pointer-events-none z-10 bg-gradient-to-r from-card to-transparent" />
              <div className="absolute top-0 bottom-0 right-0 w-8 pointer-events-none z-10 bg-gradient-to-l from-card to-transparent" />

              <div className="flex gap-2 overflow-x-auto no-scrollbar scroll-smooth px-4">
                {SUGGESTION_CHIPS.map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(chip.action)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors text-[11px] font-bold text-primary whitespace-nowrap cursor-pointer active:scale-95"
                  >
                    <Sparkles className="w-3 h-3 shrink-0" />
                    <span>{chip.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Input Bar */}
            <div className="p-3 border-t border-border/40 bg-card shrink-0">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="הקלד הודעה למאמן..."
                  className="flex-1 rounded-2xl border border-border bg-secondary/50 px-4 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent text-start"
                  disabled={loading}
                />
                <button
                  onClick={() => handleSend()}
                  disabled={loading || !inputText.trim()}
                  className="w-10 h-10 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 transition-all flex items-center justify-center shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
