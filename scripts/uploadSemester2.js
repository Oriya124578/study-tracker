// Bulk-upload your "semester 2" folder into the study-tracker app.
//
// LOCAL USE ONLY — uses SUPABASE_SERVICE_ROLE_KEY (bypasses RLS). See README.md.
//
// What it does, per course folder under SOURCE_BASE:
//   הרצאות     -> weekly task "lecture"   of the detected week
//   תרגולים    -> weekly task "tutorial"  of the detected week
//   שיעורי בית -> weekly task "homework"  of the detected week
//   מבחנים/בחני עבר -> global category "past_exams"
//   סיכומים    -> global category "summaries"
//
// Files are uploaded to the private `course_files` bucket using the SAME scheme
// the app expects (`{userId}/{courseId}/{folder}/{Date.now()}_{hex(name)}`) and
// linked into app_state as { name, path } so signed-URL opening works everywhere.
//
// Idempotent: a file already linked (matched by display name) is skipped.
// Safe by default: prints a DRY-RUN plan. Pass --commit to actually upload+save.
//
//   node scripts/uploadSemester2.js            # dry run, no changes
//   node scripts/uploadSemester2.js --commit    # upload + link

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const COMMIT = process.argv.includes('--commit');

const SOURCE_BASE =
  'C:\\Users\\turhv\\OneDrive\\שולחן העבודה\\Studies\\year 1\\semester 2';
const BUCKET = 'course_files';

// --- env ------------------------------------------------------------------
const env = {};
try {
  fs.readFileSync(path.resolve(__dirname, '../.env.local'), 'utf-8')
    .split('\n')
    .forEach((line) => {
      const m = line.match(/^([^=]+)=(.*)$/);
      if (m) env[m[1].trim()] = m[2].trim();
    });
} catch {
  console.error('Could not read .env.local');
  process.exit(1);
}

const SUPABASE_URL = env['VITE_SUPABASE_URL'];
const SERVICE_KEY = env['SUPABASE_SERVICE_ROLE_KEY'] || env['VITE_SUPABASE_SERVICE_ROLE_KEY'];
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}
const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

// --- helpers --------------------------------------------------------------
const stringToHex = (str) =>
  Array.from(new TextEncoder().encode(str))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

const contentTypeFor = (file) => {
  const e = file.toLowerCase();
  if (e.endsWith('.pdf')) return 'application/pdf';
  if (e.endsWith('.png')) return 'image/png';
  if (e.endsWith('.jpg') || e.endsWith('.jpeg')) return 'image/jpeg';
  if (e.endsWith('.docx')) return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  if (e.endsWith('.pptx')) return 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
  if (e.endsWith('.txt')) return 'text/plain';
  return 'application/octet-stream';
};

// Map a category folder name to a destination.
const classifyCategory = (folderName) => {
  const n = folderName;
  if (n.includes('הרצא')) return { kind: 'weekly', type: 'lecture', suffix: 'lecture-0' };
  if (n.includes('תרגול') || n.includes('תרגו')) return { kind: 'weekly', type: 'tutorial', suffix: 'tutorial-1' };
  if (n.includes('בית')) return { kind: 'weekly', type: 'homework', suffix: 'homework-2' };
  if (n.includes('מבחן') || n.includes('מבחנ') || n.includes('בחנ') || n.includes('בחני')) return { kind: 'global', category: 'past_exams' };
  if (n.includes('סיכומ') || n.includes('סיכום')) return { kind: 'global', category: 'summaries' };
  return null;
};

// Detect the week number from a file name. Prefers a number following a known
// keyword; falls back to a leading number; else 1.
const detectWeek = (fileName, maxWeeks) => {
  const name = fileName.replace(/\.[^.]+$/, ''); // drop extension
  const keyword =
    name.match(/(?:lecture|recitation|tirgul|exercise|homework|הרצאה|תרגול|תרגיל|שיעור|מטלה|בית|מס'?)\D{0,4}(\d{1,2})/i);
  let week = null;
  if (keyword) week = parseInt(keyword[1], 10);
  if (week == null) {
    const leading = name.match(/^\s*(\d{1,2})\b/);
    if (leading) week = parseInt(leading[1], 10);
  }
  if (week == null || Number.isNaN(week) || week < 1) week = 1;
  if (week > maxWeeks) week = maxWeeks;
  return week;
};

const defaultWeekTasks = (courseId, week) => [
  { id: `${courseId}-w${week}-lecture-0`, type: 'lecture', label: 'הרצאה', checked: false, files: [] },
  { id: `${courseId}-w${week}-tutorial-1`, type: 'tutorial', label: 'תרגול', checked: false, files: [] },
  { id: `${courseId}-w${week}-homework-2`, type: 'homework', label: 'שיעורי בית', checked: false, files: [] },
];

const listDirs = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);

const filesRecursive = (dir) => {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...filesRecursive(full));
    else if (!entry.name.toLowerCase().endsWith('.lnk')) out.push(full);
  }
  return out;
};

// --- main -----------------------------------------------------------------
async function run() {
  console.log(`Mode: ${COMMIT ? 'COMMIT (will upload + save)' : 'DRY RUN (no changes)'}\n`);

  const { data: rows, error } = await supabase.from('user_data').select('id, app_state');
  if (error || !rows?.length) {
    console.error('Could not load user_data:', error?.message || 'no rows');
    process.exit(1);
  }
  if (rows.length > 1) {
    console.error(`Found ${rows.length} users — refusing to guess. Edit the script to pick one.`);
    process.exit(1);
  }
  const userId = rows[0].id;
  const appState = rows[0].app_state;
  console.log(`User: ${userId}`);

  // Map local folder name -> course (by app_state course.name).
  const courseByName = new Map();
  for (const c of appState.courses || []) courseByName.set(c.name, c);

  appState.tasks ||= {};
  appState.globalTasks ||= {};

  let tsCounter = 0;
  let uploaded = 0;
  let linked = 0;
  let skipped = 0;
  const warnings = [];

  for (const courseFolder of listDirs(SOURCE_BASE)) {
    const course = courseByName.get(courseFolder);
    if (!course) {
      warnings.push(`No matching course for folder "${courseFolder}" — skipped`);
      continue;
    }
    const courseId = course.id;
    const maxWeeks = course.weeksCount || 13;
    console.log(`\n=== ${courseFolder}  ->  ${courseId} (max ${maxWeeks} weeks) ===`);

    const coursePath = path.join(SOURCE_BASE, courseFolder);
    for (const catFolder of listDirs(coursePath)) {
      const dest = classifyCategory(catFolder);
      if (!dest) {
        warnings.push(`[${courseId}] Unmapped category "${catFolder}" — skipped`);
        continue;
      }

      const catPath = path.join(coursePath, catFolder);
      for (const file of filesRecursive(catPath)) {
        const originalName = path.basename(file);

        // Resolve destination task + dedupe check.
        let week = null;
        let target; // the files array to push into, or null if already linked
        let label;
        if (dest.kind === 'weekly') {
          week = detectWeek(originalName, maxWeeks);
          appState.tasks[courseId] ||= {};
          if (!appState.tasks[courseId][week]) appState.tasks[courseId][week] = defaultWeekTasks(courseId, week);
          const taskId = `${courseId}-w${week}-${dest.suffix}`;
          let task = appState.tasks[courseId][week].find((t) => t.id === taskId);
          if (!task) {
            task = { id: taskId, type: dest.type, label: dest.type, checked: false, files: [] };
            appState.tasks[courseId][week].push(task);
          }
          task.files ||= [];
          if (task.files.some((f) => f.name === originalName)) {
            skipped++;
            continue;
          }
          target = task.files;
          label = `w${week} ${dest.type}`;
        } else {
          appState.globalTasks[courseId] ||= { past_exams: [], summaries: [], quizzes: [] };
          appState.globalTasks[courseId][dest.category] ||= [];
          const existing = appState.globalTasks[courseId][dest.category];
          if (existing.some((tk) => (tk.files || []).some((f) => f.name === originalName))) {
            skipped++;
            continue;
          }
          target = existing; // will push a whole task object
          label = dest.category;
        }

        // Build storage path matching the app's uploadFile scheme.
        const folder = dest.kind === 'weekly' ? `week_${week}` : dest.category;
        const storedName = `${Date.now() + tsCounter++}_${stringToHex(originalName)}`;
        const storagePath = `${userId}/${courseId}/${folder}/${storedName}`;
        const fileObj = { name: originalName, path: storagePath };

        console.log(`  + ${label}: ${originalName}`);

        if (COMMIT) {
          const { error: upErr } = await supabase.storage
            .from(BUCKET)
            .upload(storagePath, fs.readFileSync(file), {
              upsert: false,
              contentType: contentTypeFor(file),
              cacheControl: '3600',
            });
          if (upErr) {
            warnings.push(`[${courseId}] upload failed for ${originalName}: ${upErr.message}`);
            continue;
          }
        }
        uploaded++;

        if (dest.kind === 'weekly') {
          target.push(fileObj);
        } else {
          target.push({ id: `${Date.now() + tsCounter++}`, label: originalName, checked: false, files: [fileObj] });
        }
        linked++;
      }
    }
  }

  console.log('\n----------------------------------------');
  console.log(`Uploaded: ${uploaded} | Linked: ${linked} | Skipped (already linked): ${skipped}`);
  if (warnings.length) {
    console.log('\nWarnings:');
    warnings.forEach((w) => console.log('  ! ' + w));
  }

  if (!COMMIT) {
    console.log('\nDRY RUN complete. Re-run with --commit to upload and save.');
    return;
  }

  if (linked > 0) {
    const { error: saveErr } = await supabase
      .from('user_data')
      .update({ app_state: appState })
      .eq('id', userId);
    if (saveErr) {
      console.error('\nFailed to save app_state:', saveErr.message);
      process.exit(1);
    }
    console.log('\nSaved app_state. Refresh the app to see your files.');
  } else {
    console.log('\nNothing new to link.');
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
