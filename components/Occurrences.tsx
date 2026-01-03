
import React, { useState, useEffect } from 'react';
import { Occurrence, Fraction } from '../types';
import { getOccurrences, createOccurrence, updateOccurrenceStatus, getFractions } from '../services/supabaseService';

const Occurrences: React.FC = () => {
  const [occurrences, setOccurrences] = useState<Occurrence[]>([]);
  const [fractions, setFractions] = useState<Fraction[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState<Omit<Occurrence, 'id' | 'status' | 'date'>>({
    title: '',
    description: '',
    category: 'MAINTENANCE',
    fractionCode: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [occData, fracData] = await Promise.all([
        getOccurrences(),
        getFractions()
      ]);
      setOccurrences(occData);
      setFractions(fracData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newOccData: Omit<Occurrence, 'id'> = {
        ...formData,
        status: 'OPEN'
      };

      const created = await createOccurrence(newOccData);
      setOccurrences(prev => [created, ...prev]);
      setShowModal(false);
      setFormData({ title: '', description: '', category: 'MAINTENANCE', fractionCode: '' });
    } catch (error) {
      console.error('Erro ao criar ocorrência:', error);
      alert('Erro ao registar ocorrência.');
    }
  };

  const updateStatus = async (id: string, status: Occurrence['status']) => {
    try {
      const updated = await updateOccurrenceStatus(id, status);
      setOccurrences(prev => prev.map(o => o.id === id ? updated : o));
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'MAINTENANCE': return 'Manutenção';
      case 'NOISE': return 'Ruído';
      case 'SECURITY': return 'Segurança';
      case 'OTHER': return 'Outros';
      default: return cat;
    }
  };

  return (
    <div className="animate-fadeIn space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-amber-200 transition-colors">Mural de Ocorrências</h2>
          <p className="text-slate-500 dark:text-slate-400">Gestão de reclamações e pedidos dos moradores</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100 dark:shadow-none flex items-center gap-2"
        >
          <span>💬</span> Nova Ocorrência
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {occurrences.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 p-12 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-slate-800 text-center text-slate-400 dark:text-slate-600 transition-colors">
            Não existem ocorrências registadas.
          </div>
        ) : (
          occurrences.map((o) => (
            <div key={o.id} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-6 hover:shadow-md dark:hover:shadow-indigo-900/10 transition-all">
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${o.status === 'OPEN' ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400' :
                    o.status === 'IN_PROGRESS' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' :
                      'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                    }`}>
                    {o.status === 'OPEN' ? 'Aberta' : o.status === 'IN_PROGRESS' ? 'Em Curso' : 'Resolvida'}
                  </span>
                  <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{getCategoryLabel(o.category)}</span>
                  <span className="text-xs text-slate-400 dark:text-slate-600">•</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{o.date}</span>
                  <span className="text-xs text-slate-400 dark:text-slate-600">•</span>
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded-md transition-colors">Fraç: {o.fractionCode}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-amber-100 transition-colors">{o.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed transition-colors">{o.description}</p>
              </div>
              <div className="flex md:flex-col justify-end gap-2 shrink-0">
                {o.status !== 'RESOLVED' && (
                  <>
                    <button
                      onClick={() => updateStatus(o.id, o.status === 'OPEN' ? 'IN_PROGRESS' : 'RESOLVED')}
                      className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-xl text-xs font-bold hover:bg-indigo-600 dark:hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                    >
                      {o.status === 'OPEN' ? 'Iniciar Tratamento' : 'Marcar Resolvida'}
                    </button>
                    <button className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-xl text-xs font-bold hover:bg-rose-600 dark:hover:bg-rose-600 hover:text-white transition-all shadow-sm">
                      Anular
                    </button>
                  </>
                )}
                {o.status === 'RESOLVED' && (
                  <button className="text-slate-400 dark:text-slate-500 text-xs font-bold flex items-center gap-1 cursor-default transition-colors">
                    ✅ Resolvida
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl max-w-xl w-full p-8 animate-scaleIn border border-slate-100 dark:border-slate-800 transition-colors">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-amber-200">Registar Ocorrência</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Relate um problema ou situação no edifício.</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 text-xl font-bold transition-colors">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-2 ml-1 transition-colors">Categoria</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm font-bold text-slate-800 dark:text-amber-100 appearance-none outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/50 transition-colors"
                  >
                    <option value="MAINTENANCE">Manutenção</option>
                    <option value="NOISE">Ruído / Convivência</option>
                    <option value="SECURITY">Segurança</option>
                    <option value="OTHER">Outros</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-2 ml-1 transition-colors">Fração Relacionada</label>
                  <select
                    value={formData.fractionCode}
                    onChange={(e) => setFormData({ ...formData, fractionCode: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm font-bold text-slate-800 dark:text-amber-100 appearance-none outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/50 transition-colors"
                    required
                  >
                    <option value="">Selecione...</option>
                    <option value="ADMIN">Administração (Geral)</option>
                    {fractions.map(f => (
                      <option key={f.id} value={f.code}>{f.code} - {f.ownerName}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-2 ml-1 transition-colors">Assunto / Título</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm font-bold text-slate-800 dark:text-amber-100 outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/50 transition-colors"
                  placeholder="Elevador preso, Infiltração garagem"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-2 ml-1 transition-colors">Descrição Detalhada</label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm font-medium text-slate-800 dark:text-amber-100 outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/50 transition-colors"
                  placeholder="Descreva o que aconteceu..."
                  required
                ></textarea>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg dark:shadow-none"
                >
                  Submeter Ocorrência
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Occurrences;
