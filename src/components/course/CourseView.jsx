import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { WeeklyTasks } from './WeeklyTasks';
import { GlobalTasks } from './GlobalTasks';
import { CourseFiles } from '../files/CourseFiles';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { Settings } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Input } from '../ui/input';

export const CourseView = () => {
  const { activeCourse, data, updateCourse } = useStore();
  const [activeTab, setActiveTab] = useState('weekly'); // 'weekly' or 'global'
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
      <div className="mb-6 flex items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{activeCourse.name}</h1>
          <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
            {activeCourse.credits > 0 && <span>{activeCourse.credits} נק"ז</span>}
            {activeCourse.semester && <span>סמסטר {activeCourse.semester}</span>}
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleOpenSettings} className="gap-2">
          <Settings className="w-4 h-4" />
          הגדרות קורס
        </Button>
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
      <div className="flex-1">
        {activeTab === 'weekly' ? (
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
                    שבוע {week}
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
            <CourseFiles courseId={activeCourse.id} selectedWeek={selectedWeek} />
          </div>
        ) : (
          <GlobalTasks courseId={activeCourse.id} />
        )}
      </div>

      {/* Course Settings Modal */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>הגדרות קורס: {activeCourse.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">שם הקורס</label>
              <Input 
                value={editData.name} 
                onChange={(e) => setEditData({...editData, name: e.target.value})} 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">מספר שבועות למידה</label>
                <Input 
                  type="number" 
                  min="1" 
                  max="20" 
                  value={editData.weeksCount} 
                  onChange={(e) => setEditData({...editData, weeksCount: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">נקודות זכות (נ"ז)</label>
                <Input 
                  type="number" 
                  step="0.5" 
                  min="0"
                  value={editData.credits} 
                  onChange={(e) => setEditData({...editData, credits: e.target.value})} 
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">סמסטר</label>
              <Input 
                placeholder="לדוגמה: א', ב', קיץ"
                value={editData.semester} 
                onChange={(e) => setEditData({...editData, semester: e.target.value})} 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSettingsOpen(false)}>ביטול</Button>
            <Button onClick={handleSaveSettings}>שמור שינויים</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};
