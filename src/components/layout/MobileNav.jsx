import React from 'react';
import { Home, Calendar, Settings, Clock, BookOpen } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { cn } from '../../lib/utils';
import { useTranslation } from '../../hooks/useTranslation';

export const MobileNav = () => {
  const { activeCategory, setActiveCategory, setActiveCourse, pomodoro, setShowPomodoroModal } = useStore();
  const { t } = useTranslation();

  const handleNavClick = (category) => {
    setActiveCategory(category);
    setActiveCourse(null);
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 px-6 sm:px-8 pt-3 pb-[calc(env(safe-area-inset-bottom)+12px)] flex justify-between items-center shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
      <button onClick={() => handleNavClick('overview')} className={cn("flex flex-col items-center gap-1 transition-colors", activeCategory === 'overview' ? "text-primary" : "text-muted-foreground")}>
        <Home className="w-6 h-6" />
        <span className="text-[10px] font-medium">{t('navOverview')}</span>
      </button>
      
      {/* We use a course menu opener instead of navigating to a specific course */}
      <button onClick={() => handleNavClick('courses')} className={cn("flex flex-col items-center gap-1 transition-colors", activeCategory === 'courses' ? "text-primary" : "text-muted-foreground")}>
        <BookOpen className="w-6 h-6" />
        <span className="text-[10px] font-medium">{t('navCourses')}</span>
      </button>
      
      <button onClick={() => handleNavClick('calendar')} className={cn("flex flex-col items-center gap-1 transition-colors", activeCategory === 'calendar' ? "text-primary" : "text-muted-foreground")}>
        <Calendar className="w-6 h-6" />
        <span className="text-[10px] font-medium">{t('navCalendar')}</span>
      </button>

      <button onClick={() => setShowPomodoroModal(true)} className={cn("flex flex-col items-center gap-1 transition-colors", pomodoro.active ? "text-primary" : "text-muted-foreground")}>
        <Clock className="w-6 h-6" />
        <span className="text-[10px] font-medium">{t('navPomodoro')}</span>
      </button>
      
      <button onClick={() => handleNavClick('settings')} className={cn("flex flex-col items-center gap-1 transition-colors", activeCategory === 'settings' ? "text-primary" : "text-muted-foreground")}>
        <Settings className="w-6 h-6" />
        <span className="text-[10px] font-medium">{t('navSettings')}</span>
      </button>
    </div>
  );
};
