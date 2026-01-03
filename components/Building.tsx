
import React, { useState } from 'react';
import { INITIAL_BUILDING_DATA } from '../constants';
import { BuildingInfo } from '../types';

const Building: React.FC = () => {
  const [building, setBuilding] = useState<BuildingInfo>(INITIAL_BUILDING_DATA);
  const [isEditing, setIsEditing] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBuilding(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="animate-fadeIn space-y-8 max-w-4xl">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-amber-200 transition-colors">Dados do Edifício</h2>
          <p className="text-slate-500 dark:text-slate-400 transition-colors">Informação legal e administrativa do condomínio</p>
        </div>
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100 dark:shadow-none flex items-center gap-2"
          >
            <span>✏️</span> Editar Dados
          </button>
        )}
      </header>

      {savedSuccess && (
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 px-6 py-4 rounded-2xl flex items-center gap-3 animate-bounce">
          <span>✅</span> Os dados foram atualizados com sucesso.
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
            <div className="space-y-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-amber-500 border-b border-indigo-50 dark:border-slate-800 pb-2 transition-colors">Identificação</h3>
              
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase transition-colors">Nome do Condomínio</label>
                {isEditing ? (
                  <input 
                    type="text" 
                    name="name"
                    value={building.name}
                    onChange={handleChange}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/50 text-slate-800 dark:text-amber-100 font-semibold transition-colors outline-none"
                    required
                  />
                ) : (
                  <p className="text-lg font-bold text-slate-800 dark:text-amber-100 py-2 transition-colors">{building.name || 'Não definido'}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase transition-colors">Morada Completa</label>
                {isEditing ? (
                  <input 
                    type="text" 
                    name="address"
                    value={building.address}
                    onChange={handleChange}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/50 text-slate-800 dark:text-amber-100 transition-colors outline-none"
                    required
                  />
                ) : (
                  <p className="text-slate-600 dark:text-slate-400 py-2 leading-relaxed transition-colors">{building.address || 'Não definida'}</p>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-amber-500 border-b border-indigo-50 dark:border-slate-800 pb-2 transition-colors">Fiscalidade & Gestão</h3>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase transition-colors">NIF do Condomínio (NIPC)</label>
                {isEditing ? (
                  <input 
                    type="text" 
                    name="nif"
                    value={building.nif}
                    onChange={handleChange}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/50 text-slate-800 dark:text-amber-100 font-mono transition-colors outline-none"
                    placeholder="9 dígitos"
                    required
                  />
                ) : (
                  <p className="text-lg font-mono font-bold text-slate-800 dark:text-amber-100 py-2 tracking-wider transition-colors">{building.nif || '--- --- ---'}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase transition-colors">Nome do Administrador</label>
                {isEditing ? (
                  <input 
                    type="text" 
                    name="adminName"
                    value={building.adminName}
                    onChange={handleChange}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900/50 text-slate-800 dark:text-amber-100 transition-colors outline-none"
                    required
                  />
                ) : (
                  <p className="text-slate-800 dark:text-amber-200 font-medium py-2 transition-colors">{building.adminName || 'Não definido'}</p>
                )}
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="pt-8 border-t border-slate-50 dark:border-slate-800 flex gap-4 transition-colors">
              <button 
                type="submit"
                className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 transition-all"
              >
                Guardar Alterações
              </button>
              <button 
                type="button"
                onClick={() => setIsEditing(false)}
                className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-8 py-3 rounded-2xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              >
                Cancelar
              </button>
            </div>
          )}
        </form>
      </div>

      <div className="bg-indigo-50 dark:bg-indigo-950/30 p-8 rounded-[2.5rem] border border-indigo-100 dark:border-indigo-900/50 flex flex-col md:flex-row gap-6 items-center transition-colors">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl shadow-sm text-3xl transition-colors">🏛️</div>
        <div>
          <h4 className="font-bold text-indigo-900 dark:text-amber-300 transition-colors">Cartão de Cidadão do Condomínio</h4>
          <p className="text-indigo-700/70 dark:text-slate-400 text-sm leading-relaxed transition-colors">Esta informação será utilizada automaticamente na geração de atas, convocações e faturas SAF-T.</p>
        </div>
      </div>
    </div>
  );
};

export default Building;
