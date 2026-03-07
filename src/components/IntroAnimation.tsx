import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Flag, Zap } from 'lucide-react';
import { F1Car } from './F1Car';

interface IntroAnimationProps {
  onComplete: () => void;
}

export function IntroAnimation({ onComplete }: IntroAnimationProps) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    // Sequence timing
    const timers = [
      setTimeout(() => setStage(1), 1000), // Lights start
      setTimeout(() => setStage(2), 2500), // Car/Logo zoom
      setTimeout(() => setStage(3), 6000), // Fade out
      setTimeout(() => onComplete(), 6500), // Complete
    ];

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] bg-slate-950 flex items-center justify-center overflow-hidden"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Background Grid Effect */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20" />

      {/* Speed Lines / Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-0.5 bg-red-500/50 rounded-full"
            initial={{ 
              x: "100vw", 
              y: Math.random() * 100 + "vh", 
              width: Math.random() * 200 + 50,
              opacity: 0 
            }}
            animate={{ 
              x: "-100vw", 
              opacity: [0, 1, 0] 
            }}
            transition={{ 
              duration: Math.random() * 0.5 + 0.2, 
              repeat: Infinity, 
              delay: Math.random() * 2,
              ease: "linear"
            }}
          />
        ))}
      </div>

      {/* F1 Car Animation - Crosses screen */}
      {stage >= 1 && (
        <motion.div 
            initial={{ x: "-120vw" }}
            animate={{ x: "120vw" }}
            transition={{ duration: 4, ease: "linear" }}
            className="absolute top-1/2 -translate-y-1/2 z-20 scale-75 md:scale-100 pointer-events-none"
        >
           <F1Car />
        </motion.div>
      )}

      <motion.div 
        layout
        className="relative z-10 flex flex-col items-center w-full max-w-4xl px-4"
      >
        {/* F1 Start Lights Sequence */}
        <motion.div layout className="flex gap-4 mb-12">
            {[0, 1, 2, 3, 4].map((i) => (
                <motion.div
                    key={i}
                    initial={{ backgroundColor: "#1e293b" }} // slate-800
                    animate={stage >= 1 ? { backgroundColor: "#ef4444" } : {}} // red-500
                    className="w-4 h-4 md:w-6 md:h-6 rounded-full border-2 border-slate-700 shadow-[0_0_15px_rgba(0,0,0,0.5)]"
                    transition={{ delay: i * 0.2, duration: 0.1 }}
                >
                    {stage >= 1 && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: i * 0.2 }}
                            className="w-full h-full rounded-full bg-red-500 shadow-[0_0_20px_#ef4444]" 
                        />
                    )}
                </motion.div>
            ))}
        </motion.div>

        {/* Logo Reveal */}
        <AnimatePresence mode="popLayout">
            {stage >= 1 && (
                <motion.div
                    initial={{ scale: 0.5, opacity: 0, y: 50 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 1.5, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className="flex flex-col items-center w-full"
                >
                    <div className="relative">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            className="absolute -inset-8 border border-red-500/20 rounded-full border-dashed"
                        />
                        <motion.div
                            animate={{ rotate: -360 }}
                            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                            className="absolute -inset-12 border border-white/10 rounded-full border-dashed opacity-50"
                        />
                        
                        <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-red-600 to-red-900 rounded-2xl flex items-center justify-center transform -skew-x-12 shadow-[0_0_50px_rgba(220,38,38,0.4)] border border-red-500/30 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-30 mix-blend-overlay"></div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                            
                            <Trophy className="text-white w-12 h-12 md:w-16 md:h-16 transform skew-x-12 drop-shadow-lg" />
                            
                            {/* Shine effect */}
                            <motion.div 
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12"
                                initial={{ x: "-100%" }}
                                animate={{ x: "200%" }}
                                transition={{ repeat: Infinity, duration: 1.5, repeatDelay: 1 }}
                            />
                        </div>
                    </div>

                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="mt-8 text-center w-full px-4"
                    >
                        <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter text-white uppercase flex flex-col items-center gap-2 w-full pr-12 pl-4">
                            <span className="text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]">F1</span>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 py-2 pr-2">Assassins</span>
                        </h1>
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            transition={{ delay: 1, duration: 0.8 }}
                            className="h-1 bg-red-600 mt-4 mx-auto rounded-full shadow-[0_0_10px_#dc2626] max-w-xs"
                        />
                        <p className="mt-4 text-xs md:text-sm font-mono text-slate-500 tracking-[0.5em] uppercase w-full text-center">
                            Championship 2025
                        </p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
