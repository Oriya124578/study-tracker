import React from 'react';
import { BookOpen, Clock } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useTranslation } from '../../hooks/useTranslation';
import { cn } from '../../lib/utils';
import { StudiesStats } from './StudiesStats';

export const StudiesHub = () => {
  const { data, setActiveCategory, setActiveCourse, setShowPomodoroModal } =
    useStore();
  const { t } = useTranslation();
  const courses = data?.courses?.filter((c) => !c.isArchived) || [];

  const openCourse = (course) => {
    setActiveCourse(course);
    setActiveCategory('course');
  };

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto w-full space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {courses.map((course) => {
          const taskCount = Object.values(data.tasks[course.id] || {}).reduce(
            (sum, week) => sum + week.length,
            0,
          );
          const doneCount = Object.values(data.tasks[course.id] || {}).reduce(
            (sum, week) => sum + week.filter((t) => t.checked).length,
            0,
          );
          const pct = taskCount > 0 ? Math.round((doneCount / taskCount) * 100) : 0;

          return (
            <button
              key={course.id}
              onClick={() => openCourse(course)}
              className="flex items-center gap-4 p-4 rounded-2xl border border-border bg-card hover:border-primary/40 hover:shadow-md transition-all text-start group"
            >
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm text-foreground truncate">
                  {course.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-[11px] text-muted-foreground font-medium">
                    {pct}%
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Quick pomodoro access */}
      <button
        onClick={() => setShowPomodoroModal(true)}
        className="w-full flex items-center gap-3 p-4 rounded-2xl border border-border bg-card hover:border-primary/40 transition-all"
      >
        <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
          <Clock className="w-5 h-5 text-purple-600" />
        </div>
        <span className="font-semibold text-sm text-foreground">
          {t('pomodoro')}
        </span>
      </button>

      {/* Academic stats (moved here from home in Phase 4) */}
      <StudiesStats />
    </div>
  );
};
