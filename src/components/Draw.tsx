import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw, Check, Calendar as CalendarIcon, Sparkles, Maximize, Minimize, Info, MonitorPlay, LayoutDashboard, ChevronUp, Play, List, LayoutGrid } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { useChampionship } from '../context/ChampionshipContext';
import { dataService } from '../services/dataService';
import { Race } from '../types';

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

const ParticlesCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: -Math.random() * 1.5 - 0.5,
      size: Math.random() * 3 + 1,
      opacity: Math.random() * 0.6 + 0.2,
      color: Math.random() > 0.5 ? '#ef4444' : '#ffffff',
    }));

    let animId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw background gradient
      const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height)
      );
      gradient.addColorStop(0, 'rgba(127, 29, 29, 0.1)'); // red-900/10
      gradient.addColorStop(1, 'rgba(2, 6, 23, 1)'); // slate-950
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw grid
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      const gridSize = 64; // 4rem
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
      }
      ctx.restore();

      // Draw particles
      particles.forEach(p => {
        p.y += p.vy; p.x += p.vx;
        if (p.y < -10) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width; }
        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.shadowBlur = p.size * 3;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
      animId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" />;
};

export function Draw() {
  const { isAdmin } = useAuth();
  const { data, activeSeason, setData } = useChampionship();
  const containerRef = useRef<HTMLDivElement>(null);
  const confettiCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedRaces, setSelectedRaces] = useState<typeof RACES>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [winningRace, setWinningRace] = useState<typeof RACES[0] | null>(null);
  const [showWinner, setShowWinner] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [hasPromptedSave, setHasPromptedSave] = useState(false);
  const [isStreamMode, setIsStreamMode] = useState(false);

  const [pointerDeg, setPointerDeg] = useState(0);
  const pointerIsKicking = useRef(false);
  const pointerResetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Tracks wheel angle between spins for crossing detection
  const prevWheelAngleRef = useRef(0);
  // Stores target rotation so the effect closure always has the latest value
  const targetRotationRef = useRef(0);
  const [showInfo, setShowInfo] = useState(true);
  const [poolViewMode, setPoolViewMode] = useState<'list' | 'grid'>('grid');

  const timeoutRefs = useRef<NodeJS.Timeout[]>([]);
  const animFrameRefs = useRef<number[]>([]);

  useEffect(() => {
    return () => {
      timeoutRefs.current.forEach(clearTimeout);
      animFrameRefs.current.forEach(cancelAnimationFrame);
    };
  }, []);

  // Pointer clicker: detecta cruces de segmento sobre el ángulo de rueda calculado
  // matemáticamente (no leyendo el DOM), y dispara un tick discreto por cada cruce.
  useEffect(() => {
    if (!isSpinning) {
      setPointerDeg(0);
      return;
    }

    const SLICE = 360 / RACES.length;
    const DURATION = 6000; // ms — debe coincidir con la duración de la transición de la rueda
    const startAng = prevWheelAngleRef.current;
    const totalDelta = targetRotationRef.current - startAng;
    const KICK_DEG = 35;        // grados de deflexión del pointer en cada tick
    const HOLD_MS = 110;        // ms que el pointer permanece desviado antes de volver

    let prevAng = startAng;
    let running = true;
    const t0 = performance.now();

    const tick = (now: number) => {
      if (!running) return;

      const elapsed = now - t0;
      const p = Math.min(elapsed / DURATION, 1);
      // Ease-out cúbico — aproxima la curva [0.15, 0, 0.15, 1] de la rueda
      const ep = 1 - Math.pow(1 - p, 3);
      const currentAng = startAng + totalDelta * ep;

      // Detectar cruce de borde de segmento (con offset para los pitotes)
      const offsetAng = currentAng + SLICE / 2;
      const prevOffsetAng = prevAng + SLICE / 2;
      const prevMod = ((prevOffsetAng % SLICE) + SLICE) % SLICE;
      const currMod = ((offsetAng % SLICE) + SLICE) % SLICE;
      const frameDelta = currentAng - prevAng;
      const crossed = (frameDelta > 0.05) && (prevMod > currMod || frameDelta >= SLICE);

      if (crossed && !pointerIsKicking.current) {
        // Cancelar reset pendiente si lo hay
        if (pointerResetTimer.current) clearTimeout(pointerResetTimer.current);
        pointerIsKicking.current = true;
        setPointerDeg(KICK_DEG);
        pointerResetTimer.current = setTimeout(() => {
          setPointerDeg(0);
          pointerIsKicking.current = false;
        }, HOLD_MS);
      }

      prevAng = currentAng;

      if (p < 1) {
        animFrameRefs.current.push(requestAnimationFrame(tick));
      }
    };

    animFrameRefs.current.push(requestAnimationFrame(tick));
    return () => {
      running = false;
      if (pointerResetTimer.current) clearTimeout(pointerResetTimer.current);
    };
  }, [isSpinning]);

  const fireConfetti = () => {
    if (!confettiCanvasRef.current) return;
    
    const myConfetti = confetti.create(confettiCanvasRef.current, {
      resize: true,
      useWorker: true
    });

    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      myConfetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.8 },
        colors: ['#ef4444', '#ffffff', '#000000'],
      });
      myConfetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.8 },
        colors: ['#ef4444', '#ffffff', '#000000'],
      });

      if (Date.now() < end) {
        const aId = requestAnimationFrame(frame);
        animFrameRefs.current.push(aId);
      }
    };
    const initialAId = requestAnimationFrame(frame);
    animFrameRefs.current.push(initialAId);
  };

  const spinWheel = () => {
    if (isSpinning || selectedRaces.length >= TARGET_RACES_COUNT) return;

    setIsSpinning(true);
    setShowWinner(false);
    animFrameRefs.current.forEach(cancelAnimationFrame);
    animFrameRefs.current = [];

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
    targetRotationRef.current = newRotation;
    prevWheelAngleRef.current = rotation;
    setRotation(newRotation);

    const tId1 = setTimeout(() => {
      setWinningRace(winner);
      setShowWinner(true);
      setIsSpinning(false);

      fireConfetti();

      const tId2 = setTimeout(() => {
        setSelectedRaces(prev => [...prev, winner]);
        setShowWinner(false);
      }, 4000);
      timeoutRefs.current.push(tId2);

    }, 6000);
    timeoutRefs.current.push(tId1);
  };

  const resetDraw = () => {
    animFrameRefs.current.forEach(cancelAnimationFrame);
    animFrameRefs.current = [];
    setSelectedRaces([]);
    setRotation(0);
    targetRotationRef.current = 0;
    prevWheelAngleRef.current = 0;
    setPointerDeg(0);
    pointerIsKicking.current = false;
    if (pointerResetTimer.current) clearTimeout(pointerResetTimer.current);
    setWinningRace(null);
    setShowWinner(false);
  };

  const isComplete = selectedRaces.length >= TARGET_RACES_COUNT;

  useEffect(() => {
    if (isComplete && isAdmin && !hasPromptedSave) {
      setShowSaveModal(true);
      setHasPromptedSave(true);
    }
  }, [isComplete, isAdmin, hasPromptedSave]);

  const handleSaveCalendar = async () => {
    const newRaces: Race[] = selectedRaces.map((race, index) => {
      return {
        id: `race-${index + 1}`,
        name: race.name,
        circuit: `Circuito de ${race.short}`,
        date: "", // Empty date, to be configured manually
        flagCode: race.flagCode,
        status: 'pending'
      };
    });

    const newData = {
      ...data,
      races: newRaces,
      isDrawActive: false
    };

    try {
      await dataService.saveData(newData, activeSeason);
      setData(newData);
      setShowSaveModal(false);
    } catch (err) {
      console.error("Failed to save drawn races", err);
    }
  };

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
      <canvas 
        ref={confettiCanvasRef}
        className="fixed inset-0 pointer-events-none z-[150] w-full h-full"
      />
      <ParticlesCanvas />
      
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
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(220,38,38,0.4)]">
                    <Info size={16} className="text-white" />
                  </div>
                  <strong className="text-white text-sm uppercase tracking-wider font-black italic">Reglas del Sorteo</strong>
                </div>
                <button 
                  onClick={() => setShowInfo(false)} 
                  className="text-slate-500 hover:text-white transition-colors p-1"
                  title="Ocultar Información"
                >
                  <ChevronUp size={16} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex gap-4 items-start group">
                  <div className="w-6 h-6 rounded-md bg-slate-800 border border-white/5 text-red-500 flex items-center justify-center shrink-0 text-xs font-black italic group-hover:bg-red-600 group-hover:text-white transition-colors">1</div>
                  <p className="text-[11px] text-slate-300 font-medium leading-relaxed">Se elegirán <strong>12 Grandes Premios</strong> de entre los 24 circuitos de la temporada 2025.</p>
                </div>
                <div className="flex gap-4 items-start group">
                  <div className="w-6 h-6 rounded-md bg-slate-800 border border-white/5 text-red-500 flex items-center justify-center shrink-0 text-xs font-black italic group-hover:bg-red-600 group-hover:text-white transition-colors">2</div>
                  <p className="text-[11px] text-slate-300 font-medium leading-relaxed">Los GP se celebrarán en <strong>orden de extracción</strong> de la ruleta.</p>
                </div>
                <div className="flex gap-4 items-start group">
                  <div className="w-6 h-6 rounded-md bg-slate-800 border border-white/5 text-red-500 flex items-center justify-center shrink-0 text-xs font-black italic group-hover:bg-red-600 group-hover:text-white transition-colors">3</div>
                  <p className="text-[11px] text-slate-300 font-medium leading-relaxed">Los GP elegidos <strong>no se pueden repetir</strong>.</p>
                </div>
              </div>
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
            isStreamMode ? "h-[300px] flex-1 w-full" : "flex-1 overflow-hidden w-full",
            isFullscreen && "2xl:p-8"
          )}>
            <div className="flex items-center justify-between mb-4 shrink-0">
              <h3 className={cn(
                "font-black italic uppercase tracking-wider text-white transition-all",
                isFullscreen ? "text-xl 2xl:text-2xl" : "text-lg"
              )}>Circuitos</h3>
              <div className="flex bg-slate-800/50 rounded-lg p-1 border border-white/5">
                <button 
                  onClick={() => setPoolViewMode('list')}
                  className={cn(
                    "p-1.5 rounded-md transition-all",
                    poolViewMode === 'list' ? "bg-red-600 text-white shadow-lg" : "text-slate-500 hover:text-slate-300"
                  )}
                >
                  <List size={isFullscreen ? 18 : 14} />
                </button>
                <button 
                  onClick={() => setPoolViewMode('grid')}
                  className={cn(
                    "p-1.5 rounded-md transition-all",
                    poolViewMode === 'grid' ? "bg-red-600 text-white shadow-lg" : "text-slate-500 hover:text-slate-300"
                  )}
                >
                  <LayoutGrid size={isFullscreen ? 18 : 14} />
                </button>
              </div>
            </div>
            <div className="relative flex-1 min-h-0 group/scroll">
              <div className={cn(
                "grid gap-2 overflow-y-auto pr-2 h-full custom-scrollbar scroll-smooth",
                poolViewMode === 'grid' || isStreamMode ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-2" : "grid-cols-1"
              )}>
                {RACES.map(race => {
                  const isSelected = selectedRaces.some(r => r.id === race.id);
                  return (
                    <div 
                      key={race.id}
                      className={cn(
                        "flex items-center gap-3 p-2.5 rounded-xl border transition-all font-bold uppercase tracking-tight",
                        isFullscreen ? "text-xs 2xl:text-base py-3 px-4" : "text-[11px]",
                        isSelected 
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 opacity-50" 
                          : "bg-slate-800/50 border-white/5 text-slate-400 hover:bg-slate-800 hover:border-white/10"
                      )}
                    >
                      <img 
                        src={`https://flagcdn.com/w20/${race.flagCode}.png`}
                        alt={race.short}
                        className={cn(
                          "h-auto rounded-xs grayscale-[0.5] transition-all",
                          isFullscreen ? "w-7 2xl:w-9" : "w-4"
                        )}
                      />
                      <span className="truncate">{race.short}</span>
                      {isSelected && <Check size={isFullscreen ? 16 : 10} className="ml-auto" />}
                    </div>
                  );
                })}
              </div>
              {/* Scroll Indicator Gradient & Hint */}
              <div className="absolute bottom-0 left-0 right-2 h-12 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent pointer-events-none rounded-b-xl flex items-end justify-center pb-1 opacity-0 group-hover/scroll:opacity-100 transition-opacity">
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Scroll</span>
                  <ChevronUp className="text-slate-500 rotate-180" size={10} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Center: The Big Wheel */}
        <div className={cn(
          "flex flex-col items-center justify-center relative px-4 transition-all duration-500",
          isStreamMode ? "order-1 w-full max-w-5xl" : "order-1 lg:order-2"
        )}>
          <div className="text-center mb-4 relative">
            <h2 className={cn(
              "font-black italic uppercase tracking-tighter text-white leading-none drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)] transition-all duration-500",
              isStreamMode ? "text-5xl md:text-7xl lg:text-8xl" : "text-4xl md:text-6xl lg:text-7xl"
            )}>
              <span className="block text-[11px] font-black tracking-[0.5em] text-red-500/80 uppercase mb-1">F1 WORLD TOUR 2026</span>
              <span className="block font-black italic uppercase tracking-tighter text-white leading-none">LA RULETA</span>
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

            {/* Pointer */}
            <motion.div 
              style={{ rotate: pointerDeg }}
              animate={isSpinning ? { filter: ['drop-shadow(0 0 8px #ef4444)', 'drop-shadow(0 0 25px #ef4444)', 'drop-shadow(0 0 8px #ef4444)'] } : { filter: 'drop-shadow(0 0 20px rgba(220,38,38,0.9))' }}
              transition={{ 
                rotate: { type: 'spring', stiffness: 800, damping: 18, mass: 0.4 },
                filter: { duration: 0.3, repeat: Infinity }
              }}
              className={cn(
                "absolute top-0 left-1/2 -translate-x-1/2 z-20 transition-all duration-500",
                isStreamMode ? "-translate-y-6" : "-translate-y-2"
              )}
            >
              <div className="absolute inset-0 bg-white opacity-30 transform scale-110" style={{ clipPath: 'polygon(50% 100%, 0 0, 100% 0)' }}></div>
              <div className={cn(
                "bg-gradient-to-b from-red-400 to-red-600 relative transition-all duration-500",
                isStreamMode ? "w-10 h-12" : "w-8 h-10"
              )} style={{ clipPath: 'polygon(50% 100%, 0 0, 100% 0)' }}>
                <div className="absolute top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white/40 rounded-full blur-[1px]"></div>
              </div>
            </motion.div>

            {/* Wheel Outer Ring with Lights */}
            <div className="relative w-full h-full rounded-full bg-slate-950 shadow-[0_0_100px_rgba(0,0,0,1)] p-3 md:p-6">
              <div className="absolute -inset-[6px] rounded-full -z-10" style={{ background: 'conic-gradient(from 0deg, #C9A84C, #F0E68C, #C9A84C, #8B6914, #C9A84C)' }}></div>
              
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
                  
                  let bgColor = isEven ? '#1C1C1C' : '#0d0d0d'; // negro carbono / negro profundo
                  let textColor = isEven ? '#f8fafc' : '#ef4444'; // slate-50 / red-500
                  let containerOpacity = 1;
                  
                  if (isSelected) {
                    bgColor = '#064e3b'; // emerald-900
                    textColor = '#10b981'; // emerald-500
                    containerOpacity = 0.6;
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
                        opacity: containerOpacity,
                        transition: 'background-color 0.5s ease, opacity 0.5s ease'
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
                
                {/* Pegs (Pitotes) */}
                {RACES.map((_, index) => {
                  const angle = 360 / RACES.length;
                  const rotationAngle = index * angle + angle / 2;
                  return (
                    <div
                      key={`peg-${index}`}
                      className="absolute top-0 left-0 w-full h-full pointer-events-none z-20"
                      style={{ transform: `rotate(${rotationAngle}deg)` }}
                    >
                      <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 md:w-2 md:h-2 bg-gradient-to-b from-slate-200 to-slate-400 rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.8)] border border-slate-500" />
                    </div>
                  );
                })}
              </motion.div>
            </div>

            {/* Center Hub */}
            <motion.button
              onClick={spinWheel}
              disabled={isSpinning || isComplete}
              animate={(!isSpinning && !isComplete) ? { scale: [1, 1.03, 1] } : { scale: isSpinning ? 0.95 : 1 }}
              transition={(!isSpinning && !isComplete) ? { duration: 2, repeat: Infinity } : { duration: 0.5 }}
              style={{ x: "-50%", y: "-50%" }}
              className={cn(
                "absolute top-1/2 left-1/2 bg-gradient-to-br from-slate-800 to-slate-950 rounded-full border-[8px] border-slate-950 z-10 flex items-center justify-center shadow-[0_0_40px_rgba(0,0,0,0.9)] transition-all duration-500 group overflow-hidden cursor-pointer disabled:cursor-not-allowed",
                isStreamMode ? "w-32 h-32 md:w-48 md:h-48" : "w-24 h-24 md:w-32 md:h-32 2xl:w-44 2xl:h-44"
              )}
            >
              {/* Inner metallic ring */}
              <div className="w-full h-full rounded-full border-2 border-slate-700/50 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(255,255,255,0.1),transparent)] group-hover:animate-[spin_2s_linear_infinite] transition-all"></div>
                <div className={cn(
                  "rounded-full transition-all duration-300 z-10 flex flex-col items-center justify-center",
                  isStreamMode ? "w-20 h-20 md:w-28 md:h-28" : "w-16 h-16 md:w-20 md:h-20 2xl:w-32 2xl:h-32",
                  isSpinning ? "bg-red-500 shadow-[0_0_25px_rgba(239,68,68,0.8)]" : "bg-red-600 group-hover:bg-red-500 shadow-inner group-hover:shadow-[0_0_20px_rgba(239,68,68,0.5)]"
                )}>
                  <span className={cn(
                    "text-white flex items-center justify-center transition-all",
                    (isStreamMode || isFullscreen) ? "scale-150 2xl:scale-[2.2]" : "scale-125",
                    isSpinning ? "animate-pulse" : ""
                  )}>
                    {isSpinning ? <span className="font-black italic uppercase tracking-widest">...</span> : <Play fill="currentColor" className="ml-1" />}
                  </span>
                </div>
              </div>
            </motion.button>
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
                    className="shrink-0 relative"
                  >
                    <img 
                      src={`https://flagcdn.com/w320/${winningRace.flagCode}.png`}
                      alt={winningRace.short}
                      className="h-16 md:h-32 w-auto rounded-lg shadow-2xl border-2 border-white/30"
                    />
                    
                    {/* Passport Stamp */}
                    <motion.div
                      initial={{ scale: 5, opacity: 0, rotate: -45 }}
                      animate={{ scale: 1, opacity: 1, rotate: -12 }}
                      transition={{ type: "spring", damping: 10, stiffness: 180, delay: 0.9 }}
                      className="absolute -bottom-4 -right-4 md:-bottom-6 md:-right-6 z-20 pointer-events-none animate-stamp-land"
                    >
                      <div className="relative flex items-center justify-center w-28 h-28 md:w-36 md:h-36 2xl:w-48 2xl:h-48 rounded-full border-[4px] md:border-[8px] border-[#C9A84C] shadow-[0_15px_40px_rgba(0,0,0,0.7),0_0_30px_rgba(201,168,76,0.3)] bg-black/60 backdrop-blur-[6px]">
                        <div className="absolute inset-2 md:inset-3 rounded-full border-2 border-[#C9A84C]/30 border-dashed"></div>
                        <div className="absolute inset-0 opacity-40 rounded-full bg-[url('https://www.transparenttextures.com/patterns/noise.png')]" />
                        <div className="flex flex-col items-center justify-center transform -rotate-12 relative z-10">
                          <div className="px-3 py-0.5 bg-[#C9A84C] text-black font-black uppercase tracking-[0.3em] text-[8px] md:text-[10px] 2xl:text-xs mb-2 rounded-sm shadow-lg">OFFICIAL</div>
                          <span className="font-black uppercase tracking-widest text-[#F0E68C] text-2xl md:text-4xl 2xl:text-5xl leading-none drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)]">APPROVED</span>
                          <div className="mt-3 flex items-center gap-3">
                            <div className="h-[2px] w-6 bg-[#C9A84C]/40"></div>
                            <span className="font-mono text-[#C9A84C] text-xs md:text-lg 2xl:text-xl font-black tracking-[0.4em] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">2026</span>
                            <div className="h-[2px] w-6 bg-[#C9A84C]/40"></div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
 
                  <motion.div
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex flex-col items-start"
                  >
                    <span className="text-red-200 font-mono text-sm md:text-base font-bold uppercase tracking-[0.5em] mb-2">¡NUEVO GP CONFIRMADO!</span>
                    <h3 className={cn(
                      "text-white font-black italic uppercase tracking-tighter drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] transition-all",
                      isFullscreen ? "text-5xl md:text-8xl 2xl:text-9xl" : "text-4xl md:text-8xl"
                    )}>
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
            
            <div className={cn(
              "flex items-center gap-6 px-6 py-3 bg-slate-900/40 backdrop-blur-md rounded-xl border border-white/5 transition-all",
              isFullscreen && "2xl:px-10 2xl:py-5 2xl:gap-10"
            )}>
              <div className="flex flex-col items-center">
                <span className={cn("text-slate-500 uppercase font-black tracking-widest mb-0.5", isFullscreen ? "text-[10px] 2xl:text-xs" : "text-[9px]")}>Seleccionadas</span>
                <span className={cn("font-black italic text-white transition-all", isFullscreen ? "text-2xl 2xl:text-4xl" : "text-xl")}>{selectedRaces.length} / {TARGET_RACES_COUNT}</span>
              </div>
              <div className="w-[1px] h-6 bg-white/10"></div>
              <div className="flex flex-col items-center">
                <span className={cn("text-slate-500 uppercase font-black tracking-widest mb-0.5", isFullscreen ? "text-[10px] 2xl:text-xs" : "text-[9px]")}>Restantes</span>
                <span className={cn("font-black italic text-red-500 transition-all", isFullscreen ? "text-2xl 2xl:text-4xl" : "text-xl")}>{RACES.length - selectedRaces.length}</span>
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
                      "w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm shrink-0",
                      race ? "bg-red-600 text-white shadow-lg" : "bg-slate-900 text-slate-700"
                    )}>
                      <span className="leading-none translate-y-[1px]">{i + 1}</span>
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
                        <span className="font-bold text-[11px] text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-600 animate-pulse shrink-0" />
                          <span>Pendiente</span>
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

      {/* Save Modal for Admins */}
      <AnimatePresence>
        {showSaveModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-slate-900 border border-white/10 p-6 md:p-8 rounded-2xl max-w-md w-full text-center shadow-2xl"
            >
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/30">
                <CalendarIcon className="text-red-500" size={32} />
              </div>
              <h3 className="text-2xl font-black italic text-white mb-3 uppercase tracking-tighter">¡Sorteo Completado!</h3>
              <p className="text-slate-400 mb-8 text-sm leading-relaxed">
                Como administrador, ¿quieres guardar este nuevo calendario en la base de datos? Las fechas quedarán pendientes de configurar manualmente.
              </p>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={handleSaveCalendar} 
                  className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold uppercase tracking-widest transition-colors shadow-lg shadow-red-900/20"
                >
                  Guardar Calendario
                </button>
                <button 
                  onClick={() => setShowSaveModal(false)} 
                  className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold uppercase tracking-widest transition-colors"
                >
                  Cancelar (Solo Prueba)
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
