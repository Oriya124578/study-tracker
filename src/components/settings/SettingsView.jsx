import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useStore } from '../../store/useStore';
import { supabase } from '../../supabaseClient';
import { Settings, RefreshCcw, LogOut, BookOpen, Plus, Edit2, Trash2, Globe } from 'lucide-react';
import { MigrateLocalFiles } from './MigrateLocalFiles';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { useTranslation } from '../../hooks/useTranslation';
import { toast } from '../../store/useToast';

export const SettingsView = () => {
  const { data, resetSemester, addCourse, updateCourse, language, setLanguage } = useStore();
  const { t } = useTranslation();
  const [editingCourse, setEditingCourse] = useState(null); // The course object being edited/added
  const [isAddMode, setIsAddMode] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleReset = () => {
    if (window.confirm(t('confirmResetSemester'))) {
      resetSemester();
      toast.success(t('resetSemesterSuccess'));
    }
  };

  const openEditModal = (course) => {
    setIsAddMode(false);
    setEditingCourse({ ...course, notebookLm: data.links[course.id]?.notebookLm || "", gemini: data.links[course.id]?.gemini || "" });
  };

  const openAddModal = () => {
    setIsAddMode(true);
    setEditingCourse({
      id: `course-${Date.now()}`,
      name: "",
      weeksCount: 14,
      moedA: "",
      moedB: "",
      moedC: "",
      notebookLm: "",
      gemini: ""
    });
  };

  const saveCourse = () => {
    if (!editingCourse.name) return toast.error(t('courseNameRequired'));
    
    if (isAddMode) {
      addCourse({
        id: editingCourse.id,
        name: editingCourse.name,
        weeksCount: editingCourse.weeksCount,
        moedA: editingCourse.moedA,
        moedB: editingCourse.moedB,
        moedC: editingCourse.moedC,
        defaultNotebookLmLink: editingCourse.notebookLm,
        defaultGeminiLink: editingCourse.gemini
      });
    } else {
      updateCourse(editingCourse.id, {
        name: editingCourse.name,
        weeksCount: editingCourse.weeksCount,
        moedA: editingCourse.moedA,
        moedB: editingCourse.moedB,
        moedC: editingCourse.moedC
      });
      // We also need to update links using the store's saveLinks function.
      // But we don't have saveLinks directly accessible here easily, so we can dispatch it via useStore
      useStore.getState().saveLinks(editingCourse.id, {
        ...data.links[editingCourse.id],
        notebookLm: editingCourse.notebookLm,
        gemini: editingCourse.gemini
      });
    }
    setEditingCourse(null);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-6 md:p-8 animate-in fade-in duration-500">
      
      {/* Settings Header */}
      <div className="flex items-center gap-3 border-b pb-4">
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
          <Settings className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t('settingsTitle')}</h1>
          <p className="text-muted-foreground">{t('settingsDesc')}</p>
        </div>
      </div>

      {/* Course Manager */}
      <Card className="shadow-sm border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              {t('courseManagerTitle')}
            </CardTitle>
            <CardDescription>{t('courseManagerDesc')}</CardDescription>
          </div>
          <Button onClick={openAddModal} className="flex items-center gap-1 bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="w-4 h-4" />
            {t('newCourse')}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.courses.map(course => (
              <div key={course.id} className="border border-border p-4 rounded-xl flex justify-between items-center bg-card">
                <div>
                  <h3 className="font-bold text-foreground">{course.name}</h3>
                  <p className="text-sm text-muted-foreground">{t('moedA')}: {course.moedA ? new Date(course.moedA).toLocaleDateString('he-IL') : t('notSet')}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => openEditModal(course)} className="text-muted-foreground hover:text-primary">
                  <Edit2 className="w-4 h-4 ml-1" />
                  {t('edit')}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* File Migration Tool */}
      <MigrateLocalFiles />

      {/* Account & Data */}
      <Card className="shadow-sm border-border">
        <CardHeader>
          <CardTitle>{t('accountDataTitle')}</CardTitle>
          <CardDescription>{t('accountDataDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl border bg-card">
            <div>
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Globe className="w-4 h-4" />
                {t('languageTitle')}
              </h3>
              <p className="text-sm text-muted-foreground">{t('languageDesc')}</p>
            </div>
            <div className="flex items-center gap-2 bg-secondary p-1 rounded-lg">
              <Button 
                variant={language === 'he' ? 'default' : 'ghost'} 
                size="sm" 
                onClick={() => setLanguage('he')}
              >
                {t('hebrew')}
              </Button>
              <Button 
                variant={language === 'en' ? 'default' : 'ghost'} 
                size="sm" 
                onClick={() => setLanguage('en')}
              >
                {t('english')}
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-destructive/5 border border-destructive/20">
            <div>
              <h3 className="font-semibold text-destructive flex items-center gap-2">
                <RefreshCcw className="w-4 h-4" />
                {t('resetSemesterTitle')}
              </h3>
              <p className="text-sm text-destructive/80">{t('resetSemesterDesc')}</p>
            </div>
            <Button variant="destructive" onClick={handleReset}>{t('resetNow')}</Button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl border bg-card">
            <div>
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <LogOut className="w-4 h-4" />
                {t('logoutTitle')}
              </h3>
              <p className="text-sm text-muted-foreground">{t('logoutDesc')}</p>
            </div>
            <Button variant="outline" onClick={handleLogout}>{t('logoutBtn')}</Button>
          </div>
        </CardContent>
      </Card>

      {/* Course Edit/Add Modal */}
      {editingCourse && (
        <Dialog open={true} onOpenChange={() => setEditingCourse(null)}>
          <DialogContent className="sm:max-w-[425px]" dir={language === 'en' ? 'ltr' : 'rtl'}>
            <DialogHeader>
              <DialogTitle>{isAddMode ? t('addNewCourse') : `${t('editCourse')}: ${editingCourse.name}`}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('courseName')}</label>
                <Input value={editingCourse.name} onChange={e => setEditingCourse({...editingCourse, name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('weeksCountLabel')}</label>
                <Input type="number" min="1" max="20" value={editingCourse.weeksCount} onChange={e => setEditingCourse({...editingCourse, weeksCount: parseInt(e.target.value)})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('examDateA')}</label>
                  <Input type="date" value={editingCourse.moedA} onChange={e => setEditingCourse({...editingCourse, moedA: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('examDateB')}</label>
                  <Input type="date" value={editingCourse.moedB} onChange={e => setEditingCourse({...editingCourse, moedB: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('notebookLmLink')}</label>
                <Input value={editingCourse.notebookLm} onChange={e => setEditingCourse({...editingCourse, notebookLm: e.target.value})} placeholder="https://notebooklm.google.com/..." dir="ltr" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('geminiLink')}</label>
                <Input value={editingCourse.gemini} onChange={e => setEditingCourse({...editingCourse, gemini: e.target.value})} placeholder="https://gemini.google.com/..." dir="ltr" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingCourse(null)}>{t('cancel')}</Button>
              <Button onClick={saveCourse}>{t('saveCourse')}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

    </div>
  );
};
