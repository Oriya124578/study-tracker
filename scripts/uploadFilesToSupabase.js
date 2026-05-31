import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Parse .env.local manually
const envPath = path.resolve('.env.local');
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

const SUPABASE_URL = envVars['VITE_SUPABASE_URL'];
const SUPABASE_SERVICE_ROLE_KEY = envVars['SUPABASE_SERVICE_ROLE_KEY'];

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const COURSES = [
  { id: 'infi2', localFolder: "אינפי 2" },
  { id: 'linear2', localFolder: "אלגברה לינארית 2" },
  { id: 'c_sys', localFolder: "תכנות בשפת C" },
  { id: 'data_structures', localFolder: "מבני נתונים" },
  { id: 'logic', localFolder: "לוגיקה ותורת הקבוצות" }
];

const SOURCE_BASE = "C:\\Users\\turhv\\OneDrive\\שולחן העבודה\\Studies\\year 1\\semester 2";

async function run() {
  console.log("Fetching users...");
  const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers();
  
  if (usersError || !usersData || usersData.users.length === 0) {
    console.error("Error fetching users, or no users found.", usersError);
    return;
  }
  
  const user = usersData.users[0]; // Assuming single user app
  const userId = user.id;
  console.log(`Uploading for User ID: ${userId}`);

  for (const course of COURSES) {
    const coursePath = path.join(SOURCE_BASE, course.localFolder);
    if (!fs.existsSync(coursePath)) {
      console.warn(`Path not found, skipping: ${coursePath}`);
      continue;
    }
    
    const files = getFilesRecursively(coursePath);
    console.log(`Found ${files.length} files for ${course.id}`);
    
    for (const file of files) {
      const relativePath = path.relative(coursePath, file);
      // Encode URI components to HEX to bypass Supabase Storage non-ASCII restrictions
      const hexEncodedPath = relativePath.split(path.sep).map(p => Buffer.from(p, 'utf8').toString('hex')).join('/');
      const remotePath = `${userId}/${course.id}/${hexEncodedPath}`;
      
      const fileBuffer = fs.readFileSync(file);
      
      console.log(`Uploading ${remotePath}...`);
      const { data, error } = await supabase.storage
        .from('course_files')
        .upload(remotePath, fileBuffer, {
          upsert: true
        });
        
      if (error) {
        console.error(`Error uploading ${remotePath}:`, error.message);
      } else {
        console.log(`Success: ${remotePath}`);
      }
    }
  }
  
  console.log("Upload script finished!");
}

function getFilesRecursively(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(getFilesRecursively(file));
    } else { 
      results.push(file);
    }
  });
  return results;
}

run();
