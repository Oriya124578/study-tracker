# Calori Life — Project Context

## What is this
A **personal manager + study tracker** web app (React + Vite), part of the **Calori ecosystem**. Previously "Study Tracker" — renamed and upgraded to become a unified life manager inspired by the 24me app, with deep integration to the calori_1300 (nutrition + fitness) Flutter app.

## User
- Email: turhv124@gmail.com
- Firebase UID: `tdg5ks2RFfTpJeTSkdPyrBtGf8j2`
- Language: Hebrew (RTL), with English i18n support

## Tech Stack
- **Frontend:** React 19 + Vite 8, Zustand (state), Tailwind 4, Framer Motion, Lucide icons, date-fns, Recharts
- **Backend:** Firebase (Firestore + Auth + Storage) — shared project `calori1300` with the calori Flutter app
- **Auth:** Firebase Auth (Email/Password + Google Sign-In)
- **No Supabase anymore** — fully migrated to Firebase in Phase 1

## Firebase Project
- Project: `calori1300` (Blaze plan)
- Firestore collections for this app use `cl_` prefix under `users/{uid}/`:
  - `cl_profile/main` — user profile
  - `cl_courses/{courseId}` — courses (with embedded `notes` map and `links` map)
  - `cl_courseTasks/{taskId}` — tasks with `scope: 'weekly'|'global'`, `week`/`category` fields
  - `cl_pomodoroSessions/{sessionId}` — pomodoro sessions
  - `cl_events/{docId}` — personal events (manual/google/calori source)
  - `cl_personalTasks/{docId}` — personal tasks with priority, dueDate, done state
  - `cl_notes/{docId}` — quick notes (title, content, pinned, color)
- Storage: files under `cl_files/{uid}/{courseId}/{folder}/{storedName}` (separate from calori's `users/{uid}/**` to avoid public read leaking)
- Firestore Rules & Storage Rules already include `cl_*` entries — DO NOT touch calori's existing rules

## Design System
Follow `c:\src\projects\calori_1300\DESIGN_SYSTEM.md` strictly:
- **Nutrition (green):** `#059669` primary, `#10B981` secondary, `#D1FAE5` soft — for calori meal/calorie items
- **Fitness (purple):** `#7C3AED` primary, `#8B5CF6` secondary, `#EDE9FE` soft — for calori workout items
- **Neutrals:** canvas `#F5F5F7`, surface `#FFFFFF`, ink `#1D1D1F`
- **Item type → color mapping:**
  - Study events (lecture/tutorial) → white card + blue info border
  - Personal events → white card + gray border
  - Calori meal/nutrition → GREEN flood card, white text
  - Calori workout/fitness → PURPLE flood card, white text
  - Exam → RED danger flood card
  - Note → white card + warm/amber accent
  - Pomodoro → white card + purple-soft icon (focus = fitness lineage)
  - FAB / active nav / today circle → green primary

## Key Files
- `src/App.jsx` — Firebase Auth listener → `initFromAuth(uid)` / `cleanup()`
- `src/store/useStore.js` — Zustand store wired to Firestore real-time listeners. All mutations do optimistic update + Firestore write. Includes CRUD for events, personalTasks, quickNotes (Phase 2).
- `src/lib/firebase.js` — Firebase init (reads VITE_FIREBASE_* from .env.local)
- `src/lib/firestoreRepo.js` — CRUD helpers per collection (subscribe*, set*, delete*, batch*, newId)
- `src/lib/firebaseStorage.js` — Firebase Storage helpers (same API surface as old Supabase version)
- `src/lib/courseFilesStorage.js` — Shim that re-exports from firebaseStorage.js
- `src/components/auth/AuthView.jsx` — Email/Password + Google Sign-In
- `src/components/layout/BottomNav.jsx` — Universal bottom tabs (Home/Calendar/+FAB/Studies/More)
- `src/components/layout/Layout.jsx` — Main layout with BottomNav (Sidebar removed)
- `src/components/add-item/AddItemSheet.jsx` — 3-tab bottom sheet (event/task/note) opened by FAB
- `src/components/studies/StudiesHub.jsx` — Course grid with progress bars (replaces old courses list)
- `src/components/calendar/CalendarView.jsx` — Unified aggregator with day/3-day/week/month/list views
- `src/i18n/translations.js` — Hebrew + English translations
- `.env.local` — Firebase + (legacy) Supabase keys
- `scripts/migrate-supabase-to-firebase.js` — one-time migration script (already ran successfully)
- `src/components/layout/Sidebar.jsx` — **DEPRECATED** (no longer imported, kept for reference)
- `src/components/layout/MobileNav.jsx` — **DEPRECATED** (replaced by BottomNav)

## Data State
- 5 courses migrated: אינפי 2, אלגברה לינארית 2, תכנות בשפת C, מבני נתונים, לוגיקה ותורת הקבוצות
- 180 weekly tasks, 117 files, profile — all in Firestore
- 0 pomodoro sessions, 0 global tasks (user had none)

## Completed Phases
### Phase 1 ✅ (this session)
- Renamed app to "Calori Life" everywhere
- Migrated from Supabase to Firebase (Auth + Firestore + Storage)
- Rewrote useStore.js with real-time Firestore listeners (per-document, not blob)
- Rewrote App.jsx, AuthView.jsx, SettingsView.jsx for Firebase
- Migration script ran successfully (5 courses, 180 tasks, 117 files)
- Created 9 HTML preview mockups in `previews/` aligned to Calori design system
- firebase-admin-key.json deleted after migration
- Build passes with 0 errors

### Phase 2 ✅ (2026-06-02)
- Added 3 new Firestore-backed item types: events, personalTasks, quickNotes
- Extended `firestoreRepo.js` with subscribe/set/delete/newId for cl_events, cl_personalTasks, cl_notes
- Extended `useStore.js` with real-time listeners + full CRUD (optimistic updates) for all 3 types
- Built `AddItemSheet` — animated bottom sheet with 3 tabs (event/task/note), priority picker, course selector, date/time fields
- Built `BottomNav` — universal bottom tab bar (Home/Calendar/+FAB/Studies/More) replacing Sidebar
- Built `StudiesHub` — course grid with progress bars (the "Studies" tab)
- Rewrote `CalendarView` as unified aggregator: exams + events + tasks + pomodoro. 5 view modes: day/3-day/week/month/list
- Added ~60 i18n strings (HE + EN) for all new UI
- Verified Firestore rules in Console have all `cl_*` entries (local file in calori_1300 is stale)
- Build passes with 0 errors

### Phase 2.5 ✅ (2026-06-03) — user feedback round
- **Custom courses in onboarding** — "+ קורס אחר" button adds a course inline (name + weeks); removable
- **Weekly task templates** — new onboarding step 4: toggle lecture/tutorial/homework + add custom task types; applied to all selected courses via `completeOnboarding(profile, courses, seeds)`
- **Owner-only AI links** — `OWNER_UID` in data.js; only that uid pre-fills NotebookLM/Gemini links, all others start empty
- **NotesView** (`src/components/notes/NotesView.jsx`) — 2-col grid, colored cards, pinned section, edit bottom-sheet with 6 colors
- **TasksView** (`src/components/tasks/TasksView.jsx`) — Google Tasks-style: quick-add, round checkboxes, due-date chips, expandable subtasks, collapsible "completed"
- **Subtasks** — `subtasks: []` on personalTask docs; store actions `addSubtask/toggleSubtask/deleteSubtask`
- **MoreHub** (`src/components/layout/MoreHub.jsx`) — "More" tab now opens a hub grid (Tasks/Notes/Calori/Settings/Pomodoro) instead of jumping to Settings

### Phase 3 ✅ (2026-06-03) — calori bridge (READ-ONLY)
- `src/lib/caloriRepo.js` — read-only subscribe helpers for calori's own collections:
  - `users/{uid}/daily_history/{yyyy-MM-dd}` — daily aggregate (calories, macros, meals_count, nutrition_score, workout_count/minutes/calories)
  - `users/{uid}/meals/{id}` — fields: name, calories, protein, carbs, fats, weight_grams, meal_category, timestamp(Timestamp), imageUrl, is_deleted
  - `users/{uid}/workouts/{id}` — fields: name, calories_burned, duration_minutes, exercises[], timestamp
  - ⚠️ NEVER writes — only onSnapshot reads. Calori rules already allow owner read.
- `useStore`: `data.calori = { meals, workouts, dayHistory, recentHistory }`; `caloriDate` UI state; `subscribeCaloriDay(date)` / `setCaloriDate(date)`; per-day listeners in `_caloriDayUnsubs`, re-subscribed on date change
- `CaloriView` (`src/components/calori/CaloriView.jsx`) — full tab: date navigator, daily summary card (big calories + macro pills + nutrition score), green meal rows, purple workout rows
- `CaloriSummaryCard` (`src/components/calori/CaloriSummaryCard.jsx`) — compact "my day" card on the dashboard, taps through to the Calori tab
- Colors per DESIGN_SYSTEM: meals = green `#059669`, workouts = purple `#7C3AED`

### Phase 4 ✅ (2026-06-03) — Command Center home
- `SmartDashboard.jsx` rewritten as the "command center" (same export name, so Layout unchanged):
  - **Smart header** — time-based greeting + name + dynamic summary line (today's task count → nearest exam countdown → "all clear")
  - **Quick actions** — Pomodoro / Calori / Tasks pills
  - **AI quick links** — horizontal strip of course chips opening NotebookLM/Gemini (`data.links[courseId]`); hidden if no links
  - **"My Day" timeline** — unified time-sorted list for today: exams + events + tasks-due-today + calori meals (green) + workouts (purple). Calori items only included when `caloriDate === today`.
  - **Empty state** — when today is empty, shows next 7 days' items under "coming up" (taps through to calendar)
- Old dashboard cards (progress ring, exam board, pomodoro chart) extracted to `src/components/studies/StudiesStats.jsx` and appended to `StudiesHub` — nothing lost, home is now clean
- `CaloriSummaryCard.jsx` now orphaned (timeline supersedes it); kept for reference
- Review round (3 sub-agents) fixed: `limit()` on recent daily_history, error propagation in completeOnboarding, CaloriView Invalid-Date guard, duplicate `noUpcomingExams` i18n key

## Next: Phase 5
- Phase 5: Notifications (FCM) — reminders for tasks/events/exams

## Important Rules
- NEVER touch calori's Firestore collections (meals, workouts, groups, recipes, etc.)
- NEVER modify Firestore/Storage rules without showing the full file for review
- All new collections use `cl_` prefix
- `previews/` folder has 9 HTML mockups showing the target UI — reference them
- The calori Flutter project is at `c:\src\projects\calori_1300\` — read-only reference
- User prefers step-by-step work: ask questions before each phase, don't rush
