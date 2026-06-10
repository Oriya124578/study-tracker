import os

filepath = 'src/components/settings/SettingsView.jsx'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# We can find the return statement of SettingsView
# `return (\n    <div className="space-y-6 max-w-4xl mx-auto p-4 sm:p-6 md:p-8 animate-in fade-in duration-500 pb-24">`

# We need to construct the subcomponents.
new_content = """import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useStore } from '../../store/useStore';
import { signOut } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { Settings, RefreshCcw, LogOut, BookOpen, Plus, Edit2, Trash2, Globe, Archive, ArchiveRestore, User, Clock, Palette, Bot, ChevronRight, ChevronLeft, ChevronRightIcon, ChevronLeftIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { useTranslation } from '../../hooks/useTranslation';
import { toast } from '../../store/useToast';
import { cn } from '../../lib/utils';
import { NotificationSettings } from './NotificationSettings';
import { CITIES_LIST } from '../../lib/shabbatService';

const BackButton = () => {
  const { setActiveCategory } = useStore();
  const { language } = useTranslation();
  return (
    <Button variant="ghost" onClick={() => setActiveCategory('settings')} className="mb-4">
      {language === 'he' ? <ChevronRight className="w-4 h-4 ml-2" /> : <ChevronLeft className="w-4 h-4 mr-2" />}
      {language === 'he' ? 'חזור' : 'Back'}
    </Button>
  );
};

"""

# Let's extract the Profile card content
profile_card_start = content.find('{/* 1. Profile Card */}')
course_card_start = content.find('{/* 2. Course Manager Card */}')
notifs_start = content.find('{/* 3. Notifications Card (Phase 5) */}')
manager_start = content.find('{/* AI & Command Center Settings Card */}')
preferences_start = content.find('{/* 4. Preferences Card */}')
version_start = content.find('{/* Version Indicator */}')

profile_content = content[profile_card_start:course_card_start]
course_content = content[course_card_start:notifs_start]
notif_content = content[notifs_start:manager_start]
manager_content = content[manager_start:preferences_start]
preferences_full = content[preferences_start:version_start]

# We need to parse state variables from SettingsView and distribute them
# into individual components.
# The previous state hooks:
state_hooks = content[content.find('export const SettingsView = () => {'):content.find('const handleSaveAISettings = () => {')]

new_content += f"""
export const ProfileView = () => {{
  const {{ data, setProfile, language }} = useStore();
  const {{ t }} = useTranslation();
  const [displayName, setDisplayName] = useState(data?.profile?.displayName || "");
  const [academicYear, setAcademicYear] = useState(data?.profile?.academicYear || "שנה א'");
  const [semester, setSemester] = useState(data?.profile?.semester || "סמסטר א'");

  const handleSaveProfile = () => {{
    setProfile({{ displayName, academicYear, semester }});
    toast.success(t('profileSaved', 'פרופיל עודכן בהצלחה'));
  }};

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4 sm:p-6 md:p-8 animate-in fade-in duration-500 pb-24">
      <BackButton />
      {profile_content}
    </div>
  );
}};

export const StudiesView = () => {{
  const {{ data, addCourse, updateCourse, archiveCourse, language }} = useStore();
  const {{ t }} = useTranslation();
  const [editingCourse, setEditingCourse] = useState(null);
  const [isAddMode, setIsAddMode] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  const toDateInput = (val) => {{
    if (!val) return '';
    try {{
      const d = new Date(val);
      if (Number.isNaN(d.getTime())) return '';
      return d.toISOString().split('T')[0];
    }} catch {{ return ''; }}
  }};

  const openEditModal = (course) => {{
    setIsAddMode(false);
    setEditingCourse({{
      ...course,
      moedA: toDateInput(course.moedA || course.exams?.moedA),
      moedB: toDateInput(course.moedB || course.exams?.moedB),
      moedC: toDateInput(course.moedC || course.exams?.moedC),
      notebookLm: course.links?.notebookLm || course.defaultNotebookLmLink || "",
      gemini: course.links?.gemini || course.defaultGeminiLink || ""
    }});
  }};

  const openAddModal = () => {{
    setIsAddMode(true);
    setEditingCourse({{
      id: `course-${{Date.now()}}`,
      name: "",
      weeksCount: 14,
      moedA: "",
      moedB: "",
      moedC: "",
      notebookLm: "",
      gemini: "",
      isArchived: false
    }});
  }};

  const saveCourse = () => {{
    if (!editingCourse.name) return toast.error(t('courseNameRequired'));
    if (isAddMode) {{
      addCourse({{
        id: editingCourse.id,
        name: editingCourse.name,
        weeksCount: editingCourse.weeksCount,
        moedA: editingCourse.moedA,
        moedB: editingCourse.moedB,
        moedC: editingCourse.moedC,
        defaultNotebookLmLink: editingCourse.notebookLm,
        defaultGeminiLink: editingCourse.gemini
      }});
    }} else {{
      updateCourse(editingCourse.id, {{
        name: editingCourse.name,
        weeksCount: editingCourse.weeksCount,
        moedA: editingCourse.moedA,
        moedB: editingCourse.moedB,
        moedC: editingCourse.moedC
      }});
      useStore.getState().saveLinks(editingCourse.id, {{
        ...data.links[editingCourse.id],
        notebookLm: editingCourse.notebookLm,
        gemini: editingCourse.gemini
      }});
    }}
    setEditingCourse(null);
  }};

  const handleArchiveToggle = (courseId, currentStatus) => {{
    const msg = currentStatus ? t('confirmRestoreCourse') : t('confirmArchiveCourse');
    if (window.confirm(msg)) {{
      archiveCourse(courseId, !currentStatus);
      toast.success(currentStatus ? t('courseRestored') : t('courseArchived'));
    }}
  }};

  const activeCourses = data?.courses?.filter(c => !c.isArchived) || [];
  const archivedCourses = data?.courses?.filter(c => c.isArchived) || [];

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4 sm:p-6 md:p-8 animate-in fade-in duration-500 pb-24">
      <BackButton />
      {course_content}
      {{editingCourse && (
        <Dialog open={{true}} onOpenChange={{() => setEditingCourse(null)}}>
          <DialogContent className="sm:max-w-[425px]" dir={{language === 'en' ? 'ltr' : 'rtl'}}>
            <DialogHeader>
              <DialogTitle>{{isAddMode ? t('addNewCourse') : `${{t('editCourse')}}: ${{editingCourse.name}}`}}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto px-1">
              <div className="space-y-2">
                <label className="text-sm font-medium">{{t('courseName')}}</label>
                <Input value={{editingCourse.name}} onChange={{e => setEditingCourse({{{...editingCourse, name: e.target.value}}})}} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{{t('weeksCountLabel')}}</label>
                <Input type="number" min="1" max="20" value={{editingCourse.weeksCount}} onChange={{e => setEditingCourse({{{...editingCourse, weeksCount: parseInt(e.target.value)}}})}} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{{t('examDateA')}}</label>
                  <Input type="date" value={{editingCourse.moedA}} onChange={{e => setEditingCourse({{{...editingCourse, moedA: e.target.value}}})}} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{{t('examDateB')}}</label>
                  <Input type="date" value={{editingCourse.moedB}} onChange={{e => setEditingCourse({{{...editingCourse, moedB: e.target.value}}})}} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{{t('notebookLmLink')}}</label>
                <Input value={{editingCourse.notebookLm}} onChange={{e => setEditingCourse({{{...editingCourse, notebookLm: e.target.value}}})}} placeholder="https://notebooklm.google.com/..." dir="ltr" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{{t('geminiLink')}}</label>
                <Input value={{editingCourse.gemini}} onChange={{e => setEditingCourse({{{...editingCourse, gemini: e.target.value}}})}} placeholder="https://gemini.google.com/..." dir="ltr" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={{() => setEditingCourse(null)}}>{{t('cancel')}}</Button>
              <Button onClick={{saveCourse}}>{{t('saveCourse')}}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}}
    </div>
  );
}};

export const NotificationsView = () => {{
  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4 sm:p-6 md:p-8 animate-in fade-in duration-500 pb-24">
      <BackButton />
      {notif_content}
    </div>
  );
}};

export const ManagerView = () => {{
  const {{ data, setProfile }} = useStore();
  const {{ t }} = useTranslation();
  const [wakeTime, setWakeTime] = useState(data?.profile?.wakeTime || "07:00");
  const [sleepTime, setSleepTime] = useState(data?.profile?.sleepTime || "23:00");
  const [studyBlockDuration, setStudyBlockDuration] = useState(data?.profile?.studyBlockDuration || 90);
  const [shabbatMode, setShabbatMode] = useState(data?.profile?.shabbatMode ?? false);
  const [useGPS, setUseGPS] = useState(data?.profile?.useGPS ?? true);
  const [selectedCity, setSelectedCity] = useState(data?.profile?.selectedCity || "tel_aviv");
  const [studyPreferences, setStudyPreferences] = useState(
    data?.profile?.studyPreferences || {{ morning: true, afternoon: true, evening: false }}
  );
  const [geminiApiKey, setGeminiApiKey] = useState(() => localStorage.getItem('gemini_api_key') || '');
  const [googleMapsApiKey, setGoogleMapsApiKey] = useState(() => localStorage.getItem('google_maps_api_key') || '');

  const handleSaveAISettings = () => {{
    setProfile({{ wakeTime, sleepTime, studyBlockDuration, shabbatMode, useGPS, selectedCity, studyPreferences }});
    localStorage.setItem('gemini_api_key', geminiApiKey.trim());
    localStorage.setItem('google_maps_api_key', googleMapsApiKey.trim());
    toast.success(t('aiSettingsSaved', 'הגדרות ה-Command Center נשמרו בהצלחה'));
  }};

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4 sm:p-6 md:p-8 animate-in fade-in duration-500 pb-24">
      <BackButton />
      {manager_content}
    </div>
  );
}};

export const PreferencesView = () => {{
  const {{ theme, setTheme, language, setLanguage, pomoSettings, setPomoSettings, data, resetSemester }} = useStore();
  const {{ t }} = useTranslation();
  const [pomoWork, setPomoWork] = useState(pomoSettings?.work || 25);
  const [pomoBreak, setPomoBreak] = useState(pomoSettings?.break || 5);

  const handleSavePomodoro = () => {{
    setPomoSettings({{ work: parseInt(pomoWork) || 25, break: parseInt(pomoBreak) || 5 }});
    toast.success(t('pomodoroSaved', 'הגדרות פומודורו עודכנו'));
  }};

  const handleExportData = () => {{
    const blob = new Blob([JSON.stringify(data, null, 2)], {{ type: 'application/json' }});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `calori-life-backup-${{new Date().toISOString().slice(0, 10)}}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }};

  const handleLogout = async () => {{
    await signOut(auth);
  }};

  const handleReset = () => {{
    if (window.confirm(t('confirmResetSemester'))) {{
      resetSemester();
      toast.success(t('resetSemesterSuccess'));
    }}
  }};

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4 sm:p-6 md:p-8 animate-in fade-in duration-500 pb-24">
      <BackButton />
      {preferences_full}
    </div>
  );
}};

// The Main SettingsView that routes between them
export const SettingsView = () => {{
  const {{ activeCategory, setActiveCategory, data, language }} = useStore();
  const {{ t }} = useTranslation();

  if (activeCategory === 'settings/profile') return <ProfileView />;
  if (activeCategory === 'settings/studies') return <StudiesView />;
  if (activeCategory === 'settings/notifications') return <NotificationsView />;
  if (activeCategory === 'settings/manager') return <ManagerView />;
  if (activeCategory === 'settings/general') return <PreferencesView />;
  if (activeCategory === 'settings/calori') return <ManagerView />; // fallback or split
  if (activeCategory === 'settings/data') return <PreferencesView />; // fallback or split
  if (activeCategory === 'settings/about') return <PreferencesView />; // fallback or split

  const groups = [
    {{
      title: 'חשבון',
      items: [
        {{ id: 'settings/profile', icon: <User className="w-5 h-5 text-green-700" />, title: 'פרופיל', sub: 'שם, תמונה, אימייל' }},
        {{ id: 'settings/notifications', icon: <Bell className="w-5 h-5 text-blue-700" />, title: 'התראות', sub: 'יומי, שקט בלילה' }},
      ]
    }},
    {{
      title: 'תכנים',
      items: [
        {{ id: 'settings/studies', icon: <BookOpen className="w-5 h-5 text-red-700" />, title: 'לימודים', sub: 'סמסטר, יעדים' }},
        {{ id: 'settings/manager', icon: <Bot className="w-5 h-5 text-purple-700" />, title: 'המנהל האישי', sub: 'התנהגות AI' }},
        {{ id: 'settings/calori', icon: <Shield className="w-5 h-5 text-green-700" />, title: 'קלורי', sub: 'סנכרון תזונה ואימונים' }},
      ]
    }},
    {{
      title: 'העדפות',
      items: [
        {{ id: 'settings/general', icon: <Palette className="w-5 h-5 text-orange-700" />, title: 'כללי', sub: 'שפה, ערכת נושא' }},
      ]
    }},
    {{
      title: 'נתונים',
      items: [
        {{ id: 'settings/data', icon: <Database className="w-5 h-5 text-gray-700" />, title: 'ייצוא וגיבוי', sub: 'קובץ JSON' }},
        {{ id: 'settings/about', icon: <Info className="w-5 h-5 text-gray-700" />, title: 'אודות', sub: 'גרסה, פרטיות, מחיקה' }},
      ]
    }}
  ];

  return (
    <div className="space-y-6 max-w-2xl mx-auto p-4 sm:p-6 md:p-8 animate-in fade-in duration-500 pb-24">
      
      {/* Profile Hero */}
      <div 
        onClick={{() => setActiveCategory('settings/profile')}}
        className="bg-white rounded-2xl p-4 border border-border shadow-sm flex items-center gap-4 cursor-pointer hover:bg-muted/50 transition-colors relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-800 to-emerald-500" />
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-800 to-emerald-600 flex items-center justify-center text-white text-2xl font-serif italic shadow-md overflow-hidden">
          {{data?.profile?.photoURL ? (
               <img src={{data.profile.photoURL}} alt="Profile" className="w-full h-full object-cover" />
            ) : (data?.profile?.displayName?.charAt(0) || 'א')}}
        </div>
        <div className="flex-1">
          <div className="font-serif text-xl"><em className="italic text-primary">{{data?.profile?.displayName?.split(' ')[0] || ''}}</em> {{data?.profile?.displayName?.split(' ').slice(1).join(' ') || ''}}</div>
          <div className="text-xs text-muted-foreground mt-1">{{auth?.currentUser?.email}}</div>
          <div className="text-xs text-primary font-serif italic mt-1">🥗 סנכרון תמונה ונתונים מקלורי פעיל</div>
        </div>
        <div className="bg-green-50 text-emerald-800 border border-emerald-200 text-xs font-bold px-3 py-1.5 rounded-full">
          ערוך
        </div>
      </div>

      {/* Groups */}
      {{groups.map((group, i) => (
        <div key={{i}}>
          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1 pb-2 flex items-center justify-between">
            <em className="font-serif italic text-sm text-foreground normal-case tracking-normal">{{group.title}}</em>
          </div>
          <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
            {{group.items.map((item, j) => (
              <div 
                key={{j}}
                onClick={{() => setActiveCategory(item.id)}}
                className={{cn(
                  "flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/50 transition-colors",
                  j > 0 && "border-t border-border/50"
                )}}
              >
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                  {{item.icon}}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-foreground">{{item.title}}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">{{item.sub}}</div>
                </div>
                <ChevronLeftIcon className="w-5 h-5 text-muted-foreground/50" />
              </div>
            )))}}
          </div>
        </div>
      )))}}
      
      <div className="text-center py-4">
        <Button variant="ghost" className="text-destructive font-serif italic text-base hover:text-destructive hover:bg-destructive/10 w-full rounded-2xl border border-destructive/15 bg-white shadow-sm" onClick={{() => signOut(auth)}}>
          התנתק
        </Button>
      </div>

      <div className="text-center opacity-50 text-xs font-serif italic">
        Calori Life · <em>v6.6.0</em>
      </div>

    </div>
  );
}};
"""

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Rewrite complete")
