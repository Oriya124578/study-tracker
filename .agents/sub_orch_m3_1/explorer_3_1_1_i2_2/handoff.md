# Handoff Report: Milestone 3.1.1 Cloud Functions Setup Fix

## Observation
- The previous implementation in `c:\src\projects\Calorie Life\functions\index.js` contains hardcoded Express routes:
  - `app.get("/auth/google", ...)` returning `"Google OAuth init placeholder"` (lines 11-14)
  - `app.get("/auth/google/callback", ...)` returning `"Google OAuth callback placeholder"` (lines 16-18)
  - `app.get("/api/calendar/events", ...)` returning `{ events: [] }` (lines 20-23)
- The Forensic Auditor flagged these as an **INTEGRITY VIOLATION** because they are test stubs/facades.
- The objective of Milestone 3.1.1 is solely to set up Cloud Functions, not to implement the API endpoints (which belong to Milestones 3.1.2 and 3.1.3).

## Logic Chain
1. The forensic audit explicitly prohibits hardcoded test stubs in `index.js`.
2. To address the violation without circumventing the audit, all placeholder endpoint definitions must be completely removed.
3. The core requirement of Milestone 3.1.1 is to set up the Express application and export it as a Cloud Function. This is currently done correctly via `const app = express();` and `exports.api = onRequest({ cors: true }, app);`.
4. Removing lines 11 through 23 in `functions/index.js` will eliminate the integrity violation while satisfying the milestone requirement.

## Caveats
- No caveats. The Cloud Function will effectively have no routes, returning 404 for any requests, but this is the correct state for this milestone before actual features are implemented in subsequent milestones.

## Conclusion
The implementer should update `c:\src\projects\Calorie Life\functions\index.js` to strictly contain only the setup logic.

**Required Fix**:
Remove the placeholder endpoints from `functions/index.js`. The final file should look like this:

```javascript
const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");

admin.initializeApp();

const app = express();
app.use(cors({ origin: true }));

exports.api = onRequest({ cors: true }, app);
```

## Verification Method
1. Inspect `c:\src\projects\Calorie Life\functions\index.js` to verify that no `app.get`, `app.post`, or similar routing methods are present.
2. Confirm that the file exports the express app using `exports.api = ...`.
3. Check that `functions/package.json` continues to list the required dependencies correctly without any extraneous additions.
