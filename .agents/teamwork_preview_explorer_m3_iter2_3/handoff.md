# Milestone 3 (Calendar Integration) - Investigation & Fix Plan

## 1. Observation
1. **Hardcoded Dummy Data**: In `src/components/calendar/CalendarView.jsx` (lines 42-76), a `useEffect` checks if there is any data. If `!hasData`, it injects a state array of `mockEvents` (e.g., `title: 'משקה חלבון אייס קפה'`, `title: 'הרצאה אינפי 2'`, etc.) which bypassed real integration.
2. **Broken Data Contract**: 
   - `functions/index.js` (lines 131-143) fetches events from the Google Calendar API and incorrectly formats their timestamps into localized strings (`startTimeStr = new Date(start).toLocaleTimeString(...)`) and returns them as `startTime` and `endTime`. 
   - `src/components/calendar/CalendarView.jsx` (lines 96-108) tries to read `ev.start` and `ev.end` and passes them to `safeParse`, which attempts to run `parseISO()`. Since the strings are localized times and not ISO formats (and mapped to the wrong property name), it silently fails to parse and ignores real data.
3. **Mock OAuth / Hardcoded Keys**: `functions/index.js` (lines 24-25) uses `process.env.GOOGLE_CLIENT_ID || "MOCK_CLIENT_ID"`, guaranteeing that missing environment variables default to strings incapable of functioning with genuine OAuth flows.
4. **Failing E2E Tests (Missing ARIA / Selectors)**:
   - `06-calendar-views.spec.ts` searches for buttons with accessible names like `Day View` and containers like `.day-view-container`. `CalendarView.jsx` (lines 523-538) uses `div`s with Hebrew text (`יום`) and no `role="button"` or English `aria-label`s. It also lacks root CSS classes for the view modes (`.day-view-container`, `.week-view`, etc.), and `.schedule-view-list` for list mode.
   - `05-google-calendar.spec.ts` navigates to `/settings/integrations` to test the calendar connection flow. However, `src/components/settings/SettingsView.jsx` lacks an integrations route or tab completely. It expects buttons like `Connect Google Calendar`, `Disconnect Google Calendar`, and state text like `Calendar Connected`.

## 2. Logic Chain
1. **Fake Data Removal**: Because `CalendarView.jsx` automatically falls back to visual mocks when data is empty, the reviewer flagged it as a "facade." Removing this allows empty states to be handled genuinely.
2. **Contract Alignment**: The backend Google Calendar fetch must return `start` and `end` containing standard ISO string dates. When `CalendarView.jsx` tries to `safeParse(ev.start)`, it will successfully instantiate a `Date` object and map the event into the UI.
3. **Genuine OAuth**: Using `defineSecret` or verifying proper Firebase Config `process.env` ensures the app accesses real Google Client IDs, making the OAuth URL generation valid.
4. **Testing Compliance**: E2E tests are inherently blind to visual presentation; they rely on ARIA labels and structural classes. Injecting `role="button"`, proper `aria-label` mapped to the expected test names, and structurally building the missing Integrations Settings view will allow the Playwright tests to hook into the DOM properly.

## 3. Caveats
- I did not inspect `googleCalendar.js` deep integrations, but based on the functions endpoint `api/calendar/events`, aligning the response fields and format should satisfy the core contract.
- The `Integrations` route inside settings is completely missing in `SettingsView.jsx`. Creating it will involve modifying the `SettingsView` router and adding the expected Playwright text indicators (`Calendar Connected`, `Sync Now`, etc.).

## 4. Conclusion & Implementation Plan
**Do not implement the code yet. Use this plan for the implementer agent:**

1. **Remove Facade (`CalendarView.jsx`)**: 
   - Delete `mockEvents` state, the `useEffect` block spanning lines 42-76, and remove `...mockEvents` from the `allItems` useMemo entirely.
2. **Align API Contract (`functions/index.js`)**: 
   - Rewrite the event mapping inside `/api/calendar/events` (around line 134) to return standard ISO strings. Map them exactly as `start` and `end` (not `startTime`/`endTime`):
     ```javascript
     return {
       id: `gcal-${item.id}`,
       type: 'event',
       title: item.summary || 'Google Calendar Event',
       start: new Date(start).toISOString(), // Expected by frontend
       end: new Date(end).toISOString(),     // Expected by frontend
       source: 'google',
       isLocked: true
     };
     ```
3. **Fix OAuth Secrets (`functions/index.js`)**:
   - Refactor the OAuth client generation to consume real environment variables or use Firebase `defineSecret` (from `firebase-functions/params`), and explicitly remove `"MOCK_CLIENT_ID"`.
4. **Implement Missing Settings View (`SettingsView.jsx`)**:
   - Add a Route for `integrations` (`<Route path="integrations" element={renderIntegrations()} />`).
   - Add a corresponding button in the main settings menu.
   - Inside `renderIntegrations()`, implement the "Connect Google Calendar", "Disconnect Google Calendar", and "Sync Now" buttons, alongside conditional state text ("Calendar Connected", "Calendar Disconnected", "Failed to sync events") as explicitly targeted by `05-google-calendar.spec.ts`.
5. **Satisfy UI Test Selectors (`CalendarView.jsx`)**:
   - Append `role="button"` and map Hebrew segment labels to English `aria-label`s (e.g., `"Day View"`, `"Week View"`).
   - Inject root CSS structural classes corresponding to views (e.g., `<div className={styles.dayStrip + " day-view-container"}>`).
   - For list/schedule mode, append `.schedule-view-list` to the parent container and `role="listitem"` to the row elements.
   - For week mode, ensure the day header columns have `role="columnheader"` with an English `aria-label` mapped to the specific weekday (e.g., `"Monday"`).

## 5. Verification Method
- **Test execution**: Run `npm run test:e2e` for both `05-google-calendar.spec.ts` and `06-calendar-views.spec.ts` — both should pass without timing out on missing selectors.
- **Data validation**: Connect a real Google Calendar. Open the app, trigger a data fetch via settings or load the dashboard. Inspect the network tab to ensure `/api/calendar/events` returns valid ISO 8601 strings, and confirm the events actually visually render within `CalendarView` (not silently discarded).
- **Code Inspection**: Ensure `"MOCK_CLIENT_ID"` is absent from the entire codebase.
