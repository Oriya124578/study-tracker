import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useStore } from '../../store/useStore';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
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
  getHours,
  getMinutes,
} from 'date-fns';
import { he, enUS } from 'date-fns/locale';
import styles from './CalendarView.module.css';

function safeParse(d) {
  if (!d) return null;
  const dt = typeof d === 'string' ? parseISO(d) : new Date(d);
  return isValid(dt) ? dt : null;
}

export const CalendarView = () => {
  const { data } = useStore();
  const isRTL = true;
  const locale = he;

  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('week'); // 'day', '3days', 'week', 'month', 'list'
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Tick every minute so the "now" line stays accurate while the view is open.
  const [nowTick, setNowTick] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNowTick(new Date()), 60000);
    return () => clearInterval(id);
  }, []);

  // Auto-scroll to the "now" line when a time-grid view opens, so the screen
  // doesn't open on the morning hours in the afternoon.
  const nowLineRef = useRef(null);
  useEffect(() => {
    if (!['day', '3days', 'week'].includes(viewMode)) return;
    const id = setTimeout(() => {
      nowLineRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }, 150);
    return () => clearTimeout(id);
  }, [viewMode, selectedDate]);

  const allItems = useMemo(() => {
    const items = [];

    data?.courses?.forEach((course) => {
      ['moedA', 'moedB', 'moedC'].forEach((moed) => {
        const raw = course[moed] || course.exams?.[moed];
        const dt = safeParse(raw);
        if (!dt) return;
        items.push({
          id: `exam-${course.id}-${moed}`,
          kind: 'exam',
          title: `${course.name} — ${moed}`,
          date: dt,
          allDay: true,
        });
      });
    });

    (data?.events || []).forEach((ev) => {
      const dt = safeParse(ev.start);
      if (!dt) return;
      items.push({
        id: ev.id,
        kind: ev.source === 'google' ? 'event' : 'event',
        title: ev.title,
        date: dt,
        endDate: safeParse(ev.end),
        allDay: !!ev.allDay,
        location: ev.location,
        isLocked: ev.isLocked,
      });
    });

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
      });
    });

    (data?.pomodoroSessions || []).forEach((s) => {
      const dt = safeParse(s.date);
      if (!dt) return;
      const course = data.courses?.find((c) => c.id === s.courseId);
      items.push({
        id: s.id,
        kind: 'workout',
        title: `${s.minutes} דק׳${course ? ` — ${course.name}` : ''}`,
        date: dt,
        allDay: true,
      });
    });

    items.sort((a, b) => a.date - b.date);
    return items;
  }, [data]);

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

  const itemsForDay = (day) => allItems.filter((item) => isSameDay(item.date, day));

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

  const getEventClass = (kind) => {
    if (kind === 'exam') return styles.exam;
    if (kind === 'study' || kind === 'lec') return styles.lec;
    if (kind === 'workout' || kind === 'pomodoro') return styles.workout;
    if (kind === 'meal') return styles.meal;
    if (kind === 'task') return styles.task;
    return styles.event;
  };

  const getDotClass = (kind) => {
    if (kind === 'exam') return styles.r;
    if (kind === 'study' || kind === 'lec') return styles.b;
    if (kind === 'workout' || kind === 'pomodoro') return styles.p;
    if (kind === 'meal') return styles.g;
    return styles.a;
  };

  const getTagClass = (kind) => {
    if (kind === 'exam') return styles.r;
    if (kind === 'study' || kind === 'lec') return styles.b;
    if (kind === 'workout' || kind === 'pomodoro') return styles.p;
    if (kind === 'meal') return styles.g;
    return '';
  };

  const renderMonth = () => {
    const ms = startOfMonth(currentDate);
    const me = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start: ms, end: me });
    const startPad = getDay(ms);

    return (
      <div className={styles.monthGridWrapper}>
        <div className={styles.dowRow}>
          <div className={styles.dow}>א׳</div>
          <div className={styles.dow}>ב׳</div>
          <div className={styles.dow}>ג׳</div>
          <div className={styles.dow}>ד׳</div>
          <div className={styles.dow}>ה׳</div>
          <div className={styles.dow}>ו׳</div>
          <div className={styles.dow}>ש׳</div>
        </div>
        <div className={styles.monthGrid}>
          {Array.from({ length: startPad }).map((_, i) => (
            <div key={`pad-${i}`} className={`${styles.cell} ${styles.muted}`}>
              <div className={styles.cNum}></div>
            </div>
          ))}
          {days.map((day) => {
            const dayItems = itemsForDay(day);
            const isCurr = isToday(day);
            // Exams first — they matter most at month altitude.
            const sorted = [...dayItems].sort(
              (a, b) => (a.kind === 'exam' ? 0 : 1) - (b.kind === 'exam' ? 0 : 1)
            );
            const tags = sorted.slice(0, 2);
            const rest = sorted.slice(2, 6);

            return (
              <div
                key={day.toISOString()}
                className={`${styles.cell} ${isCurr ? styles.today : ''}`}
                onClick={() => {
                  setSelectedDate(day);
                  setViewMode('day');
                }}
              >
                <div className={styles.cNum}>{format(day, 'd')}</div>
                {tags.map((item) => (
                  <div key={item.id} className={`${styles.cTag} ${getTagClass(item.kind)}`}>
                    {item.title}
                  </div>
                ))}
                {rest.length > 0 && (
                  <div className={styles.cDots}>
                    {rest.map((item, i) => (
                      <div key={i} className={`${styles.cD} ${getDotClass(item.kind)}`}></div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className={styles.monthLegend}>
          <div className={styles.legendItem}>
            <div className={`${styles.legendDot} ${styles.lg}`}></div>
            <span>תזונה</span>
          </div>
          <div className={styles.legendItem}>
            <div className={`${styles.legendDot} ${styles.lp}`}></div>
            <span>אימונים</span>
          </div>
          <div className={styles.legendItem}>
            <div className={`${styles.legendDot} ${styles.lb}`}></div>
            <span>לימודים</span>
          </div>
          <div className={styles.legendItem}>
            <div className={`${styles.legendDot} ${styles.lr}`}></div>
            <span>מבחנים</span>
          </div>
          <div className={styles.legendItem}>
            <div className={`${styles.legendDot} ${styles.la}`}></div>
            <span>אירועים</span>
          </div>
        </div>
      </div>
    );
  };

  const renderList = () => {
    const upcoming = allItems.filter(
      (i) => differenceInDays(startOfDay(i.date), startOfDay(new Date())) >= -1,
    );
    if (upcoming.length === 0) {
      return <div className={styles.emptyState}>אין אירועים קרובים</div>;
    }

    let lastDateStr = '';
    return (
      <div className={`${styles.content} schedule-view-list`}>
        {upcoming.map((item) => {
          const dateStr = format(item.date, 'EEEE', { locale });
          const showHeader = dateStr !== lastDateStr;
          lastDateStr = dateStr;
          return (
            <React.Fragment key={item.id}>
              {showHeader && (
                <div className={styles.dayRow}>
                  <div className={styles.dDate}>
                    <div className={`${styles.num} ${isToday(item.date) ? styles.today : ''}`}>
                      {format(item.date, 'd')}
                    </div>
                    <div className={styles.nm}>{isToday(item.date) ? 'היום' : ''}</div>
                  </div>
                  <div className={styles.dDayName}>{dateStr}</div>
                  <div className={styles.dLine}></div>
                </div>
              )}
              <div role="listitem" className={`${styles.item} ${getEventClass(item.kind)}`}>
                <div className={styles.itemTime}>{item.allDay ? 'כל היום' : format(item.date, 'HH:mm')}</div>
                <div className={styles.itemBody}>
                  <div className={styles.itemName}>{item.title}</div>
                  {(item.location || (!item.allDay && item.endDate)) && (
                    <div className={styles.itemMeta}>{item.location || `עד ${format(item.endDate, 'HH:mm')}`}</div>
                  )}
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  // ---- Time-grid engine (shared by day / 3-days / week) -------------------
  // Splits a day's items into all-day chips vs timed boxes, clusters timed
  // overlaps and assigns side-by-side columns so boxes never cover each other.
  const layoutTimedItems = (items, startHour, endHour) => {
    const dayStartMin = startHour * 60;
    const dayEndMin = endHour * 60;

    const timed = items
      .filter((i) => !i.allDay)
      .map((i) => {
        const startMin = getHours(i.date) * 60 + getMinutes(i.date);
        let endMin;
        if (i.endDate && isSameDay(i.date, i.endDate)) {
          endMin = getHours(i.endDate) * 60 + getMinutes(i.endDate);
        } else if (i.endDate) {
          endMin = dayEndMin; // spans past midnight — clamp to grid bottom
        } else {
          endMin = startMin + 60;
        }
        if (endMin <= startMin) endMin = startMin + 30;
        return { ...i, startMin, endMin: Math.min(endMin, dayEndMin) };
      })
      .filter((i) => i.endMin > dayStartMin && i.startMin < dayEndMin)
      .sort((a, b) => a.startMin - b.startMin || b.endMin - a.endMin);

    // Greedy clustering: events that transitively overlap share the width.
    const positioned = [];
    let cluster = [];
    let clusterEnd = -1;
    const flush = () => {
      if (cluster.length === 0) return;
      const colEnds = [];
      for (const ev of cluster) {
        let col = colEnds.findIndex((end) => end <= ev.startMin);
        if (col === -1) {
          col = colEnds.length;
          colEnds.push(0);
        }
        colEnds[col] = ev.endMin;
        ev.col = col;
      }
      for (const ev of cluster) {
        ev.cols = colEnds.length;
        positioned.push(ev);
      }
      cluster = [];
      clusterEnd = -1;
    };
    for (const ev of timed) {
      if (cluster.length > 0 && ev.startMin >= clusterEnd) flush();
      cluster.push(ev);
      clusterEnd = Math.max(clusterEnd, ev.endMin);
    }
    flush();
    return positioned;
  };

  const renderGridCols = (days, view) => {
    const slotHeight = 60; // px per hour

    // Dynamic hour range: 06–23 by default, extended to fit early/late items.
    let startHour = 6;
    let endHour = 23;
    days.forEach((day) => {
      itemsForDay(day).forEach((i) => {
        if (i.allDay) return;
        startHour = Math.min(startHour, getHours(i.date));
        const end = i.endDate && isSameDay(i.date, i.endDate) ? i.endDate : i.date;
        endHour = Math.max(endHour, Math.min(24, getHours(end) + 1));
      });
    });
    const hours = Array.from({ length: endHour - startHour }, (_, i) => i + startHour);

    const gridClass = view === 'week' ? styles.gridWeek : view === '3days' ? styles.grid3 : styles.gridDay;
    const allDayByDay = days.map((day) => itemsForDay(day).filter((i) => i.allDay));
    const hasAllDay = allDayByDay.some((arr) => arr.length > 0);
    const maxChips = view === 'week' ? 2 : 3;

    return (
      <>
        {/* All-day strip — exams, tasks, full-day events live here, not on the time grid */}
        {hasAllDay && (
          <div className={`${gridClass} ${styles.allDayRow}`}>
            <div className={styles.adLabel}>{view === 'week' ? '∞' : 'כל היום'}</div>
            {days.map((day, di) => (
              <div key={day.toISOString()} className={styles.adCell}>
                {allDayByDay[di].slice(0, maxChips).map((item) => (
                  <div key={item.id} className={`${styles.adChip} ${getEventClass(item.kind)} ${item.done ? styles.adDone : ''}`} title={item.title}>
                    {item.title}
                  </div>
                ))}
                {allDayByDay[di].length > maxChips && (
                  <div className={`${styles.adChip} ${styles.adMore}`}>+{allDayByDay[di].length - maxChips}</div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className={gridClass}>
          <div className={styles.tCol}>
            {hours.map((h) => (
              <div key={h} className={styles.tRow}>
                <div className={styles.tl}>{`${h.toString().padStart(2, '0')}:00`}</div>
              </div>
            ))}
          </div>
          {days.map((day) => {
            const positioned = layoutTimedItems(itemsForDay(day), startHour, endHour);
            const gridHeight = hours.length * slotHeight;
            return (
              <div key={day.toISOString()} className={styles.tCol} style={{ position: 'relative' }}>
                {hours.map((h) => (
                  <div key={h} className={`${styles.tRow} ${styles.dc}`}></div>
                ))}
                {positioned.map((item) => {
                  const top = Math.max(0, ((item.startMin - startHour * 60) / 60) * slotHeight);
                  let height = ((item.endMin - Math.max(item.startMin, startHour * 60)) / 60) * slotHeight;
                  if (top + height > gridHeight) height = gridHeight - top;
                  if (height < 22) height = 22;

                  const cols = item.cols || 1;
                  const col = item.col || 0;
                  const compact = height < 40 || (view === 'week' && cols > 1);
                  const clampLines = Math.max(1, Math.floor((height - (compact ? 6 : 22)) / 14));

                  return (
                    <div
                      key={item.id}
                      className={`${styles.evt} ${getEventClass(item.kind)}`}
                      style={{
                        top: `${top}px`,
                        height: `${height}px`,
                        width: cols > 1 ? `calc(${100 / cols}% - 3px)` : undefined,
                        insetInlineStart: cols > 1 ? `${(col * 100) / cols}%` : undefined,
                        insetInlineEnd: cols > 1 ? 'auto' : undefined,
                      }}
                      title={item.title}
                    >
                      <div className={styles.evtName} style={{ WebkitLineClamp: clampLines }}>{item.title}</div>
                      {!compact && (
                        <div className={styles.evtTime} dir="ltr">
                          {format(item.date, 'HH:mm')}
                          {item.endDate && isSameDay(item.date, item.endDate) ? `–${format(item.endDate, 'HH:mm')}` : ''}
                        </div>
                      )}
                      {!compact && view !== 'week' && item.location && height >= 64 && (
                        <div className={styles.evtMeta}>{item.location}</div>
                      )}
                    </div>
                  );
                })}
                {isToday(day) && getHours(nowTick) >= startHour && getHours(nowTick) < endHour && (
                  <div
                    ref={nowLineRef}
                    className={styles.nowLine}
                    style={{
                      top: `${(getHours(nowTick) - startHour) * slotHeight + (getMinutes(nowTick) / 60) * slotHeight}px`
                    }}
                  >
                    {view !== 'week' && <span className={styles.nowTime}>{format(nowTick, 'HH:mm')} · עכשיו</span>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </>
    );
  };

  const renderDayView = () => (
    <>
      <div className={`${styles.dayStrip} day-view-container`}>
        {eachDayOfInterval({
          start: startOfWeek(selectedDate, { weekStartsOn: 0 }),
          end: addDays(startOfWeek(selectedDate, { weekStartsOn: 0 }), 6),
        }).map((d) => (
          <div
            key={d.toISOString()}
            className={`${styles.dayI} ${isSameDay(d, selectedDate) ? styles.today : ''}`}
            onClick={() => setSelectedDate(d)}
          >
            <div className={styles.dayN}>{format(d, 'E', { locale })}</div>
            <div className={styles.dayD}>{format(d, 'd')}</div>
          </div>
        ))}
      </div>
      {renderGridCols([selectedDate], 'day')}
    </>
  );

  const render3Days = () => {
    const days = getDateRange();
    return (
      <>
        <div className={styles.dayHdr3}>
          <div className={styles.dhSpc}></div>
          {days.map((d) => (
            <div
              key={d.toISOString()}
              className={`${styles.dhDay} ${isToday(d) ? styles.today : ''}`}
              onClick={() => setSelectedDate(d)}
            >
              <div className={styles.dhName}>{format(d, 'E', { locale })}{isToday(d) ? ' · היום' : ''}</div>
              <div className={styles.dhNum}>{format(d, 'd')}</div>
            </div>
          ))}
        </div>
        {renderGridCols(days, '3days')}
      </>
    );
  };

  const renderWeek = () => {
    const days = getDateRange();
    return (
      <>
        <div className={`${styles.dayHdrWeek} week-view-container`}>
          <div></div>
          {days.map((d) => (
            <div
              key={d.toISOString()}
              role="columnheader"
              aria-label={format(d, 'EEEE', { locale: enUS })}
              className={`${styles.dhDay} ${isToday(d) ? styles.today : ''}`}
              onClick={() => setSelectedDate(d)}
            >
              <div className={styles.dhName}>{format(d, 'E', { locale })}</div>
              <div className={styles.dhNum}>{format(d, 'd')}</div>
            </div>
          ))}
        </div>
        {renderGridCols(days, 'week')}
      </>
    );
  };

  return (
    <div className={styles.wrapper} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className={styles.monthHero}>
        <div className={styles.mhTop}>
          <div>
            <div className={styles.mhYear}>{format(viewMode === 'month' ? currentDate : selectedDate, 'yyyy', { locale })}</div>
            <div className={styles.mhMonth}><em>{format(viewMode === 'month' ? currentDate : selectedDate, 'MMMM', { locale })}</em></div>
          </div>
          <div className={styles.mhNav}>
            <div className={styles.navBtn} onClick={() => nav('prev')}>›</div>
            <div className={styles.navBtn} onClick={() => nav('next')}>‹</div>
          </div>
        </div>
        <div className={styles.seg}>
          {[
            { id: 'day', label: 'יום', ariaLabel: 'Day View' },
            { id: '3days', label: '3 ימים', ariaLabel: '3 Days View' },
            { id: 'week', label: 'שבוע', ariaLabel: 'Week View' },
            { id: 'month', label: 'חודש', ariaLabel: 'Month View' },
            { id: 'list', label: 'לוח זמנים', ariaLabel: 'Schedule View' },
          ].map((m) => (
            <div
              key={m.id}
              role="button"
              aria-label={m.ariaLabel}
              className={`${styles.segI} ${viewMode === m.id ? styles.active : ''}`}
              onClick={() => setViewMode(m.id)}
            >
              {m.label}
            </div>
          ))}
        </div>
        {viewMode === 'day' && renderDayView()}
        {viewMode === '3days' && render3Days()}
        {viewMode === 'week' && renderWeek()}
      </div>

      {viewMode === 'month' && renderMonth()}
      {viewMode === 'list' && renderList()}
    </div>
  );
};
