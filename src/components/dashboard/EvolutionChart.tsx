import React from 'react';
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
import { motion } from 'motion/react';
import { ChampionshipData, Driver, Constructor } from '../../types';
import { getEvolutionData, getConstructorEvolutionData } from '../../lib/calculations';
import { cn } from '../../lib/utils';
import { Users, Trophy, TrendingUp, Hash, Maximize, Minimize } from 'lucide-react';

interface EvolutionChartProps {
  data: ChampionshipData;
}

const CustomTooltip = ({ active, payload, label, viewType, metric, constructors }: any) => {
  if (active && payload && payload.length) {
    // Sort payload by the actual position in that race
    const sortedPayload = [...payload].sort((a: any, b: any) => {
      const posA = a.payload[`${a.dataKey}_pos`] || 99;
      const posB = b.payload[`${b.dataKey}_pos`] || 99;
      return posA - posB;
    });

    return (
      <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700 p-4 rounded-xl shadow-2xl min-w-[200px] z-[9999]">
        <p className="text-slate-200 font-black italic mb-3 border-b border-white/10 pb-2 uppercase tracking-wider">{label}</p>
        <div className="flex flex-col gap-1.5">
          {sortedPayload.map((entry: any, index: number) => {
            const constructor = viewType === 'constructors' ? constructors.find((c: any) => c.name === entry.dataKey) : null;
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
  const [viewType, setViewType] = React.useState<'drivers' | 'constructors'>('drivers');
  const [metric, setMetric] = React.useState<'points' | 'position'>('points');
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  
  const allDriversCount = data.drivers.length;
  const allConstructorsCount = data.constructors.length;
  
  const sortedDrivers = [...data.drivers].sort((a, b) => b.points - a.points);
  const sortedConstructors = [...data.constructors].sort((a, b) => b.points - a.points);
  
  const [hiddenItems, setHiddenItems] = React.useState<string[]>([]);

  // Reset hidden items when switching views
  React.useEffect(() => {
    setHiddenItems([]);
  }, [viewType]);

  const chartData = React.useMemo(() => {
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
      const point: any = { name: race.name };

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

  const renderCustomDot = (props: any) => {
      const { cx, cy, payload, dataKey, stroke } = props;
      const pos = payload[`${dataKey}_pos`];
      
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

  const renderConstructorDot = (props: any, constructor: Constructor) => {
      const { cx, cy } = props;
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

  const positionTicks = Array.from({ length: viewType === 'drivers' ? allDriversCount : allConstructorsCount }, (_, i) => i + 1);

  return (
    <>
      {isFullscreen && (
        <div 
          className="fixed inset-0 bg-black/90 z-[90] backdrop-blur-sm" 
          onClick={() => setIsFullscreen(false)} 
        />
      )}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        className={cn(
          "bg-slate-900/50 backdrop-blur-md border border-white/10 shadow-2xl flex flex-col",
          isFullscreen ? "fixed inset-2 md:inset-6 z-[100] p-4 md:p-6 rounded-3xl bg-slate-950 overflow-hidden" : "p-6 rounded-2xl relative"
        )}
      >
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-6 shrink-0">
        <h2 className="text-2xl font-black italic text-white uppercase tracking-tighter flex items-center gap-3">
          <span className="w-1 h-8 bg-green-500 rounded-full block"></span>
          Evolución del Campeonato
        </h2>
        
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

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors border border-white/5 ml-auto xl:ml-0"
            title={isFullscreen ? "Minimizar" : "Pantalla Completa"}
          >
            {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
          </button>
        </div>
      </div>

      <div className={cn("flex flex-col lg:flex-row gap-6", isFullscreen ? "flex-grow min-h-0" : "h-[500px]")}>
        <div className={cn("flex-grow min-w-0", isFullscreen ? "h-full" : "h-[400px] lg:h-full")}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
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
                sortedConstructors.map((constructor, index) => (
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
        </div>

        {/* Custom Vertical Legend */}
        <div className="w-full lg:w-auto shrink-0 flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto custom-scrollbar pb-2 lg:pb-0">
          <div className="hidden lg:block text-slate-500 text-[10px] uppercase tracking-widest font-bold mb-1 px-1 shrink-0">
            Clasificación Actual
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
                  "flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all border shrink-0 lg:shrink min-w-[140px] lg:min-w-0",
                  isHidden 
                    ? "opacity-40 border-transparent hover:bg-white/5" 
                    : "bg-slate-800/40 border-white/5 hover:bg-slate-800 shadow-sm hover:shadow-md hover:border-white/10"
                )}
              >
                <div className="w-1.5 h-6 rounded-full shrink-0" style={{ backgroundColor: color }} />
                {logo && (
                  <img src={logo} alt={item.name} className="w-6 h-6 object-contain filter drop-shadow-md shrink-0" />
                )}
                <div className="flex flex-col min-w-0 flex-grow">
                  <span className={cn("text-xs font-bold whitespace-nowrap", isHidden ? "text-slate-500 line-through" : "text-slate-200")}>
                    {item.name}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {item.points} pts
                  </span>
                </div>
                {!isHidden && metric === 'points' && index < 3 && (
                  <span className="ml-auto text-sm shrink-0">{index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}</span>
                )}
                {!isHidden && metric === 'position' && (
                  <span className="ml-auto text-xs font-black text-slate-500 shrink-0">P{index + 1}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
    </>
  );
}
