
import React, { useState, useEffect, lazy, Suspense } from 'react';
import Navigation from './components/Navigation';
import Login from './components/Login';
import { User } from './types';
import { MOCK_SYSTEM_USERS } from './constants';

import { supabase } from './supabase';
import { getCurrentUserProfile, signOut } from './services/supabaseService';

// Lazy load all route components for code splitting
import Assemblies from './components/Assemblies';
const Dashboard = lazy(() => import('./components/Dashboard'));
const Building = lazy(() => import('./components/Building'));
const Fractions = lazy(() => import('./components/Fractions'));
const Finance = lazy(() => import('./components/Finance'));
const Maintenance = lazy(() => import('./components/Maintenance'));
// const Assemblies = lazy(() => import('./components/Assemblies'));
const LegalAssistant = lazy(() => import('./components/LegalAssistant'));
const Occurrences = lazy(() => import('./components/Occurrences'));
const CommonAreas = lazy(() => import('./components/CommonAreas'));
const Security = lazy(() => import('./components/Security'));
const StaffManager = lazy(() => import('./components/StaffManager'));
const UsersManager = lazy(() => import('./components/UsersManager'));

const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('seo-gestao-theme');
    if (saved) return saved as 'light' | 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  //   const [systemUsers, setSystemUsers] = useState<User[]>(() => {
  //     const saved = localStorage.getItem('condogest_users');
  //     return saved ? JSON.parse(saved) : MOCK_SYSTEM_USERS;
  //   });

  useEffect(() => {
    let isMounted = true;
    console.log('App: Auth useEffect mounted');

    // Verificar sessão atual
    console.log('App: Checking current session...');
    getCurrentUserProfile().then(profile => {
      if (isMounted) {
        console.log('App: Initial profile loaded:', profile?.email);
        setUser(profile);
      }
    });

    // Ouvir mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('App: Auth state change:', event, session?.user?.email);
      if (event === 'SIGNED_IN') {
        const profile = await getCurrentUserProfile(session?.user);
        if (isMounted) {
          console.log('App: Profile updated after SIGNED_IN:', profile?.email);
          setUser(profile);
        }
      } else if (event === 'SIGNED_OUT') {
        if (isMounted) {
          console.log('App: User signed out');
          setUser(null);
          setCurrentTab('dashboard');
        }
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
    localStorage.setItem('seo-gestao-theme', theme);
  }, [theme]);

  //   useEffect(() => {
  //     localStorage.setItem('condogest_users', JSON.stringify(systemUsers));
  //   }, [systemUsers]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleLogout = async () => {
    await signOut(); // O listener vai limpar o estado
  };

  const renderContent = () => {
    if (!user) return null;

    try {
      switch (currentTab) {
        case 'dashboard': return <Dashboard />;
        case 'building': return <Building />;
        case 'fractions': return <Fractions user={user} />;
        case 'users': return (
          <UsersManager
            user={user}
          />
        );
        case 'finance': return <Finance user={user} />;
        case 'reservations': return <CommonAreas user={user} />;
        case 'maintenance': return <Maintenance user={user} />;
        case 'security': return <Security user={user} />;
        case 'staff': return <StaffManager user={user} />;
        case 'occurrences': return <Occurrences />;
        case 'assemblies': return <Assemblies user={user} />;
        case 'ai-legal': return <LegalAssistant />;
        default: return <Dashboard />;
      }
    } catch (err) {
      console.error('App: Error rendering tab:', currentTab, err);
      return (
        <div className="p-10 bg-rose-50 border border-rose-200 rounded-3xl text-rose-800">
          <h2 className="text-xl font-bold mb-2">Erro ao carregar componente</h2>
          <p className="text-sm">Ocorreu um erro ao carregar a página <strong>{currentTab}</strong>. Verifique a consola para mais detalhes.</p>
          <button onClick={() => setCurrentTab('dashboard')} className="mt-4 px-4 py-2 bg-rose-600 text-white rounded-xl font-bold">Voltar ao Painel</button>
        </div>
      );
    }
  };

  if (!user) {
    return <Login onLogin={() => { }} />;
  }

  console.log('App: Rendering. currentTab:', currentTab, 'user:', !!user);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row font-sans selection:bg-indigo-100 selection:text-indigo-700 transition-colors duration-500">
      <Navigation
        currentTab={currentTab}
        setTab={(tab) => {
          console.log('App: Switching tab to:', tab);
          setCurrentTab(tab);
        }}
        user={user}
        onLogout={handleLogout}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      <main className="flex-1 p-4 md:p-10 max-w-7xl mx-auto w-full overflow-x-hidden">
        <div className="text-slate-900 dark:text-slate-100 transition-colors duration-500">
          <Suspense fallback={
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          }>
            {renderContent()}
          </Suspense>
        </div>
      </main>

      <div className="fixed bottom-6 right-6 hidden md:block z-[60]">
        <button className="bg-white dark:bg-slate-800 p-4 rounded-full shadow-2xl border border-slate-100 dark:border-slate-700 hover:scale-110 transition-all group relative">
          <span className="text-2xl">🇵🇹</span>
          <div className="absolute right-14 top-1/2 -translate-y-1/2 bg-slate-800 text-white text-[10px] px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-bold uppercase tracking-widest pointer-events-none shadow-xl">
            Suporte Portugal 24h
          </div>
        </button>
      </div>
    </div>
  );
};

export default App;
