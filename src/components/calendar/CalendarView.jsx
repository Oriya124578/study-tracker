import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths, getDay } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

const WEEKDAYS = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];

export const CalendarView = () => {
  const { data } = useStore();
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get padding days for the start of the month (since week starts on Sunday = 0)
  const startDay = getDay(monthStart);
  const paddingDays = Array.from({ length: startDay }).map((_, i) => i);

  // Collect exams
  const exams = [];
  data?.courses?.forEach(course => {
    ['moedA', 'moedB', 'moedC'].forEach(moed => {
      if (course.exams && course.exams[moed]) {
        exams.push({
          date: new Date(course.exams[moed]),
          course: course.name,
          moed: moed === 'moedA' ? "מועד א'" : moed === 'moedB' ? "מועד ב'" : "מועד ג'"
        });
      }
    });
  });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24 md:pb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-6 border-b border-border">
          <div className="flex items-center gap-4">
            <button onClick={prevMonth} className="p-2 hover:bg-muted rounded-full transition-colors"><ChevronRight className="w-5 h-5"/></button>
            <CardTitle className="text-xl md:text-2xl min-w-[150px] text-center">
              {format(currentDate, 'MMMM yyyy')}
            </CardTitle>
            <button onClick={nextMonth} className="p-2 hover:bg-muted rounded-full transition-colors"><ChevronLeft className="w-5 h-5"/></button>
          </div>
          <button onClick={() => setCurrentDate(new Date())} className="text-sm font-medium text-primary hover:bg-primary/10 px-3 py-1.5 rounded-md transition-colors hidden md:block">
            היום
          </button>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-7 gap-1 md:gap-4 mb-2 text-center text-sm font-semibold text-muted-foreground">
            {WEEKDAYS.map(day => <div key={day}>{day}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1 md:gap-4">
            {paddingDays.map(i => <div key={`pad-${i}`} className="min-h-[80px] md:min-h-[120px]" />)}
            
            {days.map(day => {
              const dayExams = exams.filter(e => isSameDay(e.date, day));
              const isCurrDay = isToday(day);

              return (
                <div 
                  key={day.toString()} 
                  className={cn(
                    "min-h-[80px] md:min-h-[120px] p-1 md:p-2 border rounded-lg md:rounded-xl transition-all relative group",
                    isCurrDay ? "border-primary bg-primary/5 shadow-sm" : "border-border/50 hover:border-primary/30"
                  )}
                >
                  <span className={cn("text-sm md:text-base font-medium flex items-center justify-center w-6 h-6 md:w-8 md:h-8 rounded-full mx-auto md:mx-0 md:mb-2", isCurrDay && "bg-primary text-primary-foreground")}>
                    {format(day, 'd')}
                  </span>
                  
                  <div className="mt-1 flex flex-col gap-1 max-h-[80px] overflow-y-auto no-scrollbar">
                    {dayExams.map((exam, idx) => (
                      <div key={idx} className="bg-destructive/10 text-destructive text-[10px] md:text-xs font-bold px-1.5 md:px-2 py-0.5 md:py-1 rounded-md leading-tight truncate" title={`${exam.course} - ${exam.moed}`}>
                        <span className="hidden md:inline">{exam.course} - </span>
                        {exam.moed}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
