import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');

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

async function fixUpload() {
  const userId = 'b79a7ecc-7bf5-4ba9-a0f1-1a75449832c6';
  const courseId = 'infi2';
  
  // 1. Fetch current app_state
  const { data: userData } = await supabase.from('user_data').select('app_state').eq('id', userId).single();
  const appState = userData.app_state;
  
  // Let's do Week 1 Lecture
  const w1File = "C:\\Users\\turhv\\OneDrive\\שולחן העבודה\\Studies\\year 1\\semester 2\\אינפי 2\\הרצאות\\אינפי 2 הרצאה 1.pdf";
  const w1Buffer = fs.readFileSync(w1File);
  const w1Path = `${userId}/${courseId}/1/${Date.now()}_infi2_lec1.pdf`;
  
  await supabase.storage.from('course_files').upload(w1Path, w1Buffer, { contentType: 'application/pdf', upsert: true });
  const w1Url = supabase.storage.from('course_files').getPublicUrl(w1Path).data.publicUrl;
  
  appState.tasks[courseId]['1'][0].files = [{ name: "אינפי 2 הרצאה 1.pdf", url: w1Url, path: w1Path }];

  // Let's do Week 2 Lecture
  const w2File = "C:\\Users\\turhv\\OneDrive\\שולחן העבודה\\Studies\\year 1\\semester 2\\אינפי 2\\הרצאות\\אינפי 2 הרצאה 2.pdf";
  const w2Buffer = fs.readFileSync(w2File);
  const w2Path = `${userId}/${courseId}/2/${Date.now()}_infi2_lec2.pdf`;
  
  await supabase.storage.from('course_files').upload(w2Path, w2Buffer, { contentType: 'application/pdf', upsert: true });
  const w2Url = supabase.storage.from('course_files').getPublicUrl(w2Path).data.publicUrl;
  
  appState.tasks[courseId]['2'][0].files = [{ name: "אינפי 2 הרצאה 2.pdf", url: w2Url, path: w2Path }];

  // Let's do Week 3 Lecture
  const w3File = "C:\\Users\\turhv\\OneDrive\\שולחן העבודה\\Studies\\year 1\\semester 2\\אינפי 2\\הרצאות\\אינפי 2 הרצאה 3.pdf";
  const w3Buffer = fs.readFileSync(w3File);
  const w3Path = `${userId}/${courseId}/3/${Date.now()}_infi2_lec3.pdf`;
  
  await supabase.storage.from('course_files').upload(w3Path, w3Buffer, { contentType: 'application/pdf', upsert: true });
  const w3Url = supabase.storage.from('course_files').getPublicUrl(w3Path).data.publicUrl;
  
  appState.tasks[courseId]['3'][0].files = [{ name: "אינפי 2 הרצאה 3.pdf", url: w3Url, path: w3Path }];

  // Update DB
  await supabase.from('user_data').update({ app_state: appState }).eq('id', userId);
  console.log("Successfully uploaded lectures 1, 2, 3 manually to app_state with proper PDF content type.");
}
fixUpload();
