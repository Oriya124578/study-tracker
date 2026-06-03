import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './lib/firebase';
import { useStore } from './store/useStore';
import { useTranslation } from './hooks/useTranslation';
import { Layout } from './components/layout/Layout';
import { AuthView } from './components/auth/AuthView';
import { OnboardingScreen } from './components/onboarding/OnboardingScreen';
import { BookOpen } from 'lucide-react';
import './index.css';

function App() {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  const {
    theme,
    language,
    hasCompletedOnboarding,
    dataLoaded,
    initFromAuth,
    cleanup,
  } = useStore();
  const { t } = useTranslation();

  // Firebase Auth listener. Drives subscribe/unsubscribe lifecycle on the store.
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoadingAuth(false);
      if (u) {
        initFromAuth(u.uid);
      } else {
        cleanup();
      }
    });
    return () => unsub();
    // initFromAuth/cleanup are stable Zustand actions; intentionally omitted
    // from deps so we don't accidentally re-subscribe.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Apply theme and language to <html>.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'en' ? 'ltr' : 'rtl';
  }, [language]);

  // --- Render ---------------------------------------------------------------

  if (loadingAuth) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <BookOpen className="w-12 h-12 text-primary" />
          <p className="text-muted-foreground font-medium">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthView />;
  }

  // Logged in but the first Firestore snapshot hasn't arrived yet.
  if (!dataLoaded) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <BookOpen className="w-12 h-12 text-primary animate-bounce" />
          <p className="text-muted-foreground font-medium">{t('loadingEnv')}</p>
        </div>
      </div>
    );
  }

  if (!hasCompletedOnboarding) {
    return <OnboardingScreen />;
  }

  return <Layout />;
}

export default App;
