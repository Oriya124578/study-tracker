import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, '../.env.local');
let envContent = '';
try {
  envContent = fs.readFileSync(envPath, 'utf-8');
} catch (e) {
  console.error("Could not read .env.local file. Please make sure it exists.");
  process.exit(1);
}

const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    envVars[match[1].trim()] = match[2].trim();
  }
});

const supabaseUrl = envVars['VITE_SUPABASE_URL'];
const supabaseKey = envVars['SUPABASE_SERVICE_ROLE_KEY'] || envVars['VITE_SUPABASE_SERVICE_ROLE_KEY'];

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Exams data from data.js
const defaultExams = {
  infi2: { moedA: "2026-07-03T09:00:00", moedB: "2026-08-06T09:45:00", moedC: null },
  linear2: { moedA: "2026-07-27T09:45:00", moedB: "2026-08-27T09:45:00", moedC: null },
  physics1: { moedA: "2026-07-14T09:45:00", moedB: "2026-08-17T09:45:00", moedC: null },
  c_programming: { moedA: "2026-07-09T09:45:00", moedB: "2026-08-12T09:45:00", moedC: null },
  logic: { moedA: "2026-07-19T09:45:00", moedB: "2026-08-20T09:45:00", moedC: null }
};

async function updateExams() {
  const userId = 'b79a7ecc-7bf5-4ba9-a0f1-1a75449832c6';
  console.log(`Updating exams for user: ${userId}`);
  
  const { data: userData, error } = await supabase
    .from('user_data')
    .select('app_state')
    .eq('id', userId)
    .single();

  if (error || !userData) {
    console.error('Error fetching user data', error);
    process.exit(1);
  }

  const appState = userData.app_state;
  let updated = false;

  if (appState && appState.courses) {
    appState.courses = appState.courses.map(course => {
      const exams = defaultExams[course.id];
      if (exams) {
        updated = true;
        return {
          ...course,
          moedA: exams.moedA,
          moedB: exams.moedB,
          moedC: exams.moedC
        };
      }
      return course;
    });
  }

  if (updated) {
    const { error: updateError } = await supabase
      .from('user_data')
      .update({ app_state: appState })
      .eq('id', userId);

    if (updateError) {
      console.error('Failed to update app_state', updateError);
    } else {
      console.log('Successfully updated exams in user state!');
    }
  } else {
    console.log('No courses to update.');
  }
}

updateExams();
