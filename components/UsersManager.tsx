
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { getProfiles, updateProfile, deleteProfile } from '../services/supabaseService';

interface UsersManagerProps {
  user: User; // Utilizador atual logado
}

const UsersManager: React.FC<UsersManagerProps> = ({ user: currentUser }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('ALL');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = currentUser.role === 'ADMIN';

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await getProfiles();
      setUsers(data);
    } catch (error) {
      console.error('Erro ao carregar utilizadores:', error);
      showToast('Erro ao carregar lista de utilizadores.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(u =>
    filter === 'ALL' || u.role === filter
  );

  const [formData, setFormData] = useState<Omit<User, 'id'>>({
    name: '',
    email: '',
    role: 'RESIDENT',
    fractionCode: ''
  });

  const handleOpenAdd = () => {
    // setEditingUser(null);
    // setFormData({ name: '', email: '', role: 'RESIDENT', fractionCode: '' });
    // setShowModal(true);
    alert("⚠️ Funcionalidade Limitada: Para adicionar novos utilizadores, eles devem registar-se na aplicação ou ser convidados via Supabase Dashboard. Esta funcionalidade será implementada em breve com Edge Functions. Por favor, peça ao utilizador para se registar.");
  };

  const handleOpenEdit = (userToEdit: User) => {
    setEditingUser(userToEdit);
    setFormData({
      name: userToEdit.name,
      email: userToEdit.email,
      role: userToEdit.role,
      fractionCode: userToEdit.fractionCode || ''
    });
    setShowModal(true);
  };

  const handleRevoke = async (targetId: string, name: string) => {
    if (String(targetId) === String(currentUser.id)) {
      showToast("Impossível revogar o próprio acesso administrativo.", 'error');
      return;
    }

    const confirmMessage = `⚠️ ELIMINAÇÃO DEFINITIVA\n\nTem a certeza que deseja remover o acesso de ${name.toUpperCase()}?\n(Isto apenas remove o perfil, o login Auth pode persistir se não for admin)`;

    if (window.confirm(confirmMessage)) {
      try {
        await deleteProfile(targetId);
        setUsers(prevUsers => prevUsers.filter(u => String(u.id) !== String(targetId)));
        showToast(`O utilizador ${name} foi removido com sucesso.`);
      } catch (error) {
        console.error('Erro ao remover utilizador:', error);
        showToast('Erro ao remover utilizador.', 'error');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    try {
      if (editingUser) {
        const updated = await updateProfile(editingUser.id, formData);
        setUsers(prev => prev.map(u => String(u.id) === String(editingUser.id) ? updated : u));
        showToast("Perfil atualizado com sucesso.");
      } else {
        // Create logic disabled for now as per alert
      }
      setShowModal(false);
      setEditingUser(null);
    } catch (error) {
      console.error('Erro ao salvar utilizador:', error);
      showToast('Erro ao salvar alterações.', 'error');
    }
  };

  return (
    <div className="animate-fadeIn space-y-6 relative">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-10 right-10 z-[120] px-6 py-4 rounded-2xl shadow-2xl animate-bounce flex items-center gap-3 border transition-all ${toast.type === 'success'
          ? 'bg-emerald-600 dark:bg-emerald-900 text-white border-emerald-400 dark:border-emerald-800'
          : 'bg-rose-600 dark:bg-rose-900 text-white border-rose-400 dark:border-rose-800'
          }`}>
          <span className="text-xl">{toast.type === 'success' ? '✅' : '🚫'}</span>
          <span className="font-bold text-sm tracking-tight">{toast.message}</span>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-amber-200 tracking-tight transition-colors">Gestão de Utilizadores</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium transition-colors">Controlo de acessos (Sincronizado via Supabase)</p>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <>
              <button
                onClick={loadUsers}
                className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-4 py-2.5 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-xs uppercase tracking-widest"
                title="Atualizar lista"
              >
                🔄
              </button>
              <button
                onClick={handleOpenAdd}
                className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 dark:shadow-none flex items-center gap-2 opacity-50 cursor-not-allowed"
                title="Funcionalidade em desenvolvimento (Requer convite via Auth)"
              >
                <span>+</span> Novo Utilizador
              </button>
            </>
          )}
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide border-b border-slate-100 dark:border-slate-800">
        {['ALL', 'ADMIN', 'RESIDENT', 'STAFF'].map((r) => (
          <button
            key={r}
            onClick={() => setFilter(r)}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all border shrink-0 ${filter === r
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 border-slate-100 dark:border-slate-800 hover:border-indigo-100 dark:hover:border-indigo-900'
              }`}
          >
            {r === 'ALL' ? 'Todos' : r === 'ADMIN' ? 'Administradores' : r === 'RESIDENT' ? 'Moradores' : 'Equipa'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400">Carregando utilizadores...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="col-span-full py-24 text-center bg-white dark:bg-slate-900 rounded-[3rem] border border-dashed border-slate-200 dark:border-slate-800 shadow-inner">
            <div className="text-5xl mb-6 opacity-30">👥</div>
            <p className="text-slate-400 dark:text-slate-600 font-bold uppercase tracking-widest text-xs">Sem utilizadores nesta categoria</p>
          </div>
        ) : (
          filteredUsers.map((u) => (
            <div
              key={u.id}
              className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl dark:hover:shadow-indigo-900/10 hover:-translate-y-1 transition-all group relative overflow-hidden"
            >
              {String(u.id) === String(currentUser.id) && (
                <div className="absolute top-0 right-0 bg-indigo-500 text-white px-4 py-1 rounded-bl-2xl text-[8px] font-black uppercase tracking-widest">
                  Sessão Atual
                </div>
              )}

              <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-50 to-slate-50 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-2xl font-black shadow-inner">
                  {u.name?.charAt(0) || '?'}
                </div>
                <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm ${u.role === 'ADMIN' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400' :
                  u.role === 'RESIDENT' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' :
                    'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                  }`}>
                  {u.role === 'ADMIN' ? 'Administrador' : u.role === 'RESIDENT' ? 'Morador' : 'Staff'}
                </span>
              </div>

              <h3 className="text-lg font-black text-slate-800 dark:text-amber-100 leading-none mb-1 truncate transition-colors">{u.name || 'Sem Nome'}</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mb-6 truncate transition-colors">{u.email}</p>

              <div className="flex items-center justify-between pt-5 border-t border-slate-50 dark:border-slate-800">
                <div className="flex flex-col">
                  <span className="text-[8px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-[0.2em] mb-0.5 transition-colors">Localização</span>
                  <span className="text-[10px] text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider transition-colors">
                    {u.fractionCode ? `Fração: ${u.fractionCode}` : 'Acesso Global'}
                  </span>
                </div>

                {isAdmin && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenEdit(u)}
                      className="p-2.5 bg-slate-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 rounded-xl hover:bg-indigo-600 dark:hover:bg-indigo-500 hover:text-white transition-all shadow-sm"
                      title="Editar"
                    >
                      ✏️
                    </button>
                    {String(u.id) !== String(currentUser.id) && (
                      <button
                        onClick={() => handleRevoke(u.id, u.name || 'User')}
                        className="p-2.5 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-xl hover:bg-rose-600 dark:hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                        title="Revogar Acesso"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && isAdmin && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[110] flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl max-w-lg w-full p-10 animate-scaleIn border border-slate-100 dark:border-slate-800 transition-colors">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-2xl font-black text-slate-800 dark:text-amber-200 tracking-tight">
                  {editingUser ? 'Ficha de Cadastro' : 'Novo Colaborador'}
                </h3>
                <p className="text-sm text-slate-400 dark:text-slate-500 font-medium">
                  {editingUser ? 'Atualize as permissões e dados do utilizador.' : 'Defina os dados para o envio das credenciais.'}
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-10 h-10 flex items-center justify-center bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 rounded-full transition-colors text-xl font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest ml-1">Nome Completo</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-100 dark:focus:border-indigo-900 focus:bg-white dark:focus:bg-slate-900 rounded-2xl px-5 py-4 text-sm font-bold text-slate-800 dark:text-amber-100 transition-all outline-none"
                  placeholder="Nome do condómino ou staff"
                  required
                />
              </div>

              {/* Email is read-only for now as we can't easily change auth email via simple update */}
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest ml-1">Email Principal (Apenas Leitura)</label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full bg-slate-100 dark:bg-slate-800/50 border-2 border-transparent rounded-2xl px-5 py-4 text-sm text-slate-500 dark:text-slate-500 transition-all outline-none cursor-not-allowed"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest ml-1">Perfil</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-100 dark:focus:border-indigo-900 focus:bg-white dark:focus:bg-slate-900 rounded-2xl px-5 py-4 text-sm font-black text-slate-800 dark:text-amber-100 transition-all outline-none appearance-none"
                  >
                    <option value="RESIDENT">Morador</option>
                    <option value="ADMIN">Administrador</option>
                    <option value="STAFF">Manutenção</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest ml-1">Fração</label>
                  <input
                    type="text"
                    value={formData.fractionCode}
                    onChange={(e) => setFormData({ ...formData, fractionCode: e.target.value })}
                    placeholder="3º Dir"
                    className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-100 dark:focus:border-indigo-900 focus:bg-white dark:focus:bg-slate-900 rounded-2xl px-5 py-4 text-sm font-bold text-slate-800 dark:text-amber-100 transition-all outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-base mt-6 shadow-xl shadow-indigo-100 dark:shadow-none active:scale-[0.97] transition-all hover:bg-indigo-700 uppercase tracking-widest"
              >
                {editingUser ? 'Confirmar Alterações' : 'Validar e Enviar Convite'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersManager;
