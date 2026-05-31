import React from 'react';
import { useStore } from '../../store/useStore';
import { Loader2 } from 'lucide-react';

export const GlobalLoadingOverlay = () => {
  const { isUploading } = useStore();

  if (!isUploading) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-200">
      <div className="bg-card p-6 rounded-2xl shadow-xl flex flex-col items-center gap-4 border border-border">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-lg font-medium text-foreground">מעלה קובץ... אנא המתן</p>
      </div>
    </div>
  );
};
