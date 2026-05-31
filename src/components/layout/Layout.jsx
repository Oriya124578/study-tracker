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

export const Layout = () => {
  const { activeCategory, showPomoSettings } = useStore();

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
      <main className="flex-1 overflow-y-auto overflow-x-hidden relative scroll-smooth min-h-0 min-w-0 pb-32 md:pb-8">
        {renderContent()}
      </main>
      <MobileNav />
      <MobileCourseMenu />
      
      <PomodoroTimer />
    </div>
  );
};
