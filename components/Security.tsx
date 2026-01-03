
import React, { useState, useEffect } from 'react';
import { Visitor, User, Fraction } from '../types';
import { getVisitors, createVisitor, exitVisitor, getFractions } from '../services/supabaseService';

interface SecurityProps {
  user: User;
}

const Security: React.FC<SecurityProps> = ({ user }) => {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [fractions, setFractions] = useState<Fraction[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', docId: '', fractionCode: '' });
  const [loading, setLoading] = useState(true);

  const isAdmin = user.role === 'ADMIN';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [visData, fracData] = await Promise.all([
        getVisitors(),
        getFractions()
      ]);
      setVisitors(visData);
      setFractions(fracData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    try {
      const newVisitorData: Omit<Visitor, 'id'> = {
        name: formData.name,
        docId: formData.docId,
        fractionCode: formData.fractionCode,
        entryTime: new Date().toISOString(),
        status: 'IN'
      };

      const created = await createVisitor(newVisitorData);
      setVisitors([created, ...visitors]);
      setShowModal(false);
      setFormData({ name: '', docId: '', fractionCode: '' });
    } catch (error) {
      console.error('Erro ao registar entrada:', error);
      alert('Erro ao registar entrada.');
    }
  };

  const handleExit = async (id: string) => {
    if (!isAdmin) return;
    try {
      const updated = await exitVisitor(id);
      setVisitors(prev => prev.map(v => v.id === id ? updated : v));
    } catch (error) {
      console.error('Erro ao registar saída:', error);
    }
  };

  return (
    <div className="animate-fadeIn space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-amber-200 tracking-tight transition-colors">Portaria & Acessos</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium transition-colors">Controlo de visitas e segurança</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowModal(true)}
            className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg dark:shadow-none flex items-center gap-2"
          >
            <span>👤</span> Registar Entrada
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 text-[10px] uppercase font-black tracking-widest transition-colors">
                <th className="px-6 py-5">Visitante</th>
                <th className="px-6 py-5">Identificação</th>
                <th className="px-6 py-5">Fração</th>
                <th className="px-6 py-5">Estado</th>
                <th className="px-6 py-5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800 transition-colors">
              {visitors.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-slate-400 dark:text-slate-600 font-medium transition-colors">
                    Nenhum registo de visitas hoje
                  </td>
                </tr>
              ) : (
                visitors.map(v => (
                  <tr key={v.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="font-black text-slate-800 dark:text-amber-100 transition-colors">{v.name}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500">{new Date(v.entryTime).toLocaleString('pt-PT')}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-mono text-xs text-slate-400 dark:text-slate-500 transition-colors">{v.docId}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-amber-400 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors">
                        {v.fractionCode}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-colors ${v.status === 'IN' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                        }`}>
                        {v.status === 'IN' ? 'No Edifício' : 'Saiu'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {v.status === 'IN' && isAdmin && (
                        <button
                          onClick={() => handleExit(v.id)}
                          className="text-xs font-bold text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 transition-colors"
                        >
                          Marcar Saída
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl max-w-md w-full p-8 animate-scaleIn border border-slate-100 dark:border-slate-800 transition-colors">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-amber-200">Novo Visitante</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Registo de entrada</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 text-xl font-bold transition-colors">✕</button>
            </div>

            <form onSubmit={handleEntry} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-2 ml-1 transition-colors">Nome Completo</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm font-bold text-slate-800 dark:text-amber-100 outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/50 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-2 ml-1 transition-colors">Documento (CC/BI)</label>
                <input
                  type="text"
                  value={formData.docId}
                  onChange={(e) => setFormData({ ...formData, docId: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm font-bold text-slate-800 dark:text-amber-100 outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/50 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-2 ml-1 transition-colors">Fração a Visitar</label>
                <select
                  value={formData.fractionCode}
                  onChange={(e) => setFormData({ ...formData, fractionCode: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm font-bold text-slate-800 dark:text-amber-100 outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/50 transition-colors appearance-none"
                  required
                >
                  <option value="">Selecione...</option>
                  <option value="ADMIN">Administração / Geral</option>
                  {fractions.map(f => (
                    <option key={f.id} value={f.code}>{f.code} - {f.ownerName}</option>
                  ))}
                </select>
              </div>

              <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold mt-4 shadow-xl dark:shadow-none hover:bg-indigo-700 transition-all">
                Registar Entrada
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Security;
