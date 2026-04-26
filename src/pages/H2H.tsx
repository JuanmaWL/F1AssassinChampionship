import { useState, useMemo, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useChampionship } from '../context/ChampionshipContext';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Swords, ChevronDown, Activity, Flag, Medal, Users, Target, TrendingUp, Crosshair, Calendar, Timer, Flame, AlertTriangle, Zap, ZapOff, X, Maximize2, Minimize2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { Driver, Race, Constructor } from '../types';
import { F1CarAnimation } from '../components/dashboard/F1CarAnimation';
import { TEXTURE_ASSETS } from '../constants/assets';

import { EmptyState } from '../components/ui/EmptyState';
import { SPEED_LINE_CYCLE_DURATION } from '../constants/config';

// --- Custom Components ---

const SpeedLines = ({ color, flip = false }: { color: string, flip?: boolean }) => {
  const lines = useMemo(() => {
    return [...Array(8)].map(() => ({
      top: `${10 + Math.random() * 80}%`,
      width: `${30 + Math.random() * 60}px`,
      duration: 0.4 + Math.random() * (SPEED_LINE_CYCLE_DURATION / 1000),
      delay: Math.random() * 2
    }));
  }, []);

  return (
    <div className={cn("absolute inset-0 pointer-events-none overflow-hidden z-0", flip ? "scale-x-[-1]" : "")}>
      {lines.map((line, i) => (
        <motion.div
          key={i}
          className="absolute h-[2px] rounded-full"
          style={{
            backgroundColor: color,
            top: line.top,
            left: '100%',
            width: line.width,
            boxShadow: `0 0 10px ${color}, 0 0 20px ${color}`
          }}
          animate={{
            left: ['100%', '-50%'],
            opacity: [0, 1, 0]
          }}
          transition={{
            duration: line.duration,
            repeat: Infinity,
            delay: line.delay,
            ease: "linear"
          }}
        />
      ))}
    </div>
  );
};

// --- Custom Dropdown Components ---

function DriverDropdown({ 
  value, 
  onChange, 
  drivers, 
  constructors,
  disabledId,
  align = 'left' 
}: { 
  value: string, 
  onChange: (id: string) => void, 
  drivers: Driver[], 
  constructors: Constructor[],
  disabledId?: string,
  align?: 'left' | 'right' 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [sortMode, setSortMode] = useState<'alpha' | 'team'>('alpha');
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selected = drivers.find(d => d.id === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const sortedDrivers = useMemo(() => {
    let filtered = drivers.filter(d => 
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      d.team.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return filtered.sort((a, b) => {
      if (sortMode === 'team') {
        const teamCompare = a.team.localeCompare(b.team);
        if (teamCompare !== 0) return teamCompare;
      }
      return a.name.localeCompare(b.name);
    });
  }, [drivers, sortMode, searchTerm]);

  return (
    <div 
      className="relative w-full" 
      ref={dropdownRef}
      role="listbox"
      aria-expanded={isOpen}
      aria-label="Seleccionar piloto"
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') setIsOpen(false);
          if (e.key === 'ArrowDown') {
            setIsOpen(true);
            setTimeout(() => {
              const firstItem = dropdownRef.current?.querySelector('[role="option"]:not(:disabled)') as HTMLElement;
              firstItem?.focus();
            }, 100);
          }
        }}
        className={cn(
          "w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white font-bold focus:outline-none focus:border-white/30 transition-colors flex items-center justify-between",
          align === 'right' ? "flex-row-reverse" : ""
        )}
        style={{
          background: selected ? `linear-gradient(to ${align === 'right' ? 'left' : 'right'}, rgba(2,6,23,1) 40%, ${selected.teamColor}20)` : undefined,
          borderColor: selected ? `${selected.teamColor}50` : undefined
        }}
      >
        <div className={cn("flex items-center gap-2", align === 'right' ? "flex-row-reverse" : "")}>
          {selected && <div className="w-3 h-3 rounded-full shadow-lg" style={{ backgroundColor: selected.teamColor }}></div>}
          <span>{selected?.name || 'Seleccionar...'}</span>
        </div>
        <ChevronDown size={16} className={cn("text-slate-500 transition-transform", isOpen && "rotate-180")} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute z-50 w-full bottom-full mb-2 bg-slate-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="p-2 border-b border-white/10 space-y-2 bg-slate-950/50 shrink-0">
              <input
                type="text"
                placeholder="Buscar piloto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-white/30"
              />
              <div className="flex gap-2">
                <button 
                  onClick={(e) => { e.stopPropagation(); setSortMode('alpha'); }}
                  className={cn("flex-1 text-[10px] uppercase tracking-widest py-1.5 rounded-md transition-colors", sortMode === 'alpha' ? "bg-white/20 text-white font-bold" : "text-slate-400 hover:bg-white/5")}
                >
                  A-Z
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); setSortMode('team'); }}
                  className={cn("flex-1 text-[10px] uppercase tracking-widest py-1.5 rounded-md transition-colors", sortMode === 'team' ? "bg-white/20 text-white font-bold" : "text-slate-400 hover:bg-white/5")}
                >
                  Escudería
                </button>
              </div>
            </div>
            <div className="max-h-60 overflow-y-auto">
              {sortedDrivers.map(d => {
                const teamLogo = constructors.find(c => c.name === d.team)?.logoUrl;
                return (
                <button
                  key={d.id}
                  role="option"
                  aria-selected={d.id === value}
                  disabled={d.id === disabledId}
                  onClick={() => { onChange(d.id); setIsOpen(false); setSearchTerm(''); }}
                  onKeyDown={(e) => {
                    const items = dropdownRef.current?.querySelectorAll('[role="option"]:not(:disabled)');
                    if (!items) return;
                    const index = Array.from(items).indexOf(e.currentTarget as Element);
                    if (e.key === 'ArrowDown') {
                      e.preventDefault();
                      (items[(index + 1) % items.length] as HTMLElement).focus();
                    } else if (e.key === 'ArrowUp') {
                      e.preventDefault();
                      (items[(index - 1 + items.length) % items.length] as HTMLElement).focus();
                    } else if (e.key === 'Escape') {
                      setIsOpen(false);
                      dropdownRef.current?.querySelector('button')?.focus();
                    }
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 transition-colors text-left",
                    d.id === disabledId ? "opacity-30 cursor-not-allowed" : "hover:bg-white/10"
                  )}
                  style={{
                    background: d.id === value ? `${d.teamColor}30` : undefined,
                    borderLeft: align === 'left' ? `4px solid ${d.teamColor}` : undefined,
                    borderRight: align === 'right' ? `4px solid ${d.teamColor}` : undefined,
                  }}
                >
                  <div className={cn("flex items-center gap-3 w-full", align === 'right' ? "flex-row-reverse" : "")}>
                    {teamLogo ? (
                      <img src={teamLogo} alt={d.team} className="w-6 h-6 object-contain drop-shadow-md shrink-0" />
                    ) : (
                      <div className="w-6 h-6 rounded-full shrink-0" style={{ backgroundColor: d.teamColor }}></div>
                    )}
                    <div className={cn("flex flex-col w-full", align === 'right' ? "text-right" : "text-left")}>
                      <span className="font-bold text-white">{d.name}</span>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider">{d.team}</span>
                    </div>
                  </div>
                </button>
              )})}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PeriodDropdown({ 
  value, 
  onChange, 
  races,
  isOptionDisabled
}: { 
  value: string, 
  onChange: (id: string) => void, 
  races: Race[],
  isOptionDisabled?: (raceId: string, index: number) => boolean
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selected = races.find(r => r.id === value);
  const selectedIndex = races.findIndex(r => r.id === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '??/??';
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
  };

  return (
    <div 
      className="relative w-full" 
      ref={dropdownRef}
      role="listbox"
      aria-expanded={isOpen}
      aria-label="Seleccionar carrera"
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') setIsOpen(false);
          if (e.key === 'ArrowDown') {
            setIsOpen(true);
            setTimeout(() => {
              const firstItem = dropdownRef.current?.querySelector('[role="option"]:not(:disabled)') as HTMLElement;
              firstItem?.focus();
            }, 100);
          }
        }}
        className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-bold focus:outline-none focus:border-white/30 transition-colors flex items-center justify-between shadow-inner"
      >
        <span className="truncate">
          {selected ? `${selectedIndex + 1} • ${selected.name}` : 'Seleccionar...'}
        </span>
        <ChevronDown size={14} className={cn("text-slate-500 transition-transform shrink-0 ml-2", isOpen && "rotate-180")} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute z-[300] w-full bottom-full mb-2 bg-slate-900 border border-white/10 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col"
          >
            <div className="max-h-64 overflow-y-auto custom-scrollbar">
              {races.map((r, idx) => {
                const disabled = isOptionDisabled ? isOptionDisabled(r.id, idx) : false;
                return (
                <button
                  key={r.id}
                  role="option"
                  aria-selected={r.id === value}
                  disabled={disabled}
                  onClick={() => { onChange(r.id); setIsOpen(false); }}
                  onKeyDown={(e) => {
                    const items = dropdownRef.current?.querySelectorAll('[role="option"]:not(:disabled)');
                    if (!items) return;
                    const index = Array.from(items).indexOf(e.currentTarget as Element);
                    if (e.key === 'ArrowDown') {
                      e.preventDefault();
                      (items[(index + 1) % items.length] as HTMLElement).focus();
                    } else if (e.key === 'ArrowUp') {
                      e.preventDefault();
                      (items[(index - 1 + items.length) % items.length] as HTMLElement).focus();
                    } else if (e.key === 'Escape') {
                      setIsOpen(false);
                      dropdownRef.current?.querySelector('button')?.focus();
                    }
                  }}
                  className={cn(
                    "w-full flex items-center justify-between p-3 transition-colors text-left border-b border-white/5 last:border-0",
                    r.id === value ? "bg-white/10" : "hover:bg-white/5",
                    disabled && "opacity-30 cursor-not-allowed hover:bg-transparent"
                  )}
                  style={{
                    background: r.id === value ? 'linear-gradient(90deg, rgba(255,255,255,0.1) 0%, transparent 100%)' : undefined,
                    borderLeft: r.id === value ? '3px solid white' : '3px solid transparent'
                  }}
                >
                  <div className="flex flex-col overflow-hidden">
                    <span className={cn("font-bold text-sm truncate", r.id === value ? "text-white" : "text-slate-300")}>{r.name}</span>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider">Carrera {idx + 1}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400 bg-slate-950/50 px-2 py-1 rounded-md shrink-0 ml-2 border border-white/5">
                    <Calendar size={10} />
                    <span className="text-xs font-mono">{formatDate(r.date)}</span>
                  </div>
                </button>
              )})}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function HeadToHead() {
  const { data, isHistorical } = useChampionship();
  const [driver1Id, setDriver1Id] = useState<string>('');
  const [driver2Id, setDriver2Id] = useState<string>('');
  const [startRaceId, setStartRaceId] = useState<string>('');
  const [endRaceId, setEndRaceId] = useState<string>('');

  const [showFightAnim, setShowFightAnim] = useState(false);
  const [enableFightAnim, setEnableFightAnim] = useState(() => {
    try {
      const saved = localStorage.getItem('f1-h2h-anim');
      return saved !== null ? saved === 'true' : true;
    } catch (e) {
      console.warn('localStorage is blocked', e);
      return true; // Default value on error
    }
  });
  const [isComparing, setIsComparing] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showPeriodSelector, setShowPeriodSelector] = useState(false);
  const [showFloatingControls, setShowFloatingControls] = useState(false);

  const prevD1 = useRef(driver1Id);
  const prevD2 = useRef(driver2Id);
  const statsRef = useRef<HTMLDivElement>(null);

  const leftParticles = useMemo(() => 
    [...Array(10)].map(() => ({
      left: `${Math.random() * 60}%`, 
      top: `${Math.random() * 100}%`,
      duration: 1 + Math.random() * 2,
      delay: Math.random() * 2
    }))
  , []);

  const rightParticles = useMemo(() => 
    [...Array(10)].map(() => ({
      left: `${40 + Math.random() * 60}%`, 
      top: `${Math.random() * 100}%`,
      duration: 1 + Math.random() * 2,
      delay: Math.random() * 2
    }))
  , []);

  // Reset comparison when drivers change
  useEffect(() => {
    setIsComparing(false);
    setShowFloatingControls(false);
    setShowPeriodSelector(false);
  }, [driver1Id, driver2Id]);

  // Lock scroll during fight animation
  useEffect(() => {
    if (showFightAnim) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [showFightAnim]);

  useEffect(() => {
    try {
      localStorage.setItem('f1-h2h-anim', enableFightAnim.toString());
    } catch (e) {
      console.warn('localStorage is blocked', e);
    }
  }, [enableFightAnim]);

  const handleCompare = () => {
    if (enableFightAnim) {
      setShowFightAnim(true);
      setTimeout(() => {
        setIsComparing(true);
        setIsMinimized(true);
      }, 2000); // Show stats after cinematic starts
      
      setTimeout(() => {
        setShowFightAnim(false);
      }, 3500);

      setTimeout(() => {
        setShowFloatingControls(true);
      }, 5500);
    } else {
      setIsComparing(true);
      setIsMinimized(true);
      setShowFloatingControls(true);
    }
  };

  useEffect(() => {
    if (driver1Id && driver2Id) {
      if (driver1Id !== prevD1.current || driver2Id !== prevD2.current) {
        prevD1.current = driver1Id;
        prevD2.current = driver2Id;
      }
    }
  }, [driver1Id, driver2Id]);

  const drivers = useMemo(() => {
    return [...data.drivers].sort((a, b) => a.name.localeCompare(b.name));
  }, [data.drivers]);

  const completedRaces = useMemo(() => {
    return data.races.filter(r => r.status === 'completed');
  }, [data.races]);

  // Set default races if none selected
  useMemo(() => {
    if (completedRaces.length > 0 && !startRaceId && !endRaceId) {
      setStartRaceId(completedRaces[0].id);
      setEndRaceId(completedRaces[completedRaces.length - 1].id);
    }
  }, [completedRaces, startRaceId, endRaceId]);

  const driver1 = drivers.find(d => d.id === driver1Id);
  const driver2 = drivers.find(d => d.id === driver2Id);

  const team1Logo = useMemo(() => data.constructors.find(c => c.name === driver1?.team)?.logoUrl, [data.constructors, driver1]);
  const team2Logo = useMemo(() => data.constructors.find(c => c.name === driver2?.team)?.logoUrl, [data.constructors, driver2]);

  const stats = useMemo(() => {
    if (!driver1 || !driver2) return null;

    let d1Races = 0;
    let d2Races = 0;
    let d1BestPos = 999;
    let d2BestPos = 999;
    let d1PosSum = 0;
    let d2PosSum = 0;
    let d1Top5 = 0;
    let d2Top5 = 0;
    let d1Wins = 0;
    let d2Wins = 0;
    let d1Podiums = 0;
    let d2Podiums = 0;
    let d1Points = 0;
    let d2Points = 0;
    let d1Ahead = 0;
    let d2Ahead = 0;
    let totalRacesBoth = 0;
    
    let d1FastestLaps = 0;
    let d2FastestLaps = 0;
    let d1Dnfs = 0;
    let d2Dnfs = 0;

    let d1CurrentWinStreak = 0;
    let d1MaxWinStreak = 0;
    let d2CurrentWinStreak = 0;
    let d2MaxWinStreak = 0;

    let d1CurrentPodiumStreak = 0;
    let d1MaxPodiumStreak = 0;
    let d2CurrentPodiumStreak = 0;
    let d2MaxPodiumStreak = 0;

    // Filter races by selected period
    let startIndex = completedRaces.findIndex(r => r.id === startRaceId);
    let endIndex = completedRaces.findIndex(r => r.id === endRaceId);
    
    // Ensure valid indices and correct order
    if (startIndex === -1) startIndex = 0;
    if (endIndex === -1) endIndex = completedRaces.length - 1;
    if (startIndex > endIndex) {
      const temp = startIndex;
      startIndex = endIndex;
      endIndex = temp;
    }

    const racesInPeriod = completedRaces.slice(startIndex, endIndex + 1);

    racesInPeriod.forEach(race => {
      if (race.results) {
        const r1 = race.results.find(r => r.driverId === driver1.id);
        const r2 = race.results.find(r => r.driverId === driver2.id);

        if (r1) {
          d1Races++;
          if (r1.position < d1BestPos) d1BestPos = r1.position;
          d1PosSum += r1.position;
          if (r1.position <= 5) d1Top5++;
          if (r1.position === 1) {
            d1Wins++;
            d1CurrentWinStreak++;
            if (d1CurrentWinStreak > d1MaxWinStreak) d1MaxWinStreak = d1CurrentWinStreak;
          } else {
            d1CurrentWinStreak = 0;
          }
          if (r1.position <= 3) {
            d1Podiums++;
            d1CurrentPodiumStreak++;
            if (d1CurrentPodiumStreak > d1MaxPodiumStreak) d1MaxPodiumStreak = d1CurrentPodiumStreak;
          } else {
            d1CurrentPodiumStreak = 0;
          }
          if (r1.fastestLap) d1FastestLaps++;
          if (r1.dnf) d1Dnfs++;
          d1Points += r1.points;
        } else {
          d1CurrentWinStreak = 0;
          d1CurrentPodiumStreak = 0;
        }
        
        if (r2) {
          d2Races++;
          if (r2.position < d2BestPos) d2BestPos = r2.position;
          d2PosSum += r2.position;
          if (r2.position <= 5) d2Top5++;
          if (r2.position === 1) {
            d2Wins++;
            d2CurrentWinStreak++;
            if (d2CurrentWinStreak > d2MaxWinStreak) d2MaxWinStreak = d2CurrentWinStreak;
          } else {
            d2CurrentWinStreak = 0;
          }
          if (r2.position <= 3) {
            d2Podiums++;
            d2CurrentPodiumStreak++;
            if (d2CurrentPodiumStreak > d2MaxPodiumStreak) d2MaxPodiumStreak = d2CurrentPodiumStreak;
          } else {
            d2CurrentPodiumStreak = 0;
          }
          if (r2.fastestLap) d2FastestLaps++;
          if (r2.dnf) d2Dnfs++;
          d2Points += r2.points;
        } else {
          d2CurrentWinStreak = 0;
          d2CurrentPodiumStreak = 0;
        }

        if (r1 && r2) {
          totalRacesBoth++;
          if (r1.position < r2.position) d1Ahead++;
          else if (r2.position < r1.position) d2Ahead++;
        }
      }
    });

    const d1AvgPos = d1Races > 0 ? (d1PosSum / d1Races).toFixed(1) : '-';
    const d2AvgPos = d2Races > 0 ? (d2PosSum / d2Races).toFixed(1) : '-';
    const d1AvgPts = d1Races > 0 ? (d1Points / d1Races).toFixed(1) : '-';
    const d2AvgPts = d2Races > 0 ? (d2Points / d2Races).toFixed(1) : '-';

    return {
      d1Wins, d2Wins,
      d1Podiums, d2Podiums,
      d1Points, d2Points,
      d1Ahead, d2Ahead,
      totalRacesBoth,
      d1BestPos: d1BestPos === 999 ? 0 : d1BestPos,
      d2BestPos: d2BestPos === 999 ? 0 : d2BestPos,
      d1AvgPos, d2AvgPos,
      d1AvgPts, d2AvgPts,
      d1Top5, d2Top5,
      d1FastestLaps, d2FastestLaps,
      d1Dnfs, d2Dnfs,
      d1MaxWinStreak, d2MaxWinStreak,
      d1MaxPodiumStreak, d2MaxPodiumStreak
    };
  }, [driver1, driver2, completedRaces, startRaceId, endRaceId]);

  if (drivers.length < 2) {
    return (
      <div className="relative z-10">
        <EmptyState 
          icon={<Swords className="w-10 h-10" />}
          title="No hay suficientes pilotos"
          description="Se necesitan al menos dos pilotos registrados en la temporada para poder realizar una comparativa detallada entre ellos."
        />
      </div>
    );
  }

  const accentColor = isHistorical ? "text-amber-500" : "text-red-500";
  const bgAccent = isHistorical ? "bg-amber-500" : "bg-red-500";

  return (
    <div className="space-y-12 pb-32">
      {/* Fight Animation Overlay */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {showFightAnim && driver1 && driver2 && (
            <motion.div 
              className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-slate-950 w-screen h-screen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 1, ease: "easeInOut" } }}
            >
              {/* Split Background with Diagonal Cut */}
              <div className="absolute inset-0 flex overflow-hidden">
                <motion.div 
                  className="absolute inset-0 w-full h-full origin-left" 
                  style={{ 
                    backgroundColor: driver1.teamColor,
                    clipPath: 'polygon(0 0, 60% 0, 40% 100%, 0% 100%)'
                  }}
                  initial={{ x: '-100%' }}
                  animate={{ x: 0 }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="absolute inset-0 bg-black/20 mix-blend-overlay opacity-30" style={{ backgroundImage: `url('${TEXTURE_ASSETS.CARBON_FIBRE}')` }}></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent"></div>
                  
                  {/* Fire/Energy Particles Left */}
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {leftParticles.map((p, i) => (
                      <motion.div
                        key={`p1-${i}`}
                        className="absolute w-1 h-20 bg-white/20 blur-sm"
                        style={{ 
                          left: p.left, 
                          top: p.top,
                          rotate: '11deg'
                        }}
                        animate={{ 
                          y: [-100, 1000],
                          opacity: [0, 1, 0]
                        }}
                        transition={{ 
                          duration: p.duration, 
                          repeat: Infinity, 
                          delay: p.delay
                        }}
                      />
                    ))}
                  </div>
                </motion.div>
                
                <motion.div 
                  className="absolute inset-0 w-full h-full origin-right" 
                  style={{ 
                    backgroundColor: driver2.teamColor,
                    clipPath: 'polygon(60% 0, 100% 0, 100% 100%, 40% 100%)'
                  }}
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="absolute inset-0 bg-black/20 mix-blend-overlay opacity-30" style={{ backgroundImage: `url('${TEXTURE_ASSETS.CARBON_FIBRE}')` }}></div>
                  <div className="absolute inset-0 bg-gradient-to-l from-black/90 via-black/40 to-transparent"></div>
  
                  {/* Fire/Energy Particles Right */}
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {rightParticles.map((p, i) => (
                      <motion.div
                        key={`p2-${i}`}
                        className="absolute w-1 h-20 bg-white/20 blur-sm"
                        style={{ 
                          left: p.left, 
                          top: p.top,
                          rotate: '11deg'
                        }}
                        animate={{ 
                          y: [-100, 1000],
                          opacity: [0, 1, 0]
                        }}
                        transition={{ 
                          duration: p.duration, 
                          repeat: Infinity, 
                          delay: p.delay
                        }}
                      />
                    ))}
                  </div>
                </motion.div>
              </div>
  
              {/* Dynamic Slash Line - SVG to match clipPath exactly */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-20" preserveAspectRatio="none">
                <motion.line 
                  x1="60%" y1="0" x2="40%" y2="100%" 
                  stroke="white" 
                  strokeWidth="6"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 0.8 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                  style={{ filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.8))' }}
                />
                <motion.line 
                  x1="60%" y1="0" x2="40%" y2="100%" 
                  stroke="white" 
                  strokeWidth="2"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.3 }}
                />
              </svg>
  
              {/* Flash Effect */}
              <motion.div 
                className="absolute inset-0 bg-white mix-blend-screen z-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ delay: 0.7, duration: 0.4 }}
              />
  
              {/* Content Container */}
              <div className="relative z-30 w-full h-full flex items-center justify-center px-4 md:px-20">
                <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-8 md:gap-24 w-full max-w-7xl">
                  
                  {/* Driver 1 */}
                  <motion.div
                    initial={{ x: -300, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.8, type: "spring", bounce: 0.2 }}
                    className="flex flex-col items-center md:items-end"
                  >
                    <div className="relative group">
                      <motion.div 
                        className="absolute -inset-12 bg-white/30 blur-3xl rounded-full"
                        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                      <img 
                        src={driver1.avatarUrl || `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(driver1.id)}&backgroundColor=slate800`}
                        className="w-48 h-48 md:w-80 md:h-80 rounded-full border-4 md:border-8 border-white shadow-[0_0_80px_rgba(0,0,0,0.9)] object-cover bg-slate-900 relative z-10"
                        alt={driver1.name}
                      />
                      {/* Team Logo Overlay */}
                      {team1Logo && (
                        <motion.div 
                          initial={{ scale: 0, opacity: 0, rotate: -45 }}
                          animate={{ scale: 1, opacity: 1, rotate: 0 }}
                          transition={{ delay: 1, type: "spring" }}
                          className="absolute -bottom-4 -right-4 md:-bottom-6 md:-right-6 z-20 w-20 h-20 md:w-32 md:h-32 bg-white/10 backdrop-blur-md rounded-3xl p-4 border-4 border-white/20 shadow-[0_0_40px_rgba(0,0,0,0.5)] flex items-center justify-center overflow-hidden"
                        >
                          {/* Neutral glass background for logos of any color */}
                          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-50"></div>
                          <img src={team1Logo} alt={driver1.team} className="max-w-[85%] max-h-[85%] object-contain relative z-10 drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]" />
                        </motion.div>
                      )}
                    </div>
                    <motion.div 
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.9 }}
                      className="mt-10 text-right w-full px-2"
                    >
                      <div className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black italic text-white uppercase tracking-tighter drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] leading-[0.9] break-words">
                        {driver1.name.split(' ').map((part, i) => <div key={i}>{part}</div>)}
                      </div>
                      <div className="text-xl sm:text-2xl md:text-3xl font-black italic text-white bg-black/40 backdrop-blur-sm px-4 py-1 rounded-lg uppercase tracking-[0.2em] mt-4 inline-block border-r-4 break-words max-w-full" style={{ borderColor: driver1.teamColor }}>
                        {driver1.team}
                      </div>
                    </motion.div>
                  </motion.div>
                  
                  {/* VS Center */}
                  <div className="flex flex-col items-center justify-center">
                    <motion.div 
                      className="relative"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.7, duration: 1, type: "spring", bounce: 0.4 }}
                    >
                      <div className="absolute inset-0 bg-white blur-[100px] opacity-40 animate-pulse"></div>
                      <div className="relative z-20 font-black text-6xl sm:text-8xl md:text-[10rem] lg:text-[14rem] text-white italic tracking-tighter drop-shadow-[0_0_60px_rgba(255,255,255,0.8)]">
                        VS
                      </div>
                    </motion.div>
                  </div>
  
                  {/* Driver 2 */}
                  <motion.div
                    initial={{ x: 300, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.8, type: "spring", bounce: 0.2 }}
                    className="flex flex-col items-center md:items-start"
                  >
                    <div className="relative group">
                      <motion.div 
                        className="absolute -inset-12 bg-white/30 blur-3xl rounded-full"
                        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                      <img 
                        src={driver2.avatarUrl || `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(driver2.id)}&backgroundColor=slate800`}
                        className="w-40 h-40 sm:w-48 sm:h-48 md:w-80 md:h-80 rounded-full border-4 md:border-8 border-white shadow-[0_0_80px_rgba(0,0,0,0.9)] object-cover bg-slate-900 relative z-10"
                        alt={driver2.name}
                      />
                      {/* Team Logo Overlay */}
                      {team2Logo && (
                        <motion.div 
                          initial={{ scale: 0, opacity: 0, rotate: 45 }}
                          animate={{ scale: 1, opacity: 1, rotate: 0 }}
                          transition={{ delay: 1, type: "spring" }}
                          className="absolute -bottom-4 -left-4 md:-bottom-6 md:-left-6 z-20 w-16 h-16 sm:w-20 sm:h-20 md:w-32 md:h-32 bg-white/10 backdrop-blur-md rounded-3xl p-4 border-4 border-white/20 shadow-[0_0_40px_rgba(0,0,0,0.5)] flex items-center justify-center overflow-hidden"
                        >
                          {/* Neutral glass background for logos of any color */}
                          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-50"></div>
                          <img src={team2Logo} alt={driver2.team} className="max-w-[85%] max-h-[85%] object-contain relative z-10 drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]" />
                        </motion.div>
                      )}
                    </div>
                    <motion.div 
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.9 }}
                      className="mt-10 text-left w-full px-2"
                    >
                      <div className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black italic text-white uppercase tracking-tighter drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] leading-[0.9] break-words">
                        {driver2.name.split(' ').map((part, i) => <div key={i}>{part}</div>)}
                      </div>
                      <div className="text-xl sm:text-2xl md:text-3xl font-black italic text-white bg-black/40 backdrop-blur-sm px-4 py-1 rounded-lg uppercase tracking-[0.2em] mt-4 inline-block border-l-4 break-words max-w-full" style={{ borderColor: driver2.teamColor }}>
                        {driver2.team}
                      </div>
                    </motion.div>
                  </motion.div>
  
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      <div className="flex flex-col items-center text-center space-y-4 relative py-8 overflow-hidden">
        {/* Combat Background Effect */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden flex items-center justify-center opacity-80">
          <div className="absolute w-[150%] h-[120px] -rotate-12 blur-3xl transition-colors duration-1000" style={{ background: `linear-gradient(90deg, transparent, ${driver1?.teamColor || '#3b82f6'}60, transparent)` }}></div>
          <div className="absolute w-[150%] h-[120px] rotate-12 blur-3xl transition-colors duration-1000" style={{ background: `linear-gradient(90deg, transparent, ${driver2?.teamColor || '#ef4444'}60, transparent)` }}></div>
          <div className="absolute w-full max-w-lg h-[2px] bg-gradient-to-r from-transparent via-white/50 to-transparent shadow-[0_0_30px_rgba(255,255,255,1)]"></div>
          
          {/* Side Fades to prevent sharp horizontal edges */}
          <div className="absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-slate-950 to-transparent z-10"></div>
          <div className="absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-slate-950 to-transparent z-10"></div>
          
          {/* Sparkles / Energy */}
          <div className="absolute w-32 h-32 bg-white/10 rounded-full blur-2xl mix-blend-screen animate-pulse"></div>
        </div>
        
        <div className={cn("p-5 rounded-3xl bg-slate-900/80 backdrop-blur-md border border-white/10 inline-block relative z-10", isHistorical ? "shadow-[0_0_50px_rgba(245,158,11,0.2)]" : "shadow-[0_0_50px_rgba(239,68,68,0.2)]")}>
          <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent rounded-3xl pointer-events-none"></div>
          <Swords className={cn("w-14 h-14 relative z-10", accentColor)} />
        </div>
        <h2 className="text-5xl md:text-6xl font-black italic text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 uppercase tracking-tighter drop-shadow-lg relative z-10">
          Cara a Cara
        </h2>
        <p className="text-slate-400 max-w-2xl text-sm md:text-base font-medium relative z-10">
          El asfalto no miente. Enfrenta a los titanes de la parrilla y descubre quién es el verdadero rey de la pista.
        </p>
      </div>

      {/* Period Selector Floating Toggle */}
      <AnimatePresence>
        {completedRaces.length > 0 && driver1 && driver2 && isComparing && showFloatingControls && (
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className="fixed right-6 bottom-24 z-[100] flex flex-col items-end gap-3"
          >
            {showPeriodSelector && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl w-80 md:w-96 mb-2 relative z-[110] overflow-visible"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 pointer-events-none rounded-3xl"></div>
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-white">
                      <Activity size={16} className="text-blue-400" />
                      <span className="text-xs font-black uppercase tracking-widest">Rango de Telemetría</span>
                    </div>
                    <button onClick={() => setShowPeriodSelector(false)} className="text-slate-500 hover:text-white transition-colors">
                      <X size={16} />
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Desde</label>
                      <PeriodDropdown 
                        value={startRaceId} 
                        onChange={setStartRaceId} 
                        races={completedRaces} 
                        isOptionDisabled={(id, idx) => {
                          const endIdx = completedRaces.findIndex(r => r.id === endRaceId);
                          return endIdx !== -1 && idx > endIdx;
                        }}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Hasta</label>
                      <PeriodDropdown 
                        value={endRaceId} 
                        onChange={setEndRaceId} 
                        races={completedRaces} 
                        isOptionDisabled={(id, idx) => {
                          const startIdx = completedRaces.findIndex(r => r.id === startRaceId);
                          return startIdx !== -1 && idx < startIdx;
                        }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            <button
              onClick={() => setShowPeriodSelector(!showPeriodSelector)}
              className={cn(
                "w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 border group relative",
                showPeriodSelector 
                  ? "bg-white text-slate-950 border-white scale-110" 
                  : "bg-slate-900 text-white border-white/10 hover:border-white/30 hover:scale-110"
              )}
            >
              <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <Calendar size={24} className={cn("relative z-10", showPeriodSelector ? "animate-none" : "group-hover:rotate-12")} />
              {!showPeriodSelector && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-slate-950 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></div>
                </div>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 items-center max-w-5xl mx-auto relative z-20">
        {/* Driver 1 Selector */}
        <motion.div layout className="bg-slate-900/60 border border-white/10 rounded-3xl p-6 relative group flex flex-col items-center text-center transition-all duration-500" style={{ boxShadow: driver1 ? `0 10px 40px -10px ${driver1.teamColor}40` : undefined }}>
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl pointer-events-none"></div>
          {driver1 && <div className="absolute inset-0 rounded-3xl opacity-10 pointer-events-none transition-colors duration-500" style={{ background: `radial-gradient(circle at top left, ${driver1.teamColor}, transparent 70%)` }}></div>}
          
          {isMinimized ? (
            <button 
              onClick={() => setIsMinimized(false)}
              className="flex items-center justify-between w-full gap-4 group/min text-left relative overflow-hidden p-1 rounded-2xl transition-all duration-300"
            >
              {/* Glow effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 -translate-x-full group-hover/min:translate-x-full transition-transform duration-1000"></div>
              <div className="absolute inset-0 opacity-0 group-hover/min:opacity-100 transition-opacity duration-500" style={{ background: `radial-gradient(circle at center, ${driver1?.teamColor || '#333'}20, transparent 70%)` }}></div>
              <div className="absolute inset-0 border-2 border-transparent group-hover/min:border-white/20 rounded-2xl transition-colors duration-300"></div>

              <div className="flex items-center gap-3 relative z-10">
                <div className="w-10 h-10 rounded-full border-2 overflow-hidden bg-slate-800 shrink-0 transition-transform duration-300 group-hover/min:scale-110" style={{ borderColor: driver1?.teamColor || '#333' }}>
                  {driver1 ? (
                    <img src={driver1.avatarUrl || `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(driver1.id)}&backgroundColor=slate800`} alt={driver1.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600"><Users size={16} /></div>
                  )}
                </div>
                <div className="text-left">
                  <div className="text-sm font-black italic text-white uppercase truncate max-w-[100px] group-hover/min:text-blue-400 transition-colors">{driver1?.name || "Piloto 1"}</div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{driver1?.team || "Sin elegir"}</div>
                </div>
              </div>
              <div 
                className="p-2 bg-white/5 rounded-lg text-slate-400 group-hover/min:text-white group-hover/min:bg-white/10 transition-all relative z-10"
                title="Maximizar"
              >
                <Maximize2 size={18} />
              </div>
            </button>
          ) : (
            <>
              {/* Avatar */}
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 shadow-2xl mb-6 z-10 group-hover:scale-105 bg-slate-800 flex items-center justify-center" 
                style={{ borderColor: driver1?.teamColor || '#333' }}
              >
                <AnimatePresence mode="wait">
                  {driver1 ? (
                    <motion.img 
                      key={driver1.id}
                      initial={{ opacity: 0, scale: 1.1 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3 }}
                      src={driver1.avatarUrl || `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(driver1.id)}&backgroundColor=slate800`} 
                      alt={driver1.name} 
                      className="w-full h-full object-cover absolute inset-0" 
                    />
                  ) : (
                    <motion.div
                      key="empty1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="w-full h-full flex items-center justify-center text-slate-600"
                    >
                      <Users size={48} />
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>
              </motion.div>

              {driver1 && (
                <div className="absolute top-4 right-4 z-50 flex gap-2">
                  <motion.button 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    onClick={() => setIsMinimized(true)}
                    className="p-2 bg-white/5 hover:bg-white/20 rounded-full text-slate-400 hover:text-white transition-all border border-white/10"
                    title="Minimizar"
                  >
                    <Minimize2 size={16} />
                  </motion.button>
                  <motion.button 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    onClick={() => setDriver1Id('')}
                    className="p-2 bg-red-600/20 hover:bg-red-600 rounded-full text-red-500 hover:text-white transition-all border border-red-500/30"
                    title="Eliminar"
                  >
                    <X size={16} />
                  </motion.button>
                </div>
              )}

              <div className="w-full relative z-50 flex flex-col items-center md:items-start">
                <div className="inline-block px-4 py-1.5 rounded-full bg-slate-950/80 border border-white/10 text-xs font-black text-slate-300 uppercase tracking-[0.2em] mb-4 shadow-inner">
                  Piloto 1
                </div>
                <DriverDropdown 
                  value={driver1Id} 
                  onChange={setDriver1Id} 
                  drivers={drivers} 
                  constructors={data.constructors}
                  disabledId={driver2Id} 
                  align="left" 
                />
              </div>

              <AnimatePresence>
                {driver1 && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-6 flex flex-col items-center gap-3 w-full relative z-10 overflow-hidden"
                  >
                    <div className="text-2xl font-black italic text-white text-center">{driver1.name}</div>
                    <div className="bg-slate-950/80 border border-white/10 rounded-2xl p-4 w-full flex flex-col items-center gap-3 relative overflow-hidden group-hover:border-white/20 transition-all shadow-lg">
                      <div className="absolute top-0 left-0 w-full h-1.5" style={{ backgroundColor: driver1.teamColor }}></div>
                      <div className="absolute inset-0 opacity-10" style={{ background: `radial-gradient(circle at center, ${driver1.teamColor}, transparent 70%)` }}></div>
                      
                      <div className="relative z-10 h-16 flex items-center justify-center">
                        {team1Logo ? (
                          <img src={team1Logo} alt={driver1.team} className="max-h-full max-w-full object-contain drop-shadow-xl" />
                        ) : (
                          <div className="w-12 h-12 rounded-full shadow-lg border-2 border-white/10" style={{ backgroundColor: driver1.teamColor }}></div>
                        )}
                      </div>
                      <div className="relative z-10 text-xs font-black text-slate-300 uppercase tracking-widest text-center">{driver1.team}</div>
                    </div>
                    
                    {/* Driver 1 Car */}
                    <div className="mt-4 w-full flex justify-center relative">
                      <SpeedLines color={driver1.teamColor} />
                      <F1CarAnimation 
                        primaryColor={driver1.teamColor} 
                        helmetColor="#ffffff" 
                        className="w-full max-w-[180px] opacity-90 drop-shadow-2xl transition-transform duration-500 group-hover:scale-110 relative z-10"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </motion.div>

        {/* VS Badge & Compare Button */}
        <div className="flex flex-col items-center justify-center py-8 md:py-0 relative z-30">
          <div className="relative flex items-center justify-center w-20 h-20 md:w-24 md:h-24 group mb-6">
            {/* Aggressive glowing background */}
            <div className={cn("absolute inset-0 rounded-xl rotate-45 blur-xl opacity-60 group-hover:opacity-100 transition-opacity duration-500 animate-pulse", bgAccent)}></div>
            <div className={cn("absolute inset-2 rounded-xl rotate-45 border-2 z-10 bg-slate-950 shadow-2xl", isHistorical ? "border-amber-500" : "border-red-500")}></div>
            
            {/* Glitch Text Effect */}
            <motion.div 
              className="relative z-20 font-black text-4xl md:text-5xl tracking-tighter flex items-center justify-center"
              animate={{ x: [-1, 1, -2, 2, 0], y: [1, -1, 2, -2, 0] }}
              transition={{ repeat: Infinity, duration: 0.2, repeatDelay: 3, ease: "linear" }}
            >
              <span className="absolute top-0 left-[3px] text-red-500 mix-blend-screen opacity-80">VS</span>
              <span className="absolute top-0 -left-[3px] text-cyan-500 mix-blend-screen opacity-80">VS</span>
              <span className="relative text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">VS</span>
            </motion.div>
          </div>

          {/* Compare Action Area */}
          <div className="flex flex-col items-center gap-4">
            <button
              onClick={handleCompare}
              disabled={!driver1Id || !driver2Id || isComparing}
              className={cn(
                "relative overflow-hidden px-6 py-2.5 rounded-full font-black italic text-base uppercase tracking-[0.2em] transition-all duration-500 shadow-2xl group border-2 border-transparent hover:border-white/50 animate-pulse",
                (!driver1Id || !driver2Id) ? "opacity-50 cursor-not-allowed bg-slate-800 text-slate-500" :
                isComparing ? "bg-slate-800 text-slate-400 cursor-default" :
                isHistorical 
                  ? "bg-amber-600 text-white hover:bg-amber-500 hover:scale-105 hover:shadow-[0_0_40px_rgba(245,158,11,0.4)]" 
                  : "bg-red-600 text-white hover:bg-red-500 hover:scale-105 hover:shadow-[0_0_40px_rgba(239,68,68,0.4)]"
              )}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
              
              <span className="relative z-10 flex items-center gap-2">
                <Swords size={16} className={cn(!isComparing && "group-hover:rotate-12 transition-transform duration-300")} />
                {isComparing ? "Comparando..." : "Enfrentar"}
              </span>
            </button>

            {/* Small Cinematic Toggle */}
            <button 
              onClick={() => setEnableFightAnim(!enableFightAnim)}
              disabled={isComparing}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full border backdrop-blur-sm transition-all duration-300 text-[10px] font-bold uppercase tracking-wider",
                isComparing ? "opacity-50 cursor-not-allowed" : "hover:scale-105",
                enableFightAnim 
                  ? "bg-yellow-500/20 border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/30" 
                  : "bg-slate-900/80 border-white/10 text-slate-400 hover:bg-slate-800 hover:text-white"
              )}
              title={enableFightAnim ? "Desactivar intro cinemática" : "Activar intro cinemática"}
            >
              {enableFightAnim ? (
                <>
                  <Zap size={12} className="fill-current animate-pulse" />
                  <span>Cinemática ON</span>
                </>
              ) : (
                <>
                  <ZapOff size={12} className="opacity-70" />
                  <span>Cinemática OFF</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Driver 2 Selector */}
        <motion.div layout className="bg-slate-900/60 border border-white/10 rounded-3xl p-6 relative group flex flex-col items-center text-center transition-all duration-500" style={{ boxShadow: driver2 ? `0 10px 40px -10px ${driver2.teamColor}40` : undefined }}>
          <div className="absolute inset-0 bg-gradient-to-bl from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl pointer-events-none"></div>
          {driver2 && <div className="absolute inset-0 rounded-3xl opacity-10 pointer-events-none transition-colors duration-500" style={{ background: `radial-gradient(circle at top right, ${driver2.teamColor}, transparent 70%)` }}></div>}
          
          {isMinimized ? (
            <button 
              onClick={() => setIsMinimized(false)}
              className="flex items-center justify-between w-full gap-4 group/min text-left relative overflow-hidden p-1 rounded-2xl transition-all duration-300"
            >
              {/* Glow effect on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 -translate-x-full group-hover/min:translate-x-full transition-transform duration-1000"></div>
              <div className="absolute inset-0 opacity-0 group-hover/min:opacity-100 transition-opacity duration-500" style={{ background: `radial-gradient(circle at center, ${driver2?.teamColor || '#333'}20, transparent 70%)` }}></div>
              <div className="absolute inset-0 border-2 border-transparent group-hover/min:border-white/20 rounded-2xl transition-colors duration-300"></div>

              <div className="flex items-center gap-3 relative z-10">
                <div className="w-10 h-10 rounded-full border-2 overflow-hidden bg-slate-800 shrink-0 transition-transform duration-300 group-hover/min:scale-110" style={{ borderColor: driver2?.teamColor || '#333' }}>
                  {driver2 ? (
                    <img src={driver2.avatarUrl || `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(driver2.id)}&backgroundColor=slate800`} alt={driver2.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600"><Users size={16} /></div>
                  )}
                </div>
                <div className="text-left">
                  <div className="text-sm font-black italic text-white uppercase truncate max-w-[100px] group-hover/min:text-blue-400 transition-colors">{driver2?.name || "Piloto 2"}</div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{driver2?.team || "Sin elegir"}</div>
                </div>
              </div>
              <div 
                className="p-2 bg-white/5 rounded-lg text-slate-400 group-hover/min:text-white group-hover/min:bg-white/10 transition-all relative z-10"
                title="Maximizar"
              >
                <Maximize2 size={18} />
              </div>
            </button>
          ) : (
            <>
              {/* Avatar */}
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 shadow-2xl mb-6 z-10 group-hover:scale-105 bg-slate-800 flex items-center justify-center" 
                style={{ borderColor: driver2?.teamColor || '#333' }}
              >
                <AnimatePresence mode="wait">
                  {driver2 ? (
                    <motion.img 
                      key={driver2.id}
                      initial={{ opacity: 0, scale: 1.1 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3 }}
                      src={driver2.avatarUrl || `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(driver2.id)}&backgroundColor=slate800`} 
                      alt={driver2.name} 
                      className="w-full h-full object-cover absolute inset-0" 
                    />
                  ) : (
                    <motion.div
                      key="empty2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="w-full h-full flex items-center justify-center text-slate-600"
                    >
                      <Users size={48} />
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>
              </motion.div>

              {driver2 && (
                <div className="absolute top-4 right-4 z-50 flex gap-2">
                  <motion.button 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    onClick={() => setIsMinimized(true)}
                    className="p-2 bg-white/5 hover:bg-white/20 rounded-full text-slate-400 hover:text-white transition-all border border-white/10"
                    title="Minimizar"
                  >
                    <Minimize2 size={16} />
                  </motion.button>
                  <motion.button 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    onClick={() => setDriver2Id('')}
                    className="p-2 bg-red-600/20 hover:bg-red-600 rounded-full text-red-500 hover:text-white transition-all border border-red-500/30"
                    title="Eliminar"
                  >
                    <X size={16} />
                  </motion.button>
                </div>
              )}

              <div className="w-full relative z-50 flex flex-col items-center md:items-end">
                <div className="inline-block px-4 py-1.5 rounded-full bg-slate-950/80 border border-white/10 text-xs font-black text-slate-300 uppercase tracking-[0.2em] mb-4 shadow-inner">
                  Piloto 2
                </div>
                <DriverDropdown 
                  value={driver2Id} 
                  onChange={setDriver2Id} 
                  drivers={drivers} 
                  constructors={data.constructors}
                  disabledId={driver1Id} 
                  align="right" 
                />
              </div>

              <AnimatePresence>
                {driver2 && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-6 flex flex-col items-center gap-3 w-full relative z-10 overflow-hidden"
                  >
                    <div className="text-2xl font-black italic text-white text-center">{driver2.name}</div>
                    <div className="bg-slate-950/80 border border-white/10 rounded-2xl p-4 w-full flex flex-col items-center gap-3 relative overflow-hidden group-hover:border-white/20 transition-all shadow-lg">
                      <div className="absolute top-0 left-0 w-full h-1.5" style={{ backgroundColor: driver2.teamColor }}></div>
                      <div className="absolute inset-0 opacity-10" style={{ background: `radial-gradient(circle at center, ${driver2.teamColor}, transparent 70%)` }}></div>
                      
                      <div className="relative z-10 h-16 flex items-center justify-center">
                        {team2Logo ? (
                          <img src={team2Logo} alt={driver2.team} className="max-h-full max-w-full object-contain drop-shadow-xl" />
                        ) : (
                          <div className="w-12 h-12 rounded-full shadow-lg border-2 border-white/10" style={{ backgroundColor: driver2.teamColor }}></div>
                        )}
                      </div>
                      <div className="relative z-10 text-xs font-black text-slate-300 uppercase tracking-widest text-center">{driver2.team}</div>
                    </div>
                    
                    {/* Driver 2 Car */}
                    <div className="mt-4 w-full flex justify-center relative">
                      <SpeedLines color={driver2.teamColor} flip />
                      <F1CarAnimation 
                        primaryColor={driver2.teamColor} 
                        helmetColor="#ffffff" 
                        className="w-full max-w-[180px] opacity-90 drop-shadow-2xl transition-transform duration-500 group-hover:scale-110 relative z-10 scale-x-[-1]"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </motion.div>
      </div>

      {/* Stats Comparison */}
      {stats && driver1 && driver2 && isComparing && (
        <div ref={statsRef} className="max-w-4xl mx-auto space-y-4 relative z-10">
          <StatRow 
            label="Puntos Totales" 
            val1={stats.d1Points} 
            val2={stats.d2Points} 
            color1={driver1.teamColor} 
            color2={driver2.teamColor} 
            icon={<Trophy size={16} />}
          />
          <StatRow 
            label="Puntos por Carrera" 
            val1={parseFloat(stats.d1AvgPts as string) || 0} 
            val2={parseFloat(stats.d2AvgPts as string) || 0} 
            display1={stats.d1AvgPts}
            display2={stats.d2AvgPts}
            color1={driver1.teamColor} 
            color2={driver2.teamColor} 
            icon={<Activity size={16} />}
          />
          <StatRow 
            label="Victorias" 
            val1={stats.d1Wins} 
            val2={stats.d2Wins} 
            color1={driver1.teamColor} 
            color2={driver2.teamColor} 
            icon={<Medal size={16} />}
          />
          <StatRow 
            label="Podios" 
            val1={stats.d1Podiums} 
            val2={stats.d2Podiums} 
            color1={driver1.teamColor} 
            color2={driver2.teamColor} 
            icon={<Flag size={16} />}
          />
          <StatRow 
            label="Top 5" 
            val1={stats.d1Top5} 
            val2={stats.d2Top5} 
            color1={driver1.teamColor} 
            color2={driver2.teamColor} 
            icon={<Target size={16} />}
          />
          <StatRow 
            label="Vueltas Rápidas" 
            val1={stats.d1FastestLaps} 
            val2={stats.d2FastestLaps} 
            color1={driver1.teamColor} 
            color2={driver2.teamColor} 
            icon={<Timer size={16} />}
          />
          <StatRow 
            label="Mejor Posición" 
            val1={stats.d1BestPos} 
            val2={stats.d2BestPos} 
            display1={stats.d1BestPos === 0 ? '-' : `P${stats.d1BestPos}`}
            display2={stats.d2BestPos === 0 ? '-' : `P${stats.d2BestPos}`}
            color1={driver1.teamColor} 
            color2={driver2.teamColor} 
            icon={<TrendingUp size={16} />}
            lowerIsBetter={true}
          />
          <StatRow 
            label="Posición Media" 
            val1={parseFloat(stats.d1AvgPos as string) || 0} 
            val2={parseFloat(stats.d2AvgPos as string) || 0} 
            display1={stats.d1AvgPos}
            display2={stats.d2AvgPos}
            color1={driver1.teamColor} 
            color2={driver2.teamColor} 
            icon={<Crosshair size={16} />}
            lowerIsBetter={true}
          />
          <StatRow 
            label="Racha de Victorias" 
            val1={stats.d1MaxWinStreak} 
            val2={stats.d2MaxWinStreak} 
            color1={driver1.teamColor} 
            color2={driver2.teamColor} 
            icon={<Flame size={16} />}
          />
          <StatRow 
            label="Racha de Podios" 
            val1={stats.d1MaxPodiumStreak} 
            val2={stats.d2MaxPodiumStreak} 
            color1={driver1.teamColor} 
            color2={driver2.teamColor} 
            icon={<Flame size={16} />}
          />
          <StatRow 
            label="Veces por delante (Misma carrera)" 
            val1={stats.d1Ahead} 
            val2={stats.d2Ahead} 
            color1={driver1.teamColor} 
            color2={driver2.teamColor} 
            icon={<Swords size={16} />}
            suffix={` / ${stats.totalRacesBoth}`}
          />
          <StatRow 
            label="Abandonos (DNFs)" 
            val1={stats.d1Dnfs} 
            val2={stats.d2Dnfs} 
            color1={driver1.teamColor} 
            color2={driver2.teamColor} 
            icon={<AlertTriangle size={16} />}
            lowerIsBetter={true}
          />
        </div>
      )}
    </div>
  );
}

function StatRow({ 
  label, 
  val1, 
  val2, 
  display1, 
  display2, 
  color1, 
  color2, 
  icon, 
  suffix = '',
  lowerIsBetter = false
}: { 
  label: string, 
  val1: number, 
  val2: number, 
  display1?: string | number,
  display2?: string | number,
  color1: string, 
  color2: string, 
  icon: React.ReactNode, 
  suffix?: string,
  lowerIsBetter?: boolean
}) {
  const total = val1 + val2;
  let p1 = 50;
  let p2 = 50;
  
  if (total > 0) {
    if (lowerIsBetter) {
      // Invert logic for lower is better (e.g. position 1 is better than 10)
      // We want the smaller number to have the bigger bar.
      p1 = (val2 / total) * 100;
      p2 = (val1 / total) * 100;
    } else {
      p1 = (val1 / total) * 100;
      p2 = (val2 / total) * 100;
    }
  } else if (val1 === 0 && val2 === 0) {
    p1 = 0;
    p2 = 0;
  }

  const d1 = display1 !== undefined ? display1 : val1;
  const d2 = display2 !== undefined ? display2 : val2;

  const isZeroTie = val1 === 0 && val2 === 0;
  const isTie = val1 === val2 && !isZeroTie;

  return (
    <div className={cn(
      "bg-slate-900/40 border rounded-3xl p-4 md:p-6 relative overflow-hidden group transition-colors",
      isZeroTie ? "border-white/5 opacity-60 grayscale-[0.5]" : "border-white/5 hover:bg-slate-900/60"
    )}>
      {/* Dynamic Background Glow based on colors */}
      {!isZeroTie && <div className="absolute inset-0 opacity-20 pointer-events-none transition-colors duration-1000" style={{ background: `linear-gradient(90deg, ${color1} 0%, transparent 30%, transparent 70%, ${color2} 100%)` }}></div>}
      <div className="absolute inset-0 opacity-10 bg-gradient-to-r from-transparent via-white to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]"></div>
      
      {/* Top glowing line */}
      {!isZeroTie && <div className="absolute top-0 left-0 right-0 h-[1px] opacity-50 transition-colors duration-1000" style={{ background: `linear-gradient(90deg, ${color1}, transparent 50%, ${color2})` }}></div>}
      
      <div className="flex justify-between items-center mb-4 relative z-10">
        <span className={cn(
          "text-xl md:text-2xl font-black transition-all duration-500",
          isZeroTie ? "text-slate-600" : (isTie ? "text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" : "text-white")
        )}>
          {d1}{suffix}
        </span>
        <div className={cn("flex flex-col items-center px-4 transition-colors duration-500", isZeroTie ? "text-slate-600" : "text-slate-400")}>
          {icon}
          <span className="text-[10px] font-bold uppercase tracking-widest mt-1 text-center">{label}</span>
        </div>
        <span className={cn(
          "text-xl md:text-2xl font-black transition-all duration-500",
          isZeroTie ? "text-slate-600" : (isTie ? "text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" : "text-white")
        )}>
          {d2}{suffix}
        </span>
      </div>
      <div className="h-4 w-full bg-slate-950 rounded-full overflow-hidden flex relative z-10 border border-white/5 shadow-inner">
        {isZeroTie && (
          <div className="absolute inset-0 flex items-center justify-center bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,255,255,0.03)_10px,rgba(255,255,255,0.03)_20px)]">
            <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Sin registros</span>
          </div>
        )}
        
        {!isZeroTie && (
          <>
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${p1}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full relative overflow-hidden"
              style={{ backgroundColor: color1 }}
            >
               <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.15)_50%,transparent_75%)] bg-[length:10px_10px]"></div>
               <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent"></div>
            </motion.div>
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${p2}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full relative overflow-hidden"
              style={{ backgroundColor: color2 }}
            >
               <div className="absolute inset-0 bg-[linear-gradient(-45deg,transparent_25%,rgba(255,255,255,0.15)_50%,transparent_75%)] bg-[length:10px_10px]"></div>
               <div className="absolute inset-0 bg-gradient-to-l from-black/30 to-transparent"></div>
            </motion.div>
          </>
        )}

        {/* Convergence / Fight Glow */}
        {total > 0 && !isTie && (
          <motion.div
            className="absolute top-0 bottom-0 w-6 -ml-3 z-20 flex items-center justify-center mix-blend-screen"
            initial={{ left: '50%' }}
            animate={{ left: `${p1}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <div className="w-full h-full bg-white opacity-60 blur-[4px]"></div>
            <div className="absolute w-1 h-full bg-white opacity-90 blur-[1px]"></div>
            <div className="absolute w-8 h-8 bg-yellow-300 opacity-30 blur-[8px] rounded-full animate-pulse"></div>
          </motion.div>
        )}

        {/* Tie Badge */}
        {isTie && (
          <motion.div
            className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 z-30 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
          >
            <div className="bg-slate-800/90 text-white text-[8px] font-black px-3 py-0.5 rounded-full border border-white/20 backdrop-blur-md shadow-[0_0_15px_rgba(255,255,255,0.4)] uppercase tracking-widest">
              Empate
            </div>
            <div className="absolute inset-0 rounded-full border border-white/40 animate-ping opacity-50"></div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
