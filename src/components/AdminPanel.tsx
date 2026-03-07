import React, { useState } from 'react';
import { ChampionshipData, SeasonId } from '../types';
import { Loader2, Lock, Settings, Trophy, Users, Flag, Calendar as CalendarIcon, Database, Info } from 'lucide-react';
import { cn } from '../lib/utils';
import { verifyPassword } from '../lib/auth';
import { ResultsEditor } from './admin/ResultsEditor';
import { DriversEditor } from './admin/DriversEditor';
import { TeamsEditor } from './admin/TeamsEditor';
import { CalendarEditor } from './admin/CalendarEditor';
import { JsonImporter } from './admin/JsonImporter';

interface AdminPanelProps {
  data: ChampionshipData;
  onUpdateData: (newData: ChampionshipData) => void;
  activeSeason: SeasonId;
}

type AdminTab = 'results' | 'drivers' | 'teams' | 'calendar' | 'import';

export function AdminPanel({ data, onUpdateData, activeSeason }: AdminPanelProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<AdminTab>('teams');

  const isHistorical = activeSeason === '2024';
  const accentColor = isHistorical ? "text-amber-500" : "text-red-500";
  const buttonColor = isHistorical ? "bg-amber-600 hover:bg-amber-700" : "bg-red-600 hover:bg-red-700";
  const ringColor = isHistorical ? "focus:ring-amber-500" : "focus:ring-red-500";
  const borderColor = isHistorical ? "border-amber-500/30" : "border-red-500/30";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
        const isValid = await verifyPassword(password);
        if (isValid) {
          setIsAuthenticated(true);
          setError(null);
        } else {
          setError('Contraseña incorrecta');
        }
    } catch (err) {
        console.error("Auth error", err);
        setError("Error de autenticación");
    } finally {
        setIsProcessing(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <div className={cn("bg-slate-900 border p-8 rounded-2xl shadow-2xl max-w-md w-full", isHistorical ? "border-amber-500/20" : "border-white/10")}>
          <div className="flex justify-center mb-6">
            <div className={cn("p-4 rounded-full", isHistorical ? "bg-amber-500/10" : "bg-red-500/10")}>
              <Lock className={cn("w-8 h-8", accentColor)} />
            </div>
          </div>
          <h2 className="text-2xl font-black italic text-white text-center mb-6 uppercase">Acceso Admin</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa Contraseña"
                className={cn(
                    "w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none transition-colors",
                    ringColor
                )}
                disabled={isProcessing}
              />
            </div>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <button
              type="submit"
              disabled={isProcessing}
              className={cn(
                  "w-full text-white font-bold py-3 rounded-lg uppercase tracking-wider transition-colors flex items-center justify-center gap-2 disabled:opacity-50",
                  buttonColor
              )}
            >
              {isProcessing ? <Loader2 className="animate-spin" size={20} /> : 'Desbloquear Panel'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20 -mx-4 md:-mx-8">
      {/* Admin Header - Full Width */}
      <div className="px-4 md:px-8 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-3xl font-black italic text-white uppercase tracking-tighter flex items-center gap-3">
            <Settings className={cn("w-8 h-8", accentColor)} />
            Panel de Administración
            <span className={cn(
                "text-sm px-3 py-1 rounded-full border bg-slate-900/50 ml-2",
                isHistorical ? "border-amber-500/30 text-amber-500" : "border-red-500/30 text-red-500"
            )}>
                {isHistorical ? "EDITANDO 2024" : "EDITANDO 2026"}
            </span>
          </h2>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-0 border-t border-white/5 min-h-[70vh]">
        {/* Sidebar Navigation - Fixed Width on Desktop */}
        <aside className={cn(
            "w-full lg:w-72 border-r border-white/5 bg-slate-900/20 backdrop-blur-sm p-6 space-y-8 shrink-0",
            isHistorical ? "border-amber-500/10" : "border-white/5"
        )}>
          
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4 px-4">Navegación</p>
            <button
                onClick={() => setActiveTab('teams')}
                className={cn(
                "w-full text-left px-4 py-3 rounded-xl font-bold uppercase text-sm tracking-wider flex items-center gap-3 transition-all group",
                activeTab === 'teams' 
                    ? cn("bg-white/10 text-white border border-white/10 shadow-lg", isHistorical && "border-amber-500/30 shadow-amber-500/10")
                    : "text-slate-500 hover:text-white hover:bg-white/5"
                )}
            >
                <Trophy size={18} className={cn("transition-transform group-hover:scale-110", activeTab === 'teams' ? accentColor : "")} />
                1. Escuderías
            </button>

            <button
                onClick={() => setActiveTab('drivers')}
                className={cn(
                "w-full text-left px-4 py-3 rounded-xl font-bold uppercase text-sm tracking-wider flex items-center gap-3 transition-all group",
                activeTab === 'drivers' 
                    ? cn("bg-white/10 text-white border border-white/10 shadow-lg", isHistorical && "border-amber-500/30 shadow-amber-500/10")
                    : "text-slate-500 hover:text-white hover:bg-white/5"
                )}
            >
                <Users size={18} className={cn("transition-transform group-hover:scale-110", activeTab === 'drivers' ? accentColor : "")} />
                2. Pilotos
            </button>

            <button
                onClick={() => setActiveTab('calendar')}
                className={cn(
                "w-full text-left px-4 py-3 rounded-xl font-bold uppercase text-sm tracking-wider flex items-center gap-3 transition-all group",
                activeTab === 'calendar' 
                    ? cn("bg-white/10 text-white border border-white/10 shadow-lg", isHistorical && "border-amber-500/30 shadow-amber-500/10")
                    : "text-slate-500 hover:text-white hover:bg-white/5"
                )}
            >
                <CalendarIcon size={18} className={cn("transition-transform group-hover:scale-110", activeTab === 'calendar' ? accentColor : "")} />
                3. Calendario
            </button>

            <button
                onClick={() => setActiveTab('results')}
                className={cn(
                "w-full text-left px-4 py-3 rounded-xl font-bold uppercase text-sm tracking-wider flex items-center gap-3 transition-all group",
                activeTab === 'results' 
                    ? cn("bg-white/10 text-white border border-white/10 shadow-lg", isHistorical && "border-amber-500/30 shadow-amber-500/10")
                    : "text-slate-500 hover:text-white hover:bg-white/5"
                )}
            >
                <Flag size={18} className={cn("transition-transform group-hover:scale-110", activeTab === 'results' ? accentColor : "")} />
                4. Resultados
            </button>

            <div className="h-px bg-white/5 my-4 mx-4"></div>

            <button
                onClick={() => setActiveTab('import')}
                className={cn(
                "w-full text-left px-4 py-3 rounded-xl font-bold uppercase text-sm tracking-wider flex items-center gap-3 transition-all group",
                activeTab === 'import' 
                    ? cn("bg-white/10 text-white border border-white/10 shadow-lg", isHistorical && "border-amber-500/30 shadow-amber-500/10")
                    : "text-slate-500 hover:text-white hover:bg-white/5"
                )}
            >
                <Database size={18} className={cn("transition-transform group-hover:scale-110", activeTab === 'import' ? accentColor : "")} />
                Mantenimiento
            </button>
          </div>

          {/* FAQ / Instructions Block */}
          <div className={cn(
              "p-5 rounded-2xl border text-xs space-y-3",
              isHistorical ? "bg-amber-900/10 border-amber-500/20 text-amber-200/80" : "bg-slate-950 border-white/5 text-slate-400"
          )}>
              <h4 className="font-bold uppercase tracking-wider text-white flex items-center gap-2">
                  <Info size={14} className={accentColor} /> Guía Rápida
              </h4>
              <p className="leading-relaxed">Sigue este orden para configurar la temporada:</p>
              <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className={cn("w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0", isHistorical ? "bg-amber-500/20 text-amber-500" : "bg-red-500/20 text-red-500")}>1</span>
                    <span>Crea las <strong className="text-white">Escuderías</strong>.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className={cn("w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0", isHistorical ? "bg-amber-500/20 text-amber-500" : "bg-red-500/20 text-red-500")}>2</span>
                    <span>Registra a los <strong className="text-white">Pilotos</strong>.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className={cn("w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0", isHistorical ? "bg-amber-500/20 text-amber-500" : "bg-red-500/20 text-red-500")}>3</span>
                    <span>Define el <strong className="text-white">Calendario</strong>.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className={cn("w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0", isHistorical ? "bg-amber-500/20 text-amber-500" : "bg-red-500/20 text-red-500")}>4</span>
                    <span>Sube los <strong className="text-white">Resultados</strong>.</span>
                  </li>
              </ul>
              <div className="mt-4 pt-4 border-t border-white/5 text-[10px] italic opacity-60">
                <p>Usa la IA para procesar capturas de pantalla de los resultados finales.</p>
              </div>
          </div>
        </aside>

        {/* Content Area - Flexible and Scrollable */}
        <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
          <div className="max-w-full">
            {activeTab === 'teams' && (
              <TeamsEditor 
                data={data} 
                onUpdateData={onUpdateData} 
                activeSeason={activeSeason} 
                isHistorical={isHistorical} 
              />
            )}
            {activeTab === 'drivers' && (
              <DriversEditor 
                data={data} 
                onUpdateData={onUpdateData} 
                activeSeason={activeSeason} 
                isHistorical={isHistorical} 
              />
            )}
            {activeTab === 'calendar' && (
              <CalendarEditor 
                data={data} 
                onUpdateData={onUpdateData} 
                activeSeason={activeSeason} 
                isHistorical={isHistorical} 
              />
            )}
            {activeTab === 'results' && (
              <ResultsEditor 
                data={data} 
                onUpdateData={onUpdateData} 
                activeSeason={activeSeason} 
                isHistorical={isHistorical} 
              />
            )}
            {activeTab === 'import' && (
              <JsonImporter 
                currentData={data} 
                onUpdateData={onUpdateData} 
                activeSeason={activeSeason} 
                isHistorical={isHistorical} 
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
