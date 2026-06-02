#!/usr/bin/env node
/**
 * One-time migration: Supabase (user_data + course_files bucket) → Firebase
 * (Firestore + Firebase Storage).
 *
 * Usage:
 *   node scripts/migrate-supabase-to-firebase.js [--uid=<supabase-uid>] [--firebase-uid=<fb-uid>] [--email=<email>] [--yes]
 *
 * Reads `.env.local` for Supabase creds and Firebase project id; requires
 * `firebase-admin-key.json` (service account) at the project root.
 *
 * READ-ONLY against Supabase. Does NOT delete or modify Supabase data.
 */

import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { fileURLToPath } from 'node:url';

import { createClient } from '@supabase/supabase-js';
import admin from 'firebase-admin';

// ---- Path / env bootstrap -------------------------------------------------

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

// Minimal .env.local loader so we don't need dotenv as an extra dep.
function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf8');
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

loadEnvFile(path.join(PROJECT_ROOT, '.env.local'));
loadEnvFile(path.join(PROJECT_ROOT, '.env'));

// ---- CLI args -------------------------------------------------------------

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    if (a.startsWith('--')) {
      const [k, ...rest] = a.slice(2).split('=');
      return [k, rest.length ? rest.join('=') : true];
    }
    return [a, true];
  })
);

const TARGET_EMAIL = args.email || 'turhv124@gmail.com';
const SUPABASE_UID_ARG = args.uid || null;
const FIREBASE_UID_ARG = args['firebase-uid'] || null;
const AUTO_YES = Boolean(args.yes || args.y);

// ---- Config ---------------------------------------------------------------

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const FIREBASE_PROJECT_ID = process.env.VITE_FIREBASE_PROJECT_ID;
const FIREBASE_STORAGE_BUCKET = process.env.VITE_FIREBASE_STORAGE_BUCKET;
const SERVICE_ACCOUNT_PATH = path.join(PROJECT_ROOT, 'firebase-admin-key.json');
const SUPABASE_BUCKET = 'course_files';

function fatal(msg) {
  console.error(`\n[migrate] ERROR: ${msg}\n`);
  process.exit(1);
}

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  fatal('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
}
if (!FIREBASE_PROJECT_ID || !FIREBASE_STORAGE_BUCKET) {
  fatal('Missing VITE_FIREBASE_PROJECT_ID or VITE_FIREBASE_STORAGE_BUCKET in .env.local');
}
if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
  fatal(
    `Service account file not found at ${SERVICE_ACCOUNT_PATH}. ` +
      `Download it from Firebase Console → Project Settings → Service Accounts → Generate new private key, ` +
      `then save it as "firebase-admin-key.json" in the project root.`
  );
}

// ---- Init clients ---------------------------------------------------------

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const serviceAccount = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_PATH, 'utf8'));
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: FIREBASE_PROJECT_ID,
  storageBucket: FIREBASE_STORAGE_BUCKET,
});

const db = admin.firestore();
const bucket = admin.storage().bucket();

// ---- Hex decoding helpers (mirror src/lib/courseFilesStorage.js) ----------

const hasControlChars = (str) =>
  Array.from(str).some((ch) => ch.charCodeAt(0) < 32);

const hexToString = (hex) => {
  const bytes = new Uint8Array(hex.match(/.{1,2}/g).map((b) => parseInt(b, 16)));
  return new TextDecoder().decode(bytes);
};

const decodeStoredName = (storedName) => {
  if (!storedName) return storedName;
  let name = String(storedName).replace(/^\d{10,}_/, '');
  if (/^[0-9a-f]+$/i.test(name) && name.length % 2 === 0) {
    try {
      const decoded = hexToString(name);
      if (!hasControlChars(decoded)) name = decoded;
    } catch {
      /* keep original */
    }
  }
  return name;
};

// ---- Utilities ------------------------------------------------------------

function prompt(question) {
  if (AUTO_YES) return Promise.resolve('y');
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) =>
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    })
  );
}

async function resolveSupabaseUser() {
  if (SUPABASE_UID_ARG) {
    return { id: SUPABASE_UID_ARG, email: '(provided via --uid)' };
  }
  // Lookup by email via admin API. listUsers paginates; scan up to 5 pages.
  for (let page = 1; page <= 5; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw new Error(`Supabase listUsers failed: ${error.message}`);
    const found = data.users.find((u) => (u.email || '').toLowerCase() === TARGET_EMAIL.toLowerCase());
    if (found) return { id: found.id, email: found.email };
    if (data.users.length < 200) break;
  }
  throw new Error(`No Supabase user found with email ${TARGET_EMAIL}`);
}

async function loadAppState(supabaseUid) {
  const { data, error } = await supabase
    .from('user_data')
    .select('app_state')
    .eq('id', supabaseUid)
    .maybeSingle();
  if (error) throw new Error(`Failed to read user_data: ${error.message}`);
  if (!data) throw new Error(`No user_data row for uid ${supabaseUid}`);
  return data.app_state || {};
}

function countTasks(appState) {
  let weeklyTaskCount = 0;
  let globalTaskCount = 0;
  let fileCount = 0;

  const tasks = appState.tasks || {};
  for (const courseId of Object.keys(tasks)) {
    const weeks = tasks[courseId] || {};
    for (const week of Object.keys(weeks)) {
      const arr = Array.isArray(weeks[week]) ? weeks[week] : [];
      weeklyTaskCount += arr.length;
      for (const t of arr) fileCount += (t.files || []).length;
    }
  }

  const globalTasks = appState.globalTasks || {};
  for (const courseId of Object.keys(globalTasks)) {
    const cats = globalTasks[courseId] || {};
    for (const cat of Object.keys(cats)) {
      const arr = Array.isArray(cats[cat]) ? cats[cat] : [];
      globalTaskCount += arr.length;
      for (const t of arr) fileCount += (t.files || []).length;
    }
  }

  return { weeklyTaskCount, globalTaskCount, fileCount };
}

// Sanitize a value for Firestore: drop undefineds, but keep null/0/false/'' and arrays/maps.
function clean(value) {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (Array.isArray(value)) {
    return value.map(clean).filter((v) => v !== undefined);
  }
  if (typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      const c = clean(v);
      if (c !== undefined) out[k] = c;
    }
    return out;
  }
  return value;
}

// ---- Batched writes -------------------------------------------------------

class Batcher {
  constructor(limit = 450) {
    this.limit = limit;
    this.batch = db.batch();
    this.ops = 0;
    this.committed = 0;
  }
  async set(ref, data) {
    this.batch.set(ref, data);
    this.ops += 1;
    if (this.ops >= this.limit) await this.flush();
  }
  async flush() {
    if (this.ops === 0) return;
    await this.batch.commit();
    this.committed += this.ops;
    this.batch = db.batch();
    this.ops = 0;
  }
}

// ---- File migration -------------------------------------------------------

async function migrateFileEntry({ supabaseUid, firebaseUid, courseId, folder, fileEntry, stats }) {
  if (!fileEntry || !fileEntry.path) return fileEntry;
  const srcPath = fileEntry.path;

  // Storage names + folder must remain ASCII; preserve as-is.
  const segments = srcPath.split('/');
  // Expected: {supabaseUid}/{courseId}/{folder}/{storedName}
  // Move to top-level cl_files/{firebaseUid}/{courseId}/{folder}/{storedName}
  // so course files remain private (Storage rules allow read on users/{uid}/**).
  const storedName = segments[segments.length - 1];
  const folderSeg = segments[segments.length - 2] || folder || 'misc';
  const courseSeg = segments[segments.length - 3] || courseId || 'misc';

  const newPath = `cl_files/${firebaseUid}/${courseSeg}/${folderSeg}/${storedName}`;
  const decodedName = decodeStoredName(fileEntry.name || storedName);

  try {
    // Download bytes from Supabase storage via service-role client (no signed URL needed).
    const { data: blob, error } = await supabase.storage.from(SUPABASE_BUCKET).download(srcPath);
    if (error) throw error;
    const arrayBuf = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuf);

    const file = bucket.file(newPath);
    await file.save(buffer, {
      resumable: false,
      contentType: blob.type || 'application/octet-stream',
      metadata: {
        contentType: blob.type || 'application/octet-stream',
        metadata: { originalName: decodedName },
      },
    });
    stats.filesUploaded += 1;
    process.stdout.write('.');
  } catch (err) {
    stats.fileErrors.push({ srcPath, message: err.message || String(err) });
    process.stdout.write('x');
  }

  return { name: decodedName, path: newPath };
}

// ---- Main -----------------------------------------------------------------

async function main() {
  console.log('[migrate] Supabase → Firebase migration');
  console.log('[migrate] Project root:', PROJECT_ROOT);

  const sbUser = await resolveSupabaseUser();
  const firebaseUid = FIREBASE_UID_ARG || sbUser.id;

  console.log(`[migrate] Supabase user: ${sbUser.id} (${sbUser.email})`);
  console.log(`[migrate] Firebase target uid: ${firebaseUid}`);

  const appState = await loadAppState(sbUser.id);
  const courses = Array.isArray(appState.courses) ? appState.courses : [];
  const profile = appState.profile || {};
  const pomodoroSessions = Array.isArray(appState.pomodoroSessions) ? appState.pomodoroSessions : [];
  const { weeklyTaskCount, globalTaskCount, fileCount } = countTasks(appState);

  console.log('\n[migrate] Preview:');
  console.log(`  Profile fields:        ${Object.keys(profile).length}`);
  console.log(`  Courses:               ${courses.length}`);
  console.log(`  Weekly tasks:          ${weeklyTaskCount}`);
  console.log(`  Global tasks:          ${globalTaskCount}`);
  console.log(`  Files (refs):          ${fileCount}`);
  console.log(`  Pomodoro sessions:     ${pomodoroSessions.length}`);
  console.log('\n[migrate] Destination:');
  console.log(`  Firestore project:     ${FIREBASE_PROJECT_ID}`);
  console.log(`  Storage bucket:        ${FIREBASE_STORAGE_BUCKET}`);
  console.log(`  Doc paths:             users/${firebaseUid}/cl_*`);

  const answer = await prompt('\nProceed with migration? [y/N] ');
  if (!/^y(es)?$/i.test(String(answer).trim())) {
    console.log('[migrate] Aborted by user.');
    process.exit(0);
  }

  const stats = {
    profile: 0,
    courses: 0,
    weeklyTasks: 0,
    globalTasks: 0,
    pomodoroSessions: 0,
    filesUploaded: 0,
    fileErrors: [],
  };

  // 1) Profile
  if (Object.keys(profile).length > 0) {
    await db
      .doc(`users/${firebaseUid}/cl_profile/main`)
      .set(clean({ ...profile, migratedAt: admin.firestore.FieldValue.serverTimestamp() }), {
        merge: true,
      });
    stats.profile = 1;
  }

  const tasksByCourseWeek = appState.tasks || {};
  const notesByCourseWeek = appState.notes || {};
  const linksByCourse = appState.links || {};
  const globalTasksByCourse = appState.globalTasks || {};

  // 2) Courses (with notes as week→string map, links inlined)
  const courseBatcher = new Batcher();
  for (const course of courses) {
    if (!course || !course.id) continue;
    const courseNotes = notesByCourseWeek[course.id] || {};
    const courseLinks = linksByCourse[course.id] || {};

    const doc = clean({
      id: course.id,
      name: course.name || '',
      defaultNotebookLmLink: course.defaultNotebookLmLink || '',
      defaultGeminiLink: course.defaultGeminiLink || '',
      defaultLocalFolder: course.defaultLocalFolder || '',
      weeksCount: course.weeksCount || 0,
      exams: course.exams || {},
      isArchived: Boolean(course.isArchived),
      links: {
        notebookLm: courseLinks.notebookLm || '',
        gemini: courseLinks.gemini || '',
        localFolder: courseLinks.localFolder || '',
      },
      notes: courseNotes,
    });

    await courseBatcher.set(db.doc(`users/${firebaseUid}/cl_courses/${course.id}`), doc);
    stats.courses += 1;
  }
  await courseBatcher.flush();

  // 3) Course tasks — weekly + global. Files migrated synchronously per task.
  console.log('\n[migrate] Uploading files & writing tasks (this may take a while)...');
  const taskBatcher = new Batcher();

  // Weekly
  for (const courseId of Object.keys(tasksByCourseWeek)) {
    const weeks = tasksByCourseWeek[courseId] || {};
    for (const weekKey of Object.keys(weeks)) {
      const arr = Array.isArray(weeks[weekKey]) ? weeks[weekKey] : [];
      for (let idx = 0; idx < arr.length; idx += 1) {
        const t = arr[idx] || {};
        const taskId =
          t.id ||
          `${courseId}_w${weekKey}_${(t.type || 'task').replace(/[^A-Za-z0-9_-]/g, '')}_${idx}`;

        const folderSeg = `week_${weekKey}`;
        const migratedFiles = [];
        for (const f of t.files || []) {
          const newEntry = await migrateFileEntry({
            supabaseUid: sbUser.id,
            firebaseUid,
            courseId,
            folder: folderSeg,
            fileEntry: f,
            stats,
          });
          migratedFiles.push(newEntry);
        }

        const docData = clean({
          id: taskId,
          courseId,
          scope: 'weekly',
          week: Number(weekKey),
          type: t.type || null,
          label: t.label || '',
          checked: Boolean(t.checked),
          files: migratedFiles,
          order: idx,
        });

        await taskBatcher.set(
          db.doc(`users/${firebaseUid}/cl_courseTasks/${taskId}`),
          docData
        );
        stats.weeklyTasks += 1;
      }
    }
  }

  // Global
  for (const courseId of Object.keys(globalTasksByCourse)) {
    const cats = globalTasksByCourse[courseId] || {};
    for (const category of Object.keys(cats)) {
      const arr = Array.isArray(cats[category]) ? cats[category] : [];
      for (let idx = 0; idx < arr.length; idx += 1) {
        const t = arr[idx] || {};
        const taskId =
          t.id ||
          `${courseId}_g${category.replace(/[^A-Za-z0-9_-]/g, '')}_${idx}`;

        const folderSeg = category;
        const migratedFiles = [];
        for (const f of t.files || []) {
          const newEntry = await migrateFileEntry({
            supabaseUid: sbUser.id,
            firebaseUid,
            courseId,
            folder: folderSeg,
            fileEntry: f,
            stats,
          });
          migratedFiles.push(newEntry);
        }

        const docData = clean({
          id: taskId,
          courseId,
          scope: 'global',
          category,
          label: t.label || '',
          checked: Boolean(t.checked),
          files: migratedFiles,
          order: idx,
        });

        await taskBatcher.set(
          db.doc(`users/${firebaseUid}/cl_courseTasks/${taskId}`),
          docData
        );
        stats.globalTasks += 1;
      }
    }
  }
  await taskBatcher.flush();

  // 4) Pomodoro sessions
  const pomoBatcher = new Batcher();
  for (let i = 0; i < pomodoroSessions.length; i += 1) {
    const s = pomodoroSessions[i] || {};
    const id = s.id || `pomo_${i}_${Date.now()}`;
    await pomoBatcher.set(
      db.doc(`users/${firebaseUid}/cl_pomodoroSessions/${id}`),
      clean({
        id,
        courseId: s.courseId || null,
        date: s.date || null,
        minutes: Number(s.minutes) || 0,
      })
    );
    stats.pomodoroSessions += 1;
  }
  await pomoBatcher.flush();

  // ---- Report -------------------------------------------------------------
  console.log('\n\n[migrate] Final report');
  console.log('  Profile docs:          ', stats.profile);
  console.log('  Courses migrated:      ', stats.courses);
  console.log('  Weekly tasks:          ', stats.weeklyTasks);
  console.log('  Global tasks:          ', stats.globalTasks);
  console.log('  Pomodoro sessions:     ', stats.pomodoroSessions);
  console.log('  Files uploaded:        ', stats.filesUploaded);
  console.log('  File errors:           ', stats.fileErrors.length);
  if (stats.fileErrors.length > 0) {
    console.log('\n[migrate] File errors:');
    for (const e of stats.fileErrors.slice(0, 20)) {
      console.log(`   - ${e.srcPath}: ${e.message}`);
    }
    if (stats.fileErrors.length > 20) {
      console.log(`   ...and ${stats.fileErrors.length - 20} more`);
    }
  }
  console.log('\n[migrate] Done.');
}

main().catch((err) => {
  console.error('\n[migrate] FATAL:', err);
  process.exit(1);
});
