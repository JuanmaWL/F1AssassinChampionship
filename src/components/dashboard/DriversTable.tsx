import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, Timer, Trophy, AlertTriangle, Hash, Activity, X, Medal, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Driver, Constructor, Race, RaceResult } from '../../types';
import { cn } from '../../lib/utils';

interface DriversTableProps {
  drivers: Driver[];
  constructors: Constructor[];
  races: Race[];
}

export function DriversTable({ drivers, constructors, races }: DriversTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [activeFastestLapDriver, setActiveFastestLapDriver] = useState<string | null>(null);

  const itemsPerPage = 10;
  const totalPages = Math.ceil(drivers.length / itemsPerPage);

  const paginatedDrivers = drivers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Scroll lock for modal
  useEffect(() => {
    if (selectedDriver || activeFastestLapDriver) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedDriver, activeFastestLapDriver]);

  const getDriverStats = useCallback((driverId: string) => {
    const completedRaces = races.filter(r => r.status === 'completed' && r.results);
    const driverResults = completedRaces.map(r => r.results!.find(res => res.driverId === driverId)).filter(Boolean) as RaceResult[];
    
    const racesEntered = driverResults.length;
    const podiums = driverResults.filter(r => r.position <= 3 && !r.dnf && !r.isDisqualified).length;
    const wins = driverResults.filter(r => r.position === 1 && !r.dnf && !r.isDisqualified).length;
    const dnfs = driverResults.filter(r => r.dnf || r.isDisqualified).length;
    const bestPosition = Math.min(...driverResults.filter(r => !r.dnf && !r.isDisqualified).map(r => r.position), 999);
    const avgPosition = driverResults.filter(r => !r.dnf && !r.isDisqualified).reduce((acc, curr) => acc + curr.position, 0) / (racesEntered - dnfs) || 0;
    
    return {
      racesEntered,
      podiums,
      wins,
      dnfs,
      bestPosition: bestPosition === 999 ? '-' : bestPosition,
      avgPosition: avgPosition ? avgPosition.toFixed(1) : '-'
    };
  }, [races]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.4 }}
      className="bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
    >
      <div className="p-6 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-red-900/20 to-transparent">
          <div className="flex items-center gap-4">
            <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-600 shadow-[0_0_20px_rgba(239,68,68,0.3)] border border-red-400/50">
              <img src="/icons/casco.svg" alt="Mundial de Pilotos" className="w-7 h-7 drop-shadow-md" />
            </div>
            <div>
              <h2 className="text-3xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 uppercase tracking-tighter pr-2">
                Mundial de Pilotos
              </h2>
            </div>
          </div>
          <div className="flex gap-2">
              <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                  <ChevronLeft size={20} />
              </button>
              <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                  <ChevronRight size={20} />
              </button>
          </div>
      </div>
      
      <div className="overflow-x-auto">
          {drivers.length === 0 || drivers.every(d => d.points === 0) ? (
              <div className="py-20 flex flex-col items-center justify-center text-center px-6">
                  <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mb-6 border border-white/5">
                      <Users className="text-slate-500 w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-bold text-white italic uppercase tracking-wider mb-2">Parrilla en Preparación</h3>
                  <p className="text-slate-500 text-sm max-w-xs mx-auto font-mono uppercase tracking-widest">
                      Los pilotos están calentando motores. La clasificación se actualizará tras la primera carrera.
                  </p>
                  <div className="mt-8 flex gap-2">
                      {[1, 2, 3].map(i => (
                          <div key={i} className="w-2 h-2 rounded-full bg-red-500/20 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                      ))}
                  </div>
              </div>
          ) : (
              <table className="w-full text-left border-collapse">
              <thead>
                  <tr className="bg-slate-950/50 text-xs uppercase tracking-wider text-slate-500 font-medium">
                      <th className="py-4 px-6 w-16 text-center">POSICIÓN</th>
                      <th className="py-4 px-6">Piloto</th>
                      <th className="py-4 px-6 hidden md:table-cell">Equipo</th>
                      <th className="py-4 px-6 text-center" title="Vueltas Rápidas">Vueltas Rápidas</th>
                      <th className="py-4 px-6 text-right">Puntos</th>
                  </tr>
              </thead>
              <tbody>
                  {paginatedDrivers.map((driver, index) => {
                      const globalIndex = (currentPage - 1) * itemsPerPage + index;
                      const team = constructors.find(c => c.name === driver.team);
                      return (
                          <motion.tr 
                              key={driver.id}
                              onClick={() => setSelectedDriver(driver)}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className={cn(
                                  "border-b border-white/5 transition-all duration-300 group cursor-pointer",
                                  globalIndex === 0 ? "bg-yellow-500/5" : "",
                                  globalIndex === 1 ? "bg-slate-400/5" : "",
                                  globalIndex === 2 ? "bg-orange-700/5" : ""
                              )}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = `linear-gradient(90deg, transparent, ${driver.teamColor}15, transparent)`;
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = '';
                              }}
                          >
                              <td className="py-4 px-6 text-center font-mono font-bold text-slate-400 group-hover:text-white">
                                  {globalIndex < 3 ? (
                                      <div className="relative flex items-center justify-center w-10 h-10 mx-auto">
                                          {globalIndex === 0 && (
                                              <>
                                                  <div className="absolute inset-0 bg-yellow-500/30 rounded-full blur-md animate-pulse" />
                                                  <div className="absolute -inset-2 bg-gradient-to-tr from-yellow-600/0 via-yellow-400/40 to-yellow-200/0 rounded-full animate-[spin_3s_linear_infinite]" />
                                              </>
                                          )}
                                          {globalIndex === 1 && (
                                              <>
                                                  <div className="absolute inset-0 bg-slate-300/30 rounded-full blur-md animate-pulse" style={{ animationDelay: '0.5s' }} />
                                                  <div className="absolute -inset-1 bg-gradient-to-tr from-slate-500/0 via-slate-300/40 to-slate-100/0 rounded-full animate-[spin_4s_linear_infinite_reverse]" />
                                              </>
                                          )}
                                          {globalIndex === 2 && (
                                              <>
                                                  <div className="absolute inset-0 bg-orange-700/30 rounded-full blur-md animate-pulse" style={{ animationDelay: '1s' }} />
                                              </>
                                          )}
                                          <span className={cn(
                                              "relative z-10 flex items-center justify-center w-8 h-8 rounded-full text-white font-black shadow-lg border border-white/20",
                                              globalIndex === 0 ? "bg-gradient-to-br from-yellow-400 to-yellow-600 text-yellow-950 shadow-[0_0_15px_rgba(234,179,8,0.5)]" :
                                              globalIndex === 1 ? "bg-gradient-to-br from-slate-300 to-slate-500 text-slate-900 shadow-[0_0_15px_rgba(148,163,184,0.5)]" :
                                              "bg-gradient-to-br from-orange-500 to-orange-800 text-orange-50 shadow-[0_0_15px_rgba(194,65,12,0.5)]"
                                          )}>
                                              {globalIndex + 1}
                                          </span>
                                      </div>
                                  ) : (
                                      <span>{globalIndex + 1}</span>
                                  )}
                              </td>
                              <td className="py-4 px-6">
                                  <div className="flex items-center gap-4">
                                      <div className="w-1 h-8 rounded-full" style={{ backgroundColor: driver.teamColor }} />
                                      <div>
                                          <div className="font-bold text-white text-lg italic">{driver.name}</div>
                                          <div className="text-xs text-slate-500 md:hidden flex items-center gap-1 mt-0.5">
                                              {team?.logoUrl && <img src={team.logoUrl} alt={team.name} className="w-3 h-3 object-contain" />}
                                              {driver.team}
                                          </div>
                                      </div>
                                  </div>
                              </td>
                              <td className="py-4 px-6 hidden md:table-cell text-slate-400">
                                  <div className="flex items-center gap-2">
                                      {team?.logoUrl && <img src={team.logoUrl} alt={team.name} className="w-5 h-5 object-contain" />}
                                      {driver.team}
                                  </div>
                              </td>
                              <td className="py-4 px-6 text-center relative">
                                  <div className="relative inline-block">
                                      {driver.fastestLaps && driver.fastestLaps > 0 ? (
                                          <>
                                              <span className="absolute inset-1 rounded-lg bg-purple-500/20 animate-pulse opacity-50" style={{ animationDuration: '3s' }}></span>
                                          </>
                                      ) : null}
                                      <button 
                                          onClick={(e) => {
                                              e.stopPropagation();
                                              setActiveFastestLapDriver(activeFastestLapDriver === driver.id ? null : driver.id);
                                          }}
                                          className={cn(
                                              "relative z-10 flex items-center justify-center gap-1.5 font-mono font-bold transition-all mx-auto px-3 py-1.5 rounded-lg border",
                                              driver.fastestLaps && driver.fastestLaps > 0 
                                                ? "text-purple-300 border-purple-500/50 bg-purple-600/20 hover:bg-purple-500/30 hover:scale-110 hover:shadow-[0_0_15px_rgba(168,85,247,0.6)]" 
                                                : "text-slate-600 border-transparent cursor-default"
                                          )}
                                          disabled={!driver.fastestLaps || driver.fastestLaps === 0}
                                          title={driver.fastestLaps && driver.fastestLaps > 0 ? "Ver Grandes Premios" : ""}
                                      >
                                          <Timer size={14} className={driver.fastestLaps && driver.fastestLaps > 0 ? "text-purple-400 animate-pulse" : "text-slate-600"} style={driver.fastestLaps && driver.fastestLaps > 0 ? { animationDuration: '3s' } : {}} />
                                          {driver.fastestLaps || 0}
                                      </button>
                                  </div>
                              </td>
                              <td className="py-4 px-6 text-right relative overflow-hidden">
                                  <div className="flex items-center justify-end gap-4 relative z-10">
                                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                                          <span className="text-xs font-black text-red-400 uppercase tracking-widest drop-shadow-[0_0_8px_rgba(239,68,68,0.8)] hidden sm:inline-block">
                                              Ver perfil
                                          </span>
                                          <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/50">
                                              <ChevronRight size={14} className="text-red-400 animate-pulse" />
                                          </div>
                                      </div>
                                      <div className="inline-block bg-slate-800 px-3 py-1 rounded-full border border-white/5 font-mono font-bold text-white min-w-[60px] text-center shadow-lg group-hover:border-red-500/50 group-hover:shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all">
                                          {driver.points}
                                      </div>
                                  </div>
                                  {/* Sweep effect and particles */}
                                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />
                                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none overflow-hidden rounded-lg transition-opacity duration-300">
                                     <div className="absolute top-1/2 left-[80%] w-1 h-1 bg-red-400 rounded-full blur-[1px] animate-ping" />
                                     <div className="absolute top-1/3 right-[10%] w-1.5 h-1.5 bg-white rounded-full blur-[1px] animate-pulse" style={{ animationDuration: '0.5s' }} />
                                  </div>
                              </td>
                          </motion.tr>
                      );
                  })}
              </tbody>
          </table>
          )}
      </div>
      
      {/* Pagination Footer */}
      <div className="p-4 bg-slate-950/30 border-t border-white/5 flex justify-center">
          <div className="flex gap-1">
              {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={cn(
                          "w-2 h-2 rounded-full transition-all",
                          currentPage === i + 1 ? "bg-red-500 w-6" : "bg-slate-700 hover:bg-slate-500"
                      )}
                  />
              ))}
          </div>
      </div>

      {/* Driver Stats Modal */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {selectedDriver && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
              onClick={() => setSelectedDriver(null)}
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
                    background: `linear-gradient(135deg, ${selectedDriver.teamColor}40, ${selectedDriver.teamColor}10, transparent)` 
                  }}
                >
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay"></div>
                  <button
                    onClick={() => setSelectedDriver(null)}
                    className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors text-white bg-black/20 backdrop-blur-md border border-white/10 z-10"
                  >
                    <X size={20} />
                  </button>
                  
                  <div className="absolute -bottom-12 left-8 flex items-end gap-6">
                    <div 
                      className="w-24 h-24 rounded-2xl bg-slate-800 border-4 border-slate-900 flex items-center justify-center shadow-xl overflow-hidden"
                      style={{ borderColor: selectedDriver.teamColor }}
                    >
                      {(() => {
                        let displayAvatar = selectedDriver.avatarUrl;
                        if (displayAvatar && displayAvatar.includes('api.dicebear.com') && displayAvatar.includes('avataaars')) {
                          if (!displayAvatar.includes('top=')) {
                            displayAvatar += '&top=shortHair,shortHairTheCaesar,shortHairDreads01,shortHairDreads02,shortHairFrizzle,shortHairShaggyMullet,shortHairShortCurly,shortHairShortFlat,shortHairShortRound,shortHairShortWaved,shortHairSides,shortHairTheCaesarAndSidePart&facialHairProbability=20&facialHair=beardMedium,beardLight,beardMajestic,moustacheFancy,moustacheMagnum';
                          }
                        }
                        return displayAvatar ? (
                          <img src={displayAvatar} alt={selectedDriver.name} className="w-full h-full object-cover" />
                        ) : (
                          <Users className="w-10 h-10 text-slate-500" />
                        );
                      })()}
                    </div>
                    <div className="mb-2">
                      <h3 className="text-3xl font-black italic text-white uppercase tracking-tighter drop-shadow-lg">
                        {selectedDriver.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        {constructors.find(c => c.name === selectedDriver.team)?.logoUrl && (
                          <img src={constructors.find(c => c.name === selectedDriver.team)!.logoUrl} alt="Team" className="w-4 h-4 object-contain" />
                        )}
                        <span className="text-slate-300 font-mono text-sm uppercase tracking-wider">
                          {selectedDriver.team}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-16 p-8">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {(() => {
                      const stats = getDriverStats(selectedDriver.id);
                      return (
                        <>
                          <div className="bg-slate-950/50 rounded-xl p-4 border border-white/5 flex flex-col items-center justify-center text-center">
                            <Trophy className="text-yellow-500 mb-2" size={24} />
                            <span className="text-3xl font-black text-white">{stats.wins}</span>
                            <span className="text-xs text-slate-400 font-mono uppercase tracking-wider">Victorias</span>
                          </div>
                          <div className="bg-slate-950/50 rounded-xl p-4 border border-white/5 flex flex-col items-center justify-center text-center">
                            <Medal className="text-slate-300 mb-2" size={24} />
                            <span className="text-3xl font-black text-white">{stats.podiums}</span>
                            <span className="text-xs text-slate-400 font-mono uppercase tracking-wider">Podios</span>
                          </div>
                          <div className="bg-slate-950/50 rounded-xl p-4 border border-white/5 flex flex-col items-center justify-center text-center">
                            <Hash className="text-blue-400 mb-2" size={24} />
                            <span className="text-3xl font-black text-white">{stats.bestPosition}</span>
                            <span className="text-xs text-slate-400 font-mono uppercase tracking-wider">Mejor Pos.</span>
                          </div>
                          <div className="bg-slate-950/50 rounded-xl p-4 border border-white/5 flex flex-col items-center justify-center text-center">
                            <AlertTriangle className="text-red-500 mb-2" size={24} />
                            <span className="text-3xl font-black text-white">{stats.dnfs}</span>
                            <span className="text-xs text-slate-400 font-mono uppercase tracking-wider">Abandonos</span>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                
                {/* Recent Form (Last 5 races) */}
                <div className="mt-8">
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Activity size={16} />
                    Estado de Forma (Últimas 5)
                  </h4>
                  <div className="flex gap-2">
                    {(() => {
                      const completedRaces = races.filter(r => r.status === 'completed' && r.results).slice(-5);
                      if (completedRaces.length === 0) return <span className="text-slate-500 text-sm italic">Sin datos de carreras</span>;
                      
                      return completedRaces.map(race => {
                        const res = race.results!.find(r => r.driverId === selectedDriver.id);
                        let bgColor = "bg-slate-800";
                        let textColor = "text-slate-300";
                        let text = "-";
                        
                        if (res) {
                          if (res.dnf || res.isDisqualified) {
                            bgColor = "bg-red-500/20";
                            textColor = "text-red-400";
                            text = "DNF";
                          } else if (res.position === 1) {
                            bgColor = "bg-yellow-500/20";
                            textColor = "text-yellow-400";
                            text = "1º";
                          } else if (res.position <= 3) {
                            bgColor = "bg-slate-300/20";
                            textColor = "text-slate-200";
                            text = `${res.position}º`;
                          } else if (res.points > 0) {
                            bgColor = "bg-green-500/20";
                            textColor = "text-green-400";
                            text = `${res.position}º`;
                          } else {
                            text = `${res.position}º`;
                          }
                        }
                        
                        return (
                          <div key={race.id} className="flex-1 flex flex-col items-center gap-2 group/race relative">
                            <div className={cn("w-full py-2 rounded-lg border border-white/5 flex justify-center items-center font-mono font-bold text-sm transition-colors", bgColor, textColor)}>
                              {text}
                            </div>
                            {race.flagCode && (
                              <img src={`https://flagcdn.com/w20/${race.flagCode}.png`} alt={race.name} className="w-5 h-3.5 rounded-sm object-cover opacity-50 group-hover/race:opacity-100 transition-opacity" />
                            )}
                            {/* Tooltip */}
                            <div className="absolute bottom-full mb-2 opacity-0 group-hover/race:opacity-100 transition-opacity bg-slate-900 text-xs px-2 py-1 rounded border border-white/10 whitespace-nowrap pointer-events-none z-10">
                              {race.name}
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body
    )}

    {/* Fastest Lap Modal */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {activeFastestLapDriver && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
              onClick={() => setActiveFastestLapDriver(null)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-slate-900 border border-purple-500/30 w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden relative"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="bg-purple-500/20 px-4 py-3 border-b border-purple-500/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Timer size={18} className="text-purple-400" />
                    <span className="text-sm font-bold text-purple-300 uppercase tracking-wider">Vueltas Rápidas</span>
                  </div>
                  <button onClick={() => setActiveFastestLapDriver(null)} className="text-slate-400 hover:text-white transition-colors">
                    <X size={18} />
                  </button>
                </div>
                <div className="p-2 max-h-60 overflow-y-auto">
                  {(() => {
                    const driverFastestLaps = races.filter(r => r.status === 'completed' && r.results?.some(res => res.driverId === activeFastestLapDriver && res.fastestLap));
                    return driverFastestLaps.map(race => (
                      <div key={race.id} className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-lg transition-colors text-left">
                        {race.flagCode && <img src={`https://flagcdn.com/w20/${race.flagCode}.png`} alt={race.name} className="w-6 h-4 rounded-sm object-cover" />}
                        <span className="text-sm font-medium text-slate-200">{race.name}</span>
                      </div>
                    ));
                  })()}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </motion.div>
  );
}
