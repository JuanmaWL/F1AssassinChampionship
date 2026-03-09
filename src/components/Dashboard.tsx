import React from 'react';
import { ChampionshipData, SeasonId } from '../types';
import { StatsOverview } from './dashboard/StatsOverview';
import { Podium } from './dashboard/Podium';
import { DriversTable } from './dashboard/DriversTable';
import { ConstructorsTable } from './dashboard/ConstructorsTable';
import { EvolutionChart } from './dashboard/EvolutionChart';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface DashboardProps {
  data: ChampionshipData;
  activeSeason: SeasonId;
}

export function Dashboard({ data, activeSeason }: DashboardProps) {
  const sortedDrivers = [...data.drivers].sort((a, b) => b.points - a.points);
  const sortedConstructors = [...data.constructors].sort((a, b) => b.points - a.points);

  const hasCompletedRaces = data.races.some(r => r.status === 'completed');
  const isSeasonFinished = data.races.length > 0 && data.races.every(r => r.status === 'completed');
  const isHistorical = activeSeason === '2024';

  return (
    <div className="space-y-12 pb-20">
      {/* Animated Banner / Logo Area */}
      <div className={cn(
          "w-full h-48 md:h-64 rounded-2xl overflow-hidden relative border shadow-2xl group bg-slate-950 transition-colors duration-500",
          isHistorical ? "border-amber-500/30" : "border-white/10"
      )}>
        {/* Dynamic Background Gradient */}
        <div className={cn(
            "absolute inset-0 bg-gradient-to-r animate-gradient-x",
            isHistorical ? "from-slate-900 via-amber-900/20 to-slate-900" : "from-slate-900 via-slate-800 to-slate-900"
        )}></div>
        
        {/* Carbon Fiber Texture */}
        <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] mix-blend-overlay"></div>
        
        {/* Historical Sepia/Dust Effect */}
        {isHistorical && (
            <div className="absolute inset-0 pointer-events-none backdrop-sepia-[0.3] bg-[url('https://www.transparenttextures.com/patterns/dust.png')] opacity-20"></div>
        )}

        {/* Moving Light/Speed Lines */}
        <div className="absolute inset-0 overflow-hidden">
            {[...Array(5)].map((_, i) => (
                <motion.div
                    key={i}
                    className={cn(
                        "absolute h-[1px] w-full",
                        isHistorical ? "bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" : "bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    )}
                    style={{ top: `${Math.random() * 100}%` }}
                    animate={{
                        x: ['-100%', '100%'],
                        opacity: [0, 1, 0]
                    }}
                    transition={{
                        duration: Math.random() * 2 + 1,
                        repeat: Infinity,
                        delay: Math.random() * 2,
                        ease: "linear"
                    }}
                />
            ))}
             {/* Red Laser/Tail Light Effect (Only for current season) */}
             {!isHistorical && (
                 <motion.div
                    className="absolute bottom-0 left-0 h-1 bg-red-600 shadow-[0_0_20px_#dc2626] w-20 rounded-full"
                    animate={{
                        x: ['-100%', '1200%'], // Moves across widely
                        opacity: [0, 1, 0]
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                        repeatDelay: 1
                    }}
                />
             )}
        </div>

        {/* Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(15)].map((_, i) => (
                <motion.div
                    key={`p-${i}`}
                    className={cn(
                        "absolute w-1 h-1 rounded-full",
                        isHistorical ? "bg-amber-500/30" : "bg-white/30"
                    )}
                    initial={{ 
                        x: Math.random() * 100 + "%", 
                        y: Math.random() * 100 + "%",
                        scale: 0 
                    }}
                    animate={{ 
                        y: [null, Math.random() * -20 - 10], // Float up slightly
                        opacity: [0, 0.8, 0],
                        scale: [0, 1, 0]
                    }}
                    transition={{
                        duration: Math.random() * 3 + 2,
                        repeat: Infinity,
                        delay: Math.random() * 2
                    }}
                />
            ))}
        </div>

        {/* Main Title Container */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
            <motion.h1 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="text-5xl md:text-7xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 uppercase tracking-tighter drop-shadow-2xl text-center px-4 relative"
            >
                Assassin's <span className={cn(
                    "inline-block relative",
                    isHistorical ? "text-amber-500" : "text-red-600"
                )}>
                    Championship
                    {/* Glitch/Pulse Effect on 'Championship' */}
                    <motion.span 
                        className={cn(
                            "absolute inset-0 opacity-50 blur-sm",
                            isHistorical ? "text-amber-500" : "text-red-500"
                        )}
                        animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.02, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        Championship
                    </motion.span>
                </span>
            </motion.h1>
            
            {/* Subtitle / Season Info */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="mt-2 flex items-center gap-4"
            >
                <div className={cn("h-[1px] w-12 bg-gradient-to-r from-transparent", isHistorical ? "to-amber-500" : "to-red-500")}></div>
                <span className={cn(
                    "text-sm md:text-base font-mono tracking-[0.3em] uppercase",
                    isHistorical ? "text-amber-500/80" : "text-slate-400"
                )}>
                    {isHistorical ? "Archivo Histórico 2024/25" : `Season ${activeSeason}`}
                </span>
                <div className={cn("h-[1px] w-12 bg-gradient-to-l from-transparent", isHistorical ? "to-amber-500" : "to-red-500")}></div>
            </motion.div>
        </div>
        
        {/* Historical Watermark */}
        {isHistorical && (
            <div className="absolute top-4 right-4 border border-amber-500/30 px-3 py-1 rounded text-amber-500/50 font-mono text-xs uppercase tracking-widest rotate-[-5deg]">
                Finalizado
            </div>
        )}
      </div>

      <StatsOverview data={data} activeSeason={activeSeason} />
      {hasCompletedRaces && <Podium drivers={sortedDrivers} constructors={data.constructors} isSeasonFinished={isSeasonFinished} />}
      <DriversTable drivers={sortedDrivers} />
      <ConstructorsTable constructors={sortedConstructors} hasCompletedRaces={hasCompletedRaces} />
      {hasCompletedRaces && <EvolutionChart data={data} />}
    </div>
  );
}
