
import React, { useState, useEffect } from 'react';
import { CommonArea, Booking, User, Fraction } from '../types';
import { getCommonAreas, createCommonArea, updateCommonArea, deleteCommonArea, getBookings, createBooking, getFractions } from '../services/supabaseService';

interface CommonAreasProps {
  user: User;
}

const CommonAreas: React.FC<CommonAreasProps> = ({ user }) => {
  const [areas, setAreas] = useState<CommonArea[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [fractions, setFractions] = useState<Fraction[]>([]);
  const [loading, setLoading] = useState(true);

  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showAreaModal, setShowAreaModal] = useState(false);
  const [editingArea, setEditingArea] = useState<CommonArea | null>(null);

  const [bookingFormData, setBookingFormData] = useState({ areaId: '', fractionId: '', date: '' });
  const [areaFormData, setAreaFormData] = useState<Omit<CommonArea, 'id'>>({
    name: '',
    capacity: 0,
    price: 0,
    rules: ''
  });

  const isAdmin = user.role === 'ADMIN';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [areasData, bookingsData, fracData] = await Promise.all([
        getCommonAreas(),
        getBookings(),
        getFractions()
      ]);
      setAreas(areasData);
      setBookings(bookingsData);
      setFractions(fracData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newBookingData: Omit<Booking, 'id'> = {
        ...bookingFormData,
        status: 'PENDING'
      };
      const created = await createBooking(newBookingData);
      setBookings(prev => [...prev, created]);
      setShowBookingModal(false);
      setBookingFormData({ areaId: '', fractionId: '', date: '' });
    } catch (error) {
      console.error('Erro ao criar reserva:', error);
      alert('Erro ao criar reserva.');
    }
  };

  const handleAreaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    try {
      if (editingArea) {
        const updated = await updateCommonArea(editingArea.id, areaFormData);
        setAreas(prev => prev.map(a => a.id === editingArea.id ? updated : a));
      } else {
        const created = await createCommonArea(areaFormData);
        setAreas(prev => [...prev, created]);
      }
      setShowAreaModal(false);
      setEditingArea(null);
    } catch (error) {
      console.error('Erro ao salvar área:', error);
      alert('Erro ao salvar configuração.');
    }
  };

  const openEditArea = (area: CommonArea) => {
    setEditingArea(area);
    setAreaFormData({
      name: area.name,
      capacity: area.capacity,
      price: area.price,
      rules: area.rules
    });
    setShowAreaModal(true);
  };

  const openAddArea = () => {
    setEditingArea(null);
    setAreaFormData({ name: '', capacity: 0, price: 0, rules: '' });
    setShowAreaModal(true);
  };

  const deleteArea = async (id: string) => {
    if (window.confirm('Tem a certeza que deseja remover este espaço comum?')) {
      try {
        await deleteCommonArea(id);
        setAreas(prev => prev.filter(a => a.id !== id));
      } catch (error) {
        console.error('Erro ao remover área:', error);
      }
    }
  };

  return (
    <div className="animate-fadeIn space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-amber-200 tracking-tight transition-colors">Reservas de Áreas Comuns</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium transition-colors">Gestão de salões, churrasqueiras e lazer</p>
        </div>
        <div className="flex gap-3">
          {isAdmin && (
            <button
              onClick={openAddArea}
              className="bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-slate-800 px-5 py-2.5 rounded-2xl font-bold hover:bg-indigo-50 dark:hover:bg-slate-800 transition-all shadow-sm flex items-center gap-2"
            >
              <span>🏗️</span> Configurar Espaços
            </button>
          )}
          <button
            onClick={() => setShowBookingModal(true)}
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 dark:shadow-none flex items-center gap-2 active:scale-95"
          >
            <span>📅</span> Nova Reserva
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {areas.map(area => (
          <div key={area.id} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:shadow-xl dark:hover:shadow-indigo-900/10 hover:-translate-y-1 transition-all">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
              <span className="text-6xl">🏢</span>
            </div>

            <h3 className="text-xl font-black text-slate-800 dark:text-amber-100 mb-2 transition-colors">{area.name}</h3>

            <div className="flex flex-wrap gap-3 mb-6">
              <div className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-colors">
                👥 Lotação: {area.capacity}
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-colors">
                💰 {area.price.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}
              </div>
            </div>

            <div className="bg-slate-50/50 dark:bg-slate-800/50 p-4 rounded-2xl mb-6 transition-colors">
              <p className="text-slate-500 dark:text-slate-400 text-xs italic leading-relaxed transition-colors">"{area.rules}"</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setBookingFormData({ ...bookingFormData, areaId: area.id });
                  setShowBookingModal(true);
                }}
                className="flex-1 py-3 bg-slate-900 dark:bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 dark:hover:bg-indigo-700 transition-all active:scale-95 shadow-md"
              >
                Reservar
              </button>
              {isAdmin && (
                <button
                  onClick={() => openEditArea(area)}
                  className="w-12 h-12 flex items-center justify-center bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 rounded-2xl hover:bg-indigo-600 dark:hover:bg-indigo-500 hover:text-white transition-all shadow-sm"
                  title="Configurar"
                >
                  ⚙️
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
        <h3 className="text-lg font-black text-slate-800 dark:text-amber-200 mb-6 tracking-tight transition-colors">Próximas Reservas do Condomínio</h3>
        {bookings.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-slate-50 dark:border-slate-800 rounded-[2rem] transition-colors">
            <p className="text-slate-400 dark:text-slate-600 font-bold uppercase tracking-widest text-[10px]">Nenhuma reserva agendada</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bookings.map(b => (
              <div key={b.id} className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border border-transparent hover:border-indigo-100 dark:hover:border-indigo-900 transition-all">
                <div className="flex items-center gap-4">
                  <div className="bg-white dark:bg-slate-800 w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm text-2xl transition-colors">🗓️</div>
                  <div>
                    <h4 className="font-black text-slate-800 dark:text-amber-100 transition-colors">{areas.find(a => a.id === b.areaId)?.name || 'Espaço Removido'}</h4>
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1 transition-colors">Data: {new Date(b.date).toLocaleDateString('pt-PT')}</p>
                    <p className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 mt-0.5 transition-colors">Fração: {fractions.find(f => f.id === b.fractionId)?.code || 'N/A'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-[9px] font-black uppercase tracking-tighter px-4 py-1.5 rounded-full shadow-sm ${b.status === 'CONFIRMED' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                    }`}>
                    {b.status === 'CONFIRMED' ? 'Confirmada' : 'Pendente'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal para Configurar Área (ADMIN) */}
      {showAreaModal && isAdmin && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[110] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl max-w-lg w-full p-10 animate-scaleIn border border-slate-100 dark:border-slate-800 transition-colors">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-2xl font-black text-slate-800 dark:text-amber-200 tracking-tight">
                  {editingArea ? 'Configurar Espaço' : 'Novo Espaço Comum'}
                </h3>
                <p className="text-sm text-slate-400 dark:text-slate-500 font-medium">Defina os parâmetros de uso e custo</p>
              </div>
              <button
                onClick={() => setShowAreaModal(false)}
                className="w-10 h-10 flex items-center justify-center bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 rounded-full transition-colors font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAreaSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest ml-1">Nome da Área</label>
                <input
                  type="text"
                  value={areaFormData.name}
                  onChange={(e) => setAreaFormData({ ...areaFormData, name: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-100 dark:focus:border-indigo-900 focus:bg-white dark:focus:bg-slate-900 rounded-2xl px-5 py-4 text-sm font-bold text-slate-800 dark:text-amber-100 transition-all outline-none"
                  placeholder="Salão de Festas"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest ml-1">Lotação Máxima</label>
                  <input
                    type="number"
                    value={areaFormData.capacity}
                    onChange={(e) => setAreaFormData({ ...areaFormData, capacity: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-100 dark:focus:border-indigo-900 focus:bg-white dark:focus:bg-slate-900 rounded-2xl px-5 py-4 text-sm font-bold text-slate-800 dark:text-amber-100 transition-all outline-none"
                    placeholder="Pessoas"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest ml-1">Valor Utilização (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={areaFormData.price}
                    onChange={(e) => setAreaFormData({ ...areaFormData, price: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-100 dark:focus:border-indigo-900 focus:bg-white dark:focus:bg-slate-900 rounded-2xl px-5 py-4 text-sm font-bold text-slate-800 dark:text-amber-100 transition-all outline-none"
                    placeholder="0,00 €"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest ml-1">Regras e Observações</label>
                <textarea
                  value={areaFormData.rules}
                  onChange={(e) => setAreaFormData({ ...areaFormData, rules: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-100 dark:focus:border-indigo-900 focus:bg-white dark:focus:bg-slate-900 rounded-2xl px-5 py-4 text-sm font-medium text-slate-800 dark:text-amber-100 transition-all outline-none"
                  placeholder="Utilização até às 22h. Limpeza incluída."
                  rows={3}
                  required
                />
              </div>

              <div className="pt-4 flex flex-col gap-3">
                <button
                  type="submit"
                  className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black text-base shadow-xl shadow-indigo-100 dark:shadow-none active:scale-[0.97] transition-all hover:bg-indigo-700 uppercase tracking-widest"
                >
                  {editingArea ? 'Guardar Configurações' : 'Criar Novo Espaço'}
                </button>
                {editingArea && (
                  <button
                    type="button"
                    onClick={() => deleteArea(editingArea.id)}
                    className="w-full bg-rose-50 dark:bg-rose-900/30 text-rose-500 dark:text-rose-400 py-3 rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-rose-600 dark:hover:bg-rose-500 hover:text-white transition-all"
                  >
                    Eliminar Área Comum
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para Nova Reserva (USER/ADMIN) */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[110] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl max-w-lg w-full p-10 animate-scaleIn border border-slate-100 dark:border-slate-800 transition-colors">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-2xl font-black text-slate-800 dark:text-amber-200 tracking-tight">Nova Reserva</h3>
                <p className="text-sm text-slate-400 dark:text-slate-500 font-medium">Agende a sua utilização dos espaços</p>
              </div>
              <button onClick={() => setShowBookingModal(false)} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 text-xl font-bold transition-colors">✕</button>
            </div>

            <form onSubmit={handleBooking} className="space-y-5">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest ml-1">Espaço Pretendido</label>
                <select
                  value={bookingFormData.areaId}
                  onChange={e => setBookingFormData({ ...bookingFormData, areaId: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-100 dark:focus:border-indigo-900 focus:bg-white dark:focus:bg-slate-900 rounded-2xl px-5 py-4 text-sm font-black text-slate-800 dark:text-amber-100 transition-all outline-none appearance-none"
                  required
                >
                  <option value="">Selecione o espaço...</option>
                  {areas.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest ml-1">Data da Reserva</label>
                  <input
                    type="date"
                    value={bookingFormData.date}
                    onChange={e => setBookingFormData({ ...bookingFormData, date: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-100 dark:focus:border-indigo-900 focus:bg-white dark:focus:bg-slate-900 rounded-2xl px-5 py-4 text-sm font-bold text-slate-800 dark:text-amber-100 transition-all outline-none"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest ml-1">Fração Requerente</label>
                  <select
                    value={bookingFormData.fractionId}
                    onChange={e => setBookingFormData({ ...bookingFormData, fractionId: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-100 dark:focus:border-indigo-900 focus:bg-white dark:focus:bg-slate-900 rounded-2xl px-5 py-4 text-sm font-black text-slate-800 dark:text-amber-100 transition-all outline-none appearance-none"
                    required
                  >
                    <option value="">Quem reserva?</option>
                    {fractions.map(f => <option key={f.id} value={f.id}>{f.code} - {f.ownerName}</option>)}
                  </select>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowBookingModal(false)} className="flex-1 py-5 text-slate-400 dark:text-slate-500 font-black text-xs uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-all">Cancelar</button>
                <button type="submit" className="flex-1 bg-indigo-600 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 active:scale-95 transition-all">Confirmar Reserva</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommonAreas;
