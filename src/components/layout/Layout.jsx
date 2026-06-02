import React, { Suspense, lazy } from 'react';
import { BottomNav } from './BottomNav';
import { PomodoroTimer } from '../pomodoro/PomodoroTimer';
import { MobileCourseMenu } from './MobileCourseMenu';
import { useStore } from '../../store/useStore';
// SmartDashboard stays eager: it's the default landing view, so we don't want the
// home screen to flash a Suspense fallback on first paint.
import { SmartDashboard } from '../dashboard/SmartDashboard';
import { GlobalLoadingOverlay } from './GlobalLoadingOverlay';
import { ErrorBoundary } from './ErrorBoundary';
import { Toaster } from '../ui/Toaster';
import { AddItemSheet } from '../add-item/AddItemSheet';
import { useTranslation } from '../../hooks/useTranslation';

// Route-level views are lazy-loaded so heavy deps (recharts, etc.) only load when
// the user navigates to a view that needs them. These are NAMED exports, so each
// import is mapped onto a synthetic `default` for React.lazy.
const CourseView = lazy(() => import('../course/CourseView').then((m) => ({ default: m.CourseView })));
const CalendarView = lazy(() => import('../calendar/CalendarView').then((m) => ({ default: m.CalendarView })));
const SettingsView = lazy(() => import('../settings/SettingsView').then((m) => ({ default: m.SettingsView })));
const StudiesHub = lazy(() => import('../studies/StudiesHub').then((m) => ({ default: m.StudiesHub })));
const TasksView = lazy(() => import('../tasks/TasksView').then((m) => ({ default: m.TasksView })));
const NotesView = lazy(() => import('../notes/NotesView').then((m) => ({ default: m.NotesView })));
const MoreHub = lazy(() => import('./MoreHub').then((m) => ({ default: m.MoreHub })));
const CaloriView = lazy(() => import('../calori/CaloriView').then((m) => ({ default: m.CaloriView })));

// Lightweight, on-brand fallback shown while a lazy view chunk loads.
const ViewFallback = () => (
  <div className="flex items-center justify-center w-full py-24" role="status" aria-live="polite">
    <div className="w-8 h-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
  </div>
);

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
        <ErrorBoundary>
          <Suspense fallback={<ViewFallback />}>{renderContent()}</Suspense>
        </ErrorBoundary>
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
