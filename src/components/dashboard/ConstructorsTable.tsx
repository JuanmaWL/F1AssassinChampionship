import React from 'react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, X, Medal, Hash, AlertTriangle, Activity, ChevronRight, Wrench } from 'lucide-react';
import { Constructor, Race, Driver } from '../../types';
import { cn } from '../../lib/utils';
import { TEXTURE_ASSETS, getFlagUrl } from '../../constants/assets';
import { useScrollLock } from '../../hooks/useScrollLock';

interface ConstructorsTableProps {
  constructors: Constructor[];
  hasCompletedRaces: boolean;
  races: Race[];
  drivers: Driver[];
}

export const ConstructorsTable = React.memo(function ConstructorsTable({ constructors, hasCompletedRaces, races, drivers }: ConstructorsTableProps) {
  const [selectedConstructor, setSelectedConstructor] = useState<Constructor | null>(null);

  // Scroll lock for modal
  useScrollLock(!!selectedConstructor);

  const getConstructorStats = useCallback((constructorName: string) => {
    const teamDrivers = drivers.filter(d => d.team === constructorName).map(d => d.id);
    const completedRaces = races.filter(r => r.status === 'completed' && r.results);
    
    let wins = 0;
    let podiums = 0;
    let dnfs = 0;
    let bestPosition = 999;

    completedRaces.forEach(race => {
      const teamResults = race.results!.filter(res => teamDrivers.includes(res.driverId));
      
      teamResults.forEach(res => {
        if (res.position === 1 && !res.dnf && !res.isDisqualified) wins++;
        if (res.position <= 3 && !res.dnf && !res.isDisqualified) podiums++;
        if (res.dnf || res.isDisqualified) dnfs++;
        if (!res.dnf && !res.isDisqualified && res.position < bestPosition) {
          bestPosition = res.position;
        }
      });
    });

    return {
      wins,
      podiums,
      dnfs,
      bestPosition: bestPosition === 999 ? '-' : bestPosition,
    };
  }, [races, drivers]);
  const sortedConstructors = useMemo(() => {
    return hasCompletedRaces
      ? constructors
      : [...constructors].sort((a, b) => a.name.localeCompare(b.name));
  }, [constructors, hasCompletedRaces]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.4 }}
      className="bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
    >
      <div className="p-6 border-b border-white/10 bg-gradient-to-r from-blue-900/20 to-transparent">
          <div className="flex items-center gap-4">
            <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-[0_0_20px_rgba(59,130,246,0.3)] border border-blue-400/50">
              <img src="/icons/escudo.svg" alt="Mundial de Constructores" className="w-7 h-7 drop-shadow-md" />
            </div>
            <div>
              <h2 className="text-3xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 uppercase tracking-tighter pr-2">
                Mundial de Constructores
              </h2>
            </div>
          </div>
      </div>
      
      <div className="overflow-x-auto">
          {constructors.length === 0 || constructors.every(c => c.points === 0) ? (
              <div className="py-20 flex flex-col items-center justify-center text-center px-6">
                  <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mb-6 border border-white/5">
                      <Trophy className="text-slate-500 w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-bold text-white italic uppercase tracking-wider mb-2">Fábricas en Marcha</h3>
                  <p className="text-slate-500 text-sm max-w-xs mx-auto font-mono uppercase tracking-widest">
                      Los ingenieros están ultimando los detalles. El mundial de constructores cobrará vida pronto.
                  </p>
                  <div className="mt-8 flex gap-2">
                      {[1, 2, 3].map(i => (
                          <div key={i} className="w-2 h-2 rounded-full bg-blue-500/20 animate-pulse" style={{ animationDelay: `${i * 0.5}s` }} />
                      ))}
                  </div>
              </div>
          ) : (
              <table className="w-full text-left border-collapse">
              <thead>
                  <tr className="bg-slate-950/50 text-xs uppercase tracking-wider text-slate-500 font-medium">
                      <th className="py-4 px-6 w-16 text-center">POSICIÓN</th>
                      <th className="py-4 px-6">Equipo</th>
                      <th className="py-4 px-6 text-right w-32 sm:w-64">Puntos</th>
                  </tr>
              </thead>
              <tbody>
                  {sortedConstructors.map((constructor, index) => (
                      <motion.tr 
                          key={constructor.id}
                          onClick={() => setSelectedConstructor(constructor)}
                          initial={{ opacity: 0, x: -10, borderBottomColor: 'rgba(255,255,255,0.05)' }}
                          animate={{ 
                              opacity: 1, 
                              x: 0,
                              borderBottomColor: (hasCompletedRaces && index === 0) ? ['rgba(250,204,21,0.1)', 'rgba(250,204,21,0.8)', 'rgba(250,204,21,0.1)'] :
                                                 (hasCompletedRaces && index === 1) ? ['rgba(203,213,225,0.1)', 'rgba(203,213,225,0.8)', 'rgba(203,213,225,0.1)'] :
                                                 (hasCompletedRaces && index === 2) ? ['rgba(249,115,22,0.1)', 'rgba(249,115,22,0.8)', 'rgba(249,115,22,0.1)'] :
                                                 'rgba(255,255,255,0.05)'
                          }}
                          transition={{ 
                              opacity: { delay: index * 0.05 },
                              x: { delay: index * 0.05 },
                              borderBottomColor: (hasCompletedRaces && index < 3) ? { duration: 5, repeat: Infinity, ease: "easeInOut" } : { duration: 0.3 }
                          }}
                          className={cn(
                              "border-b transition-[background-color,opacity,transform] duration-300 group cursor-pointer hover:bg-white/5",
                              hasCompletedRaces && index === 0 ? "bg-yellow-500/5" : "",
                              hasCompletedRaces && index === 1 ? "bg-slate-400/5" : "",
                              hasCompletedRaces && index === 2 ? "bg-orange-700/5" : ""
                          )}
                      >
                          <td className="py-4 px-6 text-center font-mono font-bold text-slate-400 group-hover:text-white">
                              {hasCompletedRaces && index < 3 ? (
                                  <div className="relative flex items-center justify-center w-10 h-10 mx-auto">
                                      {index === 0 && (
                                          <>
                                              <div className="absolute inset-0 bg-yellow-500/30 rounded-full blur-md animate-pulse" />
                                              <div className="absolute -inset-2 bg-gradient-to-tr from-yellow-600/0 via-yellow-400/40 to-yellow-200/0 rounded-full animate-[spin_3s_linear_infinite]" />
                                          </>
                                      )}
                                      {index === 1 && (
                                          <>
                                              <div className="absolute inset-0 bg-slate-300/30 rounded-full blur-md animate-pulse" style={{ animationDelay: '0.5s' }} />
                                              <div className="absolute -inset-1 bg-gradient-to-tr from-slate-500/0 via-slate-300/40 to-slate-100/0 rounded-full animate-[spin_4s_linear_infinite_reverse]" />
                                          </>
                                      )}
                                      {index === 2 && (
                                          <>
                                              <div className="absolute inset-0 bg-orange-700/30 rounded-full blur-md animate-pulse" style={{ animationDelay: '1s' }} />
                                          </>
                                      )}
                                      <span className={cn(
                                          "relative z-10 flex items-center justify-center w-8 h-8 rounded-full text-white font-black shadow-lg border border-white/20",
                                          index === 0 ? "bg-gradient-to-br from-yellow-400 to-yellow-600 text-yellow-950 shadow-[0_0_15px_rgba(234,179,8,0.5)]" :
                                          index === 1 ? "bg-gradient-to-br from-slate-300 to-slate-500 text-slate-900 shadow-[0_0_15px_rgba(148,163,184,0.5)]" :
                                          "bg-gradient-to-br from-orange-500 to-orange-800 text-orange-50 shadow-[0_0_15px_rgba(194,65,12,0.5)]"
                                      )}>
                                          {index + 1}
                                      </span>
                                  </div>
                              ) : (
                                  <span>{index + 1}</span>
                              )}
                          </td>
                          <td className="py-4 px-6">
                              <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 rounded-lg bg-white/5 p-1 border border-white/10 flex items-center justify-center overflow-hidden">
                                      <img src={constructor.logoUrl || undefined} alt={constructor.name} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                                  </div>
                                  <div>
                                      <div className="font-bold text-white text-lg italic">{constructor.name}</div>
                                      <div className="w-full h-1 mt-1 rounded-full opacity-50" style={{ backgroundColor: constructor.color }}></div>
                                  </div>
                              </div>
                          </td>
                          <td className="py-4 px-6 text-right relative overflow-hidden">
                              <div className="flex items-center justify-end gap-4 relative z-10">
                                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                                      <span className="text-xs font-black text-blue-400 uppercase tracking-widest drop-shadow-[0_0_8px_rgba(96,165,250,0.8)] hidden sm:inline-block">
                                          Ver equipo
                                      </span>
                                      <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/50">
                                          <ChevronRight size={14} className="text-blue-400 animate-pulse" />
                                      </div>
                                  </div>
                                  <div className="inline-block bg-slate-800 px-3 py-1 rounded-full border border-white/5 font-mono font-bold text-white min-w-[60px] text-center shadow-lg group-hover:border-blue-500/50 group-hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all">
                                      {constructor.points}
                                  </div>
                              </div>
                              {/* Sweep effect */}
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />
                          </td>
                      </motion.tr>
                  ))}
              </tbody>
          </table>
          )}
      </div>

      {/* Constructor Stats Modal */}
      {createPortal(
        <AnimatePresence>
          {selectedConstructor && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
              onClick={() => setSelectedConstructor(null)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-slate-900 border border-white/10 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden relative"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header with Team Color */}
                <div 
                  className="h-32 relative"
                  style={{ 
                    background: `linear-gradient(135deg, ${selectedConstructor.color}40, ${selectedConstructor.color}10, transparent)` 
                  }}
                >
                  <div className="absolute inset-0 opacity-20 mix-blend-overlay" style={{ backgroundImage: `url('${TEXTURE_ASSETS.CARBON_FIBRE}')` }}></div>
                  <button
                    onClick={() => setSelectedConstructor(null)}
                    className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors text-white bg-black/20 backdrop-blur-md border border-white/10 z-10"
                  >
                    <X size={20} />
                  </button>
                  
                  <div className="absolute -bottom-12 left-8 flex items-end gap-6">
                    <div 
                      className="w-24 h-24 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center shadow-xl overflow-hidden p-3 relative"
                    >
                      {/* Subtle spotlight to ensure both black and white logos are visible */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-16 h-16 bg-white/10 rounded-full blur-xl"></div>
                      </div>
                      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundColor: selectedConstructor.color }}></div>
                      
                      {selectedConstructor.logoUrl ? (
                        <img
                          src={selectedConstructor.logoUrl}
                          alt={selectedConstructor.name}
                          className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_8px_rgba(255,255,255,0.15)]"
                        />
                      ) : (
                        <Wrench className="w-12 h-12 text-slate-400 relative z-10" />
                      )}
                    </div>
                    <div className="mb-2">
                      <h3 className="text-3xl font-black italic text-white uppercase tracking-tighter drop-shadow-lg">
                        {selectedConstructor.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-300 font-mono text-sm uppercase tracking-wider flex items-center gap-1">
                          <Wrench size={14} /> Escudería Oficial
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-16 p-8">
                  <div className="flex flex-col md:flex-row gap-8">
                    {/* Stats Section */}
                    <div className="flex-1 space-y-4">
                      <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 border-b border-white/10 pb-2">
                        <Trophy size={16} />
                        Rendimiento Global
                      </h4>
                      {(() => {
                        const stats = getConstructorStats(selectedConstructor.name);
                        return (
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-xl p-4 border border-white/5 flex items-center justify-between shadow-inner">
                              <div className="flex flex-col">
                                <span className="text-xs text-slate-500 font-mono uppercase tracking-wider">Victorias</span>
                                <span className="text-2xl font-black text-white">{stats.wins}</span>
                              </div>
                              <Trophy className="text-yellow-500 opacity-50" size={32} />
                            </div>
                            <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-xl p-4 border border-white/5 flex items-center justify-between shadow-inner">
                              <div className="flex flex-col">
                                <span className="text-xs text-slate-500 font-mono uppercase tracking-wider">Podios</span>
                                <span className="text-2xl font-black text-white">{stats.podiums}</span>
                              </div>
                              <Medal className="text-slate-300 opacity-50" size={32} />
                            </div>
                            <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-xl p-4 border border-white/5 flex items-center justify-between shadow-inner">
                              <div className="flex flex-col">
                                <span className="text-xs text-slate-500 font-mono uppercase tracking-wider">Mejor Pos.</span>
                                <span className="text-2xl font-black text-white">{stats.bestPosition}</span>
                              </div>
                              <Hash className="text-blue-400 opacity-50" size={32} />
                            </div>
                            <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-xl p-4 border border-white/5 flex items-center justify-between shadow-inner">
                              <div className="flex flex-col">
                                <span className="text-xs text-slate-500 font-mono uppercase tracking-wider">Abandonos</span>
                                <span className="text-2xl font-black text-white">{stats.dnfs}</span>
                              </div>
                              <AlertTriangle className="text-red-500 opacity-50" size={32} />
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  
                    {/* Recent Form (Last 5 races) - Points scored by team */}
                    <div className="flex-1 space-y-4">
                      <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 border-b border-white/10 pb-2">
                        <Activity size={16} />
                        Puntos Recientes
                      </h4>
                      <div className="flex flex-col gap-3">
                        {(() => {
                          const completedRaces = races.filter(r => r.status === 'completed' && r.results).slice(-5).reverse();
                          if (completedRaces.length === 0) return <span className="text-slate-500 text-sm italic">Sin datos de carreras</span>;
                          
                          const teamDrivers = drivers.filter(d => d.team === selectedConstructor.name).map(d => d.id);

                          return (
                            <>
                              <div className="flex items-center gap-2 text-[10px] text-slate-400 uppercase tracking-widest pb-1 border-b border-white/5">
                                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.8)]"></span>
                                Carrera más reciente
                              </div>
                              
                              {completedRaces.map((race, idx) => {
                                const teamResults = race.results!.filter(r => teamDrivers.includes(r.driverId));
                                const totalPoints = teamResults.reduce((sum, res) => sum + res.points, 0);
                                
                                let barWidth = Math.min(100, (totalPoints / 44) * 100); // 44 is max points (25 + 18 + 1 fastest lap)
                                
                                return (
                                  <div key={race.id} className="flex items-center gap-3 group/race">
                                    <div className="w-8 text-right">
                                      {race.flagCode && (
                                        <img src={getFlagUrl(race.flagCode, 20)} alt={race.name} className="w-6 h-4 rounded-sm object-cover inline-block shadow-sm" title={race.name} />
                                      )}
                                    </div>
                                    <div className="flex-1 h-8 bg-slate-950 rounded-lg border border-white/5 overflow-hidden relative flex items-center">
                                      <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${barWidth}%` }}
                                        transition={{ duration: 1, delay: idx * 0.1 }}
                                        className="absolute left-0 top-0 bottom-0 opacity-80"
                                        style={{ backgroundColor: selectedConstructor.color }}
                                      />
                                      <span className="relative z-10 ml-3 text-xs font-mono font-bold text-white drop-shadow-md">
                                        {race.name}
                                      </span>
                                    </div>
                                    <div className="w-12 text-right font-mono font-bold text-sm">
                                      <span className={totalPoints > 0 ? "text-green-400" : "text-slate-500"}>
                                        +{totalPoints}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}

                              {completedRaces.length > 1 && (
                                <div className="flex items-center gap-2 text-[10px] text-slate-600 uppercase tracking-widest pt-1 border-t border-white/5 mt-1">
                                  <span className="w-2 h-2 rounded-full bg-slate-700"></span>
                                  Carrera más antigua
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body
    )}
    </motion.div>
  );
});
