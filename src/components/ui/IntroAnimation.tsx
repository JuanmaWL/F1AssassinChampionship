import { useEffect, useState, lazy, Suspense, useMemo } from 'react';
import { motion, AnimatePresence, useAnimation } from 'motion/react';
import { FOOTER_ASSETS } from '../../constants/assets';
import { INTRO_ANIMATION_DURATION } from '../../constants/config';
import { SeasonId } from '../../types';

const F1Car = lazy(() => import('../f1-car/F1Car').then(module => ({ default: module.F1Car })));

// CRT Monitor Filter Component
function CRTFilter() {
  return (
    <svg style={{ position: 'absolute', width: 0, height: 0, pointerEvents: 'none' }}>
      <defs>
        <filter id="threshold">
          <feColorMatrix 
            in="SourceGraphic" 
            type="matrix" 
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 25 -9" 
            result="goo" 
          />
          <feComposite in="SourceGraphic" in2="goo" operator="atop" />
        </filter>

        {/* CRT Scanlines Filter */}
        <filter id="crt-scanlines">
          <feTurbulence baseFrequency="0.9" numOctaves="4" result="turbulence" seed="2" />
          <feDisplacementMap in="SourceGraphic" in2="turbulence" scale="0.3" />
        </filter>
        
        {/* Vignette for depth */}
        <radialGradient id="vignette" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(0,0,0,0)" />
          <stop offset="70%" stopColor="rgba(0,0,0,0.2)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.6)" />
        </radialGradient>
      </defs>
    </svg>
  );
}

interface IntroAnimationProps {
  onComplete: () => void;
  activeSeason: SeasonId;
}

export function IntroAnimation({ onComplete, activeSeason }: IntroAnimationProps) {
  const [stage, setStage] = useState(0);
  const [titleText, setTitleText] = useState("ASSASSINS");
  const [isMetamorphosing, setIsMetamorphosing] = useState(false);
  const [showChampionship, setShowChampionship] = useState(false);
  const [carHasPassed, setCarHasPassed] = useState(false);
  const [showCRTEffect, setShowCRTEffect] = useState(false);
  const impactControls = useAnimation();
  const [isMobile, setIsMobile] = useState(false);
  const [mobileSplashStage, setMobileSplashStage] = useState(0);

  // Random glitch timings per logo
  const glitchTimings = useMemo(() => [0, 1, 2].map(() => ({
    duration: 3 + Math.random() * 5,
    delay: Math.random() * 3,
  })), []);

  // Define isMobile detection initially
  const checkIsMobile = () => /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;

  // Disable intro on mobile and show 1.5s splash instead
  useEffect(() => {
    if (checkIsMobile()) {
      setIsMobile(true);
      setMobileSplashStage(1);

      // Total 1.5s: 1.2s visible (0.3 fade in + 0.9 stay), then 0.3s fade out handled by AnimatePresence
      const t1 = setTimeout(() => setMobileSplashStage(2), 1200);
      const t2 = setTimeout(() => onComplete(), 1500);

      return () => { clearTimeout(t1); clearTimeout(t2); };
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
    if (checkIsMobile()) return; // Skip desktop timers on mobile
    
    // Sequence timing - Professional racing intro
    const timers = [
      setTimeout(() => setStage(1), 1000),  // Lights start igniting
      setTimeout(() => setStage(2), 4000),  // LIGHTS OUT! Title "F1 ASSASSINS" appears
      setTimeout(() => setStage(3), 5500),  // Badges and participant logos appear
      setTimeout(() => {
        setStage(4);                        // Car starts passing (FAST)
        setShowCRTEffect(true);             // Activate CRT effect during car pass
      }, 7000), 
      setTimeout(() => {
        setIsMetamorphosing(true);          // Start metamorphosis glitch (triggered by car)
        setShowChampionship(true);          // Trigger blur-morph
      }, 7300),
      setTimeout(() => {
        setIsMetamorphosing(false);         // End metamorphosis glitch
        setCarHasPassed(true);              // Trigger post-car impact
      }, 7800), 
      setTimeout(() => {
        setShowCRTEffect(false);            // Remove CRT effect
      }, 8500),
      setTimeout(() => onComplete(), INTRO_ANIMATION_DURATION), // Complete
    ];

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  // Post-car impact effect with zoom and particles
  useEffect(() => {
    if (carHasPassed) {
      // Trigger impact animations
      const impactTimer = setTimeout(async () => {
        await impactControls.start({
          scale: [1, 1.08, 0.98, 1],
          rotateY: [0, 2, -2, 0],
          transition: { duration: 0.6, ease: "easeOut" }
        });
      }, 50);

      return () => clearTimeout(impactTimer);
    }
  }, [carHasPassed, impactControls]);

  if (isMobile) {
    return (
      <AnimatePresence>
        {mobileSplashStage === 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center p-4 overflow-hidden"
          >
             <div className="relative text-center px-4 w-full">
                <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase flex flex-col items-center leading-none py-2">
                    <span className="text-red-600 drop-shadow-[0_0_20px_rgba(220,38,38,0.8)] mb-2 pt-6">
                      F1
                    </span>
                    <span style={{ textShadow: '0 0 30px rgba(220, 38, 38, 0.8)' }}>
                      ASSASSINS
                    </span>
                    <span className="text-xl mt-1 text-slate-300">
                      CHAMPIONSHIP
                    </span>
                </h1>
                <motion.div 
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
                    className="h-1 bg-red-600 mt-6 mx-auto rounded-full shadow-[0_0_15px_#dc2626] w-[80%]"
                />
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

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
      {/* CRT Monitor Filter Component */}
      <CRTFilter />

      {/* CRT Scanlines Overlay - Active during car pass */}
      {showCRTEffect && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.15, 0.25, 0.15] }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, repeat: Infinity }}
          className="absolute inset-0 z-[95] pointer-events-none"
          style={{
            backgroundImage: 
              'repeating-linear-gradient(0deg, rgba(0,0,0,0.15) 0px, rgba(0,0,0,0.15) 1px, transparent 1px, transparent 2px)',
            mixBlendMode: 'multiply'
          }}
        />
      )}

      {/* Vignette Effect Layer */}
      <div 
        className="absolute inset-0 z-[94] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0.7) 100%)'
        }}
      />

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

      {/* Thermal Distortion / Heat Haze Trail Behind Car */}
      {stage >= 4 && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={`thermal-${i}`}
              className="absolute rounded-full blur-3xl"
              initial={{ 
                x: "50vw",
                y: "25vh",
                width: 120 + i * 15,
                height: 80 + i * 10,
                opacity: 0
              }}
              animate={{
                x: ["50vw", "40vw", "20vw", "10vw"],
                y: ["25vh", "22vh", "26vh", "24vh"],
                opacity: [0, 0.3, 0.15, 0],
                scaleX: [1, 1.3, 1.1],
                scaleY: [1, 0.8, 0.9]
              }}
              transition={{
                duration: 0.8,
                delay: i * 0.08,
                ease: "easeOut"
              }}
              style={{
                background: 'radial-gradient(ellipse at center, rgba(255,100,0,0.2) 0%, transparent 70%)',
                filter: 'blur(20px)'
              }}
            />
          ))}
        </div>
      )}

      {/* F1 Car Animation */}
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

      {/* Post-Car Impact Zoom Effect */}
      <motion.div
        animate={impactControls}
        className="absolute inset-0 z-[65] pointer-events-none"
        style={{
          perspective: '1000px'
        }}
      >
        {carHasPassed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.4, 0] }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 bg-red-600/20"
          />
        )}
      </motion.div>

      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-4 md:p-6 max-h-screen gap-4 md:gap-8 overflow-hidden">
        {/* TOP: F1 Start Lights - Enhanced 3D */}
        <AnimatePresence mode="popLayout">
          {stage === 1 && (
            <motion.div 
              layout
              key="lights"
              initial={{ opacity: 0, y: -40, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -60, scale: 0.8, filter: "blur(10px)" }}
              transition={{ duration: 0.6 }}
              className="flex gap-4 md:gap-6 p-6 md:p-8 bg-black/80 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl"
              style={{
                perspective: '1000px',
                boxShadow: '0 25px 50px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.1)'
              }}
            >
                {[0, 1, 2, 3, 4].map((i) => (
                    <div key={i} className="relative w-8 h-8 md:w-10 md:h-10">
                        {/* Light Bokeh Glow Background */}
                        <motion.div
                            className="absolute inset-0 rounded-full"
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ 
                                opacity: 0, 
                                scale: 1,
                            }}
                            transition={{ delay: i * 0.6, duration: 0.1 }}
                            style={{
                              background: 'radial-gradient(circle at 30% 30%, #ef4444, transparent)',
                              filter: 'blur(15px)',
                              transform: 'scale(2.5)'
                            }}
                        />
                        
                        {/* Main Light Housing */}
                        <div 
                            className="absolute inset-0 rounded-full border-4 border-slate-700 shadow-inner"
                            style={{
                              background: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)',
                              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.8), 0 0 2px rgba(255,255,255,0.1)'
                            }}
                        />

                        {/* Animated Light Core */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ 
                                opacity: 1, 
                                backgroundColor: "#ef4444",
                            }}
                            transition={{ delay: i * 0.6, duration: 0.15 }}
                            className="absolute inset-1 rounded-full"
                            style={{
                              boxShadow: '0 0 20px #ef4444, 0 0 40px #ef4444, inset 0 0 8px rgba(255,0,0,0.5), 0 0 60px rgba(239, 68, 68, 0.6)'
                            }}
                        />

                        {/* Shine / Highlight */}
                        <div 
                            className="absolute top-1 left-1 w-2 h-2 md:w-3 md:h-3 rounded-full bg-white/40 blur-sm"
                            style={{ boxShadow: '0 0 8px rgba(255,255,255,0.6)' }}
                        />
                    </div>
                ))}
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
                          <h1 className="text-5xl sm:text-6xl md:text-8xl font-black italic tracking-tighter text-white uppercase flex flex-col items-center leading-none whitespace-nowrap min-h-[1.2em] w-full py-4">
                              <motion.span 
                                className="text-red-600 drop-shadow-[0_0_30px_rgba(220,38,38,0.8)] mb-2 pt-8"
                              >
                                F1
                              </motion.span>
                              
                              {/* Blur Morph Container */}
                              <div className="relative w-full flex items-center justify-center min-h-[1em]" style={{ filter: "url(#threshold)" }}>
                                <AnimatePresence>
                                    {!showChampionship ? (
                                        <motion.span
                                            key="assassins"
                                            initial={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                                            exit={{ 
                                                opacity: 0, 
                                                scale: 1.2, 
                                                filter: "blur(20px)",
                                                transition: { duration: 0.8, ease: "easeInOut" }
                                            }}
                                            className="absolute"
                                        >
                                            ASSASSINS
                                        </motion.span>
                                    ) : (
                                        <motion.div key="championship-wrapper" className="relative">
                                          {/* Shimmer Overlay for Metallic Effect */}
                                          <motion.div
                                            className="absolute inset-0 z-10 pointer-events-none"
                                            style={{
                                              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                                              width: '100%'
                                            }}
                                            animate={{
                                              x: ['-100%', '100%']
                                            }}
                                            transition={{
                                              duration: 2.5,
                                              repeat: Infinity,
                                              ease: 'easeInOut'
                                            }}
                                          />

                                          <motion.span
                                              key="championship"
                                              initial={{ opacity: 0, scale: 0.8, filter: "blur(20px)" }}
                                              animate={showChampionship ? "initial" : {}}
                                              variants={{
                                                  initial: { 
                                                      opacity: 1, 
                                                      scale: 1, 
                                                      filter: "blur(0px)",
                                                      textShadow: [
                                                          "0px 0px 0px rgba(0,0,0,0)",
                                                          "3px 0 #ff0000, -3px 0 #00ffff",
                                                          "0px 0px 0px rgba(0,0,0,0)"
                                                      ],
                                                      transition: { 
                                                          opacity: { duration: 0.6 },
                                                          scale: { duration: 0.8 },
                                                          filter: { duration: 0.8 },
                                                          textShadow: { duration: 0.4, delay: 0.4 }
                                                      }
                                                  }
                                              }}
                                              className="absolute relative"
                                              style={{
                                                textShadow: '0 0 30px rgba(220, 38, 38, 0.8), 0 0 60px rgba(220, 38, 38, 0.6)'
                                              }}
                                          >
                                              CHAMPIONSHIP
                                          </motion.span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                              </div>
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

        {/* BOTTOM: Logos */}
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
                          } : (stage >= 4 && carHasPassed) ? {
                            x: [0, -4, 4, -2, 2, 0, 0, 0, 0, 0, 0, 0, 0],
                            scale: [1.05, 1.08, 1.02, 1.06, 1.04, 1.05, 1.05, 1.05, 1.05, 1.05, 1.05, 1.05, 1.05],
                            filter: [
                              "grayscale(0%) brightness(1) drop-shadow(0px 0px 8px rgba(239, 68, 68, 0.6))",
                              "grayscale(0%) brightness(1.5) drop-shadow(6px 0px 0px #ff0000) drop-shadow(-6px 0px 0px #00ffff)",
                              "grayscale(0%) brightness(0.8) drop-shadow(-4px 0px 0px #00ff00) drop-shadow(4px 0px 0px #ff00ff)",
                              "grayscale(0%) brightness(1.3) drop-shadow(3px 0px 0px #ff0000)",
                              "grayscale(0%) brightness(0.9) drop-shadow(-3px 0px 0px #00ffff)",
                              "grayscale(0%) brightness(1) drop-shadow(0px 0px 8px rgba(239, 68, 68, 0.6))",
                              "grayscale(0%) brightness(1) drop-shadow(0px 0px 8px rgba(239, 68, 68, 0.6))",
                              "grayscale(0%) brightness(1) drop-shadow(0px 0px 8px rgba(239, 68, 68, 0.6))",
                              "grayscale(0%) brightness(1) drop-shadow(0px 0px 8px rgba(239, 68, 68, 0.6))",
                              "grayscale(0%) brightness(1) drop-shadow(0px 0px 8px rgba(239, 68, 68, 0.6))",
                              "grayscale(0%) brightness(1) drop-shadow(0px 0px 8px rgba(239, 68, 68, 0.6))",
                              "grayscale(0%) brightness(1) drop-shadow(0px 0px 8px rgba(239, 68, 68, 0.6))",
                              "grayscale(0%) brightness(1) drop-shadow(0px 0px 8px rgba(239, 68, 68, 0.6))",
                            ]
                          } : stage >= 4 ? {
                            x: 0,
                            scale: [1, 1.05, 1],
                            filter: "grayscale(0%) brightness(1) drop-shadow(0px 0px 8px rgba(239, 68, 68, 0.6))"
                          } : {
                            x: 0,
                            scale: 1,
                            filter: "grayscale(0%) brightness(1)"
                          }}
                          transition={isMetamorphosing ? {
                            duration: 0.4,
                            ease: "easeInOut"
                          } : (stage >= 4 && carHasPassed) ? {
                            duration: glitchTimings[idx].duration,
                            repeat: Infinity,
                            delay: glitchTimings[idx].delay,
                            ease: "linear",
                            times: [0, 0.02, 0.04, 0.06, 0.08, 0.1, 0.2, 0.4, 0.6, 0.8, 0.9, 0.95, 1]
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
                            className="h-10 sm:h-12 md:h-16 object-contain transition-transform duration-300 group-hover:scale-110 drop-shadow-lg" 
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
                            initial={{ scale: 0.8, opacity: 0, y: 15 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            transition={{ 
                              delay: 0.1 * i, 
                              type: "spring", 
                              stiffness: 300, 
                              damping: 20, 
                              mass: 0.8 
                            }}
                            whileHover={{ scale: 1.1 }}
                            className="px-3 py-1.5 md:px-5 md:py-2.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center gap-2 md:gap-2.5 shadow-xl text-white/90 transition-all duration-300"
                            style={carHasPassed ? {
                              boxShadow: '0 0 20px rgba(220, 38, 38, 0.5), 0 0 40px rgba(220, 38, 38, 0.2), inset 0 0 10px rgba(220, 38, 38, 0.1)'
                            } : {
                              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
                            }}
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
