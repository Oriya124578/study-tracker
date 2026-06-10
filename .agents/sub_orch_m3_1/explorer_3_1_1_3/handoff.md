# Milestone 3.1.1 Implementation Strategy: Cloud Functions Setup

## Observation
- `SCOPE.md` specifies Milestone 3.1.1: "Initialize Firebase Functions environment. Set up package.json, index.js, dependencies (googleapis, firebase-admin, etc.)."
- The project root directory (`c:\src\projects\Calorie Life`) does not currently contain a `functions` directory.
- `firebase.json` at the project root only contains a `"hosting"` configuration and is missing a `"functions"` block.
- `SCOPE.md` states the required interface contracts: `GET /auth/google`, `GET /auth/google/callback`, and `GET /api/calendar/events`.

## Logic Chain
1. To initialize Firebase Functions, a `functions` directory must be created in the project root.
2. The `functions` directory requires a `package.json` with the specified dependencies: `googleapis` (for Google Calendar API), `firebase-admin` (for Firestore token storage), and `firebase-functions` (the SDK).
3. Using `express` and `cors` is the standard way to handle the HTTP routing required by `SCOPE.md` for the OAuth and API proxy endpoints.
4. An `index.js` must be created to initialize the Firebase Admin SDK and export the Cloud Functions (e.g., as v2 HTTP endpoints).
5. The project root's `firebase.json` needs to be updated to register the `functions` source folder, allowing the Firebase CLI to deploy or emulate the functions.

## Caveats
- Assuming Node 20 environment (Firebase Functions v2 is recommended). 
- Using Express to map the exact endpoints (`/auth/google`, etc.) is recommended. By exporting `exports.api`, Firebase will expose them under the function's base URL (e.g., `/api/auth/google`). Rewrites in `firebase.json` may be necessary later if the frontend expects exact root paths as described in `SCOPE.md`, or the frontend routing can simply be adjusted to match the Cloud Functions URL structure.
- This setup only initializes the files; actual logic for OAuth and Calendar API proxying will be implemented in subsequent milestones (3.1.2 and 3.1.3).

## Conclusion
Here is the step-by-step implementation strategy for the assigned implementer:

### 1. Create the `functions` directory
Create a new folder named `functions` at the root of the project.

### 2. Create `functions/package.json`
Create this file to define the Cloud Functions dependencies and scripts.

```json
{
  "name": "functions",
  "description": "Cloud Functions for Calorie Life",
  "engines": {
    "node": "20"
  },
  "main": "index.js",
  "dependencies": {
    "cors": "^2.8.5",
    "express": "^4.19.2",
    "firebase-admin": "^12.1.0",
    "firebase-functions": "^5.0.1",
    "googleapis": "^140.0.0"
  },
  "private": true
}
```

### 3. Install Dependencies
Run `npm install` inside the `functions` directory to generate the `package-lock.json` and install the modules.

### 4. Create `functions/index.js`
Create the entry point that initializes the Firebase Admin SDK and sets up the basic endpoints using Express.

```javascript
const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");

admin.initializeApp();

const app = express();
app.use(cors({ origin: true }));

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

exports.api = onRequest({ cors: true }, app);
```

### 5. Update `firebase.json`
Add the `"functions"` configuration to the existing `firebase.json` at the project root so Firebase CLI recognizes the directory.

```json
{
  "hosting": { ... }, // Keep existing hosting config
  "functions": {
    "source": "functions",
    "ignore": [
      "node_modules",
      ".git",
      "firebase-debug.log",
      "firebase-debug.*.log"
    ]
  }
}
```

## Verification Method
1. Verify the `functions/package.json` and `functions/index.js` files have been created.
2. Run `npm install` in the `functions` directory to ensure dependencies resolve successfully.
3. Verify that `firebase.json` contains the `"functions": { "source": "functions" }` block.
4. Run `firebase emulators:start --only functions` in the project root to verify the Firebase Functions emulator starts without errors and the endpoints are successfully mounted.
