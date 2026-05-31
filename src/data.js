export const DEFAULT_COURSES = [
  {
    id: 'infi2',
    name: "אינפי 2",
    defaultNotebookLmLink: "https://notebooklm.google.com/notebook/c794b117-dcf9-4eb7-a02e-4ecc5bf938dc",
    defaultGeminiLink: "https://gemini.google.com/notebook/c794b117-dcf9-4eb7-a02e-4ecc5bf938dc",
    defaultLocalFolder: "אינפי 2",
    weeksCount: 12,
    exams: {
      moedA: "2026-07-03T09:00:00",
      moedB: "2026-08-06T09:45:00",
      moedC: null
    }
  },
  {
    id: 'linear2',
    name: "אלגברה לינארית 2",
    defaultNotebookLmLink: "https://notebooklm.google.com/notebook/77081b2d-d76a-4b1e-a241-6262ec2558ff",
    defaultGeminiLink: "https://gemini.google.com/notebook/77081b2d-d76a-4b1e-a241-6262ec2558ff",
    defaultLocalFolder: "אלגברה לינארית 2",
    weeksCount: 12,
    exams: {
      moedA: "2026-07-27T09:45:00",
      moedB: "2026-08-27T09:45:00",
      moedC: null
    }
  },
  {
    id: 'c_sys',
    name: "תכנות בשפת C",
    defaultNotebookLmLink: "https://notebooklm.google.com/notebook/fbd62fab-6c05-428f-b1a3-81254d54597f",
    defaultGeminiLink: "https://gemini.google.com/notebook/fbd62fab-6c05-428f-b1a3-81254d54597f",
    defaultLocalFolder: "תכנות בשפת C",
    weeksCount: 12,
    exams: {
      moedA: "2026-07-14T09:45:00",
      moedB: "2026-08-17T09:45:00",
      moedC: null
    }
  },
  {
    id: 'data_structures',
    name: "מבני נתונים",
    defaultNotebookLmLink: "https://notebooklm.google.com/notebook/aa843f5a-4c13-4cce-9b19-2996dd947b4a",
    defaultGeminiLink: "https://gemini.google.com/notebook/aa843f5a-4c13-4cce-9b19-2996dd947b4a",
    defaultLocalFolder: "מבני נתונים",
    weeksCount: 12,
    exams: {
      moedA: "2026-07-09T09:45:00",
      moedB: "2026-08-12T09:45:00",
      moedC: null
    }
  },
  {
    id: 'logic',
    name: "לוגיקה ותורת הקבוצות",
    defaultNotebookLmLink: "https://notebooklm.google.com/notebook/3c441193-4665-4cc2-bb90-c630cca092b5",
    defaultGeminiLink: "https://gemini.google.com/notebook/3c441193-4665-4cc2-bb90-c630cca092b5",
    defaultLocalFolder: "לוגיקה ותורת הקבוצות",
    weeksCount: 12,
    exams: {
      moedA: "2026-07-19T09:45:00",
      moedB: "2026-08-20T09:45:00",
      moedC: null
    }
  }
];

export const DEFAULT_TASKS = [
  { type: 'lecture', label: 'הרצאה' },
  { type: 'tutorial', label: 'תרגול' },
  { type: 'homework', label: 'שיעורי בית' }
];

export const generateInitialState = () => {
  const state = {
    courses: [],
    tasks: {}, // courseId -> week -> array of tasks { id, type, label, checked }
    links: {},
    notes: {},
    globalTasks: {},
    pomodoroSessions: [], // Array of { id, courseId, date, minutes }
    profile: { displayName: "", academicYear: "שנה א'", semester: "סמסטר א'" }
  };
  
  return state;
};
