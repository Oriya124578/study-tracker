# Handoff Report: Milestone 3.2.1 - Segmented Control & Calendar Layout

## Observation
- The reference design for the calendar is in `c:\src\projects\Calorie Life\design-briefs\cream-02-calendar.html`. It uses a segmented control (`.seg`, `.seg-i`) to switch between views: "יום" (Day), "3 ימים" (3 Days), "שבוע" (Week), "חודש" (Month), "רשימה/לוח זמנים" (List/Schedule).
- The reference design also introduces a new timeline layout for day/week views involving `.tl-row`, `.t-tm` (time), `.t-dc` (dot container), `.t-ln` (vertical line), and `.t-c` (content bubble) for events.
- The current implementation in `c:\src\projects\Calorie Life\src\components\calendar\CalendarView.jsx` uses a dropdown menu for view selection instead of a segmented control.
- The current layout for Day/3Days/Week in `CalendarView.jsx` uses generic cards (`CalendarItem`) instead of the connected timeline dot-and-line design.
- The state `viewMode` correctly tracks the views, but "list" should be adapted to "schedule" as per the new design language.
- `useStore.js` fetches data from Firestore. A mock data fetching requirement means we need to populate dummy data if the real database is empty.

## Logic Chain
1. **Component Placement**: The Segmented Control should be added directly in `CalendarView.jsx`, either inside a unified header (like `.month-hero` in the reference) or directly below the Top Header. The existing dropdown toggle should be removed.
2. **Layout Structure Update**: The `renderDayColumn` function in `CalendarView.jsx` must be rewritten. It currently maps `CalendarItem` components. It should map the new timeline structure (`.tl-row` etc.) to match `cream-02-calendar.html`.
3. **Styling**: The worker must map the vanilla CSS classes from the reference (`.seg`, `.tl-row`, `.t-dot`, `.t-ln`, `.t-c`) to Tailwind utility classes or add them to `index.css`.
4. **Mock Data Fetching**: To fulfill "Implement mock data fetching", the worker can create a simple `useEffect` within `CalendarView.jsx` that populates `useStore` with an array of dummy events/tasks using a `setTimeout` if the `allItems` array is empty.

## Caveats
- The project is using Tailwind CSS in React components (as seen in `CalendarView.jsx` and `Layout.jsx`), despite `PROJECT.md` mentioning Vanilla CSS / CSS Modules. The worker should stick to Tailwind utility classes to match the existing component style, or explicitly port the `.seg` and timeline CSS into `index.css` if Tailwind is too verbose for the timeline dots/lines.
- Mock data should only be injected if the user has no real data, so it doesn't overwrite real Firestore data.

## Conclusion
The implementation strategy for Milestone 3.2.1 is:
1. **Update `CalendarView.jsx` Header**: Remove the dropdown menu. Implement the `.seg` segmented control UI with 5 tabs. Bind it to `setViewMode`.
2. **Update Day/Week Layouts**: Rewrite `renderDayColumn` to use the timeline structure (`.tl-row`, `.t-tm`, `.t-dc`, `.t-dot`, `.t-ln`, `.t-c`). Map event kinds (exam, event, task, pomodoro) to the appropriate dot and bubble colors.
3. **Update Schedule Layout**: Adapt `renderList` to visually match the Schedule view from `cream-02e-schedule.html`.
4. **Implement Mock Data**: Add a `useEffect` hook in `CalendarView.jsx` that checks if `data.events` is empty and, if so, dispatches a simulated fetch (with `setTimeout`) to populate `useStore` with 3-4 dummy events (e.g., an exam, a lecture, a task) to demonstrate the layout.

## Verification Method
1. Run the app (`npm run dev`) and navigate to the Calendar tab.
2. Verify that the Segmented Control is visible and works for all 5 views.
3. Verify that Day/3Days/Week views display the connected timeline dots and lines.
4. Verify that mock data appears automatically after a short delay if the user has no events.
5. Inspect the styling to ensure it matches `design-briefs/cream-02-calendar.html` closely.
