
import React, { useState, useEffect } from 'react';
import { MOCK_STAFF } from '../constants';
import { Staff, User } from '../types';

interface StaffManagerProps {
  user: User;
}

const StaffManager: React.FC<StaffManagerProps> = ({ user }) => {
  const [staffList, setStaffList] = useState<Staff[]>(() => {
    const saved = localStorage.getItem('condogest_staff');
    return saved ? JSON.parse(saved) : MOCK_STAFF;
  });

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<Omit<Staff, 'id'>>({
    name: '',
    role: '',
    contact: '',
    contractEnd: ''
  });

  const isAdmin = user.role === 'ADMIN';

  useEffect(() => {
    localStorage.setItem('condogest_staff', JSON.stringify(staffList));
  }, [staffList]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    const newStaff: Staff = {
      ...formData,
      id: 's-' + Math.random().toString(36).substr(2, 9)
    };

    setStaffList(prev => [newStaff, ...prev]);
    setShowModal(false);
    setFormData({ name: '', role: '', contact: '', contractEnd: '' });
  };

  const removeStaff = (id: string) => {
    if (!isAdmin) return;
    if (window.confirm('Tem a certeza que deseja remover este contrato?')) {
      setStaffList(prev => prev.filter(s => s.id !== id));
    }
  };

  return (
    <div className="animate-fadeIn space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-amber-200 transition-colors">Equipa & RH</h2>
          <p className="text-slate-500 dark:text-slate-400 transition-colors">Gestão de funcionários e prestadores de serviços</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowModal(true)}
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100 dark:shadow-none flex items-center gap-2"
          >
            <span>+</span> Novo Contrato
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {staffList.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-white dark:bg-slate-900 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-slate-800 transition-colors">
            <p className="text-slate-400 dark:text-slate-600 font-medium">Nenhum contrato ou colaborador registado.</p>
          </div>
        ) : (
          staffList.map(member => (
            <div key={member.id} className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-50 to-slate-50 dark:from-slate-800 dark:to-slate-700 rounded-2xl flex items-center justify-center text-2xl shadow-inner font-black text-indigo-400 dark:text-indigo-500 transition-colors">
                  {member.name.charAt(0)}
                </div>
                <div className="flex-1 overflow-hidden">
                  <h3 className="font-bold text-slate-800 dark:text-amber-100 truncate transition-colors">{member.name}</h3>
                  <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-black uppercase tracking-widest transition-colors">{member.role}</p>
                </div>
                {isAdmin && (
                  <button
                    onClick={() => removeStaff(member.id)}
                    className="opacity-0 group-hover:opacity-100 p-2 text-rose-400 dark:text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 transition-all"
                    title="Remover Contrato"
                  >
                    🗑️
                  </button>
                )}
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-50 dark:border-slate-800 transition-colors">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider transition-colors">Contacto</span>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors">{member.contact}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider transition-colors">Fim de Contrato</span>
                  <span className={`text-xs font-bold transition-colors ${new Date(member.contractEnd) < new Date() ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-300'}`}>
                    {new Date(member.contractEnd).toLocaleDateString('pt-PT')}
                  </span>
                </div>
              </div>

              {new Date(member.contractEnd) < new Date() && (
                <div className="mt-4 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 text-[10px] font-black uppercase tracking-widest py-1.5 px-3 rounded-lg text-center transition-colors">
                  ⚠️ Contrato Expirado
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {showModal && isAdmin && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl max-w-lg w-full p-8 animate-scaleIn border border-slate-100 dark:border-slate-800 transition-colors">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-amber-200 transition-colors">Registar Novo Contrato</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 transition-colors">Adicione colaboradores ou empresas externas.</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 text-xl font-bold transition-colors">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-600 uppercase mb-2 ml-1 transition-colors">Nome / Empresa</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm font-bold text-slate-800 dark:text-amber-100 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/50 outline-none transition-colors"
                  placeholder="Ex: João Silva ou Limpezas Lda"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-600 uppercase mb-2 ml-1 transition-colors">Função / Cargo</label>
                <input
                  type="text"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm font-bold text-slate-800 dark:text-amber-100 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/50 outline-none transition-colors"
                  placeholder="Ex: Zelador, Jardinagem, Segurança"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 dark:text-slate-600 uppercase mb-2 ml-1 transition-colors">Contacto</label>
                  <input
                    type="text"
                    value={formData.contact}
                    onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm font-bold text-slate-800 dark:text-amber-100 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/50 outline-none transition-colors"
                    placeholder="Telefone ou Email"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 dark:text-slate-600 uppercase mb-2 ml-1 transition-colors">Data Fim Contrato</label>
                  <input
                    type="date"
                    value={formData.contractEnd}
                    onChange={(e) => setFormData({ ...formData, contractEnd: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm font-bold text-slate-800 dark:text-amber-100 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/50 outline-none transition-colors"
                    required
                  />
                </div>
              </div>

              <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold mt-4 shadow-xl dark:shadow-none active:scale-[0.98] transition-all hover:bg-indigo-700 uppercase tracking-widest text-xs">
                Formalizar Contrato
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManager;
