import { useState, useEffect, useRef } from 'react';
import { Lightbulb, RefreshCw, CheckCircle2, AlertTriangle, XCircle, Key, Sparkles, ExternalLink } from 'lucide-react';
import { cn } from '../../lib/utils';
import {
  getGeminiApiKey,
  getMaskedApiKey,
  testGeminiConnection,
  GEMINI_MODEL,
  GeminiHealthCheckResult,
} from '../../services/geminiService';

interface GeminiStatusIndicatorProps {
  className?: string;
  isHistorical?: boolean;
}

export function GeminiStatusIndicator({ className, isHistorical }: GeminiStatusIndicatorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [hasKey, setHasKey] = useState<boolean>(false);
  const [maskedKey, setMaskedKey] = useState<string | null>(null);
  const [lastCheck, setLastCheck] = useState<GeminiHealthCheckResult | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Comprobar presencia inicial de la clave
  useEffect(() => {
    const key = getGeminiApiKey();
    setHasKey(!!key);
    setMaskedKey(getMaskedApiKey());
  }, []);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleTestConnection = async () => {
    setIsChecking(true);
    try {
      const result = await testGeminiConnection();
      setLastCheck(result);
      setHasKey(result.hasKey);
      setMaskedKey(result.maskedKey);
    } catch (err: any) {
      setLastCheck({
        hasKey: false,
        maskedKey: null,
        isWorking: false,
        model: GEMINI_MODEL,
        message: err?.message || 'Error inesperado al probar conexión.',
        timestamp: new Date().toLocaleTimeString(),
      });
    } finally {
      setIsChecking(false);
    }
  };

  // Determinar color y estado visual de la bombilla
  let bulbStatus: 'idle-no-key' | 'idle-has-key' | 'working' | 'error' = 'idle-no-key';
  if (lastCheck) {
    bulbStatus = lastCheck.isWorking ? 'working' : 'error';
  } else if (hasKey) {
    bulbStatus = 'idle-has-key';
  }

  return (
    <div className={cn("relative inline-block", className)} ref={popoverRef}>
      {/* Botón / Bombillita discreta */}
      <button
        type="button"
        id="gemini-status-bulb-btn"
        onClick={() => {
          const nextState = !isOpen;
          setIsOpen(nextState);
          // Si se abre por primera vez y no se ha probado, lanzar una verificación automática
          if (nextState && !lastCheck && !isChecking && hasKey) {
            handleTestConnection();
          }
        }}
        title={`Estado de IA Gemini: ${hasKey ? 'Clave detectada' : 'Sin clave'} (Click para detalles)`}
        className={cn(
          "relative p-2 rounded-xl border transition-all duration-300 flex items-center justify-center group focus:outline-none",
          bulbStatus === 'working' && "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.25)]",
          bulbStatus === 'idle-has-key' && "bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20 shadow-[0_0_12px_rgba(245,158,11,0.15)]",
          bulbStatus === 'error' && "bg-red-500/10 border-red-500/30 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.25)]",
          bulbStatus === 'idle-no-key' && "bg-slate-900/60 border-white/10 text-slate-500 hover:text-slate-300 hover:border-white/20"
        )}
      >
        <Lightbulb
          size={18}
          className={cn(
            "transition-all duration-300",
            isChecking && "animate-pulse scale-110 text-amber-300",
            bulbStatus === 'working' && "fill-emerald-400 text-emerald-300 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]",
            bulbStatus === 'idle-has-key' && "fill-amber-400/40 text-amber-300 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]",
            bulbStatus === 'error' && "fill-red-500/30 text-red-400 drop-shadow-[0_0_6px_rgba(239,68,68,0.6)]",
            bulbStatus === 'idle-no-key' && "opacity-40"
          )}
        />
        
        {/* Punto indicador de pulso */}
        <span
          className={cn(
            "absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ring-2 ring-slate-950",
            bulbStatus === 'working' && "bg-emerald-400 animate-pulse",
            bulbStatus === 'idle-has-key' && "bg-amber-400",
            bulbStatus === 'error' && "bg-red-500 animate-ping",
            bulbStatus === 'idle-no-key' && "bg-slate-600"
          )}
        />
      </button>

      {/* Popover desplegable con diagnósticos de la API */}
      {isOpen && (
        <div
          id="gemini-status-popover"
          className="absolute right-0 top-full mt-2 w-80 sm:w-96 z-50 bg-slate-950/95 backdrop-blur-xl border border-white/15 rounded-2xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.8)] animate-in fade-in zoom-in-95 duration-200"
        >
          {/* Cabecera */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400">
                <Sparkles size={16} />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-white">
                  Diagnóstico IA (Gemini)
                </h4>
                <p className="text-[10px] text-slate-400 font-mono">
                  Extracción y análisis de resultados
                </p>
              </div>
            </div>

            <button
              onClick={handleTestConnection}
              disabled={isChecking}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-white/10 text-xs flex items-center gap-1.5 disabled:opacity-50"
              title="Probar llamada a Gemini"
            >
              <RefreshCw size={12} className={cn(isChecking && "animate-spin text-teal-400")} />
              <span className="text-[10px] font-bold">Probar</span>
            </button>
          </div>

          {/* Información de la clave */}
          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 border border-white/5">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Key size={13} className="text-slate-500" />
                API Key:
              </span>
              <span className="font-mono text-[11px] font-bold">
                {hasKey ? (
                  <span className="text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/20">
                    {maskedKey || 'Configurada'}
                  </span>
                ) : (
                  <span className="text-red-400 bg-red-950/40 px-2 py-0.5 rounded border border-red-500/20">
                    No detectada
                  </span>
                )}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/80 border border-white/5">
              <span className="text-slate-400">Modelo activo:</span>
              <span className="font-mono text-[11px] font-bold text-teal-300">
                {GEMINI_MODEL}
              </span>
            </div>

            {/* Resultado de la prueba / Estado */}
            <div className="p-3 rounded-xl bg-slate-900/90 border border-white/10 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
                  Estado de Conexión:
                </span>
                {lastCheck ? (
                  lastCheck.isWorking ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase text-emerald-400">
                      <CheckCircle2 size={13} /> Conectado ({lastCheck.latencyMs}ms)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase text-red-400">
                      <XCircle size={13} /> Error
                    </span>
                  )
                ) : hasKey ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400">
                    <AlertTriangle size={13} /> Pendiente de probar
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500">
                    <XCircle size={13} /> Sin Clave
                  </span>
                )}
              </div>

              {lastCheck && (
                <p className={cn(
                  "text-[11px] leading-relaxed pt-1 border-t border-white/5 font-mono break-words",
                  lastCheck.isWorking ? "text-emerald-300" : "text-red-300"
                )}>
                  {lastCheck.message}
                </p>
              )}

              {lastCheck?.timestamp && (
                <div className="text-[9px] text-slate-500 text-right pt-0.5">
                  Última prueba: {lastCheck.timestamp}
                </div>
              )}
            </div>

            {/* Ayuda / Guía si no funciona */}
            {!hasKey && (
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-[11px] leading-relaxed">
                <p className="font-bold text-amber-300 mb-1">¿Cómo configurarla?</p>
                <p className="text-[10px] text-amber-200/80">
                  Añade <code className="text-white bg-black/40 px-1 py-0.5 rounded">GEMINI_API_KEY</code> en tu archivo <code className="text-white bg-black/40 px-1 py-0.5 rounded">.env</code> o en las variables de entorno de Vercel (recuerda hacer un <strong>Redeploy</strong> tras guardarla).
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
