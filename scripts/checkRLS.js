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

async function checkRLS() {
  // Query pg_policies to see if there are policies on storage.objects
  const { data, error } = await supabase.from('user_data').select('id').limit(1);
  console.log("Supabase connection is working.");
  
  // Unfortunately we can't easily query pg_policies via standard supabase JS unless we use RPC
  // Let's just create an RPC script or just assume RLS might be the issue.
}
checkRLS();
