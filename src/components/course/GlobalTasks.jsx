import React, { useState, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useStore } from '../../store/useStore';
import { Plus, Trash2, CheckCircle2, Circle, FileText, Paperclip } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import { useTranslation } from '../../hooks/useTranslation';

const CategorySection = ({ courseId, category, title, icon: Icon }) => {
  const { data, addGlobalTask, deleteGlobalTask, toggleGlobalTask, attachFileToGlobalTask } = useStore();
  const { t } = useTranslation();
  const [newTaskLabel, setNewTaskLabel] = useState('');
  const [uploadingTask, setUploadingTask] = useState(null);
  const fileInputRef = useRef(null);

  const tasks = data.globalTasks[courseId]?.[category] || [];

  const handleAdd = () => {
    if (newTaskLabel.trim()) {
      addGlobalTask(courseId, category, newTaskLabel);
      setNewTaskLabel('');
    }
  };

  const handleFileUpload = async (e, taskId) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingTask(taskId);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const storagePath = `${user.id}/${courseId}/${category}/${Date.now()}_${file.name}`;
      
      const { error } = await supabase.storage
        .from('course_files')
        .upload(storagePath, file, { cacheControl: '3600', upsert: false });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage.from('course_files').getPublicUrl(storagePath);

      attachFileToGlobalTask(courseId, category, taskId, {
        name: file.name,
        url: publicUrl,
        path: storagePath
      });
      
    } catch (error) {
      console.error("Upload failed", error);
      alert(t('uploadError'));
    } finally {
      setUploadingTask(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const triggerUpload = (taskId) => {
    setUploadingTask(taskId);
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleDeleteFile = async (taskId, filePath) => {
    if (!window.confirm('האם אתה בטוח שברצונך למחוק קובץ זה?')) return;
    
    try {
      await supabase.storage.from('course_files').remove([filePath]);
      const { removeFileFromGlobalTask } = useStore.getState();
      removeFileFromGlobalTask(courseId, category, taskId, filePath);
    } catch (err) {
      console.error("Failed to delete file", err);
      alert("שגיאה במחיקת הקובץ");
    }
  };

  return (
    <Card className="border-border shadow-sm bg-card">
      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        onChange={(e) => handleFileUpload(e, uploadingTask)} 
      />
      <CardHeader className="pb-3 border-b">
        <CardTitle className="text-lg flex items-center gap-2 text-foreground">
          <Icon className="w-5 h-5 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        
        {/* Task List */}
        <div className="space-y-3">
          {tasks.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">{t('noTasksInCategory')}</p>
          ) : (
            tasks.map(task => (
              <div 
                key={task.id} 
                className={`flex flex-col gap-2 p-3 rounded-xl border transition-colors ${
                  task.checked ? 'bg-muted/30 border-transparent' : 'bg-background border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <button onClick={() => toggleGlobalTask(courseId, category, task.id)} className="shrink-0">
                    {task.checked ? (
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                    ) : (
                      <Circle className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
                    )}
                  </button>
                  <span className={`flex-1 text-sm ${task.checked ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                    {task.label}
                  </span>
                  <button 
                    onClick={() => deleteGlobalTask(courseId, category, task.id)}
                    className="text-muted-foreground hover:text-destructive opacity-50 hover:opacity-100 transition-opacity p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* File Attachment Area */}
                <div className="ps-8 flex flex-wrap gap-2">
                  {task.files && task.files.map((file, i) => (
                    <div key={i} className="flex items-center group">
                      <a 
                        href={file.url} 
                        target="_blank" 
                        rel="noreferrer"
                        download={file.name}
                        className="flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-1 rounded-e-none rounded-s-md hover:bg-primary/20 transition-colors"
                      >
                        <FileText className="w-3 h-3" />
                        <span className="truncate max-w-[150px]" dir="ltr">{file.name}</span>
                      </a>
                      <button
                        onClick={() => handleDeleteFile(task.id, file.path)}
                        className="bg-destructive/10 hover:bg-destructive text-destructive hover:text-destructive-foreground px-1.5 py-1 rounded-e-md rounded-s-none transition-colors"
                        title="מחק קובץ"
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
                      onClick={() => triggerUpload(task.id)}
                      className="flex items-center gap-1 text-xs text-muted-foreground bg-muted hover:bg-secondary hover:text-secondary-foreground px-2 py-1 rounded-md transition-colors"
                    >
                      <Paperclip className="w-3 h-3" />
                      {t('addFile')}
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add New Task */}
        <div className="flex gap-2">
          <Input 
            placeholder={t('taskNamePlaceholder')} 
            value={newTaskLabel}
            onChange={(e) => setNewTaskLabel(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            className="flex-1"
          />
          <Button type="button" onClick={handleAdd} className="shrink-0 bg-secondary text-secondary-foreground hover:bg-secondary/80">
            <Plus className="w-4 h-4" />
          </Button>
        </div>

      </CardContent>
    </Card>
  );
};

export const GlobalTasks = ({ courseId }) => {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
      <CategorySection courseId={courseId} category="past_exams" title={t('pastExams')} icon={FileText} />
      <CategorySection courseId={courseId} category="summaries" title={t('summaries')} icon={FileText} />
      <CategorySection courseId={courseId} category="quizzes" title={t('quizzes')} icon={FileText} />
    </div>
  );
};
