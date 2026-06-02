// Zustand store wired to Firestore.
//
// Architecture:
//   * The `data` shape is preserved (same keys components already read) so that
//     existing UI code doesn't need to change.
//   * `data` is REBUILT from real-time Firestore listeners (cl_profile,
//     cl_courses, cl_courseTasks, cl_pomodoroSessions). Subscribe on login,
//     unsubscribe on logout.
//   * Every mutating action does two things:
//       1) Optimistic local update (so the UI feels instant)
//       2) Write to Firestore (the listener will reconcile if the write differs)
//   * Theme/language/pomodoro UI state stays purely local (localStorage).

import { create } from 'zustand';
import { generateInitialState, OWNER_UID } from '../data';
import {
  subscribeProfile,
  setProfile as fsSetProfile,
  subscribeCourses,
  setCourse as fsSetCourse,
  deleteCourse as fsDeleteCourse,
  subscribeCourseTasks,
  setCourseTask as fsSetCourseTask,
  deleteCourseTask as fsDeleteCourseTask,
  batchSetCourseTasks,
  subscribePomodoroSessions,
  addPomodoroSession as fsAddPomodoroSession,
  subscribeEvents,
  setEvent as fsSetEvent,
  deleteEvent as fsDeleteEvent,
  subscribePersonalTasks,
  setPersonalTask as fsSetPersonalTask,
  deletePersonalTask as fsDeletePersonalTask,
  subscribeNotes,
  setNote as fsSetNote,
  deleteNote as fsDeleteNote,
  newId,
} from '../lib/firestoreRepo';
import {
  dateKey,
  subscribeMealsForDay,
  subscribeWorkoutsForDay,
  subscribeDailyHistory,
  subscribeRecentDailyHistory,
} from '../lib/caloriRepo';

// ---------- Helpers --------------------------------------------------------

// Build a stable id for a weekly seeded task (lecture/tutorial/homework).
const weeklyTaskId = (courseId, week, type, idx = 0) =>
  `${courseId}-w${week}-${type}-${idx}`;

// Build a global task id. Random suffix so two adds in the same ms don't clash.
const globalTaskId = (courseId, category) =>
  `${courseId}-${category}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

// Strip the firestore-only fields from a course doc to get the shape that
// `data.courses` expects (no embedded notes/links — those live in their own
// slices of `data`).
const stripCourseFields = (course) => {
  const { notes, links, ...rest } = course;
  return rest;
};

// Re-derive data.tasks and data.globalTasks from the flat cl_courseTasks list.
const rebuildTaskBuckets = (courseTaskDocs) => {
  const tasks = {};
  const globalTasks = {};

  for (const t of courseTaskDocs) {
    const { scope, week, category, courseId } = t;
    if (!courseId) continue;
    // The data we keep on each task item (drop scope/week/category/courseId
    // since they live in the parent map keys).
    const item = {
      id: t.id,
      type: t.type,
      label: t.label,
      checked: !!t.checked,
      files: Array.isArray(t.files) ? t.files : [],
      ...(t.order != null ? { order: t.order } : {}),
    };
    if (scope === 'weekly') {
      if (week == null) continue;
      tasks[courseId] ??= {};
      tasks[courseId][week] ??= [];
      tasks[courseId][week].push(item);
    } else if (scope === 'global') {
      if (!category) continue;
      globalTasks[courseId] ??= {};
      globalTasks[courseId][category] ??= [];
      globalTasks[courseId][category].push(item);
    }
  }

  // Sort each bucket by `order` if present, falling back to id for stability.
  const sortBucket = (arr) =>
    arr.sort((a, b) => {
      const ao = a.order ?? Infinity;
      const bo = b.order ?? Infinity;
      if (ao !== bo) return ao - bo;
      return String(a.id).localeCompare(String(b.id));
    });
  for (const cid of Object.keys(tasks))
    for (const w of Object.keys(tasks[cid])) sortBucket(tasks[cid][w]);
  for (const cid of Object.keys(globalTasks))
    for (const c of Object.keys(globalTasks[cid]))
      sortBucket(globalTasks[cid][c]);

  return { tasks, globalTasks };
};

// Seed the initial weekly tasks for a new course.
// `customSeeds` is an optional array of { type, label } — if provided, replaces defaults.
const buildInitialWeeklyTasksMap = (course, lang, customSeeds = null) => {
  const labels = {
    he: { lecture: 'הרצאה', tutorial: 'תרגול', homework: 'שיעורי בית' },
    en: { lecture: 'Lecture', tutorial: 'Tutorial', homework: 'Homework' },
  };
  const l = labels[lang] || labels.he;
  const seeds = customSeeds || [
    { type: 'lecture', label: l.lecture },
    { type: 'tutorial', label: l.tutorial },
    { type: 'homework', label: l.homework },
  ];
  const out = {};
  for (let week = 1; week <= course.weeksCount; week++) {
    seeds.forEach((s, idx) => {
      const id = weeklyTaskId(course.id, week, s.type, idx);
      out[id] = {
        courseId: course.id,
        scope: 'weekly',
        week,
        type: s.type,
        label: s.label,
        checked: false,
        files: [],
        order: idx,
      };
    });
  }
  return out;
};

// ---------- Store ----------------------------------------------------------

export const useStore = create((set, get) => ({
  // --- Data (mirror of Firestore) -----------------------------------------
  data: generateInitialState(),
  uid: null,
  hasCompletedOnboarding: undefined, // undefined = not yet determined
  dataLoaded: false, // true once the first Firestore snapshot has arrived
  _unsubs: [], // active onSnapshot cleanup fns

  // --- UI-only state ------------------------------------------------------
  activeCourse: null,
  activeCategory: 'overview',
  theme: localStorage.getItem('theme') || 'dark',
  language: localStorage.getItem('language') || 'he',
  pomodoro: { active: false, timeLeft: 25 * 60, mode: 'work', courseId: null },
  pomoSettings: { work: 25, break: 5 },
  sidebarOpen: false,
  showPomoSettings: false,
  showPomodoroModal: false,
  isUploading: false,
  // Phase 2 UI state
  showAddSheet: false,
  addSheetInitialTab: 'task', // 'event' | 'task' | 'note'
  addSheetPrefill: null, // optional { date, courseId, ... }
  // Phase 3: calori bridge UI state
  caloriDate: dateKey(), // currently-viewed day for calori data ('yyyy-MM-dd')
  _caloriDayUnsubs: [], // per-day calori listeners (re-subscribed on date change)

  // ---------- Subscriptions lifecycle -----------------------------------

  initFromAuth: (uid) => {
    if (!uid) return;
    // Tear down any previous listeners before starting fresh (covers auth
    // state flapping where initFromAuth fires twice without a cleanup()).
    get()._unsubs.forEach((u) => { try { u(); } catch { /* ignore */ } });
    get()._caloriDayUnsubs.forEach((u) => { try { u(); } catch { /* ignore */ } });

    const unsubProfile = subscribeProfile(uid, (profile) => {
      set((state) => ({
        data: {
          ...state.data,
          profile: profile || state.data.profile || {
            displayName: '',
            academicYear: "שנה א'",
            semester: "סמסטר א'",
          },
        },
      }));
    });

    const unsubCourses = subscribeCourses(uid, (courseDocs) => {
      const courses = courseDocs.map(stripCourseFields);
      const notes = {};
      const links = {};
      for (const c of courseDocs) {
        notes[c.id] = c.notes || {};
        links[c.id] = c.links || {
          notebookLm: c.defaultNotebookLmLink || '',
          gemini: c.defaultGeminiLink || '',
          localFolder: c.defaultLocalFolder || '',
        };
      }
      set((state) => ({
        data: { ...state.data, courses, notes, links },
        // First time the courses listener fires we've seen Firestore's view of
        // the world — even if it's empty. That's our "data loaded" signal and
        // also the only honest way to decide whether onboarding should be shown.
        dataLoaded: true,
        hasCompletedOnboarding:
          state.hasCompletedOnboarding === true
            ? true
            : courses.length > 0,
      }));
    });

    const unsubCourseTasks = subscribeCourseTasks(uid, (taskDocs) => {
      const { tasks, globalTasks } = rebuildTaskBuckets(taskDocs);
      set((state) => ({ data: { ...state.data, tasks, globalTasks } }));
    });

    const unsubPomodoro = subscribePomodoroSessions(uid, (sessions) => {
      set((state) => ({
        data: { ...state.data, pomodoroSessions: sessions },
      }));
    });

    const unsubEvents = subscribeEvents(uid, (events) => {
      set((state) => ({ data: { ...state.data, events } }));
    });
    const unsubPersonalTasks = subscribePersonalTasks(uid, (personalTasks) => {
      set((state) => ({ data: { ...state.data, personalTasks } }));
    });
    const unsubNotes = subscribeNotes(uid, (quickNotes) => {
      set((state) => ({ data: { ...state.data, quickNotes } }));
    });

    // ── Calori bridge (READ-ONLY) ──
    // Recent history is date-range independent; subscribe once here.
    const unsubRecentCalori = subscribeRecentDailyHistory(uid, (recentHistory) => {
      set((state) => ({
        data: { ...state.data, calori: { ...state.data.calori, recentHistory } },
      }));
    });

    set({
      uid,
      _unsubs: [
        unsubProfile,
        unsubCourses,
        unsubCourseTasks,
        unsubPomodoro,
        unsubEvents,
        unsubPersonalTasks,
        unsubNotes,
        unsubRecentCalori,
      ],
    });

    // Subscribe to the currently-selected calori day (today by default).
    get().subscribeCaloriDay(get().caloriDate);
  },

  cleanup: () => {
    get()._unsubs.forEach((u) => { try { u(); } catch { /* ignore */ } });
    get()._caloriDayUnsubs.forEach((u) => { try { u(); } catch { /* ignore */ } });
    set({
      uid: null,
      _unsubs: [],
      _caloriDayUnsubs: [],
      data: generateInitialState(),
      hasCompletedOnboarding: undefined,
      dataLoaded: false,
      activeCourse: null,
      activeCategory: 'overview',
      caloriDate: dateKey(),
    });
  },

  // ---------- Calori bridge (READ-ONLY) ---------------------------------

  // (Re)subscribe the per-day calori listeners for a given 'yyyy-MM-dd' date.
  subscribeCaloriDay: (date) => {
    const { uid } = get();
    if (!uid) return;
    // Tear down previous day listeners.
    get()._caloriDayUnsubs.forEach((u) => { try { u(); } catch { /* ignore */ } });

    const unsubMeals = subscribeMealsForDay(uid, date, (meals) => {
      set((state) => ({
        data: { ...state.data, calori: { ...state.data.calori, meals } },
      }));
    });
    const unsubWorkouts = subscribeWorkoutsForDay(uid, date, (workouts) => {
      set((state) => ({
        data: { ...state.data, calori: { ...state.data.calori, workouts } },
      }));
    });
    const unsubDayHistory = subscribeDailyHistory(uid, date, (dayHistory) => {
      set((state) => ({
        data: { ...state.data, calori: { ...state.data.calori, dayHistory } },
      }));
    });

    set({ _caloriDayUnsubs: [unsubMeals, unsubWorkouts, unsubDayHistory] });
  },

  // Change the viewed calori day and re-subscribe.
  setCaloriDate: (date) => {
    set({ caloriDate: date });
    get().subscribeCaloriDay(date);
  },

  // ---------- Plain setters ---------------------------------------------

  setData: (newData) => set({ data: newData }),
  setHasCompletedOnboarding: (val) => set({ hasCompletedOnboarding: val }),
  setActiveCourse: (course) => set({ activeCourse: course }),
  setActiveCategory: (category) => set({ activeCategory: category }),
  setSidebarOpen: (isOpen) => set({ sidebarOpen: isOpen }),
  setShowPomodoroModal: (isOpen) => set({ showPomodoroModal: isOpen }),
  setIsUploading: (status) => set({ isUploading: status }),
  setTheme: (theme) => {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    set({ theme });
  },
  setLanguage: (language) => {
    localStorage.setItem('language', language);
    set({ language });
  },
  setPomodoro: (pomoUpdater) =>
    set((state) => ({
      pomodoro:
        typeof pomoUpdater === 'function' ? pomoUpdater(state.pomodoro) : pomoUpdater,
    })),
  setPomoSettings: (settings) => set({ pomoSettings: settings }),
  setShowPomoSettings: (show) => set({ showPomoSettings: show }),

  // Open/close the unified Add-Item bottom sheet.
  openAddSheet: (tab = 'task', prefill = null) =>
    set({ showAddSheet: true, addSheetInitialTab: tab, addSheetPrefill: prefill }),
  closeAddSheet: () =>
    set({ showAddSheet: false, addSheetPrefill: null }),

  // ---------- Profile -----------------------------------------------------

  setProfile: (profileData) => {
    set((state) => ({
      data: { ...state.data, profile: { ...state.data.profile, ...profileData } },
    }));
    const { uid } = get();
    if (uid) fsSetProfile(uid, profileData).catch(console.error);
  },

  // ---------- Pomodoro sessions ------------------------------------------

  addPomodoroSession: (session) => {
    const { uid } = get();
    if (!session.courseId) return;
    if (!uid) return;
    fsAddPomodoroSession(uid, session).catch(console.error);
    // No optimistic update needed — listener will pick it up shortly.
  },

  // ---------- Onboarding -------------------------------------------------

  // seeds = optional [{ type, label }] array — applies to every selected course.
  completeOnboarding: async (profileData, selectedCourses, seeds = null) => {
    const { uid, language } = get();
    if (!uid) return;
    const lang = language || 'he';
    const isOwner = uid === OWNER_UID;

    // Persist profile + all courses. Let failures propagate so we DON'T flip
    // hasCompletedOnboarding on a partial write (which would strand the user
    // with no courses). The caller (OnboardingScreen) shows a toast on throw.
    await fsSetProfile(uid, profileData);

    for (const course of selectedCourses) {
      const notebookLmLink = isOwner ? (course.defaultNotebookLmLink || '') : '';
      const geminiLink = isOwner ? (course.defaultGeminiLink || '') : '';
      const courseDoc = {
        name: course.name,
        defaultNotebookLmLink: notebookLmLink,
        defaultGeminiLink: geminiLink,
        defaultLocalFolder: course.defaultLocalFolder || '',
        weeksCount: course.weeksCount,
        exams: course.exams || { moedA: null, moedB: null, moedC: null },
        isArchived: false,
        links: {
          notebookLm: notebookLmLink,
          gemini: geminiLink,
          localFolder: course.defaultLocalFolder || '',
        },
        notes: {},
      };
      await fsSetCourse(uid, course.id, courseDoc);
      const tasksMap = buildInitialWeeklyTasksMap(course, lang, seeds);
      await batchSetCourseTasks(uid, tasksMap);
    }

    set({ hasCompletedOnboarding: true });
  },

  // ---------- Courses ----------------------------------------------------

  addCourse: async (course) => {
    const { uid, language } = get();
    if (!uid) return;
    const lang = language || 'he';

    const courseDoc = {
      name: course.name,
      defaultNotebookLmLink: course.defaultNotebookLmLink || '',
      defaultGeminiLink: course.defaultGeminiLink || '',
      defaultLocalFolder: course.defaultLocalFolder || '',
      weeksCount: course.weeksCount,
      exams: course.exams || {
        moedA: course.moedA || null,
        moedB: course.moedB || null,
        moedC: course.moedC || null,
      },
      isArchived: false,
      links: {
        notebookLm: course.defaultNotebookLmLink || '',
        gemini: course.defaultGeminiLink || '',
        localFolder: course.defaultLocalFolder || '',
      },
      notes: {},
    };
    await fsSetCourse(uid, course.id, courseDoc).catch(console.error);

    const tasksMap = buildInitialWeeklyTasksMap(course, lang);
    await batchSetCourseTasks(uid, tasksMap).catch(console.error);
  },

  updateCourse: (courseId, updates) => {
    const { uid } = get();
    set((state) => {
      const courses = state.data.courses.map((c) =>
        c.id === courseId ? { ...c, ...updates } : c,
      );
      return { data: { ...state.data, courses } };
    });
    if (uid) fsSetCourse(uid, courseId, updates).catch(console.error);
  },

  archiveCourse: (courseId, isArchived) => {
    const { uid } = get();
    set((state) => {
      const courses = state.data.courses.map((c) =>
        c.id === courseId ? { ...c, isArchived } : c,
      );
      return { data: { ...state.data, courses } };
    });
    if (uid) fsSetCourse(uid, courseId, { isArchived }).catch(console.error);
  },

  // ---------- Weekly tasks ------------------------------------------------

  toggleTask: (courseId, week, taskId) => {
    const { uid } = get();
    let newChecked = null;
    set((state) => {
      const newData = { ...state.data };
      const courseTasks = { ...(newData.tasks[courseId] || {}) };
      const weekTasks = [...(courseTasks[week] || [])];
      const i = weekTasks.findIndex((t) => t.id === taskId);
      if (i !== -1) {
        newChecked = !weekTasks[i].checked;
        weekTasks[i] = { ...weekTasks[i], checked: newChecked };
      }
      courseTasks[week] = weekTasks;
      newData.tasks = { ...newData.tasks, [courseId]: courseTasks };
      return { data: newData };
    });
    if (uid && newChecked != null)
      fsSetCourseTask(uid, taskId, { checked: newChecked }).catch(console.error);
  },

  attachFileToTask: (courseId, week, taskId, file) => {
    const { uid } = get();
    let newFiles = null;
    set((state) => {
      const newData = { ...state.data };
      const courseTasks = { ...(newData.tasks[courseId] || {}) };
      const weekTasks = [...(courseTasks[week] || [])];
      const i = weekTasks.findIndex((t) => t.id === taskId);
      if (i !== -1) {
        newFiles = [...(weekTasks[i].files || []), file];
        weekTasks[i] = { ...weekTasks[i], files: newFiles };
      }
      courseTasks[week] = weekTasks;
      newData.tasks = { ...newData.tasks, [courseId]: courseTasks };
      return { data: newData };
    });
    if (uid && newFiles)
      fsSetCourseTask(uid, taskId, { files: newFiles }).catch(console.error);
  },

  removeFileFromTask: (courseId, week, taskId, filePath) => {
    const { uid } = get();
    let newFiles = null;
    set((state) => {
      const newData = { ...state.data };
      const courseTasks = { ...(newData.tasks[courseId] || {}) };
      const weekTasks = [...(courseTasks[week] || [])];
      const i = weekTasks.findIndex((t) => t.id === taskId);
      if (i !== -1 && weekTasks[i].files) {
        newFiles = weekTasks[i].files.filter((f) => f.path !== filePath);
        weekTasks[i] = { ...weekTasks[i], files: newFiles };
      }
      courseTasks[week] = weekTasks;
      newData.tasks = { ...newData.tasks, [courseId]: courseTasks };
      return { data: newData };
    });
    if (uid && newFiles)
      fsSetCourseTask(uid, taskId, { files: newFiles }).catch(console.error);
  },

  reorderTasks: (courseId, week, newTasksOrder) => {
    const { uid } = get();
    set((state) => {
      const newData = { ...state.data };
      const courseTasks = { ...(newData.tasks[courseId] || {}) };
      courseTasks[week] = newTasksOrder;
      newData.tasks = { ...newData.tasks, [courseId]: courseTasks };
      return { data: newData };
    });
    if (uid) {
      const updates = {};
      newTasksOrder.forEach((t, idx) => {
        updates[t.id] = { order: idx };
      });
      batchSetCourseTasks(uid, updates).catch(console.error);
    }
  },

  moveTaskBetweenWeeks: (courseId, sourceWeek, destWeek, taskId, sourceIndex, destIndex) => {
    const { uid } = get();
    let updatedTaskId = null;
    let updatedFields = null;
    let sourceListAfter = null;
    let destListAfter = null;

    set((state) => {
      const newData = { ...state.data };
      const courseTasks = { ...(newData.tasks[courseId] || {}) };
      const sourceList = [...(courseTasks[sourceWeek] || [])];
      const destList =
        sourceWeek === destWeek ? sourceList : [...(courseTasks[destWeek] || [])];
      const [moved] = sourceList.splice(sourceIndex, 1);
      destList.splice(destIndex, 0, moved);
      courseTasks[sourceWeek] = sourceList;
      courseTasks[destWeek] = destList;
      newData.tasks = { ...newData.tasks, [courseId]: courseTasks };

      updatedTaskId = moved.id;
      updatedFields = { week: destWeek };
      sourceListAfter = sourceList;
      destListAfter = destList;
      return { data: newData };
    });

    if (uid && updatedTaskId) {
      const updates = { [updatedTaskId]: updatedFields };
      // Re-index the impacted weeks' orders.
      sourceListAfter.forEach((t, idx) => {
        updates[t.id] = { ...(updates[t.id] || {}), order: idx };
      });
      destListAfter.forEach((t, idx) => {
        updates[t.id] = { ...(updates[t.id] || {}), order: idx };
      });
      batchSetCourseTasks(uid, updates).catch(console.error);
    }
  },

  // ---------- Global tasks ------------------------------------------------

  addGlobalTask: (courseId, category, taskLabel, files = []) => {
    const { uid } = get();
    const id = globalTaskId(courseId, category);
    const newTask = { id, label: taskLabel, checked: false, files };

    set((state) => {
      const newData = { ...state.data };
      const courseGlobal = { ...(newData.globalTasks[courseId] || {}) };
      const cat = [...(courseGlobal[category] || []), newTask];
      courseGlobal[category] = cat;
      newData.globalTasks = { ...newData.globalTasks, [courseId]: courseGlobal };
      return { data: newData };
    });

    if (uid) {
      fsSetCourseTask(uid, id, {
        courseId,
        scope: 'global',
        category,
        label: taskLabel,
        checked: false,
        files,
        order: Date.now(),
      }).catch(console.error);
    }
  },

  deleteGlobalTask: (courseId, category, taskId) => {
    const { uid } = get();
    set((state) => {
      const newData = { ...state.data };
      const courseGlobal = { ...(newData.globalTasks[courseId] || {}) };
      courseGlobal[category] = (courseGlobal[category] || []).filter(
        (t) => t.id !== taskId,
      );
      newData.globalTasks = { ...newData.globalTasks, [courseId]: courseGlobal };
      return { data: newData };
    });
    if (uid) fsDeleteCourseTask(uid, taskId).catch(console.error);
  },

  toggleGlobalTask: (courseId, category, taskId) => {
    const { uid } = get();
    let newChecked = null;
    set((state) => {
      const newData = { ...state.data };
      const courseGlobal = { ...(newData.globalTasks[courseId] || {}) };
      courseGlobal[category] = (courseGlobal[category] || []).map((t) => {
        if (t.id === taskId) {
          newChecked = !t.checked;
          return { ...t, checked: newChecked };
        }
        return t;
      });
      newData.globalTasks = { ...newData.globalTasks, [courseId]: courseGlobal };
      return { data: newData };
    });
    if (uid && newChecked != null)
      fsSetCourseTask(uid, taskId, { checked: newChecked }).catch(console.error);
  },

  attachFileToGlobalTask: (courseId, category, taskId, file) => {
    const { uid } = get();
    let newFiles = null;
    set((state) => {
      const newData = { ...state.data };
      const courseGlobal = { ...(newData.globalTasks[courseId] || {}) };
      courseGlobal[category] = (courseGlobal[category] || []).map((t) => {
        if (t.id === taskId) {
          newFiles = [...(t.files || []), file];
          return { ...t, files: newFiles };
        }
        return t;
      });
      newData.globalTasks = { ...newData.globalTasks, [courseId]: courseGlobal };
      return { data: newData };
    });
    if (uid && newFiles)
      fsSetCourseTask(uid, taskId, { files: newFiles }).catch(console.error);
  },

  removeFileFromGlobalTask: (courseId, category, taskId, filePath) => {
    const { uid } = get();
    let newFiles = null;
    set((state) => {
      const newData = { ...state.data };
      const courseGlobal = { ...(newData.globalTasks[courseId] || {}) };
      courseGlobal[category] = (courseGlobal[category] || []).map((t) => {
        if (t.id === taskId && t.files) {
          newFiles = t.files.filter((f) => f.path !== filePath);
          return { ...t, files: newFiles };
        }
        return t;
      });
      newData.globalTasks = { ...newData.globalTasks, [courseId]: courseGlobal };
      return { data: newData };
    });
    if (uid && newFiles)
      fsSetCourseTask(uid, taskId, { files: newFiles }).catch(console.error);
  },

  // ---------- Notes & links (embedded in course doc) ---------------------

  saveNote: (courseId, week, note) => {
    const { uid } = get();
    set((state) => {
      const newData = { ...state.data };
      const courseNotes = { ...(newData.notes[courseId] || {}) };
      courseNotes[week] = note;
      newData.notes = { ...newData.notes, [courseId]: courseNotes };
      return { data: newData };
    });
    if (uid)
      fsSetCourse(uid, courseId, { [`notes.${week}`]: note }).catch(console.error);
  },

  saveLinks: (courseId, links) => {
    const { uid } = get();
    set((state) => {
      const newData = { ...state.data };
      newData.links = { ...newData.links, [courseId]: links };
      return { data: newData };
    });
    if (uid) fsSetCourse(uid, courseId, { links }).catch(console.error);
  },

  // ---------- Semester reset ---------------------------------------------

  resetSemester: async () => {
    const { uid, data, language } = get();
    if (!uid) return;
    const lang = language || 'he';

    // Reseed: keep courses, wipe their notes, wipe all course tasks, recreate
    // the weekly seeds.
    for (const course of data.courses) {
      await fsSetCourse(uid, course.id, { notes: {} }).catch(console.error);
    }

    // Delete all existing tasks + create new ones in one batch each course.
    // (We can't easily delete-then-create atomically across courses; do it
    // sequentially. Listener will reconcile mid-flight, that's fine.)
    const currentTasks = [];
    Object.entries(data.tasks).forEach(([cid, weeks]) => {
      Object.values(weeks).forEach((weekTasks) => {
        weekTasks.forEach((t) => currentTasks.push(t.id));
      });
    });
    Object.entries(data.globalTasks).forEach(([cid, cats]) => {
      Object.values(cats).forEach((catTasks) => {
        catTasks.forEach((t) => currentTasks.push(t.id));
      });
    });
    for (const tid of currentTasks) {
      await fsDeleteCourseTask(uid, tid).catch(console.error);
    }
    for (const course of data.courses) {
      const tasksMap = buildInitialWeeklyTasksMap(course, lang);
      await batchSetCourseTasks(uid, tasksMap).catch(console.error);
    }
  },

  // ---------- Hard delete a course (used by future settings) ------------

  deleteCourseFully: async (courseId) => {
    const { uid } = get();
    if (!uid) return;
    await fsDeleteCourse(uid, courseId).catch(console.error);
  },

  // ---------- Personal events (cl_events) -------------------------------

  addEvent: async (input) => {
    const { uid } = get();
    if (!uid) return null;
    const id = newId(uid, 'event');
    const now = new Date().toISOString();
    const event = {
      title: input.title || '',
      type: 'event',
      start: input.start || null,
      end: input.end || null,
      allDay: !!input.allDay,
      location: input.location || '',
      notes: input.notes || '',
      color: input.color || null,
      source: input.source || 'manual',
      courseId: input.courseId || null,
      createdAt: now,
      updatedAt: now,
    };
    // Optimistic insert.
    set((state) => ({
      data: { ...state.data, events: [...state.data.events, { id, ...event }] },
    }));
    await fsSetEvent(uid, id, event).catch(console.error);
    return id;
  },

  updateEvent: (id, updates) => {
    const { uid } = get();
    set((state) => ({
      data: {
        ...state.data,
        events: state.data.events.map((e) => (e.id === id ? { ...e, ...updates } : e)),
      },
    }));
    if (uid)
      fsSetEvent(uid, id, { ...updates, updatedAt: new Date().toISOString() }).catch(
        console.error,
      );
  },

  deleteEvent: (id) => {
    const { uid } = get();
    set((state) => ({
      data: { ...state.data, events: state.data.events.filter((e) => e.id !== id) },
    }));
    if (uid) fsDeleteEvent(uid, id).catch(console.error);
  },

  // ---------- Personal tasks (cl_personalTasks) -------------------------

  addPersonalTask: async (input) => {
    const { uid } = get();
    if (!uid) return null;
    const id = newId(uid, 'personalTask');
    const now = new Date().toISOString();
    const task = {
      title: input.title || '',
      type: 'task',
      dueDate: input.dueDate || null,
      dueTime: input.dueTime || null,
      done: false,
      doneAt: null,
      priority: input.priority || 'med',
      list: input.list || 'personal',
      notes: input.notes || '',
      courseId: input.courseId || null,
      reminder: input.reminder || null,
      subtasks: [],
      createdAt: now,
      updatedAt: now,
    };
    set((state) => ({
      data: {
        ...state.data,
        personalTasks: [...state.data.personalTasks, { id, ...task }],
      },
    }));
    await fsSetPersonalTask(uid, id, task).catch(console.error);
    return id;
  },

  updatePersonalTask: (id, updates) => {
    const { uid } = get();
    set((state) => ({
      data: {
        ...state.data,
        personalTasks: state.data.personalTasks.map((t) =>
          t.id === id ? { ...t, ...updates } : t,
        ),
      },
    }));
    if (uid)
      fsSetPersonalTask(uid, id, {
        ...updates,
        updatedAt: new Date().toISOString(),
      }).catch(console.error);
  },

  togglePersonalTask: (id) => {
    const { uid } = get();
    let next = null;
    set((state) => ({
      data: {
        ...state.data,
        personalTasks: state.data.personalTasks.map((t) => {
          if (t.id !== id) return t;
          next = {
            done: !t.done,
            doneAt: !t.done ? new Date().toISOString() : null,
          };
          return { ...t, ...next };
        }),
      },
    }));
    if (uid && next) fsSetPersonalTask(uid, id, next).catch(console.error);
  },

  deletePersonalTask: (id) => {
    const { uid } = get();
    set((state) => ({
      data: {
        ...state.data,
        personalTasks: state.data.personalTasks.filter((t) => t.id !== id),
      },
    }));
    if (uid) fsDeletePersonalTask(uid, id).catch(console.error);
  },

  // ---------- Quick notes (cl_notes) ------------------------------------

  addQuickNote: async (input) => {
    const { uid } = get();
    if (!uid) return null;
    const id = newId(uid, 'note');
    const now = new Date().toISOString();
    const note = {
      title: input.title || '',
      content: input.content || '',
      type: 'note',
      pinned: !!input.pinned,
      color: input.color || null,
      courseId: input.courseId || null,
      createdAt: now,
      updatedAt: now,
    };
    set((state) => ({
      data: {
        ...state.data,
        quickNotes: [...state.data.quickNotes, { id, ...note }],
      },
    }));
    await fsSetNote(uid, id, note).catch(console.error);
    return id;
  },

  updateQuickNote: (id, updates) => {
    const { uid } = get();
    set((state) => ({
      data: {
        ...state.data,
        quickNotes: state.data.quickNotes.map((n) =>
          n.id === id ? { ...n, ...updates } : n,
        ),
      },
    }));
    if (uid)
      fsSetNote(uid, id, { ...updates, updatedAt: new Date().toISOString() }).catch(
        console.error,
      );
  },

  deleteQuickNote: (id) => {
    const { uid } = get();
    set((state) => ({
      data: {
        ...state.data,
        quickNotes: state.data.quickNotes.filter((n) => n.id !== id),
      },
    }));
    if (uid) fsDeleteNote(uid, id).catch(console.error);
  },

  // ---------- Subtasks (inline array on personalTask doc) ---------------

  addSubtask: (taskId, title) => {
    const { uid } = get();
    const subtaskId = `sub-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
    let newSubtasks = null;
    set((state) => ({
      data: {
        ...state.data,
        personalTasks: state.data.personalTasks.map((t) => {
          if (t.id !== taskId) return t;
          newSubtasks = [...(t.subtasks || []), { id: subtaskId, title, done: false }];
          return { ...t, subtasks: newSubtasks };
        }),
      },
    }));
    if (uid && newSubtasks)
      fsSetPersonalTask(uid, taskId, { subtasks: newSubtasks }).catch(console.error);
  },

  toggleSubtask: (taskId, subtaskId) => {
    const { uid } = get();
    let newSubtasks = null;
    set((state) => ({
      data: {
        ...state.data,
        personalTasks: state.data.personalTasks.map((t) => {
          if (t.id !== taskId) return t;
          newSubtasks = (t.subtasks || []).map((s) =>
            s.id === subtaskId ? { ...s, done: !s.done } : s,
          );
          return { ...t, subtasks: newSubtasks };
        }),
      },
    }));
    if (uid && newSubtasks)
      fsSetPersonalTask(uid, taskId, { subtasks: newSubtasks }).catch(console.error);
  },

  deleteSubtask: (taskId, subtaskId) => {
    const { uid } = get();
    let newSubtasks = null;
    set((state) => ({
      data: {
        ...state.data,
        personalTasks: state.data.personalTasks.map((t) => {
          if (t.id !== taskId) return t;
          newSubtasks = (t.subtasks || []).filter((s) => s.id !== subtaskId);
          return { ...t, subtasks: newSubtasks };
        }),
      },
    }));
    if (uid && newSubtasks)
      fsSetPersonalTask(uid, taskId, { subtasks: newSubtasks }).catch(console.error);
  },
}));
