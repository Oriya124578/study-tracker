import React from 'react';
import { UtensilsCrossed, Dumbbell, Flame, ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useTranslation } from '../../hooks/useTranslation';
import { cn } from '../../lib/utils';

// Compact "my day" calori card for the dashboard. Tapping it opens the
// full Calori tab. Shows today's eaten calories, macros, and workout burn.
export const CaloriSummaryCard = () => {
  const { data, setActiveCategory } = useStore();
  const { t, language } = useTranslation();
  const isRTL = language === 'he';

  const { meals = [], workouts = [], dayHistory } = data?.calori || {};

  // Sum the LIVE docs first (real-time during the day); daily_history is the
  // arrears fallback for past days only.
  const hasMeals    = meals.length > 0;
  const hasWorkouts = workouts.length > 0;

  const totalCalories = hasMeals ? meals.reduce((s, m) => s + m.calories, 0) : (dayHistory?.calories ?? 0);
  const totalProtein  = hasMeals ? meals.reduce((s, m) => s + m.protein, 0)  : (dayHistory?.protein  ?? 0);
  const totalCarbs    = hasMeals ? meals.reduce((s, m) => s + m.carbs, 0)    : (dayHistory?.carbs    ?? 0);
  const totalFats     = hasMeals ? meals.reduce((s, m) => s + m.fats, 0)     : (dayHistory?.fats     ?? 0);
  const burned        = hasWorkouts ? workouts.reduce((s, w) => s + w.caloriesBurned, 0) : (dayHistory?.workout_calories ?? 0);
  const mealCount     = hasMeals    ? meals.length    : (dayHistory?.meals_count   ?? 0);
  const workoutCount  = hasWorkouts ? workouts.length : (dayHistory?.workout_count ?? 0);

  const hasData = totalCalories > 0 || mealCount > 0 || workoutCount > 0 || dayHistory;
  const Chevron = isRTL ? ChevronLeft : ChevronRight;

  return (
    <button
      onClick={() => setActiveCategory('calori')}
      className="w-full text-start rounded-2xl border border-border bg-card p-4 shadow-sm hover:border-[#059669]/40 hover:shadow-md active:scale-[0.99] transition-all"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#D1FAE5] dark:bg-[#059669]/20 flex items-center justify-center">
            <UtensilsCrossed className="w-4 h-4 text-[#059669]" />
          </div>
          <span className="text-sm font-bold text-foreground">{t('caloriTitle')}</span>
        </div>
        <Chevron className="w-4 h-4 text-muted-foreground/50" />
      </div>

      {hasData ? (
        <>
          {/* Big number + burn */}
          <div className="flex items-end gap-2 mb-3">
            <span className="text-3xl font-extrabold text-foreground leading-none">{totalCalories}</span>
            <span className="text-xs text-muted-foreground mb-0.5">{t('caloriEatenLabel')}</span>
            {burned > 0 && (
              <span className="flex items-center gap-0.5 text-xs font-bold text-[#7C3AED] mb-0.5 ms-auto">
                <Flame className="w-3.5 h-3.5" />-{burned}
              </span>
            )}
          </div>

          {/* Macro chips */}
          <div className="flex items-center gap-3 text-xs">
            <span className="text-[#059669] font-semibold">P {totalProtein}g</span>
            <span className="text-amber-500 font-semibold">C {totalCarbs}g</span>
            <span className="text-rose-500 font-semibold">F {totalFats}g</span>
            <div className="ms-auto flex items-center gap-3 text-muted-foreground">
              {mealCount > 0 && (
                <span className="flex items-center gap-1">
                  <UtensilsCrossed className="w-3.5 h-3.5" />{mealCount}
                </span>
              )}
              {workoutCount > 0 && (
                <span className="flex items-center gap-1">
                  <Dumbbell className="w-3.5 h-3.5" />{workoutCount}
                </span>
              )}
            </div>
          </div>
        </>
      ) : (
        <p className="text-sm text-muted-foreground py-2">{t('caloriNoData')}</p>
      )}
    </button>
  );
};
