
import React from 'react';
import { User } from '../types';

interface NavProps {
  currentTab: string;
  setTab: (tab: string) => void;
  user: User;
  onLogout: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

import logo from '../assets/logo.png';

const Logo = () => (
  <div className="flex flex-col items-center group cursor-pointer">
    <img 
      src={logo} 
      alt="Seo Gestão" 
      className="w-24 h-auto transition-transform group-hover:scale-110 duration-500" 
    />
    <div className="mt-2 text-center">
      <span className="text-xl font-black text-slate-800 dark:text-amber-200 tracking-tighter block leading-none transition-colors">Seo Gestão</span>
      <span className="text-[8px] font-black text-indigo-500 dark:text-amber-500 uppercase tracking-[0.3em]">Condomínios</span>
    </div>
  </div>
);

const Navigation: React.FC<NavProps> = ({ currentTab, setTab, user, onLogout, theme, toggleTheme }) => {
  const allTabs = [
    { id: 'dashboard', label: 'Painel Principal', icon: '📊' },
    { id: 'building', label: 'Edifício', icon: '🏘️' },
    { id: 'fractions', label: 'Frações', icon: '🏢' },
    { id: 'users', label: 'Utilizadores', icon: '👤', adminOnly: true },
    { id: 'finance', label: 'Contabilidade', icon: '💶' },
    { id: 'reservations', label: 'Reservas Lazer', icon: '🎉' },
    { id: 'maintenance', label: 'Manutenção', icon: '🛠️' },
    { id: 'security', label: 'Portaria & Acesso', icon: '🔐' },
    { id: 'staff', label: 'Equipa & RH', icon: '👷' },
    { id: 'occurrences', label: 'Ocorrências', icon: '💬' },
    { id: 'assemblies', label: 'Assembleias', icon: '🏛️' },
    { id: 'ai-legal', label: 'Assistente RJH', icon: '🤖', adminOnly: true },
  ];

  const filteredTabs = allTabs.filter(tab => !tab.adminOnly || user.role === 'ADMIN');

  return (
    <nav className="bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 w-full md:w-72 h-auto md:h-screen sticky top-0 flex-shrink-0 z-50 flex flex-col shadow-xl transition-colors duration-500">
      <div className="p-8 flex flex-col items-center justify-center border-b border-slate-50 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors">
        <Logo />
      </div>
      
      <div className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar pb-6 mt-4">
        <div className="mb-4 px-4">
          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4">Menu Principal</p>
          <div className="space-y-1">
            {filteredTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTab(tab.id)}
                className={`w-full flex items-center gap-3 px-5 py-3 rounded-2xl transition-all ${
                  currentTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 dark:shadow-none'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-amber-100'
                }`}
              >
                <span className="text-xl">{tab.icon}</span>
                <span className="font-bold text-sm">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 space-y-3 transition-colors">
        <div className="flex gap-2">
          <button 
            onClick={toggleTheme}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-600 dark:text-amber-200 hover:bg-indigo-50 dark:hover:bg-slate-700 transition-all active:scale-95 group"
            title={theme === 'light' ? 'Ativar Modo Noite' : 'Ativar Modo Dia'}
          >
            <span className="text-lg transition-transform group-hover:rotate-12">{theme === 'light' ? '🌙' : '☀️'}</span>
            <span className="text-[10px] font-black uppercase tracking-widest">{theme === 'light' ? 'Noite' : 'Dia'}</span>
          </button>
          
          <button 
            onClick={onLogout}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 font-black text-[10px] uppercase tracking-widest hover:bg-sky-100 dark:hover:bg-sky-900/50 transition-all border border-sky-100 dark:border-sky-800 shadow-sm active:scale-95 group"
          >
            <span>🚪 Sair</span>
          </button>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700 shadow-sm transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-blue-400 flex items-center justify-center text-white font-black text-xs shadow-inner shrink-0">
              {user.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-black text-slate-800 dark:text-amber-100 truncate transition-colors">{user.name}</p>
              <div className="flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${user.role === 'ADMIN' ? 'bg-indigo-500' : 'bg-emerald-500'}`}></span>
                <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">
                  {user.role === 'ADMIN' ? 'Administrador' : 'Morador'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
