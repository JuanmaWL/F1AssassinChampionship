import React from 'react';
import { useState, useEffect, useMemo } from 'react';
import { Flag, Trophy, Timer, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { ChampionshipData, SeasonId } from '../../types';
import { TEXTURE_ASSETS } from '../../constants/assets';
interface StatsOverviewProps {
  data: ChampionshipData;
  activeSeason: SeasonId;
}

export const StatsOverview = React.memo(function StatsOverview({ data, activeSeason }: StatsOverviewProps) {
  const actualRaces = data.races.length;
  const totalRaces = actualRaces > 0 ? actualRaces : 12;
  const remainingRaces = actualRaces > 0 ? data.races.filter((r) => r.status === 'pending').length : 12;
  const completedRaces = totalRaces - remainingRaces;
  const pointsRemaining = remainingRaces * 25;
  const isSeasonFinished = actualRaces > 0 && remainingRaces === 0;
  const hasStarted = completedRaces > 0;
  const championPoints = data.drivers.length > 0 ? Math.max(...data.drivers.map(d => d.points)) : 0;

  // Stable random data for hover particles (avoids recalculation on every render)
  const particleData = useMemo(() =>
    Array.from({ length: 15 }, () => ({
      x: Math.random() * 300,
      y: Math.random() * 200,
      floatY: Math.random() * -100,
      scaleMax: Math.random() * 1.5 + 0.5,
      duration: Math.random() * 2 + 2,
      delay: Math.random() * 2,
      width: Math.random() * 4 + 2,
      height: Math.random() * 4 + 2,
      left: Math.random() * 100,
      top: Math.random() * 100,
    }))
  , []);

  // Find the next pending race to display in the timer
  const nextRace = data.races.find(r => r.status === 'pending');

  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    if (!nextRace) {
        if (totalRaces > 0 && !isSeasonFinished) {
             setTimeLeft('Pendiente de confirmar');
        }
        return;
    }

    const updateTimer = () => {
      if (!nextRace.date) {
        setTimeLeft('FECHA POR CONFIRMAR');
        return;
      }

      const raceDate = new Date(nextRace.date);
      // Check if date is valid
      if (isNaN(raceDate.getTime())) {
        setTimeLeft('FECHA POR CONFIRMAR');
        return;
      }

      const now = new Date();
      const diff = raceDate.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft('EN DISPUTA / FINALIZADO');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [nextRace, isSeasonFinished]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-2">
        {/* Progress Card - Cyberpunk Redesign */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br p-6 group transition-all duration-500 ${
            isSeasonFinished 
                ? 'from-slate-900 via-slate-900 to-yellow-950/30 border-yellow-500/30 shadow-[0_0_20px_rgba(234,179,8,0.1)] hover:shadow-[0_0_40px_rgba(234,179,8,0.3)] hover:border-yellow-500/50' 
                : 'from-slate-900 via-slate-900 to-cyan-950/30 border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.1)] hover:shadow-[0_0_40px_rgba(6,182,212,0.3)] hover:border-cyan-500/50'
        }`}
      >
        {/* Background Effects */}
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `url('${TEXTURE_ASSETS.CARBON_FIBRE}')` }}></div>
        <div className={`absolute -right-10 -top-10 w-40 h-40 blur-[60px] rounded-full pointer-events-none transition-all duration-500 group-hover:opacity-100 group-hover:scale-125 ${isSeasonFinished ? 'bg-yellow-600/20' : 'bg-cyan-600/20'}`}></div>
        
        {/* Hover Particles Effect - Reworked */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none overflow-hidden">
            {particleData.map((p, i) => (
                <motion.div
                    key={i}
                    className={`absolute rounded-full blur-[1px] ${isSeasonFinished ? 'bg-yellow-400' : 'bg-cyan-400'}`}
                    initial={{ x: p.x, y: p.y, opacity: 0, scale: 0 }}
                    animate={{ y: [null, p.floatY], opacity: [0, 0.8, 0], scale: [0, p.scaleMax, 0] }}
                    transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
                    style={{ width: p.width + 'px', height: p.height + 'px', left: p.left + '%', top: p.top + '%' }}
                />
            ))}
        </div>
        
        <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className={`text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2 mb-1 transition-colors duration-300 ${isSeasonFinished ? 'text-yellow-500 group-hover:text-yellow-400' : 'text-cyan-500 group-hover:text-cyan-400'}`}>
                        <span className={`w-2 h-2 rounded-full animate-pulse ${isSeasonFinished ? 'bg-yellow-500' : 'bg-cyan-500'}`}></span>
                        {isSeasonFinished ? `TEMPORADA ${activeSeason}` : 'TEMPORADA'}
                    </h3>
                    <div className="flex items-baseline gap-2">
                        {hasStarted ? (
                            <>
                                <span className="text-5xl font-black italic text-white tracking-tighter drop-shadow-lg group-hover:scale-105 transition-transform duration-300">
                                    {totalRaces > 0 ? Math.round((completedRaces / totalRaces) * 100) : 0}%
                                </span>
                                <span className="text-sm font-mono text-slate-400 uppercase tracking-widest">
                                    {isSeasonFinished ? 'COMPLETADA' : 'COMPLETADO'}
                                </span>
                            </>
                        ) : (
                            <>
                                <span className="text-5xl font-black italic text-white tracking-tighter drop-shadow-lg group-hover:scale-105 transition-transform duration-300">
                                    {totalRaces}
                                </span>
                                <span className="text-sm font-mono text-slate-400 uppercase tracking-widest">
                                    CARRERAS
                                </span>
                            </>
                        )}
                    </div>
                </div>
                <div className={`p-3 rounded-xl border backdrop-blur-sm transition-all duration-300 ${isSeasonFinished ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500 group-hover:bg-yellow-500/20 group-hover:border-yellow-500/40' : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-500 group-hover:bg-cyan-500/20 group-hover:border-cyan-500/40'}`}>
                    <Flag size={28} />
                </div>
            </div>

            <div className="mt-6 space-y-2">
                <div className="flex justify-between text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                    <span>{hasStarted ? `Carrera ${completedRaces}` : 'Preparando motores'}</span>
                    <span>Total {totalRaces}</span>
                </div>
                {/* Custom Progress Bar */}
                <div className="h-3 w-full bg-slate-950 rounded-full border border-white/5 relative overflow-hidden">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: totalRaces > 0 ? `${(completedRaces / totalRaces) * 100}%` : '0%' }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className={`h-full relative ${isSeasonFinished ? 'bg-gradient-to-r from-yellow-600 to-yellow-400' : 'bg-gradient-to-r from-cyan-600 to-cyan-400'}`}
                    >
                        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.3)_50%,transparent_75%)] bg-[length:10px_10px] opacity-30"></div>
                        <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/50 shadow-[0_0_10px_white]"></div>
                    </motion.div>
                </div>
                <p className="text-[10px] text-slate-500 font-mono text-right pt-1 min-h-[16px]">
                    {isSeasonFinished ? '' : !hasStarted ? '🚦 Esperando semáforos' : '🚀 La batalla continúa'}
                </p>
            </div>
        </div>
      </motion.div>

      {/* Points Card - Cyberpunk Redesign */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br p-6 group transition-all duration-500 ${
            isSeasonFinished
            ? 'from-slate-900 via-slate-900 to-slate-800 border-slate-700/50 shadow-none opacity-75 hover:opacity-100 hover:shadow-[0_0_30px_rgba(148,163,184,0.2)]'
            : 'from-slate-900 via-slate-900 to-emerald-950/30 border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.1)] hover:shadow-[0_0_40px_rgba(16,185,129,0.3)] hover:border-emerald-500/50'
        }`}
      >
        {/* Background Effects */}
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `url('${TEXTURE_ASSETS.CARBON_FIBRE}')` }}></div>
        <div className={`absolute -right-10 -top-10 w-40 h-40 blur-[60px] rounded-full pointer-events-none transition-all duration-500 group-hover:scale-125 ${isSeasonFinished ? 'bg-slate-600/10' : 'bg-emerald-600/20'}`}></div>

        {/* Hover Particles Effect - Reworked */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none overflow-hidden">
            {particleData.map((p, i) => (
                <motion.div
                    key={i}
                    className={`absolute rounded-full blur-[1px] ${isSeasonFinished ? 'bg-slate-400' : 'bg-emerald-400'}`}
                    initial={{ x: p.x, y: p.y, opacity: 0, scale: 0 }}
                    animate={{ y: [null, p.floatY], opacity: [0, 0.8, 0], scale: [0, p.scaleMax, 0] }}
                    transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
                    style={{ width: p.width + 'px', height: p.height + 'px', left: p.left + '%', top: p.top + '%' }}
                />
            ))}
        </div>

        <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className={`text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2 mb-1 transition-colors duration-300 ${isSeasonFinished ? 'text-slate-500 group-hover:text-slate-400' : 'text-emerald-500 group-hover:text-emerald-400'}`}>
                        <span className={`w-2 h-2 rounded-full animate-pulse ${isSeasonFinished ? 'bg-slate-500' : 'bg-emerald-500'}`}></span>
                        {isSeasonFinished ? 'PUNTOS DEL CAMPEÓN' : !hasStarted ? 'PUNTOS TOTALES' : 'PUNTOS EN JUEGO'}
                    </h3>
                    <div className="flex items-baseline gap-2">
                        <span className={`text-5xl font-black italic tracking-tighter drop-shadow-lg group-hover:scale-105 transition-transform duration-300 ${isSeasonFinished ? 'text-slate-500' : 'text-white'}`}>
                            {isSeasonFinished ? championPoints : !hasStarted ? totalRaces * 25 : pointsRemaining}
                        </span>
                        <span className="text-sm font-mono text-slate-400 uppercase tracking-widest">
                            PUNTOS
                        </span>
                    </div>
                </div>
                <div className={`p-3 rounded-xl border backdrop-blur-sm transition-all duration-300 ${isSeasonFinished ? 'bg-slate-800 border-slate-700 text-slate-500 group-hover:bg-slate-700 group-hover:text-slate-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500 group-hover:bg-emerald-500/20 group-hover:border-emerald-500/40'}`}>
                    <Trophy size={28} />
                </div>
            </div>

            <div className="mt-auto pt-4">
                <div className={`p-3 rounded-lg border backdrop-blur-sm flex items-center gap-3 transition-colors duration-300 ${isSeasonFinished ? 'bg-slate-950/30 border-slate-800 group-hover:border-slate-700' : 'bg-emerald-950/30 border-emerald-500/10 group-hover:border-emerald-500/30'}`}>
                    <div className={`text-2xl ${isSeasonFinished ? 'grayscale opacity-50' : ''}`}>
                        {!hasStarted ? '🏎️' : '🏆'}
                    </div>
                    <div>
                        <p className={`text-[10px] uppercase tracking-wider font-bold transition-colors duration-300 ${isSeasonFinished ? 'text-slate-500 group-hover:text-slate-400' : 'text-emerald-400 group-hover:text-emerald-300'}`}>
                            {isSeasonFinished ? 'Título Decidido' : !hasStarted ? 'Formato de Puntuación' : 'Oportunidad de Oro'}
                        </p>
                        <p className="text-[10px] text-slate-500 leading-tight">
                            {isSeasonFinished ? 'Puntuación final del ganador' : !hasStarted ? '25 pts máx por victoria (sin VR)' : 'Puntos máximos disponibles'}
                        </p>
                    </div>
                </div>
            </div>
            
            {/* Decorative bottom line */}
            {!isSeasonFinished && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-emerald-500/0 via-emerald-500/50 to-emerald-500/0 group-hover:via-emerald-400/80 transition-all duration-500"></div>
            )}
        </div>
      </motion.div>

      {/* Next GP Card - Dramatically Redesigned */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={`md:col-span-1 relative overflow-hidden rounded-2xl border bg-gradient-to-br p-0 group transition-all duration-500 ${
            isSeasonFinished
            ? 'from-slate-900 via-slate-900 to-slate-800 border-slate-700/50 shadow-none opacity-75 hover:opacity-100 hover:shadow-[0_0_30px_rgba(148,163,184,0.2)]'
            : 'from-slate-900 via-slate-900 to-red-950/30 border-red-500/30 shadow-[0_0_30px_rgba(220,38,38,0.1)] hover:shadow-[0_0_50px_rgba(220,38,38,0.3)] hover:border-red-500/50'
        }`}
      >
        {/* Decorative background elements */}
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `url('${TEXTURE_ASSETS.CARBON_FIBRE}')` }}></div>
        <div className={`absolute -right-10 -top-10 w-40 h-40 blur-[60px] rounded-full pointer-events-none transition-all duration-500 group-hover:scale-125 ${isSeasonFinished ? 'bg-slate-600/10' : 'bg-red-600/20 group-hover:bg-red-600/30'}`}></div>
        
        {/* Hover Particles Effect - Reworked */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none overflow-hidden">
            {particleData.map((p, i) => (
                <motion.div
                    key={i}
                    className={`absolute rounded-full blur-[1px] ${isSeasonFinished ? 'bg-slate-400' : 'bg-red-400'}`}
                    initial={{ x: p.x, y: p.y, opacity: 0, scale: 0 }}
                    animate={{ y: [null, p.floatY], opacity: [0, 0.8, 0], scale: [0, p.scaleMax, 0] }}
                    transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
                    style={{ width: p.width + 'px', height: p.height + 'px', left: p.left + '%', top: p.top + '%' }}
                />
            ))}
        </div>

        <div className="p-6 relative z-10 h-full flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className={`text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2 mb-1 transition-colors duration-300 ${isSeasonFinished ? 'text-slate-500 group-hover:text-slate-400' : 'text-red-500 group-hover:text-red-400'}`}>
                        <span className={`w-2 h-2 rounded-full animate-pulse ${isSeasonFinished ? 'bg-slate-500' : 'bg-red-600'}`}></span>
                        {isSeasonFinished ? `TEMPORADA ${activeSeason}` : !hasStarted ? 'GRAN PREMIO INAUGURAL' : 'PRÓXIMO GRAN PREMIO'}
                    </h3>
                    <span className={`text-2xl font-black italic block uppercase tracking-tighter drop-shadow-md group-hover:scale-105 transition-transform duration-300 ${isSeasonFinished ? 'text-slate-500' : 'text-white'}`}>
                        {isSeasonFinished ? 'COMPLETADA' : nextRace?.name || 'POR CONFIRMAR'}
                    </span>
                </div>
                <div className={`p-3 rounded-xl border backdrop-blur-sm transition-all duration-300 ${isSeasonFinished ? 'bg-slate-800 border-slate-700 text-slate-500 group-hover:bg-slate-700 group-hover:text-slate-400' : 'bg-red-500/10 border-red-500/20 text-red-500 group-hover:bg-red-500/20 group-hover:border-red-500/40'}`}>
                    {isSeasonFinished ? <CheckCircle size={28} /> : <Timer size={28} />}
                </div>
            </div>

            <div className="mt-auto pt-4">
                {isSeasonFinished ? (
                    <div className="p-3 rounded-lg border backdrop-blur-sm flex items-center gap-3 transition-colors duration-300 bg-slate-950/30 border-slate-800 group-hover:border-slate-700">
                        <div className="text-2xl grayscale opacity-50">
                            🏁
                        </div>
                        <div>
                            <p className="text-[10px] uppercase tracking-wider font-bold transition-colors duration-300 text-slate-500 group-hover:text-slate-400">
                                Temporada Finalizada
                            </p>
                            <p className="text-[10px] text-slate-500 leading-tight">
                                Nos vemos en la próxima
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-4 gap-2 text-center">
                        {/* Parse timeLeft string "Xd Xh Xm Xs" manually or recalculate. 
                            Since timeLeft is a string in the state, we'll parse it or just use the logic directly.
                            Ideally, we should store the time parts in state, but for now let's parse the display string 
                            or better yet, let's just render the string if it's simple, 
                            BUT the request asks for a dramatic timer. 
                            Let's rely on the string format "Xd Xh Xm Xs" or "Pendiente..." 
                        */}
                        {/^\d+d \d+h \d+m \d+s$/.test(timeLeft) ? (
                            <>
                                {timeLeft.split(' ').map((part, i) => {
                                    const value = part.replace(/[a-z]/g, '');
                                    const label = ['DÍAS', 'HRS', 'MIN', 'SEG'][i];
                                    return (
                                        <div key={i} className="bg-slate-950/50 rounded-lg py-2 border border-white/5 backdrop-blur-sm group-hover:border-red-500/20 transition-colors duration-300">
                                            <span className="block text-2xl md:text-3xl font-mono font-bold text-white leading-none">
                                                {value.padStart(2, '0')}
                                            </span>
                                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider group-hover:text-red-400/70 transition-colors">
                                                {label}
                                            </span>
                                        </div>
                                    );
                                })}
                            </>
                        ) : (
                            <div className="col-span-4 p-3 rounded-lg border backdrop-blur-sm flex items-center gap-3 transition-colors duration-300 bg-red-950/30 border-red-500/10 group-hover:border-red-500/30 text-left">
                                <div className="text-2xl">
                                    {timeLeft === 'EN DISPUTA / FINALIZADO' ? '🏎️' : '⏳'}
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase tracking-wider font-bold transition-colors duration-300 text-red-400 group-hover:text-red-300">
                                        {timeLeft === 'EN DISPUTA / FINALIZADO' ? 'En Pista' : 'Preparando'}
                                    </p>
                                    <p className="text-[10px] text-slate-400 leading-tight">
                                        {timeLeft || 'CARGANDO...'}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
            
            {/* Progress bar line at bottom */}
            {!isSeasonFinished && (
                <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-800">
                     <div className="h-full bg-red-600 w-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full"></div>
                </div>
            )}
        </div>
      </motion.div>
      </div>
    </div>
  );
});