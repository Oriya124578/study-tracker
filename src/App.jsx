import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './lib/firebase';
import { useStore } from './store/useStore';
import { useTranslation } from './hooks/useTranslation';
import { Layout } from './components/layout/Layout';
import { AuthView } from './components/auth/AuthView';
import { OnboardingScreen } from './components/onboarding/OnboardingScreen';
import { BrandedLoadingScreen } from './components/system/BrandedLoadingScreen';
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
  }, [initFromAuth, cleanup]);

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
    return <BrandedLoadingScreen />;
  }

  if (!user) {
    return <AuthView />;
  }

  // Logged in but the first Firestore snapshot hasn't arrived yet.
  if (!dataLoaded) {
    return <BrandedLoadingScreen />;
  }

  if (!hasCompletedOnboarding) {
    return <OnboardingScreen />;
  }

  return <Layout />;
}

export default App;
