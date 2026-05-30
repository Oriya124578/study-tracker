export const COURSES = [
  {
    id: 'infi2',
    name: "אינפי 2",
    defaultNotebookLmLink: "https://notebooklm.google.com/notebook/c794b117-dcf9-4eb7-a02e-4ecc5bf938dc",
    defaultGeminiLink: "https://gemini.google.com/notebook/c794b117-dcf9-4eb7-a02e-4ecc5bf938dc",
    defaultLocalFolder: "אינפי 2",
    exams: {
      moedA: new Date("2026-07-03T09:00:00"),
      moedB: new Date("2026-08-06T09:45:00"),
    }
  },
  {
    id: 'linear2',
    name: "אלגברה לינארית 2",
    defaultNotebookLmLink: "https://notebooklm.google.com/notebook/77081b2d-d76a-4b1e-a241-6262ec2558ff",
    defaultGeminiLink: "https://gemini.google.com/notebook/77081b2d-d76a-4b1e-a241-6262ec2558ff",
    defaultLocalFolder: "אלגברה לינארית 2",
    exams: {
      moedA: new Date("2026-07-27T09:45:00"),
      moedB: new Date("2026-08-27T09:45:00"),
    }
  },
  {
    id: 'c_sys',
    name: "תכנות בשפת C",
    defaultNotebookLmLink: "https://notebooklm.google.com/notebook/fbd62fab-6c05-428f-b1a3-81254d54597f",
    defaultGeminiLink: "https://gemini.google.com/notebook/fbd62fab-6c05-428f-b1a3-81254d54597f",
    defaultLocalFolder: "תכנות בשפת C",
    exams: {
      moedA: new Date("2026-07-14T09:45:00"),
      moedB: new Date("2026-08-17T09:45:00"),
    }
  },
  {
    id: 'data_structures',
    name: "מבני נתונים",
    defaultNotebookLmLink: "https://notebooklm.google.com/notebook/aa843f5a-4c13-4cce-9b19-2996dd947b4a",
    defaultGeminiLink: "https://gemini.google.com/notebook/aa843f5a-4c13-4cce-9b19-2996dd947b4a",
    defaultLocalFolder: "מבני נתונים",
    exams: {
      moedA: new Date("2026-07-09T09:45:00"),
      moedB: new Date("2026-08-12T09:45:00"),
    }
  },
  {
    id: 'logic',
    name: "לוגיקה ותורת הקבוצות",
    defaultNotebookLmLink: "https://notebooklm.google.com/notebook/3c441193-4665-4cc2-bb90-c630cca092b5",
    defaultGeminiLink: "https://gemini.google.com/notebook/3c441193-4665-4cc2-bb90-c630cca092b5",
    defaultLocalFolder: "לוגיקה ותורת הקבוצות",
    exams: {
      moedA: new Date("2026-07-19T09:45:00"),
      moedB: new Date("2026-08-20T09:45:00"),
    }
  }
];

// Map task IDs to typical folder names the user has (e.g. "הרצאות", "תרגולים")
export const DEFAULT_TASKS = [
  { id: 'lecture', label: 'הרצאה', folderPattern: 'הרצאות' },
  { id: 'tutorial', label: 'תרגול', folderPattern: 'תרגולים' },
  { id: 'homework', label: 'שיעורי בית', folderPattern: 'שיעורי בית' }
];

export const generateInitialState = () => {
  const state = {
    tasks: {},
    links: {},
    notes: {},
    globalTasks: {}
  };
  COURSES.forEach(course => {
    state.tasks[course.id] = {};
    state.notes[course.id] = {};
    state.globalTasks[course.id] = {
      past_exams: [],
      summaries: [],
      quizzes: []
    };
    
    state.links[course.id] = {
      notebookLm: course.defaultNotebookLmLink,
      gemini: course.defaultGeminiLink,
      localFolder: course.defaultLocalFolder
    };

    for (let week = 1; week <= 12; week++) {
      state.tasks[course.id][week] = {};
      state.notes[course.id][week] = "";
      DEFAULT_TASKS.forEach(task => {
        state.tasks[course.id][week][task.id] = false;
      });
    }
  });
  return state;
};
