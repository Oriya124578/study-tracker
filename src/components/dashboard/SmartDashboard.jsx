import React, { useMemo } from 'react';
import { useStore } from '../../store/useStore';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { differenceInDays, format, subDays, startOfDay } from 'date-fns';
import { Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

// Generate colors for courses
const COURSE_COLORS = ['#A3B18A', '#D4A373', '#718096', '#F6AD55', '#4FD1C5', '#FC8181'];

export const SmartDashboard = () => {
  const { data } = useStore();

  const urgentExams = useMemo(() => {
    const exams = [];
    const now = new Date();
    data?.courses?.forEach(course => {
      ['moedA', 'moedB', 'moedC'].forEach(moed => {
        if (course.exams && course.exams[moed]) {
          const examDate = new Date(course.exams[moed]);
          const days = differenceInDays(examDate, now);
          if (days >= 0 && days <= 30) {
            exams.push({ course: course.name, moed, date: examDate, days });
          }
        }
      });
    });
    return exams.sort((a, b) => a.days - b.days);
  }, [data?.courses]);

  const pomodoroStats = useMemo(() => {
    // Generate last 7 days data
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const d = startOfDay(subDays(new Date(), 6 - i));
      return {
        date: d,
        displayDate: format(d, 'EE'), // Mon, Tue, etc.
        totalMinutes: 0,
        courses: {}
      };
    });

    if (data?.pomodoroSessions) {
      data.pomodoroSessions.forEach(session => {
        const sessionDate = startOfDay(new Date(session.date));
        const dayEntry = last7Days.find(d => d.date.getTime() === sessionDate.getTime());
        if (dayEntry) {
          dayEntry.totalMinutes += session.minutes;
          if (!dayEntry.courses[session.courseId]) {
            dayEntry.courses[session.courseId] = 0;
          }
          dayEntry.courses[session.courseId] += session.minutes;
        }
      });
    }

    // Convert to recharts format
    return last7Days.map(day => {
      const entry = { name: day.displayDate };
      data?.courses?.forEach(course => {
        entry[course.name] = (day.courses[course.id] || 0) / 60; // In hours
      });
      return entry;
    });
  }, [data?.pomodoroSessions, data?.courses]);

  return (
    <div className="p-6 pb-24 md:pb-6 space-y-6 max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-3xl font-bold text-foreground mb-8">היי, ברוך שובך! 👋</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pomodoro Chart */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary"/> שעות למידה (שבוע אחרון)
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pomodoroStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{fill: '#767068', fontSize: 12}} axisLine={false} tickLine={false} />
                <YAxis tick={{fill: '#767068', fontSize: 12}} axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: 'rgba(0,0,0,0.05)'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                {data?.courses?.map((course, idx) => (
                  <Bar key={course.id} dataKey={course.name} stackId="a" fill={COURSE_COLORS[idx % COURSE_COLORS.length]} radius={[4, 4, 0, 0]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Urgent Exams */}
        <Card className="bg-destructive/5 border-destructive/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5"/> מבחנים קרובים
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {urgentExams.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground flex flex-col items-center gap-2">
                <CheckCircle2 className="w-8 h-8 text-primary/50" />
                <p>אין מבחנים ב-30 הימים הקרובים.</p>
                <p>אפשר לנשום לרווחה!</p>
              </div>
            ) : (
              urgentExams.map((exam, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-background border border-border/50 shadow-sm">
                  <div>
                    <h4 className="font-semibold text-sm">{exam.course}</h4>
                    <p className="text-xs text-muted-foreground">
                      {exam.moed === 'moedA' ? "מועד א'" : exam.moed === 'moedB' ? "מועד ב'" : "מועד ג'"} • {format(exam.date, 'dd/MM/yyyy')}
                    </p>
                  </div>
                  <div className="text-center bg-destructive/10 text-destructive px-3 py-1 rounded-md">
                    <span className="block text-lg font-bold leading-none">{exam.days}</span>
                    <span className="text-[10px] uppercase font-bold tracking-wider">ימים</span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
