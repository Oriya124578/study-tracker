import { create } from 'zustand';
import { generateInitialState } from '../data';

export const useStore = create((set, get) => ({
  data: generateInitialState(),
  activeCourse: null,
  activeCategory: 'overview',
  theme: localStorage.getItem('theme') || 'dark',
  
  // Pomodoro
  pomodoro: { active: false, timeLeft: 25 * 60, mode: 'work', courseId: null },
  pomoSettings: { work: 25, break: 5 },
  
  // Global App State UI
  sidebarOpen: false,
  showPomoSettings: false,
  
  // Core Setters
  setData: (newData) => set({ data: newData }),
  setActiveCourse: (course) => set({ activeCourse: course }),
  setActiveCategory: (category) => set({ activeCategory: category }),
  setSidebarOpen: (isOpen) => set({ sidebarOpen: isOpen }),
  
  // Theme
  setTheme: (theme) => {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    set({ theme });
  },
  
  // Pomodoro actions
  setPomodoro: (pomoUpdater) => set((state) => ({ 
    pomodoro: typeof pomoUpdater === 'function' ? pomoUpdater(state.pomodoro) : pomoUpdater 
  })),
  setPomoSettings: (settings) => set({ pomoSettings: settings }),
  setShowPomoSettings: (show) => set({ showPomoSettings: show }),
  
  addPomodoroSession: (session) => set((state) => {
    if (!session.courseId) return state; // Don't save if no course selected
    const newSession = {
      id: Date.now().toString(),
      ...session
    };
    return {
      data: {
        ...state.data,
        pomodoroSessions: [...(state.data.pomodoroSessions || []), newSession]
      }
    };
  }),

  // Course Management
  addCourse: (course) => set((state) => {
    const newCourses = [...state.data.courses, course];
    const newData = { ...state.data, courses: newCourses };
    
    // Initialize tasks and notes for the new course
    newData.tasks[course.id] = {};
    newData.notes[course.id] = {};
    newData.globalTasks[course.id] = { past_exams: [], summaries: [], quizzes: [] };
    newData.links[course.id] = {
      notebookLm: course.defaultNotebookLmLink || "",
      gemini: course.defaultGeminiLink || "",
      localFolder: course.defaultLocalFolder || ""
    };

    for (let week = 1; week <= course.weeksCount; week++) {
      newData.notes[course.id][week] = "";
      newData.tasks[course.id][week] = [
        { id: `${course.id}-w${week}-lecture-0`, type: 'lecture', label: 'הרצאה', checked: false },
        { id: `${course.id}-w${week}-tutorial-1`, type: 'tutorial', label: 'תרגול', checked: false },
        { id: `${course.id}-w${week}-homework-2`, type: 'homework', label: 'שיעורי בית', checked: false }
      ];
    }
    return { data: newData };
  }),

  updateCourse: (courseId, updates) => set((state) => {
    const courses = state.data.courses.map(c => c.id === courseId ? { ...c, ...updates } : c);
    return { data: { ...state.data, courses } };
  }),

  // Tasks
  toggleTask: (courseId, week, taskId) => set((state) => {
    const newData = { ...state.data };
    const courseTasks = { ...newData.tasks[courseId] };
    const weekTasks = [...courseTasks[week]];
    
    const taskIndex = weekTasks.findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
      weekTasks[taskIndex] = { ...weekTasks[taskIndex], checked: !weekTasks[taskIndex].checked };
    }
    
    courseTasks[week] = weekTasks;
    newData.tasks = { ...newData.tasks, [courseId]: courseTasks };
    return { data: newData };
  }),

  reorderTasks: (courseId, week, newTasksOrder) => set((state) => {
    const newData = { ...state.data };
    const courseTasks = { ...newData.tasks[courseId] };
    courseTasks[week] = newTasksOrder;
    newData.tasks = { ...newData.tasks, [courseId]: courseTasks };
    return { data: newData };
  }),
  
  moveTaskBetweenWeeks: (courseId, sourceWeek, destWeek, taskId, sourceIndex, destIndex) => set((state) => {
    const newData = { ...state.data };
    const courseTasks = { ...newData.tasks[courseId] };
    
    const sourceList = [...courseTasks[sourceWeek]];
    const destList = sourceWeek === destWeek ? sourceList : [...courseTasks[destWeek]];
    
    const [movedTask] = sourceList.splice(sourceIndex, 1);
    
    // Update task ID slightly to avoid dupes if moved back? Usually not needed if strictly moved.
    // We'll keep the same task ID.
    destList.splice(destIndex, 0, movedTask);
    
    courseTasks[sourceWeek] = sourceList;
    courseTasks[destWeek] = destList;
    newData.tasks = { ...newData.tasks, [courseId]: courseTasks };
    return { data: newData };
  }),

  toggleGlobalTask: (courseId, category, taskId) => set((state) => {
    const newData = { ...state.data };
    const courseGlobalTasks = { ...newData.globalTasks[courseId] };
    
    if (!courseGlobalTasks[category]) {
      courseGlobalTasks[category] = [];
    }
    
    const categoryTasks = courseGlobalTasks[category].map(t => {
      if (t.id === taskId) return { ...t, checked: !t.checked };
      return t;
    });
    
    courseGlobalTasks[category] = categoryTasks;
    newData.globalTasks = { ...newData.globalTasks, [courseId]: courseGlobalTasks };
    return { data: newData };
  }),

  // Notes & Links
  saveNote: (courseId, week, note) => set((state) => {
    const newData = { ...state.data };
    const courseNotes = { ...newData.notes[courseId] };
    courseNotes[week] = note;
    newData.notes = { ...newData.notes, [courseId]: courseNotes };
    return { data: newData };
  }),

  saveLinks: (courseId, links) => set((state) => {
    const newData = { ...state.data };
    newData.links = { ...newData.links, [courseId]: links };
    return { data: newData };
  }),

  // Semester Reset
  resetSemester: () => set((state) => {
    const newData = generateInitialState();
    // Keep courses but reset tasks, notes, etc.
    newData.courses = [...state.data.courses];
    
    // We need to re-initialize the internal structure based on the kept courses
    newData.courses.forEach(course => {
      newData.tasks[course.id] = {};
      newData.notes[course.id] = {};
      newData.globalTasks[course.id] = { past_exams: [], summaries: [], quizzes: [] };
      newData.links[course.id] = state.data.links[course.id] || {
        notebookLm: course.defaultNotebookLmLink || "",
        gemini: course.defaultGeminiLink || "",
        localFolder: course.defaultLocalFolder || ""
      };

      for (let week = 1; week <= course.weeksCount; week++) {
        newData.notes[course.id][week] = "";
        newData.tasks[course.id][week] = [
          { id: `${course.id}-w${week}-lecture-0`, type: 'lecture', label: 'הרצאה', checked: false },
          { id: `${course.id}-w${week}-tutorial-1`, type: 'tutorial', label: 'תרגול', checked: false },
          { id: `${course.id}-w${week}-homework-2`, type: 'homework', label: 'שיעורי בית', checked: false }
        ];
      }
    });

    return { data: newData };
  })
}));
