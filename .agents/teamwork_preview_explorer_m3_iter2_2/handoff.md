# Handoff Report

## 1. Observation
- **Facade Implementation:** `src/components/calendar/CalendarView.jsx` (lines 42-76) sets `mockEvents` with dummy data like `'משקה חלבון אייס קפה'` when `data` is empty, rather than rendering zero events.
- **Broken Data Contract:** `functions/index.js` (lines 121-144) maps `item.start.dateTime` to localized strings under `startTime` and `endTime` (e.g., `"14:30"`). However, the frontend (`src/components/calendar/CalendarView.jsx`, line 97) reads `ev.start` and expects an ISO string compatible with `date-fns/parseISO`.
- **Mock OAuth:** `functions/index.js` (lines 23-27) falls back to `"MOCK_CLIENT_ID"` and `"MOCK_CLIENT_SECRET"` when initializing the Google OAuth2 client, which breaks the real authentication flow.
- **Missing ARIA Roles & E2E Requirements:** 
  - `src/components/calendar/CalendarView.jsx`: The view mode toggle (lines 523-538) lacks `role="button"` and English `aria-label`s (e.g., `'Day View'`). Weekday headers (lines 202-210) lack `role="columnheader"` and English labels (e.g., `'Monday'`). List view items (lines 305-314) lack `role="listitem"`. The main view wrappers are missing the expected CSS classes (`.day-view-container`, `.three-days-view`, `.week-view`, `.month-view`, `.schedule-view-list`).
  - `src/components/settings/SettingsView.jsx`: Completely missing the `/settings/integrations` route and its UI, causing `05-google-calendar.spec.ts` to fail while looking for the `Connect Google Calendar`, `Disconnect Google Calendar`, and `Sync Now` buttons.

## 2. Logic Chain
1. **Mock Data Pollution:** The hardcoded `mockEvents` are unconditionally injected when no backend data exists, overriding the empty state and creating a facade.
2. **Contract Mismatch:** The frontend maps over `data?.events` and expects `ev.start` / `ev.end` to be ISO strings. Because the backend returns `ev.startTime` as a localized string (e.g., `"14:30"`), `safeParse()` in the frontend silently drops all genuine Google events.
3. **OAuth Failure:** Playwright or real users cannot authenticate because `MOCK_CLIENT_ID` is strictly invalid against Google's OAuth servers.
4. **Test Timeouts:** Playwright relies on ARIA accessibility roles and labels (like `role="button"` + `name: 'Day View'`). Their absence causes `06-calendar-views.spec.ts` to time out. The absence of the `/settings/integrations` page causes `05-google-calendar.spec.ts` to fail instantly.

## 3. Caveats
- The exact Google Calendar sync endpoint UI (`Sync Now` button, event refetching) needs to be wired into the new `Integrations` page. The logic already exists in `src/lib/googleCalendar.js` but requires UI binding.

## 4. Conclusion
To pass the Milestone 3 gate, the following implementation plan must be executed:
1. **Remove Mock Data:** Delete the `useEffect` handling `mockEvents` in `CalendarView.jsx`.
2. **Fix Data Contract:** In `functions/index.js`, update the mapped output to return `start: new Date(start).toISOString()` and `end: new Date(end).toISOString()` instead of localized `startTime/endTime`. Ensure `allDay` is correctly set.
3. **Remove Mock OAuth:** In `functions/index.js`, remove the `"MOCK_CLIENT_ID"` fallback and require strict environment variables.
4. **Fix Accessibility & Routes:**
   - Add `role="button"` and proper `aria-label` attributes to the calendar view toggles.
   - Add wrapper classes (`.day-view-container`, etc.) to the respective views in `CalendarView.jsx`.
   - Add `role="columnheader"` to the week headers and `role="listitem"` to the schedule list items.
   - Implement the missing `/settings/integrations` route in `SettingsView.jsx` and add the required `Connect Google Calendar` and `Disconnect Google Calendar` buttons.

## 5. Verification Method
- Code Review: Ensure `CalendarView.jsx` does not contain `'משקה חלבון אייס קפה'` and `functions/index.js` does not contain `"MOCK_CLIENT_ID"`.
- Tests: Run `npx playwright test 06-calendar-views.spec.ts 05-google-calendar.spec.ts` and ensure all assertions pass.
