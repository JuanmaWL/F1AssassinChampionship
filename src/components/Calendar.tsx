import React, { useState } from 'react';
import { ChampionshipData, Race } from '../types';
import { Calendar as CalendarIcon, MapPin, ChevronRight, X, LayoutGrid, List, Timer, Clock, Wrench } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, formatDate } from '../lib/utils';

interface CalendarProps {
  data: ChampionshipData;
}

export function Calendar({ data }: CalendarProps) {
  const [selectedRace, setSelectedRace] = useState<Race | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const getDriverName = (id: string) => data.drivers.find((d) => d.id === id)?.name || id;
  const getTeamColor = (id: string) => data.drivers.find((d) => d.id === id)?.teamColor || '#fff';
  const getTeamName = (id: string) => data.drivers.find((d) => d.id === id)?.team || 'Unknown';

  return (
    <div className="pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <h2 className="text-3xl font-black italic text-white uppercase tracking-tighter flex items-center gap-3">
            <CalendarIcon className="w-8 h-8 text-red-500" />
            Calendario de Carreras
        </h2>
        
        {/* View Toggle */}
        <div className="bg-slate-900 p-1 rounded-lg border border-white/10 hidden md:flex items-center self-start md:self-auto">
            <button
                onClick={() => setViewMode('list')}
                className={cn(
                    "p-2 rounded-md transition-all flex items-center gap-2 text-sm font-bold uppercase",
                    viewMode === 'list' ? "bg-slate-800 text-white shadow-sm" : "text-slate-500 hover:text-slate-300"
                )}
            >
                <List size={18} />
                Lista
            </button>
            <button
                onClick={() => setViewMode('grid')}
                className={cn(
                    "p-2 rounded-md transition-all flex items-center gap-2 text-sm font-bold uppercase",
                    viewMode === 'grid' ? "bg-slate-800 text-white shadow-sm" : "text-slate-500 hover:text-slate-300"
                )}
            >
                <LayoutGrid size={18} />
                Grid
            </button>
        </div>
      </div>

      <div className={cn(
          "gap-4",
          viewMode === 'list' ? "space-y-4" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
      )}>
        {data.races.map((race, index) => (
          <motion.div
            key={race.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={cn(
              "group",
              viewMode === 'list' ? "flex items-center gap-6" : "h-full"
            )}
          >
            {/* List View Number - Outside */}
            {viewMode === 'list' && (
                <div className="text-5xl font-black italic text-slate-800 group-hover:text-red-600 transition-colors duration-300 min-w-[3.5rem] text-right select-none">
                    {index + 1}
                </div>
            )}

            <div
                onClick={() => race.status === 'completed' && setSelectedRace(race)}
                className={cn(
                  "relative overflow-hidden rounded-xl border transition-all duration-300 w-full",
                  // Hover Animations
                  "hover:shadow-2xl hover:shadow-red-900/10 hover:-translate-y-1",
                  race.status === 'completed'
                    ? "bg-slate-900/60 border-white/10 hover:border-red-500/50 cursor-pointer hover:bg-slate-800/80"
                    : "bg-slate-950/40 border-white/5 opacity-75",
                  viewMode === 'list' ? "p-6" : "p-6 flex flex-col h-full min-h-[200px]"
                )}
            >
                {/* Circuit Background Image (Fictional/Placeholder) */}
                <div 
                    className="absolute inset-0 opacity-10 pointer-events-none grayscale group-hover:grayscale-0 transition-all duration-500"
                    style={{
                        backgroundImage: `url(https://picsum.photos/seed/${race.circuit.replace(/\s/g, '')}/800/400)`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                    }}
                />

                {/* Grid View Number - Inside (Improved Position) */}
                {viewMode === 'grid' && (
                    <div className="absolute -bottom-6 -right-2 text-[120px] leading-none font-black italic text-white/5 group-hover:text-white/10 transition-colors select-none pointer-events-none z-0">
                        {index + 1}
                    </div>
                )}
                
                {/* Checkered Flag Fade for Completed Races */}
                {race.status === 'completed' && (
                    <div 
                        className="absolute inset-y-0 right-0 w-1/2 opacity-20 pointer-events-none z-0"
                        style={{
                            backgroundImage: `
                                linear-gradient(to right, transparent, #000),
                                repeating-conic-gradient(#333 0% 25%, transparent 0% 50%)
                            `,
                            backgroundSize: '100% 100%, 20px 20px',
                            maskImage: 'linear-gradient(to left, black, transparent)'
                        }}
                    />
                )}
                
                {/* Status Indicator Strip */}
                <div className={cn(
                  "absolute left-0 top-0 bottom-0 w-1.5 z-10 transition-all duration-300 group-hover:w-2",
                  race.status === 'completed' ? "bg-green-500 group-hover:bg-green-400" : "bg-slate-700 group-hover:bg-slate-600"
                )} />

                <div className={cn(
                    "flex justify-between gap-4 pl-4 h-full relative z-10",
                    viewMode === 'list' ? "flex-col md:flex-row md:items-center" : "flex-col"
                )}>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-sm font-mono text-red-400 uppercase tracking-widest">
                        {formatDate(race.date)}
                      </span>
                    </div>
                    <h3 className={cn(
                        "font-black italic text-white uppercase tracking-tight group-hover:text-red-500 transition-colors flex items-center gap-3",
                        viewMode === 'list' ? "text-xl" : "text-2xl"
                    )}>
                      {race.name}
                      {race.flagCode && (
                          <img 
                              src={`https://flagcdn.com/w40/${race.flagCode}.png`} 
                              alt={race.flagCode} 
                              className="h-5 w-auto rounded shadow-sm object-cover"
                          />
                      )}
                    </h3>
                    <div className="flex items-center gap-2 text-slate-400 text-sm mt-1">
                      <MapPin size={14} />
                      {race.circuit}
                    </div>
                  </div>

                  {race.status === 'completed' && race.results && (
                    <div className={cn(
                        "flex items-center gap-4",
                        viewMode === 'grid' ? "mt-auto pt-4 border-t border-white/5 justify-between" : ""
                    )}>
                      <div className="flex -space-x-3">
                        {race.results.slice(0, 3).map((result, i) => (
                          <div
                            key={result.driverId}
                            className={cn(
                              "w-10 h-10 rounded-full border-2 border-slate-900 flex items-center justify-center text-xs font-bold text-white relative z-10 shadow-lg transition-transform hover:scale-110 hover:z-30",
                              i === 0 ? "w-12 h-12 z-20 bg-yellow-500 text-black border-yellow-400" : 
                              i === 1 ? "bg-slate-300 text-black border-slate-400" :
                              "bg-orange-700 text-white border-orange-600"
                            )}
                            title={getDriverName(result.driverId)}
                          >
                            {i === 0 ? '1' : i === 1 ? '2' : '3'}
                          </div>
                        ))}
                      </div>
                      <ChevronRight className="text-slate-600 group-hover:text-white transition-colors transform group-hover:translate-x-1" />
                    </div>
                  )}
                  
                  {race.status === 'pending' && (
                     <div className={cn(
                        viewMode === 'grid' ? "mt-auto pt-4" : ""
                     )}>
                        <div className="inline-block px-4 py-2 rounded-full bg-slate-800/50 border border-white/5 text-xs font-mono text-slate-400 uppercase backdrop-blur-sm group-hover:bg-slate-700/50 transition-colors">
                            Pendiente
                        </div>
                     </div>
                  )}
                </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Race Details Modal */}
      <AnimatePresence>
        {selectedRace && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedRace(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-slate-900 border border-white/10 w-full max-w-4xl max-h-[85vh] overflow-y-auto rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-slate-900/95 backdrop-blur border-b border-white/10 p-6 flex justify-between items-start z-10">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded uppercase">
                        Ronda {data.races.findIndex(r => r.id === selectedRace.id) + 1}
                    </span>
                    <span className="text-slate-400 text-sm font-mono">
                        {formatDate(selectedRace.date)}
                    </span>
                  </div>
                  <h3 className="text-3xl font-black italic text-white uppercase tracking-tight">
                    {selectedRace.name}
                  </h3>
                  <p className="text-slate-400 flex items-center gap-2 text-sm mt-1">
                    <MapPin size={14} /> {selectedRace.circuit}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedRace(null)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-slate-500">
                        <th className="py-3 px-2 w-12 text-center">Pos</th>
                        <th className="py-3 px-2">Piloto</th>
                        <th className="py-3 px-2 hidden sm:table-cell">Equipo</th>
                        <th className="py-3 px-2 text-right">
                            <div className="flex items-center justify-end gap-1">
                                <Clock size={14} /> Tiempo
                            </div>
                        </th>
                        <th className="py-3 px-2 text-right">
                            <div className="flex items-center justify-end gap-1">
                                <Timer size={14} /> VR
                            </div>
                        </th>
                        <th className="py-3 px-2 text-center">
                            <div className="flex items-center justify-center gap-1">
                                <Wrench size={14} /> Pits
                            </div>
                        </th>
                        <th className="py-3 px-2 text-right">Pts</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedRace.results?.map((result) => (
                        <tr
                          key={result.driverId}
                          className="border-b border-white/5 hover:bg-white/5 transition-colors"
                        >
                          <td className="py-3 px-2 font-mono text-center font-bold">
                            {result.dnf ? (
                                <span className="text-red-500">DNF</span>
                            ) : (
                                <span className="text-slate-400">{result.position}</span>
                            )}
                          </td>
                          <td className="py-3 px-2">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-1 h-8 rounded-full"
                                style={{ backgroundColor: getTeamColor(result.driverId) }}
                              />
                              <div>
                                <div className="font-bold text-white flex items-center gap-2">
                                    {getDriverName(result.driverId)}
                                    {result.fastestLap && !result.dnf && (
                                        <span className="text-[10px] bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded border border-purple-500/30 font-mono flex items-center gap-1" title="Vuelta Rápida">
                                        <Timer size={10} />
                                        </span>
                                    )}
                                </div>
                                <div className="text-xs text-slate-500 sm:hidden">{getTeamName(result.driverId)}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-2 text-sm text-slate-400 hidden sm:table-cell">
                            {getTeamName(result.driverId)}
                          </td>
                          <td className="py-3 px-2 text-right font-mono text-sm text-slate-300">
                            {result.dnf ? '-' : (result.raceTime || '-')}
                          </td>
                          <td className={cn(
                              "py-3 px-2 text-right font-mono text-sm",
                              result.fastestLap ? "text-purple-400 font-bold" : "text-slate-500"
                          )}>
                            {result.dnf ? '-' : (result.fastestLapTime || '-')}
                          </td>
                          <td className="py-3 px-2 text-center font-mono text-sm text-slate-500">
                            {result.dnf ? '-' : (result.pitStops || 0)}
                          </td>
                          <td className="py-3 px-2 text-right font-mono font-bold text-white">
                            {result.dnf ? <span className="text-slate-600">0</span> : `+${result.points}`}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
