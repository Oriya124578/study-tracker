import React, { useState, useMemo, useEffect } from 'react';
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
  Menu,
  LayoutList,
  Moon,
  Sun,
  List as ListIcon,
  LayoutGrid,
  CalendarDays,
  Columns
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
  const { data, openAddSheet, setActiveCategory } = useStore();
  const { t, language } = useTranslation();
  const isRTL = language === 'he';
  const locale = isRTL ? he : undefined;

  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isViewMenuOpen, setIsViewMenuOpen] = useState(false);

  // Weather and Location State
  const [weather, setWeather] = useState({ temp: null, min: null, max: null, city: null, loading: true, error: false, isNight: false });

  useEffect(() => {
    let mounted = true;
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        if (!mounted) return;
        try {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          
          const geoRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=he`);
          const geoData = await geoRes.json();
          const city = geoData.city || geoData.locality || 'מיקום נוכחי';

          const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min&timezone=auto`);
          const weatherData = await weatherRes.json();
          
          if (!mounted) return;
          const isNight = weatherData.current_weather.is_day === 0;

          setWeather({
            temp: Math.round(weatherData.current_weather.temperature),
            min: Math.round(weatherData.daily.temperature_2m_min[0]),
            max: Math.round(weatherData.daily.temperature_2m_max[0]),
            city,
            loading: false,
            error: false,
            isNight
          });
        } catch (e) {
          if (mounted) setWeather(w => ({ ...w, loading: false, error: true }));
        }
      }, () => {
        if (mounted) setWeather(w => ({ ...w, loading: false, error: true }));
      });
    } else {
      setWeather(w => ({ ...w, loading: false, error: true }));
    }
    return () => { mounted = false; };
  }, []);

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
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: startPad }).map((_, i) => (
            <div key={`pad-${i}`} className="min-h-[48px] md:min-h-[80px]" />
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
                  'min-h-[48px] md:min-h-[80px] p-0.5 sm:p-1 border rounded-xl transition-all relative flex flex-col items-center justify-start text-start overflow-hidden',
                  isSel
                    ? 'border-primary bg-primary/10 shadow-sm'
                    : isCurr
                    ? 'border-primary/50 bg-primary/5'
                    : 'border-border/50 bg-card hover:border-primary/30 hover:bg-muted/30',
                )}
              >
                <span
                  className={cn(
                    'text-[11px] md:text-sm font-bold w-5 h-5 md:w-6 md:h-6 flex items-center justify-center rounded-full mb-0.5 shrink-0',
                    isCurr && 'bg-primary text-primary-foreground',
                  )}
                >
                  {format(day, 'd')}
                </span>
                <div className="flex flex-col gap-[2px] w-full px-0.5 overflow-hidden flex-1">
                  {dayItems.slice(0, 3).map((item) => (
                    <div
                      key={item.id}
                      className={cn(
                        'text-[9px] md:text-[11px] leading-tight px-1 py-0.5 rounded-[3px] truncate w-full text-right font-medium',
                        item.kind === 'exam'
                          ? 'bg-destructive/90 text-white'
                          : item.kind === 'event'
                          ? 'bg-primary/90 text-white'
                          : item.kind === 'task'
                          ? 'bg-amber-500/90 text-white'
                          : 'bg-purple-500/90 text-white',
                      )}
                    >
                      {item.title}
                    </div>
                  ))}
                  {dayItems.length > 3 && (
                    <div className="text-[9px] text-muted-foreground mt-0.5 font-bold text-center">
                      +{dayItems.length - 3}
                    </div>
                  )}
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
      <div key={day.toISOString()} className="flex-1 min-w-[140px] max-w-[280px] snap-start">
        <div
          className={cn(
            'text-center py-2.5 mb-3 rounded-2xl text-sm font-bold shadow-sm border',
            isToday(day)
              ? 'bg-primary text-primary-foreground border-primary shadow-primary/20'
              : 'bg-card text-card-foreground border-border/60',
          )}
        >
          {format(day, 'EEEE', { locale })}
          <div className="text-[11px] font-medium opacity-80 mt-0.5">
            {format(day, 'd/M', { locale })}
          </div>
        </div>
        <div className="space-y-2.5">
          {items.length === 0 && (
            <div className="text-[12px] text-muted-foreground text-center py-8 bg-muted/20 rounded-2xl border border-dashed border-border/50">
              {t('noItemsThisDay', 'אין אירועים')}
            </div>
          )}
          {items.map((item) => (
            <CalendarItem key={item.id} item={item} t={t} />
          ))}
          <button
            onClick={() =>
              openAddSheet('event', { date: format(day, 'yyyy-MM-dd') })
            }
            className="w-full flex items-center justify-center gap-1.5 py-3 text-xs font-semibold text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors rounded-2xl border border-dashed border-border hover:border-primary/40 bg-card/50"
          >
            <Plus className="w-4 h-4" />
            {t('add', 'הוסף')}
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
        <div className="text-muted-foreground text-sm text-center py-12 bg-muted/20 rounded-2xl border border-dashed border-border/50">
          {t('noItemsThisWeek', 'אין אירועים קרובים')}
        </div>
      );
    }
    let lastDateStr = '';
    return (
      <div className="space-y-3">
        {upcoming.map((item) => {
          const dateStr = format(item.date, 'EEEE, d MMMM', { locale });
          const showHeader = dateStr !== lastDateStr;
          lastDateStr = dateStr;
          return (
            <React.Fragment key={item.id}>
              {showHeader && (
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider pt-4 pb-1 flex items-center gap-2">
                  <div className="h-px bg-border flex-1" />
                  <span>{isToday(item.date) ? t('today', 'היום') : dateStr}</span>
                  <div className="h-px bg-border flex-1" />
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
    return t('viewList', 'רשימה');
  };

  // ─── Render ────────────────────────────────────────────────

  return (
    <div className="px-4 py-5 sm:px-6 max-w-4xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
      {/* Custom Top Header matching requested design */}
      <div className="flex flex-col gap-4 mb-2">
        <div className="flex items-center justify-between">
          {/* Menu Button - Now functional and clickable */}
          <button 
            onClick={() => setActiveCategory('commandCenter')}
            className="p-2.5 bg-background border border-border/50 shadow-sm rounded-full hover:bg-muted transition-colors cursor-pointer active:scale-95"
            title={t('navCommandCenter', 'תפריט ראשי')}
          >
            <Menu className="w-5 h-5" />
          </button>
          
          {/* Title and Weather/Location */}
          <div className="text-center flex flex-col items-center">
            <h1 className="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/70">יומן</h1>
            <div className="flex items-center justify-center gap-1.5 text-[12px] font-medium text-muted-foreground mt-1 bg-muted/40 px-2.5 py-0.5 rounded-full border border-border/30">
              {weather.loading ? (
                <span className="animate-pulse">מאתר מיקום...</span>
              ) : weather.error ? (
                <span>מיקום לא זמין</span>
              ) : (
                <>
                  <MapPin className="w-3.5 h-3.5 text-primary/70" />
                  <span className="max-w-[100px] truncate">{weather.city}</span>
                  <span className="mx-0.5 opacity-60">•</span>
                  <span>{weather.min}° - {weather.max}°</span>
                  {weather.isNight ? <Moon className="w-3.5 h-3.5 text-indigo-400" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
                </>
              )}
            </div>
          </div>
          
          {/* Actions: View Selector (Removed Bell) */}
          <div className="flex items-center gap-2 relative">
            <div className="relative">
              <button 
                onClick={() => setIsViewMenuOpen(!isViewMenuOpen)}
                className={cn(
                  "p-2.5 bg-background border shadow-sm rounded-full transition-colors active:scale-95 cursor-pointer",
                  isViewMenuOpen ? "border-primary bg-primary/5 text-primary" : "border-border/50 hover:bg-muted"
                )}
                title={t('viewMode', 'מצב תצוגה')}
              >
                <LayoutList className="w-5 h-5" />
              </button>
              
              {/* View Mode Dropdown */}
              {isViewMenuOpen && (
                <div className="absolute top-[calc(100%+8px)] left-0 w-44 bg-card/95 backdrop-blur-xl border border-border/60 shadow-2xl rounded-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                  <div className="text-[11px] font-bold text-muted-foreground px-3 py-1.5 uppercase tracking-wider">מצב תצוגה:</div>
                  <div className="flex flex-col gap-1 mt-1">
                    {[
                      { id: 'list', label: 'רשימה', icon: ListIcon },
                      { id: 'day', label: 'יום', icon: Columns },
                      { id: '3days', label: '3 ימים', icon: Columns },
                      { id: 'week', label: 'שבוע', icon: CalendarDays },
                      { id: 'month', label: 'חודש', icon: LayoutGrid }
                    ].map((mode) => {
                      const Icon = mode.icon;
                      return (
                        <button
                          key={mode.id}
                          onClick={() => {
                            setViewMode(mode.id);
                            setIsViewMenuOpen(false);
                          }}
                          className={cn(
                            "flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all w-full text-right",
                            viewMode === mode.id 
                              ? "bg-primary text-primary-foreground shadow-md" 
                              : "hover:bg-muted text-foreground"
                          )}
                        >
                          <span>{mode.label}</span>
                          <Icon className={cn("w-4 h-4", viewMode === mode.id ? "opacity-100" : "opacity-50")} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation header */}
      {viewMode !== 'list' && (
        <div className="flex items-center justify-between bg-card p-2 rounded-2xl border shadow-sm">
          <div className="flex items-center gap-2">
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
            <h2 className="text-sm md:text-base font-bold min-w-[120px] text-center">
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
            className="text-xs font-bold bg-primary/10 text-primary hover:bg-primary/20 px-3.5 py-2 rounded-xl transition-colors"
          >
            {t('today', 'היום')}
          </button>
        </div>
      )}

      {/* Content */}
      <Card className="shadow-sm border-border/60 rounded-3xl overflow-hidden bg-card/50">
        <CardContent className="p-4 md:p-6">
          {viewMode === 'month' && renderMonthGrid()}
          {viewMode === 'list' && renderList()}
          {(viewMode === 'day' || viewMode === '3days' || viewMode === 'week') && (
            <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory hide-scrollbar">
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

const CalendarItem = ({ item, t }) => {
  const Icon = ITEM_ICONS[item.kind] || CalendarIcon;
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border p-3 transition-all hover:shadow-md bg-background',
        item.kind === 'exam' ? 'border-destructive/30' :
        item.kind === 'event' ? 'border-primary/30' :
        item.kind === 'task' ? 'border-amber-500/30' : 'border-purple-500/30',
        item.done && 'opacity-60 grayscale-[0.5]',
      )}
    >
      {/* Decorative side stripe */}
      <div className={cn(
        "absolute top-0 bottom-0 right-0 w-1.5",
        item.kind === 'exam' ? 'bg-destructive' :
        item.kind === 'event' ? 'bg-primary' :
        item.kind === 'task' ? 'bg-amber-500' : 'bg-purple-500'
      )} />
      
      <div className="flex items-start gap-3">
        <div className={cn(
          "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
          item.kind === 'exam' ? 'bg-destructive/10 text-destructive' :
          item.kind === 'event' ? 'bg-primary/10 text-primary' :
          item.kind === 'task' ? 'bg-amber-500/10 text-amber-500' : 'bg-purple-500/10 text-purple-500'
        )}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p
            className={cn(
              'text-sm font-bold text-foreground leading-snug line-clamp-2 break-words',
              item.done && 'line-through text-muted-foreground',
            )}
            title={item.title}
          >
            {item.title}
          </p>
          {!item.allDay && item.date && (
            <div className="flex items-center gap-1.5 mt-1.5 text-[11px] font-medium text-muted-foreground">
              <Clock className="w-3 h-3 opacity-70" />
              <span>
                {format(item.date, 'HH:mm')}
                {item.endDate ? ` — ${format(item.endDate, 'HH:mm')}` : ''}
              </span>
            </div>
          )}
          {item.location && (
            <div className="flex items-center gap-1.5 mt-1.5 text-[11px] font-medium text-muted-foreground">
              <MapPin className="w-3 h-3 opacity-70" />
              <span className="truncate">{item.location}</span>
            </div>
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
    <Card className="border-destructive/20 shadow-md rounded-3xl overflow-hidden">
      <CardHeader className="py-4 px-5 bg-destructive/5 border-b border-destructive/10">
        <CardTitle className="text-sm font-bold flex items-center gap-2 text-destructive">
          <GraduationCap className="w-5 h-5" />
          {t('upcomingExams', 'מבחנים קרובים')}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border/50">
          {exams.map((exam) => {
            const days = differenceInDays(startOfDay(exam.date), startOfDay(new Date()));
            return (
              <div
                key={exam.id}
                className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="font-bold text-sm text-foreground">
                    {exam.title}
                  </span>
                  <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                    <CalendarIcon className="w-3 h-3" />
                    {format(exam.date, 'dd/MM/yyyy')}
                  </span>
                </div>
                <span
                  className={cn(
                    'text-xs font-black px-3 py-1.5 rounded-xl shrink-0 shadow-sm',
                    days <= 7
                      ? 'bg-destructive text-white'
                      : 'bg-primary/10 text-primary border border-primary/20',
                  )}
                >
                  {days === 0
                    ? t('todayExclamation', 'היום!')
                    : `${days} ${t('daysLabel', 'ימים')}`}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
