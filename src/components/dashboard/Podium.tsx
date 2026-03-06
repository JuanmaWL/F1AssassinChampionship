import React from 'react';
import { Crown } from 'lucide-react';
import { motion } from 'motion/react';
import { Driver } from '../../types';

interface PodiumProps {
  drivers: Driver[];
}

export function Podium({ drivers }: PodiumProps) {
  const topThree = drivers.slice(0, 3);

  return (
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
           <motion.div 
             initial={{ height: 0 }}
             animate={{ height: 96 }} // 24 * 4 = 96px (h-24)
             transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.4 }}
             className="w-full bg-gradient-to-t from-slate-800/50 to-transparent mt-4 rounded-t-xl border-x border-t border-white/5 mx-auto max-w-[120px]"
           />
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
           <motion.div 
             initial={{ height: 0 }}
             animate={{ height: 128 }} // 32 * 4 = 128px (h-32)
             transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.5 }}
             className="w-full bg-gradient-to-t from-yellow-500/10 to-transparent mt-4 rounded-t-xl border-x border-t border-yellow-500/20 mx-auto max-w-[140px]"
           />
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
           <motion.div 
             initial={{ height: 0 }}
             animate={{ height: 64 }} // 16 * 4 = 64px (h-16)
             transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.6 }}
             className="w-full bg-gradient-to-t from-slate-800/50 to-transparent mt-4 rounded-t-xl border-x border-t border-white/5 mx-auto max-w-[120px]"
           />
        </div>
      )}
    </motion.div>
  );
}
