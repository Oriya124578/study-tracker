# Supabase Migrations

Version-controlled SQL for database & storage security. Apply these to your
Supabase project so users can only access their own data and files.

## How to apply

**Option A — Supabase Dashboard (simplest)**
1. Open your project → SQL Editor.
2. Paste and run `0001_user_data_rls.sql`.
3. Paste and run `0002_course_files_bucket_rls.sql`.

**Option B — Supabase CLI**
```bash
supabase db push
```

Both files are idempotent (safe to re-run).

## What they do

- `0001_user_data_rls.sql` — Enables RLS on `public.user_data`; each user can
  only read/write their own row (`auth.uid() = id`).
- `0002_course_files_bucket_rls.sql` — Makes the `course_files` storage bucket
  **private** and restricts every object to the owning user, identified by the
  first path segment (`{userId}/...`). The app accesses files via signed URLs.

## Verify

After applying, run the diagnostics in `scripts/`:
```bash
node scripts/checkRLS.js
node scripts/checkBuckets.js
```
In the Dashboard, confirm RLS is **enabled** on `user_data` and the
`course_files` bucket shows as **Private**.
