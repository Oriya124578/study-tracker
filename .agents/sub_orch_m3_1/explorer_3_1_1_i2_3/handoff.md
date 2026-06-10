# Handoff Report: Milestone 3.1.1 Fix Strategy

## 1. Observation
- The Forensic Audit Report indicated an INTEGRITY VIOLATION because `c:\src\projects\Calorie Life\functions\index.js` contains hardcoded testing stubs/facades.
- Inspecting `c:\src\projects\Calorie Life\functions\index.js` confirms that lines 11-23 define placeholder routes:
  ```javascript
  // Milestone 3.1.2 placeholders
  app.get("/auth/google", (req, res) => {
    res.status(200).send("Google OAuth init placeholder");
  });

  app.get("/auth/google/callback", (req, res) => {
    res.status(200).send("Google OAuth callback placeholder");
  });

  // Milestone 3.1.3 placeholder
  app.get("/api/calendar/events", (req, res) => {
    res.status(200).json({ events: [] });
  });
  ```
- The `functions/package.json` successfully passed the dependency check and correctly contains `googleapis`, `firebase-admin`, `firebase-functions`, `express`, `cors`.

## 2. Logic Chain
- Milestone 3.1.1 is strictly about "Cloud Functions Setup" (initializing the environment and dependencies).
- The auditor's rule prohibits the creation of hardcoded or facade implementations to bypass implementation work.
- The placeholder routes returned static strings and empty arrays, which triggered the violation.
- Because real implementation of these routes is scoped for Milestones 3.1.2 and 3.1.3, they should simply not exist in `index.js` during Milestone 3.1.1.
- Removing lines 11-23 will leave a correctly configured, empty Express app that is exported as the `api` Cloud Function. This fulfills the scope of 3.1.1 without violating integrity rules.

## 3. Caveats
- No caveats. The fix is a straightforward code deletion. The Express app will have no routes, which is correct and acceptable for the setup milestone.

## 4. Conclusion
To resolve the INTEGRITY VIOLATION, the implementer must remove the placeholder endpoints from `functions/index.js`. 

**Concrete Step-by-Step Fix Strategy:**
1. Open `c:\src\projects\Calorie Life\functions\index.js`.
2. Delete the placeholder routes (lines 11-23):
   - `app.get("/auth/google", ...)`
   - `app.get("/auth/google/callback", ...)`
   - `app.get("/api/calendar/events", ...)`
3. Ensure the Express app is still created, configured with CORS, and exported:
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

## 5. Verification Method
- **File Inspection**: Check `c:\src\projects\Calorie Life\functions\index.js` to confirm the complete absence of any `app.get` definitions or placeholder comments.
