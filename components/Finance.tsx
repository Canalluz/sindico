
import React, { useState, useEffect } from 'react';
import { INITIAL_BUILDING_DATA } from '../constants';
import { TransactionType, Transaction, User } from '../types';
import { getTransactions, createTransaction } from '../services/supabaseService';

interface FinanceProps {
  user: User;
}

const Finance: React.FC<FinanceProps> = ({ user }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showPaymentMock, setShowPaymentMock] = useState(false);
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [mbWayStep, setMbWayStep] = useState(1);
  const [loading, setLoading] = useState(true);

  const isAdmin = user.role === 'ADMIN';

  const [iban, setIban] = useState(INITIAL_BUILDING_DATA.iban || '');
  const [isConfiguringSepa, setIsConfiguringSepa] = useState(false);
  const [sepaPassword, setSepaPassword] = useState('');
  const [isSepaUnlocked, setIsSepaUnlocked] = useState(true);
  const [passwordError, setPasswordError] = useState(false);

  const [formData, setFormData] = useState<Omit<Transaction, 'id'>>({
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: 0,
    ivaRate: 23,
    type: TransactionType.EXPENSE,
    category: 'Manutenção'
  });

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const data = await getTransactions();
      setTransactions(data);
    } catch (error) {
      console.error('Erro ao carregar transações:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cálculos Dinâmicos
  const totalIncome = transactions
    .filter(t => t.type === TransactionType.INCOME)
    .reduce((acc, t) => acc + t.amount, 0);

  const iva6Value = transactions
    .filter(t => t.type === TransactionType.EXPENSE && t.ivaRate === 6)
    .reduce((acc, t) => acc + (t.amount * 0.06), 0);

  const iva23Value = transactions
    .filter(t => t.type === TransactionType.EXPENSE && t.ivaRate === 23)
    .reduce((acc, t) => acc + (t.amount * 0.23), 0);

  const reserveFundValue = totalIncome * 0.10; // 10% Fundo de Reserva Legal

  const irsRetentionValue = transactions
    .filter(t => t.category.toLowerCase().includes('irs') || t.description.toLowerCase().includes('irs'))
    .reduce((acc, t) => acc + t.amount, 0);

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    try {
      const newT = await createTransaction(formData);
      setTransactions(prev => [newT, ...prev]);
      setShowAddTransaction(false);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        description: '',
        amount: 0,
        ivaRate: 23,
        type: TransactionType.EXPENSE,
        category: 'Manutenção'
      });
    } catch (error) {
      console.error('Erro ao adicionar transação:', error);
      alert('Erro ao registar movimento.');
    }
  };

  const handleUnlockSepa = (e: React.FormEvent) => {
    e.preventDefault();
    if (sepaPassword === '123456') {
      setIsSepaUnlocked(true);
      setPasswordError(false);
    } else {
      setPasswordError(true);
      setTimeout(() => setPasswordError(false), 2000);
    }
  };

  const formatCurrency = (val: number) =>
    val.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' });

  return (
    <div className="animate-fadeIn space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-amber-200 transition-colors">Contabilidade & Fiscalidade</h2>
          <p className="text-slate-500 dark:text-slate-400 transition-colors">Gestão financeira conforme o regime jurídico</p>
        </div>
        <div className="flex gap-3">
          {isAdmin && (
            <button
              onClick={() => setShowAddTransaction(true)}
              className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100 dark:shadow-none flex items-center gap-2"
            >
              <span>+</span> Registar Movimento
            </button>
          )}
          <button
            onClick={() => {
              setMbWayStep(1);
              setShowPaymentMock(true);
              setIsConfiguringSepa(false);
              setIsSepaUnlocked(false);
              setSepaPassword('');
            }}
            className="bg-white dark:bg-slate-900 text-indigo-600 dark:text-amber-400 border border-indigo-200 dark:border-slate-800 px-5 py-2.5 rounded-xl font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center gap-2"
          >
            💳 Pagamentos PT
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'IVA Pago (6%)', val: formatCurrency(iva6Value), color: 'text-indigo-600 dark:text-amber-400' },
          { label: 'IVA Pago (23%)', val: formatCurrency(iva23Value), color: 'text-indigo-600 dark:text-amber-400' },
          { label: 'Fundo de Reserva', val: formatCurrency(reserveFundValue), color: 'text-emerald-600 dark:text-emerald-400' },
          { label: 'Retenções IRS', val: formatCurrency(irsRetentionValue), color: 'text-rose-600 dark:text-rose-400' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
            <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 dark:text-slate-500 mb-1 transition-colors">{stat.label}</p>
            <p className={`text-xl font-black ${stat.color} transition-colors`}>{stat.val}</p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center transition-colors">
          <h3 className="font-bold text-slate-800 dark:text-amber-200 transition-colors">Histórico de Lançamentos</h3>
          <div className="flex gap-4">
            <button className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-amber-400 hover:underline">SAF-T (PT)</button>
            <button className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-amber-400 hover:underline">Balancete</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 text-[10px] uppercase font-black tracking-widest transition-colors">
                <th className="px-6 py-4">Data</th>
                <th className="px-6 py-4">Descrição</th>
                <th className="px-6 py-4">Categoria</th>
                <th className="px-6 py-4">Taxa IVA</th>
                <th className="px-6 py-4 text-right">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800 transition-colors">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 dark:text-slate-600 font-medium transition-colors">
                    Nenhum movimento registado para o período atual.
                  </td>
                </tr>
              ) : (
                transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                    <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-500">{new Date(t.date).toLocaleDateString('pt-PT')}</td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-800 dark:text-amber-50 transition-colors">{t.description}</td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2.5 py-1 rounded-lg uppercase tracking-wider transition-colors">{t.category}</span>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-400 dark:text-slate-500">{t.ivaRate}%</td>
                    <td className={`px-6 py-4 text-sm font-black text-right transition-colors ${t.type === TransactionType.INCOME ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {t.type === TransactionType.INCOME ? '+' : '-'} {formatCurrency(t.amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddTransaction && isAdmin && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl max-w-lg w-full p-8 animate-scaleIn border border-slate-100 dark:border-slate-800 transition-colors">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-amber-200 transition-colors">Novo Lançamento</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 transition-colors">Contabilidade oficial do condomínio</p>
              </div>
              <button onClick={() => setShowAddTransaction(false)} className="text-slate-400 dark:text-slate-500 hover:text-rose-500 transition-colors">✕</button>
            </div>

            <form onSubmit={handleAddTransaction} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-2 ml-1 transition-colors">Tipo</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as TransactionType })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm font-bold text-slate-800 dark:text-amber-100 outline-none transition-colors appearance-none"
                  >
                    <option value={TransactionType.EXPENSE}>Saída (Custo)</option>
                    <option value={TransactionType.INCOME}>Entrada (Quota)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-2 ml-1 transition-colors">IVA (%)</label>
                  <select
                    value={formData.ivaRate}
                    onChange={(e) => setFormData({ ...formData, ivaRate: Number(e.target.value) as any })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm font-bold text-slate-800 dark:text-amber-100 outline-none transition-colors appearance-none"
                  >
                    <option value={0}>0% (Isento)</option>
                    <option value={6}>6% (Reduzida)</option>
                    <option value={13}>13% (Intermédia)</option>
                    <option value={23}>23% (Normal)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-2 ml-1 transition-colors">Descrição</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm font-bold text-slate-800 dark:text-amber-100 outline-none transition-colors"
                  placeholder="Ex: Quota Mensal, Reparação Elevador..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-2 ml-1 transition-colors">Valor Bruto (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm font-bold text-slate-800 dark:text-amber-100 outline-none transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-2 ml-1 transition-colors">Categoria</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm font-bold text-slate-800 dark:text-amber-100 outline-none transition-colors"
                    placeholder="Ex: Quotas, Manutenção..."
                    required
                  />
                </div>
              </div>

              <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold mt-4 shadow-xl dark:shadow-none hover:bg-indigo-700 transition-all">
                Validar e Registar
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Finance;
