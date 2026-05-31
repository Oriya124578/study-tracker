import React, { useState, useRef } from 'react';
import { supabase } from '../../supabaseClient';
import { BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useTranslation } from '../../hooks/useTranslation';
import { toast } from '../../store/useToast';

// Map Supabase error messages to generic, non-leaking user-facing keys.
const mapAuthError = (message = '') => {
  const m = message.toLowerCase();
  if (m.includes('invalid login') || m.includes('invalid credentials') || m.includes('user not found'))
    return 'invalidCredentials';
  if (m.includes('rate limit') || m.includes('too many'))
    return 'tooManyAttempts';
  return null; // use raw message as fallback
};

export const AuthView = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { t } = useTranslation();

  // Simple client-side rate limiter: disable the button for a few seconds after
  // a failed attempt to slow brute-force attempts.
  const cooldownUntil = useRef(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Date.now() < cooldownUntil.current) {
      setError(t('tooManyAttempts'));
      return;
    }
    // Client-side password strength check (signup only).
    if (!isLogin && password.length < 8) {
      setError(t('passwordTooWeak'));
      return;
    }
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
      const key = mapAuthError(err.message);
      setError(key ? t(key) : err.message);
      // After a failure, impose a short cooldown to slow down automated attacks.
      cooldownUntil.current = Date.now() + 3000;
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError(t('emailRequiredReset'));
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      toast.success(t('resetPasswordEmailSent'));
    } catch (err) {
      const key = mapAuthError(err.message);
      setError(key ? t(key) : err.message);
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
          <CardTitle className="text-2xl font-bold">{t('loginTitle')}</CardTitle>
          <CardDescription>
            {isLogin ? t('loginDesc') : t('registerDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4 text-start">
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg border border-destructive/20">
                {error}
              </div>
            )}
            
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">{t('email')}</label>
              <Input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                placeholder={t('emailPlaceholder')}
                dir="ltr"
                className="text-start h-11 md:h-10"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">{t('password')}</label>
              <Input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                placeholder={t('passwordPlaceholder')}
                dir="ltr"
                className="text-start h-11 md:h-10"
              />
            </div>

            <Button type="submit" className="w-full h-11 text-base mt-2" disabled={loading}>
              {loading ? t('loading') : (isLogin ? t('loginBtn') : t('registerBtn'))}
            </Button>
          </form>

          <div className="mt-6 flex flex-col gap-2">
            <Button variant="ghost" className="w-full" onClick={() => setIsLogin(!isLogin)} disabled={loading}>
              {isLogin ? t('noAccount') : t('hasAccount')}
            </Button>
            
            {isLogin && (
              <Button variant="link" className="w-full text-muted-foreground" onClick={handleResetPassword} disabled={loading}>
                {t('forgotPassword')}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
