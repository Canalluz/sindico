
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, LabelList } from 'recharts';
import { TransactionType, Fraction, Transaction, Inspection } from '../types';
import { getFractions, getTransactions, getInspections } from '../services/supabaseService';

const Dashboard: React.FC = () => {
  const [fractions, setFractions] = useState<Fraction[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [fracData, transData, inspData] = await Promise.all([
        getFractions(),
        getTransactions(),
        getInspections()
      ]);
      setFractions(fracData);
      setTransactions(transData);
      setInspections(inspData);
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalBalance = transactions.reduce((acc, t) =>
    t.type === TransactionType.INCOME ? acc + t.amount : acc - t.amount, 0
  );

  const pendingQuotas = fractions.filter(f => f.status !== 'PAID').length;
  const reserveFund = totalBalance * 0.12; // Exemplo de cálculo

  // Processar dados mensais para o gráfico
  const processMonthlyData = () => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const currentYear = new Date().getFullYear();

    return months.map((name, index) => {
      const monthTrans = transactions.filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === index && d.getFullYear() === currentYear;
      });

      const inc = monthTrans.filter(t => t.type === TransactionType.INCOME).reduce((s, t) => s + t.amount, 0);
      const exp = monthTrans.filter(t => t.type === TransactionType.EXPENSE).reduce((s, t) => s + t.amount, 0);

      return { name, inc, exp };
    });
  };

  const monthlyData = processMonthlyData();

  const statusData = [
    { name: 'Em Dia', value: fractions.filter(f => f.status === 'PAID').length },
    { name: 'Pendente', value: fractions.filter(f => f.status === 'PENDING').length },
    { name: 'Atraso', value: fractions.filter(f => f.status === 'OVERDUE').length },
  ];

  const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

  const renderCustomizedPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, value, name }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius * 1.2;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill={COLORS[index % COLORS.length]}
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-[10px] font-bold"
      >
        {value > 0 ? `${name}: ${value}` : ''}
      </text>
    );
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-amber-200">Visão Geral</h2>
          <p className="text-slate-500 dark:text-slate-400">Resumo do estado financeiro do condomínio</p>
        </div>
        <div className="text-left md:text-right">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Saldo Atual</span>
          <p className="text-3xl font-black text-indigo-600 dark:text-amber-400 transition-colors">
            {totalBalance.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between transition-colors">
          <div className="flex items-center gap-4">
            <div className="bg-amber-100 dark:bg-amber-900/30 p-3 rounded-2xl">🔔</div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Frações em Falta</p>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-amber-100 transition-colors">{pendingQuotas}</h3>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-800 flex justify-between items-center text-xs">
            <span className="text-amber-600 dark:text-amber-400 font-semibold">Estado das Quotas</span>
            <button className="text-indigo-600 dark:text-indigo-400 hover:underline">Ver frações</button>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between transition-colors">
          <div className="flex items-center gap-4">
            <div className="bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-2xl">💰</div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Fundo de Reserva</p>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-amber-100 transition-colors">
                {reserveFund.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}
              </h3>
            </div>
          </div>
          <p className="mt-4 text-xs text-slate-400 dark:text-slate-500 transition-colors">Calculado sobre o saldo disponível</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between transition-colors">
          <div className="flex items-center gap-4">
            <div className="bg-rose-100 dark:bg-rose-900/30 p-3 rounded-2xl">🔧</div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Manutenções Críticas</p>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-amber-100 transition-colors">
                {inspections.filter(i => i.status !== 'OK' && i.status !== 'COMPLETED').length}
              </h3>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-800 flex justify-between items-center text-xs">
            <span className="text-rose-600 dark:text-rose-400 font-semibold">Alertas de segurança</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm min-h-[400px] flex flex-col transition-colors">
          <h3 className="font-bold text-slate-800 dark:text-amber-200 mb-6 transition-colors">Fluxo de Caixa Anual (EUR)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.1} />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                />
                <YAxis axisLine={false} tickLine={false} hide />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    fontSize: '12px',
                    backgroundColor: '#1e293b',
                    color: '#f1f5f9'
                  }}
                />
                <Bar dataKey="inc" fill="#6366f1" radius={[4, 4, 0, 0]} name="Receitas">
                  <LabelList dataKey="inc" position="top" style={{ fontSize: '9px', fill: '#6366f1', fontWeight: 'bold' }} />
                </Bar>
                <Bar dataKey="exp" fill="#475569" radius={[4, 4, 0, 0]} name="Despesas">
                  <LabelList dataKey="exp" position="top" style={{ fontSize: '9px', fill: '#94a3b8', fontWeight: 'bold' }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center min-h-[400px] transition-colors">
          <h3 className="font-bold text-slate-800 dark:text-amber-200 mb-6 w-full text-left transition-colors">Estado de Pagamento Quotas</h3>
          {fractions.length > 0 ? (
            <>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      label={renderCustomizedPieLabel}
                      labelLine={true}
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 gap-4 border-2 border-dashed border-slate-50 dark:border-slate-800 rounded-[2rem] w-full transition-colors">
              <span className="text-4xl opacity-20">🥧</span>
              <p className="text-xs font-bold uppercase tracking-widest">Registe frações para ver o resumo</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
