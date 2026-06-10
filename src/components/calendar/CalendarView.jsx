import React, { useState, useMemo, useEffect } from 'react';
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
            const dots = dayItems.filter((_, i) => i < 3);
            const tags = dayItems.filter((item) => item.allDay || item.title.length < 10);
            const topTag = tags.length > 0 ? tags[0] : null;

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
                {topTag && (
                  <div className={`${styles.cTag} ${getTagClass(topTag.kind)}`}>
                    {topTag.title}
                  </div>
                )}
                {!topTag && dots.length > 0 && (
                  <div className={styles.cDots}>
                    {dots.map((item, i) => (
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
                  <div className={styles.itemMeta}>{item.location || (item.endDate ? format(item.endDate, 'HH:mm') : '')}</div>
                </div>
                <button aria-label="Edit" disabled={item.isLocked} style={{ marginLeft: 'auto', background: 'transparent', border: '1px solid #ccc', borderRadius: '4px', padding: '4px 8px', cursor: item.isLocked ? 'not-allowed' : 'pointer' }}>Edit</button>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  const renderGridCols = (days, view) => {
    const hours = Array.from({ length: 18 }, (_, i) => i + 6); // 06:00 to 23:00
    const slotHeight = 60; // 60px per hour
    const startHour = 6;

    return (
      <div className={view === 'week' ? styles.gridWeek : styles.grid3}>
        <div className={styles.tCol}>
          {hours.map((h) => (
            <div key={h} className={styles.tRow}>
              <div className={styles.tl}>{`${h.toString().padStart(2, '0')}:00`}</div>
            </div>
          ))}
        </div>
        {days.map((day) => {
          const dayItems = itemsForDay(day);
          return (
            <div key={day.toISOString()} className={styles.tCol} style={{ position: 'relative' }}>
              {hours.map((h) => (
                <div key={h} className={`${styles.tRow} ${styles.dc}`}></div>
              ))}
              {dayItems.map((item) => {
                let top = 0;
                let height = slotHeight;
                if (!item.allDay && item.date) {
                  const h = getHours(item.date);
                  const m = getMinutes(item.date);
                  top = (h - startHour) * slotHeight + (m / 60) * slotHeight;
                  if (item.endDate) {
                    const diffMs = item.endDate - item.date;
                    height = (diffMs / (1000 * 60 * 60)) * slotHeight;
                  }
                }
                // Cap bounds
                if (top < 0) top = 0;
                if (height < 20) height = 20;

                return (
                  <div
                    key={item.id}
                    className={`${styles.evt} ${getEventClass(item.kind)}`}
                    style={{ top: `${top}px`, height: `${height}px` }}
                  >
                    <div className={styles.evtName}>{item.title}</div>
                    {view !== 'week' && <div className={styles.evtMeta}>{item.location}</div>}
                  </div>
                );
              })}
              {isToday(day) && (
                <div
                  className={styles.nowLine}
                  style={{
                    top: `${(getHours(new Date()) - startHour) * slotHeight + (getMinutes(new Date()) / 60) * slotHeight}px`
                  }}
                >
                  {view !== 'week' && <span className={styles.nowTime}>{format(new Date(), 'HH:mm')} · עכשיו</span>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderDayView = () => {
    const hours = Array.from({ length: 18 }, (_, i) => i + 6);
    const startHour = 6;
    const slotHeight = 60;
    const dayItems = itemsForDay(selectedDate);

    return (
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
        <div className={styles.rail}>
          {hours.map((h) => (
            <div key={h} className={styles.tslot}>
              <div className={styles.tLabel}>{`${h.toString().padStart(2, '0')}:00`}</div>
              <div className={styles.tArea}>
                {dayItems
                  .filter((item) => getHours(item.date) === h)
                  .map((item) => {
                    const m = getMinutes(item.date);
                    const top = (m / 60) * slotHeight;
                    let height = slotHeight;
                    if (item.endDate) {
                      const diffMs = item.endDate - item.date;
                      height = (diffMs / (1000 * 60 * 60)) * slotHeight;
                    }
                    if (height < 20) height = 20;

                    return (
                      <div
                        key={item.id}
                        className={`${styles.evt} ${getEventClass(item.kind)}`}
                        style={{ top: `${top}px`, height: `${height}px` }}
                      >
                        <div className={styles.evtName}>{item.title}</div>
                        <div className={styles.evtMeta}>{item.location || (item.endDate ? format(item.endDate, 'HH:mm') : '')}</div>
                      </div>
                    );
                  })}
                {isToday(selectedDate) && getHours(new Date()) === h && (
                  <div
                    className={styles.nowLine}
                    style={{ top: `${(getMinutes(new Date()) / 60) * slotHeight}px` }}
                  >
                    <span className={styles.nowTime}>{format(new Date(), 'HH:mm')} · עכשיו</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </>
    );
  };

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
            <div className={styles.mhYear}>{format(currentDate, 'yyyy', { locale })}</div>
            <div className={styles.mhMonth}><em>{format(currentDate, 'MMMM', { locale })}</em></div>
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
