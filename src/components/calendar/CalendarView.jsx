import React, { useState, useMemo } from 'react';
import { useStore } from '../../store/useStore';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  startOfDay,
  eachDayOfInterval,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  addDays,
  getDay,
  differenceInDays,
  parseISO,
  isValid,
} from 'date-fns';
import { he } from 'date-fns/locale';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Calendar as CalendarIcon,
  CheckCircle2,
  StickyNote,
  MapPin,
  GraduationCap,
  Plus,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useTranslation } from '../../hooks/useTranslation';

const WEEKDAYS_HE = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];
const WEEKDAYS_EN = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const VIEW_MODES = ['day', '3days', 'week', 'month', 'list'];

function safeParse(d) {
  if (!d) return null;
  const dt = typeof d === 'string' ? parseISO(d) : new Date(d);
  return isValid(dt) ? dt : null;
}

export const CalendarView = () => {
  const { data, openAddSheet } = useStore();
  const { t, language } = useTranslation();
  const isRTL = language === 'he';
  const locale = isRTL ? he : undefined;

  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month');
  const [selectedDate, setSelectedDate] = useState(new Date());

  // ─── Aggregate all items into a flat calendar-item list ────────────

  const allItems = useMemo(() => {
    const items = [];

    // Exams
    data?.courses?.forEach((course) => {
      ['moedA', 'moedB', 'moedC'].forEach((moed) => {
        const raw = course[moed] || course.exams?.[moed];
        const dt = safeParse(raw);
        if (!dt) return;
        items.push({
          id: `exam-${course.id}-${moed}`,
          kind: 'exam',
          title: `${course.name} — ${t(moed)}`,
          date: dt,
          allDay: true,
          color: 'destructive',
        });
      });
    });

    // Personal events
    (data?.events || []).forEach((ev) => {
      const dt = safeParse(ev.start);
      if (!dt) return;
      items.push({
        id: ev.id,
        kind: 'event',
        title: ev.title,
        date: dt,
        endDate: safeParse(ev.end),
        allDay: !!ev.allDay,
        location: ev.location,
        color: 'primary',
      });
    });

    // Personal tasks with due date
    (data?.personalTasks || []).forEach((task) => {
      const dt = safeParse(task.dueDate);
      if (!dt) return;
      items.push({
        id: task.id,
        kind: 'task',
        title: task.title,
        date: dt,
        allDay: true,
        done: task.done,
        priority: task.priority,
        color: task.done ? 'muted' : task.priority === 'high' ? 'destructive' : 'primary',
      });
    });

    // Pomodoro sessions
    (data?.pomodoroSessions || []).forEach((s) => {
      const dt = safeParse(s.date);
      if (!dt) return;
      const course = data.courses?.find((c) => c.id === s.courseId);
      items.push({
        id: s.id,
        kind: 'pomodoro',
        title: `${s.minutes} ${t('learningMinutes')}${course ? ` — ${course.name}` : ''}`,
        date: dt,
        allDay: true,
        color: 'purple',
      });
    });

    items.sort((a, b) => a.date - b.date);
    return items;
  }, [data, t]);

  // ─── View helpers ────────────────────────────────────────────

  const getDateRange = () => {
    if (viewMode === 'day') return [selectedDate];
    if (viewMode === '3days')
      return eachDayOfInterval({
        start: selectedDate,
        end: addDays(selectedDate, 2),
      });
    if (viewMode === 'week') {
      const ws = startOfWeek(selectedDate, { weekStartsOn: 0 });
      return eachDayOfInterval({ start: ws, end: addDays(ws, 6) });
    }
    return [];
  };

  const itemsForDay = (day) =>
    allItems.filter((item) => isSameDay(item.date, day));

  // ─── Navigation ────────────────────────────────────────────

  const nav = (dir) => {
    const d = dir === 'next' ? 1 : -1;
    if (viewMode === 'month') {
      setCurrentDate(d === 1 ? addMonths(currentDate, 1) : subMonths(currentDate, 1));
    } else if (viewMode === 'day') {
      setSelectedDate(addDays(selectedDate, d));
    } else if (viewMode === '3days') {
      setSelectedDate(addDays(selectedDate, 3 * d));
    } else if (viewMode === 'week') {
      setSelectedDate(addDays(selectedDate, 7 * d));
    }
  };

  const goToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  // ─── Month grid ────────────────────────────────────────────

  const renderMonthGrid = () => {
    const ms = startOfMonth(currentDate);
    const me = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start: ms, end: me });
    const startPad = getDay(ms);

    return (
      <>
        <div className="grid grid-cols-7 gap-0.5 mb-2 text-center text-xs font-medium text-muted-foreground">
          {(isRTL ? WEEKDAYS_HE : WEEKDAYS_EN).map((d, i) => (
            <div key={i}>{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-0.5">
          {Array.from({ length: startPad }).map((_, i) => (
            <div key={`pad-${i}`} className="min-h-[44px] md:min-h-[80px]" />
          ))}
          {days.map((day) => {
            const dayItems = itemsForDay(day);
            const isCurr = isToday(day);
            const isSel = isSameDay(day, selectedDate);
            return (
              <button
                key={day.toISOString()}
                onClick={() => {
                  setSelectedDate(day);
                  setViewMode('day');
                }}
                className={cn(
                  'min-h-[44px] md:min-h-[80px] p-0.5 sm:p-1 border rounded-xl transition-all relative flex flex-col items-center justify-start text-start',
                  isSel
                    ? 'border-primary bg-primary/10'
                    : isCurr
                    ? 'border-primary/50 bg-primary/5'
                    : 'border-border/50 hover:border-primary/30',
                )}
              >
                <span
                  className={cn(
                    'text-xs md:text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full mb-0.5',
                    isCurr && 'bg-primary text-primary-foreground',
                  )}
                >
                  {format(day, 'd')}
                </span>
                <div className="flex flex-wrap gap-[2px] justify-center w-full">
                  {dayItems.slice(0, 3).map((item) => (
                    <div
                      key={item.id}
                      className={cn(
                        'w-1.5 h-1.5 rounded-full',
                        item.kind === 'exam'
                          ? 'bg-destructive'
                          : item.kind === 'event'
                          ? 'bg-primary'
                          : item.kind === 'task'
                          ? 'bg-amber-500'
                          : 'bg-purple-500',
                      )}
                    />
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </>
    );
  };

  // ─── Day/column list view ────────────────────────────────────

  const renderDayColumn = (day) => {
    const items = itemsForDay(day);
    return (
      <div key={day.toISOString()} className="flex-1 min-w-0">
        <div
          className={cn(
            'text-center py-2 mb-2 rounded-xl text-xs font-semibold',
            isToday(day)
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground',
          )}
        >
          {format(day, 'EEE d/M', { locale })}
        </div>
        <div className="space-y-2">
          {items.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-4">
              {t('noItemsThisDay')}
            </p>
          )}
          {items.map((item) => (
            <CalendarItem key={item.id} item={item} t={t} />
          ))}
          <button
            onClick={() =>
              openAddSheet('event', { date: format(day, 'yyyy-MM-dd') })
            }
            className="w-full flex items-center justify-center gap-1 py-2 text-xs text-muted-foreground hover:text-primary transition-colors rounded-xl border border-dashed border-border hover:border-primary/40"
          >
            <Plus className="w-3.5 h-3.5" />
            {t('add')}
          </button>
        </div>
      </div>
    );
  };

  // ─── List view ────────────────────────────────────────────

  const renderList = () => {
    const upcoming = allItems.filter(
      (i) => differenceInDays(startOfDay(i.date), startOfDay(new Date())) >= -1,
    );
    if (upcoming.length === 0) {
      return (
        <p className="text-muted-foreground text-sm text-center py-8">
          {t('noItemsThisWeek')}
        </p>
      );
    }
    let lastDateStr = '';
    return (
      <div className="space-y-2">
        {upcoming.map((item) => {
          const dateStr = format(item.date, 'EEEE, d MMMM', { locale });
          const showHeader = dateStr !== lastDateStr;
          lastDateStr = dateStr;
          return (
            <React.Fragment key={item.id}>
              {showHeader && (
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider pt-3 pb-1">
                  {isToday(item.date) ? t('today') : dateStr}
                </h3>
              )}
              <CalendarItem item={item} t={t} />
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  // ─── View mode label ────────────────────────────────────────

  const viewLabel = () => {
    if (viewMode === 'month') return format(currentDate, 'MMMM yyyy', { locale });
    if (viewMode === 'day') return format(selectedDate, 'EEEE, d MMMM', { locale });
    if (viewMode === '3days') {
      const end = addDays(selectedDate, 2);
      return `${format(selectedDate, 'd/M', { locale })} — ${format(end, 'd/M', { locale })}`;
    }
    if (viewMode === 'week') {
      const ws = startOfWeek(selectedDate, { weekStartsOn: 0 });
      const we = addDays(ws, 6);
      return `${format(ws, 'd/M', { locale })} — ${format(we, 'd/M', { locale })}`;
    }
    return t('viewList');
  };

  // ─── Render ────────────────────────────────────────────────

  return (
    <div className="px-4 py-5 sm:px-6 max-w-3xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-5">
      {/* View mode toggle */}
      <div className="flex bg-muted rounded-xl p-1 gap-0.5 overflow-x-auto">
        {VIEW_MODES.map((mode) => (
          <button
            key={mode}
            className={cn(
              'flex-1 text-center text-xs font-semibold py-2 rounded-lg transition-all whitespace-nowrap px-2',
              viewMode === mode
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
            onClick={() => setViewMode(mode)}
          >
            {t(
              mode === 'day'
                ? 'viewDay'
                : mode === '3days'
                ? 'viewThreeDays'
                : mode === 'week'
                ? 'viewWeek'
                : mode === 'month'
                ? 'viewMonth'
                : 'viewList',
            )}
          </button>
        ))}
      </div>

      {/* Navigation header */}
      {viewMode !== 'list' && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => nav('prev')}
              className="p-2 hover:bg-muted rounded-full transition-colors"
            >
              {isRTL ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>
            <h2 className="text-base md:text-lg font-bold min-w-[140px] text-center">
              {viewLabel()}
            </h2>
            <button
              onClick={() => nav('next')}
              className="p-2 hover:bg-muted rounded-full transition-colors"
            >
              {isRTL ? (
                <ChevronLeft className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          </div>
          <button
            onClick={goToday}
            className="text-xs font-semibold text-primary hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-colors"
          >
            {t('today')}
          </button>
        </div>
      )}

      {/* Content */}
      <Card className="shadow-none rounded-2xl">
        <CardContent className="pt-4">
          {viewMode === 'month' && renderMonthGrid()}
          {viewMode === 'list' && renderList()}
          {(viewMode === 'day' || viewMode === '3days' || viewMode === 'week') && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {getDateRange().map((day) => renderDayColumn(day))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upcoming exams (compact, always visible) */}
      <UpcomingExams allItems={allItems} t={t} />
    </div>
  );
};

// ─── CalendarItem card ────────────────────────────────────────

const ITEM_ICONS = {
  exam: GraduationCap,
  event: CalendarIcon,
  task: CheckCircle2,
  pomodoro: Clock,
  note: StickyNote,
};

const ITEM_COLORS = {
  exam: 'border-s-destructive bg-destructive/5',
  event: 'border-s-primary bg-primary/5',
  task: 'border-s-amber-500 bg-amber-50 dark:bg-amber-900/10',
  pomodoro: 'border-s-purple-500 bg-purple-50 dark:bg-purple-900/10',
};

const CalendarItem = ({ item, t }) => {
  const Icon = ITEM_ICONS[item.kind] || CalendarIcon;
  return (
    <div
      className={cn(
        'rounded-xl border border-border p-3 transition-colors',
        'border-s-[3px]',
        ITEM_COLORS[item.kind] || '',
        item.done && 'opacity-50',
      )}
    >
      <div className="flex items-start gap-2">
        <Icon
          className={cn(
            'w-4 h-4 mt-0.5 shrink-0',
            item.kind === 'exam'
              ? 'text-destructive'
              : item.kind === 'event'
              ? 'text-primary'
              : item.kind === 'task'
              ? 'text-amber-500'
              : 'text-purple-500',
          )}
        />
        <div className="flex-1 min-w-0">
          <p
            className={cn(
              'text-sm font-semibold text-foreground truncate',
              item.done && 'line-through',
            )}
          >
            {item.title}
          </p>
          {!item.allDay && item.date && (
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {format(item.date, 'HH:mm')}
              {item.endDate ? ` — ${format(item.endDate, 'HH:mm')}` : ''}
            </p>
          )}
          {item.location && (
            <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {item.location}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Upcoming exams strip ────────────────────────────────────

const UpcomingExams = ({ allItems, t }) => {
  const exams = allItems.filter(
    (i) =>
      i.kind === 'exam' &&
      differenceInDays(startOfDay(i.date), startOfDay(new Date())) >= 0,
  );
  if (exams.length === 0) return null;

  return (
    <Card className="border-destructive/20 shadow-none rounded-2xl">
      <CardHeader className="py-3 px-4">
        <CardTitle className="text-sm flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-destructive" />
          {t('upcomingExams')}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-0">
        <div className="space-y-2">
          {exams.map((exam) => {
            const days = differenceInDays(exam.date, new Date());
            return (
              <div
                key={exam.id}
                className="flex items-center justify-between text-sm"
              >
                <span className="font-medium text-foreground truncate">
                  {exam.title}
                </span>
                <span
                  className={cn(
                    'text-xs font-bold px-2.5 py-1 rounded-lg shrink-0 ms-2',
                    days <= 7
                      ? 'bg-destructive/10 text-destructive'
                      : 'bg-primary/10 text-primary',
                  )}
                >
                  {days === 0
                    ? t('todayExclamation')
                    : `${days} ${t('daysLabel')}`}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
