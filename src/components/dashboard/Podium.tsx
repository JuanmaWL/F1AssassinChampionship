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

      <motion.h2 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center text-4xl font-black italic text-white mb-16 uppercase tracking-widest relative z-10"
      >
        {isSeasonFinished ? (
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-300 animate-pulse drop-shadow-lg">
                🏆 PODIO FINAL 🏆
            </span>
        ) : (
            <span className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                LIDERAZGO DEL CAMPEONATO
            </span>
        )}
      </motion.h2>

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
              <div className="absolute -top-4 -right-2 bg-slate-300 text-slate-900 text-xs font-black px-2 py-1 rounded shadow-lg rotate-12">
                  P2
              </div>
           </div>
           
           <div className="w-full bg-gradient-to-t from-slate-800/80 to-slate-900/80 border-t-4 border-slate-300 rounded-t-2xl p-6 text-center backdrop-blur-sm shadow-2xl transform hover:-translate-y-2 transition-transform duration-300 min-h-[180px] flex flex-col justify-end">
              <h3 className="text-xl font-black text-white italic uppercase tracking-wider mb-1 truncate">{topThree[1].name}</h3>
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
        <motion.div variants={itemVariants} className="order-1 md:order-2 flex flex-col items-center z-20 -mt-12 md:mt-0 group relative w-full">
           <div className="relative mb-6">
              <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-20 h-20 z-20">
                  <Crown className="w-full h-full text-yellow-400 drop-shadow-[0_0_20px_rgba(250,204,21,0.8)] animate-[bounce_3s_infinite]" />
              </div>
              
              <div className="w-40 h-40 rounded-full border-4 border-yellow-400 flex items-center justify-center bg-slate-900 shadow-[0_0_50px_rgba(250,204,21,0.5)] z-10 relative overflow-hidden group-hover:scale-110 transition-transform duration-500">
                 <span className="text-7xl z-10 filter drop-shadow-lg">🥇</span>
                 <div className="absolute inset-0 bg-gradient-to-tr from-yellow-500/30 to-transparent z-0 animate-pulse"></div>
                 <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30"></div>
              </div>
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-yellow-500 text-black text-sm font-black px-4 py-1 rounded-full shadow-[0_0_20px_rgba(250,204,21,0.6)] whitespace-nowrap z-20 uppercase tracking-widest">
                  LÍDER
              </div>
           </div>

           <div className="w-full bg-gradient-to-t from-yellow-900/20 to-slate-900/90 border-t-4 border-yellow-400 rounded-t-2xl p-8 text-center backdrop-blur-md shadow-[0_0_40px_rgba(250,204,21,0.15)] transform hover:-translate-y-3 transition-transform duration-300 min-h-[220px] flex flex-col justify-end relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/5 to-transparent pointer-events-none"></div>
              <h3 className="text-3xl font-black text-white italic uppercase tracking-wider mb-1 truncate drop-shadow-md">{topThree[0].name}</h3>
              <p className="text-sm text-yellow-500/80 font-mono mb-6 uppercase tracking-widest font-bold">{topThree[0].team}</p>
              <div className="mt-auto bg-yellow-500/10 rounded-xl py-3 border border-yellow-500/20">
                  <span className="text-4xl font-black text-yellow-400 font-mono">{topThree[0].points}</span>
                  <span className="text-xs text-yellow-600 block uppercase font-bold mt-1">Puntos Totales</span>
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
              <div className="absolute -top-4 -left-2 bg-orange-700 text-white text-xs font-black px-2 py-1 rounded shadow-lg -rotate-12">
                  P3
              </div>
           </div>
           
           <div className="w-full bg-gradient-to-t from-slate-800/80 to-slate-900/80 border-t-4 border-orange-700 rounded-t-2xl p-6 text-center backdrop-blur-sm shadow-2xl transform hover:-translate-y-2 transition-transform duration-300 min-h-[180px] flex flex-col justify-end">
              <h3 className="text-xl font-black text-white italic uppercase tracking-wider mb-1 truncate">{topThree[2].name}</h3>
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
