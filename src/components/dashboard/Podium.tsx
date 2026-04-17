import React from 'react';
import { useState } from 'react';
import { Crown, Trophy, Star } from 'lucide-react';
import { motion } from 'motion/react';
import { Driver, Constructor } from '../../types';
import { cn } from '../../lib/utils';
import { F1CarAnimation } from './F1CarAnimation';
import { Confetti } from './Confetti';
import { TEXTURE_ASSETS } from '../../constants/assets';

interface PodiumProps {
  drivers: Driver[];
  constructors: Constructor[];
  isSeasonFinished?: boolean;
}

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
  visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100 } }
};

const FIRE_PARTICLES = [...Array(12)].map(() => ({
  y: -120 - Math.random() * 60,
  x: (Math.random() - 0.5) * 40,
  duration: 1.5 + Math.random() * 1.5,
  delay: Math.random() * 2,
  left: `${20 + Math.random() * 60}%`,
}));

const FireParticles = ({ colorClass }: { colorClass: string }) => (
  <div className="absolute inset-0 overflow-hidden rounded-t-2xl pointer-events-none z-0">
    {FIRE_PARTICLES.map((p, i) => (
      <motion.div
        key={i}
        className={cn("absolute bottom-0 w-1.5 h-1.5 rounded-full blur-[1px]", colorClass)}
        initial={{ opacity: 0, y: 10, x: 0, scale: 0 }}
        animate={{ 
          opacity: [0, 0.6, 0], 
          y: p.y,
          x: p.x,
          scale: [0, 1.5, 0]
        }}
        transition={{ 
          duration: p.duration, 
          repeat: Infinity, 
          delay: p.delay,
          ease: "easeOut" 
        }}
        style={{ left: p.left }}
      />
    ))}
  </div>
);

export const Podium = React.memo(function Podium({ drivers, constructors, isSeasonFinished = false }: PodiumProps) {
  const topThree = drivers.slice(0, 3);
  const [showConfetti, setShowConfetti] = useState(false);

  const handleWinnerClick = () => {
    if (isSeasonFinished && !showConfetti) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000); // Stop confetti generation after 5 seconds
    }
  };

  const getTeamLogo = (teamName: string) => {
    return constructors.find(c => c.name === teamName)?.logoUrl;
  };

  return (
    <div className="py-12 relative">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-64 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none"></div>
      
      {/* Floating Background Particles */}
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

      <div className="relative z-10 mb-16 md:mb-24">
        {showConfetti && <Confetti />}
        <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center relative flex flex-col items-center w-full px-4"
        >
            <div className="relative w-full max-w-5xl mx-auto flex items-center justify-center mb-4 gap-4 md:gap-8">
                <div className={cn("flex-1 h-[2px] bg-gradient-to-r from-transparent", isSeasonFinished ? "to-yellow-500/50" : "to-white/30")}></div>
                <h2 className="text-4xl md:text-6xl font-black italic text-white uppercase tracking-widest relative z-10 text-center">
                    {isSeasonFinished ? (
                        <span className="glitch-text text-yellow-500 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]" data-text="PODIO FINAL">
                            PODIO FINAL
                        </span>
                    ) : (
                        <span className="glitch-text text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]" data-text="LUCHA POR EL CAMPEONATO">
                            LUCHA POR EL CAMPEONATO
                        </span>
                    )}
                </h2>
                <div className={cn("flex-1 h-[2px] bg-gradient-to-l from-transparent", isSeasonFinished ? "to-yellow-500/50" : "to-white/30")}></div>
            </div>
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
        <motion.div variants={itemVariants} className="order-2 md:order-1 flex flex-col items-center group relative z-10 hover:-translate-y-2 transition-transform duration-300">
           <div className="relative mb-4">
              <div className="w-28 h-28 rounded-full border-4 border-slate-300 flex items-center justify-center bg-slate-900 shadow-[0_0_30px_rgba(203,213,225,0.3)] z-10 relative overflow-hidden group-hover:scale-110 group-hover:shadow-[0_0_50px_rgba(203,213,225,0.5)] transition-all duration-500">
                 <span className="text-5xl z-10 filter drop-shadow-lg">🥈</span>
                 <div className="absolute inset-0 bg-gradient-to-tr from-slate-400/20 to-transparent z-0"></div>
              </div>
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-slate-200 text-slate-900 text-xs font-black px-3 py-1 rounded-full shadow-lg z-20 border-2 border-slate-900">
                  P2
              </div>
           </div>
           
           <div className="w-full bg-gradient-to-t from-slate-800/80 to-slate-900/80 border-t-4 border-slate-300 rounded-t-2xl p-6 text-center backdrop-blur-sm shadow-2xl min-h-[180px] flex flex-col justify-end relative overflow-hidden group-hover:border-slate-200 transition-colors duration-300">
              <FireParticles colorClass="bg-slate-400" />
              <div className="relative z-10">
                {getTeamLogo(topThree[1].team) && (
                  <div className="flex justify-center mb-3 relative">
                    <div className="absolute inset-0 bg-slate-400/10 blur-lg rounded-full scale-150 group-hover:bg-slate-400/30 transition-colors duration-500"></div>
                    <img src={getTeamLogo(topThree[1].team)} alt="Team Logo" className="w-12 h-12 object-contain filter drop-shadow-[0_0_10px_rgba(255,255,255,0.4)] group-hover:drop-shadow-[0_0_20px_rgba(255,255,255,0.8)] relative z-10 transition-all duration-500" />
                  </div>
                )}
                <h3 className="text-xl font-bold text-white uppercase tracking-tight mb-1 truncate font-sans group-hover:text-slate-200 transition-colors">{topThree[1].name}</h3>
                <p className="text-xs text-slate-400 font-mono mb-4 uppercase tracking-widest">{topThree[1].team}</p>
                <div className="mt-auto bg-slate-950/50 rounded-lg py-2 border border-white/5 group-hover:border-slate-500/30 transition-colors">
                    <span className="text-2xl font-black text-slate-300 font-mono">{topThree[1].points}</span>
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">Puntos</span>
                </div>
                {isSeasonFinished && (
                  <div className="mt-4 flex justify-center w-full">
                    <F1CarAnimation 
                      primaryColor={topThree[1].teamColor || '#E85725'} 
                      helmetColor="#ffffff" 
                      className="w-full max-w-[120px] opacity-80"
                    />
                  </div>
                )}
              </div>
           </div>
        </motion.div>
      )}

      {/* 1st Place */}
      {topThree[0] && (
        <motion.div 
          variants={itemVariants} 
          className={cn("order-1 md:order-2 flex flex-col items-center z-20 -mt-8 md:-mt-12 group relative w-full hover:-translate-y-4 transition-transform duration-500", isSeasonFinished ? "cursor-pointer" : "")}
          onClick={handleWinnerClick}
        >
           <div className="relative w-full max-w-[280px]">
              {/* Avatar Container - Reduced Size */}
              <div className="relative z-20 mx-auto w-40 h-40 mb-[-2.5rem]">
                  {/* Decorative Champion Aura / Wreath */}
                  <div className="absolute -inset-4 rounded-full border-[3px] border-transparent border-t-yellow-400 border-b-yellow-400 animate-[spin_8s_linear_infinite] opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"></div>
                  <div className="absolute -inset-2 rounded-full border-[2px] border-transparent border-l-yellow-200 border-r-yellow-200 animate-[spin_6s_linear_infinite_reverse] opacity-50 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"></div>
                  
                  {/* Floating Stars */}
                  <div className="absolute -inset-6 pointer-events-none z-30">
                      <Star className="absolute top-2 left-4 w-5 h-5 text-yellow-400 fill-yellow-400 drop-shadow-[0_0_8px_rgba(234,179,8,0.8)] animate-pulse" />
                      <Star className="absolute top-2 right-4 w-5 h-5 text-yellow-400 fill-yellow-400 drop-shadow-[0_0_8px_rgba(234,179,8,0.8)] animate-pulse" style={{ animationDelay: '0.5s' }} />
                      <Star className="absolute bottom-10 -left-2 w-3 h-3 text-yellow-300 fill-yellow-300 drop-shadow-[0_0_5px_rgba(253,224,71,0.8)] animate-pulse" style={{ animationDelay: '1s' }} />
                      <Star className="absolute bottom-10 -right-2 w-3 h-3 text-yellow-300 fill-yellow-300 drop-shadow-[0_0_5px_rgba(253,224,71,0.8)] animate-pulse" style={{ animationDelay: '1.5s' }} />
                  </div>

                  <div className={`w-full h-full rounded-full border-[6px] flex items-center justify-center bg-slate-950 shadow-[0_0_50px_rgba(234,179,8,0.3)] relative overflow-hidden group-hover:scale-105 group-hover:shadow-[0_0_70px_rgba(234,179,8,0.5)] transition-all duration-500 ${isSeasonFinished ? 'border-yellow-500' : 'border-yellow-500'}`}>
                     <span className="text-7xl z-10 filter drop-shadow-2xl">🥇</span>
                     
                     {/* Animated Background */}
                     <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0_340deg,rgba(234,179,8,0.5)_360deg)] animate-[spin_4s_linear_infinite] opacity-30"></div>
                     <div className="absolute inset-1 bg-slate-900 rounded-full"></div>
                  </div>
                  
                  {/* Label Badge - Repositioned */}
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 bg-yellow-500 text-black text-xs font-black px-4 py-1 rounded-full shadow-[0_0_20px_rgba(234,179,8,0.6)] whitespace-nowrap z-30 uppercase tracking-widest border-4 border-slate-900 flex items-center gap-2">
                      {isSeasonFinished ? <Trophy size={12} strokeWidth={3} /> : <Crown size={12} strokeWidth={3} />}
                      <span>{isSeasonFinished ? 'CAMPEÓN' : 'LÍDER'}</span>
                  </div>
              </div>

              {/* Card Content */}
              <div className={`w-full rounded-[2rem] p-6 pt-14 text-center backdrop-blur-xl shadow-2xl border-t-4 relative overflow-hidden transition-all duration-500 group-hover:shadow-[0_0_50px_rgba(234,179,8,0.3)] ${
                  isSeasonFinished 
                    ? 'bg-gradient-to-b from-yellow-900/60 to-slate-950 border-yellow-500' 
                    : 'bg-gradient-to-b from-yellow-900/40 to-slate-950 border-yellow-500'
              }`}>
                  <FireParticles colorClass="bg-yellow-400" />
                  
                  {/* Background Texture */}
                  <div className="absolute inset-0 opacity-10 mix-blend-overlay" style={{ backgroundImage: `url('${TEXTURE_ASSETS.CUBES}')` }}></div>
                  
                  <div className="relative z-10">
                    {getTeamLogo(topThree[0].team) && (
                      <div className="flex justify-center mb-4 relative">
                        <div className="absolute inset-0 bg-yellow-500/20 blur-xl rounded-full scale-150 group-hover:bg-yellow-500/40 transition-colors duration-500"></div>
                        <img src={getTeamLogo(topThree[0].team)} alt="Team Logo" className="w-16 h-16 object-contain filter drop-shadow-[0_0_15px_rgba(255,255,255,0.6)] group-hover:drop-shadow-[0_0_25px_rgba(255,255,255,1)] relative z-10 transition-all duration-500" />
                      </div>
                    )}
                    <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-1 truncate drop-shadow-lg font-sans mt-2 group-hover:text-yellow-100 transition-colors">
                        {topThree[0].name}
                    </h3>
                    <p className="text-xs font-mono mb-6 uppercase tracking-[0.3em] font-bold text-yellow-500/80">
                        {topThree[0].team}
                    </p>
                    
                    <div className="bg-black/40 rounded-xl py-3 border border-yellow-500/20 shadow-inner group-hover:border-yellow-500/40 transition-colors">
                        <span className="text-4xl font-black text-yellow-400 font-mono tracking-tighter drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]">
                            {topThree[0].points}
                        </span>
                        <span className="text-[10px] text-yellow-600/80 block uppercase font-bold mt-1 tracking-widest">
                            Puntos
                        </span>
                    </div>
                    {isSeasonFinished && (
                      <div className="mt-6 flex justify-center w-full relative">
                        <div className="absolute inset-0 bg-yellow-500/20 blur-xl rounded-full"></div>
                        <F1CarAnimation 
                          primaryColor={topThree[0].teamColor || '#E85725'} 
                          helmetColor="#F59E0B" 
                          className="w-full max-w-[160px] relative z-10 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                        />
                      </div>
                    )}
                  </div>
              </div>
           </div>
        </motion.div>
      )}

      {/* 3rd Place */}
      {topThree[2] && (
        <motion.div variants={itemVariants} className="order-3 md:order-3 flex flex-col items-center group relative z-10 hover:-translate-y-2 transition-transform duration-300">
           <div className="relative mb-4">
              <div className="w-28 h-28 rounded-full border-4 border-orange-700 flex items-center justify-center bg-slate-900 shadow-[0_0_30px_rgba(194,65,12,0.3)] z-10 relative overflow-hidden group-hover:scale-110 group-hover:shadow-[0_0_50px_rgba(194,65,12,0.5)] transition-all duration-500">
                 <span className="text-5xl z-10 filter drop-shadow-lg">🥉</span>
                 <div className="absolute inset-0 bg-gradient-to-tr from-orange-700/20 to-transparent z-0"></div>
              </div>
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-orange-800 text-white text-xs font-black px-3 py-1 rounded-full shadow-lg z-20 border-2 border-slate-900">
                  P3
              </div>
           </div>
           
           <div className="w-full bg-gradient-to-t from-slate-800/80 to-slate-900/80 border-t-4 border-orange-700 rounded-t-2xl p-6 text-center backdrop-blur-sm shadow-2xl min-h-[180px] flex flex-col justify-end relative overflow-hidden group-hover:border-orange-600 transition-colors duration-300">
              <FireParticles colorClass="bg-orange-500" />
              <div className="relative z-10">
                {getTeamLogo(topThree[2].team) && (
                  <div className="flex justify-center mb-3 relative">
                    <div className="absolute inset-0 bg-orange-500/10 blur-lg rounded-full scale-150 group-hover:bg-orange-500/30 transition-colors duration-500"></div>
                    <img src={getTeamLogo(topThree[2].team)} alt="Team Logo" className="w-12 h-12 object-contain filter drop-shadow-[0_0_10px_rgba(255,255,255,0.4)] group-hover:drop-shadow-[0_0_20px_rgba(255,255,255,0.8)] relative z-10 transition-all duration-500" />
                  </div>
                )}
                <h3 className="text-xl font-bold text-white uppercase tracking-tight mb-1 truncate font-sans group-hover:text-orange-100 transition-colors">{topThree[2].name}</h3>
                <p className="text-xs text-slate-400 font-mono mb-4 uppercase tracking-widest">{topThree[2].team}</p>
                <div className="mt-auto bg-slate-950/50 rounded-lg py-2 border border-white/5 group-hover:border-orange-500/30 transition-colors">
                    <span className="text-2xl font-black text-orange-400 font-mono">{topThree[2].points}</span>
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">Puntos</span>
                </div>
                {isSeasonFinished && (
                  <div className="mt-4 flex justify-center w-full">
                    <F1CarAnimation 
                      primaryColor={topThree[2].teamColor || '#E85725'} 
                      helmetColor="#ffffff" 
                      className="w-full max-w-[120px] opacity-80"
                    />
                  </div>
                )}
              </div>
           </div>
        </motion.div>
      )}
      </motion.div>
    </div>
  );
});
