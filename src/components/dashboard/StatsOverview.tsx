import React, { useState, useEffect } from 'react';
import { Flag, Trophy, Timer, CheckCircle } from 'lucide-react';
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
  const pointsRemaining = remainingRaces * 25; // Max points per race (25, no FL point in 2025)
  const isSeasonFinished = remainingRaces === 0;

  const nextRace = data.races.find(r => r.status === 'pending');
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    if (!nextRace) return;

    const updateTimer = () => {
      const raceDate = new Date(`${nextRace.date}T15:00:00Z`); // Assuming 15:00 UTC
      const now = new Date();
      const diff = raceDate.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft('¡HOY!');
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
  }, [nextRace]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Progress Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-slate-900/50 backdrop-blur-md border p-6 rounded-2xl relative overflow-hidden group ${
            isSeasonFinished ? 'border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.1)]' : 'border-white/10'
        }`}
      >
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <Flag size={64} className={isSeasonFinished ? "text-yellow-500" : "text-white"} />
        </div>
        <h3 className="text-slate-400 text-sm uppercase tracking-wider font-medium">
            {isSeasonFinished ? 'Estado del Campeonato' : 'Progreso de Temporada'}
        </h3>
        <div className="mt-2 flex items-baseline gap-2">
          <span className={`text-4xl font-black italic ${isSeasonFinished ? 'text-yellow-500' : 'text-white'}`}>
            {isSeasonFinished ? 'FINALIZADO' : completedRaces}
          </span>
          {!isSeasonFinished && <span className="text-slate-500 font-mono">/ {totalRaces} Carreras</span>}
        </div>
        <div className="w-full bg-slate-800 h-1.5 mt-4 rounded-full overflow-hidden relative">
          <div
            className={`h-full transition-all duration-1000 ${isSeasonFinished ? 'bg-yellow-500' : 'bg-gradient-to-r from-blue-500 to-purple-500'}`}
            style={{ width: `${(completedRaces / totalRaces) * 100}%` }}
          />
          {!isSeasonFinished && (
              <div className="absolute inset-0 bg-white/20 w-1/2 -translate-x-full animate-[pulse_2s_infinite]" />
          )}
        </div>
      </motion.div>

      {/* Points Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-6 rounded-2xl relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <Trophy size={64} className={isSeasonFinished ? "text-slate-700" : "text-yellow-500"} />
        </div>
        <h3 className="text-slate-400 text-sm uppercase tracking-wider font-medium">
            {isSeasonFinished ? 'Puntos Restantes' : 'Puntos en Juego'}
        </h3>
        <div className="mt-2 flex items-baseline gap-2">
          <span className={`text-4xl font-black italic ${isSeasonFinished ? 'text-slate-500' : 'text-white'}`}>
            {pointsRemaining}
          </span>
          <span className="text-slate-500 font-mono">Puntos Max</span>
        </div>
        <p className="text-xs text-slate-500 mt-4">
          {isSeasonFinished ? 'Campeonato Concluido' : 'Basado en 25pts por carrera restante'}
        </p>
      </motion.div>

      {/* Next GP Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-6 rounded-2xl relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          {isSeasonFinished ? <CheckCircle size={64} className="text-green-500" /> : <Timer size={64} className="text-red-500" />}
        </div>
        <h3 className="text-slate-400 text-sm uppercase tracking-wider font-medium">
            {isSeasonFinished ? 'Temporada 2025' : 'Próximo GP'}
        </h3>
        <div className="mt-2">
          <span className="text-2xl font-black text-white italic block truncate">
            {isSeasonFinished ? 'COMPLETADA' : nextRace?.name}
          </span>
          <span className="text-slate-500 text-sm font-mono block mt-1">
            {isSeasonFinished ? 'Nos vemos en 2026' : (timeLeft || 'Cargando...')}
          </span>
        </div>
      </motion.div>
    </div>
  );
}
