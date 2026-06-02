import React, { useMemo } from 'react';
import {
  CheckCircle2, Calendar as CalendarIcon, GraduationCap,
  UtensilsCrossed, Dumbbell, Sparkles, Play, ListTodo, Bot, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useTranslation } from '../../hooks/useTranslation';
import { cn } from '../../lib/utils';
import { dateKey } from '../../lib/caloriRepo';
import {
  format, parseISO, isValid, isSameDay, differenceInDays,
  startOfDay, addDays,
} from 'date-fns';
import { he } from 'date-fns/locale';

const safeParse = (d) => {
  if (!d) return null;
  const dt = typeof d === 'string' ? parseISO(d) : new Date(d);
  return isValid(dt) ? dt : null;
};

// ── Build a unified, time-sorted item list for an arbitrary day ───────────────

const useTimelineItems = (data, caloriDate, t) =>
  useMemo(() => {
    const todayIsCaloriDate = caloriDate === dateKey();

    // Static items (events / exams / tasks) carry a real Date.
    const build = (targetDay) => {
      const items = [];

      // Exams
      (data?.courses || []).forEach((course) => {
        ['moedA', 'moedB', 'moedC'].forEach((moed) => {
          const dt = safeParse(course[moed] || course.exams?.[moed]);
          if (dt && isSameDay(dt, targetDay)) {
            items.push({
              id: `exam-${course.id}-${moed}`, kind: 'exam',
              title: `${course.name} — ${t(moed)}`, date: dt, allDay: true,
            });
          }
        });
      });

      // Events
      (data?.events || []).forEach((ev) => {
        const dt = safeParse(ev.start);
        if (dt && isSameDay(dt, targetDay)) {
          items.push({
            id: ev.id, kind: 'event', title: ev.title, date: dt,
            endDate: safeParse(ev.end), allDay: !!ev.allDay, location: ev.location,
          });
        }
      });

      // Tasks due that day (not done)
      (data?.personalTasks || []).forEach((task) => {
        const dt = safeParse(task.dueDate);
        if (dt && isSameDay(dt, targetDay) && !task.done) {
          items.push({
            id: task.id, kind: 'task', title: task.title, date: dt,
            allDay: !task.dueTime, priority: task.priority,
          });
        }
      });

      return items;
    };

    const today = new Date();
    const todayItems = build(today);

    // Calori meals + workouts — only when the calori listener is on today.
    if (todayIsCaloriDate) {
      (data?.calori?.meals || []).forEach((m) => {
        const dt = safeParse(m.timestamp);
        todayItems.push({
          id: `meal-${m.id}`, kind: 'meal', title: m.name,
          date: dt || today, allDay: !dt, calories: m.calories,
        });
      });
      (data?.calori?.workouts || []).forEach((w) => {
        const dt = safeParse(w.timestamp);
        todayItems.push({
          id: `workout-${w.id}`, kind: 'workout', title: w.name,
          date: dt || today, allDay: !dt,
          calories: w.caloriesBurned, minutes: w.durationMinutes,
        });
      });
    }

    // Sort: timed items by time, all-day items first.
    const sortFn = (a, b) => {
      if (a.allDay && !b.allDay) return -1;
      if (!a.allDay && b.allDay) return 1;
      return a.date - b.date;
    };
    todayItems.sort(sortFn);

    // Upcoming (next 7 days, excluding today) for the empty-state fallback.
    const upcoming = [];
    for (let i = 1; i <= 7; i++) {
      const day = addDays(today, i);
      build(day).forEach((it) => upcoming.push(it));
    }
    upcoming.sort((a, b) => a.date - b.date);

    return { todayItems, upcoming };
  }, [data, caloriDate, t]);

// ── Timeline row ─────────────────────────────────────────────────────────────

const KIND_META = {
  exam:     { icon: GraduationCap,  cls: 'border-s-destructive bg-destructive/5',           ic: 'text-destructive' },
  event:    { icon: CalendarIcon,   cls: 'border-s-primary bg-primary/5',                    ic: 'text-primary' },
  task:     { icon: CheckCircle2,   cls: 'border-s-amber-500 bg-amber-50 dark:bg-amber-900/10', ic: 'text-amber-500' },
  meal:     { icon: UtensilsCrossed,cls: 'border-s-[#059669] bg-[#059669]/5',                ic: 'text-[#059669]' },
  workout:  { icon: Dumbbell,       cls: 'border-s-[#7C3AED] bg-[#7C3AED]/5',                ic: 'text-[#7C3AED]' },
};

const TimelineRow = ({ item, t }) => {
  const meta = KIND_META[item.kind] || KIND_META.event;
  const Icon = meta.icon;
  const showTime = !item.allDay && isValid(item.date);
  return (
    <div className={cn('rounded-2xl border border-border border-s-[3px] p-3 flex items-start gap-3 transition-colors', meta.cls)}>
      <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-card/70', meta.ic)}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">{item.title}</p>
        <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5 mt-0.5 text-[11px] text-muted-foreground">
          {showTime && (
            <span className="font-medium">
              {format(item.date, 'HH:mm')}
              {item.endDate && isValid(item.endDate) ? ` — ${format(item.endDate, 'HH:mm')}` : ''}
            </span>
          )}
          {item.location && <span>· {item.location}</span>}
          {item.kind === 'meal' && item.calories != null && <span>· {item.calories} {t('caloriCalories')}</span>}
          {item.kind === 'workout' && (
            <span>· {item.minutes} {t('caloriMinutes')} · {item.calories} {t('caloriBurned')}</span>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Quick action pill ────────────────────────────────────────────────────────

const QuickAction = ({ icon: Icon, label, onClick, color, bg }) => (
  <button
    onClick={onClick}
    aria-label={label}
    className="group flex flex-col items-center gap-1.5 flex-1 min-w-[72px] py-3 rounded-2xl border border-border bg-card hover:border-primary/40 hover:shadow-sm active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-1 focus-visible:ring-offset-background"
  >
    <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105', bg)}>
      <Icon className={cn('w-5 h-5', color)} />
    </div>
    <span className="text-[11px] font-semibold text-foreground">{label}</span>
  </button>
);

// ── Main: Command Center home ────────────────────────────────────────────────

export const SmartDashboard = () => {
  const { data, setActiveCategory, setShowPomodoroModal } = useStore();
  const { t, language } = useTranslation();
  const isRTL = language === 'he';
  const locale = isRTL ? he : undefined;
  const displayName = data?.profile?.displayName || '';
  const caloriDate = useStore((s) => s.caloriDate);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h >= 5 && h < 12) return t('goodMorning');
    if (h >= 12 && h < 17) return t('goodAfternoon');
    if (h >= 17 && h < 21) return t('goodEvening');
    return t('goodNight');
  };

  const { todayItems, upcoming } = useTimelineItems(data, caloriDate, t);

  // Smart summary sentence
  const summary = useMemo(() => {
    // Nearest upcoming exam (today or future)
    let nearestExam = null;
    (data?.courses || []).forEach((course) => {
      ['moedA', 'moedB', 'moedC'].forEach((moed) => {
        const dt = safeParse(course[moed] || course.exams?.[moed]);
        if (!dt) return;
        const days = differenceInDays(startOfDay(dt), startOfDay(new Date()));
        if (days >= 0 && (!nearestExam || days < nearestExam.days)) {
          nearestExam = { name: course.name, days };
        }
      });
    });

    const tasksToday = todayItems.filter((i) => i.kind === 'task').length;

    if (tasksToday > 0) return t('summaryTasksToday').replace('{n}', tasksToday);
    if (nearestExam) {
      if (nearestExam.days === 0) return t('summaryExamToday').replace('{course}', nearestExam.name);
      return t('summaryNextExam')
        .replace('{course}', nearestExam.name)
        .replace('{n}', nearestExam.days);
    }
    return t('summaryAllClear');
  }, [data, todayItems, t]);

  const Chevron = isRTL ? ChevronLeft : ChevronRight;
  const hasToday = todayItems.length > 0;

  return (
    <div
      className="max-w-2xl mx-auto w-full px-4 py-4 space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* ── Smart header ── */}
      <header>
        <h2 className="text-2xl font-extrabold text-foreground tracking-tight">
          {getGreeting()}{displayName ? ` ${displayName}` : ''}! 👋
        </h2>
        <p className="flex items-start gap-1.5 text-sm text-muted-foreground mt-1.5 leading-relaxed">
          <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <span>{summary}</span>
        </p>
      </header>

      {/* ── Quick actions ── */}
      <div className="flex gap-2">
        <QuickAction
          icon={Play} label={t('pomodoro')}
          color="text-purple-600" bg="bg-purple-100 dark:bg-purple-900/30"
          onClick={() => setShowPomodoroModal(true)}
        />
        <QuickAction
          icon={UtensilsCrossed} label={t('caloriHubCard')}
          color="text-[#059669]" bg="bg-[#D1FAE5] dark:bg-[#059669]/20"
          onClick={() => setActiveCategory('calori')}
        />
        <QuickAction
          icon={ListTodo} label={t('navTasks')}
          color="text-blue-500" bg="bg-blue-100 dark:bg-blue-900/30"
          onClick={() => setActiveCategory('tasks')}
        />
      </div>

      {/* ── AI quick links (per course) ── */}
      <AiQuickLinks data={data} t={t} />

      {/* ── My day timeline ── */}
      <section className="space-y-2">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2 px-0.5">
          <CalendarIcon className="w-4 h-4 text-primary" />
          {t('myDayTitle')}
        </h3>

        {hasToday ? (
          <div className="space-y-2">
            {todayItems.map((item) => <TimelineRow key={item.id} item={item} t={t} />)}
          </div>
        ) : (
          // Empty today → show what's coming up next.
          <div className="rounded-2xl border border-dashed border-border bg-card/40 p-6">
            <div className="text-center space-y-2">
              <div className="text-4xl">🌤️</div>
              <p className="text-sm text-muted-foreground">{t('myDayEmpty')}</p>
            </div>
            {upcoming.length > 0 && (
              <div className="space-y-2 text-start pt-5 mt-5 border-t border-border/60">
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-0.5">
                  {t('comingUp')}
                </p>
                {upcoming.slice(0, 4).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveCategory('calendar')}
                    aria-label={item.title}
                    className="w-full flex items-center justify-between gap-2 rounded-xl border border-border bg-card p-2.5 hover:border-primary/40 hover:shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  >
                    <span className="text-sm font-medium text-foreground truncate">{item.title}</span>
                    <span className="text-[11px] text-muted-foreground shrink-0 flex items-center gap-1">
                      {isValid(item.date) && format(item.date, 'EEE d/M', { locale })}
                      <Chevron className="w-3.5 h-3.5" />
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

// ── AI quick-links strip ─────────────────────────────────────────────────────

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
      <h3 className="text-sm font-bold text-foreground flex items-center gap-2 px-0.5">
        <Bot className="w-4 h-4 text-primary" />
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
            className="shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-card hover:border-primary/40 hover:shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            <Bot className="w-4 h-4 text-primary shrink-0" />
            <span className="text-xs font-semibold text-foreground whitespace-nowrap">{c.name}</span>
          </a>
        ))}
      </div>
    </section>
  );
};
