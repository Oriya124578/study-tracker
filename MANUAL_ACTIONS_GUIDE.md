# Manual Actions Guide — Study Tracker

This guide covers everything that **cannot be fixed from code alone** and requires manual configuration in Supabase Dashboard, external services, or infrastructure setup.

Each section includes exact steps, screenshots-equivalent descriptions, and verification instructions.

---

## Table of Contents

1. [RLS on Storage Bucket (CRITICAL)](#1-rls-on-storage-bucket)
2. [Rotate Service Role Key](#2-rotate-service-role-key)
3. [Verify .gitignore](#3-verify-gitignore)
4. [Set Up Error Telemetry (Sentry)](#4-set-up-error-telemetry-sentry)
5. [Add Account Deletion (Edge Function)](#5-add-account-deletion-edge-function)
6. [Enable Social Login / MFA](#6-enable-social-login--mfa)

---

## 1. RLS on Storage Bucket

**Priority:** CRITICAL  
**Risk if skipped:** Any authenticated user can read/write ANY other user's files by guessing their userId in the path.

### What to do

Go to **Supabase Dashboard → Storage → Policies** (or SQL Editor) and add Row Level Security policies on the `storage.objects` table for the `course_files` bucket.

### Step-by-step

1. Open your Supabase project dashboard: https://supabase.com/dashboard
2. Go to **SQL Editor** (left sidebar)
3. Paste and run the following SQL:

```sql
-- ============================================================
-- RLS Policies for the "course_files" private bucket
-- Path scheme: {userId}/{courseId}/{folder}/{storedName}
-- The first path segment MUST match the authenticated user's ID.
-- ============================================================

-- Make sure RLS is enabled on storage.objects (it usually is by default)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 1. SELECT — users can only list/read their own files
CREATE POLICY "Users can read own files"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'course_files'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 2. INSERT — users can only upload to their own prefix
CREATE POLICY "Users can upload own files"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'course_files'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 3. UPDATE — users can only update their own files (e.g., upsert)
CREATE POLICY "Users can update own files"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'course_files'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 4. DELETE — users can only delete their own files
CREATE POLICY "Users can delete own files"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'course_files'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
```

4. Click **Run**. You should see "Success. No rows returned."

### Verify it works

1. Log in to your app normally → upload a file → confirm it works (your userId matches).
2. Open the Supabase SQL Editor and run:
```sql
-- Try to read files of a different user (should return 0 rows for anon/wrong user)
SELECT name FROM storage.objects 
WHERE bucket_id = 'course_files' 
  AND name LIKE 'some-other-user-id/%';
```
3. From the app, try to construct a signed URL for a file under a different user's path → it should fail with 403/404.

### Also: verify RLS on user_data table

While you're at it, make sure the `user_data` table also has RLS:

```sql
-- Check if RLS is enabled
SELECT relname, relrowsecurity 
FROM pg_class 
WHERE relname = 'user_data';

-- If relrowsecurity is false, enable it:
ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;

-- Add policy if missing:
CREATE POLICY "Users can only access own data"
ON user_data
FOR ALL
USING (id = auth.uid())
WITH CHECK (id = auth.uid());
```

---

## 2. Rotate Service Role Key

**Priority:** HIGH  
**When:** If `.env.local` was ever committed to git, synced to OneDrive publicly, or shared with someone.

### What to do

The `SUPABASE_SERVICE_ROLE_KEY` in your `.env.local` bypasses ALL Row Level Security. If it's leaked, anyone can read/write all data.

### Step-by-step

1. Go to **Supabase Dashboard → Settings → API**
2. Under **Service Role Key (secret)**, click **Generate new key** (or **Rotate**)
3. Copy the new key
4. Update your local `.env.local`:
```
SUPABASE_SERVICE_ROLE_KEY=your_new_key_here
```
5. The old key is immediately invalidated — any scripts using it will stop working until you update them.

### Important notes

- The **anon key** (used in the frontend) is safe — it's meant to be public and is restricted by RLS.
- The **service role key** should NEVER appear in:
  - Any `VITE_*` environment variable (Vite bundles those into the frontend!)
  - Any file under `src/`
  - Any git commit
  - Any file synced publicly via OneDrive/Google Drive

---

## 3. Verify .gitignore

**Priority:** HIGH  
**Time:** 1 minute

### Step-by-step

1. Open `.gitignore` in your project root
2. Make sure these lines exist:
```
.env
.env.local
.env.*.local
```
3. Verify no secrets were ever committed:
```bash
git log --all -p -- .env.local
```
If this shows any results, the key was committed at some point. Rotate it (see section 2).

4. Consider adding to `.gitignore`:
```
# Admin scripts output
scripts/_*.mjs
```

---

## 4. Set Up Error Telemetry (Sentry)

**Priority:** MEDIUM  
**Why:** Right now, production errors only show in the user's browser console. You have no way to know when things break.

### Step-by-step

1. **Create a Sentry account:** https://sentry.io/signup/ (free tier: 5K errors/month)

2. **Create a new project:**
   - Platform: **React**
   - Give it a name like `study-tracker`
   - Copy the **DSN** (looks like `https://abc123@o456.ingest.sentry.io/789`)

3. **Install the SDK:**
```bash
npm install @sentry/react
```

4. **Initialize in `main.jsx`** (add before `createRoot`):
```jsx
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: 'YOUR_DSN_HERE',
  // Only send errors in production
  enabled: import.meta.env.PROD,
  // Sample 100% of errors, 10% of performance traces
  tracesSampleRate: 0.1,
  // Don't send PII (emails, names)
  sendDefaultPii: false,
});
```

5. **Wrap App in ErrorBoundary** (optional — you already have one, but Sentry's captures more context):
```jsx
// In main.jsx
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Sentry.ErrorBoundary fallback={<p>An error occurred</p>}>
      <App />
    </Sentry.ErrorBoundary>
  </StrictMode>
);
```

6. **Add the DSN to environment:**
```
# .env.local
VITE_SENTRY_DSN=https://abc123@o456.ingest.sentry.io/789
```
Then in code: `dsn: import.meta.env.VITE_SENTRY_DSN`

### Verify

1. Deploy the app
2. Open DevTools console and run: `throw new Error('Test Sentry')`
3. Check the Sentry dashboard — you should see the error within 30 seconds

---

## 5. Add Account Deletion (Edge Function)

**Priority:** HIGH (GDPR/privacy compliance)  
**Why:** Users currently cannot delete their account or data. This is required for privacy compliance.

### Architecture

Account deletion requires a **server-side function** because:
- Deleting auth users requires the service role key
- Deleting storage files requires admin access
- The frontend should NEVER have the service role key

### Step-by-step

1. **Install Supabase CLI** (if not already):
```bash
npm install -g supabase
```

2. **Create the Edge Function:**
```bash
supabase functions new delete-account
```

3. **Write the function** (`supabase/functions/delete-account/index.ts`):
```typescript
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  // Verify the user is authenticated
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return new Response('Unauthorized', { status: 401 })
  }

  // Create admin client (service role)
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  // Create user client to verify identity
  const supabaseUser = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: authHeader } } }
  )

  const { data: { user }, error: authError } = await supabaseUser.auth.getUser()
  if (authError || !user) {
    return new Response('Unauthorized', { status: 401 })
  }

  const userId = user.id

  try {
    // 1. Delete all files from storage
    const { data: files } = await supabaseAdmin.storage
      .from('course_files')
      .list(userId, { limit: 1000 })
    
    if (files && files.length > 0) {
      // List and delete recursively
      for (const item of files) {
        if (item.id === null) {
          // It's a folder — list its contents
          const folderPath = `${userId}/${item.name}`
          const { data: inner } = await supabaseAdmin.storage
            .from('course_files')
            .list(folderPath, { limit: 1000 })
          if (inner) {
            for (const subItem of inner) {
              if (subItem.id === null) {
                const subFolderPath = `${folderPath}/${subItem.name}`
                const { data: deepInner } = await supabaseAdmin.storage
                  .from('course_files')
                  .list(subFolderPath, { limit: 1000 })
                if (deepInner) {
                  const paths = deepInner
                    .filter(f => f.id !== null)
                    .map(f => `${subFolderPath}/${f.name}`)
                  if (paths.length > 0) {
                    await supabaseAdmin.storage.from('course_files').remove(paths)
                  }
                }
              } else {
                await supabaseAdmin.storage
                  .from('course_files')
                  .remove([`${folderPath}/${subItem.name}`])
              }
            }
          }
        }
      }
    }

    // 2. Delete user data row
    await supabaseAdmin.from('user_data').delete().eq('id', userId)

    // 3. Delete the auth user
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId)
    if (deleteError) throw deleteError

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})
```

4. **Deploy:**
```bash
supabase functions deploy delete-account
```

5. **Add the button to SettingsView** (in `src/components/settings/SettingsView.jsx`):

Add this in the Danger Zone section, after the logout button:

```jsx
{/* Delete Account */}
<div className="flex items-center justify-between p-4 rounded-xl bg-destructive/10 border border-destructive/30">
  <div>
    <h3 className="font-semibold text-destructive flex items-center gap-2">
      <Trash2 className="w-4 h-4" />
      {t('deleteAccountTitle')}
    </h3>
    <p className="text-sm text-destructive/80">{t('deleteAccountDesc')}</p>
  </div>
  <Button variant="destructive" onClick={handleDeleteAccount}>
    {t('deleteAccountBtn')}
  </Button>
</div>
```

And add the handler:
```jsx
const handleDeleteAccount = async () => {
  const confirmed = window.confirm(t('confirmDeleteAccount'));
  if (!confirmed) return;
  
  // Double confirm with email
  const email = window.prompt(t('typeEmailToConfirm'));
  const { data: { user } } = await supabase.auth.getUser();
  if (email !== user?.email) {
    toast.error(t('emailMismatch'));
    return;
  }
  
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-account`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${session.access_token}` }
    });
    if (!res.ok) throw new Error('Failed');
    await supabase.auth.signOut();
  } catch (err) {
    toast.error(t('deleteAccountError'));
  }
};
```

Add translation keys:
```
// Hebrew
deleteAccountTitle: 'מחיקת חשבון',
deleteAccountDesc: 'מחק לצמיתות את החשבון שלך ואת כל הנתונים. פעולה זו בלתי הפיכה.',
deleteAccountBtn: 'מחק חשבון',
confirmDeleteAccount: 'האם אתה בטוח? כל הנתונים, הקבצים והקורסים שלך יימחקו לצמיתות.',
typeEmailToConfirm: 'הקלד את כתובת האימייל שלך לאישור:',
emailMismatch: 'האימייל לא תואם. הפעולה בוטלה.',
deleteAccountError: 'שגיאה במחיקת החשבון. נסה שוב.',

// English
deleteAccountTitle: 'Delete Account',
deleteAccountDesc: 'Permanently delete your account and all data. This action is irreversible.',
deleteAccountBtn: 'Delete Account',
confirmDeleteAccount: 'Are you sure? All your data, files, and courses will be permanently deleted.',
typeEmailToConfirm: 'Type your email address to confirm:',
emailMismatch: 'Email does not match. Operation cancelled.',
deleteAccountError: 'Error deleting account. Please try again.',
```

---

## 6. Enable Social Login / MFA

**Priority:** LOW (convenience / security enhancement)  
**Time:** 15–30 minutes per provider

### 6a. Google Login

1. Go to **Google Cloud Console** → https://console.cloud.google.com/
2. Create or select a project
3. Go to **APIs & Services → Credentials**
4. Click **Create Credentials → OAuth Client ID**
   - Application type: **Web application**
   - Authorized redirect URIs: add `https://<your-supabase-ref>.supabase.co/auth/v1/callback`
5. Copy the **Client ID** and **Client Secret**
6. Go to **Supabase Dashboard → Authentication → Providers**
7. Enable **Google**
8. Paste the Client ID and Client Secret
9. Save

Then in `AuthView.jsx`, add a button:
```jsx
<Button 
  variant="outline" 
  className="w-full gap-2"
  onClick={() => supabase.auth.signInWithOAuth({ provider: 'google' })}
>
  <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="" />
  {t('continueWithGoogle')}
</Button>
```

### 6b. GitHub Login

1. Go to **GitHub → Settings → Developer Settings → OAuth Apps**
2. Click **New OAuth App**
   - Homepage URL: your app URL
   - Authorization callback URL: `https://<your-supabase-ref>.supabase.co/auth/v1/callback`
3. Copy Client ID and Client Secret
4. Go to **Supabase Dashboard → Authentication → Providers → GitHub**
5. Enable and paste credentials

### 6c. MFA (TOTP)

1. Go to **Supabase Dashboard → Authentication → Multi-Factor Authentication**
2. Toggle **Enable MFA**
3. In your app, after login, check if user has MFA enrolled:
```jsx
const { data } = await supabase.auth.mfa.listFactors();
if (data.totp.length === 0) {
  // Offer to enroll
  const { data: enroll } = await supabase.auth.mfa.enroll({ factorType: 'totp' });
  // Show QR code: enroll.totp.qr_code (base64 image)
}
```

This requires a dedicated MFA enrollment/verification screen — it's a larger UI effort.

---

## Quick Reference Checklist

| # | Action | Priority | Time | Status |
|---|--------|----------|------|--------|
| 1 | Add RLS policies to `storage.objects` | CRITICAL | 5 min | ☐ |
| 2 | Verify RLS on `user_data` table | CRITICAL | 2 min | ☐ |
| 3 | Check `.gitignore` has `.env.local` | HIGH | 1 min | ☐ |
| 4 | Rotate service role key (if exposed) | HIGH | 5 min | ☐ |
| 5 | Set up Sentry error tracking | MEDIUM | 20 min | ☐ |
| 6 | Create `delete-account` Edge Function | HIGH | 30 min | ☐ |
| 7 | Add delete account button to Settings | HIGH | 10 min | ☐ |
| 8 | Enable Google OAuth (optional) | LOW | 15 min | ☐ |
| 9 | Enable GitHub OAuth (optional) | LOW | 15 min | ☐ |
| 10 | Enable MFA (optional) | LOW | 1 hr | ☐ |
