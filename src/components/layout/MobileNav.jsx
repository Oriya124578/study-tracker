import React from 'react';
import { Home, Calendar, Settings, Clock, BookOpen } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { cn } from '../../lib/utils';

export const MobileNav = () => {
  const { activeCategory, setActiveCategory, setActiveCourse } = useStore();

  const handleNavClick = (category) => {
    setActiveCategory(category);
    setActiveCourse(null);
  };

  return (
    <div className="md:hidden flex-none w-full bg-background border-t border-border z-50 px-6 py-3 flex justify-between items-center shadow-[0_-4px_10px_rgba(0,0,0,0.05)] pb-[env(safe-area-inset-bottom,16px)]">
      <button onClick={() => handleNavClick('overview')} className={cn("flex flex-col items-center gap-1 transition-colors", activeCategory === 'overview' ? "text-primary" : "text-muted-foreground")}>
        <Home className="w-6 h-6" />
        <span className="text-[10px] font-medium">ראשי</span>
      </button>
      
      {/* We use a course menu opener instead of navigating to a specific course */}
      <button onClick={() => handleNavClick('courses')} className={cn("flex flex-col items-center gap-1 transition-colors", activeCategory === 'courses' ? "text-primary" : "text-muted-foreground")}>
        <BookOpen className="w-6 h-6" />
        <span className="text-[10px] font-medium">קורסים</span>
      </button>
      
      <button onClick={() => handleNavClick('calendar')} className={cn("flex flex-col items-center gap-1 transition-colors", activeCategory === 'calendar' ? "text-primary" : "text-muted-foreground")}>
        <Calendar className="w-6 h-6" />
        <span className="text-[10px] font-medium">לוח שנה</span>
      </button>

      <button onClick={() => useStore.getState().setShowPomodoroModal(true)} className={cn("flex flex-col items-center gap-1 transition-colors", useStore.getState().pomodoro.active ? "text-primary" : "text-muted-foreground")}>
        <Clock className="w-6 h-6" />
        <span className="text-[10px] font-medium">פומודורו</span>
      </button>
      
      <button onClick={() => handleNavClick('settings')} className={cn("flex flex-col items-center gap-1 transition-colors", activeCategory === 'settings' ? "text-primary" : "text-muted-foreground")}>
        <Settings className="w-6 h-6" />
        <span className="text-[10px] font-medium">הגדרות</span>
      </button>
    </div>
  );
};
