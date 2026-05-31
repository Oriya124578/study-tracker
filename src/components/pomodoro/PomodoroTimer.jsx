import React, { useEffect, useRef } from 'react';
import { useStore } from '../../store/useStore';
import { Play, Square, X, Settings as SettingsIcon } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Card } from '../ui/card';

export const PomodoroTimer = () => {
  const { 
    pomodoro, setPomodoro, pomoSettings, setShowPomoSettings, 
    data, activeCourse, addPomodoroSession 
  } = useStore();
  
  const timerRef = useRef(null);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => {
    setPomodoro(prev => ({ ...prev, active: !prev.active }));
  };

  useEffect(() => {
    if (pomodoro.active && pomodoro.timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setPomodoro(prev => ({ ...prev, timeLeft: prev.timeLeft - 1 }));
      }, 1000);
    } else if (pomodoro.timeLeft === 0) {
      if (pomodoro.active) {
        // Session finished!
        const isWork = pomodoro.mode === 'work';
        
        // Save session if it was a work session and a course was selected
        if (isWork && pomodoro.courseId) {
          addPomodoroSession({
            courseId: pomodoro.courseId,
            date: new Date().toISOString(),
            minutes: pomoSettings.work
          });
        }
        
        // Play sound
        try {
          const audio = new Audio('/notification.mp3');
          audio.play();
        } catch (e) {
          // ignore
        }

        // Switch modes
        const nextMode = isWork ? 'break' : 'work';
        const nextTime = (nextMode === 'work' ? pomoSettings.work : pomoSettings.break) * 60;
        
        setPomodoro({
          active: false,
          mode: nextMode,
          timeLeft: nextTime,
          courseId: pomodoro.courseId
        });
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [pomodoro.active, pomodoro.timeLeft, pomodoro.mode, pomodoro.courseId, pomoSettings, setPomodoro, addPomodoroSession]);

  // If there's an active course and no pomodoro course selected, auto-select it
  useEffect(() => {
    if (activeCourse && !pomodoro.courseId) {
      setPomodoro(prev => ({ ...prev, courseId: activeCourse.id }));
    }
  }, [activeCourse, pomodoro.courseId, setPomodoro]);

  const selectedCourseName = data?.courses?.find(c => c.id === pomodoro.courseId)?.name || 'לא נבחר קורס';

  return (
    <Card className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-6 z-50 p-4 shadow-2xl border-border/50 bg-background/90 backdrop-blur-md w-[320px] rounded-2xl">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-sm tracking-wide">
          {pomodoro.mode === 'work' ? 'זמן ריכוז 🧠' : 'הפסקה ☕'}
        </h3>
        <button onClick={() => setShowPomoSettings(true)} className="text-muted-foreground hover:text-foreground">
          <SettingsIcon className="w-4 h-4" />
        </button>
      </div>
      
      <div className="text-center mb-4">
        <div className={cn(
          "text-5xl font-black font-mono tracking-tighter mb-1",
          pomodoro.mode === 'work' ? "text-primary" : "text-secondary-foreground"
        )}>
          {formatTime(pomodoro.timeLeft)}
        </div>
        <select 
          className="text-xs bg-muted/50 border border-border rounded px-2 py-1 outline-none text-muted-foreground max-w-[200px] mx-auto block"
          value={pomodoro.courseId || ''}
          onChange={(e) => setPomodoro(prev => ({ ...prev, courseId: e.target.value }))}
          disabled={pomodoro.active}
        >
          <option value="" disabled>-- בחר קורס --</option>
          {data?.courses?.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="flex justify-center items-center gap-4">
        <button 
          onClick={toggleTimer}
          className={cn(
            "w-12 h-12 flex items-center justify-center rounded-full text-white transition-all shadow-lg active:scale-95",
            pomodoro.active ? "bg-destructive hover:bg-destructive/90" : "bg-primary hover:bg-primary/90"
          )}
        >
          {pomodoro.active ? <Square className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
        </button>
      </div>
    </Card>
  );
};
