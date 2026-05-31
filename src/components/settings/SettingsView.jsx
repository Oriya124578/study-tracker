import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useStore } from '../../store/useStore';
import { supabase } from '../../supabaseClient';
import { Settings, RefreshCcw, LogOut, BookOpen, Plus, Edit2, Trash2, Globe, Archive, ArchiveRestore, User, Clock, Palette } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { useTranslation } from '../../hooks/useTranslation';
import { toast } from '../../store/useToast';
import { cn } from '../../lib/utils';

export const SettingsView = () => {
  const { data, resetSemester, addCourse, updateCourse, archiveCourse, language, setLanguage, theme, setTheme, setProfile, pomoSettings, setPomoSettings } = useStore();
  const { t } = useTranslation();
  const [editingCourse, setEditingCourse] = useState(null); // The course object being edited/added
  const [isAddMode, setIsAddMode] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  // Profile local state
  const [displayName, setDisplayName] = useState(data?.profile?.displayName || "");
  const [academicYear, setAcademicYear] = useState(data?.profile?.academicYear || "שנה א'");
  const [semester, setSemester] = useState(data?.profile?.semester || "סמסטר א'");

  // Pomodoro local state
  const [pomoWork, setPomoWork] = useState(pomoSettings?.work || 25);
  const [pomoBreak, setPomoBreak] = useState(pomoSettings?.break || 5);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleReset = () => {
    if (window.confirm(t('confirmResetSemester'))) {
      resetSemester();
      toast.success(t('resetSemesterSuccess'));
    }
  };

  const handleSaveProfile = () => {
    setProfile({ displayName, academicYear, semester });
    toast.success(t('profileSaved', 'פרופיל עודכן בהצלחה'));
  };

  const handleSavePomodoro = () => {
    setPomoSettings({ work: parseInt(pomoWork) || 25, break: parseInt(pomoBreak) || 5 });
    toast.success(t('pomodoroSaved', 'הגדרות פומודורו עודכנו'));
  };

  const openEditModal = (course) => {
    setIsAddMode(false);
    setEditingCourse({ 
      ...course, 
      moedA: course.moedA || course.exams?.moedA || "",
      moedB: course.moedB || course.exams?.moedB || "",
      moedC: course.moedC || course.exams?.moedC || "",
      notebookLm: data.links[course.id]?.notebookLm || "", 
      gemini: data.links[course.id]?.gemini || "" 
    });
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
      gemini: "",
      isArchived: false
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
      useStore.getState().saveLinks(editingCourse.id, {
        ...data.links[editingCourse.id],
        notebookLm: editingCourse.notebookLm,
        gemini: editingCourse.gemini
      });
    }
    setEditingCourse(null);
  };

  const handleArchiveToggle = (courseId, currentStatus) => {
    const msg = currentStatus 
      ? t('confirmRestoreCourse', 'האם לשחזר קורס זה מהארכיון?')
      : t('confirmArchiveCourse', 'האם להעביר קורס זה לארכיון? הקורס יוסתר מהתפריט.');
    
    if (window.confirm(msg)) {
      archiveCourse(courseId, !currentStatus);
      toast.success(currentStatus ? t('courseRestored', 'הקורס שוחזר') : t('courseArchived', 'הקורס הועבר לארכיון'));
    }
  };

  const activeCourses = data?.courses?.filter(c => !c.isArchived) || [];
  const archivedCourses = data?.courses?.filter(c => c.isArchived) || [];

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4 sm:p-6 md:p-8 animate-in fade-in duration-500 pb-24">
      
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

      {/* 1. Profile Card */}
      <Card className="shadow-sm border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            {t('profileTitle', 'פרופיל אישי')}
          </CardTitle>
          <CardDescription>{t('profileDesc', 'הגדר את השם שלך שיוצג באפליקציה')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="space-y-2 flex-1 w-full">
                <label className="text-sm font-medium text-foreground">{t('displayName', 'שם תצוגה')}</label>
                <Input 
                  value={displayName} 
                  onChange={(e) => setDisplayName(e.target.value)} 
                  placeholder={t('displayNamePlaceholder', 'לדוגמה: אוריה')}
                />
              </div>
              <div className="space-y-2 flex-1 w-full">
                <label className="text-sm font-medium text-foreground">{t('academicYear', 'שנת לימודים')}</label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={academicYear} 
                  onChange={(e) => setAcademicYear(e.target.value)}
                >
                  {['שנה א\'', 'שנה ב\'', 'שנה ג\'', 'שנה ד\''].map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2 flex-1 w-full">
                <label className="text-sm font-medium text-foreground">{t('semester', 'סמסטר')}</label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={semester} 
                  onChange={(e) => setSemester(e.target.value)}
                >
                  {['סמסטר א\'', 'סמסטר ב\'', 'סמסטר קיץ'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSaveProfile} className="w-full sm:w-auto">{t('saveChanges')}</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Course Manager Card */}
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
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeCourses.map(course => (
              <div key={course.id} className="border border-border p-4 rounded-xl flex flex-col justify-between bg-card gap-4">
                <div>
                  <h3 className="font-bold text-foreground">{course.name}</h3>
                  <p className="text-sm text-muted-foreground">{t('moedA')}: {(course.moedA || course.exams?.moedA) ? new Date(course.moedA || course.exams.moedA).toLocaleDateString('he-IL') : t('notSet')}</p>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="ghost" size="sm" onClick={() => handleArchiveToggle(course.id, course.isArchived)} className="text-muted-foreground hover:text-amber-500">
                    <Archive className="w-4 h-4 ml-1" />
                    {t('archive', 'ארכיון')}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => openEditModal(course)} className="text-muted-foreground hover:text-primary">
                    <Edit2 className="w-4 h-4 ml-1" />
                    {t('edit')}
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {archivedCourses.length > 0 && (
            <div className="mt-8 pt-6 border-t">
              <Button 
                variant="ghost" 
                onClick={() => setShowArchived(!showArchived)}
                className="w-full flex items-center justify-between text-muted-foreground"
              >
                <span>{t('archivedCourses', 'קורסים בארכיון')} ({archivedCourses.length})</span>
                <ArchiveRestore className="w-4 h-4" />
              </Button>
              
              {showArchived && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 opacity-70">
                  {archivedCourses.map(course => (
                    <div key={course.id} className="border border-border p-4 rounded-xl flex flex-col justify-between bg-secondary/50 gap-4">
                      <div>
                        <h3 className="font-bold text-foreground">{course.name}</h3>
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" size="sm" onClick={() => handleArchiveToggle(course.id, course.isArchived)} className="text-primary hover:text-primary">
                          <ArchiveRestore className="w-4 h-4 ml-1" />
                          {t('restore', 'שחזר')}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 3. Preferences Card */}
      <Card className="shadow-sm border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            {t('preferencesTitle', 'העדפות')}
          </CardTitle>
          <CardDescription>{t('preferencesDesc', 'הגדרות שפה, עיצוב ופומודורו')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* Theme */}
          <div className="flex items-center justify-between p-4 rounded-xl border bg-card">
            <div>
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Palette className="w-4 h-4" />
                {t('themeTitle', 'עיצוב (Theme)')}
              </h3>
              <p className="text-sm text-muted-foreground">{t('themeDesc', 'בחר בין מצב בהיר לכהה')}</p>
            </div>
            <div className="flex items-center gap-2 bg-secondary p-1 rounded-lg">
              <Button variant={theme === 'light' ? 'default' : 'ghost'} size="sm" onClick={() => setTheme('light')}>
                {t('light', 'בהיר')}
              </Button>
              <Button variant={theme === 'dark' ? 'default' : 'ghost'} size="sm" onClick={() => setTheme('dark')}>
                {t('dark', 'כהה')}
              </Button>
            </div>
          </div>

          {/* Language */}
          <div className="flex items-center justify-between p-4 rounded-xl border bg-card">
            <div>
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Globe className="w-4 h-4" />
                {t('languageTitle')}
              </h3>
              <p className="text-sm text-muted-foreground">{t('languageDesc')}</p>
            </div>
            <div className="flex items-center gap-2 bg-secondary p-1 rounded-lg">
              <Button variant={language === 'he' ? 'default' : 'ghost'} size="sm" onClick={() => setLanguage('he')}>
                {t('hebrew')}
              </Button>
              <Button variant={language === 'en' ? 'default' : 'ghost'} size="sm" onClick={() => setLanguage('en')}>
                {t('english')}
              </Button>
            </div>
          </div>

          {/* Pomodoro */}
          <div className="p-4 rounded-xl border bg-card space-y-4">
            <div>
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {t('pomodoroSettings', 'הגדרות פומודורו')}
              </h3>
              <p className="text-sm text-muted-foreground">{t('pomodoroDesc', 'קבע את משך הזמן למיקוד ולהפסקה')}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="space-y-2 flex-1">
                <label className="text-sm font-medium text-foreground">{t('workTime', 'זמן מיקוד (דקות)')}</label>
                <Input type="number" min="1" max="120" value={pomoWork} onChange={(e) => setPomoWork(e.target.value)} />
              </div>
              <div className="space-y-2 flex-1">
                <label className="text-sm font-medium text-foreground">{t('breakTime', 'זמן הפסקה (דקות)')}</label>
                <Input type="number" min="1" max="60" value={pomoBreak} onChange={(e) => setPomoBreak(e.target.value)} />
              </div>
              <Button onClick={handleSavePomodoro} className="w-full sm:w-auto">{t('save')}</Button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="mt-8 pt-4 border-t">
            <h3 className="text-sm font-bold text-destructive uppercase tracking-wider mb-4 px-2">{t('dangerZone', 'אזור סכנה')}</h3>
            <div className="space-y-4">
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
            </div>
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
            <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto px-1">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('courseName')}</label>
                <Input value={editingCourse.name} onChange={e => setEditingCourse({...editingCourse, name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('weeksCountLabel')}</label>
                <Input type="number" min="1" max="20" value={editingCourse.weeksCount} onChange={e => setEditingCourse({...editingCourse, weeksCount: parseInt(e.target.value)})} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
