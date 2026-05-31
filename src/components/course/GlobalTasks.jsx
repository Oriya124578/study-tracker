import React, { useState, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useStore } from '../../store/useStore';
import { Plus, Trash2, CheckCircle2, Circle, FileText, Paperclip, Upload, X } from 'lucide-react';
import { useCourseFiles } from '../../hooks/useCourseFiles';
import { useTranslation } from '../../hooks/useTranslation';

const CategorySection = ({ courseId, category, title, icon: Icon }) => {
  const { data, addGlobalTask, deleteGlobalTask, toggleGlobalTask, attachFileToGlobalTask, removeFileFromGlobalTask, setIsUploading } = useStore();
  const { t } = useTranslation();
  const { upload, remove, openSigned } = useCourseFiles(courseId);
  const [newTaskLabel, setNewTaskLabel] = useState('');
  const [uploadingTask, setUploadingTask] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [addMode, setAddMode] = useState(false);
  const fileInputRef = useRef(null);
  const newFileInputRef = useRef(null);

  const tasks = data.globalTasks?.[courseId]?.[category] || [];

  const handleAdd = () => {
    if (newTaskLabel.trim()) {
      addGlobalTask(courseId, category, newTaskLabel);
      setNewTaskLabel('');
      setAddMode(false);
    }
  };

  // "+" menu → "Upload file": uploads and creates a task labelled by the file name.
  const handleUploadAsTask = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const [uploaded] = await upload(category, [file]);
      if (uploaded) addGlobalTask(courseId, category, uploaded.name, [uploaded]);
    } finally {
      setIsUploading(false);
      if (newFileInputRef.current) newFileInputRef.current.value = '';
    }
  };

  const handleFileUpload = async (e, taskId) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingTask(taskId);
    setIsUploading(true);
    try {
      const [uploaded] = await upload(category, [file]);
      if (uploaded) {
        attachFileToGlobalTask(courseId, category, taskId, uploaded);
      }
    } finally {
      setUploadingTask(null);
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const triggerUpload = (taskId) => {
    setUploadingTask(taskId);
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleDeleteFile = async (taskId, file) => {
    if (!window.confirm(t('confirmDeleteFile'))) return;
    const ok = await remove(file.path);
    if (ok) removeFileFromGlobalTask(courseId, category, taskId, file.path);
  };

  return (
    <Card className="border-border shadow-sm bg-card">
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={(e) => handleFileUpload(e, uploadingTask)}
      />
      <input
        type="file"
        ref={newFileInputRef}
        style={{ display: 'none' }}
        onChange={handleUploadAsTask}
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
                  <button
                    onClick={() => toggleGlobalTask(courseId, category, task.id)}
                    role="checkbox"
                    aria-checked={task.checked}
                    aria-label={task.label}
                    className="shrink-0"
                  >
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
                      <button
                        type="button"
                        onClick={() => openSigned(file)}
                        className="flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-1 rounded-e-none rounded-s-md hover:bg-primary/20 transition-colors"
                      >
                        <FileText className="w-3 h-3" />
                        <span className="truncate max-w-[150px]" dir="ltr">{file.name}</span>
                      </button>
                      <button
                        onClick={() => handleDeleteFile(task.id, file)}
                        className="bg-destructive/10 hover:bg-destructive text-destructive hover:text-destructive-foreground px-1.5 py-1 rounded-e-md rounded-s-none transition-colors"
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

        {/* Add: task or file */}
        {addMode ? (
          <div className="flex gap-2">
            <Input
              autoFocus
              placeholder={t('taskNamePlaceholder')}
              value={newTaskLabel}
              onChange={(e) => setNewTaskLabel(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAdd();
                if (e.key === 'Escape') { setAddMode(false); setNewTaskLabel(''); }
              }}
              className="flex-1"
            />
            <Button type="button" onClick={handleAdd} className="shrink-0 bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="w-4 h-4" />
            </Button>
            <Button type="button" variant="ghost" onClick={() => { setAddMode(false); setNewTaskLabel(''); }} className="shrink-0">
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div className="relative">
            <Button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              className="w-full gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/80"
            >
              <Plus className="w-4 h-4" />
              {t('addItem')}
            </Button>

            {menuOpen && (
              <>
                {/* click-away backdrop */}
                <button
                  type="button"
                  aria-hidden="true"
                  tabIndex={-1}
                  className="fixed inset-0 z-10 cursor-default"
                  onClick={() => setMenuOpen(false)}
                />
                <div
                  role="menu"
                  className="absolute bottom-full mb-2 inset-x-0 z-20 bg-card border border-border rounded-xl shadow-lg overflow-hidden animate-in fade-in slide-in-from-bottom-1"
                >
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => { setMenuOpen(false); setAddMode(true); }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-secondary/60 transition-colors text-start"
                  >
                    <Plus className="w-4 h-4 text-primary" />
                    {t('addTask')}
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => { setMenuOpen(false); newFileInputRef.current?.click(); }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-secondary/60 transition-colors text-start border-t border-border"
                  >
                    <Upload className="w-4 h-4 text-primary" />
                    {t('uploadFileOption')}
                  </button>
                </div>
              </>
            )}
          </div>
        )}

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
