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
    return (
      <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl">
        <p className="text-slate-200 font-bold mb-2 border-b border-slate-700 pb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-slate-300 text-sm">{entry.name}:</span>
            <span className="text-white font-bold">{entry.value} pts</span>
          </div>
        ))}
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
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis 
              dataKey="name" 
              stroke="#94a3b8" 
              tick={{ fill: '#94a3b8', fontSize: 12 }} 
              tickMargin={10}
            />
            <YAxis 
              stroke="#94a3b8" 
              tick={{ fill: '#94a3b8', fontSize: 12 }} 
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2 }} />
            <Legend 
                wrapperStyle={{ paddingTop: '20px', cursor: 'pointer' }} 
                onClick={handleLegendClick}
                formatter={(value, entry: any) => {
                    const isHidden = hiddenDrivers.includes(value);
                    return <span style={{ color: entry.color, opacity: isHidden ? 0.5 : 1, textDecoration: isHidden ? 'line-through' : 'none' }}>{value}</span>;
                }}
            />
            {sortedDrivers.map((driver, index) => (
              <Line
                key={driver.id}
                hide={hiddenDrivers.includes(driver.name)}
                type="monotone"
                dataKey={driver.name}
                stroke={driver.teamColor}
                strokeWidth={index < 3 ? 4 : 1.5}
                strokeOpacity={hiddenDrivers.includes(driver.name) ? 0 : (index < 3 ? 1 : 0.5)}
                dot={index < 3 ? { r: 4, fill: driver.teamColor, strokeWidth: 2, stroke: '#0f172a' } : false}
                activeDot={{ r: 6, strokeWidth: 0 }}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
