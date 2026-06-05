import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '../../store/useStore';
import { useTranslation } from '../../hooks/useTranslation';
import { 
  Play, Check, X, Clock, Sparkles, AlertTriangle, 
  Calendar as CalendarIcon, Coffee, Dumbbell, Utensils, 
  MapPin, RefreshCw, Target
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { fetchShabbatTimes } from '../../lib/shabbatService';
import { cn } from '../../lib/utils';
import { parseISO, isValid, format } from 'date-fns';
import { buildTimeline } from '../../lib/scheduleBuilder';
import { dateKey } from '../../lib/caloriRepo';

const blockIcons = {
  sleep: Clock,
  study: Target,
  event: CalendarIcon,
  meal: Utensils,
  workout: Dumbbell,
  travel: MapPin,
  leisure: Coffee,
};

const blockColors = {
  sleep: 'border-slate-500/20 bg-slate-500/5 text-slate-400',
  study: 'border-blue-500/20 bg-blue-500/5 text-blue-600 dark:text-blue-400',
  event: 'border-slate-500/20 bg-card text-foreground',
  meal: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400',
  workout: 'border-purple-500/20 bg-purple-500/5 text-purple-600 dark:text-purple-400',
  travel: 'border-amber-500/20 bg-amber-500/5 text-amber-600 dark:text-amber-400',
  leisure: 'border-rose-500/20 bg-rose-500/5 text-rose-600 dark:text-rose-400',
};

export const FocusHub = () => {
  const { t, language } = useTranslation();
  const isRTL = language === 'he';

  const {
    data,
    focusTracking,
    startFocusTracking,
    setFocusElapsed,
    resetFocusTracking,
    finishFocusTracking,
    interruptFocusTracking,
  } = useStore();

  const [showStatusModal, setShowStatusModal] = useState(false);
  const [shabbatTimes, setShabbatTimes] = useState(null);
  const [gpsLocation, setGpsLocation] = useState(null);
  const [rescheduling, setRescheduling] = useState(false);

  // Get current date string (YYYY-MM-DD)
  const dateStr = useMemo(() => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, []);

  // Fetch Shabbat times for today to pass to background rescheduling if interrupted
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

      if (data?.profile?.useGPS && navigator.geolocation) {
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
          () => {
            if (!mounted) return;
            fetchShabbatTimes(locationParam, dateStr, onDataCb);
          }
        );
        return;
      }
      fetchShabbatTimes(locationParam, dateStr, onDataCb);
    };
    loadShabbat();
    return () => { mounted = false; };
  }, [data?.profile?.shabbatMode, data?.profile?.useGPS, data?.profile?.selectedCity, dateStr]);

  // Aggregate blocks for today's timeline (Phase 6a: unified builder).
  const todayBlocks = useMemo(
    () =>
      buildTimeline({
        scheduleDoc: data?.schedule || null,
        events: data?.events,
        personalTasks: data?.personalTasks,
        calori: data?.calori,
        dateStr,
        todayStr: dateKey(),
        // Focus Hub shows breaks too so the user sees their full timeline.
        options: { filterLeisure: false, includeCalori: 'todayOnly' },
      }),
    [data, dateStr]
  );

  // A block is "trackable" if it represents a personal task — either a
  // doc-driven block (source==='task') or a legacy block (id starts with 'task-').
  const isTrackableBlock = (b) => b && (b.source === 'task' || (typeof b.id === 'string' && b.id.startsWith('task-')));

  // Find currently active block and the next scheduled trackable task
  const { currentBlock, nextTrackableTask } = useMemo(() => {
    const now = new Date();
    const nowTimeStr = format(now, 'HH:mm');

    const active = todayBlocks.find(
      (b) => b.startTime <= nowTimeStr && nowTimeStr < b.endTime && !b.isCompleted
    );

    const activeIsTask = isTrackableBlock(active);

    let nextTask = null;
    if (activeIsTask) {
      nextTask = active;
    } else {
      nextTask = todayBlocks.find(
        (b) => isTrackableBlock(b) && b.startTime > nowTimeStr && !b.isCompleted
      );
    }

    return {
      currentBlock: active || null,
      nextTrackableTask: nextTask || null,
    };
  }, [todayBlocks]);

  // If tracking, override current block selection with the tracked block
  const activeBlockToDisplay = useMemo(() => {
    if (focusTracking.isTracking && focusTracking.activeBlockId) {
      const trackedBlock = todayBlocks.find((b) => b.id === focusTracking.activeBlockId);
      if (trackedBlock) return trackedBlock;
    }
    return currentBlock;
  }, [focusTracking.isTracking, focusTracking.activeBlockId, todayBlocks, currentBlock]);

  // Clock format for greeting
  const greetingText = useMemo(() => {
    const hour = new Date().getHours();
    const displayName = data?.profile?.displayName || '';
    
    let greet = '';
    if (isRTL) {
      if (hour < 12) greet = 'בוקר טוב';
      else if (hour < 17) greet = 'צהריים טובים';
      else if (hour < 21) greet = 'ערב טוב';
      else greet = 'לילה טוב';
      return displayName ? `${greet}, ${displayName}` : greet;
    } else {
      if (hour < 12) greet = 'Good morning';
      else if (hour < 17) greet = 'Good afternoon';
      else if (hour < 21) greet = 'Good evening';
      else greet = 'Good night';
      return displayName ? `${greet}, ${displayName}` : greet;
    }
  }, [data?.profile?.displayName, isRTL]);

  // AI Feed Status Message
  const aiFeedMessage = useMemo(() => {
    if (rescheduling) {
      return isRTL 
        ? 'מחשב מסלול מחדש... מעדכן את לוח הזמנים עם מנוע הבינה המלאכותית.'
        : 'Recalculating... Re-optimizing today\'s timeline in background.';
    }
    if (focusTracking.isTracking) {
      return isRTL 
        ? 'עבודה עצימה התחילה. התראות הושתקו כדי לשמור על פוקוס.'
        : 'Deep focus session active. Notifications are silenced.';
    }
    if (focusTracking.wasInterrupted) {
      return isRTL 
        ? 'זיהיתי בלת"ם. המשימה הוחזרה למאגר והלו"ז יאורגן מחדש.'
        : 'Interruption detected. Task returned to pool and schedule will be re-optimized.';
    }
    return isRTL 
      ? 'לוח הזמנים להיום מאורגן ומסונכרן. בהצלחה!'
      : 'Today\'s schedule is synced and optimized. Good luck!';
  }, [focusTracking.isTracking, focusTracking.wasInterrupted, rescheduling, isRTL]);

  // Stopwatch ticking logic
  useEffect(() => {
    let interval = null;
    if (focusTracking.isTracking && focusTracking.startTime) {
      const startMs = new Date(focusTracking.startTime).getTime();
      
      const tick = () => {
        const elapsed = Math.floor((Date.now() - startMs) / 1000);
        setFocusElapsed(elapsed >= 0 ? elapsed : 0);
      };
      
      tick(); // Immediate invocation
      interval = setInterval(tick, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [focusTracking.isTracking, focusTracking.startTime, setFocusElapsed]);

  // Format stopwatch seconds into MM:SS (or HH:MM:SS if > 1 hour)
  const formatStopwatch = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const pad = (val) => String(val).padStart(2, '0');
    if (hrs > 0) {
      return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
    }
    return `${pad(mins)}:${pad(secs)}`;
  };

  const handleStart = (blockId) => {
    startFocusTracking(blockId);
  };

  const handleFinishClick = () => {
    setShowStatusModal(true);
  };

  const handleStatusSelect = (status) => {
    setShowStatusModal(false);
    finishFocusTracking(status);
  };

  const handleInterrupt = async () => {
    setRescheduling(true);
    await interruptFocusTracking(dateStr, shabbatTimes, gpsLocation);
    setRescheduling(false);
  };

  const activeIsTrackable = isTrackableBlock(activeBlockToDisplay);

  // Render block content
  const renderBlockDetails = (block, label, isLive) => {
    const Icon = blockIcons[block.type] || Target;
    const colorClass = blockColors[block.type] || 'border-border bg-card';

    return (
      <div className={cn(
        "rounded-3xl border p-6 bg-card transition-all relative overflow-hidden select-none",
        isLive ? "shadow-md shadow-primary/5 border-primary/20" : "border-border"
      )}>
        {/* Glow effect for active block */}
        {isLive && (
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />
        )}
        
        <div className="flex justify-between items-center mb-4 relative z-10">
          <div className="flex items-center gap-2">
            <span className={cn(
              "px-3 py-1 text-[11px] font-black tracking-wider uppercase rounded-full select-none",
              isLive ? "bg-primary/10 text-primary" : "bg-secondary text-secondary-foreground"
            )}>
              {label}
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground font-semibold">
            <Clock className="w-3.5 h-3.5 opacity-60" />
            <span>{block.startTime} – {block.endTime}</span>
          </div>
        </div>

        <div className="flex items-start gap-4 mb-6 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center border border-border/40 shrink-0">
            <Icon className="w-5 h-5 text-foreground" />
          </div>
          <div className="min-w-0 text-start">
            <h2 className="text-xl font-bold text-foreground leading-tight truncate">{block.title}</h2>
            {block.notes && (
              <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
                {block.notes}
              </p>
            )}
          </div>
        </div>

        {/* Stopwatch & Action Area */}
        {isLive && isTrackableBlock(block) && (
          <div className="relative z-10 flex flex-col items-center border-t border-border/40 pt-6">
            {focusTracking.isTracking ? (
              <div className="w-full text-center space-y-5 animate-in fade-in duration-300">
                <div className="text-5xl font-black font-mono tracking-widest text-foreground select-none">
                  {formatStopwatch(focusTracking.elapsed)}
                </div>
                <div className="flex gap-3 justify-center w-full max-w-sm mx-auto">
                  <button
                    onClick={handleFinishClick}
                    className="flex-1 py-3 px-4 rounded-2xl bg-[#059669] text-white hover:bg-[#059669]/90 active:scale-95 transition-all text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm shadow-[#059669]/10 cursor-pointer"
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                    {t('completed', 'סיימתי')}
                  </button>
                  <button
                    onClick={handleInterrupt}
                    className="flex-1 py-3 px-4 rounded-2xl bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20 active:scale-95 transition-all text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    {t('interrupted', 'הופרעתי')}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => handleStart(block.id)}
                className="w-full py-3.5 px-6 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/95 active:scale-95 transition-all text-sm font-bold flex items-center justify-center gap-1.5 shadow-md shadow-primary/10 cursor-pointer animate-in fade-in duration-300"
              >
                <Play className="w-4 h-4 fill-primary-foreground stroke-none" />
                {t('startFocus', 'התחל עבודה')}
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div 
      className="max-w-4xl mx-auto px-4 py-6 sm:px-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-28"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Dynamic Greetings */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-foreground">{greetingText}</h1>
        <p className="text-sm text-muted-foreground mt-1 select-none">
          {isRTL ? 'מסך מיקוד נטול הסחות דעת לעשייה בלעדית.' : 'Distraction-free cockpit for execution.'}
        </p>
      </div>

      {/* AI Smart Feed Banner */}
      <div className={cn(
        "rounded-2xl border p-4 flex gap-3 items-start select-none",
        focusTracking.isTracking 
          ? "bg-primary/5 border-primary/20 text-primary" 
          : focusTracking.wasInterrupted 
          ? "bg-amber-500/5 border-amber-500/20 text-amber-600 dark:text-amber-400"
          : "bg-secondary/40 border-border text-muted-foreground"
      )}>
        {rescheduling ? (
          <RefreshCw className="w-4.5 h-4.5 text-primary shrink-0 mt-0.5 animate-spin" />
        ) : (
          <Sparkles className="w-4.5 h-4.5 shrink-0 mt-0.5" />
        )}
        <p className="text-xs font-semibold leading-relaxed text-start">{aiFeedMessage}</p>
      </div>

      {/* Active block displaying area */}
      {activeBlockToDisplay ? (
        <div className="space-y-6">
          {renderBlockDetails(activeBlockToDisplay, isRTL ? 'עכשיו' : 'Now', true)}

          {/* Secondary helper: If the active block is not trackable, show the next upcoming trackable task */}
          {!activeIsTrackable && nextTrackableTask && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider text-start">
                {isRTL ? 'המשימה הבאה לביצוע' : 'Next Task to Focus'}
              </h3>
              {renderBlockDetails(nextTrackableTask, isRTL ? 'הבא' : 'Next', false)}
              
              {/* Quick direct start for next task even if current block is running */}
              {!focusTracking.isTracking && (
                <button
                  onClick={() => handleStart(nextTrackableTask.id)}
                  className="w-full py-2.5 rounded-xl border border-dashed border-border hover:border-primary text-xs font-bold text-muted-foreground hover:text-primary transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5" />
                  {isRTL ? `התחל את "${nextTrackableTask.title}" כעת` : `Start "${nextTrackableTask.title}" now`}
                </button>
              )}
            </div>
          )}
        </div>
      ) : nextTrackableTask ? (
        // No active block right now, but there's a scheduled task later today
        <div className="space-y-3">
          <div className="text-start mb-2">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              {isRTL ? 'אין משימה פעילה כרגע' : 'No active block'}
            </h3>
          </div>
          {renderBlockDetails(nextTrackableTask, isRTL ? 'הבא' : 'Next', true)}
        </div>
      ) : (
        // Empty State: No tasks scheduled for today or they are all done
        <div className="rounded-3xl border border-border bg-card p-12 text-center select-none space-y-4">
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto text-primary border border-border/30">
            <Target className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-bold text-foreground">
              {isRTL ? 'אין משימות מתוכננות להיום' : 'No scheduled tasks today'}
            </h2>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              {isRTL 
                ? 'הלו"ז שלך פנוי לחלוטין. מצא משימות בקומנד סנטר ושבץ אותן בלו"ז השעתי כדי להתחיל למידה.'
                : 'Your schedule is clear. Add and schedule tasks from the Command Center to start focusing.'}
            </p>
          </div>
        </div>
      )}

      {/* Completion Status Selector Dialog */}
      <Dialog open={showStatusModal} onOpenChange={setShowStatusModal}>
        <DialogContent className="sm:max-w-md bg-card border border-border shadow-xl rounded-3xl" dir={isRTL ? 'rtl' : 'ltr'}>
          <DialogHeader>
            <DialogTitle className="text-start text-foreground font-black text-lg">
              {isRTL ? 'איך עבר עליך זמן הלמידה?' : 'How did the focus session go?'}
            </DialogTitle>
            <DialogDescription className="text-start text-muted-foreground text-xs mt-1">
              {isRTL 
                ? 'בחר סטטוס מתאים כדי שנוכל לחשב את ההתקדמות שלך וללמוד את קצב העבודה האמיתי.'
                : 'Select the appropriate status so we can update your progress metrics.'}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-2.5 mt-4">
            <button
              onClick={() => handleStatusSelect('completed')}
              className="w-full py-3 px-4 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/95 text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm shadow-primary/5 cursor-pointer active:scale-98 transition-all"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              {isRTL ? 'הושלם בהצלחה' : 'Completed Successfully'}
            </button>
            
            <button
              onClick={() => handleStatusSelect('still_learning')}
              className="w-full py-3 px-4 rounded-2xl bg-secondary text-secondary-foreground hover:bg-muted border border-border text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              {isRTL ? 'עבדתי על זה, אך עדיין לומד' : 'Worked on it, but still learning'}
            </button>

            <button
              onClick={() => {
                setShowStatusModal(false);
                resetFocusTracking();
              }}
              className="w-full py-3 px-4 rounded-2xl bg-transparent hover:bg-secondary/40 text-muted-foreground text-xs font-bold flex items-center justify-center gap-1 cursor-pointer active:scale-98 transition-all"
            >
              <X className="w-4 h-4" />
              {isRTL ? 'בטל ומחק מעקב נוכחי' : 'Cancel without saving'}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
