import React, { Suspense, lazy, useState, useEffect } from 'react';
import { BottomNav } from './BottomNav';
import { useStore } from '../../store/useStore';
// SmartDashboard stays eager: it's the default landing view, so we don't want the
// home screen to flash a Suspense fallback on first paint.
import { SmartDashboard } from '../dashboard/SmartDashboard';
import { GlobalLoadingOverlay } from './GlobalLoadingOverlay';
import { ErrorBoundary } from './ErrorBoundary';
import { Toaster } from '../ui/Toaster';
import { AddItemSheet } from '../add-item/AddItemSheet';
import { useTranslation } from '../../hooks/useTranslation';
import { useNotificationScheduler } from '../../hooks/useNotificationScheduler';
import { Plus, CheckSquare, StickyNote, UtensilsCrossed, Timer, MoreHorizontal, X, User } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

// Route-level views are lazy-loaded so heavy deps (recharts, etc.) only load when
// the user navigates to a view that needs them. These are NAMED exports, so each
// import is mapped onto a synthetic `default` for React.lazy.
const CourseView = lazy(() => import('../course/CourseView').then((m) => ({ default: m.CourseView })));
const CalendarView = lazy(() => import('../calendar/CalendarView').then((m) => ({ default: m.CalendarView })));
const SettingsView = lazy(() => import('../settings/SettingsView').then((m) => ({ default: m.SettingsView })));
const StudiesHub = lazy(() => import('../studies/StudiesHub').then((m) => ({ default: m.StudiesHub })));
const TasksView = lazy(() => import('../tasks/TasksView').then((m) => ({ default: m.TasksView })));
const NotesView = lazy(() => import('../notes/NotesView').then((m) => ({ default: m.NotesView })));

const CaloriView = lazy(() => import('../calori/CaloriView').then((m) => ({ default: m.CaloriView })));
const CommandCenterView = lazy(() => import('../command-center/CommandCenterView').then((m) => ({ default: m.CommandCenterView })));
const FocusHub = lazy(() => import('../focus/FocusHub').then((m) => ({ default: m.FocusHub })));

// Lightweight, on-brand fallback shown while a lazy view chunk loads.
const ViewFallback = () => (
  <div className="flex items-center justify-center w-full py-24" role="status" aria-live="polite">
    <div className="w-8 h-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
  </div>
);

export const Layout = () => {
  const { data, activeCategory, activeCourse, openAddSheet, setActiveCategory } = useStore();
  const displayName = data?.profile?.displayName || '';
  const { t, language } = useTranslation();
  const [isFanMenuOpen, setIsFanMenuOpen] = useState(false);

  // Phase 5: drive local reminders while the app is open.
  useNotificationScheduler();

  const renderContent = () => {
    if (activeCategory.startsWith('settings')) {
      return <SettingsView />;
    }
    switch (activeCategory) {
      case 'overview':
        return <SmartDashboard />;
      case 'calendar':
        return <CalendarView />;
      case 'course':
        return <CourseView />;
      case 'courses':
        return <StudiesHub />;
      case 'tasks':
        return <TasksView />;
      case 'notes':
        return <NotesView />;
      case 'calori':
        return <CaloriView />;
      case 'commandCenter':
        return <CommandCenterView />;
      case 'focus':
        return <FocusHub />;
      default:
        return <SmartDashboard />;
    }
  };

  const headerTitle =
    activeCategory === 'course' && activeCourse
      ? activeCourse.name
      : activeCategory === 'calendar'
      ? t('navCalendar')
      : activeCategory.startsWith('settings')
      ? t('navSettings')
      : activeCategory === 'courses'
      ? t('navStudies')
      : activeCategory === 'tasks'
      ? t('myTasks')
      : activeCategory === 'notes'
      ? t('myNotes')
      : activeCategory === 'calori'
      ? t('caloriTitle')
      : activeCategory === 'commandCenter'
      ? t('navCommandCenter')
      : activeCategory === 'focus'
      ? t('navFocus', 'פוקוס')
      : t('navHome');

  return (
    <div className="flex flex-col min-h-[100dvh] w-full bg-background selection:bg-primary/20">
      {/* Top header */}
      <header
        className="flex items-center justify-between px-6 py-4 border-b border-border/40 bg-background/70 backdrop-blur-xl pt-[max(env(safe-area-inset-top),16px)] z-20 shrink-0 sticky top-0 transition-all shadow-sm shadow-foreground/[0.01]"
        dir={language === 'he' ? 'rtl' : 'ltr'}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <button
            onClick={() => setActiveCategory('settings')}
            className={cn(
              "rounded-full transition-all hover:scale-105 active:scale-95 duration-200 cursor-pointer shrink-0",
              activeCategory.startsWith('settings') && "ring-2 ring-primary ring-offset-2 ring-offset-background"
            )}
            title={t('navSettings', 'הגדרות')}
            aria-label={t('navSettings', 'הגדרות')}
          >
            {/* v3 cream: Avatar component with photoURL synced from Calori + italic-initial fallback. */}
            <Avatar
              src={data?.profile?.photoURL}
              initial={displayName ? displayName.trim().charAt(0).toUpperCase() : 'א'}
              size={32}
              alt={t('navSettings', 'הגדרות')}
            />
          </button>
          <h1
            className="font-black text-xl tracking-tight bg-clip-text text-transparent truncate text-start select-none"
            style={{ backgroundImage: 'var(--gradient-brand)' }}
          >
            {headerTitle}
          </h1>
        </div>
        <div className="flex items-center gap-3 shrink-0" dir="ltr">
          {/* v3 cream wordmark: 'calori' Inter 800, ' life' Instrument Serif italic 400 green, slightly larger for prominence */}
          <div className="flex flex-col items-end select-none">
            <span className="text-[22px] font-extrabold tracking-tight text-foreground leading-none">
              calori<span className="text-primary font-serif italic font-normal text-[24px] ms-0.5">life</span>
            </span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 relative scroll-smooth min-w-0 pb-24 pt-2">
        <ErrorBoundary>
          <Suspense fallback={<ViewFallback />}>{renderContent()}</Suspense>
        </ErrorBoundary>
      </main>

      {/* Floating Action Button (FAB) on bottom right (3-dots toggle) */}
      <button
        onClick={() => setIsFanMenuOpen(!isFanMenuOpen)}
        className="fixed right-6 bottom-24 sm:right-8 sm:bottom-28 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center z-50 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none"
        aria-label={isFanMenuOpen ? t('close') : t('navMore')}
      >
        <motion.div
          animate={{ rotate: isFanMenuOpen ? 135 : 0 }}
          transition={{ type: 'spring', stiffness: 450, damping: 18 }}
          className="flex items-center justify-center"
        >
          <Plus className="w-6 h-6" strokeWidth={2.5} />
        </motion.div>
      </button>

      {/* Animated Fan-out Menu */}
      <AnimatePresence>
        {isFanMenuOpen && (
          <>
            {/* Backdrop Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
              onClick={() => setIsFanMenuOpen(false)}
              className="fixed inset-0 bg-background/30 backdrop-blur-md z-40"
            />

            {/* Speed Dial Menu Container */}
            <div className="fixed right-6 bottom-40 sm:right-8 sm:bottom-44 z-40 flex flex-col-reverse items-end gap-4 pointer-events-auto">
              
              {/* 1. Add Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-3"
              >
                <span className="whitespace-nowrap bg-background border text-foreground text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                  {t('addNewItem')}
                </span>
                <button
                  onClick={() => { setIsFanMenuOpen(false); openAddSheet('task'); }}
                  className="w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                  title={t('addNewItem')}
                >
                  <Plus className="w-5 h-5" strokeWidth={2.5} />
                </button>
              </motion.div>

              {/* 2. Tasks Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.15, delay: 0.05 }}
                className="flex items-center gap-3"
              >
                <span className="whitespace-nowrap bg-background border text-foreground text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                  {t('tasksHubCard', 'משימות')}
                </span>
                <button
                  onClick={() => { setIsFanMenuOpen(false); setActiveCategory('tasks'); }}
                  className="w-12 h-12 rounded-full bg-blue-500 text-white shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                  title={t('tasksHubCard', 'משימות')}
                >
                  <CheckSquare className="w-5 h-5" />
                </button>
              </motion.div>

              {/* 3. Notes Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.15, delay: 0.1 }}
                className="flex items-center gap-3"
              >
                <span className="whitespace-nowrap bg-background border text-foreground text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                  {t('notesHubCard', 'פתקים')}
                </span>
                <button
                  onClick={() => { setIsFanMenuOpen(false); setActiveCategory('notes'); }}
                  className="w-12 h-12 rounded-full bg-amber-500 text-white shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-transform cursor-pointer"
                  title={t('notesHubCard', 'פתקים')}
                >
                  <StickyNote className="w-5 h-5" />
                </button>
              </motion.div>

            </div>
          </>
        )}
      </AnimatePresence>

      <BottomNav />
      <AddItemSheet />
      <GlobalLoadingOverlay />
      <Toaster />
    </div>
  );
};
