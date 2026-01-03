
import React, { useState, useEffect } from 'react';
import { Inspection, User } from '../types';
import { getInspections, createInspection, updateInspectionStatus, deleteInspection as deleteInspectionService } from '../services/supabaseService';

interface MaintenanceProps {
  user: User;
}

const Maintenance: React.FC<MaintenanceProps> = ({ user }) => {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const isAdmin = user.role === 'ADMIN';

  const [formData, setFormData] = useState({ type: 'ELEVATOR', customType: '', lastDate: '', nextDate: '' });

  useEffect(() => {
    loadInspections();
  }, []);

  const loadInspections = async () => {
    try {
      const data = await getInspections();
      setInspections(data);
    } catch (error) {
      console.error('Erro ao carregar inspeções:', error);
    } finally {
      setLoading(false);
    }
  };

  const computeDateStatus = (nextDate: string): 'OK' | 'WARNING' | 'EXPIRED' => {
    const today = new Date();
    const next = new Date(nextDate);
    const diffTime = next.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return 'EXPIRED';
    if (diffDays < 30) return 'WARNING';
    return 'OK';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    const finalType = formData.type === 'OTHER' ? formData.customType : formData.type;

    try {
      const newInsCheck: Omit<Inspection, 'id'> = {
        type: finalType,
        lastDate: formData.lastDate,
        nextDate: formData.nextDate,
        status: computeDateStatus(formData.nextDate)
      };

      const created = await createInspection(newInsCheck);
      setInspections(prev => [created, ...prev]);
      setShowModal(false);
      setFormData({ type: 'ELEVATOR', customType: '', lastDate: '', nextDate: '' });
    } catch (error) {
      console.error('Erro ao criar inspeção:', error);
      alert('Erro ao agendar inspeção.');
    }
  };

  const updateStatus = async (id: string, newStatus: Inspection['status']) => {
    if (!isAdmin) return;
    try {
      const updated = await updateInspectionStatus(id, newStatus);
      setInspections(prev => prev.map(ins => ins.id === id ? updated : ins));
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
    }
  };

  const deleteInspection = async (id: string) => {
    if (!isAdmin) return;
    if (window.confirm('Deseja remover este registo de manutenção?')) {
      try {
        await deleteInspectionService(id);
        setInspections(prev => prev.filter(ins => ins.id !== id));
      } catch (error) {
        console.error('Erro ao remover inspeção:', error);
      }
    }
  };

  const getLabel = (type: string) => {
    switch (type) {
      case 'ELEVATOR': return 'Elevador (Anual)';
      case 'GAS': return 'Gás (5 Anos)';
      case 'FIRE': return 'Extintores / SIES';
      case 'MAINTENANCE': return 'Manutenção Preventiva';
      default: return type;
    }
  };

  return (
    <div className="animate-fadeIn space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-amber-200 transition-colors">Manutenção & Inspeções</h2>
          <p className="text-slate-500 dark:text-slate-400 transition-colors">Controlo de prazos obrigatórios por lei</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowModal(true)}
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100 dark:shadow-none flex items-center gap-2"
          >
            <span>📋</span> Agendar Inspeção
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {inspections.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-[2.5rem] transition-colors">
            <p className="text-slate-400 dark:text-slate-600 font-bold uppercase text-xs tracking-widest transition-colors">Sem planos de manutenção</p>
          </div>
        ) : (
          inspections.map((ins) => (
            <div
              key={ins.id}
              className={`bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border shadow-sm relative group hover:shadow-md transition-all ${ins.status === 'COMPLETED' ? 'border-emerald-100 dark:border-emerald-900/30 opacity-90' :
                  ins.status === 'CANCELLED' ? 'border-slate-100 dark:border-slate-800 opacity-60 grayscale' :
                    'border-slate-100 dark:border-slate-800'
                }`}
            >
              <div className={`absolute top-0 right-0 p-5 font-bold text-xl transition-colors ${ins.status === 'OK' || ins.status === 'COMPLETED' ? 'text-emerald-500' :
                  ins.status === 'WARNING' ? 'text-amber-500' :
                    ins.status === 'CANCELLED' ? 'text-slate-400' : 'text-rose-500'
                }`}>
                {ins.status === 'OK' || ins.status === 'COMPLETED' ? '✓' :
                  ins.status === 'WARNING' ? '⚠' :
                    ins.status === 'CANCELLED' ? '✕' : '❗'}
              </div>

              <p className="text-[10px] font-black text-slate-400 dark:text-amber-500 uppercase mb-4 pr-10 tracking-[0.15em] transition-colors">
                {getLabel(ins.type)}
              </p>

              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-[9px] font-bold text-slate-300 dark:text-slate-600 uppercase tracking-wider mb-0.5 transition-colors">Última Realização</p>
                  <p className="font-bold text-slate-800 dark:text-amber-50 text-sm transition-colors">{new Date(ins.lastDate).toLocaleDateString('pt-PT')}</p>
                </div>

                <div>
                  <p className="text-[9px] font-bold text-slate-300 dark:text-slate-600 uppercase tracking-wider mb-0.5 transition-colors">Próxima Data Limite</p>
                  <p className={`font-bold text-sm transition-colors ${ins.status === 'EXPIRED' ? 'text-rose-600 dark:text-rose-400' : 'text-slate-800 dark:text-amber-100'
                    }`}>
                    {new Date(ins.nextDate).toLocaleDateString('pt-PT')}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && isAdmin && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl max-w-lg w-full p-8 animate-scaleIn border border-slate-100 dark:border-slate-800 transition-colors">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-amber-200 transition-colors">Agendar Serviço</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 transition-colors">Manutenção e Inspeções Oficiais</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 dark:text-slate-500 hover:text-rose-500 transition-colors">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-2 ml-1 transition-colors">Tipo de Serviço</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm font-bold text-slate-800 dark:text-amber-100 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 outline-none appearance-none transition-colors"
                >
                  <option value="ELEVATOR">Elevador (Anual)</option>
                  <option value="GAS">Gás (5 Anos)</option>
                  <option value="FIRE">Extintores / Incêndio</option>
                  <option value="MAINTENANCE">Manutenção Preventiva</option>
                </select>
              </div>

              <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black shadow-xl dark:shadow-none hover:bg-indigo-700 transition-all uppercase tracking-widest text-xs mt-2">
                Validar Plano
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Maintenance;
