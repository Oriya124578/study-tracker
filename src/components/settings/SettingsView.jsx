import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { supabase } from '../../supabaseClient';
import { LogOut, RotateCcw, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';

export const SettingsView = () => {
  const { resetSemester } = useStore();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleReset = () => {
    resetSemester();
    setShowResetConfirm(false);
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 3000);
  };

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24 md:pb-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">הגדרות האתר</h1>
        <p className="text-muted-foreground mt-1">ניהול חשבון, מראה ואיפוס סמסטר</p>
      </div>

      {resetSuccess && (
        <div className="bg-primary/10 border border-primary/20 text-primary p-4 rounded-xl flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5" />
          <span>הסמסטר אופס בהצלחה! כל המטלות וההערות נוקו. בהצלחה בסמסטר החדש!</span>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>אזור סכנה ⚠️</CardTitle>
          <CardDescription>פעולות אלו משפיעות על הנתונים שלך ואינן ניתנות לביטול.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border border-border rounded-lg bg-muted/10">
            <div>
              <h3 className="font-semibold text-foreground">איפוס סמסטר (Reset Semester)</h3>
              <p className="text-sm text-muted-foreground">מוחק את כל הסימונים, המשימות, ההערות והפומודורו, אך שומר את הקורסים והלינקים. מומלץ בתחילת סמסטר חדש.</p>
            </div>
            <Button variant="destructive" onClick={() => setShowResetConfirm(true)} className="whitespace-nowrap flex items-center gap-2">
              <RotateCcw className="w-4 h-4" /> אפס סמסטר
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>חשבון משתמש</CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="secondary" onClick={handleLogout} className="flex items-center gap-2">
            <LogOut className="w-4 h-4" /> התנתק מהחשבון
          </Button>
        </CardContent>
      </Card>

      {/* Modal Confirm */}
      <Dialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" /> האם אתה בטוח?
            </DialogTitle>
            <DialogDescription>
              פעולה זו תמחק את כל ההתקדמות שלך בסמסטר הנוכחי (הסימונים במטלות, ההערות שכתבת, ונתוני הפומודורו). הקורסים עצמם והלינקים יישמרו. הפעולה בלתי הפיכה!
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowResetConfirm(false)}>ביטול</Button>
            <Button variant="destructive" onClick={handleReset}>כן, אפס סמסטר</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
