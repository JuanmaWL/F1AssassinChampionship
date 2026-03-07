import React, { useState, useMemo } from 'react';
import { ChampionshipData, Race, SeasonId, RaceResult } from '../types';
import { Calendar as CalendarIcon, MapPin, ChevronRight, X, LayoutGrid, List, Timer, Clock, Wrench, AlertTriangle, FileText, Trophy, Medal, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, formatDate } from '../lib/utils';
import ReactMarkdown from 'react-markdown';

interface CalendarProps {
  data: ChampionshipData;
  activeSeason: SeasonId;
}

export function Calendar({ data, activeSeason }: CalendarProps) {
  const [selectedRace, setSelectedRace] = useState<Race | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>({ key: 'position', direction: 'asc' });

  const getDriverName = (id: string) => data.drivers.find((d) => d.id === id)?.name || id;
  const getTeamColor = (id: string) => data.drivers.find((d) => d.id === id)?.teamColor || '#fff';
  const getTeamName = (id: string) => data.drivers.find((d) => d.id === id)?.team || 'Unknown';
  const getTeamLogo = (id: string) => {
    const driver = data.drivers.find((d) => d.id === id);
    if (!driver) return undefined;
    const team = data.constructors.find((c) => c.name === driver.team);
    return team?.logoUrl;
  };

  const isHistorical = activeSeason === '2024';
  const accentColor = isHistorical ? "text-amber-500" : "text-red-500";
  const hoverBorderColor = isHistorical ? "hover:border-amber-500/50" : "hover:border-red-500/50";
  const statusColor = isHistorical ? "bg-amber-500 group-hover:bg-amber-400" : "bg-green-500 group-hover:bg-green-400";

  const sortedResults = useMemo(() => {
    if (!selectedRace?.results) return [];
    let sortableItems = [...selectedRace.results];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let aValue: any = a[sortConfig.key as keyof RaceResult];
        let bValue: any = b[sortConfig.key as keyof RaceResult];

        // Handle special cases
        if (sortConfig.key === 'driver') {
            aValue = getDriverName(a.driverId);
            bValue = getDriverName(b.driverId);
        }
        if (sortConfig.key === 'team') {
            aValue = getTeamName(a.driverId);
            bValue = getTeamName(b.driverId);
        }

        // Handle nulls/undefined
        if (aValue === undefined || aValue === null) return 1;
        if (bValue === undefined || bValue === null) return -1;

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [selectedRace, sortConfig, data]);

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const SortIcon = ({ columnKey }: { columnKey: string }) => {
      if (sortConfig?.key !== columnKey) return <ArrowUpDown size={12} className="opacity-30" />;
      return sortConfig.direction === 'asc' ? <ArrowUp size={12} className="text-white" /> : <ArrowDown size={12} className="text-white" />;
  };

  return (
    <div className="pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <h2 className="text-3xl font-black italic text-white uppercase tracking-tighter flex items-center gap-3">
            <CalendarIcon className={cn("w-8 h-8", accentColor)} />
            Calendario de Carreras
        </h2>
        
        {/* View Toggle */}
        {data.races.length > 0 && (
          <div className="bg-slate-900 p-1 rounded-lg border border-white/10 hidden md:flex items-center self-start md:self-auto">
              <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                      "p-2 rounded-md transition-all flex items-center gap-2 text-sm font-bold uppercase",
                      viewMode === 'list' ? "bg-slate-800 text-white shadow-sm" : "text-slate-500 hover:text-slate-300"
                  )}
              >
                  <List size={18} />
                  Lista
              </button>
              <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                      "p-2 rounded-md transition-all flex items-center gap-2 text-sm font-bold uppercase",
                      viewMode === 'grid' ? "bg-slate-800 text-white shadow-sm" : "text-slate-500 hover:text-slate-300"
                  )}
              >
                  <LayoutGrid size={18} />
                  Grid
              </button>
          </div>
        )}
      </div>

      {data.races.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-12 flex flex-col items-center justify-center text-center"
        >
          <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mb-6 border border-white/5">
            <CalendarIcon className="text-slate-500 w-10 h-10" />
          </div>
          <h3 className="text-2xl font-black italic text-white uppercase tracking-tighter mb-3">Calendario Pendiente</h3>
          <p className="text-slate-400 text-sm max-w-md mx-auto font-mono uppercase tracking-widest leading-relaxed">
            La FIA está ultimando las fechas de la temporada. Vuelve pronto para conocer el calendario oficial de este campeonato.
          </p>
          <div className="mt-8 flex gap-3">
              {[1, 2, 3].map(i => (
                  <div key={i} className={cn("w-3 h-1 rounded-full animate-pulse", isHistorical ? "bg-amber-500/30" : "bg-red-500/30")} style={{ animationDelay: `${i * 0.2}s` }} />
              ))}
          </div>
        </motion.div>
      ) : (
        <div className={cn(
            "gap-4",
            viewMode === 'list' ? "space-y-4" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
        )}>
        {data.races.map((race, index) => (
          <motion.div
            key={race.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={cn(
              "group relative transition-all duration-300 hover:z-50", // Added hover:z-50 and relative
              viewMode === 'list' ? "flex items-center gap-6" : "h-full"
            )}
          >
            {/* List View Number - Outside */}
            {viewMode === 'list' && (
                <div className={cn(
                    "text-5xl font-black italic text-slate-800 transition-colors duration-300 min-w-[3.5rem] text-right select-none",
                    isHistorical ? "group-hover:text-amber-600" : "group-hover:text-red-600"
                )}>
                    {index + 1}
                </div>
            )}

            <div
                onClick={() => race.status === 'completed' && setSelectedRace(race)}
                className={cn(
                  "relative rounded-xl border transition-all duration-300 w-full group", // Removed overflow-hidden
                  // Hover Animations
                  "hover:shadow-2xl hover:-translate-y-1",
                  isHistorical ? "hover:shadow-amber-900/10" : "hover:shadow-red-900/10",
                  race.status === 'completed'
                    ? cn("bg-slate-900/60 border-white/10 cursor-pointer hover:bg-slate-800/80", hoverBorderColor)
                    : "bg-slate-950/40 border-white/5 opacity-75",
                  viewMode === 'list' ? "p-6" : "p-6 flex flex-col h-full min-h-[200px]"
                )}
            >
                {/* Background Container - Handles clipping for images/flags */}
                <div className="absolute inset-0 overflow-hidden rounded-xl z-0">
                    {/* Circuit Background Image (Fictional/Placeholder) */}
                    <div 
                        className={cn(
                            "absolute inset-0 opacity-10 pointer-events-none grayscale group-hover:grayscale-0 transition-all duration-500",
                            isHistorical && "sepia"
                        )}
                        style={{
                            backgroundImage: `url(https://picsum.photos/seed/${race.circuit.replace(/\s/g, '')}/800/400)`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                        }}
                    />

                    {/* Grid View Number - Inside */}
                    {viewMode === 'grid' && (
                        <div className="absolute bottom-0 right-0 text-[160px] leading-[0.75] font-black italic text-white/5 group-hover:text-white/10 transition-colors select-none pointer-events-none z-0">
                            {index + 1}
                        </div>
                    )}
                    
                    {/* Checkered Flag Fade for Completed Races - Increased Opacity */}
                    {race.status === 'completed' && (
                        <div 
                            className="absolute inset-y-0 right-0 w-1/2 opacity-40 pointer-events-none z-0" 
                            style={{
                                backgroundImage: `
                                    linear-gradient(to right, transparent, #000),
                                    repeating-conic-gradient(#333 0% 25%, transparent 0% 50%)
                                `,
                                backgroundSize: '100% 100%, 20px 20px',
                                maskImage: 'linear-gradient(to left, black, transparent)'
                            }}
                        />
                    )}
                    
                    {/* Status Indicator Strip */}
                    <div className={cn(
                      "absolute left-0 top-0 bottom-0 w-1.5 z-10 transition-all duration-300 group-hover:w-2",
                      race.status === 'completed' ? statusColor : "bg-slate-700 group-hover:bg-slate-600"
                    )} />
                </div>

                <div className={cn(
                    "flex justify-between gap-4 pl-4 h-full relative z-10",
                    viewMode === 'list' ? "flex-col md:flex-row md:items-center" : "flex-col"
                )}>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className={cn("text-sm font-mono uppercase tracking-widest", isHistorical ? "text-amber-400" : "text-red-400")}>
                        {formatDate(race.date)}
                      </span>
                    </div>
                    <h3 className={cn(
                        "font-black italic text-white uppercase tracking-tight transition-colors flex items-center gap-3",
                        isHistorical ? "group-hover:text-amber-500" : "group-hover:text-red-500",
                        viewMode === 'list' ? "text-xl" : "text-2xl"
                    )}>
                      {race.name}
                      {race.flagCode && (
                          <img 
                              src={`https://flagcdn.com/w40/${race.flagCode}.png`} 
                              alt={race.flagCode} 
                              className="h-5 w-auto rounded shadow-sm object-cover"
                          />
                      )}
                    </h3>
                    <div className="flex items-center gap-2 text-slate-400 text-sm mt-1">
                      <MapPin size={14} />
                      {race.circuit}
                    </div>
                  </div>

                  {race.status === 'completed' && race.results && (
                    <div className={cn(
                        "flex items-center gap-4",
                        viewMode === 'grid' ? "mt-auto pt-4 border-t border-white/5 justify-between" : ""
                    )}>
                      <div className="flex -space-x-2 items-end translate-y-1">
                        {race.results.slice(0, 3).map((result, i) => (
                          <div key={result.driverId} className="group/tooltip relative z-10 hover:z-[100] transition-all">
                              <div
                                className={cn(
                                  "relative flex items-center justify-center font-black italic text-white shadow-lg transition-transform group-hover/tooltip:scale-110 group-hover/tooltip:-translate-y-2",
                                  i === 0 ? "w-16 h-16 z-20 bg-gradient-to-br from-yellow-300 to-yellow-600 border-2 border-yellow-200 rounded-xl rotate-3 shadow-[0_0_20px_rgba(234,179,8,0.4)]" : 
                                  i === 1 ? "w-12 h-12 bg-gradient-to-br from-slate-200 to-slate-400 border border-slate-100 rounded-lg -rotate-3 shadow-[0_0_15px_rgba(148,163,184,0.3)]" :
                                  "w-9 h-9 bg-gradient-to-br from-orange-400 to-orange-700 border border-orange-300 rounded-lg rotate-6 shadow-[0_0_15px_rgba(249,115,22,0.3)]"
                                )}
                              >
                                <span className="drop-shadow-md text-lg">{i === 0 ? '1' : i === 1 ? '2' : '3'}</span>
                                {i === 0 && <Trophy size={18} className="absolute -top-6 text-yellow-300 drop-shadow-[0_0_5px_rgba(253,224,71,0.8)]" />}
                              </div>
                              
                              {/* Custom Tooltip - F1 Podium Style */}
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-max opacity-0 group-hover/tooltip:opacity-100 transition-all duration-200 pointer-events-none z-[100] transform translate-y-2 group-hover/tooltip:translate-y-0">
                                  <div className={cn(
                                      "rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden min-w-[180px] border-2",
                                      i === 0 ? "border-yellow-400 bg-slate-900" : 
                                      i === 1 ? "border-slate-300 bg-slate-900" : 
                                      "border-orange-500 bg-slate-900"
                                  )}>
                                      {/* Podium Header */}
                                      <div className={cn(
                                          "px-4 py-2 text-xs font-black uppercase tracking-widest text-center flex items-center justify-center gap-2",
                                          i === 0 ? "bg-yellow-400 text-black" : 
                                          i === 1 ? "bg-slate-300 text-black" : 
                                          "bg-orange-500 text-white"
                                      )}>
                                          {i === 0 && <Trophy size={14} className="fill-current" />}
                                          {i === 0 ? 'GANADOR' : i === 1 ? '2º LUGAR' : '3º LUGAR'}
                                      </div>
                                      
                                      <div className="p-4 flex flex-col items-center gap-3 bg-slate-900 relative">
                                        {/* Podium Glow Effect */}
                                        <div className={cn(
                                            "absolute top-0 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full blur-[40px] opacity-20 pointer-events-none",
                                            i === 0 ? "bg-yellow-500" : i === 1 ? "bg-slate-400" : "bg-orange-500"
                                        )} />

                                        {/* Team Logo */}
                                        {getTeamLogo(result.driverId) ? (
                                            <div className="w-16 h-16 flex items-center justify-center filter drop-shadow-2xl relative z-10">
                                                <img src={getTeamLogo(result.driverId)} alt="Team" className="w-full h-full object-contain" />
                                            </div>
                                        ) : (
                                            <div className="w-12 h-12 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center relative z-10">
                                                <span className="font-bold text-lg text-slate-500">?</span>
                                            </div>
                                        )}
                                        
                                        <div className="text-center relative z-10">
                                            <div className="font-black italic text-lg tracking-tighter leading-none mb-1.5 text-white">
                                                {getDriverName(result.driverId)}
                                            </div>
                                            <div className="flex items-center justify-center gap-1.5 bg-white/5 rounded-full px-3 py-1 border border-white/10">
                                                <div 
                                                    className="w-2 h-2 rounded-full shadow-[0_0_5px_currentColor]"
                                                    style={{ backgroundColor: getTeamColor(result.driverId), color: getTeamColor(result.driverId) }}
                                                />
                                                <span className="text-[10px] uppercase tracking-wider text-slate-300 font-bold">
                                                    {getTeamName(result.driverId)}
                                                </span>
                                            </div>
                                        </div>
                                      </div>
                                  </div>
                                  {/* Tooltip Arrow */}
                                  <div className={cn(
                                      "w-4 h-4 transform rotate-45 absolute left-1/2 -translate-x-1/2 -bottom-2 border-r border-b border-white/10",
                                      i === 0 ? "bg-slate-900 border-yellow-400" : 
                                      i === 1 ? "bg-slate-900 border-slate-300" : 
                                      "bg-slate-900 border-orange-500"
                                  )}></div>
                              </div>
                          </div>
                        ))}
                      </div>
                      <ChevronRight className="text-slate-600 group-hover:text-white transition-colors transform group-hover:translate-x-1" />
                    </div>
                  )}
                  
                  {race.status === 'pending' && (
                     <div className={cn(
                        viewMode === 'grid' ? "mt-auto pt-4" : ""
                     )}>
                        <div className="inline-block px-4 py-2 rounded-full bg-slate-800/50 border border-white/5 text-xs font-mono text-slate-400 uppercase backdrop-blur-sm group-hover:bg-slate-700/50 transition-colors">
                            Pendiente
                        </div>
                     </div>
                  )}
                </div>
            </div>
          </motion.div>
        ))}
      </div>
      )}

      {/* Race Details Modal */}
      <AnimatePresence>
        {selectedRace && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedRace(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-slate-900 border border-white/10 w-full max-w-6xl max-h-[85vh] overflow-y-auto rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Enhanced Header with Background - Fixed on scroll */}
              <div className="sticky top-0 z-20 overflow-hidden border-b border-white/10 bg-slate-900 shadow-xl">
                  {/* Background Image with Overlay */}
                  <div 
                      className="absolute inset-0 z-0 opacity-40 grayscale"
                      style={{
                          backgroundImage: `url(https://picsum.photos/seed/${selectedRace.circuit.replace(/\s/g, '')}/1200/400)`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center'
                      }}
                  />
                  <div className="absolute inset-0 z-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-transparent" />
                  
                  <div className="relative z-10 p-8 flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <span className={cn("text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg", isHistorical ? "bg-amber-600" : "bg-red-600")}>
                                Ronda {data.races.findIndex(r => r.id === selectedRace.id) + 1}
                            </span>
                            <span className="text-slate-300 text-sm font-mono flex items-center gap-2 bg-black/30 px-3 py-1 rounded-full border border-white/10">
                                <Clock size={12} />
                                {formatDate(selectedRace.date)}
                            </span>
                        </div>
                        <h3 className="text-4xl md:text-5xl font-black italic text-white uppercase tracking-tighter drop-shadow-2xl">
                            {selectedRace.name}
                        </h3>
                        <p className="text-slate-300 flex items-center gap-2 text-lg mt-2 font-medium">
                            <MapPin size={18} className={isHistorical ? "text-amber-500" : "text-red-500"} /> 
                            {selectedRace.circuit}
                        </p>
                    </div>
                    <button
                        onClick={() => setSelectedRace(null)}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors text-white bg-black/20 backdrop-blur-md border border-white/10"
                    >
                        <X size={24} />
                    </button>
                  </div>
              </div>

              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-slate-500">
                        <th 
                            className="py-3 px-2 w-16 text-center cursor-pointer hover:text-white transition-colors group"
                            onClick={() => requestSort('position')}
                        >
                            <div className="flex items-center justify-center gap-1">
                                Pos <SortIcon columnKey="position" />
                            </div>
                        </th>
                        <th 
                            className="py-3 px-2 cursor-pointer hover:text-white transition-colors group"
                            onClick={() => requestSort('driver')}
                        >
                            <div className="flex items-center gap-1">
                                Piloto <SortIcon columnKey="driver" />
                            </div>
                        </th>
                        <th 
                            className="py-3 px-2 hidden sm:table-cell cursor-pointer hover:text-white transition-colors group"
                            onClick={() => requestSort('team')}
                        >
                            <div className="flex items-center gap-1">
                                Equipo <SortIcon columnKey="team" />
                            </div>
                        </th>
                        <th 
                            className="py-3 px-2 text-right cursor-pointer hover:text-white transition-colors group"
                            onClick={() => requestSort('raceTime')}
                        >
                            <div className="flex items-center justify-end gap-1">
                                <Clock size={14} /> Tiempo <SortIcon columnKey="raceTime" />
                            </div>
                        </th>
                        <th 
                            className="py-3 px-2 text-right cursor-pointer hover:text-white transition-colors group"
                            onClick={() => requestSort('fastestLap')}
                        >
                            <div className="flex items-center justify-end gap-1">
                                <Timer size={14} /> VR <SortIcon columnKey="fastestLap" />
                            </div>
                        </th>
                        <th 
                            className="py-3 px-2 text-center cursor-pointer hover:text-white transition-colors group"
                            onClick={() => requestSort('pitStops')}
                        >
                            <div className="flex items-center justify-center gap-1">
                                <Wrench size={14} /> Pits <SortIcon columnKey="pitStops" />
                            </div>
                        </th>
                        <th 
                            className="py-3 px-2 text-right cursor-pointer hover:text-white transition-colors group"
                            onClick={() => requestSort('points')}
                        >
                            <div className="flex items-center justify-end gap-1">
                                Pts <SortIcon columnKey="points" />
                            </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedResults.map((result) => (
                        <tr
                          key={result.driverId}
                          className={cn(
                              "border-b border-white/5 transition-colors",
                              result.isSanctioned ? "bg-red-500/10 hover:bg-red-500/20" : "hover:bg-white/5"
                          )}
                        >
                          <td className="py-3 px-2 font-mono text-center font-bold">
                            {result.dnf ? (
                                <span className="text-red-500">DNF</span>
                            ) : result.isDisqualified ? (
                                <span className="text-red-600">DSQ</span>
                            ) : (
                                <div className="group/pos relative flex justify-center cursor-help">
                                    <span className={cn(
                                        "relative transition-colors",
                                        result.isSanctioned ? "text-red-400" :
                                        (result.originalPosition && result.originalPosition !== result.position) ? "text-blue-400" : "text-slate-400",
                                        (result.originalPosition && result.originalPosition !== result.position) && "underline decoration-dotted decoration-white/30 underline-offset-4"
                                    )}>
                                        {result.position}
                                        
                                        {/* Indicator dot if changed */}
                                        {(result.originalPosition && result.originalPosition !== result.position) && (
                                            <span className="absolute -top-1 -right-2 flex h-2 w-2">
                                              <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", result.isSanctioned ? "bg-red-400" : "bg-blue-400")}></span>
                                              <span className={cn("relative inline-flex rounded-full h-2 w-2", result.isSanctioned ? "bg-red-500" : "bg-blue-500")}></span>
                                            </span>
                                        )}
                                    </span>

                                    {/* Enhanced Original Position Tooltip */}
                                    {result.originalPosition && result.originalPosition !== result.position && (
                                        <div className="absolute bottom-full left-0 mb-3 min-w-[160px] opacity-0 group-hover/pos:opacity-100 transition-all duration-200 pointer-events-none z-50 transform translate-y-2 group-hover/pos:translate-y-0">
                                            <div className="bg-slate-900 text-white text-xs rounded-lg shadow-2xl border border-white/10 overflow-hidden">
                                                <div className={cn(
                                                    "px-3 py-1.5 border-b border-white/5 font-bold uppercase tracking-wider text-[10px] text-center",
                                                    result.isSanctioned ? "bg-red-500/20 text-red-300" : "bg-blue-500/20 text-blue-300"
                                                )}>
                                                    {result.isSanctioned ? "Sancionado" : "Posición Original"}
                                                </div>
                                                <div className="p-3 text-center font-mono text-lg font-bold flex items-center justify-center gap-2">
                                                    <span className="text-slate-400 line-through decoration-red-500/50">{result.originalPosition}</span>
                                                    <span className="text-slate-600 text-xs">➔</span>
                                                    <span className={cn(result.isSanctioned ? "text-red-400" : "text-blue-400")}>{result.position}</span>
                                                </div>
                                            </div>
                                            {/* Arrow */}
                                            <div className="w-2 h-2 bg-slate-900 border-r border-b border-white/10 transform rotate-45 absolute left-4 -bottom-1"></div>
                                        </div>
                                    )}
                                </div>
                            )}
                          </td>
                          <td className="py-3 px-2">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-1.5 h-6 -skew-x-12"
                                style={{ backgroundColor: getTeamColor(result.driverId) }}
                              />
                              <div>
                                <div className="font-bold text-white flex items-center gap-2">
                                    {getDriverName(result.driverId)}
                                    {result.isSanctioned && (
                                        <span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded border border-red-500/30 font-mono flex items-center gap-1" title={result.penalty || "Sancionado"}>
                                            <AlertTriangle size={10} />
                                            {result.penalty || "PEN"}
                                        </span>
                                    )}
                                    {result.fastestLap && !result.dnf && (
                                        <span className="text-[10px] bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded border border-purple-500/30 font-mono flex items-center gap-1" title="Vuelta Rápida">
                                        <Timer size={10} />
                                        </span>
                                    )}
                                </div>
                                <div className="text-xs text-slate-500 sm:hidden flex items-center gap-1 mt-0.5">
                                    {getTeamLogo(result.driverId) && (
                                        <img src={getTeamLogo(result.driverId)} alt="Team Logo" className="w-3 h-3 object-contain" />
                                    )}
                                    {getTeamName(result.driverId)}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-2 text-sm text-slate-400 hidden sm:table-cell">
                            <div className="flex items-center gap-2">
                                {getTeamLogo(result.driverId) && (
                                    <img src={getTeamLogo(result.driverId)} alt="Team Logo" className="w-5 h-5 object-contain" />
                                )}
                                {getTeamName(result.driverId)}
                            </div>
                          </td>
                          <td className="py-3 px-2 text-right font-mono text-sm text-slate-300">
                            {result.dnf ? '-' : (result.raceTime || '-')}
                          </td>
                          <td className={cn(
                              "py-3 px-2 text-right font-mono text-sm",
                              result.fastestLap ? "text-purple-400 font-bold" : "text-slate-500"
                          )}>
                            {result.dnf ? '-' : (result.fastestLapTime || '-')}
                          </td>
                          <td className="py-3 px-2 text-center font-mono text-sm text-slate-500">
                            {result.dnf ? '-' : (result.pitStops || 0)}
                          </td>
                          <td className="py-3 px-2 text-right font-mono font-bold text-white">
                            {(result.dnf || result.isDisqualified) ? <span className="text-slate-600">0</span> : `+${result.points}`}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Race Report Display */}
                {selectedRace.raceReport && (
                    <div className="mt-8 pt-8 border-t border-white/10">
                        <h4 className="text-lg font-bold text-white italic uppercase mb-4 flex items-center gap-2">
                            <FileText size={18} className="text-slate-400" />
                            Reporte de Comisarios
                        </h4>
                        <div className="bg-slate-950/50 rounded-xl p-6 border border-white/5 text-sm text-slate-300 leading-relaxed prose prose-invert prose-sm max-w-none">
                            <ReactMarkdown>{selectedRace.raceReport}</ReactMarkdown>
                        </div>
                    </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
