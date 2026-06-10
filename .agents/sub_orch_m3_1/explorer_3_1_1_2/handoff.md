# Milestone 3.1.1 Implementation Strategy: Cloud Functions Setup

## 1. Observation
- `c:\src\projects\Calorie Life\.agents\sub_orch_m3_1\SCOPE.md` requires setting up the Firebase Functions environment, including `package.json`, `index.js`, and dependencies (`googleapis`, `firebase-admin`, etc.).
- `c:\src\projects\Calorie Life\PROJECT.md` states backend/data utilizes "Firebase/Firestore for data storage. Cloud Functions for OAuth and CRON jobs."
- `c:\src\projects\Calorie Life\firebase.json` currently does not have a `functions` configuration block (only `hosting` is present).
- The `functions/` directory does not currently exist in the project root.

## 2. Logic Chain
- To use Firebase Cloud Functions, a dedicated directory (typically `functions/`) must be created with its own `package.json` to manage isolated backend dependencies, as mixing them with the frontend `package.json` can cause deployment issues.
- The `package.json` for functions needs specific Firebase dependencies (`firebase-functions`, `firebase-admin`), and the SCOPE explicitly requests `googleapis` for Calendar integrations. Since we are dealing with OAuth routes (`/auth/google`, etc.), `express` and `cors` are highly recommended for RESTful routing within HTTP functions.
- The root `firebase.json` must be updated with `"functions": { "source": "functions" }` so that the Firebase CLI knows where to look for the function source code during `firebase deploy`.
- An initial `functions/index.js` should be created to export a basic function, verifying the setup before building out the full OAuth flow in Milestone 3.1.2.

## 3. Caveats
- Assuming Node 18 or 20 for the Firebase functions runtime. (I've specified Node 18 in the recommendation as it is a stable standard for Firebase Functions v2).
- The implementer might decide to structure routes differently (e.g. `firebase-functions/v2/https` with `onRequest` wrapping an Express app, which is the most robust way to handle multiple routes like `/auth/google` and `/auth/google/callback`).

## 4. Conclusion
**Recommended Step-by-Step Implementation:**

**Step 1: Create functions directory and files**
Create the folder `functions` at the root of the project.

**Step 2: Create `functions/package.json`**
Write the following proposed content to `functions/package.json`:
```json
{
  "name": "functions",
  "description": "Cloud Functions for Calorie Life",
  "engines": {
    "node": "18"
  },
  "main": "index.js",
  "dependencies": {
    "cors": "^2.8.5",
    "express": "^4.19.2",
    "firebase-admin": "^12.1.0",
    "firebase-functions": "^5.0.1",
    "googleapis": "^140.0.1"
  },
  "devDependencies": {
    "eslint": "^8.51.0",
    "eslint-config-google": "^0.14.0"
  },
  "private": true
}
```

**Step 3: Create `functions/index.js`**
Write the following proposed content to `functions/index.js` to initialize the app:
```javascript
const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");

admin.initializeApp();

const app = express();
app.use(cors({ origin: true }));

// Dummy endpoint to verify setup
app.get("/status", (req, res) => {
  res.send("Cloud Functions are ready!");
});

// Export the express app as an HTTP function
exports.api = onRequest(app);
```

*(Optional but recommended)*: Create `functions/.gitignore`:
```
node_modules/
.env
```

**Step 4: Update `firebase.json` at project root**
Update `c:\src\projects\Calorie Life\firebase.json` to include the `"functions"` configuration. Insert it alongside the `"hosting"` block:
```json
{
  "functions": {
    "source": "functions"
  },
  "hosting": {
    ...
```

**Step 5: Install dependencies**
Run `npm install` inside the `functions/` directory.

## 5. Verification Method
1. Verify `functions/package.json` and `functions/index.js` exist.
2. Run `cd functions && npm install` to ensure packages resolve correctly without errors.
3. Run `npx eslint index.js` (if configured) to ensure no syntax errors.
4. Verify `firebase.json` contains `"functions": { "source": "functions" }`.
