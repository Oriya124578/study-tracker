# Milestone 3 - Calendar Integration Analysis

## Observation
1. **Frontend Calendar UI**: The file `src/components/calendar/CalendarView.jsx` currently uses TailwindCSS extensively. The rendering logic for `day`, `3days`, and `week` views uses a simple flex stack rather than a proportional time grid.
2. **Design Briefs**: The files `design-briefs/cream-02a-day.html`, `cream-02b-3day.html`, and `cream-02c-week.html` use specific vanilla CSS classes (e.g. `.rail`, `.tslot`, `.evt`) and absolute positioning (`top: Xpx; height: Ypx`) to represent time blocks on a grid where 1 hour = 60px.
3. **Frontend OAuth Logic**: The file `src/lib/googleCalendar.js` currently uses client-side Google Identity Services (`https://accounts.google.com/gsi/client`) to fetch and store the access token in memory.
4. **Backend Cloud Functions**: `functions/index.js` contains simple Express placeholders for `/auth/google`, `/auth/google/callback`, and `/api/calendar/events`.
5. **Dependencies**: `functions/package.json` already includes the `googleapis` library.

## Logic Chain
1. Requirement **R0** dictates strict pixel-perfect adherence to `cream v3` designs using Vanilla CSS or CSS Modules, strictly prohibiting TailwindCSS. Therefore, `CalendarView.jsx` must be refactored to remove all Tailwind utilities and instead import a dedicated CSS module or use plain CSS modeled directly from the `<style>` blocks in the design HTML files.
2. The UI requires 5 specific views. The Day, 3-Day, and Week views must map events to absolute positions on a time grid. We need logic to parse an event's start time into a pixel offset `(hours * 60 + minutes)` and its duration into a pixel height. Month and Schedule (List) views must match their respective grid and grouped-list designs.
3. Requirement **R2** explicitly states: "Google Calendar OAuth via Cloud Functions for secure storage of tokens". The current client-side GIS token flow violates this.
4. To fix the backend, the existing placeholders in `functions/index.js` must be replaced with a real Node.js OAuth flow using the available `googleapis` library. The `uid` must be passed via the OAuth `state` parameter to associate the Google token with the correct Firestore user document upon the callback.
5. The client library `src/lib/googleCalendar.js` must be updated to redirect users to the new Cloud Function endpoint to initiate OAuth, and fetch read-only events from the new secure backend endpoint instead of querying Google directly.

## Caveats
- Passing `uid` in the OAuth `state` parameter is standard but requires care (e.g., signing or encrypting the state to prevent tampering). For simplicity, it might just be the raw UID or an encoded string, depending on the exact security posture required.
- The React calendar component will need a robust way to handle overlapping events in the absolute grid to prevent them from rendering on top of each other entirely (though `cream-02b-3day.html` shows simple overlays).
- No implementation has been done per the instructions.

## Conclusion
The implementation strategy is clear and ready for the Worker agent:
1. **Rewrite `CalendarView.jsx`**: Strip TailwindCSS. Implement a CSS Module based exactly on the `cream-02*.html` files. Create a time-to-pixel mapping function for the grid views. Re-implement the segmented control for the 5 views.
2. **Implement Cloud Functions OAuth**: Use `googleapis` in `functions/index.js` to create the `/auth/google` (redirect), `/auth/google/callback` (store token in Firestore), and `/api/calendar/events` (fetch Google events using stored token).
3. **Refactor Client Service**: Update `src/lib/googleCalendar.js` to call these new Cloud Functions.

## Verification Method
1. **Frontend**: Open the application, navigate to the Calendar, and toggle between all 5 views. Inspect the DOM elements to ensure classes like `.rail`, `.tslot`, and `.evt` are present, and Tailwind classes are gone. Ensure visual parity with `design-briefs/cream-INDEX.html`.
2. **Backend**: Invoke `/auth/google?uid=test` to verify it redirects to Google. Inspect Firestore `users/{uid}/integrations` to verify tokens are saved securely after the callback.
3. **Integration**: Run the e2e test suite (or manual verification) to ensure events fetched via `/api/calendar/events` appear in the calendar with `source: 'google'` (or `gcal`).
