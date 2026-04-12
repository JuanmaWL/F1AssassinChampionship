import { useMemo, useState, useEffect } from 'react';
import { Driver, Constructor, Race } from '../../types';
import { motion } from 'motion/react';
import { Swords, Trophy, Timer, AlertTriangle, Maximize2, Minimize2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useChampionship } from '../../context/ChampionshipContext';

interface TeammateBattlesProps {
  drivers: Driver[];
  constructors: Constructor[];
  races: Race[];
}

export function TeammateBattles({ drivers, constructors, races }: TeammateBattlesProps) {
  const { isHistorical } = useChampionship();
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    if (constructors.length > 0 && selectedTeams.length === 0) {
      setSelectedTeams(constructors.map(c => c.id));
    }
  }, [constructors]);

  const toggleTeam = (id: string) => {
    setSelectedTeams(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);
  };

  const battles = useMemo(() => {
    const completedRaces = races.filter(r => r.status === 'completed' && r.results);
    
    return constructors.map(constructor => {
      const teamDrivers = drivers.filter(d => d.team === constructor.name);
      if (teamDrivers.length < 2) return null; // Support teams with 2 or more drivers

      // Take the top 2 drivers by points for the H2H
      const topDrivers = [...teamDrivers].sort((a, b) => b.points - a.points);
      const driverA = topDrivers[0];
      const driverB = topDrivers[1];
      
      let aWins = 0;
      let bWins = 0;
      let aFastestLaps = 0;
      let bFastestLaps = 0;
      let aPodiums = 0;
      let bPodiums = 0;
      let aDnfs = 0;
      let bDnfs = 0;

      completedRaces.forEach(race => {
        const resA = race.results!.find(r => r.driverId === driverA.id);
        const resB = race.results!.find(r => r.driverId === driverB.id);

        if (resA && resB) {
          // Race H2H (only count if both participated, even if one DNF'd)
          // If both DNF, neither wins the H2H for that race
          if (!resA.dnf && !resA.isDisqualified && (resB.dnf || resB.isDisqualified || resA.position < resB.position)) {
            aWins++;
          } else if (!resB.dnf && !resB.isDisqualified && (resA.dnf || resA.isDisqualified || resB.position < resA.position)) {
            bWins++;
          }
        }

        if (resA) {
          if (resA.fastestLap) aFastestLaps++;
          if (resA.position <= 3 && !resA.dnf && !resA.isDisqualified) aPodiums++;
          if (resA.dnf || resA.isDisqualified) aDnfs++;
        }
        
        if (resB) {
          if (resB.fastestLap) bFastestLaps++;
          if (resB.position <= 3 && !resB.dnf && !resB.isDisqualified) bPodiums++;
          if (resB.dnf || resB.isDisqualified) bDnfs++;
        }
      });

      return {
        constructor,
        driverA: { ...driverA, h2h: aWins, fastestLaps: aFastestLaps, podiums: aPodiums, dnfs: aDnfs },
        driverB: { ...driverB, h2h: bWins, fastestLaps: bFastestLaps, podiums: bPodiums, dnfs: bDnfs },
        totalRaces: aWins + bWins
      };
    }).filter(Boolean);
  }, [drivers, constructors, races]);

  if (battles.length === 0) return null;

  const visibleBattles = battles.filter(b => selectedTeams.includes(b.constructor.id));

  return (
    <div className="w-full mt-12">
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2 rounded-lg",
              isHistorical ? "bg-amber-500/20 text-amber-500" : "bg-red-500/20 text-red-500"
            )}>
              <Swords size={24} />
            </div>
            <h2 className="text-2xl font-black italic uppercase tracking-tight text-white">
              Batallas de Compañeros
            </h2>
          </div>
          {/* View Toggle */}
          <button
            onClick={() => setIsCompact(!isCompact)}
            className="text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white flex items-center gap-2 bg-slate-800/50 hover:bg-slate-800 px-3 py-2 rounded-lg border border-white/5 transition-colors"
          >
            {isCompact ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
            <span className="hidden sm:inline">{isCompact ? "Vista Detallada" : "Vista Compacta"}</span>
          </button>
        </div>

        {/* Team Toggles (Logos only) */}
        <div className="flex flex-wrap gap-2 items-center bg-slate-900/40 p-2 rounded-xl border border-white/5">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mx-2 hidden sm:block">Filtros:</span>
          {constructors.map(c => {
            const isSelected = selectedTeams.includes(c.id);
            return (
              <button
                key={c.id}
                onClick={() => toggleTeam(c.id)}
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all border-2",
                  isSelected ? "opacity-100 scale-110 shadow-lg" : "opacity-30 border-transparent hover:opacity-60 hover:scale-100 bg-slate-800"
                )}
                style={isSelected ? { borderColor: c.color, backgroundColor: `${c.color}20` } : {}}
                title={c.name}
              >
                {c.logoUrl ? (
                  <img src={c.logoUrl} alt={c.name} className="w-6 h-6 object-contain" />
                ) : (
                  <span className="text-xs font-bold text-white">{c.name.charAt(0)}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className={cn(
        "grid gap-6",
        isCompact ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1 lg:grid-cols-2"
      )}>
        {visibleBattles.map((battle, idx) => {
          if (!battle) return null;
          const { constructor, driverA, driverB, totalRaces } = battle;
          
          // Calculate percentage for the progress bar
          const aPercent = totalRaces === 0 ? 50 : (driverA.h2h / totalRaces) * 100;
          const bPercent = totalRaces === 0 ? 50 : (driverB.h2h / totalRaces) * 100;

          return (
            <motion.div
              key={constructor.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-slate-900/50 border border-white/5 rounded-2xl p-6 relative overflow-hidden group"
            >
              {/* Background Team Color Glow */}
              <div 
                className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity duration-500"
                style={{ background: `linear-gradient(135deg, ${constructor.color}, transparent)` }}
              />

              {/* Team Header */}
              <div className={cn("flex items-center relative z-10", isCompact ? "justify-between mb-4 gap-2" : "justify-between mb-6")}>
                <div className="flex items-center gap-3 min-w-0">
                  {constructor.logoUrl ? (
                    <img src={constructor.logoUrl} alt={constructor.name} className={cn("object-contain shrink-0", isCompact ? "w-6 h-6" : "w-8 h-8")} />
                  ) : (
                    <div className={cn("rounded-full bg-slate-800 flex items-center justify-center shrink-0", isCompact ? "w-6 h-6" : "w-8 h-8")}>
                      <span className={cn("font-bold text-white", isCompact ? "text-[10px]" : "text-xs")}>{constructor.name.charAt(0)}</span>
                    </div>
                  )}
                  <h3 className={cn("font-black uppercase tracking-wider text-white truncate", isCompact ? "text-sm" : "text-lg")}>
                    {constructor.name}
                  </h3>
                </div>
                <div 
                  className={cn("rounded-full font-bold whitespace-nowrap shrink-0", isCompact ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs")}
                  style={{ backgroundColor: `${constructor.color}20`, color: constructor.color }}
                >
                  {constructor.points} PTS
                </div>
              </div>

              {/* H2H Bar */}
              <div className={cn("flex items-center justify-between relative z-10", isCompact ? "mb-1" : "mb-2")}>
                <span className={cn("font-black", isCompact ? "text-lg" : "text-xl", driverA.h2h > driverB.h2h ? "text-white" : "text-slate-500")}>
                  {driverA.h2h}
                </span>
                <span className={cn("font-mono text-slate-500 uppercase tracking-widest", isCompact ? "text-[10px]" : "text-xs")}>Carreras</span>
                <span className={cn("font-black", isCompact ? "text-lg" : "text-xl", driverB.h2h > driverA.h2h ? "text-white" : "text-slate-500")}>
                  {driverB.h2h}
                </span>
              </div>
              
              <div className={cn("w-full bg-slate-800 rounded-full overflow-hidden flex relative z-10", isCompact ? "h-2 mb-2" : "h-3 mb-4")}>
                <motion.div 
                  initial={{ width: '50%' }}
                  whileInView={{ width: `${aPercent}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full"
                  style={{ backgroundColor: constructor.color }}
                />
                <motion.div 
                  initial={{ width: '50%' }}
                  whileInView={{ width: `${bPercent}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-slate-600"
                />
              </div>

              {/* Drivers Info & Stats */}
              {!isCompact && (
                <div className="flex justify-between relative z-10 mt-4">
                  {/* Driver A */}
                  <div className="flex flex-col w-1/2 pr-4 border-r border-white/10">
                  <div className="flex items-center gap-3 mb-4">
                    {driverA.avatarUrl ? (
                      <img src={driverA.avatarUrl} alt={driverA.name} className="w-10 h-10 rounded-full object-cover border-2" style={{ borderColor: constructor.color }} />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-slate-800 border-2 flex items-center justify-center" style={{ borderColor: constructor.color }}>
                        <span className="text-sm font-bold text-white">{driverA.name.substring(0, 2).toUpperCase()}</span>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-black text-white uppercase">{driverA.name}</p>
                      <p className="text-xs font-mono text-slate-400">{driverA.points} pts</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 flex items-center gap-1"><Trophy size={12} /> Podios</span>
                      <span className="font-bold text-white">{driverA.podiums}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 flex items-center gap-1"><Timer size={12} /> V. Rápidas</span>
                      <span className="font-bold text-white">{driverA.fastestLaps}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 flex items-center gap-1"><AlertTriangle size={12} /> DNF</span>
                      <span className="font-bold text-white">{driverA.dnfs}</span>
                    </div>
                  </div>
                </div>

                {/* Driver B */}
                <div className="flex flex-col w-1/2 pl-4 items-end text-right">
                  <div className="flex items-center gap-3 mb-4 flex-row-reverse">
                    {driverB.avatarUrl ? (
                      <img src={driverB.avatarUrl} alt={driverB.name} className="w-10 h-10 rounded-full object-cover border-2" style={{ borderColor: constructor.color }} />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-slate-800 border-2 flex items-center justify-center" style={{ borderColor: constructor.color }}>
                        <span className="text-sm font-bold text-white">{driverB.name.substring(0, 2).toUpperCase()}</span>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-black text-white uppercase">{driverB.name}</p>
                      <p className="text-xs font-mono text-slate-400">{driverB.points} pts</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 w-full">
                    <div className="flex items-center justify-between text-xs flex-row-reverse">
                      <span className="text-slate-500 flex items-center gap-1 flex-row-reverse"><Trophy size={12} /> Podios</span>
                      <span className="font-bold text-white">{driverB.podiums}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs flex-row-reverse">
                      <span className="text-slate-500 flex items-center gap-1 flex-row-reverse"><Timer size={12} /> V. Rápidas</span>
                      <span className="font-bold text-white">{driverB.fastestLaps}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs flex-row-reverse">
                      <span className="text-slate-500 flex items-center gap-1 flex-row-reverse"><AlertTriangle size={12} /> DNF</span>
                      <span className="font-bold text-white">{driverB.dnfs}</span>
                    </div>
                  </div>
                </div>
              </div>
              )}
              
              {/* Compact Mode Driver Names */}
              {isCompact && (
                <div className="flex justify-between items-center relative z-10 text-xs font-black uppercase tracking-wider mt-2">
                  <div className="flex flex-col w-1/2 pr-3 border-r border-white/10 min-w-0">
                    <span className="text-white truncate">{driverA.name}</span>
                    <span className="text-slate-400 font-mono text-[10px]">{driverA.points} pts</span>
                  </div>
                  <div className="flex flex-col w-1/2 pl-3 text-right min-w-0">
                    <span className="text-white truncate">{driverB.name}</span>
                    <span className="text-slate-400 font-mono text-[10px]">{driverB.points} pts</span>
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
