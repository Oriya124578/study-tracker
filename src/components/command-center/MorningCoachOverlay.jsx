import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Sun, ArrowLeft, ArrowRight, Moon } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useTranslation } from '../../hooks/useTranslation';
import { cn } from '../../lib/utils';
import { parseISO, isValid, differenceInCalendarDays } from 'date-fns';

// Build the "day directive" string injected into context.dayProfile
const DAY_TYPES = (t) => [
  {
    key: 'regular',
    label: t('dayRegular'),
    directive: 'יום סטנדרטי — אזן בין לימודים, אימון וארוחות לפי ההעדפות הרגילות.',
  },
  {
    key: 'travel',
    label: t('dayTravel'),
    directive: 'היום כולל נסיעות מרובות — השאר חלונות מעבר.',
  },
  {
    key: 'light',
    label: t('dayLight'),
    directive: 'הקל על היום — פחות בלוקי לימוד, בלוקים קצרים יותר.',
  },
  {
    key: 'busy',
    label: t('dayBusy'),
    directive: 'יום עמוס — מקסם ניצול זמן, צפף בלוקים פרודוקטיביים.',
  },
  {
    key: 'custom',
    label: t('daySomethingElse'),
    directive: null, // free text
  },
];

const WORKOUT_OPTIONS = (t) => [
  { key: 'morning', label: t('workoutMorning'), directive: 'שבץ אימון בשעות הבוקר (07:00-10:00).' },
  { key: 'noon', label: t('workoutNoon'), directive: 'שבץ אימון בשעות הצהריים (12:00-15:00).' },
  { key: 'evening', label: t('workoutEvening'), directive: 'שבץ אימון בשעות הערב (18:00-21:00).' },
  { key: 'skip', label: t('workoutSkip'), directive: 'אין צורך באימון היום.' },
  { key: 'auto', label: t('workoutAuto'), directive: 'שבץ את האימון בזמן שאתה רואה לנכון.' },
];

// Hour-based greeting mirroring FocusHub.greetingText
const buildGreeting = (displayName, isRTL) => {
  const hour = new Date().getHours();
  let greet = '';
  if (isRTL) {
    if (hour < 12) greet = 'בוקר טוב';
    else if (hour < 17) greet = 'צהריים טובים';
    else if (hour < 21) greet = 'ערב טוב';
    else greet = 'לילה טוב';
    return displayName ? `${greet}, ${displayName}` : greet;
  }
  if (hour < 12) greet = 'Good morning';
  else if (hour < 17) greet = 'Good afternoon';
  else if (hour < 21) greet = 'Good evening';
  else greet = 'Good night';
  return displayName ? `${greet}, ${displayName}` : greet;
};

export const MorningCoachOverlay = ({
  isOpen,
  onSubmit,
  onDismissSession,
  onDismissToday,
  isShabbat,
  dateStr,
}) => {
  const { data } = useStore();
  const { t, language } = useTranslation();
  const isRTL = language === 'he';

  const [screen, setScreen] = useState(1); // 1 greeting, 2 day-type, 3 workout, 4 confirm
  const [selectedDayType, setSelectedDayType] = useState(null);
  const [customText, setCustomText] = useState('');
  const [selectedWorkout, setSelectedWorkout] = useState(null);

  // Reset state whenever overlay re-opens
  React.useEffect(() => {
    if (isOpen) {
      setScreen(1);
      setSelectedDayType(null);
      setCustomText('');
      setSelectedWorkout(null);
    }
  }, [isOpen]);

  const displayName = data?.profile?.displayName || '';
  const greeting = useMemo(() => buildGreeting(displayName, isRTL), [displayName, isRTL]);

  // Summary: # fixed events today + nearest upcoming exam
  const summaryLine = useMemo(() => {
    const eventsToday = (data?.events || []).filter(
      (ev) => ev.start && ev.start.startsWith(dateStr)
    ).length;

    // Mirror CommandCenterView pattern for upcoming exams
    let nearestExam = null;
    let nearestDays = Infinity;
    const now = new Date();
    (data?.courses || []).forEach((course) => {
      ['moedA', 'moedB', 'moedC'].forEach((moed) => {
        const examDate = course[moed] || course.exams?.[moed];
        if (!examDate) return;
        const dt = parseISO(examDate);
        if (!isValid(dt) || dt < now) return;
        const days = differenceInCalendarDays(dt, now);
        if (days < nearestDays) {
          nearestDays = days;
          nearestExam = { name: course.name, days };
        }
      });
    });

    const parts = [];
    if (isRTL) {
      parts.push(`${eventsToday} אירועים קבועים היום`);
      if (nearestExam) {
        parts.push(
          nearestExam.days === 0
            ? `מבחן ב${nearestExam.name} היום`
            : `המבחן הקרוב: ${nearestExam.name} בעוד ${nearestExam.days} ימים`
        );
      }
    } else {
      parts.push(`${eventsToday} fixed events today`);
      if (nearestExam) {
        parts.push(
          nearestExam.days === 0
            ? `Exam in ${nearestExam.name} today`
            : `Nearest exam: ${nearestExam.name} in ${nearestExam.days} days`
        );
      }
    }
    return parts.join(' • ');
  }, [data?.events, data?.courses, dateStr, isRTL]);

  const dayTypes = DAY_TYPES(t);
  const workoutOptions = WORKOUT_OPTIONS(t);

  const handleSubmit = () => {
    if (isShabbat) {
      onDismissSession?.();
      return;
    }

    const dayTypeObj = dayTypes.find((d) => d.key === selectedDayType);
    let dayProfile = '';
    if (dayTypeObj) {
      if (dayTypeObj.key === 'custom') {
        dayProfile = customText.trim();
      } else {
        dayProfile = dayTypeObj.directive;
      }
    }

    if (selectedWorkout) {
      const w = workoutOptions.find((o) => o.key === selectedWorkout);
      if (w?.directive) {
        dayProfile = dayProfile ? `${dayProfile} ${w.directive}` : w.directive;
      }
    }

    onSubmit?.(dayProfile || null);
  };

  // Selecting day-type advances to screen 3 (workout) inline
  const handleDayTypeSelect = (key) => {
    setSelectedDayType(key);
    if (key !== 'custom') {
      setScreen(3);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="mc-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onDismissSession}
        className="fixed inset-0 z-[120] bg-background/70 backdrop-blur-md flex items-end sm:items-center justify-center"
      >
        <motion.div
          key="mc-sheet"
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 60, opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          onClick={(e) => e.stopPropagation()}
          dir={isRTL ? 'rtl' : 'ltr'}
          className="w-full sm:max-w-md bg-card border border-border rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border/50">
            <div className="flex items-center gap-2">
              {isShabbat ? (
                <Moon className="w-5 h-5 text-primary" />
              ) : (
                <Sun className="w-5 h-5 text-amber-500" />
              )}
              <span className="text-sm font-bold text-foreground">
                {isShabbat ? t('shabbatShalom') : t('morningCoachGreeting')}
              </span>
            </div>
            <button
              onClick={onDismissSession}
              aria-label="Close"
              className="p-1.5 rounded-lg hover:bg-secondary transition-colors cursor-pointer"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {/* Greeting + summary (always shown) */}
            <div className="space-y-2">
              <h2 className="text-2xl font-black tracking-tight text-foreground">{greeting}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {isShabbat ? t('restToday') : t('morningCoachSummary')}
              </p>
              {summaryLine && !isShabbat && (
                <div className="mt-3 rounded-2xl border border-primary/15 bg-primary/5 p-3">
                  <p className="text-xs font-semibold text-foreground/80 leading-relaxed">
                    {summaryLine}
                  </p>
                </div>
              )}
            </div>

            {/* Shabbat variant — nothing else */}
            {isShabbat ? null : (
              <>
                {/* Screen 1: primary CTA + don't ask */}
                {screen === 1 && (
                  <div className="space-y-3 animate-in fade-in duration-200">
                    <button
                      onClick={() => setScreen(2)}
                      className="w-full py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4" />
                      {t('whatsToday')}
                      {isRTL ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={onDismissToday}
                      className="w-full text-xs text-muted-foreground hover:text-foreground py-2 cursor-pointer"
                    >
                      {t('dontAskAgain')}
                    </button>
                  </div>
                )}

                {/* Screen 2: day-type chips */}
                {screen >= 2 && (
                  <div className="space-y-3 animate-in fade-in duration-200">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      {t('whatsToday')}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {dayTypes.map((d) => (
                        <button
                          key={d.key}
                          onClick={() => handleDayTypeSelect(d.key)}
                          className={cn(
                            'px-3 py-1.5 rounded-full border text-[12px] font-bold transition-colors cursor-pointer active:scale-95',
                            selectedDayType === d.key
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-primary/20 bg-primary/5 text-primary hover:bg-primary/10'
                          )}
                        >
                          {d.label}
                        </button>
                      ))}
                    </div>

                    {selectedDayType === 'custom' && (
                      <div className="space-y-2 pt-1">
                        <textarea
                          value={customText}
                          onChange={(e) => setCustomText(e.target.value)}
                          placeholder={isRTL ? 'תאר את היום שלך…' : 'Describe your day…'}
                          rows={2}
                          className="w-full rounded-2xl border border-border bg-secondary/40 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary text-start resize-none"
                        />
                        <button
                          onClick={() => customText.trim() && setScreen(3)}
                          disabled={!customText.trim()}
                          className="w-full py-2 rounded-2xl bg-primary text-primary-foreground text-xs font-bold disabled:opacity-40 active:scale-[0.98] transition-all cursor-pointer"
                        >
                          {isRTL ? 'המשך' : 'Continue'}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Screen 3: workout chips (optional, skippable) */}
                {screen >= 3 && (
                  <div className="space-y-3 animate-in fade-in duration-200">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      {t('workoutWhen')}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {workoutOptions.map((o) => (
                        <button
                          key={o.key}
                          onClick={() => {
                            setSelectedWorkout(o.key);
                            setScreen(4);
                          }}
                          className={cn(
                            'px-3 py-1.5 rounded-full border text-[12px] font-bold transition-colors cursor-pointer active:scale-95',
                            selectedWorkout === o.key
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-primary/20 bg-primary/5 text-primary hover:bg-primary/10'
                          )}
                        >
                          {o.label}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setScreen(4)}
                      className="text-[11px] text-muted-foreground hover:text-foreground underline cursor-pointer"
                    >
                      {isRTL ? 'דלג' : 'Skip'}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer / CTA */}
          <div className="p-4 border-t border-border/50 bg-background/30">
            {isShabbat ? (
              <button
                onClick={onDismissSession}
                className="w-full py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 active:scale-[0.98] transition-all cursor-pointer"
              >
                {t('shabbatShalom')}
              </button>
            ) : screen === 4 ? (
              <button
                onClick={handleSubmit}
                className="w-full py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                {t('letsStart')}
              </button>
            ) : (
              <p className="text-center text-[11px] text-muted-foreground">
                {isRTL ? 'בחר את סוג היום כדי להמשיך' : 'Pick a day type to continue'}
              </p>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
