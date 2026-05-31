import React, { useState, useRef } from 'react';
import { Check, FileText, Paperclip, Trash2 } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useCourseFiles } from '../../hooks/useCourseFiles';
import { useTranslation } from '../../hooks/useTranslation';

export const AllTasksByType = ({ courseId, type }) => {
  const { data, toggleTask, attachFileToTask, removeFileFromTask, setIsUploading } = useStore();
  const { t } = useTranslation();
  const { upload, remove, openSigned } = useCourseFiles(courseId);
  const [uploadingTask, setUploadingTask] = useState(null);
  const [activeWeek, setActiveWeek] = useState(null);
  
  const fileInputRef = useRef(null);
  
  // Extract all weeks that have tasks of the specified type
  const courseTasksByWeek = data.tasks[courseId] || {};
  const weeks = Object.keys(courseTasksByWeek).sort((a, b) => parseInt(a) - parseInt(b));
  
  const handleFileUpload = async (e, week, taskId) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingTask(taskId);
    setIsUploading(true);
    try {
      const [uploaded] = await upload(`week_${week}`, [file]);
      if (uploaded) {
        attachFileToTask(courseId, week, taskId, uploaded);
      }
    } finally {
      setUploadingTask(null);
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteFile = async (week, taskId, file) => {
    if (!window.confirm(t('confirmDeleteFile'))) return;
    const ok = await remove(file.path);
    if (ok) removeFileFromTask(courseId, week, taskId, file.path);
  };

  const triggerUpload = (week, taskId) => {
    setActiveWeek(week);
    setUploadingTask(taskId);
    if (fileInputRef.current) fileInputRef.current.click();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        onChange={(e) => handleFileUpload(e, activeWeek, uploadingTask)} 
      />
      
      {weeks.map(week => {
        const weekTasks = courseTasksByWeek[week].filter(task => task.type === type);
        if (weekTasks.length === 0) return null;
        
        return (
          <div key={week} className="space-y-3">
            <h4 className="font-semibold text-lg text-foreground border-b pb-2 mb-3">
              {t('week')} {week}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {weekTasks.map(task => (
                <div
                  key={task.id}
                  className={`bg-card border rounded-xl p-4 flex flex-col gap-3 transition-all shadow-sm border-border ${
                    task.checked ? 'bg-muted/30 opacity-70' : ''
                  }`}
                >
                  {/* Task Header */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleTask(courseId, week, task.id)}
                      role="checkbox"
                      aria-checked={task.checked}
                      aria-label={task.label}
                      className="p-2 -mx-2 shrink-0 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                        task.checked ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground hover:border-primary'
                      }`}>
                        {task.checked && <Check className="w-4 h-4" />}
                      </div>
                    </button>
                    
                    <span className={`font-medium flex-1 ${task.checked ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                      {task.label}
                    </span>
                  </div>

                  {/* Task Files */}
                  <div className="ps-10 flex flex-wrap gap-2">
                    {task.files && task.files.map((file, i) => (
                      <div key={i} className="flex items-center group">
                        <button
                          type="button"
                          onClick={() => openSigned(file)}
                          className="flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-1 rounded-e-none rounded-s-md hover:bg-primary/20 transition-colors"
                        >
                          <FileText className="w-3 h-3" />
                          <span className="truncate max-w-[150px]" dir="ltr">{file.name}</span>
                        </button>
                        <button
                          onClick={() => handleDeleteFile(week, task.id, file)}
                          className="bg-destructive/10 hover:bg-destructive text-destructive hover:text-destructive-foreground px-2.5 py-1.5 md:px-1.5 md:py-1 rounded-e-md rounded-s-none transition-colors"
                          title={t('deleteFileTitle')}
                          aria-label={`${t('deleteFileTitle')}: ${file.name}`}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    
                    {uploadingTask === task.id ? (
                      <span className="text-xs text-muted-foreground flex items-center gap-1 px-2 py-1 animate-pulse">
                        {t('uploading')}
                      </span>
                    ) : (
                      <button 
                        onClick={() => triggerUpload(week, task.id)}
                        className="flex items-center gap-1 text-xs text-muted-foreground bg-muted hover:bg-secondary hover:text-secondary-foreground px-2 py-1 rounded-md transition-colors"
                      >
                        <Paperclip className="w-3 h-3" />
                        {t('addFile')}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
