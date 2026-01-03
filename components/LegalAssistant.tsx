
import React, { useState } from 'react';
import { getLegalAdvice } from '../geminiService';

const LegalAssistant: React.FC = () => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setLoading(true);
    setResponse('');
    const advice = await getLegalAdvice(query);
    setResponse(advice || '');
    setLoading(false);
  };

  const suggestions = [
    "O que diz a lei sobre o Fundo de Reserva?",
    "Quórum necessário para obras de fachada",
    "Prazos para convocatória de assembleia",
    "Como agir em caso de condómino devedor?"
  ];

  return (
    <div className="animate-fadeIn max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-block bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-amber-400 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-4 transition-colors">
          Inteligência Artificial RJH
        </div>
        <h2 className="text-3xl font-black text-slate-800 dark:text-amber-200 mb-2 transition-colors">Assistente Jurídico Seo Gestão</h2>
        <p className="text-slate-500 dark:text-slate-400 transition-colors">Dúvidas sobre o Regime Jurídico da Horizontal em segundos.</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden transition-all">
        <div className="p-8">
          <form onSubmit={handleSubmit} className="relative mb-8">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ex: Qual o quórum para instalar painéis solares?"
              className="w-full pl-6 pr-32 py-5 bg-slate-100 dark:bg-slate-800 border-none rounded-3xl focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/30 text-slate-800 dark:text-amber-100 font-medium transition-all outline-none"
            />
            <button 
              type="submit"
              disabled={loading}
              className="absolute right-3 top-3 bottom-3 bg-indigo-600 text-white px-6 rounded-2xl font-bold hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {loading ? '...' : 'Perguntar'}
            </button>
          </form>

          {(loading || response) && (
            <div className="bg-slate-50 dark:bg-slate-950 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 min-h-[200px] transition-all">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 transition-colors"></div>
                  <p className="text-indigo-600 dark:text-amber-400 font-bold text-sm transition-colors">A analisar legislação...</p>
                </div>
              ) : (
                <div className="prose prose-indigo dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 leading-relaxed transition-colors">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-indigo-600 dark:bg-amber-500 rounded-lg flex items-center justify-center text-white text-xs font-bold">PT</div>
                    <span className="font-black uppercase text-[10px] tracking-widest text-slate-400 dark:text-slate-500 transition-colors">Resposta Legal IA</span>
                  </div>
                  <div className="whitespace-pre-wrap">{response}</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LegalAssistant;
