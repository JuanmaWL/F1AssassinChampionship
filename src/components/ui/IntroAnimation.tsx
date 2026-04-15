import { useEffect, useState, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FOOTER_ASSETS } from '../../constants/assets';

import { SeasonId } from '../../types';

const F1Car = lazy(() => import('../f1-car/F1Car').then(module => ({ default: module.F1Car })));

interface IntroAnimationProps {
  onComplete: () => void;
  activeSeason: SeasonId;
}

export function IntroAnimation({ onComplete, activeSeason }: IntroAnimationProps) {
  const [stage, setStage] = useState(0);
  const [titleText, setTitleText] = useState("ASSASSINS");
  const [isMetamorphosing, setIsMetamorphosing] = useState(false);

  // Disable intro on mobile
  useEffect(() => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
    if (isMobile) {
      onComplete();
    }
  }, [onComplete]);

  // Disable scroll during intro
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  useEffect(() => {
    // Sequence timing - Professional racing intro
    const timers = [
      setTimeout(() => setStage(1), 1000),  // Lights start igniting
      setTimeout(() => setStage(2), 4000),  // LIGHTS OUT! Title "F1 ASSASSINS" appears
      setTimeout(() => setStage(3), 5500),  // Badges and participant logos appear
      setTimeout(() => {
        setStage(4);                        // Car starts passing (FAST)
      }, 7000), 
      setTimeout(() => {
        setIsMetamorphosing(true);          // Start metamorphosis glitch (triggered by car)
      }, 7300),
      setTimeout(() => {
        setIsMetamorphosing(false);         // End metamorphosis glitch
      }, 7800), // Shorter, elegant flash
      setTimeout(() => onComplete(), 10800), // Complete
    ];

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  // Elegant flash effect during metamorphosis
  useEffect(() => {
    if (isMetamorphosing) {
      const timeout = setTimeout(() => {
        setTitleText("CHAMPIONSHIP");
      }, 150); // Change text right in the middle of the flash
      return () => clearTimeout(timeout);
    }
  }, [isMetamorphosing]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] bg-slate-950 flex items-center justify-center overflow-hidden"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      animate={stage === 2 ? {
        x: [0, -10, 10, -8, 8, -5, 5, 0],
        y: [0, 5, -5, 4, -4, 2, -2, 0],
        scale: 1.05 // Prevent seeing background during shake
      } : {
        scale: 1
      }}
    >
      {/* Cinematic Flash Effect on Metamorphosis */}
      <AnimatePresence>
        {isMetamorphosing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.9, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="absolute inset-0 z-[60] bg-white pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Dynamic Wallpaper Background */}
      <motion.div 
        className="absolute inset-0 z-0"
        style={{ willChange: 'transform, opacity' }}
        initial={{ scale: 1.15, opacity: 0 }}
        animate={{ 
          scale: stage >= 3 ? 1.05 : (stage >= 1 ? 1.0 : 1.1),
          opacity: stage >= 3 ? 0.2 : (stage >= 1 ? 0.45 : 0),
          filter: stage >= 2 ? 'blur(0px) brightness(1)' : 'blur(4px) brightness(0.8)',
        }}
        transition={{ 
          scale: { duration: 3, ease: "linear" },
          opacity: { duration: 1.5 },
          filter: { duration: 2 }
        }}
      >
        <img 
          src={FOOTER_ASSETS.WALLPAPER} 
          alt="F1 Intro Background" 
          className="w-full h-full object-cover object-center"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/60" />
      </motion.div>

      {/* Speed Lines / Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(25)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-[2px] bg-gradient-to-r from-red-500/40 to-transparent rounded-full"
            initial={{ 
              x: "110vw", 
              y: Math.random() * 100 + "vh", 
              width: Math.random() * 400 + 200,
              opacity: 0 
            }}
            animate={stage >= 2 ? { 
              x: "-150vw", 
              opacity: [0, 1, 0] 
            } : {}}
            transition={{ 
              duration: Math.random() * 0.4 + 0.2, 
              repeat: Infinity, 
              delay: Math.random() * 2,
              ease: "linear"
            }}
          />
        ))}
      </div>

      {/* F1 Car Animation - Passes IN FRONT of everything */}
      {stage >= 4 && (
        <motion.div 
            initial={{ x: "-150vw" }}
            animate={{ x: "150vw" }}
            transition={{ duration: 0.6, ease: "linear", delay: 0 }}
            className="absolute top-[25%] left-0 z-[70] pointer-events-none flex items-center justify-center"
            style={{ 
              width: '667px', 
              height: '330px',
              transformOrigin: 'center center'
            }}
        >
           {/* Speed Trails / Smoke behind wheels */}
           <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-full">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.5, x: 0 }}
                  animate={{ 
                    opacity: [0, 0.4, 0], 
                    scale: [1, 2], 
                    x: [-50, -300],
                    y: [0, (i % 2 === 0 ? 20 : -20)]
                  }}
                  transition={{ 
                    duration: 0.4, 
                    repeat: Infinity, 
                    delay: i * 0.05,
                    ease: "easeOut"
                  }}
                  className="absolute left-[100px] top-[150px] w-20 h-8 bg-white/20 blur-xl rounded-full"
                />
              ))}
              {/* Speed Lines following the car */}
              {[...Array(10)].map((_, i) => (
                <motion.div
                  key={`line-${i}`}
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ 
                    opacity: [0, 0.8, 0], 
                    width: [100, 400],
                    x: [-200, -600]
                  }}
                  transition={{ 
                    duration: 0.3, 
                    repeat: Infinity, 
                    delay: i * 0.03,
                    ease: "linear"
                  }}
                  className="absolute left-[150px] h-[1px] bg-red-500/50"
                  style={{ top: `${120 + i * 15}px` }}
                />
              ))}
           </div>

           <motion.div
             className="scale-[1.2] sm:scale-[1.5] md:scale-[1.8] drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
           >
             <Suspense fallback={null}>
               <F1Car />
             </Suspense>
           </motion.div>
        </motion.div>
      )}

      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-4 md:p-6 max-h-screen gap-4 md:gap-8 overflow-hidden">
        {/* TOP: F1 Start Lights Sequence - Hide when logo appears */}
        <AnimatePresence mode="popLayout">
          {stage === 1 && (
            <motion.div 
              layout
              key="lights"
              initial={{ opacity: 0, y: -40, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -60, scale: 0.8, filter: "blur(10px)" }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center"
            >
              <div className="flex gap-4 md:gap-6 p-4 bg-black/60 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl">
                  {[0, 1, 2, 3, 4].map((i) => (
                      <div key={i} className="relative w-6 h-6 md:w-8 md:h-8">
                          <div className="absolute inset-0 rounded-full bg-slate-900 border-2 border-slate-700 shadow-inner" />
                          <motion.div
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ 
                                  opacity: 1, 
                                  scale: 1,
                                  backgroundColor: "#ef4444",
                                  boxShadow: "0 0 30px #ef4444, inset 0 0 10px rgba(255,255,255,0.5)"
                              }}
                              transition={{ delay: i * 0.6, duration: 0.1 }}
                              className="absolute inset-0 rounded-full"
                          />
                      </div>
                  ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MIDDLE: Logo & Title with Wipe Reveal */}
        <AnimatePresence mode="popLayout">
            {stage >= 2 && (
                <motion.div
                    layout
                    key="title"
                    initial={{ opacity: 0, scale: 0.85, y: 40, filter: "blur(10px)" }}
                    animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="flex flex-col items-center w-full max-w-4xl px-4 shrink-0"
                >
                    {/* Title with Wipe Reveal synced with car */}
                    <div className="relative text-center px-4 w-full max-w-[900px]">
                        <motion.div
                          initial={{ clipPath: "inset(0 100% 0 0)", x: -40 }}
                          animate={{ clipPath: "inset(0 0% 0 0)", x: 0 }}
                          transition={{ duration: 1, ease: [0.77, 0, 0.175, 1], delay: 0.1 }}
                        >
                          <h1 className="text-5xl sm:text-6xl md:text-8xl font-black italic tracking-tighter text-white uppercase flex flex-col items-center leading-none whitespace-nowrap min-h-[1.2em] w-full">
                              <motion.span 
                                className="text-red-600 drop-shadow-[0_0_30px_rgba(220,38,38,0.8)] mb-2"
                              >
                                F1
                              </motion.span>
                              <motion.span 
                                key="titleText"
                                animate={isMetamorphosing ? {
                                  x: [0, -4, 4, -2, 2, 0],
                                  filter: [
                                    "brightness(1) contrast(1)",
                                    "brightness(2) contrast(1.5) drop-shadow(4px 0px 0px #ff0000) drop-shadow(-4px 0px 0px #00ffff)",
                                    "brightness(1) contrast(1)"
                                  ],
                                  opacity: [1, 0.8, 1]
                                } : {
                                  x: 0,
                                  filter: "brightness(1) contrast(1) drop-shadow(0px 0px 0px rgba(255,0,0,0)) drop-shadow(0px 0px 0px rgba(0,255,255,0))",
                                  opacity: 1
                                }}
                                transition={isMetamorphosing ? {
                                  duration: 0.4,
                                  ease: "easeInOut"
                                } : {
                                  duration: 0.2
                                }}
                                className={`px-6 w-full text-center font-sans tracking-tighter text-white ${stage >= 4 ? 'glitch-text' : ''}`}
                                data-text={titleText}
                              >
                                {titleText}
                              </motion.span>
                          </h1>
                        </motion.div>
                        
                        <motion.div 
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ delay: 1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                            className="h-1 bg-red-600 mt-4 md:mt-6 mx-auto rounded-full shadow-[0_0_20px_#dc2626] w-full max-w-[250px] sm:max-w-[350px] md:max-w-[500px]"
                        />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        {/* BOTTOM: Platform Badges & Participant Logos */}
        <AnimatePresence mode="popLayout">
            {stage >= 3 && (
                <motion.div
                    layout
                    key="footer"
                    initial={{ opacity: 0, y: 40, scale: 0.9, filter: "blur(10px)" }}
                    animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="flex flex-col items-center space-y-4 md:space-y-6 mt-2 md:mt-4 shrink"
                >
                    {/* Participant Logos with Glitch Animation */}
                    <div className="flex gap-6 md:gap-8 items-center">
                      {[
                        { src: FOOTER_ASSETS.ALVILLAS, alt: "Alvillas" },
                        { src: FOOTER_ASSETS.JUASMO, alt: "Juasmo" },
                        { src: FOOTER_ASSETS.UYIMERO, alt: "Uyimero" }
                      ].map((logo, idx) => (
                        <motion.div
                          key={logo.alt}
                          animate={isMetamorphosing ? {
                            x: [0, -3, 3, -1, 1, 0],
                            scale: 1,
                            filter: [
                              "grayscale(0%) brightness(1)",
                              "grayscale(0%) brightness(1.5) drop-shadow(3px 0px 0px #ff0000) drop-shadow(-3px 0px 0px #00ffff)",
                              "grayscale(0%) brightness(1)"
                            ],
                          } : stage >= 4 ? {
                            x: 0,
                            scale: [1, 1.05, 1],
                            filter: "grayscale(0%) brightness(1) drop-shadow(0px 0px 0px rgba(255,0,0,0)) drop-shadow(0px 0px 0px rgba(0,255,255,0))"
                          } : {
                            x: 0,
                            scale: 1,
                            filter: "grayscale(0%) brightness(1) drop-shadow(0px 0px 0px rgba(255,0,0,0)) drop-shadow(0px 0px 0px rgba(0,255,255,0))"
                          }}
                          transition={isMetamorphosing ? {
                            duration: 0.4,
                            ease: "easeInOut"
                          } : stage >= 4 ? {
                            duration: 3 + (idx * 0.5), 
                            repeat: Infinity, 
                            ease: "easeInOut"
                          } : {
                            duration: 0.4,
                            ease: "easeInOut"
                          }}
                          className="relative group"
                        >
                          <img 
                            src={logo.src} 
                            alt={logo.alt} 
                            className="h-10 sm:h-12 md:h-16 object-contain transition-transform duration-300 group-hover:scale-110" 
                            referrerPolicy="no-referrer" 
                          />
                        </motion.div>
                      ))}
                    </div>

                    <div className="text-center space-y-1">
                        <p className="text-[10px] md:text-xs font-mono tracking-[0.4em] text-slate-400 uppercase">Powered by EA SPORTS</p>
                        <p className="text-base md:text-xl font-bold text-white tracking-widest">F1® {activeSeason === '2024' ? '23' : '25'}</p>
                    </div>

                    <div className="flex gap-3 md:gap-6">
                        {[
                          { name: 'PS5', icon: (
                            <img src="/icons/playstation.svg" alt="PS5" className="w-4 h-4 md:w-5 md:h-5 invert brightness-200" />
                          )},
                          { name: 'XBOX', icon: (
                            <img src="/icons/xbox.svg" alt="XBOX" className="w-4 h-4 md:w-5 md:h-5 invert brightness-200" />
                          )},
                          { name: 'PC', icon: (
                            <div className="flex items-center justify-center font-mono font-black text-xs md:text-sm tracking-tighter border-2 border-white/80 px-1 leading-none h-4 md:h-5">
                              PC
                            </div>
                          )}
                        ].map((p, i) => (
                          <motion.div
                            key={p.name}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.1 * i, type: "spring" }}
                            className="px-3 py-1.5 md:px-5 md:py-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center gap-2 md:gap-2.5 shadow-xl text-white/90"
                          >
                            {p.icon}
                            <span className="text-[10px] md:text-sm font-bold tracking-wider">{p.name}</span>
                          </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
