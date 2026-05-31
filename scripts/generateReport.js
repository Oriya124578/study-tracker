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
  if (match) envVars[match[1].trim()] = match[2].trim();
});

const SUPABASE_URL = envVars['VITE_SUPABASE_URL'];
const SUPABASE_SERVICE_ROLE_KEY = envVars['SUPABASE_SERVICE_ROLE_KEY'] || envVars['VITE_SUPABASE_SERVICE_ROLE_KEY'];
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const userId = 'b79a7ecc-7bf5-4ba9-a0f1-1a75449832c6';

async function generateReport() {
  const { data: userData, error: userError } = await supabase.from('user_data').select('app_state').eq('id', userId).single();
  if (userError || !userData) {
    console.error("Error fetching data");
    return;
  }

  const appState = userData.app_state;
  const courses = appState.courses || [];
  
  let report = `# Semester 2 Status Report\n\n`;

  for (const course of courses) {
    report += `## ${course.name} (${course.id})\n`;
    report += `Max Weeks: ${course.weeksCount || 13}\n\n`;
    
    const tasks = appState.tasks[course.id] || {};
    let missingStats = { lectures: [], tutorials: [], homeworks: [] };
    
    // We expect weeks 1 to 12 (or 13)
    const maxWeeks = Math.min(course.weeksCount || 13, 13);
    report += `| Week | Lecture | Tutorial | Homework |\n`;
    report += `|------|---------|----------|----------|\n`;
    
    for (let w = 1; w <= maxWeeks; w++) {
      const weekTasks = tasks[w] || [];
      const hasLecture = weekTasks.some(t => t.type === 'lecture' && t.files && t.files.length > 0);
      const hasTutorial = weekTasks.some(t => t.type === 'tutorial' && t.files && t.files.length > 0);
      const hasHomework = weekTasks.some(t => t.type === 'homework' && t.files && t.files.length > 0);
      
      const lMark = hasLecture ? '✅' : '❌';
      const tMark = hasTutorial ? '✅' : '❌';
      const hMark = hasHomework ? '✅' : '❌';
      
      if (!hasLecture) missingStats.lectures.push(w);
      if (!hasTutorial) missingStats.tutorials.push(w);
      if (!hasHomework) missingStats.homeworks.push(w);
      
      report += `| ${w} | ${lMark} | ${tMark} | ${hMark} |\n`;
    }
    
    report += `\n**Missing Overview:**\n`;
    if (missingStats.lectures.length > 0) report += `- **Lectures Missing:** Weeks ${missingStats.lectures.join(', ')}\n`;
    else report += `- **Lectures Missing:** None 🎉\n`;
    
    if (missingStats.tutorials.length > 0) report += `- **Tutorials Missing:** Weeks ${missingStats.tutorials.join(', ')}\n`;
    else report += `- **Tutorials Missing:** None 🎉\n`;
    
    if (missingStats.homeworks.length > 0) report += `- **Homework Missing:** Weeks ${missingStats.homeworks.join(', ')}\n`;
    else report += `- **Homework Missing:** None 🎉\n`;
    
    report += `\n---\n\n`;
  }

  fs.writeFileSync('semester_report.md', report);
  console.log("Report generated successfully at semester_report.md");
}

generateReport();
