import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';
import { BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

export const AuthView = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError('יש להזין אימייל כדי לשחזר סיסמה.');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      alert('נשלח מייל לאיפוס סיסמה!');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 animate-in fade-in duration-500">
      <Card className="w-full max-w-md shadow-xl border-primary/10">
        <CardHeader className="text-center space-y-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
            <BookOpen className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Study Tracker</CardTitle>
          <CardDescription>
            {isLogin ? 'התחבר כדי להמשיך לנהל את הלימודים שלך' : 'צור חשבון חדש והתחל ללמוד חכם'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4 text-right" dir="rtl">
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg border border-destructive/20">
                {error}
              </div>
            )}
            
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">אימייל</label>
              <Input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                placeholder="כתובת אימייל"
                dir="ltr"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">סיסמה</label>
              <Input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                placeholder="סיסמה (מינימום 6 תווים)"
                dir="ltr"
              />
            </div>

            <Button type="submit" className="w-full h-11 text-base mt-2" disabled={loading}>
              {loading ? 'טוען...' : (isLogin ? 'התחבר' : 'הרשם')}
            </Button>
          </form>

          <div className="mt-6 flex flex-col gap-2">
            <Button variant="ghost" className="w-full" onClick={() => setIsLogin(!isLogin)} disabled={loading}>
              {isLogin ? 'אין לך חשבון? הרשם עכשיו' : 'כבר יש לך חשבון? התחבר'}
            </Button>
            
            {isLogin && (
              <Button variant="link" className="w-full text-muted-foreground" onClick={handleResetPassword} disabled={loading}>
                שכחת סיסמה? שחזר כאן
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
