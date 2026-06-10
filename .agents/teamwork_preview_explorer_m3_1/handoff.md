# Handoff Report: Milestone 3 - Calendar Integration

## Summary
The investigation into Milestone 3 reveals that the frontend UI must be refactored to use Vanilla CSS/CSS Modules to match the design brief strictly, and the backend needs to implement the Google Calendar OAuth flow using the existing placeholders in `functions/index.js`.

## Observation
- **Frontend UI**: `src/components/calendar/CalendarView.jsx` currently uses TailwindCSS for styling and does not match the strict Vanilla CSS requirement (R0). The design source of truth is `design-briefs/cream-02-calendar.html`, which includes specific class structures (`.month-hero`, `.seg`, `.week-strip`, `.day-tl-head`, `.tl-row`) that are missing.
- **Backend OAuth**: `functions/index.js` contains Express routes for `/auth/google`, `/auth/google/callback`, and `/api/calendar/events`, but they are currently just returning placeholder text. `functions/package.json` already has `googleapis` installed.
- **Frontend Sync**: `src/lib/googleCalendar.js` currently utilizes client-side Google Identity Services to obtain short-lived tokens, which conflicts with requirement R2 ("Google Calendar OAuth via Cloud Functions, read-only event sync").

## Logic Chain
1. To satisfy R0 (Pixel-Perfect with Vanilla CSS), `CalendarView.jsx` must be completely restyled. We must extract the CSS from `cream-02-calendar.html` into a new file `src/components/calendar/CalendarView.module.css` (or vanilla CSS) and apply the exact class names and HTML structures.
2. The UI Segmented control must manage the state between the 5 views (`day`, `3days`, `week`, `month`, `list`) as specified.
3. To satisfy R2 (Cloud Functions OAuth), we must implement the OAuth flow in `functions/index.js` using `googleapis` (`google.auth.OAuth2`). 
   - `/auth/google` should initiate the flow (redirect to Google) and pass the `uid` via the `state` parameter.
   - `/auth/google/callback` should exchange the code for tokens and store them securely in Firestore at `users/{uid}/integrations/google`.
   - `/api/calendar/events` should retrieve tokens from Firestore, fetch events from the primary Google Calendar, and return them with `source: 'google'`.
4. `src/lib/googleCalendar.js` must be updated to redirect users to the Cloud Function's `/auth/google` endpoint for connection, and use the Cloud Function's `/api/calendar/events` endpoint to fetch events, rather than the client-side Google Identity Services.

## Caveats
- Passing `uid` in the OAuth `state` parameter is simple but lacks cryptographic security if not signed. A simple JWT or signed state could be used, or we assume a basic pass-through for this milestone.
- Ensure the Google Cloud Console has the correct OAuth redirect URIs configured matching the deployed Firebase Cloud Functions URL.
- Timezone handling between Google Calendar events and the React frontend needs to be consistent.

## Conclusion
The implementation plan is clear and straightforward:
1. **Refactor Frontend**: Create `CalendarView.module.css`, copy CSS from `cream-02-calendar.html`, and update `CalendarView.jsx` to use these exact classes and structure.
2. **Implement Backend OAuth**: Replace placeholders in `functions/index.js` with functional `googleapis` OAuth logic and Firestore storage.
3. **Integrate**: Update `src/lib/googleCalendar.js` to hit the new Cloud Functions endpoints.

## Verification Method
1. Inspect `src/components/calendar/CalendarView.jsx` to verify Tailwind classes are removed and it imports CSS from a `.module.css` or vanilla `.css` file.
2. Verify UI rendering visually matches `design-briefs/cream-02-calendar.html` locally.
3. Review `functions/index.js` to verify it uses `googleapis` for OAuth, saves tokens to Firestore, and fetches events.
4. Run the test suite: `npm run test` (or relevant Firebase emulator tests) to verify Cloud Functions compile and run without errors.
