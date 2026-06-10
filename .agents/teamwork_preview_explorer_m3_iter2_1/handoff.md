# Milestone 3 Fix Strategy Investigation

## 1. Observation
- **Facade Implementation:** In `src/components/calendar/CalendarView.jsx` (Lines 42-76), there is a `useEffect` hook that injects hardcoded dummy events (e.g., `title: 'משקה חלבון אייס קפה'`) into `mockEvents` when `data` is empty.
- **Broken Data Contract:** 
  - `src/components/calendar/CalendarView.jsx` expects `ev.start` and `ev.end` as ISO strings (Lines 96-108).
  - `functions/index.js` (Lines 131-143) returns `startTime` and `endTime` mapped as localized strings via `toLocaleTimeString()`.
- **Mock OAuth:** In `functions/index.js` (Lines 23-27), the OAuth2 client is initialized using `process.env.GOOGLE_CLIENT_ID || "MOCK_CLIENT_ID"`.
- **Failing Tests (Calendar Views):** `e2e/tests/tier1-feature/06-calendar-views.spec.ts` expects view buttons with names like "Day View" and container classes like `.day-view-container`, `.three-days-view`, `.week-view`, `.month-view`, and `.schedule-view-list`. `CalendarView.jsx` lacks these classes and ARIA roles/labels for the view switchers (Lines 523-538). It also expects `role="columnheader"` with day names and `role="listitem"` for schedule items.
- **Failing Tests (Google Calendar):** `e2e/tests/tier1-feature/05-google-calendar.spec.ts` navigates to `/settings/integrations` to test the calendar connection flow. However, `src/components/settings/SettingsView.jsx` lacks this route and the expected UI ("Connect Google Calendar", "Disconnect Google Calendar", "Sync Now", "Calendar Connected").

## 2. Logic Chain
1. **Remove Mock Data:** The `mockEvents` state in `CalendarView.jsx` provides a fake facade and must be removed to rely exclusively on actual data from the Google Calendar integration.
2. **Align Data Contracts:** The API in `functions/index.js` must be updated to return `start: new Date(start).toISOString()` and `end: new Date(end).toISOString()` to match `CalendarView.jsx`'s parsing logic (`safeParse(ev.start)`). This solves the silent parsing failure.
3. **Genuine OAuth:** The `functions/index.js` must remove the `"MOCK_CLIENT_ID"` string and securely depend on defined environment variables.
4. **UI Test Compatibility:** `CalendarView.jsx` must be augmented with the correct DOM classes (`.day-view-container`, etc.) and ARIA attributes (`role="button"`, `aria-label="Day View"`) for Playwright to interact with it successfully.
5. **Integrations UI:** A new `renderIntegrations` view must be added to `SettingsView.jsx` and mounted on the `/settings/integrations` route. It needs to implement the OAuth connect/disconnect buttons and sync status to fulfill `05-google-calendar.spec.ts`.

## 3. Caveats
- The backend fix for ISO strings assumes the frontend `safeParse` function can correctly parse standard ISO 8601 strings, which it does via `date-fns` `parseISO`.
- The exact layout of the Integrations UI in `SettingsView.jsx` is not strictly specified beyond the E2E test's required text/buttons. It should match the existing cream UI aesthetic.
- To use the real OAuth flow, actual Google API credentials will need to be configured in the Firebase Functions environment.

## 4. Conclusion
The Critical Integrity Violation is caused by a combination of a UI facade, a backend-frontend contract mismatch on event timestamps, mock OAuth credentials, and missing UI routes for the Google Calendar integration. 

**Fix Implementation Plan:**
1. **`src/components/calendar/CalendarView.jsx`**:
   - Delete the `useEffect` that populates `mockEvents`.
   - Remove `mockEvents` from `allItems` array merging.
   - Add Playwright-expected classes: `<div className={styles.dayViewContainer}>`, `<div className={styles.weekView}>`, etc., around the respective rendered views.
   - Add `role="button"` and `aria-label="[View Name]"` to the segment toggles.
   - Add `role="columnheader"` with `aria-label` to the week view day headers, and `role="listitem"` to the list view items.
2. **`functions/index.js`**:
   - Update `/api/calendar/events` mapping: replace `startTime` and `endTime` with `start` and `end`, and assign them `toISOString()` values.
   - Remove `|| "MOCK_CLIENT_ID"` fallback.
3. **`src/components/settings/SettingsView.jsx`**:
   - Add an item for "Integrations" in the Settings index.
   - Add `<Route path="integrations" element={renderIntegrations()} />` and implement `renderIntegrations()` with the required buttons ("Connect Google Calendar", "Disconnect Google Calendar", "Sync Now").

## 5. Verification Method
- **Static Check**: Review `CalendarView.jsx` to ensure no `משקה חלבון אייס קפה` exists.
- **E2E Tests**: Run `npx playwright test e2e/tests/tier1-feature/05-google-calendar.spec.ts` and `e2e/tests/tier1-feature/06-calendar-views.spec.ts`. They should pass or proceed much further without timing out on missing locators.
- **Data Flow Check**: Verify that when `CalendarView.jsx` receives data from `/api/calendar/events`, it renders the actual events accurately based on the new ISO strings.
