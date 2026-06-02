# תוכנית שדרוג: מ-Study Tracker למנהל אישי מאוחד

> מסמך תכנון לדיון. אין לכתוב קוד עד אישור.
> תאריך: 2026-06-02

---

## 1. חזון

לקחת את `study-tracker` הקיים (מנהל לימודים: קורסים, משימות שבועיות, מבחנים, פומודורו, יומן) ולהפוך אותו ל**מנהל אישי מאוחד** בסגנון 24me — שבו הלימודים הם רק *אחד* מתחומי החיים, לצד אירועים אישיים, משימות כלליות, פתקים, ואינטגרציה חיה עם `calori_1300` (תזונה ואימונים).

**עיקרון מנחה:** האפליקציה הקיימת לא נמחקת — היא הופכת ל**מודול "לימודים"** בתוך מערכת רחבה יותר. ה-DNA של 24me (יומן מאוחד + פעולות מהירות + התראות חכמות) מולבש על הזהות הויזואלית הצהובה של Calori.

---

## 2. השוואת מצב

| תחום | היום (study-tracker) | יעד (Unified Manager) |
|---|---|---|
| תחום פעולה | לימודים בלבד | לימודים + חיים אישיים + תזונה/אימונים |
| יומן | מציג רק מבחנים + פומודורו | מציג הכל: אירועים, משימות, פתקים, אימוני calori, פומודורו, מבחנים |
| סוגי פריטים | Course, Task (שבועי), Note, Link | + Event, PersonalTask, QuickNote, Reminder |
| Backend | Supabase | Firebase (Firestore) — מאוחד עם calori |
| התראות | אין | Push (FCM) + Smart suggestions |
| אינטגרציות חיצוניות | אין | Google Calendar, Weather, calori (live), קישורי תלמיד |
| תצוגות יומן | חודש | יום / 3 ימים / שבוע / חודש / רשימה |

---

## 3. ארכיטקטורה חדשה

### 3.1 מבנה אפליקציה (פיצול לחבילות לוגיות)

```
src/
├── modules/
│   ├── studies/        ← כל הקוד הקיים מוזז לכאן (קורסים, שבועות, מבחנים, פומודורו, קבצים)
│   ├── personal/       ← חדש: events, tasks, notes, reminders
│   ├── calendar/       ← מאוחד: מציג גם studies וגם personal וגם calori
│   ├── calori-bridge/  ← חדש: קריאה מ-Firestore של calori
│   └── command-center/ ← לוח-בית חכם: greeting, "מה היום", "מה דחוף"
├── components/
│   ├── shared/         ← UI primitives (קיים)
│   └── add-item-sheet/ ← bottom sheet בסגנון 24me (אירוע/משימה/פתק)
├── store/
│   ├── useStore.js     ← קיים, נשאר מקור-אמת ללימודים
│   ├── usePersonal.js  ← חדש: events, tasks, notes
│   └── useCalori.js    ← חדש: read-only mirror של calori
└── lib/
    ├── firebase.js     ← חדש
    └── notifications.js ← חדש (FCM)
```

### 3.2 ניווט (Layout עליון)

בסגנון 24me — Bottom Tab Bar עם 3-4 פינות:

```
┌─────────────────────────────────────┐
│  [Header: תאריך + מזג אוויר + ⚙️]   │
│                                      │
│         < תוכן המסך >                │
│                                      │
│  [⊕  Floating Add Button]            │
├─────────────────────────────────────┤
│  בית  |  יומן  |  לימודים  |  עוד   │
└─────────────────────────────────────┘
```

- **בית** = Command Center (greeting, היום שלי, שורת מצב, calori של היום)
- **יומן** = תצוגה מאוחדת של אירועים/משימות/מבחנים/אימונים
- **לימודים** = כל הפונקציונליות הקיימת (קורסים, שבועות, פומודורו)
- **עוד** = הגדרות, פרופיל, יומנים מוצגים, לינקים, archive

ה-FAB מרכזי בתחתית, בצהוב מלא, פותח **Add-Item Sheet** עם 3 טאבים (אירוע/משימה/פתק) כמו בצילום הראשון של 24me.

---

## 4. מודל נתונים חדש

### 4.1 Firestore Collections

```
users/{userId}/
  ├── profile          (doc)   ← displayName, year, semester, settings
  ├── courses/         (col)   ← מהמודל הקיים, ללא שינוי לוגי
  ├── courseTasks/     (col)   ← tasks ב-week-grid (כיום מקונן ב-app_state)
  ├── events/          (col)   ← חדש
  ├── personalTasks/   (col)   ← חדש
  ├── notes/           (col)   ← חדש (quick notes ב-24me style)
  ├── pomodoroSessions/(col)   ← מהמודל הקיים
  └── displayedCalendars (doc) ← אילו "יומנים" המשתמש בחר להציג

users/{userId}/calori/  ← נקרא מה-collection הקיים של calori, או מחובר ב-rules
```

### 4.2 סכמות פריטים חדשים

```js
// Event
{
  id, title, type: 'event',
  start: ISO, end: ISO, allDay: bool,
  location?, notes?, attendees?: [],
  source: 'manual' | 'google' | 'calori',
  color?, repeat?
}

// PersonalTask
{
  id, title, type: 'task',
  dueDate?: ISO, dueTime?: ISO,
  done: bool, doneAt?: ISO,
  priority: 'low' | 'med' | 'high',
  list?: 'study' | 'home' | 'shopping' | ...,
  notes?
}

// Note
{
  id, title?, content, type: 'note',
  createdAt, updatedAt,
  pinned?: bool, color?
}
```

### 4.3 שכבת תצוגה מאוחדת (CalendarView חדש)

ה-`CalendarView` הופך לאגרגטור שמושך מכל המקורות וממפה ל-pinned format:

```js
// pseudo
const items = [
  ...events,                                    // ידני / Google
  ...personalTasks.filter(hasDueDate).map(toCal),
  ...courses.flatMap(c => c.exams.toCalItems()),  // מבחנים
  ...pomodoroSessions.map(toCal),                 // אופציונלי
  ...caloriWorkouts,                              // מ-calori-bridge
  ...caloriMeals.filter(showOnCalendar),
];
```

המשתמש שולט מתוך "יומנים מוצגים" (כמו ב-24me) באילו מקורות מופיעים.

---

## 5. נדידה מ-Supabase ל-Firebase

### 5.1 שלבים

1. **הקמת פרויקט Firebase משותף** עם calori (או לחילופין project חדש + לחבר ל-calori דרך אותו ה-account).
2. **Auth migration**: Firebase Auth במקום Supabase Auth. אפשר לייבא משתמשים קיימים ע"י export מ-Supabase ו-`firebase auth:import`.
3. **Data migration script**: סקריפט חד-פעמי `migrate-supabase-to-firestore.js` שלוקח את כל `user_data.app_state` ופורק לקולקציות החדשות (`courses`, `courseTasks`, `pomodoroSessions`, `profile`).
4. **החלפת שכבת ה-DB באפליקציה**: `supabaseClient.js` → `firebase.js` + adapter שמשמר את אותו interface בסיסי לקריאה/כתיבה.
5. **Firestore Security Rules**: ודא ש-`users/{uid}/...` ניתן לקריאה/כתיבה רק לאותו uid; כללי calori כבר מוגדרים.
6. **Real-time listeners** במקום debounce-save: בזכות Firestore, כל שינוי מסונכרן אוטומטית גם למובייל של calori.

### 5.2 סיכון מרכזי
- Auth callbacks ב-React שונים מ-Supabase. כל ה-`useEffect` ב-`App.jsx` ידרוש שכתוב.
- ה-`app_state` הגדול מנופץ לקולקציות → צריך לוודא שאין מקום בקוד שתלוי במבנה מקונן יחיד.

---

## 6. אינטגרציה עם calori

### 6.1 מה מציגים
- **אימוני היום**: נקרא מ-`calori/trainerSessions/{date}` או הקולקציה המקבילה.
- **קלוריות יומיות**: סיכום יומי + יעד, ככרטיס בלוח-הבית.
- **מאקרו עיקרי**: צריבת חלבון/פחמימה — bar קטן ב-Command Center.

### 6.2 איך מציגים
- כרטיס **"Calori היום"** בלוח-הבית (Command Center).
- אופציה ביומנים-מוצגים: "אימוני calori" — אם פעיל, אימונים מופיעים ב-CalendarView כאירועים בצבע ייעודי (ירוק calori).
- **לא עורכים** נתוני calori מתוך study-tracker בשלב ראשון — read-only. עריכה נשארת באפליקציית calori עצמה.

### 6.3 מה לקחת מ"command-center" (רעיוני)
- **דשבורד-בית מקובץ**: greeting דינמי לפי שעה (כבר קיים אצלך), + "המבחן הקרוב שלך", + "האימון הבא", + "משימות לעשות היום", + "קלוריות שנותרו".
- **One-tap actions** מהבית: "התחל פומודורו", "סמן אימון כבוצע", "הוסף ארוחה" (deeplink ל-calori).

---

## 7. עיצוב — מ-24me לזהות הצהובה

מה לוקחים מ-24me:
1. **Bottom sheet להוספת פריט** עם 3 טאבים (אירוע/משימה/פתק) + שורת אייקונים מהירים (פגישה, להתקשר, סמס, דוא"ל).
2. **תצוגת יומן רב-מצבית** (רשימה/יום/3 ימים/שבוע/חודש) — toggle בפינה.
3. **Header דינמי** עם מזג אוויר + מיקום.
4. **כרטיסי אירועים בצבע מלא** (לא רק קו צד) — כבר התחלת עם זה.
5. **תפריט "עוד"** מפוצל בקבוצות עם רקעים לבנים מעוגלים על background אפרפר.

מה *לא* לוקחים:
- ה-Pro paywall.
- אייקונים פסטליים — שומרים על הצהוב המלא של Calori כפי שכבר התחלת.

---

## 8. שלבי ביצוע מומלצים

> כל שלב = PR נפרד, ניתן ל-ship עצמאית.

### Phase 0 — הכנות (לפני קוד)
- [ ] אישור המסמך הזה
- [ ] יצירת/בחירת Firebase project
- [ ] גיבוי מלא של ה-Supabase הנוכחי

### Phase 1 — תשתית Firebase
- [ ] התקנת `firebase` SDK
- [ ] `lib/firebase.js` עם init
- [ ] Firebase Auth מחליף Supabase Auth ב-`App.jsx`
- [ ] סקריפט נדידה חד-פעמי + הרצה
- [ ] החלפת debounce-save ב-Firestore listeners

### Phase 2 — מודל פריטים מורחב
- [ ] קולקציות `events`, `personalTasks`, `notes` ב-Firestore
- [ ] `usePersonal` store (Zustand) עם CRUD
- [ ] Add-Item Bottom Sheet (3 טאבים) — UI בלבד, ללא לוגיקה
- [ ] חיווט ה-sheet ל-CRUD

### Phase 3 — יומן מאוחד
- [ ] `CalendarView` משוכתב כאגרגטור ממקורות מרובים
- [ ] תצוגות יום/3 ימים/שבוע/רשימה (חודש כבר יש)
- [ ] "יומנים מוצגים" — מסך הגדרות + טוגלים בכותרת היומן

### Phase 4 — calori bridge
- [ ] `lib/calori-firestore.js` — קריאה מקולקציות calori
- [ ] `useCalori` store (read-only mirror)
- [ ] כרטיס "Calori היום" בלוח-הבית
- [ ] אופציה ביומן: הצג אימוני calori כאירועים

### Phase 5 — Command Center (לוח-בית חדש)
- [ ] מסך `Home` חדש: greeting + "היום שלי" אגרגטיבי
- [ ] One-tap quick actions (פומודורו, הוספה מהירה, deeplink-calori)
- [ ] Bottom Nav: בית / יומן / לימודים / עוד

### Phase 6 — התראות והעצמות
- [ ] FCM tokens + רישום בקליינט
- [ ] התראות יומיות: "יש לך X מבחנים השבוע", "אימון בעוד שעה"
- [ ] Push לפני אירועי יומן (משתמש בוחר lead time)

### Phase 7 — אינטגרציות חיצוניות (אופציונלי לעתיד)
- [ ] Google Calendar two-way sync
- [ ] Weather API ב-Header (open-meteo, חינמי)

---

## 9. סיכונים והחלטות שעוד פתוחות

1. **Vendor lock-in:** מעבר ל-Firebase יוצר תלות ב-Google. אם בעתיד תרצה לעזוב — קשה יותר מ-Supabase.
2. **Cost:** Firestore reads/writes יכולים להצטבר; ה-real-time listeners נדיבים. לבחון אחרי Phase 2.
3. **Auth users migration:** משתמשים קיימים יקבלו אימייל reset password, או נשמור הסיסמאות (Firebase תומך באלגוריתמים מסוימים — לבדוק).
4. **לא ברור:** האם ב-calori המבנה ב-Firestore כבר תואם? צריך לקרוא את `firestore.rules` ואת ה-schema של calori לפני Phase 4.
5. **מובייל native:** האם בעתיד תרצה PWA או wrapping ב-Capacitor? משפיע על FCM ועל deeplinks ל-calori.

---

## 10. שאלות פתוחות אליך

1. **שם:** האפליקציה הנוכחית נשארת `study-tracker` או מקבלת שם חדש (משהו כמו "Calori Hub", "MyDay", "אורה" וכו')?
2. **קהל יעד:** רק אתה, או שזה הופך למוצר ציבורי? (משפיע על paywall, הגדרות פרטיות, וכו')
3. **עדיפות שלבים:** האם Phase 2 (פריטים אישיים) חשוב יותר או Phase 4 (calori bridge)? אני מציע 2 קודם — קל יותר ונותן ערך מיידי.
4. **calori — נתונים ספציפיים:** אילו 2-3 דברים מ-calori הכי חשוב לראות ב-study-tracker? (קלוריות, אימון היום, משקל, ארוחה הבאה?)
5. **התראות:** האם הן חובה מ-Phase 1, או נכנסות מאוחר?
6. **שפה:** עברית בלבד או גם אנגלית? (כיום יש i18n)

---

## נספח א' — מיפוי השינויים בקבצים קיימים

- `App.jsx` — שכתוב מלא: Auth → Firebase, data loading → real-time listeners
- `supabaseClient.js` — נמחק
- `lib/firebase.js` — חדש
- `store/useStore.js` — מצומצם רק ללימודים
- `store/usePersonal.js` — חדש
- `store/useCalori.js` — חדש
- `data.js` — `generateInitialState` מצומצם, מבנה שטוח יותר
- `CalendarView.jsx` — שכתוב מלא לאגרגטור רב-מקור
- `Layout.jsx` — מתאים ל-Bottom Tabs
- `MobileNav.jsx` — מורחב ל-4 טאבים + FAB
- `SettingsView.jsx` — מוסיף "יומנים מוצגים", "calori sync", "התראות"
- כל קבצי `components/course/*` ו-`components/pomodoro/*` — מועברים ל-`modules/studies/` ללא שינוי לוגי
