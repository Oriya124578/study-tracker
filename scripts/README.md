# Admin / Migration Scripts — LOCAL USE ONLY

⚠️ **These scripts use `SUPABASE_SERVICE_ROLE_KEY`, which bypasses Row Level
Security and has full admin access to your project.**

Rules:
- Run them **only locally**, from your own machine, with `.env.local` present.
- **Never** deploy, bundle, or expose them in the frontend.
- **Never** put the service-role key in any `VITE_*` variable or in `src/`.
- The frontend (`src/supabaseClient.js`) uses the **anon** key only — keep it that way.

Contents:
- `uploadAllCorrectly.js`, `linkFilesAgain.js`, `linkFiles.js` — one-off bulk file
  upload / linking. Contain a hardcoded personal `userId` — update before reuse.
- `checkRLS.js`, `checkBuckets.js`, `checkFiles.js` — read-only diagnostics.
- `makeBucketPublic.js`, `testBucket.js`, `wipeFiles.js` — bucket operations
  (destructive — use with care).
