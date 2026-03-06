import React, { useState } from 'react';
import { Trophy, Flag, Timer, ChevronLeft, ChevronRight, Crown } from 'lucide-react';
import { ChampionshipData } from '../types';
import { motion } from 'motion/react';
import { formatDate, cn } from '../lib/utils';

interface DashboardProps {
  data: ChampionshipData;
}

export function Dashboard({ data }: DashboardProps) {
  const sortedDrivers = [...data.drivers].sort((a, b) => b.points - a.points);
  const sortedConstructors = [...data.constructors].sort((a, b) => b.points - a.points);

  const remainingRaces = data.races.filter((r) => r.status === 'pending').length;
  const totalRaces = data.races.length;
  const completedRaces = totalRaces - remainingRaces;
  const pointsRemaining = remainingRaces * 26; // Max points per race (25 + 1 fastest lap)

  // Pagination for Drivers Table
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(sortedDrivers.length / itemsPerPage);
  const paginatedDrivers = sortedDrivers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const topThree = sortedDrivers.slice(0, 3);

  return (
    <div className="space-y-12 pb-20">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-6 rounded-2xl relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Flag size={64} className="text-white" />
          </div>
          <h3 className="text-slate-400 text-sm uppercase tracking-wider font-medium">Progreso de Temporada</h3>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-4xl font-black text-white italic">{completedRaces}</span>
            <span className="text-slate-500 font-mono">/ {totalRaces} Carreras</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 mt-4 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-full"
              style={{ width: `${(completedRaces / totalRaces) * 100}%` }}
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-6 rounded-2xl relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Trophy size={64} className="text-yellow-500" />
          </div>
          <h3 className="text-slate-400 text-sm uppercase tracking-wider font-medium">Puntos en Juego</h3>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-4xl font-black text-white italic">{pointsRemaining}</span>
            <span className="text-slate-500 font-mono">Puntos Max</span>
          </div>
          <p className="text-xs text-slate-500 mt-4">
            Basado en 25pts + 1pt VR por carrera restante
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-6 rounded-2xl relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Timer size={64} className="text-red-500" />
          </div>
          <h3 className="text-slate-400 text-sm uppercase tracking-wider font-medium">Próximo GP</h3>
          <div className="mt-2">
            <span className="text-2xl font-black text-white italic block truncate">
              {data.races.find(r => r.status === 'pending')?.name || 'Temporada Finalizada'}
            </span>
            <span className="text-slate-500 text-sm font-mono block mt-1">
              {formatDate(data.races.find(r => r.status === 'pending')?.date || '')}
            </span>
          </div>
        </motion.div>
      </div>

      {/* Top 3 Podium Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end justify-center py-8"
      >
        {/* 2nd Place */}
        {topThree[1] && (
          <div className="order-2 md:order-1 flex flex-col items-center group">
             <div className="relative">
                <div className="w-24 h-24 rounded-full border-4 border-slate-800 flex items-center justify-center bg-slate-900 shadow-lg z-10 relative overflow-hidden" style={{ borderColor: topThree[1].teamColor }}>
                   <span className="text-3xl font-black text-slate-300 z-10">2</span>
                   <div className="absolute inset-0 bg-gradient-to-tr from-black/50 to-transparent z-0"></div>
                </div>
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-slate-800 text-xs px-3 py-1 rounded-full text-slate-300 border border-slate-700 shadow-md whitespace-nowrap z-20">
                    {topThree[1].points} PTS
                </div>
             </div>
             <div className="mt-6 text-center">
                <h3 className="text-xl font-bold text-white italic group-hover:text-slate-300 transition-colors">{topThree[1].name}</h3>
                <p className="text-sm text-slate-400">{topThree[1].team}</p>
             </div>
             <div className="h-24 w-full bg-gradient-to-t from-slate-800/50 to-transparent mt-4 rounded-t-xl border-x border-t border-white/5 mx-auto max-w-[120px]"></div>
          </div>
        )}

        {/* 1st Place */}
        {topThree[0] && (
          <div className="order-1 md:order-2 flex flex-col items-center z-20 -mt-8 md:mt-0 group">
             <div className="relative">
                <Crown className="absolute -top-10 left-1/2 -translate-x-1/2 text-yellow-500 w-10 h-10 animate-bounce drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]" />
                <div className="w-32 h-32 rounded-full border-4 border-yellow-500 flex items-center justify-center bg-slate-900 shadow-[0_0_30px_rgba(234,179,8,0.2)] z-10 relative overflow-hidden">
                   <span className="text-5xl font-black text-yellow-500 z-10">1</span>
                   <div className="absolute inset-0 bg-gradient-to-tr from-yellow-500/10 to-transparent z-0"></div>
                </div>
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-yellow-500 text-black font-black text-sm px-4 py-1.5 rounded-full border border-yellow-400 shadow-lg whitespace-nowrap z-20">
                    {topThree[0].points} PTS
                </div>
             </div>
             <div className="mt-8 text-center">
                <h3 className="text-3xl font-black text-white italic uppercase tracking-wider group-hover:text-yellow-500 transition-colors">{topThree[0].name}</h3>
                <p className="text-sm text-slate-400 font-medium">{topThree[0].team}</p>
             </div>
             <div className="h-32 w-full bg-gradient-to-t from-yellow-500/10 to-transparent mt-4 rounded-t-xl border-x border-t border-yellow-500/20 mx-auto max-w-[140px]"></div>
          </div>
        )}

        {/* 3rd Place */}
        {topThree[2] && (
          <div className="order-3 md:order-3 flex flex-col items-center group">
             <div className="relative">
                <div className="w-24 h-24 rounded-full border-4 border-slate-800 flex items-center justify-center bg-slate-900 shadow-lg z-10 relative overflow-hidden" style={{ borderColor: topThree[2].teamColor }}>
                   <span className="text-3xl font-black text-orange-700 z-10">3</span>
                   <div className="absolute inset-0 bg-gradient-to-tr from-black/50 to-transparent z-0"></div>
                </div>
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-slate-800 text-xs px-3 py-1 rounded-full text-slate-300 border border-slate-700 shadow-md whitespace-nowrap z-20">
                    {topThree[2].points} PTS
                </div>
             </div>
             <div className="mt-6 text-center">
                <h3 className="text-xl font-bold text-white italic group-hover:text-orange-700 transition-colors">{topThree[2].name}</h3>
                <p className="text-sm text-slate-400">{topThree[2].team}</p>
             </div>
             <div className="h-16 w-full bg-gradient-to-t from-slate-800/50 to-transparent mt-4 rounded-t-xl border-x border-t border-white/5 mx-auto max-w-[120px]"></div>
          </div>
        )}
      </motion.div>

      {/* Drivers Championship Table */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
            <h2 className="text-2xl font-black italic text-white uppercase tracking-tighter flex items-center gap-3">
            <span className="w-1 h-8 bg-red-600 rounded-full block"></span>
            Mundial de Pilotos
            </h2>
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
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-slate-950/50 text-xs uppercase tracking-wider text-slate-500 font-medium">
                        <th className="py-4 px-6 w-16 text-center">Pos</th>
                        <th className="py-4 px-6">Piloto</th>
                        <th className="py-4 px-6 hidden md:table-cell">Equipo</th>
                        <th className="py-4 px-6 text-right">Puntos</th>
                    </tr>
                </thead>
                <tbody>
                    {paginatedDrivers.map((driver, index) => {
                        const globalIndex = (currentPage - 1) * itemsPerPage + index;
                        return (
                            <motion.tr 
                                key={driver.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="border-b border-white/5 hover:bg-white/5 transition-colors group"
                            >
                                <td className="py-4 px-6 text-center font-mono font-bold text-slate-400 group-hover:text-white">
                                    {globalIndex + 1}
                                </td>
                                <td className="py-4 px-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-1 h-8 rounded-full" style={{ backgroundColor: driver.teamColor }} />
                                        <div>
                                            <div className="font-bold text-white text-lg italic">{driver.name}</div>
                                            <div className="text-xs text-slate-500 md:hidden">{driver.team}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-4 px-6 hidden md:table-cell text-slate-400">
                                    {driver.team}
                                </td>
                                <td className="py-4 px-6 text-right">
                                    <div className="inline-block bg-slate-800 px-3 py-1 rounded-full border border-white/5 font-mono font-bold text-white min-w-[60px] text-center">
                                        {driver.points}
                                    </div>
                                </td>
                            </motion.tr>
                        );
                    })}
                </tbody>
            </table>
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
      </motion.div>

      {/* Constructors Championship Table */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-white/10">
            <h2 className="text-2xl font-black italic text-white uppercase tracking-tighter flex items-center gap-3">
            <span className="w-1 h-8 bg-blue-600 rounded-full block"></span>
            Mundial de Constructores
            </h2>
        </div>
        
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-slate-950/50 text-xs uppercase tracking-wider text-slate-500 font-medium">
                        <th className="py-4 px-6 w-16 text-center">Pos</th>
                        <th className="py-4 px-6">Equipo</th>
                        <th className="py-4 px-6 text-right">Puntos</th>
                    </tr>
                </thead>
                <tbody>
                    {sortedConstructors.map((constructor, index) => (
                        <motion.tr 
                            key={constructor.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="border-b border-white/5 hover:bg-white/5 transition-colors group"
                        >
                            <td className="py-4 px-6 text-center font-mono font-bold text-slate-400 group-hover:text-white">
                                {index + 1}
                            </td>
                            <td className="py-4 px-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-lg bg-white/5 p-1 border border-white/10 flex items-center justify-center overflow-hidden">
                                        <img src={constructor.logoUrl} alt={constructor.name} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-white text-lg italic">{constructor.name}</div>
                                        <div className="w-full h-1 mt-1 rounded-full opacity-50" style={{ backgroundColor: constructor.color }}></div>
                                    </div>
                                </div>
                            </td>
                            <td className="py-4 px-6 text-right">
                                <div className="inline-block bg-slate-800 px-3 py-1 rounded-full border border-white/5 font-mono font-bold text-white min-w-[60px] text-center">
                                    {constructor.points}
                                </div>
                            </td>
                        </motion.tr>
                    ))}
                </tbody>
            </table>
        </div>
      </motion.div>
    </div>
  );
}
