import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { useStore } from '../../store/useStore';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Clock, Calendar as CalendarIcon, CheckCircle, ExternalLink, Play } from 'lucide-react';
import { differenceInDays } from 'date-fns';

export const SmartDashboard = () => {
  const { data, activeCourse, setActiveCourse, setActiveCategory, setPomodoro } = useStore();

  // 1. Weekly Progress Calculation
  const progressStats = useMemo(() => {
    let totalTasks = 0;
    let completedTasks = 0;

    data.courses.forEach(course => {
      // Assuming current week is 1 for simulation. In reality, you'd calculate current week per course based on start date.
      // We will calculate progress across all weeks for now, or just the first few weeks if it's early semester.
      // Let's do a global progress of all tasks.
      Object.values(data.tasks[course.id] || {}).forEach(weekTasks => {
        weekTasks.forEach(task => {
          totalTasks++;
          if (task.checked) completedTasks++;
        });
      });
    });

    const percentage = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
    return { totalTasks, completedTasks, percentage };
  }, [data]);

  // 2. Full Exam Board (Sorted)
  const upcomingExams = useMemo(() => {
    const exams = [];
    data.courses.forEach(course => {
      ['moedA', 'moedB', 'moedC'].forEach(moed => {
        if (course[moed]) {
          const date = new Date(course[moed]);
          const daysLeft = differenceInDays(date, new Date());
          if (daysLeft >= 0) {
            exams.push({ course, moed, date, daysLeft });
          }
        }
      });
    });
    return exams.sort((a, b) => a.daysLeft - b.daysLeft);
  }, [data.courses]);

  // 3. Pomodoro Chart Data
  const chartData = useMemo(() => {
    // Basic aggregation by course
    const agg = {};
    (data.pomodoroSessions || []).forEach(session => {
      const c = data.courses.find(c => c.id === session.courseId);
      if (c) {
        agg[c.name] = (agg[c.name] || 0) + (session.duration / 60); // minutes
      }
    });
    return Object.keys(agg).map(name => ({ name, minutes: Math.round(agg[name]) }));
  }, [data]);

  // 4. Quick Links
  const activeCourses = data.courses.slice(0, 4); // Quick access to top 4 courses

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Top Row: Progress */}
      <div className="grid grid-cols-1 gap-6">
        
        {/* Progress Card */}
        <Card className="shadow-sm border-primary/20 bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-primary" />
              התקדמות סמסטר
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-4">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="currentColor" strokeWidth="8" className="text-muted" />
                  <circle 
                    cx="50" cy="50" r="40" fill="transparent" 
                    stroke="currentColor" strokeWidth="8" 
                    strokeDasharray="251.2" 
                    strokeDashoffset={251.2 - (251.2 * progressStats.percentage) / 100}
                    className="text-primary transition-all duration-1000 ease-out" 
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-bold">{progressStats.percentage}%</span>
                  <span className="text-xs text-muted-foreground">{progressStats.completedTasks}/{progressStats.totalTasks} משימות</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Links & Actions */}
        {/* Removed Quick Links as requested */}
      </div>

      {/* Middle Row: Exam Board and Pomodoro Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Full Exam Board */}
        <Card className="shadow-sm border-border bg-card flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-primary" />
              לוח מבחנים מלא
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
            {upcomingExams.length > 0 ? (
              <div className="space-y-3">
                {upcomingExams.map((exam, i) => (
                  <div key={i} className={`p-4 rounded-xl border flex items-center justify-between ${
                    exam.daysLeft <= 14 ? 'border-destructive/30 bg-destructive/5' : 
                    exam.daysLeft <= 30 ? 'border-primary/30 bg-primary/5' : 'border-border bg-background'
                  }`}>
                    <div>
                      <h4 className="font-bold text-foreground">{exam.course.name}</h4>
                      <p className="text-sm text-muted-foreground">מועד {exam.moed.replace('moed', '')} • {exam.date.toLocaleDateString('he-IL')}</p>
                    </div>
                    <div className={`text-center px-4 py-2 rounded-lg ${
                      exam.daysLeft <= 14 ? 'bg-destructive/10 text-destructive font-bold' : 
                      exam.daysLeft <= 30 ? 'bg-primary/10 text-primary font-semibold' : 'bg-secondary text-secondary-foreground'
                    }`}>
                      <div className="text-xl">{exam.daysLeft}</div>
                      <div className="text-xs">ימים</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground py-8">
                <CalendarIcon className="w-12 h-12 mb-2 opacity-20" />
                <p>אין מבחנים קרובים, איזה כיף!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pomodoro Chart */}
        <Card className="shadow-sm border-border bg-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              שעות למידה (פומודורו)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <div className="h-[300px] w-full mt-4" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <XAxis 
                      dataKey="name" 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                    <Tooltip 
                      cursor={{ fill: 'hsl(var(--secondary))' }}
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                      itemStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Bar dataKey="minutes" name="דקות למידה" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={`hsl(${94 + (index * 15)} 21% 62%)`} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground">
                <Clock className="w-12 h-12 mb-2 opacity-20" />
                <p>עוד לא התחלת ללמוד עם הפומודורו.</p>
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

function BookIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </svg>
  );
}
