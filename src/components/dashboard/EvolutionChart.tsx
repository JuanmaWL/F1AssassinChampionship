import { useState, useMemo, useEffect, useRef } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Brush
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { ChampionshipData, Driver, Constructor } from '../../types';
import { cn } from '../../lib/utils';
import { Users, Trophy, TrendingUp, Hash, Maximize, Minimize, Activity, LayoutList, MousePointerClick, Eye, EyeOff } from 'lucide-react';

interface EvolutionChartProps {
  data: ChampionshipData;
}

interface TooltipPayloadEntry {
  dataKey: string;
  color: string;
  payload: Record<string, number | string>;
}

interface DotRenderProps {
  cx?: number;
  cy?: number;
  payload?: Record<string, number | string>;
  dataKey?: string | number | ((obj: any) => any);
  stroke?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string;
  viewType: 'drivers' | 'constructors';
  metric: 'points' | 'position';
  constructors: Constructor[];
}

const CustomTooltip = ({ active, payload, label, viewType, metric, constructors }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    // Sort payload by the actual position in that race
    const sortedPayload = [...payload].sort((a, b) => {
      const posA = a.payload[`${a.dataKey}_pos`] || 99;
      const posB = b.payload[`${b.dataKey}_pos`] || 99;
      return (posA as number) - (posB as number);
    });

    return (
      <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700 p-4 rounded-xl shadow-2xl min-w-[200px] z-[9999]">
        <p className="text-slate-200 font-black italic mb-3 border-b border-white/10 pb-2 uppercase tracking-wider">{label}</p>
        <div className="flex flex-col gap-1.5">
          {sortedPayload.map((entry, index) => {
            const constructor = viewType === 'constructors' ? constructors.find(c => c.name === entry.dataKey) : null;
            const pos = entry.payload[`${entry.dataKey}_pos`];
            const pts = entry.payload[`${entry.dataKey}_pts`];
            return (
              <div key={index} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full shadow-sm shrink-0" style={{ backgroundColor: entry.color }} />
                {constructor && constructor.logoUrl && (
                  <img src={constructor.logoUrl} alt={constructor.name} className="w-4 h-4 object-contain filter drop-shadow-md" />
                )}
                <span className="text-slate-300 text-[10px] font-medium truncate max-w-[70px]" title={entry.dataKey}>{entry.dataKey}</span>
                <span className="text-white font-bold text-[10px] ml-auto font-mono">
                  P{pos} <span className="text-slate-500">({pts})</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  return null;
};

export function EvolutionChart({ data }: EvolutionChartProps) {
  const [viewType, setViewType] = useState<'drivers' | 'constructors'>('drivers');
  const [metric, setMetric] = useState<'points' | 'position'>('points');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showLegend, setShowLegend] = useState(true);
  const [isLegendTransitioning, setIsLegendTransitioning] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const LEGEND_DURATION = 0.4; // Segundos

  const toggleLegend = () => {
    setIsLegendTransitioning(true);
    setShowLegend(!showLegend);
    
    // Esperamos a que termine la animación de la leyenda para volver a renderizar el gráfico
    setTimeout(() => {
      setIsLegendTransitioning(false);
    }, LEGEND_DURATION * 1000 + 50); // +50ms de margen de seguridad
  };
  
  const allDriversCount = data.drivers.length;
  const allConstructorsCount = data.constructors.length;
  
  const sortedDrivers = useMemo(() => [...data.drivers].sort((a, b) => b.points - a.points), [data.drivers]);
  const sortedConstructors = useMemo(() => [...data.constructors].sort((a, b) => b.points - a.points), [data.constructors]);
  
  const [hiddenItems, setHiddenItems] = useState<string[]>([]);

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '200px' }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Reset hidden items when switching views
  useEffect(() => {
    setHiddenItems([]);
  }, [viewType]);

  const chartData = useMemo(() => {
    const completedRaces = data.races.filter(r => r.status === 'completed');
    const isDrivers = viewType === 'drivers';
    const entities = isDrivers ? data.drivers : data.constructors;

    const pointsMap = new Map<string, number>();
    const historyMap = new Map<string, number[]>();

    entities.forEach(e => {
      pointsMap.set(e.id, 0);
      historyMap.set(e.id, []);
    });

    const driverToConstructor = new Map<string, string>();
    if (!isDrivers) {
      data.drivers.forEach(d => {
        const c = data.constructors.find(c => c.name === d.team);
        if (c) driverToConstructor.set(d.id, c.id);
      });
    }

    return completedRaces.map(race => {
      const point: Record<string, number | string> = { name: race.name };

      if (race.results) {
        race.results.forEach(result => {
          if (isDrivers) {
            if (historyMap.has(result.driverId)) {
              historyMap.get(result.driverId)!.push(result.position);
              pointsMap.set(result.driverId, (pointsMap.get(result.driverId) || 0) + result.points);
            }
          } else {
            const cId = driverToConstructor.get(result.driverId);
            if (cId && historyMap.has(cId)) {
              historyMap.get(cId)!.push(result.position);
              pointsMap.set(cId, (pointsMap.get(cId) || 0) + result.points);
            }
          }
        });
      }

      const sorted = [...entities].sort((a, b) => {
        const ptsA = pointsMap.get(a.id) || 0;
        const ptsB = pointsMap.get(b.id) || 0;
        if (ptsA !== ptsB) return ptsB - ptsA;

        const histA = historyMap.get(a.id) || [];
        const histB = historyMap.get(b.id) || [];
        for (let pos = 1; pos <= 25; pos++) {
          const countA = histA.filter(p => p === pos).length;
          const countB = histB.filter(p => p === pos).length;
          if (countA !== countB) return countB - countA;
        }
        return a.name.localeCompare(b.name);
      });

      sorted.forEach((entity, index) => {
        const rank = index + 1;
        const pts = pointsMap.get(entity.id) || 0;
        point[entity.name] = metric === 'points' ? pts : rank;
        point[`${entity.name}_pos`] = rank;
        point[`${entity.name}_pts`] = pts;
      });

      return point;
    });
  }, [data, viewType, metric]);

  const handleLegendClick = (dataKey: string) => {
    setHiddenItems(prev => 
      prev.includes(dataKey) ? prev.filter(k => k !== dataKey) : [...prev, dataKey]
    );
  };

  const renderCustomDot = (props: DotRenderProps) => {
      const { cx = 0, cy = 0, payload = {}, dataKey = '', stroke = '#000' } = props;
      const pos = payload[`${dataKey}_pos`] as number;
      
      if (pos <= 3) {
          const medal = pos === 1 ? '🥇' : pos === 2 ? '🥈' : '🥉';
          return (
              <text x={cx} y={cy} dy={5} dx={0} textAnchor="middle" fontSize={16} className="filter drop-shadow-md cursor-default select-none z-10">
                  {medal}
              </text>
          );
      }
      
      return (
          <circle cx={cx} cy={cy} r={4} fill={stroke} stroke="#0f172a" strokeWidth={2} className="drop-shadow-sm" />
      );
  };

  const renderConstructorDot = (props: DotRenderProps, constructor: Constructor) => {
      const { cx = 0, cy = 0 } = props;
      const size = 22;
      
      return (
          <g transform={`translate(${cx - size/2}, ${cy - size/2})`} className="drop-shadow-md z-10">
              <circle cx={size/2} cy={size/2} r={size/2} fill="#0f172a" stroke={constructor.color} strokeWidth={1.5} />
              {constructor.logoUrl && (
                  <image href={constructor.logoUrl} width={size*0.7} height={size*0.7} x={size*0.15} y={size*0.15} style={{ filter: `drop-shadow(0px 0px 2px ${constructor.color})` }} />
              )}
          </g>
      );
  };

  const positionTicks = useMemo(
    () => Array.from({ length: viewType === 'drivers' ? allDriversCount : allConstructorsCount }, (_, i) => i + 1),
    [viewType, allDriversCount, allConstructorsCount]
  );

  return (
    <>
      {isFullscreen && (
        <div 
          className="fixed inset-0 bg-black/90 z-[90] backdrop-blur-sm" 
          onClick={() => setIsFullscreen(false)} 
        />
      )}
      <motion.div
        ref={containerRef}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        className={cn(
          "bg-slate-900/50 backdrop-blur-md border border-white/10 shadow-2xl flex flex-col",
          isFullscreen ? "fixed inset-2 md:inset-6 z-[100] rounded-3xl bg-slate-950 overflow-hidden" : "rounded-2xl relative overflow-hidden"
        )}
      >
      <div className={cn("p-6 border-b border-white/10 bg-gradient-to-r from-green-900/20 to-transparent flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 shrink-0", isFullscreen ? "mb-6 rounded-xl" : "")}>
        <div className="flex items-center gap-4">
            <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-[0_0_20px_rgba(16,185,129,0.3)] border border-green-400/50">
              <Activity className="w-7 h-7 text-white drop-shadow-md" />
            </div>
            <div>
              <h2 className="text-3xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 uppercase tracking-tighter pr-2">
                Evolución del Campeonato
              </h2>
            </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          {/* View Type Toggle */}
          <div className="flex bg-slate-950/50 p-1 rounded-lg border border-white/5 flex-1 sm:flex-none">
            <button
              onClick={() => setViewType('drivers')}
              className={cn(
                "flex-1 sm:flex-none px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all",
                viewType === 'drivers' 
                  ? "bg-white text-slate-900 shadow-sm" 
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              )}
            >
              <Users size={14} />
              Pilotos
            </button>
            <button
              onClick={() => setViewType('constructors')}
              className={cn(
                "flex-1 sm:flex-none px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all",
                viewType === 'constructors' 
                  ? "bg-white text-slate-900 shadow-sm" 
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              )}
            >
              <Trophy size={14} />
              Escuderías
            </button>
          </div>

          {/* Metric Toggle */}
          <div className="flex bg-slate-950/50 p-1 rounded-lg border border-white/5 flex-1 sm:flex-none">
            <button
              onClick={() => setMetric('points')}
              className={cn(
                "flex-1 sm:flex-none px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all",
                metric === 'points' 
                  ? "bg-amber-500 text-slate-900 shadow-sm" 
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              )}
            >
              <TrendingUp size={14} />
              Puntos
            </button>
            <button
              onClick={() => setMetric('position')}
              className={cn(
                "flex-1 sm:flex-none px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all",
                metric === 'position' 
                  ? "bg-amber-500 text-slate-900 shadow-sm" 
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              )}
            >
              <Hash size={14} />
              Posición
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 ml-auto xl:ml-0">
            {/* Legend Toggle */}
            <button
              onClick={toggleLegend}
              className={cn(
                "p-2 rounded-lg transition-colors border",
                showLegend 
                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30" 
                  : "bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 border-white/5"
              )}
              title={showLegend ? "Ocultar Leyenda" : "Mostrar Leyenda"}
            >
              <LayoutList size={18} />
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors border border-white/5"
              title={isFullscreen ? "Minimizar" : "Pantalla Completa"}
            >
              {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
            </button>
          </div>
        </div>
      </div>

      <div className={cn("flex flex-col lg:flex-row gap-6 p-6", isFullscreen ? "flex-grow min-h-0" : "h-[500px]")}>
        <motion.div 
          layout
          className={cn("flex-grow min-w-0 relative overflow-hidden", isFullscreen ? "h-full" : "h-[400px] lg:h-full")}
        >
          {isVisible ? (
            <ResponsiveContainer 
              width="100%" 
              height="100%" 
              debounce={isLegendTransitioning ? 500 : 50}
            >
              <LineChart
                data={chartData}
                margin={{ top: 20, right: 60, left: 0, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.5} />
                <XAxis 
                  dataKey="name" 
                  stroke="#94a3b8" 
                  tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} 
                  tickMargin={10}
                  height={50}
                  interval="preserveStartEnd"
                  tickFormatter={(value) => value.replace(/Gran Premio de |GRAN PREMIO DE |GP de |GP /gi, '')}
                />
                <YAxis 
                  stroke="#94a3b8" 
                  tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} 
                  domain={metric === 'position' ? [1, viewType === 'drivers' ? allDriversCount : allConstructorsCount] : ['dataMin', 'dataMax']}
                  reversed={metric === 'position'}
                  ticks={metric === 'position' ? positionTicks : undefined}
                  tickFormatter={(val) => metric === 'position' ? `P${val}` : val}
                  width={60}
                  tickMargin={15}
                />
                <Tooltip 
                  content={<CustomTooltip viewType={viewType} metric={metric} constructors={data.constructors} />} 
                  cursor={{ stroke: 'rgba(255,255,255,0.2)', strokeWidth: 1, strokeDasharray: '5 5' }} 
                  wrapperStyle={{ zIndex: 9999 }}
                />
                <Brush 
                  dataKey="name" 
                  height={40} 
                  stroke="#10b981" 
                  fill="#0f172a"
                  travellerWidth={15}
                  tickFormatter={(value) => value.replace(/Gran Premio de |GRAN PREMIO DE |GP de |GP /gi, '')} 
                />
                {viewType === 'drivers' ? (
                  sortedDrivers.map((driver, index) => (
                    <Line
                      key={driver.id}
                      hide={hiddenItems.includes(driver.name)}
                      type="monotone"
                      dataKey={driver.name}
                      stroke={driver.teamColor}
                      strokeWidth={index < 3 ? 4 : 2}
                      strokeOpacity={hiddenItems.includes(driver.name) ? 0 : (index < 3 ? 1 : 0.4)}
                      dot={(props) => renderCustomDot(props)}
                      activeDot={{ r: 7, strokeWidth: 2, stroke: '#fff' }}
                      connectNulls
                    />
                  ))
                ) : (
                  sortedConstructors.map((constructor) => (
                    <Line
                      key={constructor.id}
                      hide={hiddenItems.includes(constructor.name)}
                      type="monotone"
                      dataKey={constructor.name}
                      stroke={constructor.color}
                      strokeWidth={4}
                      strokeOpacity={hiddenItems.includes(constructor.name) ? 0 : 0.8}
                      dot={(props) => renderConstructorDot(props, constructor)}
                      activeDot={{ r: 7, strokeWidth: 2, stroke: '#fff' }}
                      connectNulls
                    />
                  ))
                )}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950/20 rounded-xl border border-white/5 animate-pulse">
              <Activity className="w-12 h-12 text-slate-700 mb-4" />
              <div className="h-4 w-48 bg-slate-800 rounded-full" />
            </div>
          )}
        </motion.div>

        {/* Custom Vertical Legend */}
        <AnimatePresence mode="popLayout">
          {showLegend && (
            <motion.div 
              layout
              initial={{ opacity: 0, width: 0, x: 20 }}
              animate={{ opacity: 1, width: 'auto', x: 0 }}
              exit={{ opacity: 0, width: 0, x: 20 }}
              transition={{ 
                duration: LEGEND_DURATION,
                ease: [0.4, 0, 0.2, 1],
                opacity: { duration: 0.2 }
              }}
              className="w-full lg:w-auto shrink-0 flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto custom-scrollbar pb-2 lg:pb-0 lg:pr-4 origin-right overflow-hidden"
            >
              <div className="hidden lg:flex flex-col mb-2 px-1 shrink-0">
                <span className="text-slate-400 text-[10px] uppercase tracking-widest font-black">
                  Clasificación Actual
                </span>
                <span className="text-emerald-500/70 text-[9px] uppercase tracking-wider font-bold mt-0.5 flex items-center gap-1">
                  <MousePointerClick size={10} /> Clic para filtrar
                </span>
              </div>
              {(viewType === 'drivers' ? sortedDrivers : sortedConstructors).map((item, index) => {
                const isHidden = hiddenItems.includes(item.name);
                const color = viewType === 'drivers' ? (item as Driver).teamColor : (item as Constructor).color;
                const logo = viewType === 'constructors' ? (item as Constructor).logoUrl : null;
                
                return (
                  <div
                    key={item.id}
                    onClick={() => handleLegendClick(item.name)}
                    className={cn(
                      "flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all duration-300 border shrink-0 lg:shrink min-w-[140px] lg:min-w-0 group",
                      isHidden 
                        ? "opacity-50 border-white/5 bg-slate-900/50 hover:bg-slate-800 hover:opacity-100" 
                        : "bg-slate-800/60 border-white/10 hover:bg-slate-800 hover:border-emerald-500/40 hover:shadow-[0_0_15px_rgba(16,185,129,0.15)] hover:-translate-y-0.5"
                    )}
                  >
                    <div className={cn("w-1.5 h-6 rounded-full shrink-0 transition-all duration-300", isHidden ? "grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100" : "")} style={{ backgroundColor: color }} />
                    {logo && (
                      <img src={logo} alt={item.name} className={cn("w-6 h-6 object-contain filter drop-shadow-md shrink-0 transition-all duration-300", isHidden ? "grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100" : "")} />
                    )}
                    <div className="flex flex-col min-w-0 flex-grow">
                      <span className={cn("text-xs font-bold whitespace-nowrap transition-colors duration-300", isHidden ? "text-slate-500 line-through group-hover:text-slate-300 group-hover:no-underline" : "text-slate-200 group-hover:text-white")}>
                        {item.name}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {item.points} pts
                      </span>
                    </div>
                    <div className="ml-auto flex items-center justify-center shrink-0 min-w-[24px]">
                      {/* Default content */}
                      <div className="group-hover:hidden flex items-center justify-center">
                        {!isHidden && metric === 'points' && index < 3 && (
                          <span className="text-sm">{index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}</span>
                        )}
                        {!isHidden && metric === 'position' && (
                          <span className="text-xs font-black text-slate-500">P{index + 1}</span>
                        )}
                      </div>
                      {/* Hover content */}
                      <div className="hidden group-hover:flex items-center justify-center">
                        {isHidden ? <Eye size={16} className="text-slate-300" /> : <EyeOff size={16} className="text-emerald-400" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
    </>
  );
}
