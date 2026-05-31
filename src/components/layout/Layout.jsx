import React from 'react';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { PomodoroTimer } from '../pomodoro/PomodoroTimer';
import { MobileCourseMenu } from './MobileCourseMenu';
import { useStore } from '../../store/useStore';
import { cn } from '../../lib/utils';
import { SmartDashboard } from '../dashboard/SmartDashboard';
import { CourseView } from '../course/CourseView';
import { CalendarView } from '../calendar/CalendarView';
import { SettingsView } from '../settings/SettingsView';
import { GlobalLoadingOverlay } from './GlobalLoadingOverlay';
import { ErrorBoundary } from './ErrorBoundary';
import { Toaster } from '../ui/Toaster';
import { useTranslation } from '../../hooks/useTranslation';

export const Layout = () => {
  const { activeCategory, activeCourse, showPomoSettings } = useStore();
  const { t, language } = useTranslation();

  const renderContent = () => {
    switch (activeCategory) {
      case 'overview':
        return <SmartDashboard />;
      case 'calendar':
        return <CalendarView />;
      case 'course':
        return <CourseView />;
      case 'settings':
        return <SettingsView />;
      case 'courses':
        // On mobile, 'courses' might open a modal or just a list of courses. 
        // For simplicity, let's redirect to overview if accessed directly, as courses are in Sidebar.
        // We will build a MobileCourseMenu later, or just show Dashboard for now.
        return <SmartDashboard />;
      default:
        return <SmartDashboard />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden selection:bg-primary/20">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 relative">
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-background/80 backdrop-blur-md pt-[max(env(safe-area-inset-top),16px)] z-20 shrink-0 sticky top-0" dir={language === 'he' ? 'rtl' : 'ltr'}>
          <h1 className="font-bold text-lg text-foreground truncate flex-1 pe-4 text-start">
            {activeCategory === 'course' && activeCourse ? activeCourse.name : 
             activeCategory === 'calendar' ? t('navCalendar') :
             activeCategory === 'settings' ? t('navSettings') : t('navOverview')}
          </h1>
          
          <div className="flex items-center gap-1.5 shrink-0" dir="ltr">
            <span className="text-xs font-bold text-primary opacity-80 uppercase tracking-wide hidden sm:inline-block">Study Tracker</span>
            <img src="/logo-192.png" alt="Study Tracker Logo" className="w-6 h-6 object-contain drop-shadow-sm" />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto overflow-x-hidden relative scroll-smooth min-h-0 min-w-0 pb-28 md:pb-8 pt-4 md:pt-0">
          <ErrorBoundary>{renderContent()}</ErrorBoundary>
        </main>
      </div>
      <MobileNav />
      <MobileCourseMenu />

      <PomodoroTimer />
      <GlobalLoadingOverlay />
      <Toaster />
    </div>
  );
};
