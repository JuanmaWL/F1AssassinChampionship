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
    <div className="pb-20 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* FAQ / Instructions Block */}
          <div className={cn(
              "p-4 rounded-xl border text-xs space-y-2",
              isHistorical ? "bg-amber-900/10 border-amber-500/20 text-amber-200/80" : "bg-slate-900/50 border-white/10 text-slate-400"
          )}>
              <h4 className="font-bold uppercase tracking-wider text-white mb-2 flex items-center gap-2">
                  <Info size={14} /> Guía Rápida
              </h4>
              <p>Para configurar una nueva temporada, sigue este orden recomendado:</p>
              <ol className="list-decimal list-inside space-y-1 ml-1">
                  <li><span className="text-white font-bold">Escuderías:</span> Crea equipos y logos.</li>
                  <li><span className="text-white font-bold">Pilotos:</span> Asigna pilotos a equipos.</li>
                  <li><span className="text-white font-bold">Calendario:</span> Define las carreras.</li>
                  <li><span className="text-white font-bold">Resultados:</span> Sube resultados.</li>
              </ol>
              <div className="mt-2 pt-2 border-t border-white/10 text-[10px] text-slate-500">
                <p>⚠️ Si la subida de imágenes falla, verifica que las <strong>Reglas de Storage</strong> en Firebase permitan escritura pública (allow write: if true;).</p>
              </div>
          </div>

          <div className="space-y-2">
            <button
                onClick={() => setActiveTab('teams')}
                className={cn(
                "w-full text-left px-4 py-3 rounded-lg font-bold uppercase text-sm tracking-wider flex items-center gap-3 transition-all",
                activeTab === 'teams' 
                    ? cn("bg-white/10 text-white border border-white/10 shadow-lg", isHistorical && "border-amber-500/30 shadow-amber-500/10")
                    : "text-slate-500 hover:text-white hover:bg-white/5"
                )}
            >
                <Trophy size={18} className={activeTab === 'teams' ? accentColor : ""} />
                1. Escuderías
            </button>

            <button
                onClick={() => setActiveTab('drivers')}
                className={cn(
                "w-full text-left px-4 py-3 rounded-lg font-bold uppercase text-sm tracking-wider flex items-center gap-3 transition-all",
                activeTab === 'drivers' 
                    ? cn("bg-white/10 text-white border border-white/10 shadow-lg", isHistorical && "border-amber-500/30 shadow-amber-500/10")
                    : "text-slate-500 hover:text-white hover:bg-white/5"
                )}
            >
                <Users size={18} className={activeTab === 'drivers' ? accentColor : ""} />
                2. Pilotos
            </button>

            <button
                onClick={() => setActiveTab('calendar')}
                className={cn(
                "w-full text-left px-4 py-3 rounded-lg font-bold uppercase text-sm tracking-wider flex items-center gap-3 transition-all",
                activeTab === 'calendar' 
                    ? cn("bg-white/10 text-white border border-white/10 shadow-lg", isHistorical && "border-amber-500/30 shadow-amber-500/10")
                    : "text-slate-500 hover:text-white hover:bg-white/5"
                )}
            >
                <CalendarIcon size={18} className={activeTab === 'calendar' ? accentColor : ""} />
                3. Calendario
            </button>

            <button
                onClick={() => setActiveTab('results')}
                className={cn(
                "w-full text-left px-4 py-3 rounded-lg font-bold uppercase text-sm tracking-wider flex items-center gap-3 transition-all",
                activeTab === 'results' 
                    ? cn("bg-white/10 text-white border border-white/10 shadow-lg", isHistorical && "border-amber-500/30 shadow-amber-500/10")
                    : "text-slate-500 hover:text-white hover:bg-white/5"
                )}
            >
                <Flag size={18} className={activeTab === 'results' ? accentColor : ""} />
                4. Resultados
            </button>

            <div className="h-px bg-white/10 my-2"></div>

            <button
                onClick={() => setActiveTab('import')}
                className={cn(
                "w-full text-left px-4 py-3 rounded-lg font-bold uppercase text-sm tracking-wider flex items-center gap-3 transition-all",
                activeTab === 'import' 
                    ? cn("bg-white/10 text-white border border-white/10 shadow-lg", isHistorical && "border-amber-500/30 shadow-amber-500/10")
                    : "text-slate-500 hover:text-white hover:bg-white/5"
                )}
            >
                <Database size={18} className={activeTab === 'import' ? accentColor : ""} />
                Importar / Exportar
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
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
      </div>
    </div>
  );
}
