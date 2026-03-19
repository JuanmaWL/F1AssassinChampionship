import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Trophy, Play, RotateCcw, Check, Calendar as CalendarIcon, Sparkles, Maximize, Minimize, Info, MonitorPlay, LayoutDashboard, ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';

const RACES = [
  { id: 'aus', name: 'GP Australia', short: 'Australia', flagCode: 'au' },
  { id: 'chn', name: 'GP China', short: 'China', flagCode: 'cn' },
  { id: 'jpn', name: 'GP Japón', short: 'Japón', flagCode: 'jp' },
  { id: 'bhr', name: 'GP Bahrein', short: 'Bahrein', flagCode: 'bh' },
  { id: 'sau', name: 'GP Arabia Saudí', short: 'Arabia Saudí', flagCode: 'sa' },
  { id: 'mia', name: 'GP Miami', short: 'Miami', flagCode: 'us' },
  { id: 'emi', name: 'GP Emilia-Romaña', short: 'Emilia-Romaña', flagCode: 'it' },
  { id: 'mon', name: 'GP Mónaco', short: 'Mónaco', flagCode: 'mc' },
  { id: 'esp', name: 'GP España', short: 'España', flagCode: 'es' },
  { id: 'can', name: 'GP Canadá', short: 'Canadá', flagCode: 'ca' },
  { id: 'aut', name: 'GP Austria', short: 'Austria', flagCode: 'at' },
  { id: 'gbr', name: 'GP Gran Bretaña', short: 'Gran Bretaña', flagCode: 'gb' },
  { id: 'bel', name: 'GP Bélgica', short: 'Bélgica', flagCode: 'be' },
  { id: 'hun', name: 'GP Hungría', short: 'Hungría', flagCode: 'hu' },
  { id: 'ned', name: 'GP Países Bajos', short: 'Países Bajos', flagCode: 'nl' },
  { id: 'ita', name: 'GP Italia', short: 'Italia', flagCode: 'it' },
  { id: 'aze', name: 'GP Azerbaiyán', short: 'Azerbaiyán', flagCode: 'az' },
  { id: 'sgp', name: 'GP Singapur', short: 'Singapur', flagCode: 'sg' },
  { id: 'usa', name: 'GP Estados Unidos', short: 'Estados Unidos', flagCode: 'us' },
  { id: 'mex', name: 'GP México', short: 'México', flagCode: 'mx' },
  { id: 'bra', name: 'GP Brasil', short: 'Brasil', flagCode: 'br' },
  { id: 'las', name: 'GP Las Vegas', short: 'Las Vegas', flagCode: 'us' },
  { id: 'qat', name: 'GP Qatar', short: 'Qatar', flagCode: 'qa' },
  { id: 'abu', name: 'GP Abu Dabi', short: 'Abu Dabi', flagCode: 'ae' }
];

const TARGET_RACES_COUNT = 12;

const Particles = () => {
  const particles = useMemo(() => {
    return Array.from({ length: 80 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 8 + 2,
      duration: Math.random() * 15 + 10,
      delay: Math.random() * 10,
      opacity: Math.random() * 0.6 + 0.2,
      color: Math.random() > 0.5 ? '#ef4444' : '#ffffff' // Mix of red and white
    }));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-900/10 via-slate-950 to-slate-950"></div>
      
      {/* Dynamic glowing orbs */}
      <motion.div 
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.2, 0.3, 0.2]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_20%,_rgba(239,68,68,0.15)_0%,_transparent_50%)]"
      />
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 5 }}
        className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_80%_80%,_rgba(239,68,68,0.1)_0%,_transparent_50%)]"
      />

      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
            opacity: p.opacity,
            backgroundColor: p.color,
            boxShadow: `0 0 ${p.size * 2}px ${p.color}`
          }}
          animate={{
            y: [0, -1000],
            x: [0, Math.random() * 200 - 100],
            opacity: [0, p.opacity, 0],
            scale: [0.5, 1.5, 0.5]
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "linear"
          }}
        />
      ))}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_70%,transparent_100%)]"></div>
    </div>
  );
};

export function Draw() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedRaces, setSelectedRaces] = useState<typeof RACES>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [winningRace, setWinningRace] = useState<typeof RACES[0] | null>(null);
  const [showWinner, setShowWinner] = useState(false);
  const [pointerRotation, setPointerRotation] = useState(0);
  const [isStreamMode, setIsStreamMode] = useState(false);
  const [showInfo, setShowInfo] = useState(true);

  // Sound effects (visual only for now, but we prepare the state)
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Hook to simulate pointer ticking
  React.useEffect(() => {
    if (!isSpinning) {
      setPointerRotation(0);
      return;
    }

    let lastTickAngle = -1;
    const sliceAngle = 360 / RACES.length;
    
    const checkTick = () => {
      if (!isSpinning) return;
      
      const wheel = document.getElementById('f1-wheel');
      if (wheel) {
        const style = window.getComputedStyle(wheel);
        const matrix = new DOMMatrixReadOnly(style.transform);
        const angle = Math.atan2(matrix.b, matrix.a) * (180 / Math.PI);
        const normalizedAngle = (angle < 0 ? angle + 360 : angle);
        
        const currentSlice = Math.floor(normalizedAngle / sliceAngle);
        if (currentSlice !== lastTickAngle) {
          lastTickAngle = currentSlice;
          // Trigger pointer flick with more subtle physics
          setPointerRotation(-25);
          setTimeout(() => setPointerRotation(0), 50);
        }
      }
      requestAnimationFrame(checkTick);
    };

    const animId = requestAnimationFrame(checkTick);
    return () => cancelAnimationFrame(animId);
  }, [isSpinning]);

  const fireConfetti = () => {
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.8 },
        colors: ['#ef4444', '#ffffff', '#000000'],
        zIndex: 100
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.8 },
        colors: ['#ef4444', '#ffffff', '#000000'],
        zIndex: 100
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  };

  const spinWheel = () => {
    if (isSpinning || selectedRaces.length >= TARGET_RACES_COUNT) return;

    setIsSpinning(true);
    setShowWinner(false);

    const unselected = RACES.filter(r => !selectedRaces.find(sr => sr.id === r.id));
    if (unselected.length === 0) {
      setIsSpinning(false);
      return;
    }

    const winner = unselected[Math.floor(Math.random() * unselected.length)];
    const winnerIndex = RACES.findIndex(r => r.id === winner.id);

    const sliceAngle = 360 / RACES.length;
    const randomOffset = (Math.random() * 0.8 - 0.4) * sliceAngle; 
    const targetMod = (360 - (winnerIndex * sliceAngle) + randomOffset) % 360;
    
    const spins = 8 + Math.floor(Math.random() * 4);
    let extra = targetMod - (rotation % 360);
    if (extra < 0) extra += 360;
    
    const newRotation = rotation + (spins * 360) + extra;
    setRotation(newRotation);

    setTimeout(() => {
      setWinningRace(winner);
      setShowWinner(true);
      setIsSpinning(false);

      fireConfetti();

      setTimeout(() => {
        setSelectedRaces(prev => [...prev, winner]);
        setShowWinner(false);
      }, 4000);

    }, 6000);
  };

  const resetDraw = () => {
    setSelectedRaces([]);
    setRotation(0);
    setWinningRace(null);
    setShowWinner(false);
  };

  const isComplete = selectedRaces.length >= TARGET_RACES_COUNT;

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div 
      ref={containerRef} 
      className={cn(
        "relative min-h-screen overflow-y-auto overflow-x-hidden bg-slate-950",
        isFullscreen ? "rounded-none m-0" : "rounded-3xl -mx-4 md:mx-0"
      )}
    >
      <Particles />
      
      {/* Top Bar Controls */}
      <div className="fixed bottom-4 right-4 z-50 flex gap-2">
        <button
          onClick={() => {
            if (!document.fullscreenElement) {
              containerRef.current?.requestFullscreen().catch(err => console.error(err));
            } else {
              document.exitFullscreen();
            }
          }}
          className="bg-slate-900/80 backdrop-blur-md border border-white/10 text-white p-3 rounded-full hover:bg-slate-800 transition-colors flex items-center justify-center shadow-xl"
          title={isFullscreen ? "Salir de Pantalla Completa" : "Pantalla Completa"}
        >
          {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
        </button>
        <button
          onClick={() => setIsStreamMode(!isStreamMode)}
          className="bg-slate-900/80 backdrop-blur-md border border-white/10 text-white p-3 rounded-full hover:bg-slate-800 transition-colors flex items-center justify-center shadow-xl"
          title={isStreamMode ? "Vista Normal" : "Modo Stream"}
        >
          {isStreamMode ? <LayoutDashboard size={20} /> : <MonitorPlay size={20} />}
        </button>
      </div>

      <div className={cn(
        "relative z-10 flex flex-col gap-4 p-2 md:p-6 w-full mx-auto min-h-full transition-all duration-500",
        isStreamMode ? "items-center max-w-[1600px] pt-16" : "lg:grid lg:grid-cols-[280px_1fr_320px] max-w-[2400px]"
      )}>
        
        {/* Left Side: Instructions & Full List */}
        <div className={cn(
          "gap-4 transition-all duration-500",
          isStreamMode ? "order-2 w-full max-w-4xl flex flex-col md:flex-row mt-8 items-start" : "flex flex-col order-2 lg:order-1 h-full max-h-[calc(100vh-8rem)]"
        )}>
          {/* Compact Instructions */}
          {showInfo ? (
            <div className={cn(
              "bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl shrink-0 flex flex-col gap-3 h-fit relative transition-all duration-500",
              isStreamMode ? "w-full md:w-1/2" : "w-full"
            )}>
              <button 
                onClick={() => setShowInfo(false)} 
                className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
                title="Ocultar Información"
              >
                <ChevronUp size={16} />
              </button>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                  <Info size={16} className="text-red-500" />
                </div>
                <strong className="text-white text-sm uppercase tracking-wider font-black italic">Información</strong>
              </div>
              
              <ul className="space-y-3 text-xs text-slate-300 font-medium leading-relaxed">
                <li className="flex gap-3 items-start">
                  <span className="w-5 h-5 mt-0.5 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center shrink-0 text-[10px] font-bold">1</span>
                  <span>De los 24 circuitos de 2025 se elegirán <strong>12 mediante la ruleta</strong>.</span>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="w-5 h-5 mt-0.5 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center shrink-0 text-[10px] font-bold">2</span>
                  <span>Se seguirá el orden de extracción para el campeonato de 2026.</span>
                </li>
                <li className="flex gap-3 items-start">
                  <span className="w-5 h-5 mt-0.5 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center shrink-0 text-[10px] font-bold">3</span>
                  <span>Los GP elegidos <strong>nunca podrán volver a salir</strong> (sin repeticiones).</span>
                </li>
              </ul>
            </div>
          ) : (
            <button 
              onClick={() => setShowInfo(true)} 
              className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-full w-12 h-12 flex items-center justify-center shadow-2xl shrink-0 text-red-500 hover:bg-slate-800 transition-colors"
              title="Ver Información"
            >
              <Info size={24} />
            </button>
          )}

          <div className={cn(
            "bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl flex flex-col min-h-0 transition-all duration-500",
            isStreamMode ? "h-[300px] flex-1 w-full" : "flex-1 overflow-hidden w-full"
          )}>
            <h3 className="text-lg font-black italic uppercase tracking-wider text-white mb-3 shrink-0">Candidatos 2026</h3>
            <div className={cn(
              "grid gap-1.5 overflow-y-auto pr-2 custom-scrollbar flex-1",
              isStreamMode ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4" : "grid-cols-1"
            )}>
              {RACES.map(race => {
                const isSelected = selectedRaces.some(r => r.id === race.id);
                return (
                  <div 
                    key={race.id}
                    className={cn(
                      "flex items-center gap-2 p-1.5 rounded-lg border transition-all text-[10px] font-bold uppercase tracking-tight",
                      isSelected 
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 opacity-50" 
                        : "bg-slate-800/50 border-white/5 text-slate-400"
                    )}
                  >
                    <img 
                      src={`https://flagcdn.com/w20/${race.flagCode}.png`}
                      alt={race.short}
                      className="w-4 h-auto rounded-xs grayscale-[0.5]"
                    />
                    <span className="truncate">{race.short}</span>
                    {isSelected && <Check size={10} className="ml-auto" />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Center: The Big Wheel */}
        <div className={cn(
          "flex flex-col items-center justify-center relative px-4 transition-all duration-500",
          isStreamMode ? "order-1 w-full max-w-5xl" : "order-1 lg:order-2"
        )}>
          <div className="text-center mb-4 relative">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-3 px-4 py-1.5 bg-red-600 text-white rounded-full mb-3 shadow-[0_0_15px_rgba(220,38,38,0.4)]"
            >
              <Trophy size={16} className="animate-bounce" />
              <span className="font-black italic uppercase tracking-widest text-[10px]">F1 World Tour 2026</span>
            </motion.div>
            <h2 className={cn(
              "font-black italic uppercase tracking-tighter text-white leading-none drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)] transition-all duration-500",
              isStreamMode ? "text-5xl md:text-7xl lg:text-8xl" : "text-4xl md:text-6xl lg:text-7xl"
            )}>
              LA <span className="text-transparent bg-clip-text bg-gradient-to-b from-red-500 to-red-800">RULETA</span>
            </h2>
          </div>

          <div className={cn(
            "relative w-full aspect-square flex items-center justify-center transition-all duration-500 max-w-[min(850px,75vh)]"
          )}>
            {/* Glowing backdrop */}
            <div className={cn(
              "absolute inset-0 rounded-full blur-[120px] transition-all duration-1000",
              isSpinning ? "bg-red-600/25 scale-110" : "bg-red-900/5 scale-100"
            )}></div>

            {/* Pointer with oscillation */}
            <motion.div 
              animate={{ rotate: pointerRotation }}
              transition={{ type: "spring", stiffness: 500, damping: 15 }}
              className={cn(
                "absolute top-0 left-1/2 -translate-x-1/2 z-20 drop-shadow-[0_0_15px_rgba(220,38,38,0.8)] transition-all duration-500",
                isStreamMode ? "-translate-y-8" : "-translate-y-4"
              )}
            >
              <div className={cn(
                "bg-gradient-to-b from-red-400 to-red-600 relative transition-all duration-500",
                isStreamMode ? "w-12 h-16" : "w-8 h-10"
              )} style={{ clipPath: 'polygon(50% 100%, 0 0, 100% 0)' }}>
                <div className="absolute top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white/40 rounded-full blur-[1px]"></div>
              </div>
            </motion.div>

            {/* Wheel Outer Ring with Lights */}
            <div className="relative w-full h-full rounded-full bg-slate-950 shadow-[0_0_100px_rgba(0,0,0,1)] p-3 md:p-6 ring-[10px] ring-slate-900 border-[2px] border-white/5">
              {/* Lights */}
              {Array.from({ length: 48 }).map((_, i) => {
                const angle = (i * 360) / 48;
                return (
                  <div
                    key={i}
                    className={cn(
                      "absolute w-1.5 h-1.5 md:w-3 md:h-3 rounded-full -ml-0.5 -mt-0.5 md:-ml-1.5 md:-mt-1.5 transition-colors duration-200",
                      isSpinning 
                        ? (i % 3 === 0 ? "bg-yellow-400 shadow-[0_0_15px_#facc15]" : i % 3 === 1 ? "bg-red-500 shadow-[0_0_15px_#ef4444]" : "bg-white shadow-[0_0_15px_#ffffff]")
                        : "bg-slate-800"
                    )}
                    style={{
                      top: `calc(50% + ${Math.sin(angle * Math.PI / 180) * 49}%)`,
                      left: `calc(50% + ${Math.cos(angle * Math.PI / 180) * 49}%)`,
                    }}
                  />
                );
              })}

              {/* Wheel Inner Container */}
              <div className="relative w-full h-full rounded-full overflow-hidden bg-slate-900 border-[4px] border-slate-800 shadow-inner">
                <motion.div 
                  id="f1-wheel"
                  className="w-full h-full rounded-full relative"
                  animate={{ rotate: rotation }}
                  transition={{ duration: 6, ease: [0.15, 0, 0.15, 1] }}
                  style={{ transformOrigin: 'center center' }}
                >
                {RACES.map((race, index) => {
                  const total = RACES.length;
                  const angle = 360 / total;
                  const rotationAngle = index * angle;
                  
                  const isSelected = selectedRaces.some(r => r.id === race.id);
                  const isEven = index % 2 === 0;
                  
                  let bgColor = isEven ? '#1e293b' : '#0f172a'; // slate-800 / slate-950
                  let textColor = isEven ? '#f8fafc' : '#ef4444'; // slate-50 / red-500
                  
                  if (isSelected) {
                    bgColor = '#064e3b'; // emerald-900
                    textColor = '#10b981'; // emerald-500
                  }

                  // Calculate clip path for the slice
                  const halfAngleRad = (angle / 2) * (Math.PI / 180);
                  const tanVal = Math.tan(halfAngleRad);
                  const xOffset = 50 * tanVal;
                  const clipPath = `polygon(50% 50%, ${50 - xOffset}% 0, ${50 + xOffset}% 0)`;

                  return (
                    <div 
                      key={race.id}
                      className="absolute top-0 left-0 w-full h-full"
                      style={{
                        transform: `rotate(${rotationAngle}deg)`,
                        clipPath: clipPath,
                        backgroundColor: bgColor,
                        transition: 'background-color 0.5s ease'
                      }}
                    >
                      {/* Text Container */}
                      <div 
                        className="absolute top-0 left-0 w-full h-1/2 flex flex-col items-center justify-start gap-3"
                        style={{ paddingTop: '20px' }}
                      >
                        <img 
                          src={`https://flagcdn.com/w40/${race.flagCode}.png`}
                          alt={race.short}
                          className={cn(
                            "h-auto rounded-sm shadow-md transition-all duration-500",
                            isStreamMode ? "w-12" : "w-8",
                            isSelected && "grayscale opacity-30"
                          )}
                          referrerPolicy="no-referrer"
                        />
                        <span 
                          className={cn(
                            "font-black italic uppercase tracking-tighter transition-all duration-500",
                            isStreamMode ? "text-[16px] md:text-[20px]" : "text-[12px] md:text-[15px]"
                          )}
                          style={{ 
                            color: textColor,
                            writingMode: 'vertical-rl',
                            transform: 'rotate(180deg)',
                            whiteSpace: 'nowrap',
                            maxHeight: 'calc(100% - 60px)',
                            overflow: 'visible',
                            textShadow: isSelected ? 'none' : '0 1px 3px rgba(0,0,0,0.8)'
                          }}
                        >
                          {race.short}
                        </span>
                      </div>
                      {/* Divider line */}
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-full bg-white/5 origin-center"></div>
                    </div>
                  );
                })}
              </motion.div>
            </div>

            {/* Center Hub */}
            <button
              onClick={spinWheel}
              disabled={isSpinning || isComplete}
              className={cn(
                "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-br from-slate-800 to-slate-950 rounded-full border-[8px] border-slate-950 z-10 flex items-center justify-center shadow-[0_0_40px_rgba(0,0,0,0.9)] transition-all duration-500 group overflow-hidden cursor-pointer disabled:cursor-not-allowed",
                isStreamMode ? "w-32 h-32 md:w-48 md:h-48" : "w-24 h-24 md:w-32 md:h-32",
                isSpinning ? "scale-95" : "hover:scale-105"
              )}
            >
              {/* Inner metallic ring */}
              <div className="w-full h-full rounded-full border-2 border-slate-700/50 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(255,255,255,0.1),transparent)] group-hover:animate-[spin_2s_linear_infinite] transition-all"></div>
                <div className={cn(
                  "rounded-full transition-all duration-300 z-10 flex flex-col items-center justify-center",
                  isStreamMode ? "w-20 h-20 md:w-28 md:h-28" : "w-16 h-16 md:w-20 md:h-20",
                  isSpinning ? "bg-red-500 shadow-[0_0_25px_rgba(239,68,68,0.8)]" : "bg-red-600 group-hover:bg-red-500 shadow-inner group-hover:shadow-[0_0_20px_rgba(239,68,68,0.5)]"
                )}>
                  <span className={cn(
                    "text-white font-black italic tracking-wider uppercase",
                    isStreamMode ? "text-lg md:text-2xl" : "text-sm md:text-base",
                    isSpinning ? "animate-pulse" : ""
                  )}>
                    {isSpinning ? "..." : "Girar"}
                  </span>
                </div>
              </div>
            </button>
            </div>
          </div>

          {/* Winner Overlay - Full-screen Horizontal Banner */}
          <AnimatePresence>
            {showWinner && winningRace && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-xl"
              >
                <motion.div 
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: "100%", opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  className="bg-gradient-to-r from-red-600 via-red-700 to-red-900 h-40 md:h-56 border-y-4 border-white/20 shadow-[0_0_100px_rgba(220,38,38,0.8)] flex items-center justify-center gap-6 md:gap-16 px-6 md:px-20 relative overflow-hidden transform -skew-x-6"
                >
                  <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] bg-[length:250%_250%] animate-[shimmer_2s_infinite]"></div>
                  
                  <motion.div
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", delay: 0.3 }}
                    className="shrink-0"
                  >
                    <img 
                      src={`https://flagcdn.com/w320/${winningRace.flagCode}.png`}
                      alt={winningRace.short}
                      className="h-16 md:h-32 w-auto rounded-lg shadow-2xl border-2 border-white/30"
                    />
                  </motion.div>
 
                  <motion.div
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex flex-col items-start"
                  >
                    <span className="text-red-200 font-mono text-xs md:text-sm uppercase tracking-[0.5em] mb-2">¡NUEVO GP CONFIRMADO!</span>
                    <h3 className="text-white font-black italic text-4xl md:text-8xl uppercase tracking-tighter drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]">
                      {winningRace.name}
                    </h3>
                  </motion.div>

                  {/* Decorative Sparkles */}
                  <div className="absolute top-4 right-10 opacity-30">
                    <Sparkles size={40} className="text-white animate-pulse" />
                  </div>
                  <div className="absolute bottom-4 left-10 opacity-30">
                    <Sparkles size={40} className="text-white animate-pulse" />
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className={cn(
            "flex flex-col items-center gap-4 w-full transition-all duration-500",
            isStreamMode ? "mt-16" : "mt-8"
          )}>
            <div className="flex gap-3">
              {selectedRaces.length > 0 && (
                <button
                  onClick={resetDraw}
                  disabled={isSpinning}
                  className={cn(
                    "rounded-xl font-bold uppercase tracking-widest transition-all transform -skew-x-12 bg-slate-800/80 backdrop-blur-sm text-slate-300 hover:bg-slate-700 hover:text-white flex items-center gap-2 disabled:opacity-50 border border-white/5 hover:border-white/20",
                    isStreamMode ? "px-10 py-6 text-base" : "px-8 py-4 text-sm"
                  )}
                >
                  <span className="transform skew-x-12 flex items-center gap-2">
                    <RotateCcw size={18} />
                    Reiniciar
                  </span>
                </button>
              )}
            </div>
            
            <div className="flex items-center gap-6 px-6 py-3 bg-slate-900/40 backdrop-blur-md rounded-xl border border-white/5">
              <div className="flex flex-col items-center">
                <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-0.5">Seleccionadas</span>
                <span className="text-xl font-black italic text-white">{selectedRaces.length} / {TARGET_RACES_COUNT}</span>
              </div>
              <div className="w-[1px] h-6 bg-white/10"></div>
              <div className="flex flex-col items-center">
                <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-0.5">Restantes</span>
                <span className="text-xl font-black italic text-red-500">{RACES.length - selectedRaces.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Selected Races Grid (Smaller) */}
        <div className={cn(
          "flex flex-col gap-4 transition-all duration-500",
          isStreamMode ? "order-3 w-full max-w-4xl mt-8" : "order-4 lg:order-3 h-full max-h-[calc(100vh-8rem)]"
        )}>
          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl flex flex-col h-full min-h-0">
            <div className="flex items-center gap-3 mb-4 border-b border-white/10 pb-3 shrink-0">
              <CalendarIcon className="text-red-500" size={18} />
              <h3 className="text-lg font-black italic uppercase tracking-wider text-white">Calendario 2026</h3>
            </div>

            <div className={cn(
              "grid gap-1.5 overflow-y-auto pr-2 custom-scrollbar flex-1",
              isStreamMode ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4" : "grid-cols-1"
            )}>
              {Array.from({ length: TARGET_RACES_COUNT }).map((_, i) => {
                const race = selectedRaces[i];
                return (
                  <motion.div 
                    key={i}
                    initial={race ? { opacity: 0, x: 10 } : false}
                    animate={race ? { opacity: 1, x: 0 } : false}
                    className={cn(
                      "flex items-center gap-2.5 p-2.5 rounded-xl border transition-all h-[56px] relative overflow-hidden group shrink-0",
                      race 
                        ? "bg-gradient-to-r from-slate-800 to-slate-800/40 border-slate-600 shadow-md" 
                        : "bg-slate-950/30 border-white/5 border-dashed"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center font-black italic text-sm shrink-0",
                      race ? "bg-red-600 text-white shadow-lg" : "bg-slate-900 text-slate-700"
                    )}>
                      <span className="leading-none">{i + 1}</span>
                    </div>
                    
                    <div className="flex-1 min-w-0 flex items-center gap-2.5">
                      {race ? (
                        <>
                          <img 
                            src={`https://flagcdn.com/w20/${race.flagCode}.png`}
                            alt={race.short}
                            className="w-5 h-auto rounded-xs shadow-sm"
                          />
                          <span className="font-bold text-slate-100 uppercase tracking-tight truncate text-[13px]">
                            {race.short}
                          </span>
                        </>
                      ) : (
                        <span className="font-mono text-[9px] text-slate-500 uppercase tracking-widest flex items-center gap-1">
                          <span className="animate-pulse">Pendiente</span>
                          <span className="flex gap-[2px]">
                            <span className="w-1 h-1 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                            <span className="w-1 h-1 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                            <span className="w-1 h-1 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                          </span>
                        </span>
                      )}
                    </div>
                    {race && <Check className="text-emerald-500 shrink-0" size={12} />}
                  </motion.div>
                );
              })}
            </div>

            {isComplete && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-3 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center shrink-0"
              >
                <p className="text-emerald-400 font-black italic uppercase tracking-widest text-[9px] flex items-center justify-center gap-2">
                  <Trophy size={12} />
                  ¡Calendario Listo!
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
