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
  console.error("No env");
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

const supabase = createClient(supabaseUrl, supabaseKey);

async function linkFiles() {
  const userId = 'b79a7ecc-7bf5-4ba9-a0f1-1a75449832c6';
  
  // 1. Fetch user data
  const { data: userData, error: userError } = await supabase
    .from('user_data')
    .select('app_state')
    .eq('id', userId)
    .single();

  if (userError || !userData) {
    console.error("Error fetching user", userError);
    return;
  }

  const appState = userData.app_state;

  // 2. We need to iterate over all files in the bucket for this user
  // The structure is course_files/userId/courseId/hexCategory/hexFile
  
  const { data: coursesData, error: coursesError } = await supabase.storage.from('course_files').list(userId, { limit: 100 });
  if (coursesError || !coursesData) {
    console.error("Error listing courses in storage", coursesError);
    return;
  }

  let updated = false;

  for (const courseObj of coursesData) {
    if (courseObj.id === null && courseObj.name) {
      const courseId = courseObj.name; // e.g. infi2
      
      const { data: categoriesData } = await supabase.storage.from('course_files').list(`${userId}/${courseId}`, { limit: 100 });
      if (!categoriesData) continue;

      for (const catObj of categoriesData) {
        if (catObj.id === null && catObj.name) {
          const hexCat = catObj.name;
          const categoryName = Buffer.from(hexCat, 'hex').toString('utf8'); // e.g. "הרצאות", "תרגולים"
          
          const { data: filesData } = await supabase.storage.from('course_files').list(`${userId}/${courseId}/${hexCat}`, { limit: 500 });
          if (!filesData) continue;

          for (const fileObj of filesData) {
            if (fileObj.name === '.emptyFolderPlaceholder') continue;
            
            const hexFile = fileObj.name;
            const fileName = Buffer.from(hexFile, 'hex').toString('utf8');
            
            // Determine week number from file name
            // Files look like: "אינפי 2 הרצאה 1.pdf" or "אלגברה לינארית 2 תרגול 4.pdf" or "תרגיל בית 3.pdf"
            let weekMatch = fileName.match(/(\d+)\.pdf$/);
            if (!weekMatch) {
              // Try to find any standalone number before .pdf
              weekMatch = fileName.match(/(?:הרצאה|תרגול|בית|מס|מס')\s*(\d+)/i) || fileName.match(/\b(\d+)\b/);
            }
            
            let week = 1;
            if (weekMatch) {
              week = parseInt(weekMatch[1], 10);
            } else {
              console.log(`Could not find week for ${fileName}, defaulting to 1`);
            }

            // Fallback for weeks out of bounds
            const courseInState = appState.courses?.find(c => c.id === courseId);
            if (!courseInState) continue;
            const maxWeeks = courseInState.weeksCount || 13;
            if (week > maxWeeks) week = maxWeeks;

            // Determine task ID prefix based on category
            let taskSuffix = '';
            if (categoryName.includes('הרצא')) taskSuffix = 'lecture-0';
            else if (categoryName.includes('תרגו')) taskSuffix = 'tutorial-1';
            else if (categoryName.includes('בית')) taskSuffix = 'homework-2';
            else continue; // Unknown category

            const taskId = `${courseId}-w${week}-${taskSuffix}`;
            
            const storagePath = `${userId}/${courseId}/${hexCat}/${hexFile}`;
            const { data: { publicUrl } } = supabase.storage.from('course_files').getPublicUrl(storagePath);
            
            const newFileObj = {
              name: fileName,
              url: publicUrl,
              path: storagePath
            };

            // Inject into app_state
            if (!appState.tasks[courseId]) appState.tasks[courseId] = {};
            if (!appState.tasks[courseId][week]) {
              // Initialize week if missing
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
              // Prevent duplicates
              if (!task.files.find(f => f.name === fileName)) {
                task.files.push(newFileObj);
                console.log(`Added ${fileName} to ${taskId}`);
                updated = true;
              }
            }
          }
        }
      }
    }
  }

  if (updated) {
    const { error: updateError } = await supabase
      .from('user_data')
      .update({ app_state: appState })
      .eq('id', userId);
      
    if (updateError) {
      console.error("Failed to save to Supabase", updateError);
    } else {
      console.log("Successfully linked all files in app_state!");
    }
  } else {
    console.log("No new files to link.");
  }
}

linkFiles();
