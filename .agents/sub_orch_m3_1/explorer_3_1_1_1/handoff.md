# Handoff: Milestone 3.1.1 Implementation Strategy

## Observation
- The `functions/` directory does not currently exist in the `c:\src\projects\Calorie Life` root.
- The root `firebase.json` file configures `hosting` but is missing the `"functions"` configuration block.
- `SCOPE.md` (Milestone 3.1) lists required endpoints: `GET /auth/google`, `GET /auth/google/callback`, and `GET /api/calendar/events`.
- Required dependencies mentioned in `SCOPE.md`: `googleapis`, `firebase-admin`, and implicitly others needed like `firebase-functions`, `express`, and `cors`.

## Logic Chain
1. **Firebase Configuration**: To enable Firebase Functions, `firebase.json` must be updated with a `functions` object that points to the `functions` source directory.
2. **Dedicated Environment**: A dedicated `functions/package.json` is required to manage the backend dependencies separately from the React frontend, and to satisfy Firebase deployment requirements.
3. **API Routing**: Since Milestone 3.1.2 and 3.1.3 require REST-like endpoints (`/auth/google`, `/api/...`), the best architectural approach is to create a single HTTPS Cloud Function that wraps an `express` app. This allows standard Express routing for all the OAuth and API proxy paths.
4. **Dependencies**: We need `firebase-admin` and `firebase-functions` for the core environment, `express` and `cors` for the API wrapper, and `googleapis` for the Google Calendar integration.

## Caveats
- Setting up the Google API console (OAuth client ID/secrets) is out of scope for the codebase setup but will be required before the OAuth logic actually works. It is assumed secrets will be handled using Firebase environment variables (`.env` in functions) or Google Cloud Secret Manager in the next milestone.

## Conclusion
Here is the recommended step-by-step implementation strategy for Milestone 3.1.1:

1. **Update `firebase.json`** in the root to include the functions source:
   ```json
   {
     "functions": {
       "source": "functions",
       "ignore": [
         "node_modules",
         ".git",
         "firebase-debug.log",
         "firebase-debug.*.log",
         "*.local"
       ]
     },
     "hosting": { ... }
   }
   ```

2. **Create `functions/package.json`** with the required dependencies and a Node.js engine specification (Node 18 or 20 recommended):
   ```json
   {
     "name": "functions",
     "description": "Cloud Functions for Firebase",
     "main": "index.js",
     "engines": {
       "node": "18"
     },
     "scripts": {
       "serve": "firebase emulators:start --only functions",
       "deploy": "firebase deploy --only functions",
       "logs": "firebase functions:log"
     },
     "dependencies": {
       "cors": "^2.8.5",
       "express": "^4.19.0",
       "firebase-admin": "^12.0.0",
       "firebase-functions": "^5.0.0",
       "googleapis": "^135.0.0"
     },
     "private": true
   }
   ```

3. **Install Dependencies**: Run `npm install` within the `functions/` directory.

4. **Create `functions/index.js`** to initialize the app and export an Express API wrapper:
   ```javascript
   const functions = require("firebase-functions");
   const admin = require("firebase-admin");
   const express = require("express");
   const cors = require("cors");

   admin.initializeApp();

   const app = express();
   app.use(cors({ origin: true }));

   // Placeholder for Milestone 3.1.2
   app.get("/auth/google", (req, res) => {
     res.send("OAuth flow init placeholder");
   });

   app.get("/auth/google/callback", (req, res) => {
     res.send("OAuth callback placeholder");
   });

   // Placeholder for Milestone 3.1.3
   app.get("/api/calendar/events", (req, res) => {
     res.send("Calendar events placeholder");
   });

   // Export the Express app as a single Firebase Cloud Function
   exports.api = functions.https.onRequest(app);
   ```

## Verification Method
- Verify the `functions/package.json` and `functions/index.js` files are created matching the templates above.
- Verify `firebase.json` contains the `"functions"` configuration block.
- Run `cd functions && npm install` to confirm dependencies resolve without error.
- Optionally run `firebase emulators:start --only functions` from the project root to verify the local functions environment initializes and exposes the `/api` endpoint without errors.
