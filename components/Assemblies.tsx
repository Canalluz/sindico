
import React, { useState, useEffect } from 'react';
import { INITIAL_BUILDING_DATA } from '../constants';
import { generateMeetingNotice, generateMinutes } from '../geminiService';
import { Assembly, User, Attendee, Resolution, Fraction } from '../types';
import { getAssemblies, createAssembly, updateAssembly, getFractions } from '../services/supabaseService';

interface AssembliesProps {
  user: User;
}

const Assemblies: React.FC<AssembliesProps> = ({ user }) => {
  const [assemblies, setAssemblies] = useState<Assembly[]>([]);
  const [fractions, setFractions] = useState<Fraction[]>([]);

  const [showForm, setShowForm] = useState(false);
  const [showMinutesForm, setShowMinutesForm] = useState(false);
  const [activeAssembly, setActiveAssembly] = useState<Assembly | null>(null);
  const [drafting, setDrafting] = useState(false);
  const [draftResult, setDraftResult] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewingNotice, setViewingNotice] = useState<Assembly | null>(null);
  const [viewingMinutes, setViewingMinutes] = useState<Assembly | null>(null);
  const [viewingContext, setViewingContext] = useState<Assembly | null>(null);

  const isAdmin = user.role === 'ADMIN';

  const [title, setTitle] = useState('Assembleia Geral Ordinária');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [agenda, setAgenda] = useState('');
  const [type, setType] = useState<'ORDINARY' | 'EXTRAORDINARY'>('ORDINARY');

  const [minutesData, setMinutesData] = useState({
    endTime: '',
    presidentName: '',
    secretaryName: '',
    attendees: [] as Attendee[],
    resolutions: [] as Resolution[]
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [assData, fracData] = await Promise.all([
        getAssemblies(),
        getFractions()
      ]);
      setAssemblies(assData);
      setFractions(fracData);
    } catch (error) {
      console.error('Erro ao carregar assembleias:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    setLoading(true);
    setDrafting(true);
    const agendaItems = agenda.split('\n').filter(item => item.trim() !== '');
    const text = await generateMeetingNotice(title, date, time, location, agendaItems);
    setDraftResult(text || '');
    setLoading(false);
  };

  const confirmAndSchedule = async () => {
    const agendaItems = agenda.split('\n').filter(item => item.trim() !== '');
    const newAssemblyData: Omit<Assembly, 'id'> = {
      date,
      time,
      location,
      type,
      status: 'PLANNED',
      title,
      noticeText: draftResult,
      resolutions: agendaItems.map(item => ({
        pointTitle: item,
        proposalDescription: '',
        discussionSummary: '',
        votesFor: 0,
        votesAgainst: 0,
        abstentions: 0,
        permilageFor: 0,
        status: 'REJECTED',
        majorityRequired: 'SIMPLE'
      }))
    };

    try {
      const created = await createAssembly(newAssemblyData);
      setAssemblies(prev => [created, ...prev]);
      resetForm();
    } catch (error) {
      console.error('Erro ao agendar assembleia:', error);
      alert('Erro ao agendar assembleia.');
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setDrafting(false);
    setDraftResult('');
    setTitle('Assembleia Geral Ordinária');
    setDate('');
    setTime('');
    setLocation('');
    setAgenda('');
    setType('ORDINARY');
  };

  const startMinutes = (assembly: Assembly) => {
    setActiveAssembly(assembly);

    const initialResolutions = assembly.resolutions && assembly.resolutions.length > 0
      ? assembly.resolutions
      : [{
        pointTitle: 'Ponto Único / Geral',
        proposalDescription: '',
        discussionSummary: '',
        votesFor: 0,
        votesAgainst: 0,
        abstentions: 0,
        permilageFor: 0,
        status: 'REJECTED' as const,
        majorityRequired: 'SIMPLE' as const
      }];

    setMinutesData({
      endTime: '',
      presidentName: INITIAL_BUILDING_DATA.adminName,
      secretaryName: '',
      attendees: [],
      resolutions: initialResolutions
    });
    setShowMinutesForm(true);
  };

  const addAttendee = (fractionId: string) => {
    const fraction = fractions.find(f => f.id === fractionId);
    if (fraction && !minutesData.attendees.find(a => a.fractionCode === fraction.code)) {
      const newAttendee: Attendee = {
        name: fraction.ownerName,
        fractionCode: fraction.code,
        role: 'OWNER',
        nif: fraction.nif
      };
      setMinutesData(prev => ({ ...prev, attendees: [...prev.attendees, newAttendee] }));
    } else if (fraction) {
      setMinutesData(prev => ({
        ...prev,
        attendees: prev.attendees.filter(a => a.fractionCode !== fraction.code)
      }));
    }
  };

  const handleResolutionChange = (index: number, field: keyof Resolution, value: any) => {
    const newResolutions = [...minutesData.resolutions];
    newResolutions[index] = { ...newResolutions[index], [field]: value };
    setMinutesData(prev => ({ ...prev, resolutions: newResolutions }));
  };

  const finalizeMinutes = async () => {
    if (!activeAssembly) return;
    setLoading(true);

    const fullData = {
      ...activeAssembly,
      ...minutesData,
      buildingName: INITIAL_BUILDING_DATA.name
    };

    const ataText = await generateMinutes(fullData);

    try {
      const updates = {
        ...minutesData,
        minutesText: ataText,
        status: 'COMPLETED' as const
      };
      const updated = await updateAssembly(activeAssembly.id, updates);

      setAssemblies(prev => prev.map(a => a.id === activeAssembly.id ? updated : a));

      setLoading(false);
      setShowMinutesForm(false);
      setActiveAssembly(null);
    } catch (error) {
      console.error('Erro ao finalizar ata:', error);
      alert('Erro ao salvar ata.');
      setLoading(false);
    }
  };

  return (
    <div className="animate-fadeIn space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-amber-200 tracking-tight transition-colors">Assembleias & Votações</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium transition-colors">Gestão democrática e validade jurídica (PT)</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 dark:shadow-none flex items-center gap-2 active:scale-95"
          >
            <span className="text-xl">📝</span> Convocar Assembleia
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-black text-slate-800 dark:text-amber-200 text-lg mb-4 flex items-center gap-2 transition-colors">
            <span>📅</span> Sessões Agendadas
          </h3>
          {assemblies.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 p-20 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-slate-800 text-center text-slate-400 dark:text-slate-600 font-bold uppercase tracking-widest text-xs transition-colors">
              Sem registos
            </div>
          ) : (
            assemblies.map(a => (
              <div key={a.id} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group overflow-hidden">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-inner transition-colors ${a.status === 'COMPLETED' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500' : 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500'
                      }`}>
                      {a.type === 'ORDINARY' ? '🏛️' : '⚡'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded transition-colors ${a.status === 'COMPLETED' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                          }`}>
                          {a.status === 'COMPLETED' ? '✓ Realizada' : '⌛ Agendada'}
                        </span>
                        <span className="text-xs font-black text-slate-800 dark:text-amber-100 transition-colors">{a.title}</span>
                      </div>
                      <p className="text-xs text-slate-400 dark:text-slate-500 font-medium transition-colors">
                        📅 {new Date(a.date).toLocaleDateString('pt-PT')}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 w-full md:w-auto">
                    <button
                      onClick={() => setViewingContext(a)}
                      className="flex-1 md:flex-none bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-amber-200 px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-slate-100 border border-slate-100 dark:border-slate-700 transition-all"
                    >
                      🔍 Resumo
                    </button>
                    {a.status === 'COMPLETED' ? (
                      <button
                        onClick={() => setViewingMinutes(a)}
                        className="flex-1 md:flex-none bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md"
                      >
                        📄 Ver Ata
                      </button>
                    ) : (
                      <button
                        onClick={() => startMinutes(a)}
                        className="flex-1 md:flex-none bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md"
                      >
                        Redigir Ata
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="bg-slate-900 dark:bg-slate-950 text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col justify-between transition-colors border border-slate-800/50">
          <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px]"></div>
          <div className="relative z-10">
            <h3 className="text-2xl font-black mb-4 tracking-tight dark:text-amber-200 transition-colors">Registo Oficial</h3>
            <p className="text-sm text-slate-300 dark:text-slate-400 leading-relaxed transition-colors">
              Utilize o <strong>Resumo</strong> para consultar votações rápidas (Sim/Não) sem abrir o documento formal.
            </p>
          </div>
        </div>
      </div>

      {/* Modal Visualizar Contexto (Resumo) */}
      {viewingContext && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[140] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl max-w-4xl w-full p-10 animate-scaleIn border border-slate-100 dark:border-slate-800 transition-colors">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-2xl font-black text-slate-800 dark:text-amber-200 tracking-tight transition-colors">{viewingContext.title}</h3>
                <p className="text-sm text-slate-400 dark:text-slate-500 font-medium transition-colors">Resumo das Deliberações</p>
              </div>
              <button onClick={() => setViewingContext(null)} className="w-10 h-10 flex items-center justify-center bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-rose-500 rounded-full font-bold transition-colors">✕</button>
            </div>

            <div className="space-y-6 overflow-y-auto max-h-[60vh] pr-2 custom-scrollbar">
              {viewingContext.resolutions?.map((res, idx) => (
                <div key={idx} className="bg-slate-50 dark:bg-slate-950 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-base font-black text-slate-800 dark:text-amber-50 transition-colors">{res.pointTitle}</h4>
                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase transition-colors ${res.status === 'APPROVED' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}>
                      {res.status === 'APPROVED' ? 'Aprovado' : 'Rejeitado'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                    <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800 text-center transition-colors">
                      <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Favor</p>
                      <p className="text-lg font-black text-slate-800 dark:text-amber-100 transition-colors">{res.votesFor}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800 text-center transition-colors">
                      <p className="text-[8px] font-black text-rose-500 uppercase tracking-widest">Contra</p>
                      <p className="text-lg font-black text-slate-800 dark:text-amber-100 transition-colors">{res.votesAgainst}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal Redação de Ata (ADMIN) */}
      {showMinutesForm && isAdmin && activeAssembly && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[120] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl max-w-5xl w-full p-10 animate-scaleIn border border-slate-100 dark:border-slate-800 transition-colors">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-2xl font-black text-slate-800 dark:text-amber-200 tracking-tight transition-colors">Redigir Ata Oficial</h3>
                <p className="text-sm text-slate-400 dark:text-slate-500 font-medium transition-colors">{activeAssembly.title}</p>
              </div>
              <button onClick={() => setShowMinutesForm(false)} className="w-10 h-10 flex items-center justify-center bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-rose-500 rounded-full font-bold transition-colors">✕</button>
            </div>

            <div className="space-y-12 overflow-y-auto max-h-[70vh] pr-4 custom-scrollbar">
              {/* Conteúdo do formulário de ata... */}
              <div className="bg-slate-50 dark:bg-slate-950 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-6 transition-colors">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest transition-colors">Presidente da Mesa</label>
                  <input type="text" value={minutesData.presidentName} onChange={(e) => setMinutesData({ ...minutesData, presidentName: e.target.value })} className="w-full bg-white dark:bg-slate-900 text-slate-800 dark:text-amber-50 rounded-xl px-4 py-3 text-sm font-bold border-none outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 transition-colors" />
                </div>
              </div>

              <div className="pt-8 flex flex-col gap-4">
                <button onClick={finalizeMinutes} disabled={loading} className="w-full bg-slate-900 dark:bg-indigo-600 text-white py-7 rounded-[2.5rem] font-black text-xl shadow-2xl dark:shadow-none hover:bg-black dark:hover:bg-indigo-700 transition-all uppercase tracking-widest">
                  {loading ? 'A GERAR ATA JURÍDICA...' : 'FINALIZAR E GERAR ATA OFICIAL'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Assemblies;
