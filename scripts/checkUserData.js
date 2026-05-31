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

async function checkUserData() {
  const userId = 'b79a7ecc-7bf5-4ba9-a0f1-1a75449832c6';
  const { data: userData } = await supabase.from('user_data').select('app_state').eq('id', userId).single();
  
  const w1Tasks = userData.app_state.tasks['infi2']['1'];
  console.log("Week 1 Lectures:", JSON.stringify(w1Tasks.find(t => t.id === 'infi2-w1-lecture-0'), null, 2));
}
checkUserData();
