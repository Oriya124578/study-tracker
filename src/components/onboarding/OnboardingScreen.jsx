import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';
import { useTranslation } from '../../hooks/useTranslation';
import { useStore } from '../../store/useStore';
import { DEFAULT_COURSES } from '../../data';
import confetti from 'canvas-confetti';
import { BookOpen, User, Calendar, CheckCircle2, ChevronRight, ChevronLeft, ArrowRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { toast } from '../../store/useToast';

export const OnboardingScreen = () => {
  const { t } = useTranslation();
  const { language, completeOnboarding } = useStore();
  const isRtl = language !== 'en';
  
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  
  // Form State
  const [displayName, setDisplayName] = useState('');
  const [academicYear, setAcademicYear] = useState(language === 'en' ? 'Year 1' : 'שנה א\'');
  const [semester, setSemester] = useState(language === 'en' ? 'Semester A' : 'סמסטר א\'');
  const [selectedCourseIds, setSelectedCourseIds] = useState(
    DEFAULT_COURSES.slice(0, 3).map(c => c.id) // pre-select some
  );

  const toggleCourse = (id) => {
    setSelectedCourseIds(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const nextStep = () => {
    if (step < 4) {
      setDirection(1);
      setStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setDirection(-1);
      setStep(prev => prev - 1);
    }
  };

  const handleFinish = () => {
    if (selectedCourseIds.length === 0) return; // shouldn't happen (button disabled)

    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#4ade80', '#3b82f6', '#f43f5e', '#fbbf24']
    });

    // Map IDs to actual course objects
    const selectedCourses = DEFAULT_COURSES.filter(c => selectedCourseIds.includes(c.id));

    setTimeout(() => {
      try {
        completeOnboarding({ displayName: (displayName || '').trim(), academicYear, semester }, selectedCourses);
      } catch (err) {
        console.error('Onboarding failed', err);
        toast.error(t('saveError'));
      }
    }, 1000);
  };

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? (isRtl ? -1000 : 1000) : (isRtl ? 1000 : -1000),
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? (isRtl ? -1000 : 1000) : (isRtl ? 1000 : -1000),
      opacity: 0
    })
  };

  const renderStepIndicator = () => (
    <div className="flex justify-center gap-2 mb-12">
      {[1, 2, 3, 4].map(s => (
        <div 
          key={s} 
          className={cn(
            "h-2 rounded-full transition-all duration-300",
            s === step ? "w-8 bg-primary" : (s < step ? "w-4 bg-primary/50" : "w-4 bg-primary/20")
          )}
        />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden flex flex-col relative" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-blue-500/5 blur-[100px]" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10 w-full max-w-2xl mx-auto">
        {renderStepIndicator()}
        
        <div className="w-full relative h-[400px] flex items-center justify-center">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            
            {/* STEP 1: NAME */}
            {step === 1 && (
              <motion.div
                key="step1"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="w-full flex flex-col items-center text-center space-y-8"
              >
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <User className="w-10 h-10 text-primary" />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold mb-2">
                    {t('welcomeTo')} <span className="text-primary">Study Tracker</span>
                  </h1>
                  <p className="text-muted-foreground text-lg">
                    {t('onboardingDesc')}
                  </p>
                </div>
                
                <div className="w-full max-w-sm space-y-4 text-start">
                  <label className="text-sm font-semibold">{t('whatsYourName')}</label>
                  <Input 
                    value={displayName} 
                    onChange={e => setDisplayName(e.target.value)} 
                    placeholder={t('namePlaceholder')}
                    className="h-14 text-lg px-4 bg-background/50 backdrop-blur-sm border-primary/20 focus-visible:ring-primary"
                    autoFocus
                    onKeyDown={e => { if (e.key === 'Enter' && displayName.trim()) nextStep() }}
                  />
                  <p className="text-xs text-muted-foreground">{t('whatsYourNameDesc')}</p>
                </div>
                
                <Button 
                  size="lg" 
                  className="w-full max-w-sm h-12 text-lg rounded-full" 
                  disabled={!displayName.trim()} 
                  onClick={nextStep}
                >
                  {t('nextStep')}
                </Button>
              </motion.div>
            )}

            {/* STEP 2: SEMESTER */}
            {step === 2 && (
              <motion.div
                key="step2"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="w-full flex flex-col items-center text-center space-y-8"
              >
                <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mb-4">
                  <Calendar className="w-10 h-10 text-blue-500" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold mb-2">{t('academicPeriod')}</h2>
                  <p className="text-muted-foreground text-lg">{t('academicPeriodDesc')}</p>
                </div>
                
                <div className="w-full max-w-sm space-y-6 text-start">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">{t('academicYear')}</label>
                    <select 
                      value={academicYear}
                      onChange={e => setAcademicYear(e.target.value)}
                      className="flex h-14 w-full rounded-xl border border-input bg-background/50 backdrop-blur-sm px-4 py-2 text-lg ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      {['שנה א\'', 'שנה ב\'', 'שנה ג\'', 'שנה ד\''].map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">{t('semester')}</label>
                    <select 
                      value={semester}
                      onChange={e => setSemester(e.target.value)}
                      className="flex h-14 w-full rounded-xl border border-input bg-background/50 backdrop-blur-sm px-4 py-2 text-lg ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      {['סמסטר א\'', 'סמסטר ב\'', 'סמסטר קיץ'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                
                <div className="flex gap-4 w-full max-w-sm">
                  <Button variant="outline" size="lg" className="flex-1 h-12 rounded-full" onClick={prevStep}>
                    {isRtl ? <ChevronRight className="w-5 h-5 ml-2" /> : <ChevronLeft className="w-5 h-5 mr-2" />}
                    {t('cancel', 'חזור')}
                  </Button>
                  <Button size="lg" className="flex-1 h-12 rounded-full" onClick={nextStep}>
                    {t('nextStep')}
                  </Button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: COURSES */}
            {step === 3 && (
              <motion.div
                key="step3"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="w-full h-full flex flex-col space-y-6"
              >
                <div className="text-center">
                  <h2 className="text-3xl font-bold mb-2">{t('courseSelection')}</h2>
                  <p className="text-muted-foreground">{t('courseSelectionDesc')}</p>
                </div>
                
                <div className="flex-1 overflow-y-auto pr-2 pb-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {DEFAULT_COURSES.map(course => {
                      const isSelected = selectedCourseIds.includes(course.id);
                      return (
                        <div 
                          key={course.id}
                          onClick={() => toggleCourse(course.id)}
                          className={cn(
                            "p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 flex items-center justify-between",
                            isSelected 
                              ? "border-primary bg-primary/5 shadow-sm shadow-primary/10 scale-[1.02]" 
                              : "border-border bg-card hover:border-primary/50 hover:bg-primary/5"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <BookOpen className={cn("w-5 h-5", isSelected ? "text-primary" : "text-muted-foreground")} />
                            <span className="font-medium text-lg">{course.name}</span>
                          </div>
                          <div className={cn(
                            "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                            isSelected ? "border-primary bg-primary" : "border-muted-foreground/30"
                          )}>
                            {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
                
                <div className="flex gap-4 w-full">
                  <Button variant="outline" size="lg" className="flex-1 h-12 rounded-full" onClick={prevStep}>
                    {isRtl ? <ChevronRight className="w-5 h-5 ml-2" /> : <ChevronLeft className="w-5 h-5 mr-2" />}
                    {t('cancel', 'חזור')}
                  </Button>
                  <Button size="lg" className="flex-1 h-12 rounded-full" disabled={selectedCourseIds.length === 0} onClick={nextStep}>
                    {t('nextStep')}
                  </Button>
                </div>
              </motion.div>
            )}

            {/* STEP 4: FINISH */}
            {step === 4 && (
              <motion.div
                key="step4"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="w-full flex flex-col items-center text-center space-y-8"
              >
                <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-12 h-12 text-green-500" />
                </div>
                <div>
                  <h2 className="text-4xl font-bold mb-4">{t('allReady')}</h2>
                  <p className="text-muted-foreground text-lg max-w-md mx-auto">
                    {t('allReadyDesc')}
                  </p>
                </div>
                
                <Button 
                  size="lg" 
                  className="w-full max-w-sm h-14 text-xl rounded-full mt-8 animate-bounce shadow-lg shadow-primary/25" 
                  onClick={handleFinish}
                >
                  {t('letsGo')}
                  {isRtl ? <ArrowRight className="w-5 h-5 mr-2 rotate-180" /> : <ArrowRight className="w-5 h-5 ml-2" />}
                </Button>
                
                <Button variant="ghost" className="mt-4 text-muted-foreground" onClick={prevStep}>
                  {t('cancel', 'חזור לבחירת קורסים')}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
