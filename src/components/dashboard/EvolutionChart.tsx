import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { motion } from 'motion/react';
import { ChampionshipData, Driver } from '../../types';
import { getEvolutionData } from '../../lib/calculations';

interface EvolutionChartProps {
  data: ChampionshipData;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    // Sort payload by value (points) descending
    const sortedPayload = [...payload].sort((a: any, b: any) => b.value - a.value);

    return (
      <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700 p-4 rounded-xl shadow-2xl max-w-md z-50">
        <p className="text-slate-200 font-black italic mb-3 border-b border-white/10 pb-2 uppercase tracking-wider">{label}</p>
        <div className="grid grid-cols-2 gap-x-8 gap-y-2">
          {sortedPayload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 min-w-[140px]">
              <div className="w-2.5 h-2.5 rounded-full shadow-sm shrink-0" style={{ backgroundColor: entry.color }} />
              <span className="text-slate-300 text-xs font-medium truncate max-w-[80px]" title={entry.name}>{entry.name}</span>
              <span className="text-white font-bold text-xs ml-auto font-mono">{entry.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export function EvolutionChart({ data }: EvolutionChartProps) {
  const allDriversCount = data.drivers.length;
  const evolutionData = getEvolutionData(data, allDriversCount);
  const sortedDrivers = [...data.drivers].sort((a, b) => b.points - a.points);
  
  const [hiddenDrivers, setHiddenDrivers] = React.useState<string[]>([]);

  const handleLegendClick = (e: any) => {
    const dataKey = e.dataKey;
    setHiddenDrivers(prev => 
      prev.includes(dataKey) ? prev.filter(k => k !== dataKey) : [...prev, dataKey]
    );
  };

  const renderCustomDot = (props: any, index: number) => {
      const { cx, cy, payload } = props;
      // Check if it's the last point in the dataset
      const isLastPoint = payload.name === evolutionData[evolutionData.length - 1].name;

      if (isLastPoint && index < 3) {
          const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉';
          return (
              <text x={cx} y={cy} dy={8} dx={0} textAnchor="middle" fontSize={24} className="filter drop-shadow-md cursor-default select-none">
                  {medal}
              </text>
          );
      }
      
      if (index < 3) {
          return (
              <circle cx={cx} cy={cy} r={5} fill={props.stroke} stroke="#0f172a" strokeWidth={2} />
          );
      }
      
      return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.5 }}
      className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-2xl"
    >
      <h2 className="text-2xl font-black italic text-white mb-6 uppercase tracking-tighter flex items-center gap-3">
        <span className="w-1 h-8 bg-green-500 rounded-full block"></span>
        Evolución del Campeonato
      </h2>
      <div className="h-[500px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={evolutionData}
            margin={{ top: 10, right: 30, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.5} />
            <XAxis 
              dataKey="name" 
              stroke="#94a3b8" 
              tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} 
              tickMargin={15}
              interval="preserveStartEnd"
            />
            <YAxis 
              stroke="#94a3b8" 
              tick={{ fill: '#94a3b8', fontSize: 11 }} 
              domain={['dataMin', 'dataMax']}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.2)', strokeWidth: 1, strokeDasharray: '5 5' }} />
            <Legend 
                wrapperStyle={{ paddingTop: '30px', cursor: 'pointer', fontSize: '12px' }} 
                onClick={handleLegendClick}
                formatter={(value, entry: any) => {
                    const isHidden = hiddenDrivers.includes(value);
                    return <span style={{ color: entry.color, opacity: isHidden ? 0.5 : 1, textDecoration: isHidden ? 'line-through' : 'none', fontWeight: 600, marginRight: 10 }}>{value}</span>;
                }}
            />
            {sortedDrivers.map((driver, index) => (
              <Line
                key={driver.id}
                hide={hiddenDrivers.includes(driver.name)}
                type="monotone"
                dataKey={driver.name}
                stroke={driver.teamColor}
                strokeWidth={index < 3 ? 4 : 2}
                strokeOpacity={hiddenDrivers.includes(driver.name) ? 0 : (index < 3 ? 1 : 0.4)}
                dot={(props) => renderCustomDot(props, index)}
                activeDot={{ r: 7, strokeWidth: 2, stroke: '#fff' }}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
