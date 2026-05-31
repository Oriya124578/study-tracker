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
  console.error("Could not read .env.local file.");
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
const SUPABASE_SERVICE_ROLE_KEY = envVars['SUPABASE_SERVICE_ROLE_KEY'] || envVars['VITE_SUPABASE_SERVICE_ROLE_KEY'];

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const COURSES = [
  { id: 'infi2', localFolder: "אינפי 2" },
  { id: 'linear2', localFolder: "אלגברה לינארית 2" },
  { id: 'c_sys', localFolder: "תכנות בשפת C" },
  { id: 'data_structures', localFolder: "מבני נתונים" },
  { id: 'logic', localFolder: "לוגיקה ותורת הקבוצות" }
];

const SOURCE_BASE = "C:\\Users\\turhv\\OneDrive\\שולחן העבודה\\Studies\\year 1\\semester 2";
const userId = 'b79a7ecc-7bf5-4ba9-a0f1-1a75449832c6';

async function run() {
  for (const course of COURSES) {
    const coursePath = path.join(SOURCE_BASE, course.localFolder);
    if (!fs.existsSync(coursePath)) continue;
    
    const files = getFilesRecursively(coursePath);
    console.log(`Found ${files.length} files for ${course.id}`);
    
    for (const file of files) {
      const relativePath = path.relative(coursePath, file);
      const hexEncodedPath = relativePath.split(path.sep).map(p => Buffer.from(p, 'utf8').toString('hex')).join('/');
      const remotePath = `${userId}/${course.id}/${hexEncodedPath}`;
      
      const fileBuffer = fs.readFileSync(file);
      
      let contentType = 'application/octet-stream';
      if (file.toLowerCase().endsWith('.pdf')) {
        contentType = 'application/pdf';
      } else if (file.toLowerCase().endsWith('.png')) {
        contentType = 'image/png';
      } else if (file.toLowerCase().endsWith('.jpg') || file.toLowerCase().endsWith('.jpeg')) {
        contentType = 'image/jpeg';
      }
      
      console.log(`Uploading ${remotePath} with contentType ${contentType}...`);
      const { error } = await supabase.storage
        .from('course_files')
        .upload(remotePath, fileBuffer, {
          upsert: true,
          contentType: contentType
        });
        
      if (error) {
        console.error(`Error uploading ${remotePath}:`, error.message);
      }
    }
  }
  
  console.log("Upload script finished! Now running link script...");
  await linkFiles();
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

// LINK FILES LOGIC
async function linkFiles() {
  const { data: userData, error: userError } = await supabase.from('user_data').select('app_state').eq('id', userId).single();
  if (userError || !userData) return;

  const appState = userData.app_state;
  const { data: coursesData, error: coursesError } = await supabase.storage.from('course_files').list(userId, { limit: 100 });
  if (coursesError || !coursesData) return;

  let updated = false;

  for (const courseObj of coursesData) {
    if (courseObj.id === null && courseObj.name) {
      const courseId = courseObj.name;
      const { data: categoriesData } = await supabase.storage.from('course_files').list(`${userId}/${courseId}`, { limit: 100 });
      if (!categoriesData) continue;

      for (const catObj of categoriesData) {
        if (catObj.id === null && catObj.name) {
          const hexCat = catObj.name;
          const categoryName = Buffer.from(hexCat, 'hex').toString('utf8');
          
          const { data: filesData } = await supabase.storage.from('course_files').list(`${userId}/${courseId}/${hexCat}`, { limit: 500 });
          if (!filesData) continue;

          for (const fileObj of filesData) {
            if (fileObj.name === '.emptyFolderPlaceholder') continue;
            
            const hexFile = fileObj.name;
            const fileName = Buffer.from(hexFile, 'hex').toString('utf8');
            
            let weekMatch = fileName.match(/(\d+)\.pdf$/);
            if (!weekMatch) weekMatch = fileName.match(/(?:הרצאה|תרגול|בית|מס|מס')\s*(\d+)/i) || fileName.match(/\b(\d+)\b/);
            
            let week = 1;
            if (weekMatch) week = parseInt(weekMatch[1], 10);

            const courseInState = appState.courses?.find(c => c.id === courseId);
            if (!courseInState) continue;
            const maxWeeks = courseInState.weeksCount || 13;
            if (week > maxWeeks) week = maxWeeks;

            let taskSuffix = '';
            if (categoryName.includes('הרצא')) taskSuffix = 'lecture-0';
            else if (categoryName.includes('תרגו')) taskSuffix = 'tutorial-1';
            else if (categoryName.includes('בית')) taskSuffix = 'homework-2';
            else continue;

            const taskId = `${courseId}-w${week}-${taskSuffix}`;
            const storagePath = `${userId}/${courseId}/${hexCat}/${hexFile}`;
            const { data: { publicUrl } } = supabase.storage.from('course_files').getPublicUrl(storagePath);
            
            const newFileObj = { name: fileName, url: publicUrl, path: storagePath };

            if (!appState.tasks[courseId]) appState.tasks[courseId] = {};
            if (!appState.tasks[courseId][week]) {
              appState.tasks[courseId][week] = [
                { id: `${courseId}-w${week}-lecture-0`, type: 'lecture', label: 'הרצאה', checked: false, files: [] },
                { id: `${courseId}-w${week}-tutorial-1`, type: 'tutorial', label: 'תרגול', checked: false, files: [] },
                { id: `${courseId}-w${week}-homework-2`, type: 'homework', label: 'שיעורי בית', checked: false, files: [] }
              ];
            }

            const weekTasks = appState.tasks[courseId][week];
            const task = weekTasks.find(t => t.id === taskId);
            
            if (task) {
              if (!task.files) task.files = [];
              if (!task.files.find(f => f.name === fileName)) {
                task.files.push(newFileObj);
                console.log(`Linked ${fileName} to ${taskId}`);
                updated = true;
              }
            }
          }
        }
      }
    }
  }

  if (updated) {
    await supabase.from('user_data').update({ app_state: appState }).eq('id', userId);
    console.log("Saved linked files to app_state.");
  }
}

run();
