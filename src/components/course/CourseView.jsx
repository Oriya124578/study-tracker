import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { WeeklyTasks } from './WeeklyTasks';
import { GlobalTasks } from './GlobalTasks';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';

export const CourseView = () => {
  const { activeCourse } = useStore();
  const [activeTab, setActiveTab] = useState('weekly'); // 'weekly' or 'global'

  if (!activeCourse) return null;

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto w-full pt-4 md:pt-8 px-4 md:px-8">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{activeCourse.name}</h1>
          <p className="text-muted-foreground mt-1">מבט על המטלות, הסיכומים והמבחנים</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border mb-6">
        <button
          onClick={() => setActiveTab('weekly')}
          className={cn(
            "pb-3 px-4 text-sm font-medium transition-colors relative",
            activeTab === 'weekly' ? "text-primary" : "text-muted-foreground hover:text-foreground"
          )}
        >
          משימות שבועיות
          {activeTab === 'weekly' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('global')}
          className={cn(
            "pb-3 px-4 text-sm font-medium transition-colors relative",
            activeTab === 'global' ? "text-primary" : "text-muted-foreground hover:text-foreground"
          )}
        >
          מאגר (מבחנים וסיכומים)
          {activeTab === 'global' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
          )}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 pb-24 md:pb-8">
        {activeTab === 'weekly' ? <WeeklyTasks /> : <GlobalTasks />}
      </div>
    </div>
  );
};
