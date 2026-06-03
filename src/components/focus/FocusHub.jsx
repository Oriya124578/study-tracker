import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { PomodoroTimer } from '../pomodoro/PomodoroTimer';

export const FocusHub = () => {
  const { t, language } = useTranslation();
  const isRTL = language === 'he';

  return (
    <div 
      className="max-w-4xl mx-auto px-4 py-8 sm:px-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div>
        <h1 className="text-2xl font-black tracking-tight text-foreground">{t('navFocus', 'פוקוס')}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t('focusDesc', 'זמן להתרכז במשימות שלך ולעבוד בשיטת פומודורו')}
        </p>
      </div>

      <div className="bg-card border border-border rounded-2xl p-4 shadow-sm overflow-hidden relative">
        <PomodoroTimer inline={true} />
      </div>
    </div>
  );
};
