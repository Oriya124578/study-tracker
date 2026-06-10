# Synthesis for Milestone 3.2.1: Segmented Control & Layout

## Consensus Strategy
1. **Typography**: Add `@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,600;1,9..144,600&family=Instrument+Serif:ital,wght@0,400;1,400&display=swap');` to the top of `src/index.css`.
2. **Segmented Control**: 
   - In `src/components/calendar/CalendarView.jsx`, remove the existing `isViewMenuOpen` dropdown UI.
   - Replace it with a horizontally scrolling or flex segmented control containing 5 views: `יום`, `3 ימים`, `שבוע`, `חודש`, `לוח זמנים` (Schedule).
   - Style the active state distinctly (e.g., `bg-white text-foreground shadow-sm font-serif italic`).
3. **Mock Data Fetching**:
   - Inside `CalendarView.jsx`, add a `useEffect` that checks if the existing events list is empty. 
   - If empty, mock a 500ms fetch delay and then populate a local state `mockEvents` with 3 items matching the design:
     - "משקה חלבון אייס קפה" (Protein drink) - green/nutrition
     - "הרצאה אינפי 2" (Calculus lecture) - blue/studies
     - "אינפי 2 30 ימים לבחינה" (Exam) - red/alert
   - Use these mock events to render if the real data is empty.
4. **Layout Setup**:
   - Create the generic container for the calendar views. You don't need to perfectly style the specific views (Day, Week, Month, Schedule) in this milestone—just make sure the Segmented Control correctly switches the `viewMode` state and triggers the respective view components/functions.

## Instructions for Worker
Execute the above consensus strategy. DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.
