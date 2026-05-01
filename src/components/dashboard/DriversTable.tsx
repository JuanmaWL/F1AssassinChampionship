import React from 'react';
import { useState, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, Timer, Trophy, AlertTriangle, Hash, Activity, X, Medal, Users, Calendar, MapPin, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Driver, Constructor, Race, RaceResult } from '../../types';
import { cn } from '../../lib/utils';
import { TEXTURE_ASSETS, getFlagUrl } from '../../constants/assets';
import { FastestLapModal } from './FastestLapModal';
import { calculateAchievements, ALL_ACHIEVEMENT_DEFINITIONS } from '../../lib/achievements';
import { MarqueeText } from './MarqueeText';

import { useScrollLock } from '../../hooks/useScrollLock';

const AchievementBadge = ({ achievement }: { achievement: any }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div 
      className="relative w-full h-14 group cursor-pointer [perspective:1000px] shrink-0"
      onClick={() => setIsFlipped(!isFlipped)}
      onMouseLeave={() => setIsFlipped(false)}
    >
      <motion.div
        className="w-full h-full relative [transform-style:preserve-3d] transition-all duration-500"
        animate={{ rotateX: isFlipped ? -180 : 0 }}
      >
        {/* Front */}
        <div className="absolute inset-0 [backface-visibility:hidden] flex items-center px-4 bg-gradient-to-r from-slate-800 to-slate-900 border border-white/10 rounded-xl hover:border-yellow-500/30 transition-colors shadow-lg overflow-hidden group-hover:shadow-[0_0_15px_rgba(234,179,8,0.15)]">
          {/* Subtle shine */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
          
          <div className="flex items-center w-full gap-3 relative z-10">
            <div className="w-9 h-9 rounded-lg bg-black/40 flex items-center justify-center shrink-0 border border-white/5 shadow-inner">
              <span className="text-lg leading-none filter drop-shadow-md">{achievement.emoji}</span>
            </div>
            <div className="flex flex-col min-w-0 flex-1 justify-center">
              <MarqueeText text={achievement.name} className="text-[11px] font-black text-slate-200 uppercase tracking-tight leading-tight" />
              {achievement.value && (
                <span className="text-[9px] font-mono text-yellow-500/90 font-bold truncate mt-0.5">{achievement.value}</span>
              )}
            </div>
          </div>
        </div>

        {/* Back */}
        <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateX(180deg)] flex items-center justify-center p-3 bg-slate-200 border border-white text-slate-900 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.4)]">
           <span className="text-[10px] font-bold text-center leading-tight tracking-tight uppercase text-slate-800">{achievement.description}</span>
        </div>
      </motion.div>
    </div>
  );
};

interface DriversTableProps {
  drivers: Driver[];
  constructors: Constructor[];
  races: Race[];
}

export const DriversTable = React.memo(function DriversTable({ drivers, constructors, races }: DriversTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [activeFastestLapDriver, setActiveFastestLapDriver] = useState<string | null>(null);
  const [showLegend, setShowLegend] = useState(false);

  const itemsPerPage = 10;
  const totalPages = Math.ceil(drivers.length / itemsPerPage);
  const hasStarted = drivers.length > 0 && !drivers.every(d => d.points === 0);

  const paginatedDrivers = drivers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const allAchievements = useMemo(() => 
    calculateAchievements({ drivers, races }), 
    [drivers, races]
  );
  
  const [showAllAchievements, setShowAllAchievements] = useState(false);

  // Scroll lock for modal
  useScrollLock(!!(selectedDriver || activeFastestLapDriver || showAllAchievements));

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

  const calculateRatings = useCallback((driverId: string) => {
    const completedRaces = races.filter(r => r.status === 'completed' && r.results);
    const totalCompletedRaces = completedRaces.length;
    const results = completedRaces.map(r => r.results!.find(res => res.driverId === driverId)).filter(Boolean) as RaceResult[];
    
    if (results.length === 0) return { rit: 75, cns: 75, sup: 80, exp: 50, med: 76 };

    const racesEntered = results.length;
    const participationRate = totalCompletedRaces > 0 ? racesEntered / totalCompletedRaces : 0;
    
    const dnfs = results.filter(r => r.dnf || r.isDisqualified).length;
    const finishes = results.filter(r => !r.dnf && !r.isDisqualified);
    
    // Pace (Ritmo)
    const fastestLaps = results.filter(r => r.fastestLap).length;
    const avgPos = finishes.length > 0 ? finishes.reduce((acc, r) => acc + r.position, 0) / finishes.length : 20;
    let rit = 98 - (avgPos * 2.5) + (fastestLaps * 2);
    if (racesEntered < 3) rit -= 10; // Unproven pace penalty
    
    // Consistency (Constancia)
    let cns = 85;
    if (finishes.length > 1) {
      const mean = avgPos;
      const variance = finishes.reduce((acc, r) => acc + Math.pow(r.position - mean, 2), 0) / finishes.length;
      const stdDev = Math.sqrt(variance);
      cns = 95 - (stdDev * 4) - (dnfs * 5);
    } else {
      cns = 60; // Cannot be consistent with 1 or 0 finishes
    }

    // Survival (Supervivencia)
    const dnfRate = racesEntered > 0 ? dnfs / racesEntered : 0;
    let sup = 99 - (dnfRate * 60);

    // Experience (Experiencia)
    let exp = Math.min(99, 50 + (racesEntered * 2));

    // Clamp values
    rit = Math.max(40, Math.min(99, Math.round(rit)));
    cns = Math.max(40, Math.min(99, Math.round(cns)));
    sup = Math.max(40, Math.min(99, Math.round(sup)));
    exp = Math.max(40, Math.min(99, Math.round(exp)));

    let med = Math.round((rit * 0.45) + (cns * 0.25) + (sup * 0.15) + (exp * 0.15));

    // Global Participation Penalty
    if (participationRate < 0.25) {
        med -= 15;
    } else if (participationRate < 0.5) {
        med -= 8;
    }

    med = Math.max(40, Math.min(99, med));

    return { rit, cns, sup, exp, med };
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
          {hasStarted && totalPages > 1 && (
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
          )}
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
                      <th className="py-4 px-6 hidden md:table-cell text-center">Forma</th>
                      <th className="py-4 px-6 text-center" title="Vueltas Rápidas">Vueltas Rápidas</th>
                      <th className="py-4 px-6 text-right w-32 sm:w-64">Puntos</th>
                  </tr>
              </thead>
              <tbody>
                  {paginatedDrivers.map((driver, index) => {
                      const globalIndex = (currentPage - 1) * itemsPerPage + index;
                      const team = constructors.find(c => c.name === driver.team);
                      return (
                          <motion.tr 
                              key={driver.id}
                              onClick={() => { setSelectedDriver(driver); setShowLegend(false); }}
                              initial={{ opacity: 0, x: -10, borderBottomColor: 'rgba(255,255,255,0.05)' }}
                              animate={{ 
                                  opacity: 1, 
                                  x: 0,
                                  borderBottomColor: globalIndex === 0 ? ['rgba(250,204,21,0.1)', 'rgba(250,204,21,0.8)', 'rgba(250,204,21,0.1)'] :
                                                     globalIndex === 1 ? ['rgba(203,213,225,0.1)', 'rgba(203,213,225,0.8)', 'rgba(203,213,225,0.1)'] :
                                                     globalIndex === 2 ? ['rgba(249,115,22,0.1)', 'rgba(249,115,22,0.8)', 'rgba(249,115,22,0.1)'] :
                                                     'rgba(255,255,255,0.05)'
                              }}
                              transition={{ 
                                  opacity: { delay: index * 0.05 },
                                  x: { delay: index * 0.05 },
                                  borderBottomColor: globalIndex < 3 ? { duration: 5, repeat: Infinity, ease: "easeInOut" } : { duration: 0.3 }
                              }}
                              className={cn(
                                  "border-b transition-[background-color,opacity,transform] duration-300 group cursor-pointer hover:bg-white/5",
                                  globalIndex === 0 ? "bg-yellow-500/5" : "",
                                  globalIndex === 1 ? "bg-slate-400/5" : "",
                                  globalIndex === 2 ? "bg-orange-700/5" : ""
                              )}
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
                                              "relative z-5 flex items-center justify-center w-8 h-8 rounded-full text-white font-black shadow-lg border border-white/20",
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
                              <td className="py-4 px-6 hidden md:table-cell">
                                  <div className="flex items-center justify-center gap-1">
                                      {(() => {
                                          const completedRaces = races.filter(r => r.status === 'completed' && r.results).slice(-5);
                                          if (completedRaces.length === 0) return <span className="text-slate-600 text-[10px] italic">Sin datos</span>;
                                          
                                          return completedRaces.map(race => {
                                              const res = race.results!.find(r => r.driverId === driver.id);
                                              let badgeClass = "bg-slate-800 text-slate-500 border-white/5";
                                              let text = "-";
                                              
                                              if (res) {
                                                  if (res.dnf || res.isDisqualified) {
                                                      badgeClass = "bg-red-500/20 text-red-500 border-red-500/30";
                                                      text = "DNF";
                                                  } else if (res.position === 1) {
                                                      badgeClass = "bg-yellow-500/20 text-yellow-500 border-yellow-500/30 shadow-[0_0_8px_rgba(234,179,8,0.2)]";
                                                      text = "1";
                                                  } else if (res.position <= 3) {
                                                      badgeClass = "bg-slate-300/20 text-slate-300 border-slate-300/30";
                                                      text = res.position.toString();
                                                  } else if (res.points > 0) {
                                                      badgeClass = "bg-green-500/20 text-green-500 border-green-500/30";
                                                      text = res.position.toString();
                                                  } else {
                                                      text = res.position.toString();
                                                  }
                                              }
                                              
                                              return (
                                                  <div 
                                                      key={race.id} 
                                                      className={cn(
                                                          "w-6 h-6 rounded-md border flex items-center justify-center text-[10px] font-black transition-transform hover:scale-110 cursor-help",
                                                          badgeClass
                                                      )}
                                                      title={`${race.name}: ${res ? (res.dnf ? 'Abandono' : res.isDisqualified ? 'Descalificado' : `P${res.position}`) : 'No participó'}`}
                                                  >
                                                      {text}
                                                  </div>
                                              );
                                          });
                                      })()}
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
                                              Ver piloto
                                          </span>
                                          <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/50">
                                              <ChevronRight size={14} className="text-red-400 animate-pulse" />
                                          </div>
                                      </div>
                                      <div className="inline-block bg-slate-800 px-3 py-1 rounded-full border border-white/5 font-mono font-bold text-white min-w-[60px] text-center shadow-lg group-hover:border-red-500/50 group-hover:shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all">
                                          {driver.points}
                                      </div>
                                  </div>
                                  {/* Sweep effect */}
                                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />
                              </td>
                          </motion.tr>
                      );
                  })}
              </tbody>
          </table>
          )}
      </div>
      
      {/* Pagination Footer */}
      {hasStarted && totalPages > 1 && (
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
      )}

      {/* Driver Stats Modal */}
      {createPortal(
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
                className="bg-slate-900 border border-white/10 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden relative"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header with Team Color */}
                <div 
                  className="h-40 relative overflow-hidden"
                >
                  <div className="absolute inset-0 z-0" style={{ 
                    background: `linear-gradient(135deg, ${selectedDriver.teamColor}60, ${selectedDriver.teamColor}10, transparent)` 
                  }}></div>
                  <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_60%)] mix-blend-overlay"></div>
                  <div className="absolute inset-0 z-0 opacity-40 mix-blend-overlay" style={{ backgroundImage: `url('${TEXTURE_ASSETS.CARBON_FIBRE}')` }}></div>
                   {(() => {
                     const team = constructors.find(c => c.name === selectedDriver.team);
                     if (team?.logoUrl) {
                       return (
                         <div className="absolute -right-8 top-1/2 -translate-y-1/2 opacity-20 pointer-events-none transform -rotate-12 select-none grayscale mix-blend-screen overflow-hidden">
                           <img src={team.logoUrl} alt={team.name} className="w-80 h-80 object-contain drop-shadow-2xl filter blur-[1px]" />
                         </div>
                       );
                     }
                     return (
                       <div className="absolute right-0 top-1/2 -translate-y-1/2 leading-none font-black italic opacity-10 select-none" style={{ fontSize: '10rem', color: '#fff', WebkitTextStroke: '2px rgba(255,255,255,0.3)' }}>
                         {selectedDriver.team.substring(0, 3).toUpperCase()}
                       </div>
                     );
                   })()}
                  
                  <button
                    onClick={() => setSelectedDriver(null)}
                    className="absolute top-4 right-4 p-2.5 hover:bg-white/20 rounded-full transition-all duration-300 text-white bg-black/30 backdrop-blur-md border border-white/20 z-50 group/close"
                  >
                    <X size={20} className="group-hover/close:rotate-90 group-hover/close:scale-110 transition-transform duration-300" />
                  </button>
                  
                  <div className="absolute bottom-0 left-0 flex items-end gap-6 z-10 w-full bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent pt-12 pb-6 px-8">
                    <div className="flex flex-col gap-1 w-full">
                      <div className="flex items-center justify-between">
                        <h3 className="text-4xl md:text-5xl font-black italic text-white uppercase tracking-tighter drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)] flex items-center gap-4">
                          {selectedDriver.name}
                          <div className="h-1.5 w-16 md:w-24 rounded-full shadow-[0_0_10px_currentColor] opacity-90" style={{ backgroundColor: selectedDriver.teamColor, color: selectedDriver.teamColor }} />
                        </h3>
                        <div className="hidden md:flex flex-col items-end">
                          <span className="text-[10px] uppercase font-black tracking-[0.3em] text-white/50">Constructor</span>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-white/90 font-mono text-sm uppercase tracking-wider font-bold drop-shadow-md">
                              {selectedDriver.team}
                            </span>
                            {constructors.find(c => c.name === selectedDriver.team)?.logoUrl && (
                              <img src={constructors.find(c => c.name === selectedDriver.team)!.logoUrl} alt="Team" className="w-5 h-5 object-contain filter drop-shadow-md brightness-125" />
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex md:hidden items-center gap-2 mt-1">
                        {constructors.find(c => c.name === selectedDriver.team)?.logoUrl && (
                          <img src={constructors.find(c => c.name === selectedDriver.team)!.logoUrl} alt="Team" className="w-4 h-4 object-contain filter drop-shadow-md brightness-125" />
                        )}
                        <span className="text-white/80 font-mono text-xs uppercase tracking-wider font-bold drop-shadow-md">
                          {selectedDriver.team}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8 relative z-20">
                  {/* Left Column: EA Sports Style Rating Card */}
                  <div className="flex flex-col items-center relative z-50">
                    {(() => {
                      const ratings = calculateRatings(selectedDriver.id);
                      
                      // Determine card color based on MED (OVR)
                      let cardBg = "bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 border-slate-500 text-slate-200"; // Bronze/Default
                      let glow = "";
                      let divider = "bg-white/20";
                      let statLabel = "opacity-70";
                      let pattern = "bg-[repeating-linear-gradient(-45deg,transparent,transparent_6px,rgba(0,0,0,0.3)_6px,rgba(0,0,0,0.3)_12px)]";
                      
                      if (ratings.med >= 90) {
                        cardBg = "bg-gradient-to-br from-yellow-300 via-yellow-500 to-yellow-600 border-yellow-200 text-yellow-950";
                        glow = "shadow-[0_0_40px_rgba(234,179,8,0.5)]";
                        divider = "bg-yellow-900/20";
                        statLabel = "text-yellow-900/70";
                        pattern = "bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,255,255,0.15)_10px,rgba(255,255,255,0.15)_20px)]";
                      } else if (ratings.med >= 80) {
                        cardBg = "bg-gradient-to-br from-slate-200 via-slate-300 to-slate-400 border-white text-slate-900";
                        glow = "shadow-[0_0_30px_rgba(203,213,225,0.4)]";
                        divider = "bg-slate-900/20";
                        statLabel = "text-slate-900/70";
                        pattern = "bg-[radial-gradient(rgba(255,255,255,0.2)_2px,transparent_2px)] [background-size:12px_12px]";
                      } else {
                        cardBg = "bg-gradient-to-br from-orange-800 via-orange-900 to-slate-900 border-orange-700 text-orange-100";
                        glow = "shadow-[0_0_20px_rgba(194,65,12,0.4)]";
                      }

                      const fallbackUrl = `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(selectedDriver.id)}&backgroundColor=slate800`;
                      const avatarSrc = selectedDriver.avatarUrl || fallbackUrl;

                      return (
                        <div 
                          className="relative w-full max-w-[240px] aspect-[2/3] group cursor-pointer [perspective:1000px]"
                          onClick={() => setShowLegend(!showLegend)}
                        >
                          <motion.div
                            className="w-full h-full relative [transform-style:preserve-3d] transition-all duration-500"
                            animate={{ rotateY: showLegend ? 180 : 0 }}
                          >
                            {/* FRONT OF CARD */}
                            <div className={cn(
                              "absolute inset-0 [backface-visibility:hidden] rounded-2xl border-2 flex flex-col p-4 z-20 overflow-hidden transition-all duration-300 group-hover:scale-105 group-hover:-translate-y-2",
                              cardBg, glow
                            )}>
                              {/* Inner texture */}
                              <div className={cn("absolute inset-0 mix-blend-overlay", pattern)}></div>
                              
                              {/* Animated Shine Effect - Made more visible! */}
                              <motion.div 
                                animate={{ x: ['-100%', '200%'] }} 
                                transition={{ repeat: Infinity, duration: 2.5, ease: "linear", repeatDelay: 5 }} 
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[20deg] z-20 pointer-events-none mix-blend-overlay w-[150%]" 
                              />
                              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-30 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.6),transparent_60%)]" />
                              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12 z-30 pointer-events-none" />

                              {/* Info Icon */}
                              <div className="absolute top-3 right-3 opacity-50 group-hover:opacity-100 transition-opacity z-40">
                                 <Info size={16} />
                              </div>
                              
                              {/* Top Row: Rating & Logos */}
                              <div className="relative z-10 flex justify-between items-start">
                                <div className="flex flex-col items-center">
                                  <span className="text-5xl font-black leading-none tracking-tighter drop-shadow-sm">{ratings.med}</span>
                                  <span className="text-xs font-bold uppercase tracking-widest opacity-90">MED</span>
                                </div>
                                <div className="flex flex-col items-end gap-2 pr-6">
                                  {constructors.find(c => c.name === selectedDriver.team)?.logoUrl && (
                                    <img src={constructors.find(c => c.name === selectedDriver.team)!.logoUrl} alt="Team" className="w-8 h-8 object-contain drop-shadow-md" />
                                  )}
                                </div>
                              </div>
                              
                              {/* Center: Avatar */}
                              <div className="relative z-10 flex-grow flex items-center justify-center mt-2 mb-2">
                                <img 
                                  src={avatarSrc} 
                                  alt={selectedDriver.name}
                                  className="w-28 h-28 object-cover rounded-full border-4 shadow-xl bg-slate-800" 
                                  style={{borderColor: selectedDriver.teamColor}} 
                                  onError={(e) => { e.currentTarget.src = fallbackUrl; }}
                                />
                              </div>
                              
                              <div className={cn("relative z-10 w-full h-[2px] my-2 rounded-full", divider)} />
                              
                              {/* Stats Grid */}
                              <div className="relative z-10 w-full grid grid-cols-2 gap-x-4 gap-y-1 text-sm font-bold uppercase tracking-wider">
                                <div className="flex justify-between items-center">
                                  <span className={statLabel}>RIT</span>
                                  <span className="drop-shadow-sm">{ratings.rit}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className={statLabel}>CNS</span>
                                  <span className="drop-shadow-sm">{ratings.cns}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className={statLabel}>SUP</span>
                                  <span className="drop-shadow-sm">{ratings.sup}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className={statLabel}>EXP</span>
                                  <span className="drop-shadow-sm">{ratings.exp}</span>
                                </div>
                              </div>
                            </div>

                            {/* BACK OF CARD (LEGEND) */}
                            <div 
                              className={cn(
                                "absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-2xl border-2 flex flex-col z-20 overflow-hidden transition-all duration-300 group-hover:scale-105 group-hover:-translate-y-2",
                                "bg-slate-950 border-slate-700", glow
                              )}
                            >
                              {/* Punchy Background */}
                              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.4),transparent_70%)]"></div>
                              <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_2px,rgba(255,255,255,0.05)_2px,rgba(255,255,255,0.05)_4px)]"></div>
                              
                              <div className="relative z-10 flex flex-col h-full p-5">
                                <div className="flex items-center justify-center gap-2 mb-4 pb-3 border-b border-white/10">
                                  <Activity className="text-blue-400" size={18} />
                                  <h4 className="font-black text-white uppercase tracking-widest text-sm">Atributos</h4>
                                </div>
                                
                                <div className="flex-grow flex flex-col justify-center space-y-3 text-xs">
                                  <div className="flex items-start gap-3">
                                    <span className="font-black text-blue-400 w-8 text-right">MED</span>
                                    <span className="text-slate-300 leading-tight">Valoración global del piloto.</span>
                                  </div>
                                  <div className="flex items-start gap-3">
                                    <span className="font-black text-white w-8 text-right">RIT</span>
                                    <span className="text-slate-300 leading-tight">Ritmo y velocidad pura.</span>
                                  </div>
                                  <div className="flex items-start gap-3">
                                    <span className="font-black text-white w-8 text-right">CNS</span>
                                    <span className="text-slate-300 leading-tight">Constancia en resultados.</span>
                                  </div>
                                  <div className="flex items-start gap-3">
                                    <span className="font-black text-white w-8 text-right">SUP</span>
                                    <span className="text-slate-300 leading-tight">Capacidad de evitar DNF.</span>
                                  </div>
                                  <div className="flex items-start gap-3">
                                    <span className="font-black text-white w-8 text-right">EXP</span>
                                    <span className="text-slate-300 leading-tight">Experiencia en carreras.</span>
                                  </div>
                                </div>
                                
                                <div className="mt-auto pt-4 border-t border-white/10 grid grid-cols-3 gap-2 text-center">
                                  <div className="flex flex-col items-center p-1.5 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
                                    <span className="text-[9px] font-black text-yellow-500 uppercase tracking-wider">Oro</span>
                                    <span className="text-[11px] font-bold text-white">≥ 90</span>
                                  </div>
                                  <div className="flex flex-col items-center p-1.5 bg-slate-400/10 rounded-lg border border-slate-400/30">
                                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-wider">Plata</span>
                                    <span className="text-[11px] font-bold text-white">80-89</span>
                                  </div>
                                  <div className="flex flex-col items-center p-1.5 bg-orange-700/10 rounded-lg border border-orange-700/30">
                                    <span className="text-[9px] font-black text-orange-500 uppercase tracking-wider">Bronce</span>
                                    <span className="text-[11px] font-bold text-white">&lt; 80</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        </div>
                      );
                    })()}

                    {/* Recent Form (Last 5 races) */}
                    <div className="mt-8 w-full max-w-[240px]">
                      <h4 className="text-[10px] font-black text-slate-400/80 uppercase tracking-widest mb-3 flex items-center justify-center gap-2">
                        <Activity size={12} className="text-blue-500/70" />
                        Últimas 5
                      </h4>
                      <div className="flex gap-1.5 w-full">
                        {(() => {
                          const completedRaces = races.filter(r => r.status === 'completed' && r.results).slice(-5);
                          if (completedRaces.length === 0) return <span className="text-slate-500 text-[10px] italic w-full text-center">Sin datos</span>;
                          
                          // Pad with empty if less than 5
                          const paddedRaces = [...completedRaces];
                          while (paddedRaces.length < 5) paddedRaces.unshift(null as any);

                          return paddedRaces.map((race, index) => {
                            if (!race) {
                               return <div key={`empty-${index}`} className="flex-1 py-1.5 rounded bg-slate-900 border border-white/5 opacity-50"></div>;
                            }
                            
                            const res = race.results!.find(r => r.driverId === selectedDriver.id);
                            let bgColor = "bg-slate-800";
                            let textColor = "text-slate-500";
                            let text = "-";
                            let glowClass = "";
                            
                            if (res) {
                              if (res.dnf || res.isDisqualified) {
                                bgColor = "bg-red-500/10";
                                textColor = "text-red-400";
                                text = "DNF";
                                glowClass = "hover:shadow-[0_0_10px_rgba(239,68,68,0.2)]";
                              } else if (res.position === 1) {
                                bgColor = "bg-yellow-500/20";
                                textColor = "text-yellow-400";
                                text = "1º";
                                glowClass = "hover:shadow-[0_0_12px_rgba(234,179,8,0.3)] border-yellow-500/30";
                              } else if (res.position <= 3) {
                                bgColor = "bg-slate-300/20";
                                textColor = "text-slate-200";
                                text = `${res.position}º`;
                                glowClass = "hover:shadow-[0_0_10px_rgba(203,213,225,0.2)] border-slate-300/30";
                              } else if (res.points > 0) {
                                bgColor = "bg-green-500/10";
                                textColor = "text-green-400";
                                text = `${res.position}º`;
                                glowClass = "hover:shadow-[0_0_10px_rgba(34,197,94,0.2)]";
                              } else {
                                text = `${res.position}º`;
                                glowClass = "hover:shadow-[0_0_10px_rgba(255,255,255,0.05)]";
                              }
                            }
                            
                            return (
                              <div key={race.id} className="flex-1 flex flex-col items-center group/race relative cursor-default">
                                <div className={cn("w-full py-1.5 rounded border border-white/5 flex justify-center items-center font-mono font-black text-[10px] transition-all duration-300", bgColor, textColor, glowClass)} title={race.name}>
                                  {text}
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>

                  </div>

                  {/* Right Column: Stats & Form */}
                  <div className="md:col-span-2 space-y-6">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {(() => {
                      const stats = getDriverStats(selectedDriver.id);
                      const points = selectedDriver.points;
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
                     {/* Achievements */}
                    {(() => {
                      const completedRaces = races.filter(r => r.status === 'completed');
                      const driverAchievements = allAchievements.filter(a => a.driverId === selectedDriver.id);
                      
                      if (driverAchievements.length === 0 && completedRaces.length === 0) return null;

                      return (
                        <div className="mt-6 flex-grow flex flex-col min-h-0">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 relative">
                              <Trophy size={16} className="text-yellow-500/80" />
                              Palmarés <span className="text-yellow-500/50">({driverAchievements.length})</span>
                              <div className="absolute left-0 bottom-0 w-8 h-px bg-yellow-500/50 -mb-2"></div>
                            </h4>
                            <button
                              onClick={() => setShowAllAchievements(true)}
                              className="text-[10px] uppercase font-black tracking-[0.1em] text-yellow-500 hover:text-yellow-400 bg-yellow-500/10 hover:bg-yellow-500/20 px-4 py-1.5 rounded border border-yellow-500/20 hover:border-yellow-500/40 transition-all flex items-center gap-1 group/btn shadow-[0_0_15px_rgba(234,179,8,0.15)] relative overflow-hidden"
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/0 via-yellow-500/20 to-yellow-500/0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 ease-in-out"></div>
                              <span className="relative z-10 drop-shadow-[0_0_8px_rgba(234,179,8,0.8)]">Catálogo Completo</span>
                              <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform relative z-10" />
                            </button>
                          </div>
                          
                          <div className="flex-1 min-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                            {driverAchievements.length > 0 ? (
                              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                                {driverAchievements.map((achievement) => (
                                  <AchievementBadge key={achievement.id} achievement={achievement} />
                                ))}
                              </div>
                            ) : (
                              <div className="flex items-center gap-3 bg-slate-900/50 border border-dashed border-slate-700/50 rounded-xl px-4 py-3 w-full opacity-60">
                                <div className="w-8 h-8 rounded-full border border-dashed border-slate-600 flex items-center justify-center bg-slate-800/30">
                                  <Trophy size={14} className="text-slate-500" />
                                </div>
                                <span className="text-slate-400 text-[11px] uppercase tracking-widest font-black">La temporada es larga. Aún hay tiempo...</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
      </AnimatePresence>,
      document.body
    )}

    {/* Catalogue Modal */}
    {createPortal(
      <AnimatePresence>
        {showAllAchievements && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm"
            onClick={() => setShowAllAchievements(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden relative flex flex-col max-h-[85vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-500/20 rounded-lg text-yellow-500">
                    <Trophy size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-black italic text-slate-100 uppercase tracking-tight">Catálogo de Logros</h3>
                      <div className="group relative z-30 flex items-center justify-center">
                        <Info size={16} className="text-slate-500 hover:text-slate-300 cursor-help transition-colors" />
                        <div className="absolute top-full left-0 md:left-1/2 md:-translate-x-1/2 mt-3 w-64 p-4 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[100] pointer-events-none">
                          <div className="text-[11px] leading-relaxed text-slate-300 font-medium normal-case tracking-normal">
                            <span className="text-yellow-500 font-bold block mb-2 uppercase tracking-widest text-[9px]">Estilos de Piloto</span>
                            <ul className="space-y-1.5 pl-3 list-disc text-slate-300 marker:text-yellow-500/50">
                              <li>Muchos logros son <span className="text-white font-black">excluyentes</span> entre sí.</li>
                              <li>No están pensados para conseguirse todos.</li>
                              <li>Valoran y representan visualmente tu historial en pista.</li>
                            </ul>
                          </div>
                          <div className="absolute left-6 md:left-1/2 md:-translate-x-1/2 -top-[5px] w-2 h-2 bg-slate-900 border-t border-l border-slate-700 rotate-45"></div>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400">
                       Has desbloqueado {selectedDriver ? allAchievements.filter(a => a.driverId === selectedDriver.id).length : 0} de {ALL_ACHIEVEMENT_DEFINITIONS.length} disponibles
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAllAchievements(false)}
                  className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto overflow-x-hidden flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 custom-scrollbar">
                {ALL_ACHIEVEMENT_DEFINITIONS.map(def => {
                  const hasItInCurrentDriver = selectedDriver ? allAchievements.some(a => a.id === def.id && a.driverId === selectedDriver.id) : false;
                  
                  return (
                    <div 
                      key={def.id}
                      className={cn(
                        "flex items-center gap-4 p-3 rounded-xl border transition-all duration-300",
                        hasItInCurrentDriver 
                          ? "bg-slate-800/80 border-yellow-500/30 shadow-[0_0_15px_rgba(234,179,8,0.1)]" 
                          : "bg-slate-900/50 border-slate-800 opacity-60 grayscale hover:grayscale-0 hover:opacity-100"
                      )}
                    >
                      <div className="w-12 h-12 rounded-lg bg-black/40 flex items-center justify-center shrink-0 border border-white/5 shadow-inner text-2xl">
                        {def.emoji}
                      </div>
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className={cn(
                          "text-sm font-black uppercase tracking-tight truncate",
                          hasItInCurrentDriver ? "text-yellow-400" : "text-slate-300"
                        )}>
                          {def.name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium leading-tight">
                          {def.description}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body
    )}

    {/* Fastest Lap Modal */}
    <FastestLapModal
      driverId={activeFastestLapDriver}
      drivers={drivers}
      races={races}
      onClose={() => setActiveFastestLapDriver(null)}
    />
  </motion.div>
  );
});