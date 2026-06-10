# Handoff Report: Milestone 3 (Calendar Integration)

## 1. Observation
- `PROJECT.md` and `SCOPE.md` require Milestone 3: "Google Calendar OAuth via Cloud Functions, read-only event sync. React Calendar UI (5 views: day, 3 days, week, month, schedule) with Segmented control."
- `ORIGINAL_REQUEST.md` specifies pixel-perfect compliance with `design-briefs/cream-02-calendar.html` and states the segment options should be "יום", "3 ימים", "שבוע", "חודש", and "רשימה".
- `src/components/calendar/CalendarView.jsx` currently implements the calendar UI using Tailwind CSS, standard React components (e.g., `Card`), and "לוח זמנים" instead of "רשימה". Its DOM structure does not match `cream-02-calendar.html` (e.g., it lacks `.month-hero`, `.mh-top`, `.seg`, `.week-strip`, `.day-tl-head`, `.tl-row`).
- `src/lib/googleCalendar.js` currently uses the client-side Google Identity Services (GSI) script (`https://accounts.google.com/gsi/client`) to fetch the `access_token` on the frontend.
- `functions/index.js` contains empty placeholders for `/auth/google`, `/auth/google/callback`, and `/api/calendar/events`.
- `CommandCenterView.jsx` currently triggers Google Calendar syncing via the client-side `connectGoogleCalendar()` and `fetchGoogleEvents()` methods.

## 2. Logic Chain
1. **Frontend UI Sync**: To satisfy R0 (Pixel-Perfect Vanilla CSS), `CalendarView.jsx` must be completely rewritten. The Tailwind classes must be removed, and the exact DOM elements (`<div class="month-hero">`, `<div class="tl-row">`, etc.) from `cream-02-calendar.html` must be returned. The CSS from the `<style>` block in the HTML brief should be moved to a Vanilla CSS or CSS Modules file.
2. **Segmented Control State**: The React component needs to manage state for the 5 views. The active view must update the segment classes (e.g., `<div class="seg-i active">שבוע</div>`). The label for the list view must be updated to "רשימה" to match the design.
3. **Backend OAuth via Cloud Functions**: To satisfy R2 (Tokens stored securely), the GSI script in `googleCalendar.js` must be removed. Instead, the frontend should direct the user to the `/auth/google` Cloud Function endpoint.
4. **OAuth Callback**: The `/auth/google/callback` Cloud Function must handle the `code` exchange for tokens using the `googleapis` library. It should store the `refresh_token` and `access_token` securely in the user's Firestore document (e.g., `users/{uid}`).
5. **Backend Calendar Fetch**: The `/api/calendar/events` Cloud Function must retrieve the tokens from Firestore, refresh the access token if needed, call the Google Calendar `events.list` API (read-only scope), and return standard JSON blocks with `source: 'google'`.
6. **Frontend Integration Update**: `CommandCenterView.jsx` and `googleCalendar.js` must be updated to make authenticated requests to `/api/calendar/events` instead of calling Google APIs directly.

## 3. Caveats
- The OAuth flow requires `client_id` and `client_secret` configured as Cloud Functions secrets or environment variables. The frontend currently only has `VITE_GOOGLE_CLIENT_ID`.
- Implementing OAuth redirects breaks Single Page Application (SPA) state unless handled via popups or deep-linking. A standard redirect back to `/app/settings` or `/app/calendar` will reload the app.
- The `cream-02-calendar.html` design shows a specific "Week" view state. The other 4 views (day, 3 days, month, list) are not explicitly styled in the single HTML file, so the implementer will need to adapt the vanilla CSS styling to handle the grid logic for the other views while maintaining the "cream" aesthetic.

## 4. Conclusion
**Implementation Plan / Fix Strategy:**
1. **Rewrite `CalendarView.jsx`**: Replace the current Tailwind layout with the pure HTML DOM structure found in `cream-02-calendar.html`. Extract the CSS into `CalendarView.module.css` (or standard CSS). Implement the 5 states (`day`, `3days`, `week`, `month`, `list`/`רשימה`) switching logic using the `.seg` segmented control.
2. **Implement Cloud Functions for OAuth**: 
   - Write `/auth/google` using `googleapis` OAuth2 client to generate an auth URL with `access_type: 'offline'`. Pass Firebase `uid` via state.
   - Write `/auth/google/callback` to exchange the auth code for tokens and store them in Firestore (`users/{uid}`).
   - Write `/api/calendar/events` to fetch tokens from Firestore, call Google Calendar API, map the results, and return them.
3. **Refactor Client-side Sync**: Update `src/lib/googleCalendar.js` and `CommandCenterView.jsx`. Change the connect button to navigate to the `/auth/google` endpoint. Change the sync function to call the `/api/calendar/events` Cloud Function using the user's Firebase Auth token.

## 5. Verification Method
1. **Design**: Run `npm run dev` and navigate to `/app/calendar`. Visually compare the layout against `design-briefs/cream-02-calendar.html`. Verify the font is "Fraunces" / "Instrument Serif" and no Tailwind classes are polluting the structure.
2. **OAuth Security**: Attempt to sync Google Calendar. Verify in the Network tab that no requests are made to `https://accounts.google.com/gsi/client` from the frontend, and that the `access_token` is never returned to the browser console.
3. **Data Fetching**: Verify that the events render correctly in the timeline and that the Google Calendar events contain the `source: 'google'` property.
4. **Backend Build**: Run `firebase deploy --only functions` locally or compile the functions to ensure there are no build errors.
