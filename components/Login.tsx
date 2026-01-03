
import React, { useState } from 'react';
import { User } from '../types';
import { signIn } from '../services/supabaseService';

interface LoginProps {
  onLogin: (user: User) => void;
}

import logo from '../assets/logo.png';

const LogoBig = () => (
  <div className="flex flex-col items-center mb-8">
    <div className="mb-4 relative">
      <img
        src={logo}
        alt="Logo"
        className="w-48 h-auto drop-shadow-xl animate-scaleIn"
      />
    </div>
    {/* Text Removed */}
  </div>
);

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Login: Attempting sign in for', email);
      const user = await signIn(email, password);
      console.log('Login: Sign in successful for', user?.email);
      // O App.tsx vai detetar a mudança de estado e atualizar o utilizador
    } catch (err: any) {
      console.error('Login: error during sign in:', err);
      console.error('Login error:', err);
      setError('Credenciais inválidas ou erro de ligação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]"></div>

      <div className="max-w-md w-full animate-scaleIn relative z-10">
        <div className="bg-white rounded-[3.5rem] shadow-2xl overflow-hidden">
          <div className="p-10 md:p-14">
            <LogoBig />

            <div className="text-center mb-10">
              {/* Title removed */}
              <p className="text-slate-500 text-sm mt-1 font-medium italic">"Gestão inteligente para o seu condomínio"</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold rounded-2xl animate-shake">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-100 focus:bg-white rounded-2xl px-6 py-4 outline-none transition-all text-slate-800 font-bold"
                  placeholder="admin@condominio.pt"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Palavra-passe</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-100 focus:bg-white rounded-2xl px-6 py-4 outline-none transition-all text-slate-800 font-medium"
                  placeholder="********"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-[0.98] transition-all flex items-center justify-center gap-3 mt-4"
              >
                {loading ? 'A validar...' : 'Entrar no Sistema'}
              </button>
            </form>

            <div className="mt-8 text-center animate-fadeIn" style={{ animationDelay: '0.2s' }}>
              <p className="text-slate-500 text-sm font-medium">
                Ainda não tem acesso? <br />
                <span className="text-indigo-600 font-black cursor-pointer hover:text-indigo-800 transition-colors uppercase tracking-tight">
                  Contacte a Administração
                </span>
              </p>
            </div>
          </div>
        </div>

        <p className="text-center mt-8 text-slate-500 text-[10px] uppercase font-black tracking-[0.2em]">
          {/* Footer Text Removed */}
          Conformidade Lei 8/2022
        </p>
      </div>
    </div>
  );
};
export default Login;
