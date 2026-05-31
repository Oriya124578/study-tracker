import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useToast } from '../../store/useToast';

const ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

const STYLES = {
  success: 'border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-300',
  error: 'border-destructive/30 bg-destructive/10 text-destructive',
  info: 'border-primary/30 bg-primary/10 text-foreground',
};

export const Toaster = () => {
  const { toasts, dismiss } = useToast();

  return (
    <div
      className="fixed bottom-4 inset-x-4 z-[10000] flex flex-col items-center gap-2 pointer-events-none sm:items-end sm:inset-x-auto sm:end-4"
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map((t) => {
        const Icon = ICONS[t.type] || Info;
        return (
          <div
            key={t.id}
            role="status"
            className={`pointer-events-auto flex items-center gap-3 rounded-xl border px-4 py-3 shadow-lg backdrop-blur-sm max-w-sm w-full animate-in slide-in-from-bottom-2 fade-in ${STYLES[t.type] || STYLES.info}`}
          >
            <Icon className="w-5 h-5 shrink-0" />
            <span className="text-sm flex-1 text-start">{t.message}</span>
            <button
              onClick={() => dismiss(t.id)}
              className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
