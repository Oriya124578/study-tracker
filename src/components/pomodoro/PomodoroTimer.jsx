import React, { useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { Play, Pause, RotateCcw, X, Clock, Settings2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';

export const PomodoroTimer = () => {
  const { 
    pomodoro, setPomodoro, 
    pomoSettings, setShowPomoSettings, showPomoSettings,
    addPomodoroSession, data, showPomodoroModal, setShowPomodoroModal
  } = useStore();

  const toggleTimer = () => {
    if (!pomodoro.active && !pomodoro.courseId) {
      alert("יש לבחור קורס כדי להתחיל למידה!");
      return;
    }
    setPomodoro(prev => ({ ...prev, active: !prev.active }));
  };

  const resetTimer = () => {
    setPomodoro(prev => ({ 
      ...prev, 
      active: false, 
      timeLeft: pomoSettings[prev.mode] * 60 
    }));
  };

  const switchMode = (newMode) => {
    setPomodoro(prev => ({
      ...prev,
      mode: newMode,
      active: false,
      timeLeft: pomoSettings[newMode] * 60
    }));
  };

  useEffect(() => {
    let interval = null;
    
    if (pomodoro.active && pomodoro.timeLeft > 0) {
      interval = setInterval(() => {
        setPomodoro(prev => ({ ...prev, timeLeft: prev.timeLeft - 1 }));
      }, 1000);
    } else if (pomodoro.active && pomodoro.timeLeft === 0) {
      // Session finished
      if (pomodoro.mode === 'work') {
        new Audio('/notification.mp3').play().catch(() => {});
        addPomodoroSession({
          courseId: pomodoro.courseId,
          duration: pomoSettings.work * 60,
          timestamp: new Date().toISOString()
        });
        switchMode('break');
      } else {
        new Audio('/notification.mp3').play().catch(() => {});
        switchMode('work');
      }
    }

    return () => clearInterval(interval);
  }, [pomodoro.active, pomodoro.timeLeft, pomodoro.mode, pomodoro.courseId, pomoSettings, addPomodoroSession, setPomodoro]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={showPomodoroModal} onOpenChange={setShowPomodoroModal}>
      <DialogContent className="sm:max-w-md bg-card border-primary/20 shadow-2xl" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-primary">
            <Clock className="w-5 h-5" />
            טיימר פומודורו
          </DialogTitle>
          <DialogDescription>
            נהל את זמני הלמידה שלך. כל סשן למידה שתסיים יישמר בסטטיסטיקות הדשבורד!
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center p-6 bg-background rounded-xl border border-border mt-4">
          
          {/* Mode Switcher */}
          <div className="flex gap-2 mb-8 bg-muted p-1 rounded-full w-full max-w-[200px]">
            <button 
              onClick={() => switchMode('work')}
              className={`flex-1 py-1 text-sm font-medium rounded-full transition-all ${
                pomodoro.mode === 'work' ? 'bg-background shadow text-primary' : 'text-muted-foreground'
              }`}
            >
              למידה
            </button>
            <button 
              onClick={() => switchMode('break')}
              className={`flex-1 py-1 text-sm font-medium rounded-full transition-all ${
                pomodoro.mode === 'break' ? 'bg-background shadow text-primary' : 'text-muted-foreground'
              }`}
            >
              הפסקה
            </button>
          </div>

          {/* Timer Display */}
          <div className="text-7xl font-bold text-foreground font-mono tracking-wider mb-8 drop-shadow-md">
            {formatTime(pomodoro.timeLeft)}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-6 mb-8">
            <button onClick={toggleTimer} className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-lg shadow-primary/30">
              {pomodoro.active ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
            </button>
            <button onClick={resetTimer} className="w-12 h-12 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-md">
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>

          {/* Course Selector */}
          <div className="w-full">
            <label className="text-xs font-medium text-muted-foreground mb-2 block text-center">שייך את זמן הלמידה לקורס:</label>
            <select 
              value={pomodoro.courseId || ''} 
              onChange={(e) => setPomodoro(prev => ({ ...prev, courseId: e.target.value }))}
              className="w-full bg-background border border-border rounded-lg p-2 text-sm text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
              dir="rtl"
            >
              <option value="" disabled>-- בחר קורס --</option>
              {data.courses.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
};
