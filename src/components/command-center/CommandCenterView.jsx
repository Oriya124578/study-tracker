import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Bot, Calendar as CalendarIcon, Clock, Sparkles, Trash2, Save,
  AlertTriangle, Plus, Check, MapPin,
  Coffee, Dumbbell, Utensils, ChevronLeft, ChevronRight, X, RefreshCw,
  Lock, Unlock, Moon, Sun
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useTranslation } from '../../hooks/useTranslation';
import { cn } from '../../lib/utils';
import { swrFetch } from '../../lib/cacheService';
import { dateKey } from '../../lib/caloriRepo';
import { generateDailySchedule, tuneSchedule } from '../../lib/gemini';
import { fetchShabbatTimes } from '../../lib/shabbatService';
import { calculateTravelTime } from '../../lib/mapsService';
import { format, parseISO, isValid, isSameDay, addDays, subDays } from 'date-fns';
import { he } from 'date-fns/locale';
import { toast } from '../../store/useToast';
import { CalendarView } from '../calendar/CalendarView';
import { CoachChatDrawer } from './CoachChatDrawer';

const parseToLocalTime = (timestamp) => {
  if (!timestamp) return '00:00';
  const parsed = parseISO(timestamp);
  return isValid(parsed) ? format(parsed, 'HH:mm') : timestamp.substring(11, 16);
};

export const CommandCenterView = () => {
  const {
    data,
    language,
    scheduleTask,
    unscheduleTask,
    saveDraftSchedule,
    clearDaySchedule,
    draftSchedule,
    setDraftSchedule,
    updatePersonalTask,
    updateEvent,
  } = useStore();

  const { t } = useTranslation();
  const isRTL = language === 'he';
  const locale = isRTL ? he : undefined;

  const [currentDate, setCurrentDate] = useState(new Date());
  const dateStr = useMemo(() => {
    const y = currentDate.getFullYear();
    const m = String(currentDate.getMonth() + 1).padStart(2, '0');
    const d = String(currentDate.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, [currentDate]);

  // UI state
  const [loading, setLoading] = useState(false);
  const [tuneCommand, setTuneCommand] = useState('');
  const [shabbatTimes, setShabbatTimes] = useState(null);
  const [activeSubTab, setActiveSubTab] = useState('schedule'); // 'schedule', 'calendar', 'pomodoro'
  const [gpsLocation, setGpsLocation] = useState(null);
  const [activeTaskTab, setActiveTaskTab] = useState('all'); // 'all' | 'high' | 'med' | 'low'
  const [timePickerModal, setTimePickerModal] = useState(null); // { taskId, title, hourStr } for manual slot assign
  const [isChatOpen, setIsChatOpen] = useState(false);
  const hasAttemptedAutoPlan = useRef(false);

  // Weather State
  const [weather, setWeather] = useState({ temp: null, min: null, max: null, city: null, loading: true, error: false, isNight: false });

  // Fetch weather and location (relocated to top of Personal Manager page)
  useEffect(() => {
    let mounted = true;
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        if (!mounted) return;
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        
        const cacheKey = `weather_geo_${lat.toFixed(2)}_${lon.toFixed(2)}`;
        
        const fetcher = async () => {
          const geoRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=he`);
          const geoData = await geoRes.json();
          const city = geoData.city || geoData.locality || 'מיקום נוכחי';

          const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min&timezone=auto`);
          const weatherData = await weatherRes.json();
          
          return {
            temp: Math.round(weatherData.current_weather.temperature),
            min: Math.round(weatherData.daily.temperature_2m_min[0]),
            max: Math.round(weatherData.daily.temperature_2m_max[0]),
            city,
            isNight: weatherData.current_weather.is_day === 0
          };
        };

        // Revalidate every 2 hours (2 * 60 * 60 * 1000)
        swrFetch(cacheKey, fetcher, (data) => {
          if (!mounted) return;
          setWeather({
            ...data,
            loading: false,
            error: false,
          });
        }, 2 * 60 * 60 * 1000).catch(() => {
          if (mounted) setWeather(w => ({ ...w, loading: false, error: true }));
        });
      }, () => {
        if (mounted) setWeather(w => ({ ...w, loading: false, error: true }));
      });
    } else {
      setWeather(w => ({ ...w, loading: false, error: true }));
    }
    return () => { mounted = false; };
  }, []);

  // Fetch Shabbat times based on GPS or settings
  useEffect(() => {
    let mounted = true;
    const loadShabbat = async () => {
      if (!data?.profile?.shabbatMode) {
        if (mounted) setShabbatTimes(null);
        return;
      }

      let locationParam = { city: data?.profile?.selectedCity || 'tel_aviv' };

      const onDataCb = (times) => {
        if (mounted) setShabbatTimes(times);
      };

      if (data?.profile?.useGPS) {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              if (!mounted) return;
              const coords = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              };
              setGpsLocation(coords);
              fetchShabbatTimes(coords, dateStr, onDataCb);
            },
            (err) => {
              console.warn('[GPS] Geolocation blocked or failed, using city fallback:', err);
              if (!mounted) return;
              fetchShabbatTimes(locationParam, dateStr, onDataCb);
            }
          );
          return;
        }
      }

      fetchShabbatTimes(locationParam, dateStr, onDataCb);
    };

    loadShabbat();
    return () => { mounted = false; };
  }, [data?.profile?.shabbatMode, data?.profile?.useGPS, data?.profile?.selectedCity, dateStr]);

  // Aggregate blocks for the timeline
  const timelineBlocks = useMemo(() => {
    // If there is an active draft, display the draft blocks (excluding breaks/leisure)
    if (draftSchedule?.blocks?.length > 0) {
      return draftSchedule.blocks.filter(
        (b) => b.type !== 'leisure' && !b.title?.includes('הפסקה') && !b.title?.toLowerCase().includes('break')
      );
    }

    const blocks = [];

    // 1. Fixed Events
    (data?.events || []).forEach((ev) => {
      // Check if event starts on the current date
      if (ev.start && ev.start.startsWith(dateStr)) {
        const startT = parseToLocalTime(ev.start);
        const endT = ev.end ? parseToLocalTime(ev.end) : '23:59';
        
        blocks.push({
          id: ev.id,
          type: ev.type || 'event',
          title: ev.title,
          startTime: startT,
          endTime: endT,
          isLocked: ev.isLocked !== undefined ? !!ev.isLocked : true,
          isProposed: !!ev.isProposed,
          notes: ev.notes || '',
        });
      }
    });

    // 2. Scheduled Tasks
    (data?.personalTasks || []).forEach((t) => {
      if (t.scheduledDate === dateStr && t.scheduledTime) {
        const duration = t.scheduledDuration || 60;
        const [h, m] = t.scheduledTime.split(':').map(Number);
        const endMinutes = h * 60 + m + duration;
        const endH = String(Math.floor(endMinutes / 60) % 24).padStart(2, '0');
        const endM = String(endMinutes % 60).padStart(2, '0');

        blocks.push({
          id: `task-${t.id}`,
          type: 'study',
          title: t.title,
          startTime: t.scheduledTime,
          endTime: `${endH}:${endM}`,
          duration,
          refId: t.id,
          isLocked: !!t.isLocked,
          isProposed: false,
          isCompleted: !!t.done,
          notes: t.notes || '',
        });
      }
    });

    // 3. Calori Logged Meals (point-in-time — no duration block)
    if (dateStr === dateKey()) {
      (data?.calori?.meals || []).forEach((meal) => {
        if (meal.timestamp) {
          const time = parseToLocalTime(meal.timestamp);
          blocks.push({
            id: `meal-${meal.id}`,
            type: 'meal',
            title: meal.name,
            startTime: time,
            endTime: time,
            refId: meal.id,
            isLocked: true,
            isProposed: false,
            isPointEvent: true,
            notes: `${meal.calories} ${t('caloriCalories')} | ${meal.protein}${t('gramsShort')} ${t('caloriProtein')}`,
          });
        }
      });

      // 4. Calori Logged Workouts
      (data?.calori?.workouts || []).forEach((w) => {
        if (w.timestamp) {
          const time = parseToLocalTime(w.timestamp);
          const duration = w.durationMinutes || 60;
          const [h, m] = time.split(':').map(Number);
          const endMinutes = h * 60 + m + duration;
          const endH = String(Math.floor(endMinutes / 60) % 24).padStart(2, '0');
          const endM = String(endMinutes % 60).padStart(2, '0');

          blocks.push({
            id: `workout-${w.id}`,
            type: 'workout',
            title: w.name,
            startTime: time,
            endTime: `${endH}:${endM}`,
            refId: w.id,
            isLocked: true,
            isProposed: false,
            notes: `+${w.caloriesBurned} ${t('caloriCalories')} | ${duration} ${t('caloriMinutes')}`,
          });
        }
      });
    }

    return blocks
      .filter((b) => b.type !== 'leisure' && !b.title?.includes('הפסקה') && !b.title?.toLowerCase().includes('break'))
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [data, dateStr, draftSchedule, t]);

  // Filter tasks in sidebar
  const sidebarTasks = useMemo(() => {
    return (data?.personalTasks || []).filter((task) => {
      // Show tasks that are not done and not scheduled for today (or not scheduled at all)
      const isScheduledForToday = task.scheduledDate === dateStr;
      if (task.done || isScheduledForToday) return false;

      if (activeTaskTab === 'high') return task.priority === 'high';
      if (activeTaskTab === 'med') return task.priority === 'med';
      if (activeTaskTab === 'low') return task.priority === 'low' || !task.priority;
      return true;
    });
  }, [data.personalTasks, dateStr, activeTaskTab]);

  // Coach Note (from profile or draft)
  const coachNote = useMemo(() => {
    if (draftSchedule?.coachNote) return draftSchedule.coachNote;
    return data?.profile?.coachNotes?.[dateStr] || '';
  }, [data?.profile?.coachNotes, draftSchedule, dateStr]);

  // Shabbat constraints indicator
  const shabbatBlockIndicator = useMemo(() => {
    if (!shabbatTimes) return null;
    const startObj = new Date(shabbatTimes.start);
    const endObj = new Date(shabbatTimes.end);
    
    const isFriday = isSameDay(currentDate, startObj);
    const isSaturday = isSameDay(currentDate, endObj);

    if (isFriday) {
      // 1 hour before Shabbat starts
      const blockStart = new Date(startObj.getTime() - 60 * 60 * 1000);
      return {
        type: 'shabbat_start',
        time: format(blockStart, 'HH:mm'),
        title: t('ccShabbatStartTitle'),
        desc: t('ccShabbatStartDesc').replace('{enter}', format(startObj, 'HH:mm')).replace('{lock}', format(blockStart, 'HH:mm')),
      };
    }

    if (isSaturday) {
      // 1 hour after Shabbat ends
      const blockEnd = new Date(endObj.getTime() + 60 * 60 * 1000);
      return {
        type: 'shabbat_end',
        time: format(blockEnd, 'HH:mm'),
        title: t('ccShabbatEndTitle'),
        desc: t('ccShabbatEndDesc').replace('{exit}', format(endObj, 'HH:mm')).replace('{unlock}', format(blockEnd, 'HH:mm')),
      };
    }

    return null;
  }, [shabbatTimes, currentDate, t]);

  const isTimeDuringShabbat = (timeStr) => {
    if (!data?.profile?.shabbatMode || !shabbatTimes) return false;
    
    const offset = shabbatTimes.start.substring(19) || '+02:00';
    const targetDate = new Date(`${dateStr}T${timeStr}:00${offset}`);
    if (!isValid(targetDate)) return false;

    const startObj = new Date(shabbatTimes.start);
    const endObj = new Date(shabbatTimes.end);

    const blockStart = new Date(startObj.getTime() - 60 * 60 * 1000);
    const blockEnd = new Date(endObj.getTime() + 60 * 60 * 1000);

    return targetDate >= blockStart && targetDate <= blockEnd;
  };

  // Day navigation
  const prevDay = () => setCurrentDate(subDays(currentDate, 1));
  const nextDay = () => setCurrentDate(addDays(currentDate, 1));
  const setToday = () => setCurrentDate(new Date());

  // Call Gemini to Auto-Plan
  const handleAutoPlan = useCallback(async () => {
    setLoading(true);
    try {
      const fixedEvents = [];
      const meals = [];

      // Collect fixed events
      (data?.events || []).forEach((ev) => {
        if (ev.start && ev.start.startsWith(dateStr)) {
          fixedEvents.push({
            id: ev.id,
            title: ev.title,
            start: parseToLocalTime(ev.start),
            end: ev.end ? parseToLocalTime(ev.end) : '23:59',
            location: ev.location || '',
          });
        }
      });

      // Calori data
      if (dateStr === dateKey()) {
        (data?.calori?.meals || []).forEach((m) => {
          meals.push({ name: m.name, time: parseToLocalTime(m.timestamp), calories: m.calories });
        });
      }

      // Collect planned coach workouts
      const plannedWorkouts = data?.calori?.coachSessions || [];

      // Upcoming exams sorted by date
      const upcomingExams = [];
      (data?.courses || []).forEach((course) => {
        ['moedA', 'moedB', 'moedC'].forEach((moed) => {
          const examDate = course[moed] || course.exams?.[moed];
          if (examDate) {
            const dt = parseISO(examDate);
            if (isValid(dt) && dt >= new Date()) {
              upcomingExams.push({
                course: course.name,
                moed: moed.replace('moed', ''),
                date: examDate.substring(0, 10),
              });
            }
          }
        });
      });

      const unscheduledTasks = sidebarTasks.map((t) => ({
        id: t.id,
        title: t.title,
        priority: t.priority || 'medium',
      }));

      // Calculate travel times dynamically if Google key is present

      for (const ev of fixedEvents) {
        if (ev.location) {
          // simple estimate or actual api call
          const travelDuration = await calculateTravelTime(gpsLocation || 'Tel Aviv', ev.location);
          fixedEvents.find(e => e.id === ev.id).travelTimeMinutes = travelDuration;
        }
      }

      const context = {
        todayDate: dateStr,
        dayOfWeek: format(currentDate, 'EEEE', { locale }),
        settings: {
          wakeTime: data?.profile?.wakeTime || '07:00',
          sleepTime: data?.profile?.sleepTime || '23:00',
          studyBlockDuration: data?.profile?.studyBlockDuration || 90,
          shabbatMode: !!data?.profile?.shabbatMode,
          studyPreferences: data?.profile?.studyPreferences || {},
        },
        shabbatTimes: shabbatTimes ? {
          start: shabbatTimes.start.substring(11, 16),
          end: shabbatTimes.end.substring(11, 16)
        } : null,
        fixedEvents,
        upcomingExams,
        tasks: unscheduledTasks,
        workouts: plannedWorkouts,
        meals,
      };

      const result = await generateDailySchedule(context);

      // Prefix draft block IDs to avoid collision before saving, filtering out breaks
      const processedBlocks = (result.blocks || [])
        .filter((b) => b.type !== 'leisure' && !b.title?.includes('הפסקה') && !b.title?.toLowerCase().includes('break'))
        .map((b) => ({
          ...b,
          id: b.id || `draft-${Math.random().toString(36).substring(2, 7)}`,
        }));

      setDraftSchedule({ blocks: processedBlocks, coachNote: result.coachNote });
      toast.success(t('ccDraftCreated'));
    } catch (err) {
      if (err.message === 'MISSING_GEMINI_KEY') {
        toast.error(t('ccMissingGeminiKey'));
      } else {
        toast.error(t('ccPlanError'));
      }
    } finally {
      setLoading(false);
    }
  }, [data, dateStr, sidebarTasks, gpsLocation, currentDate, locale, shabbatTimes, setDraftSchedule, t]);

  // Auto-plan on first load if no plan exists yet
  useEffect(() => {
    if (hasAttemptedAutoPlan.current) return;

    // Check if there are any events proposed by AI for today
    const hasProposedEvents = (data?.events || []).some(
      (ev) => ev.start && ev.start.startsWith(dateStr) && ev.isProposed
    );
    const hasDraft = draftSchedule?.blocks?.length > 0;

    if (dateStr === dateKey() && !hasProposedEvents && !hasDraft && !loading) {
      hasAttemptedAutoPlan.current = true;
      handleAutoPlan();
    }
  }, [dateStr, data?.events, draftSchedule, loading, handleAutoPlan]);

  // Tune schedule with input query
  const handleTuneSchedule = async (cmdOverride) => {
    const cmd = typeof cmdOverride === 'string' ? cmdOverride : tuneCommand;
    if (!cmd || !cmd.trim()) return;
    setLoading(true);
    try {
      const context = {
        settings: {
          wakeTime: data?.profile?.wakeTime || '07:00',
          sleepTime: data?.profile?.sleepTime || '23:00',
        },
        shabbatTimes: shabbatTimes ? {
          start: shabbatTimes.start.substring(11, 16),
          end: shabbatTimes.end.substring(11, 16)
        } : null,
      };

      const result = await tuneSchedule(timelineBlocks, cmd, context);
      
      const processedBlocks = (result.blocks || [])
        .filter((b) => b.type !== 'leisure' && !b.title?.includes('הפסקה') && !b.title?.toLowerCase().includes('break'))
        .map((b) => ({
          ...b,
          id: b.id || `draft-${Math.random().toString(36).substring(2, 7)}`,
        }));

      setDraftSchedule({ blocks: processedBlocks, coachNote: result.coachNote });
      if (!cmdOverride) setTuneCommand('');
      toast.success(t('ccTuneSuccess'));
    } catch {
      toast.error(t('ccTuneError'));
    } finally {
      setLoading(false);
    }
  };

  // Save the schedule Draft to Firestore
  const handleSaveSchedule = async () => {
    setLoading(true);
    try {
      await saveDraftSchedule(dateStr, draftSchedule.blocks, draftSchedule.coachNote);
      toast.success(t('ccSaveSuccess'));
    } catch {
      toast.error(t('ccSaveError'));
    } finally {
      setLoading(false);
    }
  };

  // Clear day schedule
  const handleClearSchedule = async () => {
    if (window.confirm(t('ccConfirmClearSchedule'))) {
      setLoading(true);
      try {
        await clearDaySchedule(dateStr);
        setDraftSchedule({ blocks: [], coachNote: '' });
        toast.success(t('ccClearSuccess'));
      } catch {
        toast.error(t('ccClearError'));
      } finally {
        setLoading(false);
      }
    }
  };

  // Manual scheduling via Time Picker
  const handleManualSchedule = (taskId, startTime) => {
    if (!startTime) return;
    if (isTimeDuringShabbat(startTime)) {
      toast.error(t('ccCannotScheduleShabbat', 'לא ניתן לשבץ משימות במהלך השבת'));
      return;
    }
    const duration = data?.profile?.studyBlockDuration || 90;
    scheduleTask(taskId, dateStr, startTime, duration);
    setTimePickerModal(null);
    toast.success(t('ccTaskScheduled'));
  };

  // Drag and Drop implementation
  const handleDragStart = (e, task) => {
    e.dataTransfer.setData('text/plain', task.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleTimelineBlockDragStart = (e, block) => {
    e.dataTransfer.setData('sourceBlockId', block.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, hourStr) => {
    e.preventDefault();
    if (isTimeDuringShabbat(hourStr)) {
      toast.error(t('ccCannotScheduleShabbat', 'לא ניתן לשבץ משימות במהלך השבת'));
      return;
    }
    const taskId = e.dataTransfer.getData('text/plain');
    const sourceBlockId = e.dataTransfer.getData('sourceBlockId');

    if (sourceBlockId) {
      // Dragged an existing block inside the timeline
      if (sourceBlockId.startsWith('draft-')) {
        // Dragged a draft block
        const updatedBlocks = (draftSchedule?.blocks || []).map(b => {
          if (b.id === sourceBlockId) {
            const duration = b.duration || 60;
            const [h, m] = hourStr.split(':').map(Number);
            const endMin = h * 60 + m + duration;
            const endH = String(Math.floor(endMin / 60) % 24).padStart(2, '0');
            const endM = String(endMin % 60).padStart(2, '0');
            return {
              ...b,
              startTime: hourStr,
              endTime: `${endH}:${endM}`
            };
          }
          return b;
        }).sort((a, b) => a.startTime.localeCompare(b.startTime));
        setDraftSchedule({ ...draftSchedule, blocks: updatedBlocks });
        toast.success(t('ccTaskScheduledAtTime').replace('{time}', hourStr));
      } else if (sourceBlockId.startsWith('task-')) {
        // Dragged a scheduled task block
        const refId = sourceBlockId.replace('task-', '');
        const task = data?.personalTasks?.find(t => t.id === refId);
        const duration = task?.scheduledDuration || 60;
        scheduleTask(refId, dateStr, hourStr, duration);
        toast.success(t('ccTaskScheduledAtTime').replace('{time}', hourStr));
      }
    } else if (taskId) {
      // Dragged a task from the sidebar tray
      const task = data?.personalTasks?.find(t => t.id === taskId);
      const duration = task?.scheduledDuration || data?.profile?.studyBlockDuration || 90;
      scheduleTask(taskId, dateStr, hourStr, duration);
      toast.success(t('ccTaskScheduledAtTime').replace('{time}', hourStr));
    }
  };

  // Toggle Lock/Unlock on scheduled blocks
  const toggleBlockLock = (block) => {
    if (block.id.startsWith('draft-')) {
      const updatedBlocks = (draftSchedule?.blocks || []).map(b => 
        b.id === block.id ? { ...b, isLocked: !b.isLocked } : b
      );
      setDraftSchedule({ ...draftSchedule, blocks: updatedBlocks });
      toast.success(!block.isLocked ? 'הבלוק ננעל לשינויי AI' : 'הבלוק שוחרר מנעילה');
    } else if (block.id.startsWith('task-')) {
      const task = data?.personalTasks?.find(t => t.id === block.refId);
      updatePersonalTask(block.refId, { isLocked: !task?.isLocked });
      toast.success(!task?.isLocked ? 'הבלוק ננעל לשינויי AI' : 'הבלוק שוחרר מנעילה');
    } else {
      // Personal event
      const ev = data?.events?.find(e => e.id === block.id);
      if (ev) {
        updateEvent(block.id, { isLocked: !ev.isLocked });
        toast.success(!ev.isLocked ? 'הבלוק ננעל לשינויי AI' : 'הבלוק שוחרר מנעילה');
      }
    }
  };

  // Check if an hour is covered by a block starting earlier
  const isHourCovered = (hourStr) => {
    const [h, m] = hourStr.split(':').map(Number);
    const hourMinutes = h * 60 + m;

    return timelineBlocks.some(b => {
      if (b.isPointEvent || b.startTime === b.endTime) return false;
      const [startH, startM] = b.startTime.split(':').map(Number);
      const [endH, endM] = b.endTime.split(':').map(Number);
      const startMinutes = startH * 60 + startM;
      const endMinutes = endH * 60 + endM;

      return startMinutes < hourMinutes && endMinutes > hourMinutes;
    });
  };

  // Get blocks starting in the hour interval
  const getBlocksStartingAtHour = (hourStr) => {
    const [h, m] = hourStr.split(':').map(Number);
    const hourMinutes = h * 60 + m;

    return timelineBlocks.filter(b => {
      const [startH, startM] = b.startTime.split(':').map(Number);
      const startMinutes = startH * 60 + startM;
      return startMinutes >= hourMinutes && startMinutes < hourMinutes + 60;
    });
  };

  // Generate 24-hour array for drops and slots
  const hoursRange = useMemo(() => {
    const hours = [];
    const startHour = parseInt((data?.profile?.wakeTime || '07:00').split(':')[0]);
    const endHour = parseInt((data?.profile?.sleepTime || '23:00').split(':')[0]);

    for (let i = startHour; i <= endHour; i++) {
      hours.push(String(i).padStart(2, '0') + ':00');
    }
    return hours;
  }, [data?.profile?.wakeTime, data?.profile?.sleepTime]);

  const blockColors = {
    sleep: 'border-slate-500/20 bg-slate-500/5 text-slate-400',
    study: 'border-blue-500/20 bg-blue-500/5 text-blue-600 dark:text-blue-400',
    event: 'border-slate-500/20 bg-card text-foreground',
    meal: 'border-[#059669]/20 bg-[#D1FAE5]/40 text-[#059669] dark:bg-[#059669]/10 dark:text-[#34D399]',
    workout: 'border-[#7C3AED]/20 bg-purple-100/40 text-[#7C3AED] dark:bg-purple-900/20 dark:text-[#A78BFA]',
    travel: 'border-amber-500/20 bg-amber-500/5 text-amber-600 dark:text-amber-400',
    leisure: 'border-rose-500/20 bg-rose-500/5 text-rose-500 dark:text-rose-400',
  };

  const blockIcons = {
    sleep: Clock,
    study: CalendarIcon,
    event: CalendarIcon,
    meal: Utensils,
    workout: Dumbbell,
    travel: MapPin,
    leisure: Coffee,
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-5 sm:px-6 space-y-6 animate-in fade-in duration-300 pb-28" dir={isRTL ? 'rtl' : 'ltr'}>
      
      {/* Date Header Navigator */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
            <Bot className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-foreground">{t('ccTitle')}</h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <p className="text-xs text-muted-foreground">{t('ccSubtitle')}</p>
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground bg-muted/40 px-2.5 py-0.5 rounded-full border border-border/30">
                {weather.loading ? (
                  <span className="animate-pulse">מאתר מיקום...</span>
                ) : weather.error ? (
                  <span>מיקום לא זמין</span>
                ) : (
                  <>
                    <MapPin className="w-3 h-3 text-primary/70" />
                    <span className="max-w-[100px] truncate">{weather.city}</span>
                    <span className="mx-0.5 opacity-60">•</span>
                    <span>{weather.min}° - {weather.max}°</span>
                    {weather.isNight ? <Moon className="w-3 h-3 text-indigo-400" /> : <Sun className="w-3 h-3 text-amber-500" />}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Date Selector (Only shown in 'schedule' tab) */}
        {activeSubTab === 'schedule' && (
          <div className="flex flex-wrap items-center justify-center gap-3 animate-in fade-in duration-200">
            <button onClick={prevDay} className="p-2 border rounded-full bg-card hover:bg-muted active:scale-95 transition-all">
              <ChevronRight className="w-4 h-4" />
            </button>
            <button onClick={setToday} className="px-4 py-1.5 border rounded-2xl bg-card hover:bg-muted font-semibold text-xs active:scale-95 transition-all">
              {t('today')}
            </button>
            <span className="font-bold text-foreground text-sm min-w-[120px] text-center">
              {format(currentDate, 'EEEE, d MMMM', { locale })}
            </span>
            <button onClick={nextDay} className="p-2 border rounded-full bg-card hover:bg-muted active:scale-95 transition-all">
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Sub-Tabs Switcher */}
      <div className="flex bg-muted p-1 rounded-2xl gap-1 w-full sm:max-w-md mx-auto select-none border border-border/20">
        <button
          onClick={() => setActiveSubTab('schedule')}
          className={cn(
            "flex-1 text-center py-2 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer",
            activeSubTab === 'schedule'
              ? "bg-background text-foreground shadow"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {t('ccHourlyTimeline', 'לוז יומי')}
        </button>
        <button
          onClick={() => setActiveSubTab('calendar')}
          className={cn(
            "flex-1 text-center py-2 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer",
            activeSubTab === 'calendar'
              ? "bg-background text-foreground shadow"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {t('navCalendar', 'לוח שנה')}
        </button>
      </div>

      {/* Main Content: Conditional based on activeSubTab */}
      {activeSubTab === 'schedule' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start animate-in fade-in duration-200">
        
        {/* Left/Middle: Timeline (Spans 2 columns) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Coach Note Panel (Clickable to open Chat) */}
          {coachNote && (
            <div 
              onClick={() => setIsChatOpen(true)}
              className="relative overflow-hidden rounded-3xl border border-primary/20 bg-primary/5 p-4 animate-in slide-in-from-top-4 duration-500 cursor-pointer hover:bg-primary/10 transition-all select-none"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-xl" />
              <div className="flex gap-2.5 items-start">
                <Bot className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-primary uppercase tracking-wider">{t('ccCoachNote')}</h4>
                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20 animate-pulse">שיחה עם המאמן 💬</span>
                  </div>
                  <p className="text-sm text-foreground/90 font-medium mt-1 leading-relaxed">{coachNote}</p>
                </div>
              </div>
            </div>
          )}

          {/* Shabbat Warning */}
          {shabbatBlockIndicator && (
            <div className="rounded-3xl border border-amber-500/20 bg-amber-500/5 p-4 flex gap-3 items-center">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-amber-600">{shabbatBlockIndicator.title}</h4>
                <p className="text-xs text-muted-foreground mt-0.5">{shabbatBlockIndicator.desc}</p>
              </div>
            </div>
          )}

          {/* Timeline Card */}
          <div className="rounded-3xl border border-border bg-card p-4 sm:p-6 shadow-sm space-y-4">
            
            {/* Header / Actions */}
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-foreground">{t('ccHourlyTimeline')}</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsChatOpen(true)}
                  className="px-3 py-1.5 rounded-2xl bg-[#2563EB] text-white hover:bg-[#2563EB]/90 active:scale-95 transition-all text-xs font-bold flex items-center gap-1 shadow-sm cursor-pointer"
                >
                  <Bot className="w-3.5 h-3.5" />
                  שיחה עם המאמן
                </button>
                {draftSchedule?.blocks?.length > 0 ? (
                  <>
                    <button
                      onClick={handleSaveSchedule}
                      className="px-3 py-1.5 rounded-2xl bg-[#059669] text-white hover:bg-[#059669]/90 active:scale-95 transition-all text-xs font-bold flex items-center gap-1 shadow-sm"
                    >
                      <Save className="w-3.5 h-3.5" />
                      {t('ccSaveSchedule')}
                    </button>
                    <button
                      onClick={() => setDraftSchedule({ blocks: [], coachNote: '' })}
                      className="px-3 py-1.5 rounded-2xl bg-secondary text-foreground hover:bg-muted active:scale-95 transition-all text-xs font-bold flex items-center gap-1 border border-border"
                    >
                      <X className="w-3.5 h-3.5" />
                      {t('ccDiscardDraft')}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleAutoPlan}
                      disabled={loading}
                      className="px-3 py-1.5 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 transition-all text-xs font-bold flex items-center gap-1 shadow-sm"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      {loading ? t('ccPlanning') : t('ccOrganizeWithAi')}
                    </button>
                    {timelineBlocks.length > 0 && (
                      <button
                        onClick={handleClearSchedule}
                        className="p-1.5 rounded-xl border border-border bg-card text-muted-foreground hover:text-destructive active:scale-95 transition-all"
                        title={t('ccClearDaySchedule')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Time Slots Layout (Hourly Planner Grid) */}
            <div className="space-y-2 relative">
              <div className="divide-y divide-border/40 border border-border/80 rounded-3xl overflow-hidden bg-background">
                {hoursRange.map((hour) => {
                  const isCovered = isHourCovered(hour);
                  if (isCovered) return null;

                  const hourBlocks = getBlocksStartingAtHour(hour);

                  return (
                    <div 
                      key={hour}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, hour)}
                      className="flex gap-4 p-3 sm:p-4 items-stretch min-h-[4.5rem] relative hover:bg-muted/10 transition-colors"
                    >
                      {/* Hour Indicator */}
                      <div className="w-12 flex items-center justify-start text-[11px] font-black text-muted-foreground/60 shrink-0 select-none border-e border-border/20 pe-2" dir="ltr">
                        {hour}
                      </div>

                      {/* Content area */}
                      <div className="flex-1 flex flex-col gap-2.5 justify-center">
                        {hourBlocks.length > 0 ? (
                          hourBlocks.map((block) => {
                            const Icon = blockIcons[block.type] || CalendarIcon;
                            return (
                              <div
                                key={block.id}
                                draggable={!block.isLocked}
                                onDragStart={(e) => handleTimelineBlockDragStart(e, block)}
                                className={cn(
                                  'p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm transition-all',
                                  blockColors[block.type] || 'border-border bg-card',
                                  !block.isLocked && 'cursor-grab active:cursor-grabbing hover:shadow-md'
                                )}
                              >
                                <div className="flex gap-3 items-center min-w-0">
                                  <div className="w-8 h-8 rounded-xl bg-background/50 flex items-center justify-center shrink-0 border border-border/20">
                                    <Icon className="w-4 h-4" />
                                  </div>
                                  <div className="min-w-0 text-start">
                                    <h4 className="font-bold text-sm truncate text-foreground">{block.title}</h4>
                                    {block.notes && <p className="text-xs opacity-75 mt-0.5 truncate">{block.notes}</p>}
                                  </div>
                                </div>
                                
                                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                                  {block.isProposed && (
                                    <span className="text-[10px] font-bold bg-primary/10 text-primary border border-primary/10 px-2 py-0.5 rounded-full shrink-0">
                                      {t('ccAiProposal')}
                                    </span>
                                  )}

                                  {/* Lock / Unlock Toggle Button */}
                                  <button
                                    onClick={() => toggleBlockLock(block)}
                                    className={cn(
                                      "p-1.5 rounded-lg transition-colors border active:scale-90 cursor-pointer",
                                      block.isLocked
                                        ? "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
                                        : "bg-muted text-muted-foreground border-border/60 hover:bg-muted/80 hover:text-foreground"
                                    )}
                                    title={block.isLocked ? "נעול לשינויי AI (לחץ לפתיחה)" : "פתוח לשינויי AI (לחץ לנעילה)"}
                                  >
                                    {block.isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                                  </button>

                                  <div className="flex items-center gap-1 text-xs font-semibold whitespace-nowrap">
                                    <Clock className="w-3.5 h-3.5 opacity-60" />
                                    {/* Meals are point-in-time, workouts/events show range */}
                                    <span>{block.type === 'meal' || block.startTime === block.endTime
                                      ? block.startTime
                                      : `${block.startTime} - ${block.endTime}`}</span>
                                  </div>
                                  
                                  {/* Complete task button if block is a task */}
                                  {!block.isLocked && block.refId && block.id.startsWith('task-') && (
                                    <button
                                      onClick={() => useStore.getState().togglePersonalTask(block.refId)}
                                      className={cn(
                                        'w-6 h-6 rounded-full border flex items-center justify-center active:scale-90 transition-all cursor-pointer',
                                        block.isCompleted
                                          ? 'bg-[#059669] border-[#059669] text-white'
                                          : 'border-slate-300 dark:border-slate-700 hover:border-[#059669]'
                                      )}
                                    >
                                      {block.isCompleted && <Check className="w-4 h-4 stroke-[3]" />}
                                    </button>
                                  )}
                                  
                                  {/* Unschedule button */}
                                  {!block.isLocked && block.refId && block.id.startsWith('task-') && (
                                    <button
                                      onClick={() => unscheduleTask(block.refId)}
                                      className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-secondary rounded-lg transition-colors cursor-pointer"
                                      title={t('ccRemoveFromSchedule')}
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div 
                            onClick={() => {
                              setTimePickerModal({ hourStr: hour });
                            }}
                            className="group h-full flex items-center justify-between text-xs text-muted-foreground/35 hover:text-primary hover:bg-primary/5 border border-dashed border-transparent hover:border-primary/20 rounded-xl px-4 py-2.5 transition-all cursor-pointer select-none"
                          >
                            <span className="font-semibold text-[11px] opacity-0 group-hover:opacity-100 transition-opacity">
                              + שבץ משימה ידנית לשעה זו
                            </span>
                            <span className="opacity-0 group-hover:opacity-100 text-[10px] font-bold text-primary transition-opacity flex items-center gap-1">
                              <Plus className="w-3.5 h-3.5" />
                              גרור משימה לכאן
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* AI Tuner Chat Console */}
          {timelineBlocks.length > 0 && (
            <div className="rounded-3xl border border-border bg-card p-5 shadow-sm space-y-4">
              <h3 className="font-bold text-foreground flex items-center gap-1.5 text-sm">
                <Sparkles className="w-4 h-4 text-primary shrink-0" />
                {t('ccTuneWithAi')}
              </h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tuneCommand}
                  onChange={(e) => setTuneCommand(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleTuneSchedule()}
                  placeholder={t('ccTunePlaceholder')}
                  className="flex-1 rounded-2xl border border-border bg-secondary/50 px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent text-start"
                  disabled={loading}
                />
                <button
                  onClick={handleTuneSchedule}
                  disabled={loading || !tuneCommand.trim()}
                  className="px-4 py-2 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 transition-all text-xs font-bold"
                >
                  {t('ccSend')}
                </button>
              </div>

              {/* Suggestion Quick Chips */}
              <div className="flex flex-wrap gap-2 pt-1">
                {[
                  t('ccChipTired'),
                  t('ccChipStudyMorning'),
                  t('ccChipWorkoutEvening'),
                  t('ccChipSpreadTasks')
                ].map((cmd) => (
                  <button
                    key={cmd}
                    onClick={() => {
                      setTuneCommand(cmd);
                    }}
                    className="px-3 py-1 rounded-full border border-border bg-muted/30 text-[11px] text-muted-foreground hover:text-foreground hover:border-primary/45 transition-colors font-medium active:scale-95"
                  >
                    {cmd}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Sidebar - Unscheduled Tasks Tray */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-3xl border border-border bg-card p-5 shadow-sm space-y-4">
            
            {/* Header */}
            <div>
              <h3 className="font-bold text-foreground">{t('ccUnscheduledTray')}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{t('ccUnscheduledTrayHint')}</p>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-1 border-b pb-1">
              {[
                { key: 'all', label: t('ccFilterAll') },
                { key: 'high', label: t('priorityHigh') },
                { key: 'med', label: t('priorityMed') },
                { key: 'low', label: t('priorityLow') },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTaskTab(tab.key)}
                  className={cn(
                    'flex-1 text-center py-1 text-xs font-bold rounded-lg transition-colors border border-transparent',
                    activeTaskTab === tab.key
                      ? 'bg-secondary text-foreground border-border'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tasks list */}
            <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
              {sidebarTasks.length > 0 ? (
                sidebarTasks.map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task)}
                    className="p-3 border border-border rounded-2xl bg-muted/20 hover:bg-muted/40 transition-colors flex items-center justify-between gap-3 cursor-grab active:cursor-grabbing group"
                  >
                    <div className="flex items-center gap-2 min-w-0 text-start">
                      <span className={cn(
                        'w-2 h-2 rounded-full shrink-0',
                        task.priority === 'high' ? 'bg-red-500' : task.priority === 'med' ? 'bg-amber-500' : 'bg-slate-400'
                      )} />
                      <p className="text-xs font-semibold truncate text-foreground">{task.title}</p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setTimePickerModal({ taskId: task.id, title: task.title })}
                        className="p-1 rounded bg-background border hover:border-primary text-primary transition-all active:scale-90"
                        title={t('ccManualSchedule')}
                      >
                        <Clock className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground text-xs">
                  {t('ccNoUnscheduledTasks')}
                </div>
              )}
            </div>

            {/* Quick manual block generator */}
            <button
              onClick={() => {
                const label = window.prompt(t('ccEnterBlockTitle'));
                if (label) {
                  const id = `task-${Date.now()}`;
                  // Create a custom temporary task to schedule
                  useStore.getState().addQuickNote({
                    title: label,
                    content: t('ccManualStudyBlock'),
                  });
                  // Show modal to schedule it
                  setTimePickerModal({ taskId: id, title: label });
                }
              }}
              className="w-full py-2.5 rounded-2xl border border-dashed border-border hover:border-primary text-xs font-bold text-muted-foreground hover:text-primary transition-all flex items-center justify-center gap-1"
            >
              <Plus className="w-4 h-4" />
              {t('ccAddCustomBlock')}
            </button>
          </div>
        </div>
      </div>
      ) : activeSubTab === 'calendar' && (
        <div className="animate-in fade-in duration-200 bg-card border border-border p-4 rounded-3xl shadow-sm">
          <CalendarView />
        </div>
      )}

      {/* Manual Time Picker Dialog (Upgraded to support dual direction) */}
      {timePickerModal && timePickerModal.taskId && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-card border border-border p-6 rounded-3xl max-w-sm w-full shadow-lg space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-foreground">{t('ccPickStartTime')}</h3>
              <button
                onClick={() => setTimePickerModal(null)}
                className="p-1 hover:bg-secondary rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground">{t('ccScheduleTaskForDay').replace('{title}', timePickerModal.title)}</p>
            
            <div className="grid grid-cols-3 gap-2 max-h-[200px] overflow-y-auto py-1">
              {hoursRange.map((hour) => (
                <button
                  key={hour}
                  onClick={() => handleManualSchedule(timePickerModal.taskId, hour)}
                  className="py-2 border border-border rounded-xl bg-card hover:bg-primary hover:text-primary-foreground hover:border-primary active:scale-95 transition-all text-xs font-bold"
                >
                  {hour}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {timePickerModal && timePickerModal.hourStr && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-card border border-border p-6 rounded-3xl max-w-md w-full shadow-lg space-y-4 animate-in zoom-in-95 duration-200" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-foreground">שבץ משימה לשעה {timePickerModal.hourStr}</h3>
              <button
                onClick={() => setTimePickerModal(null)}
                className="p-1 hover:bg-secondary rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 py-1">
              {sidebarTasks.length > 0 ? (
                sidebarTasks.map((task) => (
                  <button
                    key={task.id}
                    onClick={() => {
                      if (isTimeDuringShabbat(timePickerModal.hourStr)) {
                        toast.error(t('ccCannotScheduleShabbat', 'לא ניתן לשבץ משימות במהלך השבת'));
                        return;
                      }
                      const duration = task.scheduledDuration || data?.profile?.studyBlockDuration || 90;
                      scheduleTask(task.id, dateStr, timePickerModal.hourStr, duration);
                      setTimePickerModal(null);
                      toast.success(t('ccTaskScheduled'));
                    }}
                    className="w-full text-start p-3 border border-border rounded-2xl hover:bg-primary/5 hover:border-primary/30 transition-all flex items-center gap-3"
                  >
                    <span className={cn(
                      'w-2 h-2 rounded-full shrink-0',
                      task.priority === 'high' ? 'bg-red-500' : task.priority === 'med' ? 'bg-amber-500' : 'bg-slate-400'
                    )} />
                    <span className="text-sm font-semibold text-foreground truncate">{task.title}</span>
                  </button>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  אין משימות לא משובצות.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Interactive Coach Chat Drawer */}
      <CoachChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        dateStr={dateStr}
        shabbatTimes={shabbatTimes}
        onReplan={handleTuneSchedule}
      />

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-background/50 backdrop-blur-md z-[110] flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-8 h-8 text-primary animate-spin" />
          <p className="text-sm font-black text-foreground">{t('ccAiCalculating')}</p>
        </div>
      )}
    </div>
  );
};
