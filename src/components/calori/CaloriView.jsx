import React, { useEffect } from 'react';
import {
  ChevronLeft, ChevronRight, UtensilsCrossed, Dumbbell, Flame,
  Clock, Award, Beef, Wheat, Droplet,
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useTranslation } from '../../hooks/useTranslation';
import { cn } from '../../lib/utils';
import { dateKey } from '../../lib/caloriRepo';
import { format, parseISO, isToday, isYesterday, isValid, addDays, subDays } from 'date-fns';

// Nutrition = green (#059669) · Fitness = purple (#7C3AED) — per DESIGN_SYSTEM.

// ── Macro pill ───────────────────────────────────────────────────────────────

const MacroPill = ({ icon: Icon, label, value, unit, color }) => (
  <div className="flex flex-col items-center gap-1 flex-1">
    <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center', color)}>
      <Icon className="w-4 h-4 text-white" />
    </div>
    <span className="text-sm font-bold text-foreground">{value}{unit}</span>
    <span className="text-[10px] text-muted-foreground">{label}</span>
  </div>
);

// ── Meal row (green lineage) ─────────────────────────────────────────────────

const MealRow = ({ meal, t }) => {
  let time = '';
  if (meal.timestamp) {
    const dt = parseISO(meal.timestamp);
    if (isValid(dt)) time = format(dt, 'HH:mm');
  }
  const catLabel = t(`mealCat_${meal.category}`, meal.category);

  return (
    <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#059669] text-white shadow-sm">
      {meal.imageUrl ? (
        <img src={meal.imageUrl} alt="" className="w-11 h-11 rounded-xl object-cover shrink-0" />
      ) : (
        <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
          <UtensilsCrossed className="w-5 h-5" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm truncate">{meal.name}</p>
        <p className="text-xs text-white/80">
          {catLabel}{time && ` · ${time}`}
          {meal.weightGrams ? ` · ${meal.weightGrams}${t('gramsShort')}` : ''}
        </p>
      </div>
      <div className="text-end shrink-0">
        <p className="font-extrabold text-sm">{meal.calories}</p>
        <p className="text-[10px] text-white/80">{t('caloriCalories')}</p>
      </div>
    </div>
  );
};

// ── Workout row (purple lineage) ─────────────────────────────────────────────

const WorkoutRow = ({ workout, t }) => {
  let time = '';
  if (workout.timestamp) {
    const dt = parseISO(workout.timestamp);
    if (isValid(dt)) time = format(dt, 'HH:mm');
  }

  return (
    <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#7C3AED] text-white shadow-sm">
      <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
        <Dumbbell className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm truncate">{workout.name}</p>
        <p className="text-xs text-white/80">
          {workout.durationMinutes} {t('caloriMinutes')}
          {time && ` · ${time}`}
          {workout.exercisesCount > 0 ? ` · ${workout.exercisesCount} 🏋️` : ''}
        </p>
      </div>
      <div className="text-end shrink-0">
        <p className="font-extrabold text-sm">{workout.caloriesBurned}</p>
        <p className="text-[10px] text-white/80">{t('caloriBurned')}</p>
      </div>
    </div>
  );
};

// ── Main view ────────────────────────────────────────────────────────────────

export const CaloriView = () => {
  const { data, caloriDate, setCaloriDate } = useStore();
  const { t, language } = useTranslation();
  const isRTL = language === 'he';

  const { meals = [], workouts = [], dayHistory } = data?.calori || {};

  // Ensure today's listener is live the first time the tab opens.
  useEffect(() => {
    if (!caloriDate) setCaloriDate(dateKey());
  }, [caloriDate, setCaloriDate]);

  // Guard against the first render where caloriDate may not be set yet —
  // parseISO(undefined) would produce an Invalid Date.
  if (!caloriDate) return null;

  const parsed = parseISO(caloriDate);
  const selected = isValid(parsed) ? parsed : new Date();
  const dateLabel = isToday(selected)
    ? t('caloriToday')
    : isYesterday(selected)
    ? t('caloriYesterday')
    : format(selected, 'EEEE, d MMM');

  const goPrev = () => setCaloriDate(dateKey(subDays(selected, 1)));
  const goNext = () => {
    const next = addDays(selected, 1);
    if (next <= new Date()) setCaloriDate(dateKey(next));
  };
  const atToday = isToday(selected);

  // Totals — sum the LIVE meal/workout docs first (these stream in real-time via
  // onSnapshot, so they update during the day). The daily_history aggregate is
  // written in arrears, so we only use it as a fallback when no live docs exist
  // (e.g. viewing a past day) and for nutrition_score (not derivable from meals).
  const hasMeals    = meals.length > 0;
  const hasWorkouts = workouts.length > 0;

  const totalCalories = hasMeals ? meals.reduce((s, m) => s + (m.calories || 0), 0) : (dayHistory?.calories ?? 0);
  const totalProtein  = hasMeals ? meals.reduce((s, m) => s + (m.protein  || 0), 0) : (dayHistory?.protein  ?? 0);
  const totalCarbs    = hasMeals ? meals.reduce((s, m) => s + (m.carbs    || 0), 0) : (dayHistory?.carbs    ?? 0);
  const totalFats     = hasMeals ? meals.reduce((s, m) => s + (m.fats     || 0), 0) : (dayHistory?.fats     ?? 0);
  const burned        = hasWorkouts ? workouts.reduce((s, w) => s + (w.caloriesBurned  || 0), 0) : (dayHistory?.workout_calories ?? 0);
  const workoutMin    = hasWorkouts ? workouts.reduce((s, w) => s + (w.durationMinutes || 0), 0) : (dayHistory?.workout_minutes  ?? 0);
  const nutritionScore = dayHistory?.nutrition_score;

  const PrevIcon = isRTL ? ChevronRight : ChevronLeft;
  const NextIcon = isRTL ? ChevronLeft : ChevronRight;

  const hasData = meals.length > 0 || workouts.length > 0 || dayHistory;

  return (
    <div
      className="max-w-2xl mx-auto w-full px-4 py-4 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-400"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* ── Date navigator ── */}
      <div className="flex items-center justify-between rounded-2xl border border-border bg-card px-2 py-1.5 shadow-sm">
        <button
          onClick={goPrev}
          aria-label={t('caloriPrevDay', isRTL ? 'יום קודם' : 'Previous day')}
          className="w-9 h-9 rounded-full flex items-center justify-center text-foreground hover:bg-muted active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <PrevIcon className="w-5 h-5" />
        </button>
        <h2 className="text-base font-bold text-foreground">{dateLabel}</h2>
        <button
          onClick={goNext}
          disabled={atToday}
          aria-label={t('caloriNextDay', isRTL ? 'יום הבא' : 'Next day')}
          className="w-9 h-9 rounded-full flex items-center justify-center text-foreground hover:bg-muted active:scale-95 transition-all disabled:opacity-30 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <NextIcon className="w-5 h-5" />
        </button>
      </div>

      {/* ── Daily summary card ── */}
      <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-bold text-foreground">{t('caloriDaySummary')}</span>
          {nutritionScore != null && (
            <span className="flex items-center gap-1 text-xs font-bold text-[#059669] bg-[#D1FAE5] dark:bg-[#059669]/20 px-2 py-1 rounded-full">
              <Award className="w-3.5 h-3.5" />
              {nutritionScore}
            </span>
          )}
        </div>

        {/* Big calories number */}
        <div className="flex items-end gap-2 mb-4">
          <span className="text-4xl font-extrabold text-foreground leading-none">{totalCalories}</span>
          <span className="text-sm text-muted-foreground mb-1">{t('caloriEatenLabel')} · {t('caloriCalories')}</span>
          {burned > 0 && (
            <span className="flex items-center gap-1 text-sm font-bold text-[#7C3AED] mb-1 ms-auto">
              <Flame className="w-4 h-4" />
              -{burned}
            </span>
          )}
        </div>

        {/* Macro pills */}
        <div className="flex gap-2 pt-3 border-t border-border">
          <MacroPill icon={Beef}    label={t('caloriProtein')} value={totalProtein} unit="g" color="bg-[#059669]" />
          <MacroPill icon={Wheat}   label={t('caloriCarbs')}   value={totalCarbs}   unit="g" color="bg-amber-500" />
          <MacroPill icon={Droplet} label={t('caloriFats')}    value={totalFats}    unit="g" color="bg-rose-500" />
          {workoutMin > 0 && (
            <MacroPill icon={Clock} label={t('caloriMinutes')} value={workoutMin} unit="" color="bg-[#7C3AED]" />
          )}
        </div>
      </div>

      {/* ── Empty state ── */}
      {!hasData && (
        <div className="py-16 text-center text-muted-foreground text-sm">
          <div className="text-4xl mb-3">🍽️</div>
          {t('caloriNoData')}
        </div>
      )}

      {/* ── Meals (green) ── */}
      {meals.length > 0 && (
        <section className="space-y-2">
          <div className="flex items-center gap-2 px-1">
            <UtensilsCrossed className="w-4 h-4 text-[#059669]" />
            <h3 className="text-sm font-bold text-foreground">{t('caloriMeals')}</h3>
            <span className="text-xs text-muted-foreground">({meals.length})</span>
          </div>
          {meals.map((m) => <MealRow key={m.id} meal={m} t={t} />)}
        </section>
      )}

      {/* ── Workouts (purple) ── */}
      {workouts.length > 0 && (
        <section className="space-y-2">
          <div className="flex items-center gap-2 px-1">
            <Dumbbell className="w-4 h-4 text-[#7C3AED]" />
            <h3 className="text-sm font-bold text-foreground">{t('caloriWorkouts')}</h3>
            <span className="text-xs text-muted-foreground">({workouts.length})</span>
          </div>
          {workouts.map((w) => <WorkoutRow key={w.id} workout={w} t={t} />)}
        </section>
      )}

      {/* Read-only hint */}
      {hasData && (
        <p className="text-center text-[11px] text-muted-foreground pt-2 pb-4">
          {t('caloriOpenApp')}
        </p>
      )}
    </div>
  );
};
