import { create } from 'zustand';
import { generateInitialState } from '../data';

export const useStore = create((set, get) => ({
  data: generateInitialState(),
  activeCourse: null,
  activeCategory: 'overview',
  theme: localStorage.getItem('theme') || 'dark',
  pomodoro: { active: false, timeLeft: 25 * 60, mode: 'work' },
  pomoSettings: { work: 25, break: 5 },
  
  setData: (newData) => set({ data: newData }),
  setActiveCourse: (course) => set({ activeCourse: course }),
  setActiveCategory: (category) => set({ activeCategory: category }),
  
  setTheme: (theme) => {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    set({ theme });
  },
  
  setPomodoro: (pomoUpdater) => set((state) => ({ 
    pomodoro: typeof pomoUpdater === 'function' ? pomoUpdater(state.pomodoro) : pomoUpdater 
  })),
  
  setPomoSettings: (settings) => set({ pomoSettings: settings }),

  toggleTask: (courseId, week, taskId) => set((state) => {
    const newData = { ...state.data };
    newData.tasks = { ...newData.tasks };
    newData.tasks[courseId] = { ...newData.tasks[courseId] };
    newData.tasks[courseId][week] = { ...newData.tasks[courseId][week] };
    newData.tasks[courseId][week][taskId] = !newData.tasks[courseId][week][taskId];
    return { data: newData };
  }),
  
  toggleGlobalTask: (courseId, category, taskId) => set((state) => {
    const newData = { ...state.data };
    newData.globalTasks = { ...newData.globalTasks };
    newData.globalTasks[courseId] = { ...newData.globalTasks[courseId] };
    
    // Safety check in case category array doesn't exist
    if (!newData.globalTasks[courseId][category]) {
      newData.globalTasks[courseId][category] = [];
    }
    
    const categoryTasks = newData.globalTasks[courseId][category].map(t => {
      if (t.id === taskId) {
        return { ...t, checked: !t.checked };
      }
      return t;
    });
    newData.globalTasks[courseId][category] = categoryTasks;
    return { data: newData };
  }),

  saveNote: (courseId, week, note) => set((state) => {
    const newData = { ...state.data };
    newData.notes = { ...newData.notes };
    newData.notes[courseId] = { ...newData.notes[courseId] };
    newData.notes[courseId][week] = note;
    return { data: newData };
  }),

  saveLinks: (courseId, links) => set((state) => {
    const newData = { ...state.data };
    newData.links = { ...newData.links };
    newData.links[courseId] = links;
    return { data: newData };
  })
}));
