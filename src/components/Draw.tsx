import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw, Check, Calendar as CalendarIcon, Sparkles, Maximize, Minimize, Info, ChevronUp, Play, List, LayoutGrid } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { useChampionship } from '../context/ChampionshipContext';
import { dataService } from '../services/dataService';
import { Race } from '../types';
import { CIRCUITS } from '../data/circuits';

// Transformamos CIRCUITS en las opciones para la ruleta con lógica de etiquetas
const WHEEL_OPTIONS = Object.values(CIRCUITS).map((circuit, _, all) => {
  const countryCount = all.filter(c => c.country === circuit.country).length;
  let label = circuit.country;
  
  // Excepciones por longitud de nombre en la ruleta
  if (circuit.id === 'saudi-arabia') label = 'Jeddah';
  else if (circuit.id === 'abu-dhabi') label = 'Abu Dabi';
  else if (countryCount > 1) {
    // Lógica de diferenciación para países con múltiples circuitos
    if (circuit.id === 'emilia-romagna') label = 'Imola';
    else if (circuit.id === 'italy') label = 'Monza';
    else if (circuit.id === 'miami') label = 'Miami';
    else if (circuit.id === 'usa') label = 'Austin';
    else if (circuit.id === 'las-vegas') label = 'Las Vegas';
    else label = circuit.aliases?.[0] || circuit.name;
  }
  
  return {
    ...circuit,
    label
  };
});

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
  const { data, activeSeason, setData, isHistorical } = useChampionship();
  const containerRef = useRef<HTMLDivElement>(null);
  const confettiCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedRaces, setSelectedRaces] = useState<typeof WHEEL_OPTIONS>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [winningRace, setWinningRace] = useState<typeof WHEEL_OPTIONS[0] | null>(null);
  const [showWinner, setShowWinner] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [hasPromptedSave, setHasPromptedSave] = useState(false);

  const [pointerDeg, setPointerDeg] = useState(0);
  const pointerIsKicking = useRef(false);
  const pointerResetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Tracks wheel angle between spins for crossing detection
  const prevWheelAngleRef = useRef(0);
  // Stores target rotation so the effect closure always has the latest value
  const targetRotationRef = useRef(0);
  const [showInfo, setShowInfo] = useState(true);
  const [lastSelectedRace, setLastSelectedRace] = useState<string | null>(null);
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

    const SLICE = 360 / WHEEL_OPTIONS.length;
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

    const unselected = WHEEL_OPTIONS.filter(r => !selectedRaces.find(sr => sr.id === r.id));
    if (unselected.length === 0) {
      setIsSpinning(false);
      return;
    }

    const winner = unselected[Math.floor(Math.random() * unselected.length)];
    setLastSelectedRace(winner.id);
    const winnerIndex = WHEEL_OPTIONS.findIndex(r => r.id === winner.id);

    const sliceAngle = 360 / WHEEL_OPTIONS.length;
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
    // Removed automatic save prompt
  }, [isComplete, isAdmin, hasPromptedSave]);

  const handleSaveCalendar = async () => {
    const newRaces: Race[] = selectedRaces.map((race, index) => {
      return {
        id: `race-${index + 1}`,
        name: `GP de ${race.label}`,
        circuit: race.name,
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
      
      // Redirect to calendar tab to start configuring dates
      // We need to trigger this in the parent App component
      window.dispatchEvent(new CustomEvent('switch-tab', { detail: 'calendar' }));
    } catch (err) {
      console.error("Failed to save drawn races", err);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFs = !!document.fullscreenElement;
      setIsFullscreen(isFs);
      if (isFs) setShowInfo(false);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div 
      ref={containerRef} 
      className={cn(
        "relative min-h-screen overflow-hidden bg-slate-950 flex flex-col",
        isFullscreen ? "fixed inset-0 z-[200] rounded-none m-0 w-screen h-screen" : "rounded-3xl -mx-4 md:mx-0 min-h-[calc(100vh-12rem)]"
      )}
    >
      <canvas 
        ref={confettiCanvasRef}
        className="fixed inset-0 pointer-events-none z-[150] w-full h-full"
      />
      <div className="fixed inset-0 pointer-events-none z-0">
        <ParticlesCanvas />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/20 via-transparent to-slate-950/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/20 via-transparent to-slate-950/20" />
      </div>
      
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
      </div>

      <div className={cn(
        "relative z-10 flex flex-col gap-4 p-2 md:p-6 w-full mx-auto h-full transition-all duration-500",
        isFullscreen 
          ? "lg:grid lg:grid-cols-[350px_1fr_350px] 2xl:grid-cols-[450px_1fr_450px] lg:gap-8" 
          : "lg:grid lg:grid-cols-[auto_1fr_auto] gap-4",
        isFullscreen && "max-h-screen overflow-hidden pt-4 pb-12"
      )}>
        
        {/* Left Side: Instructions & Full List */}
        <div className={cn(
          "gap-4 transition-all duration-500 flex flex-col order-2 lg:order-1 h-full max-h-[calc(100vh-8rem)]",
          isFullscreen ? "w-full" : "lg:w-[280px]"
        )}>
          {/* Compact Instructions */}
          {showInfo ? (
            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl shrink-0 flex flex-col gap-3 h-fit relative transition-all duration-500 w-full">
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
                  <p className="text-[11px] text-slate-300 font-medium leading-relaxed">Se elegirán <strong>{TARGET_RACES_COUNT} Grandes Premios</strong> de entre los {WHEEL_OPTIONS.length} circuitos de la temporada 2026.</p>
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
              className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-full w-12 h-12 flex items-center justify-center shadow-2xl shrink-0 text-red-500 hover:bg-slate-800 transition-colors relative"
              title="Ver Información"
            >
              <Info size={24} />
              <motion.div 
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 rounded-full border-2 border-red-500"
              />
            </button>
          )}

          <div className={cn(
            "bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl flex flex-col min-h-0 transition-all duration-500 flex-1 overflow-hidden w-full",
            isFullscreen && "2xl:p-8"
          )}>
            <div className="flex items-center justify-between mb-4 shrink-0">
              <h3 className={cn(
                "font-black italic uppercase tracking-wider text-white transition-all",
                isFullscreen ? "text-xl 2xl:text-2xl" : "text-lg"
              )}>Circuitos ({WHEEL_OPTIONS.length})</h3>
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
                poolViewMode === 'grid' ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-2" : "grid-cols-1"
              )}>
                {WHEEL_OPTIONS.map(race => {
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
                        alt={race.label}
                        className={cn(
                          "h-auto rounded-xs grayscale-[0.5] transition-all",
                          isFullscreen ? "w-7 2xl:w-10" : "w-4"
                        )}
                      />
                      <span className="truncate">{race.label}</span>
                      {isSelected && <Check size={isFullscreen ? 16 : 10} className="ml-auto" />}
                    </div>
                  );
                })}
              </div>
              {/* Scroll Indicator Gradient & Hint - Only show if content overflows */}
              <div className="absolute bottom-0 left-0 right-2 h-12 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent pointer-events-none rounded-b-xl flex items-end justify-center pb-1 opacity-0 group-hover/scroll:opacity-100 transition-opacity overflow-hidden">
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Scroll</span>
                  <ChevronUp className="text-slate-500 rotate-180" size={10} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Center: The Big Wheel */}
        <div className="flex flex-col items-center justify-center relative px-4 transition-all duration-500 order-1 lg:order-2">
          <div className="text-center mb-4 relative">
            <h2 className={cn(
              "font-black italic uppercase tracking-tighter text-white leading-none drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)] transition-all duration-500",
              isFullscreen ? "text-4xl md:text-6xl lg:text-7xl 2xl:text-8xl" : "text-4xl md:text-6xl lg:text-7xl"
            )}>
              <span className={cn(
                "block font-black tracking-[0.5em] text-red-500/80 uppercase mb-1 transition-all",
                isFullscreen ? "text-xs 2xl:text-base" : "text-[11px]"
              )}>F1 WORLD TOUR 2026</span>
              <span className="block font-black italic uppercase tracking-tighter text-white leading-none">LA RULETA</span>
            </h2>
          </div>

          <div className={cn(
            "relative w-full aspect-square flex items-center justify-center transition-all duration-500",
            isFullscreen ? "max-w-[min(780px,68vh)]" : "max-w-[min(850px,75vh)]"
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
              className="absolute top-0 left-1/2 -translate-x-1/2 z-20 transition-all duration-500 -translate-y-2"
            >
              <div className="absolute inset-0 bg-white opacity-30 transform scale-110" style={{ clipPath: 'polygon(50% 100%, 0 0, 100% 0)' }}></div>
              <div className="bg-gradient-to-b from-red-400 to-red-600 relative transition-all duration-500 w-8 h-10" style={{ clipPath: 'polygon(50% 100%, 0 0, 100% 0)' }}>
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
                {WHEEL_OPTIONS.map((race, index) => {
                  const total = WHEEL_OPTIONS.length;
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
                          alt={race.label}
                          className={cn(
                            "h-auto rounded-sm shadow-md transition-all duration-500",
                            isFullscreen ? "w-12 2xl:w-16" : "w-8",
                            isSelected && "grayscale opacity-30"
                          )}
                          referrerPolicy="no-referrer"
                        />
                        <span 
                          className={cn(
                            "font-black italic uppercase tracking-tighter transition-all duration-500",
                            isFullscreen ? "text-[14px] md:text-[18px] 2xl:text-[22px]" : "text-[11px] md:text-[14px]"
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
                          {race.label}
                        </span>
                      </div>
                      {/* Divider line */}
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-full bg-white/5 origin-center"></div>
                    </div>
                  );
                })}
                
                {/* Pegs (Pitotes) */}
                {WHEEL_OPTIONS.map((_, index) => {
                  const angle = 360 / WHEEL_OPTIONS.length;
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
                "w-24 h-24 md:w-32 md:h-32 2xl:w-44 2xl:h-44"
              )}
            >
              {/* Inner metallic ring */}
              <div className="w-full h-full rounded-full border-2 border-slate-700/50 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent,rgba(255,255,255,0.1),transparent)] group-hover:animate-[spin_2s_linear_infinite] transition-all"></div>
                <div className={cn(
                  "rounded-full transition-all duration-300 z-10 flex flex-col items-center justify-center",
                  "w-16 h-16 md:w-20 md:h-20 2xl:w-32 2xl:h-32",
                  isSpinning ? "bg-red-500 shadow-[0_0_25px_rgba(239,68,68,0.8)]" : "bg-red-600 group-hover:bg-red-500 shadow-inner group-hover:shadow-[0_0_20px_rgba(239,68,68,0.5)]"
                )}>
                  <span className={cn(
                    "text-white flex items-center justify-center transition-all",
                    isFullscreen ? "scale-150 2xl:scale-[2.2]" : "scale-125",
                    isSpinning ? "animate-pulse" : ""
                  )}>
                    {isSpinning ? <span className="font-black italic uppercase tracking-widest">...</span> : <Play fill="currentColor" className="ml-1" />}
                  </span>
                </div>
              </div>
            </motion.button>
            </div>
          </div>

          {/* Winner Overlay - Full-screen Cinematic Result */}
          <AnimatePresence>
            {showWinner && winningRace && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-2xl p-4"
              >
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="relative w-full max-w-5xl flex flex-col items-center"
                >
                  {/* Background Glow */}
                  <div className={cn(
                    "absolute inset-0 blur-[150px] opacity-20 rounded-full transition-colors duration-1000",
                    isHistorical ? "bg-amber-500" : "bg-red-600"
                  )} />

                  {/* Header: Country & Name */}
                  <div className="text-center mb-8 md:mb-12 relative z-10">
                    <motion.div
                      initial={{ y: -20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="flex items-center justify-center gap-4 mb-2"
                    >
                      <img 
                        src={`https://flagcdn.com/w80/${winningRace.flagCode}.png`}
                        alt={winningRace.country}
                        className="h-8 md:h-12 w-auto rounded shadow-lg border border-white/10"
                      />
                      <h2 className={cn(
                        "font-black italic uppercase tracking-tighter text-white leading-none",
                        isFullscreen ? "text-6xl md:text-8xl 2xl:text-9xl" : "text-5xl md:text-7xl"
                      )}>
                        {winningRace.country}
                      </h2>
                    </motion.div>
                    <motion.p
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className={cn(
                        "font-bold uppercase tracking-[0.3em] text-slate-400",
                        isFullscreen ? "text-lg 2xl:text-2xl" : "text-sm md:text-base"
                      )}
                    >
                      {winningRace.name}
                    </motion.p>
                  </div>

                  {/* Circuit Layout SVG with Neon Effect */}
                  <div className={cn(
                    "relative flex items-center justify-center z-10 w-full",
                    isFullscreen ? "h-[300px] md:h-[450px] 2xl:h-[550px]" : "h-[250px] md:h-[350px]"
                  )}>
                    <svg 
                      viewBox={winningRace.viewBox || "0 0 500 500"} 
                      className="w-full h-full"
                      style={{ 
                        filter: isHistorical 
                          ? 'drop-shadow(0 0 15px rgba(245, 158, 11, 0.8)) drop-shadow(0 0 30px rgba(245, 158, 11, 0.4))'
                          : 'drop-shadow(0 0 15px rgba(220, 38, 38, 0.8)) drop-shadow(0 0 30px rgba(220, 38, 38, 0.4))'
                      }}
                    >
                      <defs>
                        <linearGradient id="circuitGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor={isHistorical ? "#f59e0b" : "#ef4444"} />
                          <stop offset="100%" stopColor={isHistorical ? "#fbbf24" : "#b91c1c"} />
                        </linearGradient>
                      </defs>
                      
                      {winningRace.svgPath2 ? (
                        winningRace.svgPath2.map((path, idx) => (
                          <motion.path
                            key={idx}
                            d={path}
                            fill="none"
                            stroke="url(#circuitGradient)"
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            transition={{ duration: 2, ease: "easeInOut", delay: 0.7 }}
                          />
                        ))
                      ) : winningRace.svgPath ? (
                        <motion.path
                          d={winningRace.svgPath}
                          fill="none"
                          stroke="url(#circuitGradient)"
                          strokeWidth="8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          initial={{ pathLength: 0, opacity: 0 }}
                          animate={{ pathLength: 1, opacity: 1 }}
                          transition={{ duration: 2, ease: "easeInOut", delay: 0.7 }}
                        />
                      ) : null}
                    </svg>

                    {/* Decorative Sparkles */}
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute -top-10 -right-10"
                    >
                      <Sparkles size={48} className={isHistorical ? "text-amber-400" : "text-red-500"} />
                    </motion.div>
                  </div>

                  {/* Confirm Button */}
                  <motion.button
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 2.5 }}
                    onClick={() => {
                      setShowWinner(false);
                      setWinningRace(null);
                    }}
                    className={cn(
                      "mt-12 px-12 py-4 rounded-full font-black italic uppercase tracking-widest transition-all relative group overflow-hidden z-10",
                      isHistorical 
                        ? "bg-amber-600 hover:bg-amber-500 text-black shadow-[0_0_30px_rgba(245,158,11,0.4)]" 
                        : "bg-red-600 hover:bg-red-500 text-white shadow-[0_0_30px_rgba(220,38,38,0.4)]"
                    )}
                  >
                    <span className="relative z-10">CONTINUAR</span>
                    <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
                  </motion.button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className={cn(
            "flex flex-col items-center gap-2 w-full transition-all duration-500",
            isFullscreen ? "mt-6" : "mt-8"
          )}>
            <div className={cn(
              "flex items-center gap-6 px-6 py-2 bg-slate-900/40 backdrop-blur-md rounded-xl border border-white/5 transition-all relative",
              isFullscreen && "scale-75 2xl:scale-90 origin-center"
            )}>
              {/* Repositioned Reset Button - Absolute to not shift layout */}
              {selectedRaces.length > 0 && (
                <div className="absolute -left-20 md:-left-32 top-1/2 -translate-y-1/2">
                  <button
                    onClick={resetDraw}
                    disabled={isSpinning}
                    className="p-3 rounded-xl bg-slate-800/80 backdrop-blur-sm text-slate-400 hover:bg-red-600 hover:text-white transition-all border border-white/5 shadow-xl disabled:opacity-50"
                    title="Reiniciar Sorteo"
                  >
                    <RotateCcw size={20} />
                  </button>
                </div>
              )}
              
              <div className="flex flex-col items-center">
                <span className={cn("text-slate-500 uppercase font-black tracking-widest mb-0.5", isFullscreen ? "text-[10px] 2xl:text-xs" : "text-[9px]")}>Seleccionadas</span>
                <span className={cn("font-black italic text-white transition-all", isFullscreen ? "text-2xl 2xl:text-4xl" : "text-xl")}>{selectedRaces.length} / {TARGET_RACES_COUNT}</span>
              </div>
              <div className="w-[1px] h-6 bg-white/10"></div>
              <div className="flex flex-col items-center">
                <span className={cn("text-slate-500 uppercase font-black tracking-widest mb-0.5", isFullscreen ? "text-[10px] 2xl:text-xs" : "text-[9px]")}>Restantes</span>
                <span className={cn("font-black italic text-red-500 transition-all", isFullscreen ? "text-2xl 2xl:text-4xl" : "text-xl")}>{WHEEL_OPTIONS.length - selectedRaces.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Selected Races Grid (Smaller) */}
        <div className={cn(
          "flex flex-col gap-4 transition-all duration-500 order-4 lg:order-3 h-full max-h-[calc(100vh-8rem)]",
          isFullscreen ? "w-full" : "lg:w-[320px]"
        )}>
          <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl flex flex-col h-full min-h-0">
            <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3 shrink-0">
              <div className="flex items-center gap-3">
                <CalendarIcon className="text-red-500" size={18} />
                <h3 className={cn(
                  "font-black italic uppercase tracking-wider text-white transition-all",
                  isFullscreen ? "text-2xl 2xl:text-3xl" : "text-lg"
                )}>Calendario 2026</h3>
              </div>
            </div>

            <div className={cn(
              "grid gap-2 overflow-y-auto pr-2 custom-scrollbar flex-1",
              "grid-cols-1"
            )}>
              {Array.from({ length: TARGET_RACES_COUNT }).map((_, i) => {
                const race = selectedRaces[i];
                return (
                  <motion.div 
                    key={i}
                    initial={race ? { opacity: 0, scale: 0.9 } : false}
                    animate={race ? { 
                      opacity: 1, 
                      scale: [1, 1.1, 1],
                      rotate: [0, -1, 1, 0],
                    } : false}
                    transition={{ 
                      scale: { type: "tween", duration: 0.4, ease: "easeInOut" },
                      rotate: { type: "tween", duration: 0.3, ease: "easeInOut" },
                    }}
                    className={cn(
                      "relative border rounded-xl p-2 flex items-center gap-3 transition-all duration-300 overflow-hidden",
                      race 
                        ? "bg-slate-900/80 border-red-600/50 shadow-lg" 
                        : "bg-slate-950/30 border-white/5"
                    )}
                  >
                    {race ? (
                      <>
                        <div className={cn(
                          "font-black italic text-white flex items-center justify-center shrink-0",
                          isFullscreen ? "text-xl w-8" : "text-lg w-6"
                        )}>
                          #{i + 1}
                        </div>
                        <img 
                          src={`https://flagcdn.com/w40/${race.flagCode}.png`}
                          alt={race.label}
                          className={cn("rounded shadow-sm", isFullscreen ? "w-8 h-6" : "w-7 h-5")}
                        />
                        <div className="flex flex-col min-w-0">
                          <span className={cn("font-black italic uppercase tracking-tight text-white truncate", isFullscreen ? "text-sm" : "text-xs")}>
                            {race.label}
                          </span>
                          <span className="text-[8px] text-red-500 font-bold uppercase tracking-widest">Confirmado</span>
                        </div>
                        <Check className="ml-auto text-emerald-500 shrink-0" size={12} />
                      </>
                    ) : (
                      <div className="flex items-center gap-3 w-full opacity-40">
                        <div className={cn(
                          "font-black text-slate-700 flex items-center justify-center shrink-0",
                          isFullscreen ? "text-xl w-8" : "text-lg w-6"
                        )}>
                          #{i + 1}
                        </div>
                        <div className="w-7 h-5 bg-slate-800 rounded" />
                        <span className="text-slate-700 font-black uppercase tracking-wider text-[10px]">Pendiente</span>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {isComplete && (
              <div className="mt-6 pt-6 border-t border-white/10 flex flex-col gap-3">
                <button 
                  onClick={() => setShowSaveModal(true)}
                  className="w-full py-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black italic uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:shadow-[0_0_30px_rgba(220,38,38,0.6)]"
                >
                  GUARDAR CALENDARIO 2026
                </button>
                <button 
                  onClick={resetDraw}
                  className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold uppercase tracking-widest transition-all"
                >
                  Reiniciar Sorteo
                </button>
              </div>
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
                Como administrador, puedes <strong>persistir</strong> este nuevo calendario en la base de datos. 
                <br /><br />
                <span className="text-red-400 font-bold">Nota:</span> Una vez guardado, deberás ir a la sección de <strong>Administración de Circuitos</strong> para asignar las fechas correctas en el orden establecido.
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
