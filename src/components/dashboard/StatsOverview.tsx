import React from 'react';
import { Flag, Trophy, Timer } from 'lucide-react';
import { motion } from 'motion/react';
import { ChampionshipData } from '../../types';
import { formatDate } from '../../lib/utils';

interface StatsOverviewProps {
  data: ChampionshipData;
}

export function StatsOverview({ data }: StatsOverviewProps) {
  const remainingRaces = data.races.filter((r) => r.status === 'pending').length;
  const totalRaces = data.races.length;
  const completedRaces = totalRaces - remainingRaces;
  const pointsRemaining = remainingRaces * 26; // Max points per race (25 + 1 fastest lap)

  return (
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
  );
}
