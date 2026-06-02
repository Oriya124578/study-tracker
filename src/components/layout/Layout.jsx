import React from 'react';
import { BottomNav } from './BottomNav';
import { PomodoroTimer } from '../pomodoro/PomodoroTimer';
import { MobileCourseMenu } from './MobileCourseMenu';
import { useStore } from '../../store/useStore';
import { SmartDashboard } from '../dashboard/SmartDashboard';
import { CourseView } from '../course/CourseView';
import { CalendarView } from '../calendar/CalendarView';
import { SettingsView } from '../settings/SettingsView';
import { GlobalLoadingOverlay } from './GlobalLoadingOverlay';
import { ErrorBoundary } from './ErrorBoundary';
import { Toaster } from '../ui/Toaster';
import { AddItemSheet } from '../add-item/AddItemSheet';
import { useTranslation } from '../../hooks/useTranslation';
import { StudiesHub } from '../studies/StudiesHub';
import { TasksView } from '../tasks/TasksView';
import { NotesView } from '../notes/NotesView';
import { MoreHub } from './MoreHub';
import { CaloriView } from '../calori/CaloriView';

export const Layout = () => {
  const { activeCategory, activeCourse } = useStore();
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
        return <StudiesHub />;
      case 'tasks':
        return <TasksView />;
      case 'notes':
        return <NotesView />;
      case 'moreHub':
        return <MoreHub />;
      case 'calori':
        return <CaloriView />;
      default:
        return <SmartDashboard />;
    }
  };

  const headerTitle =
    activeCategory === 'course' && activeCourse
      ? activeCourse.name
      : activeCategory === 'calendar'
      ? t('navCalendar')
      : activeCategory === 'settings'
      ? t('navMore')
      : activeCategory === 'courses'
      ? t('navStudies')
      : activeCategory === 'tasks'
      ? t('myTasks')
      : activeCategory === 'notes'
      ? t('myNotes')
      : activeCategory === 'moreHub'
      ? t('moreHubTitle')
      : activeCategory === 'calori'
      ? t('caloriTitle')
      : t('navHome');

  return (
    <div className="flex flex-col min-h-[100dvh] w-full bg-background selection:bg-primary/20">
      {/* Top header */}
      <header
        className="flex items-center justify-between px-4 py-3 border-b border-border bg-background/80 backdrop-blur-md pt-[max(env(safe-area-inset-top),16px)] z-20 shrink-0 sticky top-0"
        dir={language === 'he' ? 'rtl' : 'ltr'}
      >
        <h1 className="font-bold text-lg text-foreground truncate flex-1 pe-4 text-start">
          {headerTitle}
        </h1>
        <div className="flex items-center gap-1.5 shrink-0" dir="ltr">
          <span className="text-xs font-bold text-primary opacity-80 uppercase tracking-wide hidden sm:inline-block">
            {t('appName')}
          </span>
          <img
            src="/logo-192.png"
            alt="Calori Life Logo"
            className="w-6 h-6 object-contain drop-shadow-sm"
          />
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 relative scroll-smooth min-w-0 pb-24 pt-2">
        <ErrorBoundary>{renderContent()}</ErrorBoundary>
      </main>

      {/* Navigation & overlays */}
      <BottomNav />
      <MobileCourseMenu />
      <AddItemSheet />
      <PomodoroTimer />
      <GlobalLoadingOverlay />
      <Toaster />
    </div>
  );
};
