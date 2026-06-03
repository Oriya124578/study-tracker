import React, { useMemo } from 'react';
import {
  CheckCircle2, Calendar as CalendarIcon, GraduationCap,
  UtensilsCrossed, Dumbbell, Sparkles, Play, ListTodo, Bot, ChevronLeft, ChevronRight,
  Clock, Flame, Plus, Award, Beef, Wheat, Droplet, ExternalLink
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useTranslation } from '../../hooks/useTranslation';
import { cn } from '../../lib/utils';
import { dateKey } from '../../lib/caloriRepo';
import {
  format, parseISO, isValid, isSameDay, differenceInDays,
  startOfDay, addDays
} from 'date-fns';
import { he } from 'date-fns/locale';

const safeParse = (d) => {
  if (!d) return null;
  const dt = typeof d === 'string' ? parseISO(d) : new Date(d);
  return isValid(dt) ? dt : null;
};

// ── Main: Bento Grid Command Center dashboard ──
export const SmartDashboard = () => {
  const { data, setActiveCategory, setShowPomodoroModal, togglePersonalTask, draftSchedule } = useStore();
  const { t, language } = useTranslation();
  const isRTL = language === 'he';
  const locale = isRTL ? he : undefined;
  const displayName = data?.profile?.displayName || '';
  const caloriDate = useStore((s) => s.caloriDate);
  const todayStr = dateKey();

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h >= 5 && h < 12) return t('goodMorning');
    if (h >= 12 && h < 17) return t('goodAfternoon');
    if (h >= 17 && h < 21) return t('goodEvening');
    return t('goodNight');
  };


  // ── 1. Nearest Exam ──
  const nearestExam = useMemo(() => {
    let nearest = null;
    (data?.courses || []).forEach((course) => {
      ['moedA', 'moedB', 'moedC'].forEach((moed) => {
        const dt = safeParse(course[moed] || course.exams?.[moed]);
        if (!dt) return;
        const days = differenceInDays(startOfDay(dt), startOfDay(new Date()));
        if (days >= 0 && (!nearest || days < nearest.days)) {
          nearest = { name: course.name, days, moed: moed.replace('moed', '') };
        }
      });
    });
    return nearest;
  }, [data.courses]);

  // ── 2. Today's Uncompleted Personal Tasks ──
  const todayPersonalTasks = useMemo(() => {
    const today = new Date();
    return (data?.personalTasks || [])
      .filter((task) => {
        const dt = safeParse(task.dueDate);
        return dt && isSameDay(dt, today) && !task.done;
      })
      .slice(0, 3); // Show top 3 tasks on the dashboard
  }, [data.personalTasks]);

  // ── Today's Chronological Schedule Blocks (AI Command Center Preview) ──
  const todayScheduleBlocks = useMemo(() => {
    // If there is an active draft, preview it! (excluding leisure/break blocks)
    if (draftSchedule?.blocks?.length > 0) {
      return draftSchedule.blocks
        .filter((b) => b.type !== 'leisure' && !b.title?.includes('הפסקה') && !b.title?.toLowerCase().includes('break'))
        .map((b) => ({
          id: b.id,
          type: b.type || 'event',
          title: b.title,
          time: b.startTime,
          isCompleted: !!b.isCompleted,
        }))
        .sort((a, b) => a.time.localeCompare(b.time))
        .slice(0, 3);
    }

    const blocks = [];
    const dateStr = todayStr; // e.g. YYYY-MM-DD

    // 1. Fixed Events
    (data?.events || []).forEach((ev) => {
      if (ev.start && ev.start.startsWith(dateStr)) {
        const parsedTime = safeParse(ev.start);
        blocks.push({
          id: ev.id,
          type: ev.type || 'event',
          title: ev.title,
          time: parsedTime ? format(parsedTime, 'HH:mm') : ev.start.substring(11, 16),
          isCompleted: false,
        });
      }
    });

    // 2. Scheduled Tasks
    (data?.personalTasks || []).forEach((t) => {
      if (t.scheduledDate === dateStr && t.scheduledTime) {
        blocks.push({
          id: `task-${t.id}`,
          type: 'study',
          title: t.title,
          time: t.scheduledTime,
          isCompleted: !!t.done,
        });
      }
    });

    // 3. Logged Meals and Workouts
    (data?.calori?.meals || []).forEach((meal) => {
      if (meal.timestamp) {
        const parsedTime = safeParse(meal.timestamp);
        const mealDateStr = parsedTime ? format(parsedTime, 'yyyy-MM-dd') : '';
        if (mealDateStr === dateStr) {
          blocks.push({
            id: `meal-${meal.id}`,
            type: 'meal',
            title: meal.name,
            time: parsedTime ? format(parsedTime, 'HH:mm') : meal.timestamp.substring(11, 16),
            isCompleted: true,
          });
        }
      }
    });

    (data?.calori?.workouts || []).forEach((w) => {
      if (w.timestamp) {
        const parsedTime = safeParse(w.timestamp);
        const wDateStr = parsedTime ? format(parsedTime, 'yyyy-MM-dd') : '';
        if (wDateStr === dateStr) {
          blocks.push({
            id: `workout-${w.id}`,
            type: 'workout',
            title: w.name,
            time: parsedTime ? format(parsedTime, 'HH:mm') : w.timestamp.substring(11, 16),
            isCompleted: true,
          });
        }
      }
    });

    return blocks
      .filter((b) => b.type !== 'leisure' && !b.title?.includes('הפסקה') && !b.title?.toLowerCase().includes('break'))
      .sort((a, b) => a.time.localeCompare(b.time))
      .slice(0, 3);
  }, [data, todayStr, draftSchedule]);

  // ── 2b. Next Up Scheduled Item ──
  const nextUpBlock = useMemo(() => {
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    const upcoming = todayScheduleBlocks
      .filter((block) => {
        if (!block.time || block.isCompleted) return false;
        const [h, m] = block.time.split(':').map(Number);
        const blockMinutes = h * 60 + m;
        return blockMinutes > nowMinutes;
      })
      .sort((a, b) => a.time.localeCompare(b.time));

    return upcoming[0] || null;
  }, [todayScheduleBlocks]);

  const countdownText = useMemo(() => {
    if (!nextUpBlock?.time) return null;
    const now = new Date();
    const [h, m] = nextUpBlock.time.split(':').map(Number);
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const blockMinutes = h * 60 + m;
    const diffMinutes = blockMinutes - nowMinutes;

    if (diffMinutes <= 0) return t('startsNow');
    if (diffMinutes < 60) return t('startsInMinutes').replace('{n}', diffMinutes);
    const diffHours = Math.floor(diffMinutes / 60);
    const remainingMin = diffMinutes % 60;
    if (remainingMin === 0) return t('startsInHours').replace('{n}', diffHours);
    return t('startsInHoursAndMinutes').replace('{h}', diffHours).replace('{m}', remainingMin);
  }, [nextUpBlock]);

  // ── 3. Next 7 Days Upcoming Items (For fallback empty timeline) ──
  const upcomingItems = useMemo(() => {
    const today = new Date();
    const items = [];

    // Exams
    (data?.courses || []).forEach((course) => {
      ['moedA', 'moedB', 'moedC'].forEach((moed) => {
        const dt = safeParse(course[moed] || course.exams?.[moed]);
        if (dt && differenceInDays(startOfDay(dt), startOfDay(today)) > 0 && differenceInDays(startOfDay(dt), startOfDay(today)) <= 7) {
          items.push({
            id: `exam-${course.id}-${moed}`, kind: 'exam',
            title: `${course.name} — ${t(moed)}`, date: dt
          });
        }
      });
    });

    // Events
    (data?.events || []).forEach((ev) => {
      const dt = safeParse(ev.start);
      if (dt && differenceInDays(startOfDay(dt), startOfDay(today)) > 0 && differenceInDays(startOfDay(dt), startOfDay(today)) <= 7) {
        items.push({
          id: ev.id, kind: 'event', title: ev.title, date: dt
        });
      }
    });

    // Tasks due
    (data?.personalTasks || []).forEach((task) => {
      const dt = safeParse(task.dueDate);
      if (dt && differenceInDays(startOfDay(dt), startOfDay(today)) > 0 && differenceInDays(startOfDay(dt), startOfDay(today)) <= 7 && !task.done) {
        items.push({
          id: task.id, kind: 'task', title: task.title, date: dt
        });
      }
    });

    return items.sort((a, b) => a.date - b.date).slice(0, 4);
  }, [data, t]);

  // ── 4. Smart Summary Sentence ──
  const summaryText = useMemo(() => {
    const tasksCount = (data?.personalTasks || []).filter(
      (t) => safeParse(t.dueDate) && isSameDay(safeParse(t.dueDate), new Date()) && !t.done
    ).length;

    if (tasksCount > 0) return t('summaryTasksToday').replace('{n}', tasksCount);
    if (nearestExam) {
      if (nearestExam.days === 0) return t('summaryExamToday').replace('{course}', nearestExam.name);
      return t('summaryNextExam')
        .replace('{course}', nearestExam.name)
        .replace('{n}', nearestExam.days);
    }
    return t('summaryAllClear');
  }, [data, nearestExam, t]);

  // ── 5. Calori Eten/Workout Aggregates ──
  const { meals = [], workouts = [], dayHistory, dailyGoal: dbDailyGoal, proteinGoal, carbsGoal, fatsGoal } = data?.calori || {};
  const hasMeals = meals.length > 0;
  const hasWorkouts = workouts.length > 0;

  const totalCalories = hasMeals ? meals.reduce((s, m) => s + (m.calories || 0), 0) : (dayHistory?.calories ?? 0);
  const totalProtein = hasMeals ? meals.reduce((s, m) => s + (m.protein || 0), 0) : (dayHistory?.protein ?? 0);
  const totalCarbs = hasMeals ? meals.reduce((s, m) => s + (m.carbs || 0), 0) : (dayHistory?.carbs ?? 0);
  const totalFats = hasMeals ? meals.reduce((s, m) => s + (m.fats || 0), 0) : (dayHistory?.fats ?? 0);
  const burned = hasWorkouts ? workouts.reduce((s, w) => s + (w.caloriesBurned || 0), 0) : (dayHistory?.workout_calories ?? 0);
  const workoutMin = hasWorkouts ? workouts.reduce((s, w) => s + (w.durationMinutes || 0), 0) : (dayHistory?.workout_minutes ?? 0);
  const workoutCount = hasWorkouts ? workouts.length : (dayHistory?.workout_count ?? 0);

  const dailyGoal = dbDailyGoal || 1300;
  const remainingCals = Math.max(0, dailyGoal - totalCalories);
  const calsPercentage = Math.min(100, Math.round((totalCalories / dailyGoal) * 100));

  // ── 6. Pomodoro Stats today ──
  const todayPomoStats = useMemo(() => {
    const todaySessions = (data.pomodoroSessions || []).filter((session) => {
      return session.date && session.date.startsWith(todayStr);
    });
    const totalMinutes = todaySessions.reduce((sum, s) => sum + Math.round(s.duration / 60), 0);
    return {
      count: todaySessions.length,
      minutes: totalMinutes,
    };
  }, [data.pomodoroSessions, todayStr]);

  const Chevron = isRTL ? ChevronLeft : ChevronRight;

  return (
    <div
      className="max-w-4xl mx-auto w-full px-4 py-5 sm:px-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* ── Bento Grid Dashboard Layout ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-auto">
        
        {/* ── TILE 1: GREETING & STATUS CARD (Spans full width, includes Next Up Hero) ── */}
        <div className="col-span-1 md:col-span-2 lg:col-span-3 relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between min-h-[140px]">
          {/* Decorative Glow */}
          <div className="absolute top-0 right-0 w-36 h-36 bg-[#059669]/5 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-36 h-36 bg-[#7C3AED]/5 rounded-full blur-2xl pointer-events-none" />

          <div className="z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {format(new Date(), 'EEEE, d MMMM', { locale })}
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight mt-1">
                {getGreeting()}{displayName ? `, ${displayName}` : ''}! 👋
              </h2>
            </div>
            <div className="flex items-center gap-2 bg-[#D1FAE5] dark:bg-[#059669]/20 px-4 py-2 rounded-2xl border border-[#059669]/10 shrink-0 self-start md:self-center">
              <Sparkles className="w-4 h-4 text-[#059669] shrink-0" />
              <span className="text-xs font-semibold text-[#059669] leading-none">{summaryText}</span>
            </div>
          </div>

          {/* NEXT UP ITEM (Hero section inside banner) */}
          <div className="mt-4 pt-4 border-t border-border/60 z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            {nextUpBlock ? (
              <>
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span>
                  <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">{t('nextUpInSchedule')}</span>
                  <span className="text-xs font-extrabold text-foreground">{nextUpBlock.title}</span>
                  <span className="text-xs text-muted-foreground">({nextUpBlock.time})</span>
                </div>
                <div className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full self-start sm:self-center">
                  {countdownText}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 text-xs text-muted-foreground font-semibold">
                <span>🌟</span>
                <span>{t('scheduleCompleteForToday')}</span>
              </div>
            )}
          </div>
        </div>

        {/* ── TILE 2: NUTRITION & FITNESS SUMMARY (Apple Watch Style Rings - 2 columns) ── */}
        <button
          onClick={() => setActiveCategory('calori')}
          className="col-span-1 md:col-span-2 text-start rounded-3xl border border-border bg-card p-5 hover:border-[#059669]/40 active:scale-[0.98] transition-all flex flex-row items-center justify-between min-h-[220px] relative overflow-hidden group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#059669]/40"
        >
          {/* Decorative Glow */}
          <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-[#059669]/5 rounded-full blur-xl transition-all group-hover:scale-125" />

          {/* Left Details */}
          <div className="flex flex-col justify-between h-full flex-1 pe-4">
            {/* Title & External Link */}
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <img src="/logo-calori.jpg" alt="" className="w-8 h-8 rounded-xl object-contain" />
                <span className="text-sm font-bold text-foreground">{t('nutritionAndFitnessToday')}</span>
              </div>
            </div>

            {/* Calories and Weight details */}
            <div className="my-3 flex flex-row items-center gap-6">
              {/* Calories column */}
              <div className="space-y-1">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-[#059669]">{totalCalories}</span>
                  <span className="text-[10px] text-muted-foreground">{t('ofGoalCaloriesEaten').replace('{goal}', dailyGoal)}</span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-[#7C3AED]">+{burned}</span>
                  <span className="text-[10px] text-muted-foreground">{t('ofGoalCaloriesBurned').replace('{goal}', 300).replace('{min}', workoutMin)}</span>
                </div>
              </div>

              {/* Weight column */}
              <div className="h-10 w-px bg-border/60" /> {/* divider */}
              
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">{t('currentWeight')}</span>
                <span className="text-xl font-black text-foreground">
                  {data?.calori?.weight || '—'} <span className="text-[10px] font-bold text-muted-foreground">kg</span>
                </span>
                {data?.calori?.targetWeight && (
                  <span className="text-[9px] text-muted-foreground font-semibold">
                    Target: {data.calori.targetWeight} kg
                  </span>
                )}
              </div>
            </div>

            {/* Macros strip */}
            <div className="flex gap-3 pt-2 border-t border-border w-full items-end">
              <div className="flex flex-col items-start">
                <span className="text-[8px] font-bold text-muted-foreground uppercase">{t('caloriProtein')}</span>
                <span className="text-xs font-extrabold text-[#059669]">{totalProtein}g</span>
              </div>
              <div className="flex flex-col items-start">
                <span className="text-[8px] font-bold text-muted-foreground uppercase">{t('caloriCarbs')}</span>
                <span className="text-xs font-extrabold text-amber-500">{totalCarbs}g</span>
              </div>
              <div className="flex flex-col items-start">
                <span className="text-[8px] font-bold text-muted-foreground uppercase">{t('caloriFats')}</span>
                <span className="text-xs font-extrabold text-rose-500">{totalFats}g</span>
              </div>
            </div>
          </div>

          {/* Right Progress Ring */}
          <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
              {/* Outer track (Green) */}
              <circle
                cx="50"
                cy="50"
                r="38"
                fill="transparent"
                stroke="rgba(5, 150, 105, 0.1)"
                strokeWidth="7.5"
              />
              {/* Outer progress (Green) */}
              <circle
                cx="50"
                cy="50"
                r="38"
                fill="transparent"
                stroke="#059669"
                strokeWidth="7.5"
                strokeDasharray="238.8"
                strokeDashoffset={238.8 - (238.8 * calsPercentage) / 100}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
              {/* Inner track (Purple) */}
              <circle
                cx="50"
                cy="50"
                r="27"
                fill="transparent"
                stroke="rgba(124, 58, 237, 0.1)"
                strokeWidth="7.5"
              />
              {/* Inner progress (Purple) */}
              <circle
                cx="50"
                cy="50"
                r="27"
                fill="transparent"
                stroke="#7C3AED"
                strokeWidth="7.5"
                strokeDasharray="169.6"
                strokeDashoffset={169.6 - (169.6 * Math.min(100, Math.round((burned / 300) * 100))) / 100}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-xs font-extrabold text-foreground">{calsPercentage}%</span>
              <p className="text-[8px] text-muted-foreground font-bold">{t('completed')}</p>
            </div>
          </div>
        </button>

        {/* ── TILE 4: ACADEMIC / EXAMS BENTO TILE ── */}
        <button
          onClick={() => setActiveCategory('courses')}
          className="col-span-1 text-start rounded-3xl border border-border bg-card p-5 hover:border-blue-500/40 active:scale-[0.98] transition-all flex flex-col justify-between min-h-[220px] relative overflow-hidden group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
        >
          {/* Header */}
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-blue-500" />
              </div>
              <span className="text-sm font-bold text-foreground">{t('navStudies')}</span>
            </div>
            <Chevron className="w-4 h-4 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
          </div>

          {/* Exam Status */}
          <div className="mt-4 flex-1 flex flex-col justify-center">
            {nearestExam ? (
              <div className={cn(
                'p-3 rounded-2xl border flex items-center justify-between gap-2 w-full',
                nearestExam.days <= 7 ? 'border-destructive/30 bg-destructive/5 text-destructive' : 'border-blue-500/20 bg-blue-500/5 text-blue-600'
              )}>
                <div className="min-w-0">
                  <p className="font-bold text-xs truncate text-foreground">{nearestExam.name}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{t('moed')} {nearestExam.moed}</p>
                </div>
                <div className="text-center shrink-0">
                  <p className="text-lg font-black leading-none">{nearestExam.days}</p>
                  <p className="text-[9px] uppercase tracking-wider">{t('days')}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-2">
                <span className="text-3xl block">🌤️</span>
                <span className="text-xs text-muted-foreground mt-1 block">{t('noUpcomingExams')}</span>
              </div>
            )}
          </div>

          {/* Academic Footer */}
          <div className="mt-4 pt-3 border-t border-border w-full flex items-center justify-between text-xs text-muted-foreground">
            <span>{t('semesterProgress')}</span>
            <span className="font-bold text-foreground">
              {(data?.courses || []).length} {t('coursesCount')}
            </span>
          </div>
        </button>

        {/* ── TILE 6: TODAY'S SCHEDULE TIMELINE PREVIEW BENTO TILE (Spans 2 columns on larger screens) ── */}
        <button
          onClick={() => setActiveCategory('commandCenter')}
          className="col-span-1 md:col-span-2 text-start rounded-3xl border border-border bg-card p-5 hover:border-primary/40 active:scale-[0.99] transition-all flex flex-col justify-between min-h-[220px] relative overflow-hidden group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          {/* Subtle contextual glow */}
          <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-primary/5 rounded-full blur-xl transition-all group-hover:scale-125" />

          {/* Header */}
          <div className="flex items-center justify-between w-full mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm font-bold text-foreground">{t('myDayScheduleCC')}</span>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-primary hover:underline">
              <span>{t('openAiPlanning')}</span>
              <Chevron className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Schedule Preview Content */}
          <div className="flex-1 flex flex-col justify-start gap-2 w-full">
            {todayScheduleBlocks.length > 0 ? (
              <div className="space-y-2 w-full">
                {todayScheduleBlocks.map((block) => {
                  const blockColors = {
                    study: 'border-blue-500/20 bg-blue-500/5 text-blue-600 dark:text-blue-400',
                    event: 'border-slate-500/20 bg-card text-foreground',
                    meal: 'border-[#059669]/20 bg-[#D1FAE5]/40 text-[#059669] dark:bg-[#059669]/10 dark:text-[#34D399]',
                    workout: 'border-[#7C3AED]/20 bg-purple-100/40 text-[#7C3AED] dark:bg-purple-900/20 dark:text-[#A78BFA]',
                    travel: 'border-amber-500/20 bg-amber-500/5 text-amber-600 dark:text-amber-400',
                    leisure: 'border-rose-500/20 bg-rose-500/5 text-rose-500 dark:text-rose-400',
                  };
                  return (
                    <div 
                      key={block.id}
                      className={cn(
                        "flex items-center justify-between gap-3 p-2.5 rounded-2xl border text-xs font-semibold",
                        blockColors[block.type] || 'border-border bg-muted/20'
                      )}
                    >
                      <span className="truncate max-w-[70%]">{block.title}</span>
                      <span className="shrink-0 font-bold opacity-80">{block.time}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-muted-foreground py-2 w-full">
                <span className="text-2xl mb-1">🌤️</span>
                <p className="text-xs">{t('noScheduledItemsToday')}</p>
                <span className="mt-2 text-xs font-bold text-primary flex items-center gap-1 hover:underline">
                  <Sparkles className="w-3.5 h-3.5" />
                  {t('organizeScheduleWithAi')}
                </span>
              </div>
            )}
          </div>
        </button>

      </div>

      {/* ── QUICK SHORTCUTS STRIP ── */}
      <section className="space-y-2">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-0.5">
          {t('quickActions')}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Action 1: Auto Plan */}
          <button
            onClick={() => setActiveCategory('commandCenter')}
            className="flex items-center gap-2.5 p-3.5 rounded-2xl border border-border bg-card hover:border-primary/40 hover:bg-primary/5 active:scale-95 transition-all text-start"
          >
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-foreground">{t('organizeWithAi')}</p>
              <p className="text-[10px] text-muted-foreground truncate">{t('customDailyPlanning')}</p>
            </div>
          </button>

          {/* Action 2: Start Pomodoro */}
          <button
            onClick={() => setShowPomodoroModal(true)}
            className="flex items-center gap-2.5 p-3.5 rounded-2xl border border-border bg-card hover:border-purple-500/40 hover:bg-purple-500/5 active:scale-95 transition-all text-start"
          >
            <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center text-[#7C3AED] shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-foreground">{t('startPomodoro')}</p>
              <p className="text-[10px] text-muted-foreground truncate">{t('focusOnStudying')}</p>
            </div>
          </button>

          {/* Action 3: Add Task/Event */}
          <button
            onClick={() => {
              useStore.getState().openAddSheet('task');
            }}
            className="flex items-center gap-2.5 p-3.5 rounded-2xl border border-border bg-card hover:border-blue-500/40 hover:bg-blue-500/5 active:scale-95 transition-all text-start"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center text-blue-500 shrink-0">
              <Plus className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-foreground">{t('addTaskOrEvent')}</p>
              <p className="text-[10px] text-muted-foreground truncate">{t('listsAndJournal')}</p>
            </div>
          </button>

          {/* Action 4: Calori View */}
          <button
            onClick={() => setActiveCategory('calori')}
            className="flex items-center gap-2.5 p-3.5 rounded-2xl border border-border bg-card hover:border-[#059669]/40 hover:bg-[#059669]/5 active:scale-95 transition-all text-start"
          >
            <div className="w-9 h-9 rounded-xl bg-[#D1FAE5] dark:bg-[#059669]/20 flex items-center justify-center text-[#059669] shrink-0">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-foreground">{t('nutritionJournal')}</p>
              <p className="text-[10px] text-muted-foreground truncate">{t('viewDayDetails')}</p>
            </div>
          </button>
        </div>
      </section>

      {/* ── TILE 7: AI QUICK LINKS (Spans full width) ── */}
      <AiQuickLinks data={data} t={t} />

      {/* ── UPCOMING 7 DAYS FALLBACK TIMELINE ── */}
      {todayPersonalTasks.length === 0 && upcomingItems.length > 0 && (
        <section className="space-y-3 pt-4 border-t border-border/60">
          <div className="flex items-center justify-between px-0.5">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              {t('comingUp')} ({t('nextWeek')})
            </h3>
            <button
              onClick={() => setActiveCategory('calendar')}
              className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5 focus-visible:outline-none"
            >
              {t('openCalendar')}
              <Chevron className="w-3 h-3" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {upcomingItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveCategory('calendar')}
                aria-label={item.title}
                className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-3 hover:border-primary/40 active:scale-[0.99] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className={cn(
                    "w-2 h-2 rounded-full",
                    item.kind === 'exam' ? "bg-red-500" : item.kind === 'event' ? "bg-blue-500" : "bg-amber-500"
                  )} />
                  <span className="text-sm font-semibold text-foreground truncate text-start">{item.title}</span>
                </div>
                <span className="text-xs font-bold text-muted-foreground shrink-0">
                  {isValid(item.date) && format(item.date, 'EEE d/M', { locale })}
                </span>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

// ── AI quick-links strip ──
const AiQuickLinks = ({ data, t }) => {
  const courses = (data?.courses || []).filter((c) => !c.isArchived);
  const withLinks = courses
    .map((c) => {
      const links = data?.links?.[c.id] || {};
      const url = links.notebookLm || links.gemini || '';
      return url ? { id: c.id, name: c.name, url } : null;
    })
    .filter(Boolean);

  if (withLinks.length === 0) return null;

  return (
    <section className="space-y-2">
      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2 px-0.5">
        <Bot className="w-4 h-4 text-primary shrink-0" />
        {t('aiQuickLinks')}
      </h3>
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {withLinks.map((c) => (
          <a
            key={c.id}
            href={c.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={c.name}
            className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-border bg-card hover:border-primary/40 active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <Bot className="w-4 h-4 text-primary shrink-0" />
            <span className="text-xs font-semibold text-foreground whitespace-nowrap">{c.name}</span>
          </a>
        ))}
      </div>
    </section>
  );
};
