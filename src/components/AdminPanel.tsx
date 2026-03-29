import React, { useState } from 'react';
import { Loader2, Lock, Settings, Trophy, Users, Flag, Calendar as CalendarIcon, Database, Info, RefreshCw, PanelLeftClose, PanelLeftOpen, Compass } from 'lucide-react';
import { cn } from '../lib/utils';
import { verifyPassword } from '../lib/auth';
import { dataService } from '../services/dataService';
import { ResultsEditor } from './admin/ResultsEditor';
import { DriversEditor } from './admin/DriversEditor';
import { TeamsEditor } from './admin/TeamsEditor';
import { CalendarEditor } from './admin/CalendarEditor';
import { JsonImporter } from './admin/JsonImporter';
import { useChampionship } from '../context/ChampionshipContext';

type AdminTab = 'results' | 'drivers' | 'teams' | 'calendar' | 'import' | 'settings';

export function AdminPanel() {
  const { data, setData, activeSeason, isHistorical, refreshData } = useChampionship();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<AdminTab>('teams');
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
      <div className="flex flex-col items-center justify-center min-h-[70vh] relative">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center opacity-10">
          <div className={cn("w-[800px] h-[800px] rounded-full blur-3xl", isHistorical ? "bg-amber-600" : "bg-red-600")}></div>
        </div>

        <div className={cn(
            "relative z-10 bg-slate-900/80 backdrop-blur-xl border p-8 md:p-10 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden", 
            isHistorical ? "border-amber-500/30 shadow-amber-900/20" : "border-red-500/30 shadow-red-900/20"
        )}>
          {/* Top accent bar */}
          <div className={cn("absolute top-0 left-0 right-0 h-2", isHistorical ? "bg-amber-500" : "bg-red-600")}></div>
          
          <div className="flex flex-col items-center mb-8">
            <div className={cn(
                "p-4 rounded-2xl mb-4 transform -rotate-6", 
                isHistorical ? "bg-amber-500/20 text-amber-500" : "bg-red-500/20 text-red-500"
            )}>
              <Lock className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-black italic text-white text-center uppercase tracking-tighter">
              Control de Carrera
            </h2>
            
            {/* Season Badge */}
            <div className={cn(
                "mt-4 px-6 py-2 rounded-full border-2 font-black italic text-xl uppercase tracking-widest shadow-lg",
                isHistorical 
                    ? "border-amber-500/50 text-amber-400 bg-amber-950/50 shadow-amber-900/20" 
                    : "border-red-500/50 text-red-400 bg-red-950/50 shadow-red-900/20"
            )}>
              Temporada {activeSeason}
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">
                Código de Autorización
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={cn(
                      "w-full bg-slate-950 border-2 rounded-xl px-4 py-4 text-white text-center text-xl tracking-[0.5em] focus:outline-none transition-all",
                      isHistorical ? "border-slate-800 focus:border-amber-500" : "border-slate-800 focus:border-red-500"
                  )}
                  disabled={isProcessing}
                />
              </div>
            </div>
            
            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm text-center font-medium animate-in fade-in slide-in-from-top-2">
                    {error}
                </div>
            )}
            
            <button
              type="submit"
              disabled={isProcessing || !password}
              className={cn(
                  "w-full text-white font-black py-4 rounded-xl uppercase tracking-widest transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02]",
                  buttonColor
              )}
            >
              {isProcessing ? (
                  <>
                    <Loader2 className="animate-spin" size={20} /> 
                    <span>Verificando...</span>
                  </>
              ) : (
                  <>
                    <span>Acceder</span>
                    <Lock size={18} className="opacity-50" />
                  </>
              )}
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
          <button
            onClick={async () => {
              setIsRefreshing(true);
              await refreshData();
              setIsRefreshing(false);
            }}
            disabled={isRefreshing}
            className={cn(
              "px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors border shadow-sm disabled:opacity-50",
              isHistorical 
                ? "bg-amber-900/20 text-amber-400 border-amber-500/30 hover:bg-amber-900/40" 
                : "bg-red-900/20 text-red-400 border-red-500/30 hover:bg-red-900/40"
            )}
          >
            <RefreshCw size={14} className={cn(isRefreshing && "animate-spin")} />
            {isRefreshing ? "Recargando..." : "Recargar Datos"}
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-0 border-t border-white/5 min-h-[70vh]">
        {/* Sidebar Navigation - Fixed Width on Desktop */}
        <aside className={cn(
            "w-full border-r border-white/5 bg-slate-900/20 backdrop-blur-sm shrink-0 transition-all duration-300 flex flex-col",
            isCollapsed ? "lg:w-20 p-4 items-center" : "lg:w-72 p-6",
            isHistorical ? "border-amber-500/10" : "border-white/5"
        )}>
          
          <div className={cn("w-full space-y-2", isCollapsed ? "flex flex-col items-center" : "")}>
            <div className={cn("flex items-center mb-6 pb-4 border-b border-white/10", isCollapsed ? "justify-center" : "justify-between px-2")}>
              {!isCollapsed && (
                <div className="flex items-center gap-2.5">
                  <div className={cn("p-1.5 rounded-lg", isHistorical ? "bg-amber-500/20" : "bg-red-500/20")}>
                    <Compass size={16} className={accentColor} />
                  </div>
                  <h3 className="text-sm font-black italic uppercase tracking-widest text-white">Navegación</h3>
                </div>
              )}
              <button 
                onClick={() => setIsCollapsed(!isCollapsed)}
                className={cn(
                  "transition-colors hidden lg:flex items-center justify-center p-1.5 rounded-lg hover:bg-white/10",
                  isCollapsed ? "text-white bg-white/5" : "text-slate-400 hover:text-white"
                )}
                title={isCollapsed ? "Expandir panel" : "Colapsar panel"}
              >
                {isCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
              </button>
            </div>

            <button
                onClick={() => setActiveTab('teams')}
                className={cn(
                "text-left rounded-xl font-bold uppercase text-sm tracking-wider flex items-center transition-all group",
                isCollapsed ? "justify-center p-3 w-12 h-12" : "w-full px-4 py-3 gap-3",
                activeTab === 'teams' 
                    ? cn("bg-white/10 text-white border border-white/10 shadow-lg", isHistorical && "border-amber-500/30 shadow-amber-500/10")
                    : "text-slate-500 hover:text-white hover:bg-white/5"
                )}
                title={isCollapsed ? "Escuderías" : undefined}
            >
                <Trophy size={18} className={cn("transition-transform group-hover:scale-110 shrink-0", activeTab === 'teams' ? accentColor : "")} />
                {!isCollapsed && <span className="truncate">1. Escuderías</span>}
            </button>

            <button
                onClick={() => setActiveTab('drivers')}
                className={cn(
                "text-left rounded-xl font-bold uppercase text-sm tracking-wider flex items-center transition-all group",
                isCollapsed ? "justify-center p-3 w-12 h-12" : "w-full px-4 py-3 gap-3",
                activeTab === 'drivers' 
                    ? cn("bg-white/10 text-white border border-white/10 shadow-lg", isHistorical && "border-amber-500/30 shadow-amber-500/10")
                    : "text-slate-500 hover:text-white hover:bg-white/5"
                )}
                title={isCollapsed ? "Pilotos" : undefined}
            >
                <Users size={18} className={cn("transition-transform group-hover:scale-110 shrink-0", activeTab === 'drivers' ? accentColor : "")} />
                {!isCollapsed && <span className="truncate">2. Pilotos</span>}
            </button>

            <button
                onClick={() => setActiveTab('calendar')}
                className={cn(
                "text-left rounded-xl font-bold uppercase text-sm tracking-wider flex items-center transition-all group",
                isCollapsed ? "justify-center p-3 w-12 h-12" : "w-full px-4 py-3 gap-3",
                activeTab === 'calendar' 
                    ? cn("bg-white/10 text-white border border-white/10 shadow-lg", isHistorical && "border-amber-500/30 shadow-amber-500/10")
                    : "text-slate-500 hover:text-white hover:bg-white/5"
                )}
                title={isCollapsed ? "Calendario" : undefined}
            >
                <CalendarIcon size={18} className={cn("transition-transform group-hover:scale-110 shrink-0", activeTab === 'calendar' ? accentColor : "")} />
                {!isCollapsed && <span className="truncate">3. Calendario</span>}
            </button>

            <button
                onClick={() => setActiveTab('results')}
                className={cn(
                "text-left rounded-xl font-bold uppercase text-sm tracking-wider flex items-center transition-all group",
                isCollapsed ? "justify-center p-3 w-12 h-12" : "w-full px-4 py-3 gap-3",
                activeTab === 'results' 
                    ? cn("bg-white/10 text-white border border-white/10 shadow-lg", isHistorical && "border-amber-500/30 shadow-amber-500/10")
                    : "text-slate-500 hover:text-white hover:bg-white/5"
                )}
                title={isCollapsed ? "Resultados" : undefined}
            >
                <Flag size={18} className={cn("transition-transform group-hover:scale-110 shrink-0", activeTab === 'results' ? accentColor : "")} />
                {!isCollapsed && <span className="truncate">4. Resultados</span>}
            </button>

            <div className={cn("h-px bg-white/5 my-4", isCollapsed ? "w-8" : "mx-4")}></div>

            <button
                onClick={() => setActiveTab('import')}
                className={cn(
                "text-left rounded-xl font-bold uppercase text-sm tracking-wider flex items-center transition-all group",
                isCollapsed ? "justify-center p-3 w-12 h-12" : "w-full px-4 py-3 gap-3",
                activeTab === 'import' 
                    ? cn("bg-white/10 text-white border border-white/10 shadow-lg", isHistorical && "border-amber-500/30 shadow-amber-500/10")
                    : "text-slate-500 hover:text-white hover:bg-white/5"
                )}
                title={isCollapsed ? "Mantenimiento" : undefined}
            >
                <Database size={18} className={cn("transition-transform group-hover:scale-110 shrink-0", activeTab === 'import' ? accentColor : "")} />
                {!isCollapsed && <span className="truncate">Mantenimiento</span>}
            </button>

            <button
                onClick={() => setActiveTab('settings')}
                className={cn(
                "text-left rounded-xl font-bold uppercase text-sm tracking-wider flex items-center transition-all group",
                isCollapsed ? "justify-center p-3 w-12 h-12" : "w-full px-4 py-3 gap-3",
                activeTab === 'settings' 
                    ? cn("bg-white/10 text-white border border-white/10 shadow-lg", isHistorical && "border-amber-500/30 shadow-amber-500/10")
                    : "text-slate-500 hover:text-white hover:bg-white/5"
                )}
                title={isCollapsed ? "Ajustes" : undefined}
            >
                <Settings size={18} className={cn("transition-transform group-hover:scale-110 shrink-0", activeTab === 'settings' ? accentColor : "")} />
                {!isCollapsed && <span className="truncate">Ajustes</span>}
            </button>
          </div>

          {/* FAQ / Instructions Block */}
          {!isCollapsed && (
            <div className={cn(
                "p-5 rounded-2xl border text-xs space-y-3 mt-8",
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
          )}
        </aside>

        {/* Content Area - Flexible and Scrollable */}
        <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
          <div className="max-w-full">
            {activeTab === 'teams' && (
              <TeamsEditor 
                data={data} 
                onUpdateData={setData} 
                activeSeason={activeSeason} 
                isHistorical={isHistorical} 
              />
            )}
            {activeTab === 'drivers' && (
              <DriversEditor 
                data={data} 
                onUpdateData={setData} 
                activeSeason={activeSeason} 
                isHistorical={isHistorical} 
              />
            )}
            {activeTab === 'calendar' && (
              <CalendarEditor 
                data={data} 
                onUpdateData={setData} 
                activeSeason={activeSeason} 
                isHistorical={isHistorical} 
              />
            )}
            {activeTab === 'results' && (
              <ResultsEditor 
                data={data} 
                onUpdateData={setData} 
                activeSeason={activeSeason} 
                isHistorical={isHistorical} 
              />
            )}
            {activeTab === 'import' && (
              <JsonImporter 
                currentData={data} 
                onUpdateData={setData} 
                activeSeason={activeSeason} 
                isHistorical={isHistorical} 
              />
            )}
            {activeTab === 'settings' && (
              <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6">
                <h3 className="text-xl font-black italic uppercase text-white mb-6">Ajustes Generales</h3>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-white/5">
                    <div>
                      <h4 className="text-white font-bold uppercase tracking-wider text-sm">Sorteo de Calendario</h4>
                      <p className="text-slate-400 text-xs mt-1">Activa la pestaña de sorteo (Wheel of Fortune) para la presentación del campeonato.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={!!data.isDrawActive}
                        onChange={async (e) => {
                          const updatedData = { ...data, isDrawActive: e.target.checked };
                          setData(updatedData);
                          await dataService.saveData(updatedData, activeSeason);
                        }}
                      />
                      <div className={cn(
                        "w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all",
                        data.isDrawActive ? (isHistorical ? "bg-amber-600" : "bg-red-600") : ""
                      )}></div>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
