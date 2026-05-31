import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { WeeklyTasks } from './WeeklyTasks';
import { AllTasksByType } from './AllTasksByType';
import { CategorySection } from './GlobalTasks';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { Settings, FileText, ListTodo } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Input } from '../ui/input';
import { useTranslation } from '../../hooks/useTranslation';

export const CourseView = () => {
  const { activeCourse, data, updateCourse } = useStore();
  const { t, language } = useTranslation();
  const [activeTab, setActiveTab] = useState('weekly');
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Local state for the settings modal
  const [editData, setEditData] = useState({});

  if (!activeCourse) return null;

  const handleOpenSettings = () => {
    setEditData({
      name: activeCourse.name,
      weeksCount: activeCourse.weeksCount || 14,
      credits: activeCourse.credits || 0,
      semester: activeCourse.semester || "א'",
    });
    setIsSettingsOpen(true);
  };

  const handleSaveSettings = () => {
    updateCourse(activeCourse.id, {
      name: editData.name,
      weeksCount: parseInt(editData.weeksCount, 10),
      credits: parseFloat(editData.credits),
      semester: editData.semester
    });
    setIsSettingsOpen(false);
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto w-full pt-4 md:pt-8 px-4 md:px-8">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{activeCourse.name}</h1>
          <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
            {activeCourse.credits > 0 && <span>{activeCourse.credits} {t('credits')}</span>}
            {activeCourse.semester && <span>{t('semester')} {activeCourse.semester}</span>}
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleOpenSettings} className="gap-2">
          <Settings className="w-4 h-4" />
          {t('courseSettings')}
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap border-b border-border mb-6 gap-2 pb-1 w-full">
        {[
          { id: 'weekly', label: t('weeklyTasksTab') },
          { id: 'lectures', label: t('allLecturesTab') },
          { id: 'practices', label: t('allPracticesTab') },
          { id: 'general_tasks', label: t('generalTasksTab') },
          { id: 'past_exams', label: t('pastExams') },
          { id: 'quizzes', label: t('quizzes') },
          { id: 'summaries', label: t('summaries') }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "pb-2 px-3 text-sm font-medium transition-colors relative whitespace-nowrap",
              activeTab === tab.id ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 inset-x-0 h-0.5 bg-primary rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1">
        {activeTab === 'weekly' && (
          <div className="space-y-6">
            {/* Week Selector */}
            <div className="flex flex-wrap gap-2 mb-6">
              {Array.from({ length: activeCourse.weeksCount || 14 }, (_, i) => i + 1).map((week) => {
                const weekTasks = data.tasks[activeCourse.id]?.[week];
                const isCompleted = weekTasks && weekTasks.length > 0 && weekTasks.every(t => t.checked);
                
                return (
                  <button
                    key={week}
                    onClick={() => setSelectedWeek(week)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2",
                      selectedWeek === week
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-card border border-border text-foreground hover:bg-secondary/50",
                      isCompleted && selectedWeek !== week ? "border-primary/50 text-primary" : ""
                    )}
                  >
                    {t('week')} {week}
                    {isCompleted && (
                      <span className={cn(
                        "w-2 h-2 rounded-full",
                        selectedWeek === week ? "bg-primary-foreground" : "bg-primary"
                      )} />
                    )}
                  </button>
                );
              })}
            </div>
            
            <WeeklyTasks courseId={activeCourse.id} selectedWeek={selectedWeek} />
          </div>
        )}
        
        {activeTab === 'lectures' && <AllTasksByType courseId={activeCourse.id} type="lecture" />}
        {activeTab === 'practices' && <AllTasksByType courseId={activeCourse.id} type="tutorial" />}
        
        {['general_tasks', 'past_exams', 'quizzes', 'summaries'].includes(activeTab) && (
          <div className="max-w-2xl mx-auto">
            <CategorySection 
              courseId={activeCourse.id} 
              category={activeTab} 
              title={
                activeTab === 'general_tasks' ? t('generalTasksTab') :
                activeTab === 'past_exams' ? t('pastExams') :
                activeTab === 'quizzes' ? t('quizzes') :
                t('summaries')
              } 
              icon={activeTab === 'general_tasks' ? ListTodo : FileText} 
            />
          </div>
        )}
      </div>

      {/* Course Settings Modal */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent dir={language === 'he' ? 'rtl' : 'ltr'} className={language === 'he' ? 'text-right' : 'text-left'}>
          <DialogHeader>
            <DialogTitle>{t('courseSettings')}: {activeCourse.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 text-start">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">{t('courseName')}</label>
              <Input 
                value={editData.name} 
                onChange={(e) => setEditData({...editData, name: e.target.value})} 
                className="text-start"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">{t('learningWeeks')}</label>
                <Input 
                  type="number" 
                  min="1" 
                  max="20" 
                  value={editData.weeksCount} 
                  onChange={(e) => setEditData({...editData, weeksCount: e.target.value})} 
                  className="text-start"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">{t('credits')}</label>
                <Input 
                  type="number" 
                  step="0.5" 
                  min="0"
                  value={editData.credits} 
                  onChange={(e) => setEditData({...editData, credits: e.target.value})} 
                  className="text-start"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">{t('semester')}</label>
              <Input 
                placeholder={t('semesterPlaceholder')}
                value={editData.semester} 
                onChange={(e) => setEditData({...editData, semester: e.target.value})} 
                className="text-start"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:justify-start">
            <Button variant="outline" onClick={() => setIsSettingsOpen(false)}>{t('cancel')}</Button>
            <Button onClick={handleSaveSettings}>{t('saveChanges')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};
