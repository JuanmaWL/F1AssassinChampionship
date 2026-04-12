import { useMemo, useRef } from 'react';
import { StatsOverview } from './dashboard/StatsOverview';
import { Podium } from './dashboard/Podium';
import { DriversTable } from './dashboard/DriversTable';
import { ConstructorsTable } from './dashboard/ConstructorsTable';
import { TeammateBattles } from './dashboard/TeammateBattles';
import { EvolutionChart } from './dashboard/EvolutionChart';
import { motion, useInView } from 'motion/react';
import { cn } from '../lib/utils';
import { useChampionship } from '../context/ChampionshipContext';
import { FOOTER_ASSETS } from '../constants/assets';

export function Dashboard() {
  const { data, activeSeason, isHistorical } = useChampionship();

  const sortedDrivers = useMemo(() => [...data.drivers].sort((a, b) => b.points - a.points), [data.drivers]);
  const sortedConstructors = useMemo(() => [...data.constructors].sort((a, b) => b.points - a.points), [data.constructors]);

  const hasCompletedRaces = useMemo(() => data.races.some(r => r.status === 'completed'), [data.races]);
  const isSeasonFinished = useMemo(() => data.races.length > 0 && data.races.every(r => r.status === 'completed'), [data.races]);

  const speedLines = useMemo(() => [...Array(5)].map((_, i) => ({
    top: `${Math.random() * 100}%`,
    duration: Math.random() * 2 + 1,
    delay: Math.random() * 2
  })), []);

  const particles = useMemo(() => [...Array(15)].map((_, i) => ({
    x: Math.random() * 100 + "%",
    y: Math.random() * 100 + "%",
    yOffset: Math.random() * -20 - 10,
    duration: Math.random() * 3 + 2,
    delay: Math.random() * 2
  })), []);

  const bannerRef = useRef<HTMLDivElement>(null);
  const isBannerInView = useInView(bannerRef, { once: false, margin: "100px" });

  return (
    <div className="space-y-12 pb-20">
      {/* Animated Banner / Logo Area */}
      <div 
        ref={bannerRef}
        className={cn(
          "w-full h-64 md:h-96 rounded-2xl overflow-hidden relative border shadow-2xl group bg-slate-950 transition-colors duration-500",
          isHistorical ? "border-amber-500/30" : "border-white/10"
      )}>
        {/* Dynamic Background Gradient */}
        <div className={cn(
            "absolute inset-0 bg-gradient-to-r animate-gradient-x",
            isHistorical ? "from-slate-900 via-amber-900/20 to-slate-900" : "from-slate-900 via-slate-800 to-slate-900"
        )}></div>
        
        {/* Season Wallpaper (Only for 2026) */}
        {!isHistorical && (
            <div className="absolute inset-0 z-0 overflow-hidden">
                <motion.img 
                    src={FOOTER_ASSETS.WALLPAPER} 
                    alt="Season Background" 
                    className="w-full h-full object-cover object-[center_15%] opacity-40 mix-blend-luminosity"
                    referrerPolicy="no-referrer"
                    animate={{
                        scale: [1.05, 1.12, 1.05],
                        x: ['-1%', '1%', '-1%'],
                        y: ['0%', '1.5%', '0%']
                    }}
                    transition={{
                        duration: 30,
                        ease: "easeInOut",
                        repeat: Infinity
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/50"></div>
            </div>
        )}
        
        {/* Carbon Fiber Texture */}
        <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] mix-blend-overlay"></div>
        
        {/* Historical Sepia/Dust Effect */}
        {isHistorical && (
            <div className="absolute inset-0 pointer-events-none backdrop-sepia-[0.3] bg-[url('https://www.transparenttextures.com/patterns/dust.png')] opacity-20"></div>
        )}

        {/* Moving Light/Speed Lines */}
        <div className="absolute inset-0 overflow-hidden">
            {speedLines.map((line, i) => (
                <motion.div
                    key={i}
                    className={cn(
                        "absolute h-[1px] w-full",
                        isHistorical ? "bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" : "bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    )}
                    style={{ top: line.top }}
                    animate={isBannerInView ? {
                        x: ['-100%', '100%'],
                        opacity: [0, 1, 0]
                    } : { opacity: 0 }}
                    transition={{
                        duration: line.duration,
                        repeat: Infinity,
                        delay: line.delay,
                        ease: "linear"
                    }}
                />
            ))}
             {/* Red Laser/Tail Light Effect (Only for current season) */}
             {!isHistorical && (
                 <motion.div
                    className="absolute bottom-0 left-0 h-1 bg-red-600 shadow-[0_0_20px_#dc2626] w-20 rounded-full"
                    animate={isBannerInView ? {
                        x: ['-100%', '1200%'], // Moves across widely
                        opacity: [0, 1, 0]
                    } : { opacity: 0 }}
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
            {particles.map((particle, i) => (
                <motion.div
                    key={`p-${i}`}
                    className={cn(
                        "absolute w-1 h-1 rounded-full",
                        isHistorical ? "bg-amber-500/30" : "bg-white/30"
                    )}
                    initial={{ 
                        x: particle.x, 
                        y: particle.y,
                        scale: 0 
                    }}
                    animate={isBannerInView ? { 
                        y: [null, particle.yOffset], // Float up slightly
                        opacity: [0, 0.8, 0],
                        scale: [0, 1, 0]
                    } : { opacity: 0 }}
                    transition={{
                        duration: particle.duration,
                        repeat: Infinity,
                        delay: particle.delay
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
                        animate={isBannerInView ? { opacity: [0.3, 0.6, 0.3], scale: [1, 1.02, 1] } : { opacity: 0 }}
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
      <DriversTable drivers={sortedDrivers} constructors={data.constructors} races={data.races} />
      <ConstructorsTable constructors={sortedConstructors} hasCompletedRaces={hasCompletedRaces} races={data.races} drivers={data.drivers} />
      {hasCompletedRaces && <TeammateBattles drivers={data.drivers} constructors={data.constructors} races={data.races} />}
      {hasCompletedRaces && <EvolutionChart data={data} />}
    </div>
  );
}
