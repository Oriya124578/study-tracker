import { useState, useEffect } from 'react';
import { COURSES, generateInitialState, DEFAULT_TASKS } from './data';
import { differenceInDays } from 'date-fns';
import { ChevronLeft, ChevronDown, ExternalLink, Play, Square, AlertCircle, ArrowLeft, Sun, Moon, Settings, Edit3, FileWarning, PlayCircle, BookOpen, Calendar, Clock, Home, Menu, X, Upload, LogOut } from 'lucide-react';
import confetti from 'canvas-confetti';
import { supabase } from './supabaseClient';
import './index.css';

function App() {
  const [session, setSession] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [isLoginView, setIsLoginView] = useState(true);

  const [data, setData] = useState(() => generateInitialState());

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoadingAuth(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      const loadData = async () => {
        const { data: userData, error } = await supabase
          .from('user_data')
          .select('app_state')
          .eq('id', session.user.id)
          .single();
        
        if (userData && userData.app_state && Object.keys(userData.app_state).length > 0) {
          setData(userData.app_state);
        } else {
          // New user -> initialize state
          const initialState = generateInitialState();
          await supabase.from('user_data').insert([
            { id: session.user.id, app_state: initialState }
          ]);
          setData(initialState);
        }
        setDataLoaded(true);
      };
      loadData();
    } else {
      setDataLoaded(false);
    }
  }, [session]);

  const [activeCourse, setActiveCourse] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [scannedFiles, setScannedFiles] = useState(null);
  
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [expandedWeeks, setExpandedWeeks] = useState({ 1: true });

  const [pomodoro, setPomodoro] = useState({ active: false, timeLeft: 25 * 60, mode: 'work' });
  const [pomoSettings, setPomoSettings] = useState({ work: 25, break: 5 });
  const [showPomoSettings, setShowPomoSettings] = useState(false);

  const [activeCategory, setActiveCategory] = useState('overview');
  const [isHubOpen, setIsHubOpen] = useState(false);

  const [showLinksEditor, setShowLinksEditor] = useState(false);
  const [editingLinks, setEditingLinks] = useState({ notebookLm: '', gemini: '', localFolder: '' });

  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (dataLoaded && session) {
      const saveData = async () => {
        await supabase
          .from('user_data')
          .update({ app_state: data })
          .eq('id', session.user.id);
      };
      saveData();
    }
  }, [data, session, dataLoaded]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Pomodoro logic
  useEffect(() => {
    let interval;
    if (pomodoro.active && pomodoro.timeLeft > 0) {
      interval = setInterval(() => {
        setPomodoro(p => ({ ...p, timeLeft: p.timeLeft - 1 }));
      }, 1000);
    } else if (pomodoro.active && pomodoro.timeLeft === 0) {
      if (pomodoro.mode === 'work') {
        setPomodoro({ active: false, timeLeft: pomoSettings.break * 60, mode: 'break' });
        alert("הזמן ללמידה נגמר! קח הפסקה קצרה.");
      } else {
        setPomodoro({ active: false, timeLeft: pomoSettings.work * 60, mode: 'work' });
        alert("ההפסקה נגמרה! חוזרים ללמוד.");
      }
    }
    return () => clearInterval(interval);
  }, [pomodoro.active, pomodoro.timeLeft, pomodoro.mode, pomoSettings]);

  useEffect(() => {
    if (activeCourse) {
      const course = COURSES.find(c => c.id === activeCourse);
      const localFolder = data.links[course.id].localFolder;
      
      fetch(`/api/scan?folder=${encodeURIComponent(localFolder)}`)
        .then(res => res.json())
        .then(files => {
          if (!files.error) setScannedFiles(files);
          else setScannedFiles({});
        })
        .catch(err => {
          console.error("Failed to scan folder", err);
          setScannedFiles({});
        });
    } else {
      setScannedFiles(null);
    }
  }, [activeCourse, data.links]);

  const openFile = (fileUrl) => {
    window.open(fileUrl, '_blank');
  };

  const handleGlobalUpload = async (event, courseId, category, folderName) => {
    const file = event.target.files[0];
    if (!file) return;

    const label = prompt('איך תרצה לקרוא לקובץ (למשל: "מבחן 2023 מועד א")?');
    if (!label) {
      event.target.value = '';
      return;
    }

    const course = COURSES.find(c => c.id === courseId);
    const localFolder = data.links[course.id].localFolder;

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'x-course-folder': encodeURIComponent(localFolder),
          'x-task-folder': encodeURIComponent(folderName),
          'x-week': 'global',
          'x-file-name': encodeURIComponent(file.name)
        },
        body: file
      });
      
      const result = await response.json();
      if (result.success) {
        setData(prev => {
          const newGlobalTasks = { ...prev.globalTasks };
          if (!newGlobalTasks[courseId]) {
            newGlobalTasks[courseId] = { past_exams: [], summaries: [], quizzes: [] };
          }
          const newItem = {
            id: Date.now().toString(),
            label: label,
            filename: file.name,
            path: result.path,
            checked: false
          };
          newGlobalTasks[courseId][category] = [...(newGlobalTasks[courseId][category] || []), newItem];
          return { ...prev, globalTasks: newGlobalTasks };
        });
      } else {
        alert('שגיאה בהעלאת הקובץ');
      }
    } catch (e) {
      console.error(e);
      alert('שגיאה בתקשורת עם השרת');
    }
    event.target.value = '';
  };

  const toggleGlobalTask = (courseId, category, taskId) => {
    setData(prev => {
      const newGlobalTasks = { ...prev.globalTasks };
      const categoryTasks = newGlobalTasks[courseId][category].map(t => {
        if (t.id === taskId) {
          return { ...t, checked: !t.checked };
        }
        return t;
      });
      newGlobalTasks[courseId][category] = categoryTasks;
      return { ...prev, globalTasks: newGlobalTasks };
    });
  };

  const handleFileUpload = async (event, courseId, folderPattern, week) => {
    const file = event.target.files[0];
    if (!file) return;

    const course = COURSES.find(c => c.id === courseId);
    const localFolder = data.links[course.id].localFolder;

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'x-course-folder': encodeURIComponent(localFolder),
          'x-task-folder': encodeURIComponent(folderPattern),
          'x-week': week.toString(),
          'x-file-name': encodeURIComponent(file.name)
        },
        body: file
      });
      
      const result = await response.json();
      if (result.success) {
        setScannedFiles(prev => {
          const newFiles = { ...prev };
          if (!newFiles[folderPattern]) newFiles[folderPattern] = {};
          newFiles[folderPattern][week] = result.path;
          return newFiles;
        });
      } else {
        alert('שגיאה בהעלאת הקובץ');
      }
    } catch (e) {
      console.error(e);
      alert('שגיאה בהעלאת הקובץ');
    }
  };

  const applyPomoSettings = () => {
    setPomodoro({ active: false, timeLeft: pomoSettings.work * 60, mode: 'work' });
    setShowPomoSettings(false);
  };

  const getWeekProgress = (courseId, week) => {
    const total = DEFAULT_TASKS.length;
    let completed = 0;
    DEFAULT_TASKS.forEach(t => {
      if (data.tasks[courseId][week][t.id]) completed++;
    });
    return { completed, total, isDone: completed === total };
  };

  const toggleTask = (courseId, week, taskId) => {
    setData(prev => {
      const newState = { ...prev };
      newState.tasks = { ...prev.tasks };
      newState.tasks[courseId] = { ...prev.tasks[courseId] };
      newState.tasks[courseId][week] = { ...prev.tasks[courseId][week] };
      
      newState.tasks[courseId][week][taskId] = !prev.tasks[courseId][week][taskId];
      
      const tasks = DEFAULT_TASKS.map(t => newState.tasks[courseId][week][t.id]);
      if (tasks.every(Boolean)) {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      }
      return newState;
    });
  };

  const saveNote = (courseId, week, note) => {
    setData(prev => ({
      ...prev,
      notes: {
        ...prev.notes,
        [courseId]: {
          ...prev.notes[courseId],
          [week]: note
        }
      }
    }));
  };

  const saveLinks = () => {
    setData(prev => ({
      ...prev,
      links: {
        ...prev.links,
        [activeCourse]: editingLinks
      }
    }));
    setShowLinksEditor(false);
  };

  const openLinksEditor = (courseId) => {
    setEditingLinks(data.links[courseId]);
    setShowLinksEditor(true);
  };

  const formatCountdown = (date) => {
    const diff = date.getTime() - now.getTime();
    if (diff < 0) return 'עבר';
    
    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const m = Math.floor((diff / 1000 / 60) % 60);
    const s = Math.floor((diff / 1000) % 60);
    
    const timeStr = <span className="font-mono inline-block" dir="ltr">{`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`}</span>;
    if (d > 0) {
      return <span>עוד {d} ימים, {timeStr}</span>;
    }
    return <span>נותרו {timeStr}</span>;
  };

  const currentWeek = 1; 
  
  const getBacklog = () => {
    const backlog = [];
    COURSES.forEach(c => {
      for (let w = 1; w < currentWeek; w++) {
        DEFAULT_TASKS.forEach(t => {
          if (!data.tasks[c.id][w][t.id]) {
            backlog.push({ course: c.name, week: w, task: t.label });
          }
        });
      }
    });
    return backlog;
  };

  const toggleWeek = (week) => {
    setExpandedWeeks(prev => ({ ...prev, [week]: !prev[week] }));
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const renderSidebar = () => (
    <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
      <div className="flex items-center justify-between mb-8 px-2">
        <div className="flex items-center gap-2">
          <BookOpen className="text-accent" size={24} />
          <h2 className="text-lg font-bold m-0 tracking-tight">Study Tracker</h2>
        </div>
        <button className="btn-icon mobile-toggle-close md:hidden" onClick={() => setSidebarOpen(false)}>
          <X size={18} />
        </button>
      </div>

      <div className="mb-6 flex flex-col gap-1">
        <div 
          className={`sidebar-link ${activeCourse === null ? 'active' : ''}`}
          onClick={() => { setActiveCourse(null); setActiveCategory('overview'); setSidebarOpen(false); }}
        >
          <Home size={18} /> סקירה כללית
        </div>
      </div>

      <div className="text-xs font-bold text-muted uppercase tracking-wider mb-2 px-2">קורסים</div>
      <div className="flex flex-col gap-1 flex-1 overflow-y-auto">
        {COURSES.map(course => {
          const isActive = activeCourse === course.id;
          return (
            <div key={course.id} className="flex flex-col">
              <div 
                className={`sidebar-link ${isActive && activeCategory === 'overview' ? 'active' : ''}`}
                onClick={() => { setActiveCourse(course.id); setActiveCategory('overview'); setSidebarOpen(false); }}
              >
                <span className="w-2 h-2 rounded-full bg-card-border" style={{ background: isActive ? 'var(--accent)' : 'var(--text-secondary)' }}></span>
                {course.name}
              </div>
              
              {isActive && (
                <div className="flex flex-col gap-1 pl-4 pr-6 mt-1 mb-2 border-r-2 border-[var(--card-border)] border-opacity-50">
                  {[
                    { id: 'lecture', label: 'הרצאות' },
                    { id: 'tutorial', label: 'תרגולים' },
                    { id: 'homework', label: 'שיעורי בית' },
                    { id: 'past_exams', label: 'מבחני עבר' },
                    { id: 'summaries', label: 'סיכומים' },
                    { id: 'quizzes', label: 'בחנים' }
                  ].map(cat => (
                    <div 
                      key={cat.id}
                      className={`text-sm py-1.5 px-3 rounded cursor-pointer transition-colors ${activeCategory === cat.id ? 'bg-[var(--btn-secondary)] text-primary font-bold' : 'text-muted hover:text-primary'}`}
                      onClick={() => { setActiveCategory(cat.id); setSidebarOpen(false); }}
                    >
                      {cat.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-auto pt-6 border-t border-[var(--card-border)] flex flex-col gap-4">
        <div className="px-2">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold flex items-center gap-1 text-muted"><Clock size={12}/> פומודורו</span>
            <button className="text-muted hover:text-primary transition-colors" onClick={() => setShowPomoSettings(!showPomoSettings)}>
              <Settings size={14} />
            </button>
          </div>
          
          {showPomoSettings ? (
            <div className="flex flex-col gap-2 p-3 clean-card text-xs mt-2">
              <div className="flex justify-between items-center">
                <span>למידה:</span>
                <input type="number" className="w-12 p-1 rounded bg-[var(--bg-color)] border border-[var(--card-border)] text-center" value={pomoSettings.work} onChange={e => setPomoSettings({...pomoSettings, work: e.target.value})} />
              </div>
              <div className="flex justify-between items-center">
                <span>הפסקה:</span>
                <input type="number" className="w-12 p-1 rounded bg-[var(--bg-color)] border border-[var(--card-border)] text-center" value={pomoSettings.break} onChange={e => setPomoSettings({...pomoSettings, break: e.target.value})} />
              </div>
              <button className="btn w-full mt-2 py-1" onClick={applyPomoSettings}>שמור</button>
            </div>
          ) : (
            <div className="flex items-center justify-between bg-[var(--btn-secondary)] p-3 rounded">
              <div className="flex flex-col">
                <span className="text-xs font-bold" style={{ color: pomodoro.mode === 'work' ? 'var(--accent)' : 'var(--success)' }}>
                  {pomodoro.mode === 'work' ? 'למידה' : 'הפסקה'}
                </span>
                <span className="text-xl font-bold font-mono tracking-wider" dir="ltr">{formatTime(pomodoro.timeLeft)}</span>
              </div>
              <button className="btn-icon p-2 bg-[var(--bg-color)] rounded-full shadow-sm" onClick={() => setPomodoro(p => ({ ...p, active: !p.active }))}>
                {pomodoro.active ? <Square size={16} className="text-danger" /> : <Play size={16} className="text-success" />}
              </button>
            </div>
          )}
        </div>

        <div className="px-2">
          <button 
            className="sidebar-link w-full justify-start text-muted" 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? <><Sun size={16} /> מצב יום</> : <><Moon size={16} /> מצב לילה</>}
          </button>
        </div>
        
        <div className="px-2 pb-4">
          <button 
            className="sidebar-link w-full justify-start text-danger hover:bg-danger hover:bg-opacity-10 transition-colors" 
            onClick={() => supabase.auth.signOut()}
          >
            <LogOut size={16} /> התנתק
          </button>
        </div>
      </div>
    </aside>
  );

  const renderDashboard = () => {
    let totalTasks = 0;
    let completedTasks = 0;
    COURSES.forEach(c => {
      for (let w = 1; w <= 12; w++) {
        DEFAULT_TASKS.forEach(t => {
          totalTasks++;
          if (data.tasks[c.id][w][t.id]) completedTasks++;
        });
      }
    });
    const overallProgress = Math.round((completedTasks / totalTasks) * 100) || 0;

    const allExams = [];
    COURSES.forEach(c => {
      allExams.push({ course: c.name, date: c.exams.moedA, type: "מועד א'" });
      allExams.push({ course: c.name, date: c.exams.moedB, type: "מועד ב'" });
    });
    const upcomingExams = allExams
      .filter(e => differenceInDays(e.date, new Date()) >= -1)
      .sort((a, b) => a.date - b.date);

    return (
      <div className="document-view">
        <h1 className="mb-2">סקירה כללית</h1>
        <p className="text-muted mb-8 text-sm">מעקב לימודים וסטטוס סמסטר נוכחי.</p>
        
        <div className="mb-8 p-6 clean-card">
          <h3 className="mb-2 text-lg">התקדמות סמסטריאלית</h3>
          <div className="flex justify-between text-sm mb-1 text-muted">
            <span>{completedTasks} מתוך {totalTasks} משימות הושלמו</span>
            <span className="font-bold text-primary">{overallProgress}%</span>
          </div>
          <div className="progress-container">
            <div className="progress-fill" style={{ width: `${overallProgress}%` }}></div>
          </div>
        </div>

        {getBacklog().length > 0 && (
          <div className="mb-8 p-4 rounded bg-warning bg-opacity-10 border border-warning" style={{ borderColor: 'rgba(210, 153, 34, 0.4)' }}>
            <h3 className="text-warning flex items-center gap-2 mb-2 text-sm uppercase tracking-wider font-bold">
              <AlertCircle size={16} /> חוסרים משבועות קודמים
            </h3>
            <ul className="text-sm space-y-1">
              {getBacklog().map((b, i) => (
                <li key={i} className="flex items-center gap-2 text-muted">
                  <span className="w-1 h-1 rounded-full bg-warning"></span>
                  <strong className="text-primary">{b.course}</strong>: שבוע {b.week} - {b.task}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mb-8">
          <h2 className="flex items-center gap-2 mb-4 text-lg"><Calendar size={20} className="text-muted" /> לוח מבחנים קרובים</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingExams.map((exam, i) => {
              const days = differenceInDays(exam.date, new Date());
              const isUrgent = days <= 14 && days >= 0;
              return (
                <div key={i} className="clean-card flex justify-between items-center p-4">
                  <div>
                    <h4 className="font-bold text-sm mb-1">{exam.course}</h4>
                    <span className="text-xs text-muted block">{exam.type} • {exam.date.toLocaleDateString('he-IL')}</span>
                  </div>
                  <div className={`text-sm font-bold ${isUrgent ? 'text-danger' : days < 0 ? 'text-muted' : 'text-primary'}`}>
                    {formatCountdown(exam.date)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderFocusedView = () => {
    const course = COURSES.find(c => c.id === activeCourse);
    
    // Check if it's a global category
    const globalCategories = [
      { key: 'past_exams', title: 'מבחני עבר', folderName: 'מבחנים' },
      { key: 'summaries', title: 'סיכומים', folderName: 'סיכומים' },
      { key: 'quizzes', title: 'בחנים', folderName: 'בחנים' }
    ];
    const globalCat = globalCategories.find(c => c.key === activeCategory);
    
    if (globalCat) {
      const tasksData = data.globalTasks[course.id] || { past_exams: [], summaries: [], quizzes: [] };
      return (
        <div className="mb-8">
          <div className="bg-[var(--bg-color)] rounded-xl p-4 shadow-sm border border-[var(--card-border)] max-w-2xl">
            <div className="space-y-2 mb-3">
              {tasksData[globalCat.key]?.map(task => (
                <div key={task.id} className="task-row flex items-center justify-between p-2 rounded hover:bg-[var(--btn-secondary)] transition-colors text-sm">
                  <label className="flex items-center gap-3 cursor-pointer flex-1">
                    <input type="checkbox" className="custom-checkbox" checked={task.checked} onChange={() => toggleGlobalTask(course.id, globalCat.key, task.id)} />
                    <span className={`text-sm transition-colors ${task.checked ? 'text-muted line-through' : 'text-primary'}`}>
                      {task.label}
                    </span>
                  </label>
                  <button onClick={() => openFile(task.path)} className="file-btn">
                    <PlayCircle size={14} /> פתח
                  </button>
                </div>
              ))}
              {(!tasksData[globalCat.key] || tasksData[globalCat.key].length === 0) && (
                <div className="text-xs text-muted italic p-2">אין קבצים למעקב במאגר תחת קטגוריה זו.</div>
              )}
            </div>
            <label className="cursor-pointer text-xs flex items-center justify-center gap-1 p-2 rounded-lg border border-dashed border-[var(--card-border)] hover:bg-[var(--btn-secondary)] transition-colors text-secondary hover:text-secondary-focus w-full mt-2">
              <Upload size={14} /> הוסף קובץ...
              <input type="file" className="hidden" onChange={(e) => handleGlobalUpload(e, course.id, globalCat.key, globalCat.folderName)} />
            </label>
          </div>
        </div>
      );
    }

    // Otherwise it's a weekly task
    const taskDef = DEFAULT_TASKS.find(t => t.id === activeCategory);
    if (!taskDef) return null;

    const weeks = Array.from({ length: 12 }, (_, i) => i + 1);
    
    return (
      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {weeks.map(week => {
            const hasFile = scannedFiles && scannedFiles[taskDef.folderPattern] && scannedFiles[taskDef.folderPattern][week];
            const filePath = hasFile ? scannedFiles[taskDef.folderPattern][week] : null;
            const isChecked = data.tasks[course.id][week][taskDef.id];

            return (
              <div key={week} className="bg-[var(--bg-color)] rounded p-4 border border-[var(--card-border)] flex items-center justify-between shadow-sm transition-colors hover:bg-[var(--btn-secondary)]">
                <label className="flex items-center gap-3 cursor-pointer flex-1">
                  <input type="checkbox" className="custom-checkbox" checked={isChecked} onChange={() => toggleTask(course.id, week, taskDef.id)} />
                  <span className={`text-sm transition-colors font-bold ${isChecked ? 'text-muted line-through' : 'text-primary'}`}>
                    שבוע {week}
                  </span>
                </label>
                
                {scannedFiles !== null && (
                  <div className="file-actions">
                    {hasFile ? (
                      <button className="file-btn" onClick={(e) => { e.stopPropagation(); openFile(filePath); }}>
                        <PlayCircle size={14} /> פתח
                      </button>
                    ) : (
                      <label className="file-label" title="העלה קובץ">
                        <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, course.id, taskDef.folderPattern, week)} />
                        <Upload size={14} /> הוסף
                      </label>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderCourse = () => {
    const course = COURSES.find(c => c.id === activeCourse);
    const links = data.links[course.id];
    
    const categoryLabels = {
      overview: 'סקירה כללית',
      lecture: 'הרצאות',
      tutorial: 'תרגולים',
      homework: 'שיעורי בית',
      past_exams: 'מבחני עבר',
      summaries: 'סיכומים',
      quizzes: 'בחנים'
    };

    return (
      <div className="document-view">
        <h1 className="mb-4 flex items-center flex-wrap gap-2">
          {course.name} 
          {activeCategory !== 'overview' && <span className="text-muted text-lg font-normal">/</span>} 
          {activeCategory !== 'overview' && <span className="text-lg text-primary">{categoryLabels[activeCategory]}</span>}
        </h1>
        
        {activeCategory === 'overview' ? (
          <>
            <div className="mb-8">
              <div className="flex flex-wrap gap-2 mb-6">
                <a href={links.notebookLm} target="_blank" rel="noreferrer" className="btn-pill">
                  <ExternalLink size={14} className="mr-1" /> NotebookLM
                </a>
            <a href={links.gemini} target="_blank" rel="noreferrer" className="btn-pill">
              <ExternalLink size={14} className="mr-1" /> Gemini
            </a>
            <button className="btn-pill" onClick={() => openLinksEditor(course.id)}>
              <Edit3 size={14} className="mr-1" /> ערוך
            </button>
          </div>

          {(() => {
            const categories = [
              { key: 'past_exams', title: 'מבחני עבר', folderName: 'מבחנים' },
              { key: 'summaries', title: 'סיכומים', folderName: 'סיכומים' },
              { key: 'quizzes', title: 'בחנים', folderName: 'בחנים' }
            ];
            const tasksData = data.globalTasks[course.id] || { past_exams: [], summaries: [], quizzes: [] };

            return (
              <div className="mb-8 clean-card p-6 border border-[var(--card-border)]">
                <div 
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => setIsHubOpen(!isHubOpen)}
                >
                  <div className="flex items-center gap-2">
                    <BookOpen size={20} className="text-primary" /> 
                    <h3 className="font-bold text-xl text-primary m-0">מאגר קורס</h3>
                  </div>
                  <button className="btn-icon">
                    {isHubOpen ? <ChevronDown size={20} /> : <ChevronLeft size={20} />}
                  </button>
                </div>
                
                {!isHubOpen && (
                  <div className="text-sm text-muted mt-1 mr-7">לחץ כאן כדי להרחיב את המאגר (מבחני עבר, סיכומים, בחנים)</div>
                )}

                {isHubOpen && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 pt-6 border-t border-[var(--card-border)]">
                  {categories.map(cat => (
                    <div key={cat.key} className="bg-[var(--bg-color)] rounded-xl p-4 shadow-sm border border-[var(--card-border)]">
                      <h4 className="font-bold text-sm mb-3 pb-2 border-b border-[var(--card-border)]">{cat.title}</h4>
                      <div className="space-y-2 mb-3">
                        {tasksData[cat.key]?.map(task => (
                          <div key={task.id} className="task-row flex items-center justify-between p-2 rounded hover:bg-[var(--btn-secondary)] transition-colors text-sm">
                            <label className="flex items-center gap-3 cursor-pointer flex-1">
                              <input type="checkbox" className="custom-checkbox" checked={task.checked} onChange={() => toggleGlobalTask(course.id, cat.key, task.id)} />
                              <span className={`text-sm transition-colors ${task.checked ? 'text-muted line-through' : 'text-primary'}`}>
                                {task.label}
                              </span>
                            </label>
                            <button 
                              onClick={() => openFile(task.path)}
                              className="file-btn"
                            >
                              <PlayCircle size={14} /> פתח
                            </button>
                          </div>
                        ))}
                        {(!tasksData[cat.key] || tasksData[cat.key].length === 0) && (
                          <div className="text-xs text-muted italic p-2">אין קבצים למעקב במאגר.</div>
                        )}
                      </div>
                      <label className="cursor-pointer text-xs flex items-center justify-center gap-1 p-2 rounded-lg border border-dashed border-[var(--card-border)] hover:bg-[var(--btn-secondary)] transition-colors text-secondary hover:text-secondary-focus w-full mt-2">
                        <Upload size={14} /> הוסף קובץ...
                        <input 
                          type="file" 
                          className="hidden" 
                          onChange={(e) => handleGlobalUpload(e, course.id, cat.key, cat.folderName)} 
                        />
                      </label>
                    </div>
                  ))}
                </div>
                )}
              </div>
            );
          })()}

          <div className="exam-card">
            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-wider font-bold text-muted mb-1">מועד א'</span>
              <span className="text-lg font-bold text-primary">{course.exams.moedA.toLocaleDateString('he-IL')}</span>
              <span className="text-xs text-muted mt-1">{formatCountdown(course.exams.moedA)}</span>
            </div>
            <div className="exam-divider"></div>
            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-wider font-bold text-muted mb-1">מועד ב'</span>
              <span className="text-lg font-bold text-primary">{course.exams.moedB.toLocaleDateString('he-IL')}</span>
              <span className="text-xs text-muted mt-1">{formatCountdown(course.exams.moedB)}</span>
            </div>
          </div>
        </div>

        {showLinksEditor && (
          <div className="clean-card mb-8">
            <h3 className="text-base font-bold mb-4">עריכת קישורים לקורס</h3>
            <div className="flex flex-col gap-4 mb-4 text-sm">
              <div>
                <label className="block mb-1 text-muted text-xs">קישור לפרויקט ב-NotebookLM</label>
                <input type="text" className="w-full p-2 rounded bg-[var(--bg-color)] border border-[var(--card-border)] text-primary" value={editingLinks.notebookLm} onChange={e => setEditingLinks({...editingLinks, notebookLm: e.target.value})} />
              </div>
              <div>
                <label className="block mb-1 text-muted text-xs">קישור לצ'אט ב-Gemini</label>
                <input type="text" className="w-full p-2 rounded bg-[var(--bg-color)] border border-[var(--card-border)] text-primary" value={editingLinks.gemini} onChange={e => setEditingLinks({...editingLinks, gemini: e.target.value})} />
              </div>
              <div>
                <label className="block mb-1 text-muted text-xs">נתיב תיקייה מקומית במחשב</label>
                <input type="text" className="w-full p-2 rounded bg-[var(--bg-color)] border border-[var(--card-border)] text-primary" dir="ltr" value={editingLinks.localFolder} onChange={e => setEditingLinks({...editingLinks, localFolder: e.target.value})} />
              </div>
            </div>
            <div className="flex gap-2">
              <button className="btn" onClick={saveLinks}>שמור קישורים</button>
              <button className="btn btn-secondary" onClick={() => setShowLinksEditor(false)}>ביטול</button>
            </div>
          </div>
        )}

          <div className="flex justify-end mb-4 gap-2 items-center">
             <button className="btn-link" onClick={() => {
               const all = {};
               for(let i=1;i<=12;i++) all[i] = true;
               setExpandedWeeks(all);
             }}>הרחב הכל</button>
             <span className="text-muted text-xs">•</span>
             <button className="btn-link" onClick={() => setExpandedWeeks({})}>צמצם הכל</button>
          </div>

          <div className="flex flex-col gap-2">
            {Array.from({ length: 12 }, (_, i) => i + 1).map(week => {
              const { completed, total, isDone } = getWeekProgress(course.id, week);
              const isOpen = expandedWeeks[week];
              
              return (
                <div key={week} className="border border-[var(--card-border)] rounded overflow-hidden">
                  <div className={`p-4 cursor-pointer flex justify-between items-center transition-colors hover:bg-[var(--btn-secondary)] ${isDone ? 'bg-[var(--success)] bg-opacity-5' : ''}`} onClick={() => toggleWeek(week)}>
                    <div className="flex items-center gap-3">
                      <button className="btn-icon">
                        {isOpen ? <ChevronDown size={18} /> : <ChevronLeft size={18} />}
                      </button>
                      <h3 className={`text-base font-bold m-0 ${isDone ? 'text-success' : 'text-primary'}`}>שבוע {week}</h3>
                      {data.notes[course.id][week] && (
                        <span className="w-2 h-2 rounded-full bg-warning" title="יש הערות"></span>
                      )}
                    </div>
                    <div className="flex items-center">
                      <span className="text-xs font-bold text-muted bg-[var(--btn-secondary)] px-2 py-1 rounded">{completed}/{total}</span>
                    </div>
                  </div>
                  
                  {isOpen && (
                    <div className="p-4 pt-0">
                      <div className="divider mt-0"></div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                        {DEFAULT_TASKS.map(task => {
                          const hasFile = scannedFiles && scannedFiles[task.folderPattern] && scannedFiles[task.folderPattern][week];
                          const filePath = hasFile ? scannedFiles[task.folderPattern][week] : null;
                          const isChecked = data.tasks[course.id][week][task.id];

                          return (
                            <div key={task.id} className="task-row">
                              <label className="flex items-center gap-3 cursor-pointer flex-1">
                                <input type="checkbox" className="custom-checkbox" checked={isChecked} onChange={() => toggleTask(course.id, week, task.id)} />
                                <span className={`text-sm transition-colors ${isChecked ? 'text-muted line-through' : 'text-primary'}`}>
                                  {task.label}
                               </span>
                              </label>
                              
                              {scannedFiles !== null && (
                                <div className="file-actions">
                                  {hasFile ? (
                                    <button className="file-btn" onClick={(e) => { e.stopPropagation(); openFile(filePath); }}>
                                      <PlayCircle size={14} /> פתח
                                    </button>
                                  ) : (
                                    <label className="file-label" title="העלה קובץ">
                                      <input 
                                        type="file" 
                                        className="hidden" 
                                        onChange={(e) => handleFileUpload(e, course.id, task.folderPattern, week)} 
                                      />
                                      <Upload size={14} /> הוסף
                                    </label>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      
                      <div className="mt-6">
                        <div className="text-xs font-bold text-muted uppercase tracking-wider mb-2">הערות לשבוע זה</div>
                        <textarea
                          className="w-full p-3 rounded text-sm transition-colors focus:outline-none bg-[var(--btn-secondary)] border-none text-primary resize-y"
                          style={{ minHeight: '80px' }}
                          placeholder="הקלד הערות כאן..."
                          value={data.notes[course.id][week] || ""}
                          onChange={(e) => saveNote(course.id, week, e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
            </>
          ) : (
            renderFocusedView()
          )}
      </div>
    );
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;
    
    if (isLoginView) {
      // Login
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) alert('שגיאה בהתחברות: ' + error.message);
    } else {
      // Sign Up
      if (!email || !password) return alert('נא להזין אימייל וסיסמה');
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        alert('שגיאה בהרשמה: ' + error.message);
      } else {
        alert('נרשמת בהצלחה! תוכל כעת להתחבר.');
        setIsLoginView(true);
      }
    }
  };

  const handleOAuthLogin = async (provider) => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: provider,
    });
    if (error) alert('שגיאה בהתחברות עם ' + provider + ': ' + error.message);
  };

  if (loadingAuth) return <div className="flex h-screen items-center justify-center bg-[var(--bg-color)] text-muted font-bold text-xl">טוען חיבור...</div>;

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--bg-color)] p-4 relative" dir="rtl">
        {/* Top left switch button */}
        <button 
          onClick={() => setIsLoginView(!isLoginView)}
          className="absolute top-6 left-6 px-4 py-1.5 rounded-full border border-[var(--card-border)] text-sm font-bold text-primary hover:bg-[var(--btn-secondary)] transition-colors"
        >
          {isLoginView ? 'הרשמה' : 'התחברות'}
        </button>

        <div className="w-full max-w-sm">
          <h2 className="text-3xl font-bold mb-10 text-center text-primary">
            {isLoginView ? 'התחברות' : 'הרשמה'}
          </h2>
          
          <form onSubmit={handleAuthSubmit} id="authForm" className="flex flex-col">
            <div className="mb-4">
              <label className="block text-sm font-bold text-primary mb-2">אימייל</label>
              <input 
                name="email" 
                type="email" 
                placeholder="הכנס אימייל" 
                required 
                className="w-full p-3 rounded-lg bg-[var(--btn-secondary)] border border-[var(--card-border)] text-primary focus:outline-none focus:border-accent transition-colors"
              />
            </div>
            
            <div className="mb-8">
              <label className="block text-sm font-bold text-primary mb-2">סיסמה</label>
              <input 
                name="password" 
                type="password" 
                placeholder="הכנס סיסמה" 
                required 
                className="w-full p-3 rounded-lg bg-[var(--btn-secondary)] border border-[var(--card-border)] text-primary focus:outline-none focus:border-accent transition-colors"
              />
            </div>
            
            <button 
              type="submit" 
              className="w-full py-3 rounded-full bg-accent text-white font-bold text-base hover:bg-opacity-90 transition-all shadow-sm"
            >
              {isLoginView ? 'התחבר' : 'הירשם'}
            </button>
            
            {isLoginView && (
              <div className="flex justify-between items-center mt-6 text-sm">
                <span className="text-primary font-medium">שכחת סיסמה?</span>
                <button type="button" className="text-accent hover:underline bg-transparent border-none cursor-pointer" onClick={() => alert('מנגנון איפוס סיסמה יתווסף בהמשך')}>
                  איפוס סיסמה
                </button>
              </div>
            )}
          </form>

          {/* Minimal OAuth Icons at the bottom instead of huge buttons */}
          <div className="mt-12 flex flex-col items-center">
            <span className="text-xs text-muted mb-4">או התחבר באמצעות</span>
            <div className="flex gap-4">
              <button 
                type="button" 
                onClick={() => handleOAuthLogin('google')}
                className="w-12 h-12 rounded-full border border-[var(--card-border)] flex items-center justify-center hover:bg-[var(--btn-secondary)] transition-colors bg-white"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              </button>
              <button 
                type="button" 
                onClick={() => handleOAuthLogin('apple')}
                className="w-12 h-12 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors bg-black"
              >
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.04 2.26-.74 3.58-.74 1.76.04 3.19.78 4.07 2.1-3.4 2.01-2.82 6.47.59 7.82-.76 1.83-1.87 3.65-3.32 5.03zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!dataLoaded) return <div className="flex h-screen items-center justify-center bg-[var(--bg-color)] text-muted font-bold text-xl">טוען נתונים מהענן...</div>;

  return (
    <div className="app-container">
      <button className="mobile-toggle" onClick={() => setSidebarOpen(true)}>
        <Menu size={20} />
      </button>

      {renderSidebar()}

      <main className="main-content">
        {activeCourse ? renderCourse() : renderDashboard()}
      </main>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setSidebarOpen(false)}></div>
      )}
    </div>
  );
}

export default App;
