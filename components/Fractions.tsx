
import React, { useState, useEffect } from 'react';
import { Fraction, User } from '../types';
import { getFractions, createFraction, updateFraction } from '../services/supabaseService';

interface FractionsProps {
  user: User;
}

const Fractions: React.FC<FractionsProps> = ({ user }) => {
  const [fractions, setFractions] = useState<Fraction[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingFraction, setEditingFraction] = useState<Fraction | null>(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = user.role === 'ADMIN';

  const [formData, setFormData] = useState<Omit<Fraction, 'id'>>({
    code: '',
    ownerName: '',
    permilage: 0,
    monthlyQuota: 0,
    nif: '',
    status: 'PAID'
  });

  useEffect(() => {
    loadFractions();
  }, []);

  const loadFractions = async () => {
    try {
      const data = await getFractions();
      setFractions(data);
    } catch (error) {
      console.error('Erro ao carregar frações:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    if (!isAdmin) return;
    setEditingFraction(null);
    setFormData({ code: '', ownerName: '', permilage: 0, monthlyQuota: 0, nif: '', status: 'PAID' });
    setShowModal(true);
  };

  const handleOpenEdit = (fraction: Fraction) => {
    if (!isAdmin) return;
    setEditingFraction(fraction);
    setFormData({
      code: fraction.code,
      ownerName: fraction.ownerName,
      permilage: fraction.permilage,
      monthlyQuota: fraction.monthlyQuota,
      nif: fraction.nif,
      status: fraction.status
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    try {
      if (editingFraction) {
        const updated = await updateFraction(editingFraction.id, formData);
        setFractions(prev => prev.map(f => f.id === editingFraction.id ? updated : f));
      } else {
        const newFraction = await createFraction(formData);
        setFractions(prev => [...prev, newFraction]);
      }
      setShowModal(false);
    } catch (error) {
      console.error('Erro ao salvar fração:', error);
      alert('Erro ao salvar os dados. Verifique a consola.');
    }
  };

  return (
    <div className="animate-fadeIn space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-amber-200 transition-colors">Frações Autónomas</h2>
          <p className="text-slate-500 dark:text-slate-400 transition-colors">Gestão de unidades e proprietários</p>
        </div>
        {isAdmin && (
          <button
            onClick={handleOpenAdd}
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100 dark:shadow-none flex items-center gap-2"
          >
            <span>+</span> Adicionar Fração
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-500 text-xs uppercase tracking-wider transition-colors">
                <th className="px-6 py-4 font-semibold">Código</th>
                <th className="px-6 py-4 font-semibold">Proprietário</th>
                <th className="px-6 py-4 font-semibold">Permilagem</th>
                <th className="px-6 py-4 font-semibold">Quota Mensal</th>
                <th className="px-6 py-4 font-semibold">NIF</th>
                <th className="px-6 py-4 font-semibold">Estado</th>
                {isAdmin && <th className="px-6 py-4 text-right">Ações</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 transition-colors">
              {fractions.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 7 : 6} className="px-6 py-10 text-center text-slate-400 dark:text-slate-600 font-medium transition-colors">
                    Nenhuma fração registada.
                  </td>
                </tr>
              ) : (
                fractions.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-800 dark:text-amber-100 transition-colors">{f.code}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300 font-medium transition-colors">{f.ownerName}</td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-500 transition-colors">{f.permilage}/1000</td>
                    <td className="px-6 py-4 font-semibold text-slate-800 dark:text-amber-50 transition-colors">
                      {Number(f.monthlyQuota).toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-500 dark:text-slate-500 transition-colors">{f.nif}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight transition-colors ${f.status === 'PAID' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' :
                          f.status === 'PENDING' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' :
                            'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400'
                        }`}>
                        {f.status === 'PAID' ? 'Em Dia' : f.status === 'PENDING' ? 'Pendente' : 'Em Atraso'}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={() => handleOpenEdit(f)}
                            className="text-indigo-600 dark:text-amber-400 hover:text-indigo-900 dark:hover:text-amber-200 text-sm font-semibold transition-colors"
                          >
                            Editar
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="p-6 bg-indigo-900 dark:bg-slate-900 rounded-3xl text-white dark:text-amber-100 border dark:border-slate-800 relative overflow-hidden transition-colors">
        <div className="relative z-10 max-w-lg">
          <h3 className="text-xl font-bold mb-2 dark:text-amber-200 transition-colors">Permilagem e Quotas</h3>
          <p className="text-indigo-200 dark:text-slate-400 text-sm transition-colors">
            Cálculo automático baseado no Artigo 1424º do Código Civil.
          </p>
        </div>
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
          <span className="text-9xl">⚖️</span>
        </div>
      </div>

      {showModal && isAdmin && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl max-w-2xl w-full p-8 animate-scaleIn overflow-y-auto max-h-[90vh] border border-slate-100 dark:border-slate-800 transition-colors">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-amber-200 transition-colors">
                  {editingFraction ? 'Editar Fração' : 'Nova Fração Autónoma'}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 transition-colors">Introduza os dados da unidade e do proprietário.</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 dark:text-slate-500 hover:text-rose-500 transition-colors">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-2 transition-colors">Código da Fração</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 text-slate-800 dark:text-amber-100 font-semibold outline-none transition-colors"
                    placeholder="1º Esq"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-2 transition-colors">NIF Proprietário</label>
                  <input
                    type="text"
                    value={formData.nif}
                    onChange={(e) => setFormData({ ...formData, nif: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 text-slate-800 dark:text-amber-100 font-mono outline-none transition-colors"
                    placeholder="9 dígitos"
                    required
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg dark:shadow-none"
                >
                  Confirmar Dados
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Fractions;
