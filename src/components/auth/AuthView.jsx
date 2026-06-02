import React, { useState, useRef } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithPopup,
} from 'firebase/auth';
import { auth, googleProvider } from '../../lib/firebase';
import { BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useTranslation } from '../../hooks/useTranslation';
import { toast } from '../../store/useToast';

// Map Firebase auth error codes to generic, non-leaking user-facing keys.
const mapAuthError = (code = '') => {
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'invalidCredentials';
    case 'auth/too-many-requests':
      return 'tooManyAttempts';
    case 'auth/email-already-in-use':
      return 'emailInUse';
    case 'auth/weak-password':
      return 'passwordTooWeak';
    default:
      return null;
  }
};

// Inline Google "G" logo (brand colors) — used to avoid an extra dependency.
const GoogleIcon = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
  </svg>
);

export const AuthView = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
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
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      const key = mapAuthError(err.code);
      setError(key ? t(key) : (err.message || String(err)));
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
      await sendPasswordResetEmail(auth, email);
      toast.success(t('resetPasswordEmailSent'));
    } catch (err) {
      const key = mapAuthError(err.code);
      setError(key ? t(key) : (err.message || String(err)));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      const key = mapAuthError(err.code);
      setError(key ? t(key) : (err.message || String(err)));
    } finally {
      setGoogleLoading(false);
    }
  };

  const anyLoading = loading || googleLoading;

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

            <Button type="submit" className="w-full h-11 text-base mt-2" disabled={anyLoading}>
              {loading ? t('loading') : (isLogin ? t('loginBtn') : t('registerBtn'))}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                {t('orDivider')}
              </span>
            </div>
          </div>

          {/* Google Sign-In */}
          <Button
            type="button"
            variant="outline"
            className="w-full h-11 text-base flex items-center justify-center gap-2"
            onClick={handleGoogleSignIn}
            disabled={anyLoading}
          >
            <GoogleIcon className="w-5 h-5" />
            {googleLoading ? t('loading') : t('signInWithGoogle')}
          </Button>

          <div className="mt-6 flex flex-col gap-2">
            <Button variant="ghost" className="w-full" onClick={() => setIsLogin(!isLogin)} disabled={anyLoading}>
              {isLogin ? t('noAccount') : t('hasAccount')}
            </Button>

            {isLogin && (
              <Button variant="link" className="w-full text-muted-foreground" onClick={handleResetPassword} disabled={anyLoading}>
                {t('forgotPassword')}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
