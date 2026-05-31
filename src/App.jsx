import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from './supabaseClient';
import { debounce } from 'lodash';
import { useStore } from './store/useStore';
import { useTranslation } from './hooks/useTranslation';
import { Layout } from './components/layout/Layout';
import { AuthView } from './components/auth/AuthView';
import { generateInitialState } from './data';
import { BookOpen } from 'lucide-react';
import './index.css';

function App() {
  const [session, setSession] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);
  
  const { data, setData, theme, language } = useStore();
  const { t } = useTranslation();
  const initialLoadDone = useRef(false);

  // Authentication Listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoadingAuth(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        setDataLoaded(false);
        initialLoadDone.current = false;
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load Data on Login
  useEffect(() => {
    if (session && !initialLoadDone.current) {
      const loadData = async () => {
        try {
          const { data: userData, error } = await supabase
            .from('user_data')
            .select('app_state')
            .eq('id', session.user.id)
            .single();
          
          if (userData && userData.app_state && Object.keys(userData.app_state).length > 0) {
            // Check if it's the old state format (no courses array in state)
            // If so, we'll wipe it and start fresh as per migration plan.
            if (!userData.app_state.courses) {
              console.log("Old state detected. Wiping for migration...");
              const freshState = generateInitialState();
              await supabase.from('user_data').update({ app_state: freshState }).eq('id', session.user.id);
              setData(freshState);
            } else {
              setData(userData.app_state);
            }
          } else {
            // New user -> initialize state
            const initialState = generateInitialState();
            await supabase.from('user_data').insert([
              { id: session.user.id, app_state: initialState }
            ]);
            setData(initialState);
          }
        } catch (err) {
          console.error("Error loading data:", err);
          // Fallback
          setData(generateInitialState());
        } finally {
          setDataLoaded(true);
          initialLoadDone.current = true;
        }
      };
      loadData();
    }
  }, [session, setData]);

  // Debounced Save to Supabase
  const saveToSupabase = useCallback(
    debounce(async (userId, appData) => {
      try {
        await supabase
          .from('user_data')
          .update({ app_state: appData })
          .eq('id', userId);
      } catch (err) {
        console.error("Failed to save:", err);
      }
    }, 2000),
    []
  );

  // Trigger Save when data changes
  useEffect(() => {
    if (dataLoaded && session && initialLoadDone.current) {
      saveToSupabase(session.user.id, data);
    }
  }, [data, session, dataLoaded, saveToSupabase]);

  // Apply Theme and Language
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'en' ? 'ltr' : 'rtl';
  }, [language]);

  // Render Logic
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

  if (!session) {
    return <AuthView />;
  }

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

  return <Layout />;
}

export default App;
