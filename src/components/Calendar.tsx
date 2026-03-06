import React, { useState } from 'react';
import { ChampionshipData, Race, RaceResult } from '../types';
import { Calendar as CalendarIcon, MapPin, Trophy, ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface CalendarProps {
  data: ChampionshipData;
}

export function Calendar({ data }: CalendarProps) {
  const [selectedRace, setSelectedRace] = useState<Race | null>(null);

  const getDriverName = (id: string) => data.drivers.find((d) => d.id === id)?.name || id;
  const getTeamColor = (id: string) => data.drivers.find((d) => d.id === id)?.teamColor || '#fff';
  const getTeamName = (id: string) => data.drivers.find((d) => d.id === id)?.team || 'Unknown';

  return (
    <div className="pb-20">
      <h2 className="text-3xl font-black italic text-white mb-8 uppercase tracking-tighter flex items-center gap-3">
        <CalendarIcon className="w-8 h-8 text-red-500" />
        Race Calendar
      </h2>

      <div className="space-y-4">
        {data.races.map((race, index) => (
          <motion.div
            key={race.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => race.status === 'completed' && setSelectedRace(race)}
            className={cn(
              "relative overflow-hidden rounded-xl border p-6 transition-all duration-300 group",
              race.status === 'completed'
                ? "bg-slate-900/60 border-white/10 hover:border-red-500/50 cursor-pointer hover:bg-slate-800/80"
                : "bg-slate-950/40 border-white/5 opacity-75"
            )}
          >
            {/* Status Indicator Strip */}
            <div className={cn(
              "absolute left-0 top-0 bottom-0 w-1.5",
              race.status === 'completed' ? "bg-green-500" : "bg-slate-700"
            )} />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pl-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-xs font-mono text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-white/5">
                    R{index + 1}
                  </span>
                  <span className="text-sm font-mono text-red-400 uppercase tracking-widest">
                    {race.date}
                  </span>
                </div>
                <h3 className="text-xl font-black italic text-white uppercase tracking-tight group-hover:text-red-500 transition-colors">
                  {race.name}
                </h3>
                <div className="flex items-center gap-2 text-slate-400 text-sm mt-1">
                  <MapPin size={14} />
                  {race.circuit}
                </div>
              </div>

              {race.status === 'completed' && race.results && (
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-3">
                    {race.results.slice(0, 3).map((result, i) => (
                      <div
                        key={result.driverId}
                        className={cn(
                          "w-10 h-10 rounded-full border-2 border-slate-900 flex items-center justify-center text-xs font-bold text-white relative z-10",
                          i === 0 ? "w-12 h-12 z-20" : ""
                        )}
                        style={{ backgroundColor: getTeamColor(result.driverId) }}
                        title={getDriverName(result.driverId)}
                      >
                        {i === 0 ? '1st' : i === 1 ? '2nd' : '3rd'}
                      </div>
                    ))}
                  </div>
                  <ChevronRight className="text-slate-600 group-hover:text-white transition-colors" />
                </div>
              )}
              
              {race.status === 'pending' && (
                 <div className="px-4 py-2 rounded-full bg-slate-800/50 border border-white/5 text-xs font-mono text-slate-400 uppercase">
                    Upcoming
                 </div>
              )}
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
              className="bg-slate-900 border border-white/10 w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-slate-900/95 backdrop-blur border-b border-white/10 p-6 flex justify-between items-start z-10">
                <div>
                  <h3 className="text-2xl font-black italic text-white uppercase tracking-tight">
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
                        <th className="py-3 px-2">Pos</th>
                        <th className="py-3 px-2">Driver</th>
                        <th className="py-3 px-2">Team</th>
                        <th className="py-3 px-2 text-right">Pts</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedRace.results?.map((result) => (
                        <tr
                          key={result.driverId}
                          className="border-b border-white/5 hover:bg-white/5 transition-colors"
                        >
                          <td className="py-3 px-2 font-mono text-slate-400">
                            {result.position}
                          </td>
                          <td className="py-3 px-2">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-1 h-8 rounded-full"
                                style={{ backgroundColor: getTeamColor(result.driverId) }}
                              />
                              <span className="font-bold text-white">
                                {getDriverName(result.driverId)}
                              </span>
                              {result.fastestLap && (
                                <span className="text-[10px] bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded border border-purple-500/30 font-mono">
                                  FL
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-2 text-sm text-slate-400">
                            {getTeamName(result.driverId)}
                          </td>
                          <td className="py-3 px-2 text-right font-mono font-bold text-white">
                            +{result.points}
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
