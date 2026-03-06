import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Trophy, Flag, Timer } from 'lucide-react';
import { ChampionshipData } from '../types';
import { motion } from 'motion/react';

interface DashboardProps {
  data: ChampionshipData;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-700 p-3 rounded-lg shadow-xl">
        <p className="text-slate-200 font-bold mb-1">{label}</p>
        <p className="text-white text-lg">
          {payload[0].value} <span className="text-slate-400 text-sm">PTS</span>
        </p>
      </div>
    );
  }
  return null;
};

export function Dashboard({ data }: DashboardProps) {
  const sortedDrivers = [...data.drivers].sort((a, b) => b.points - a.points);
  const sortedConstructors = [...data.constructors].sort((a, b) => b.points - a.points);

  const remainingRaces = data.races.filter((r) => r.status === 'pending').length;
  const totalRaces = data.races.length;
  const completedRaces = totalRaces - remainingRaces;
  const pointsRemaining = remainingRaces * 26; // Max points per race (25 + 1 fastest lap)

  return (
    <div className="space-y-8 pb-20">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-6 rounded-2xl relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Flag size={64} className="text-white" />
          </div>
          <h3 className="text-slate-400 text-sm uppercase tracking-wider font-medium">Season Progress</h3>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-4xl font-black text-white italic">{completedRaces}</span>
            <span className="text-slate-500 font-mono">/ {totalRaces} Races</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 mt-4 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-full"
              style={{ width: `${(completedRaces / totalRaces) * 100}%` }}
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-6 rounded-2xl relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Trophy size={64} className="text-yellow-500" />
          </div>
          <h3 className="text-slate-400 text-sm uppercase tracking-wider font-medium">Points to Play</h3>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-4xl font-black text-white italic">{pointsRemaining}</span>
            <span className="text-slate-500 font-mono">Max Points</span>
          </div>
          <p className="text-xs text-slate-500 mt-4">
            Based on 25pts + 1pt FL per remaining race
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-6 rounded-2xl relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Timer size={64} className="text-red-500" />
          </div>
          <h3 className="text-slate-400 text-sm uppercase tracking-wider font-medium">Next GP</h3>
          <div className="mt-2">
            <span className="text-2xl font-black text-white italic block truncate">
              {data.races.find(r => r.status === 'pending')?.name || 'Season Finished'}
            </span>
            <span className="text-slate-500 text-sm font-mono block mt-1">
              {data.races.find(r => r.status === 'pending')?.date || '-'}
            </span>
          </div>
        </motion.div>
      </div>

      {/* Drivers Championship Chart */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-2xl"
      >
        <h2 className="text-2xl font-black italic text-white mb-6 uppercase tracking-tighter flex items-center gap-3">
          <span className="w-1 h-8 bg-red-600 rounded-full block"></span>
          Driver Standings
        </h2>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={sortedDrivers}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
              <XAxis type="number" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
              <YAxis
                type="category"
                dataKey="name"
                stroke="#fff"
                tick={{ fill: '#fff', fontSize: 12, fontWeight: 600 }}
                width={120}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
              <Bar dataKey="points" radius={[0, 4, 4, 0]} barSize={24}>
                {sortedDrivers.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.teamColor} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Constructors Championship Chart */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-slate-900/50 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-2xl"
      >
        <h2 className="text-2xl font-black italic text-white mb-6 uppercase tracking-tighter flex items-center gap-3">
          <span className="w-1 h-8 bg-blue-600 rounded-full block"></span>
          Constructor Standings
        </h2>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={sortedConstructors}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
              <XAxis type="number" stroke="#94a3b8" tick={{ fill: '#94a3b8' }} />
              <YAxis
                type="category"
                dataKey="name"
                stroke="#fff"
                tick={{ fill: '#fff', fontSize: 12, fontWeight: 600 }}
                width={120}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
              <Bar dataKey="points" radius={[0, 4, 4, 0]} barSize={32}>
                {sortedConstructors.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}
