import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { format, startOfMonth, endOfMonth, startOfDay, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths, getDay, differenceInDays } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useTranslation } from '../../hooks/useTranslation';

const WEEKDAYS = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];
const WEEKDAYS_EN = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export const CalendarView = () => {
  const { data } = useStore();
  const { t, language } = useTranslation();
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
      const examDate = course[moed] || course.exams?.[moed];
      if (examDate) {
        exams.push({
          date: new Date(examDate),
          course: course.name,
          moed: t(moed)
        });
      }
    });
  });

  // Sort exams by date ascending
  exams.sort((a, b) => a.date - b.date);

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  return (
    <div className="p-3 sm:p-6 md:p-8 max-w-5xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
      
      {/* Upcoming Exams List - NOW ON TOP */}
      <Card className="border-primary/20 shadow-sm">
        <CardHeader className="bg-primary/5 border-b border-border/50">
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            {t('upcomingExams')}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-3">
            {exams.filter(e => differenceInDays(e.date, new Date()) >= -1).length === 0 ? (
              <p className="text-muted-foreground text-sm">{t('noUpcomingExams')}</p>
            ) : (
              exams
                .filter(e => differenceInDays(e.date, new Date()) >= -1)
                .map((exam, idx) => {
                  const daysLeft = differenceInDays(exam.date, new Date());
                  const isSoon = daysLeft <= 7 && daysLeft >= 0;
                  
                  return (
                    <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-border bg-card hover:border-primary/30 transition-colors gap-4">
                      <div>
                        <h4 className="font-bold text-lg text-foreground">{exam.course}</h4>
                        <p className="text-sm text-muted-foreground">{exam.moed} - {format(exam.date, 'dd/MM/yyyy')}</p>
                      </div>
                      <div className={cn(
                        "px-6 py-3 rounded-xl text-center self-start sm:self-auto",
                        daysLeft < 0 ? "bg-muted text-muted-foreground" :
                        isSoon ? "bg-destructive/10 text-destructive border border-destructive/20" : "bg-primary/10 text-primary border border-primary/20"
                      )}>
                        {daysLeft < 0 ? (
                          <span className="font-medium text-sm">{t('passed')}</span>
                        ) : daysLeft === 0 ? (
                          <span className="font-bold text-lg">{t('todayExclamation')}</span>
                        ) : (
                          <div className="flex flex-col items-center leading-none">
                            <span className="text-2xl font-bold">{daysLeft}</span>
                            <span className="text-xs font-medium opacity-80">{t('daysLabel')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Calendar Card - SECONDARY */}
      <Card className="opacity-90 hover:opacity-100 transition-opacity">
        <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-4">
            <button onClick={prevMonth} className="p-2 hover:bg-muted rounded-full transition-colors"><ChevronRight className="w-4 h-4"/></button>
            <CardTitle className="text-lg md:text-xl min-w-[120px] text-center">
              {format(currentDate, 'MMMM yyyy')}
            </CardTitle>
            <button onClick={nextMonth} className="p-2 hover:bg-muted rounded-full transition-colors"><ChevronLeft className="w-4 h-4"/></button>
          </div>
          <button onClick={() => setCurrentDate(new Date())} className="text-xs font-medium text-primary hover:bg-primary/10 px-2 py-1 rounded-md transition-colors hidden md:block">
            {t('today')}
          </button>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-2 text-center text-xs font-medium text-muted-foreground">
            {(language === 'en' ? WEEKDAYS_EN : WEEKDAYS).map((day, i) => <div key={i}>{day}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
            {paddingDays.map(i => <div key={`pad-${i}`} className="min-h-[40px] md:min-h-[80px]" />)}
            
            {days.map(day => {
              const dayExams = exams.filter(e => isSameDay(e.date, day));
              const isCurrDay = isToday(day);

              return (
                <div 
                  key={day.toString()} 
                  className={cn(
                    "min-h-[40px] md:min-h-[80px] p-0.5 sm:p-1 border rounded-md transition-all relative group flex flex-col items-center justify-start",
                    isCurrDay ? "border-primary bg-primary/5 shadow-sm" : "border-border/50 hover:border-primary/30"
                  )}
                >
                  <span className={cn("text-xs md:text-sm font-medium flex items-center justify-center w-5 h-5 rounded-full mb-1", isCurrDay && "bg-primary text-primary-foreground")}>
                    {format(day, 'd')}
                  </span>
                  
                  <div className="flex flex-col w-full gap-0.5 overflow-hidden">
                    {dayExams.map((exam, idx) => (
                      <div key={idx} className="bg-destructive/10 text-destructive text-[9px] font-bold px-1 py-0.5 rounded-sm leading-tight text-center truncate" title={`${exam.course} - ${exam.moed}`}>
                        {exam.course.substring(0, 5)}..
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
