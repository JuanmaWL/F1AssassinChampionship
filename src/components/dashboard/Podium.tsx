import React from 'react';
import { Crown, Trophy } from 'lucide-react';
import { motion } from 'motion/react';
import { Driver } from '../../types';
import { cn } from '../../lib/utils';

interface PodiumProps {
  drivers: Driver[];
  isSeasonFinished?: boolean;
}

export function Podium({ drivers, isSeasonFinished = false }: PodiumProps) {
  const topThree = drivers.slice(0, 3);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <div className="py-12 relative">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-64 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none"></div>
      
      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden h-full w-full z-0">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 50, x: 0 }}
            animate={{ 
              opacity: [0, 0.4, 0], 
              y: -150, 
              x: (Math.random() - 0.5) * 50 
            }}
            transition={{ 
              duration: 3 + Math.random() * 4, 
              repeat: Infinity, 
              delay: Math.random() * 5,
              ease: "easeOut" 
            }}
            className="absolute bottom-0 w-1 h-1 bg-white/20 rounded-full"
            style={{ left: `${10 + Math.random() * 80}%` }}
          />
        ))}
      </div>

      <div className="relative z-10 mb-24">
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
             <div className="w-full h-px bg-gradient-to-r from-transparent via-white to-transparent"></div>
        </div>
        <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center relative"
        >
            <h2 className="text-4xl md:text-5xl font-black italic text-white uppercase tracking-widest relative z-10 py-4">
                {isSeasonFinished ? (
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-300 animate-pulse drop-shadow-lg">
                        🏆 PODIO FINAL 🏆
                    </span>
                ) : (
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                        LUCHA POR EL CAMPEONATO
                    </span>
                )}
            </h2>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-12 bg-blue-500/20 blur-xl rounded-full -z-10"></div>
        </motion.div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end justify-center max-w-5xl mx-auto px-4"
      >
      {/* 2nd Place */}
      {topThree[1] && (
        <motion.div variants={itemVariants} className="order-2 md:order-1 flex flex-col items-center group relative z-10">
           <div className="relative mb-4">
              <div className="w-28 h-28 rounded-full border-4 border-slate-300 flex items-center justify-center bg-slate-900 shadow-[0_0_30px_rgba(203,213,225,0.3)] z-10 relative overflow-hidden group-hover:scale-105 transition-transform duration-500">
                 <span className="text-5xl z-10 filter drop-shadow-lg">🥈</span>
                 <div className="absolute inset-0 bg-gradient-to-tr from-slate-400/20 to-transparent z-0"></div>
              </div>
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-slate-200 text-slate-900 text-xs font-black px-3 py-1 rounded-full shadow-lg z-20 border-2 border-slate-900">
                  P2
              </div>
           </div>
           
           <div className="w-full bg-gradient-to-t from-slate-800/80 to-slate-900/80 border-t-4 border-slate-300 rounded-t-2xl p-6 text-center backdrop-blur-sm shadow-2xl transform hover:-translate-y-2 transition-transform duration-300 min-h-[180px] flex flex-col justify-end">
              <h3 className="text-xl font-bold text-white uppercase tracking-tight mb-1 truncate font-sans">{topThree[1].name}</h3>
              <p className="text-xs text-slate-400 font-mono mb-4 uppercase tracking-widest">{topThree[1].team}</p>
              <div className="mt-auto bg-slate-950/50 rounded-lg py-2 border border-white/5">
                  <span className="text-2xl font-black text-slate-300 font-mono">{topThree[1].points}</span>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Puntos</span>
              </div>
           </div>
        </motion.div>
      )}

      {/* 1st Place */}
      {topThree[0] && (
        <motion.div variants={itemVariants} className="order-1 md:order-2 flex flex-col items-center z-20 -mt-12 md:-mt-16 group relative w-full">
           {/* Floating Status Icon */}
           <div className="absolute -top-24 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
              <motion.div
                animate={{ 
                    y: [0, -8, 0],
                    rotate: [0, -2, 2, 0],
                    filter: ["drop-shadow(0 0 10px rgba(234,179,8,0.5))", "drop-shadow(0 0 25px rgba(234,179,8,0.8))", "drop-shadow(0 0 10px rgba(234,179,8,0.5))"]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                {isSeasonFinished ? (
                    <Trophy className="w-24 h-24 text-yellow-400" strokeWidth={1} />
                ) : (
                    <Crown className="w-24 h-24 text-yellow-400" strokeWidth={1} />
                )}
              </motion.div>
           </div>

           <div className="relative w-full max-w-[320px]">
              {/* Avatar Container */}
              <div className="relative z-20 mx-auto w-48 h-48 mb-[-3rem]">
                  <div className={`w-full h-full rounded-full border-[6px] flex items-center justify-center bg-slate-950 shadow-[0_0_50px_rgba(234,179,8,0.3)] relative overflow-hidden group-hover:scale-105 transition-transform duration-500 ${isSeasonFinished ? 'border-yellow-500' : 'border-yellow-500'}`}>
                     <span className="text-8xl z-10 filter drop-shadow-2xl">🥇</span>
                     
                     {/* Animated Background */}
                     <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0_340deg,rgba(234,179,8,0.5)_360deg)] animate-[spin_4s_linear_infinite] opacity-30"></div>
                     <div className="absolute inset-1 bg-slate-900 rounded-full"></div>
                  </div>
                  
                  {/* Label Badge */}
                  <div className="absolute bottom-14 left-1/2 -translate-x-1/2 bg-yellow-500 text-black text-sm font-black px-6 py-1.5 rounded-full shadow-[0_0_20px_rgba(234,179,8,0.6)] whitespace-nowrap z-30 uppercase tracking-widest border-4 border-slate-900 flex items-center gap-2">
                      {isSeasonFinished ? <Trophy size={14} strokeWidth={3} /> : <Crown size={14} strokeWidth={3} />}
                      <span>{isSeasonFinished ? 'CAMPEÓN' : 'LÍDER ACTUAL'}</span>
                  </div>
              </div>

              {/* Card Content */}
              <div className={`w-full rounded-[2rem] p-8 pt-16 text-center backdrop-blur-xl shadow-2xl transform transition-all duration-500 group-hover:-translate-y-2 border-t-4 relative overflow-hidden ${
                  isSeasonFinished 
                    ? 'bg-gradient-to-b from-yellow-900/60 to-slate-950 border-yellow-500' 
                    : 'bg-gradient-to-b from-yellow-900/40 to-slate-950 border-yellow-500'
              }`}>
                  {/* Background Texture */}
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
                  
                  <h3 className="text-4xl font-black text-white uppercase tracking-tighter mb-1 truncate drop-shadow-lg font-sans mt-2 relative z-10">
                    {topThree[0].name}
                  </h3>
                  <p className="text-sm font-mono mb-6 uppercase tracking-[0.3em] font-bold text-yellow-500/80 relative z-10">
                    {topThree[0].team}
                  </p>
                  
                  <div className="relative z-10 bg-black/40 rounded-xl py-4 border border-yellow-500/20 shadow-inner">
                      <span className="text-5xl font-black text-yellow-400 font-mono tracking-tighter drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]">
                        {topThree[0].points}
                      </span>
                      <span className="text-[10px] text-yellow-600/80 block uppercase font-bold mt-1 tracking-widest">
                        Puntos Totales
                      </span>
                  </div>
              </div>
           </div>
        </motion.div>
      )}

      {/* 3rd Place */}
      {topThree[2] && (
        <motion.div variants={itemVariants} className="order-3 md:order-3 flex flex-col items-center group relative z-10">
           <div className="relative mb-4">
              <div className="w-28 h-28 rounded-full border-4 border-orange-700 flex items-center justify-center bg-slate-900 shadow-[0_0_30px_rgba(194,65,12,0.3)] z-10 relative overflow-hidden group-hover:scale-105 transition-transform duration-500">
                 <span className="text-5xl z-10 filter drop-shadow-lg">🥉</span>
                 <div className="absolute inset-0 bg-gradient-to-tr from-orange-700/20 to-transparent z-0"></div>
              </div>
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-orange-800 text-white text-xs font-black px-3 py-1 rounded-full shadow-lg z-20 border-2 border-slate-900">
                  P3
              </div>
           </div>
           
           <div className="w-full bg-gradient-to-t from-slate-800/80 to-slate-900/80 border-t-4 border-orange-700 rounded-t-2xl p-6 text-center backdrop-blur-sm shadow-2xl transform hover:-translate-y-2 transition-transform duration-300 min-h-[180px] flex flex-col justify-end">
              <h3 className="text-xl font-bold text-white uppercase tracking-tight mb-1 truncate font-sans">{topThree[2].name}</h3>
              <p className="text-xs text-slate-400 font-mono mb-4 uppercase tracking-widest">{topThree[2].team}</p>
              <div className="mt-auto bg-slate-950/50 rounded-lg py-2 border border-white/5">
                  <span className="text-2xl font-black text-orange-400 font-mono">{topThree[2].points}</span>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Puntos</span>
              </div>
           </div>
        </motion.div>
      )}
      </motion.div>
    </div>
  );
}
