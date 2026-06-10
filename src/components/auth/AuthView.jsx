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
    <div
      className="min-h-screen flex items-center justify-center p-4 animate-in fade-in duration-500"
      style={{ background: '#FAF7F2' }}
      dir="rtl"
    >
      <div
        className="w-full max-w-[360px] p-7 text-center"
        style={{
          background: '#FFFFFF',
          borderRadius: '22px',
          border: '1px solid rgba(180,140,80,.14)',
          boxShadow: '0 4px 24px rgba(40,20,0,.07)',
        }}
      >
        {/* Logo */}
        <div
          className="w-14 h-14 mx-auto mb-3 rounded-2xl flex items-center justify-center"
          style={{ background: '#065F46' }}
        >
          <img src="/logo.svg" alt="" className="w-9 h-9 object-contain brightness-0 invert" />
        </div>

        {/* Wordmark */}
        <div className="mb-1" dir="ltr">
          <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: '20px', color: '#2A1A0A' }}>
            calori
          </span>
          <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontWeight: 400, fontSize: '22px', color: '#059669' }}>
            {' '}life
          </span>
        </div>

        {/* Tagline */}
        <p className="text-sm mb-5" style={{ color: '#8A7A6A', fontFamily: "'Inter', sans-serif" }}>
          {isLogin ? t('loginDesc') : t('registerDesc')}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 text-start">
          {error && (
            <div className="text-sm p-3 rounded-xl" style={{ background: '#FEF2F2', color: '#DC2626', border: '1px solid rgba(220,38,38,.15)' }}>
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-medium" style={{ color: '#2A1A0A' }}>{t('email')}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder={t('emailPlaceholder')}
              dir="ltr"
              className="w-full h-11 px-4 text-sm outline-none transition-colors text-start"
              style={{
                background: '#FFFFFF',
                border: '1px solid rgba(180,140,80,.18)',
                borderRadius: '12px',
                color: '#2A1A0A',
              }}
              onFocus={(e) => e.target.style.borderColor = '#059669'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(180,140,80,.18)'}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium" style={{ color: '#2A1A0A' }}>{t('password')}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder={t('passwordPlaceholder')}
              dir="ltr"
              className="w-full h-11 px-4 text-sm outline-none transition-colors text-start"
              style={{
                background: '#FFFFFF',
                border: '1px solid rgba(180,140,80,.18)',
                borderRadius: '12px',
                color: '#2A1A0A',
              }}
              onFocus={(e) => e.target.style.borderColor = '#059669'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(180,140,80,.18)'}
            />
          </div>

          <button
            type="submit"
            disabled={anyLoading}
            className="w-full h-12 text-[15px] font-bold text-white rounded-[14px] transition-all active:scale-[0.98] disabled:opacity-60"
            style={{ background: '#059669', boxShadow: '0 4px 16px rgba(5,150,105,.28)' }}
          >
            {loading ? t('loading') : (isLogin ? t('loginBtn') : t('registerBtn'))}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full" style={{ borderTop: '1px solid rgba(180,140,80,.12)' }} />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-3 text-xs" style={{ background: '#FFFFFF', color: '#8A7A6A' }}>
              {t('orDivider')}
            </span>
          </div>
        </div>

        {/* Google Sign-In */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={anyLoading}
          className="w-full h-12 text-[15px] font-semibold rounded-[14px] flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-60"
          style={{ background: '#FFFFFF', border: '1px solid rgba(180,140,80,.18)', color: '#2A1A0A' }}
        >
          <GoogleIcon className="w-5 h-5" />
          {googleLoading ? t('loading') : t('signInWithGoogle')}
        </button>

        <div className="mt-5 flex flex-col gap-2">
          <button
            onClick={() => setIsLogin(!isLogin)}
            disabled={anyLoading}
            className="w-full text-sm font-semibold py-2 cursor-pointer"
            style={{ color: '#2A1A0A' }}
          >
            {isLogin ? t('noAccount') : t('hasAccount')}
          </button>

          {isLogin && (
            <button
              onClick={handleResetPassword}
              disabled={anyLoading}
              className="w-full text-sm py-1 cursor-pointer"
              style={{ color: '#8A7A6A' }}
            >
              {t('forgotPassword')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
