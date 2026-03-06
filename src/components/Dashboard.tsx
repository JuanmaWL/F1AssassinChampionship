import React from 'react';
import { ChampionshipData } from '../types';
import { StatsOverview } from './dashboard/StatsOverview';
import { Podium } from './dashboard/Podium';
import { DriversTable } from './dashboard/DriversTable';
import { ConstructorsTable } from './dashboard/ConstructorsTable';
import { EvolutionChart } from './dashboard/EvolutionChart';

interface DashboardProps {
  data: ChampionshipData;
}

export function Dashboard({ data }: DashboardProps) {
  const sortedDrivers = [...data.drivers].sort((a, b) => b.points - a.points);
  const sortedConstructors = [...data.constructors].sort((a, b) => b.points - a.points);

  const hasCompletedRaces = data.races.some(r => r.status === 'completed');

  return (
    <div className="space-y-12 pb-20">
      {/* Banner / Logo Area */}
      <div className="w-full h-48 md:h-64 rounded-2xl overflow-hidden relative border border-white/10 shadow-2xl group">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900"></div>
        <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        <div className="absolute inset-0 flex items-center justify-center">
            <h1 className="text-5xl md:text-7xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 uppercase tracking-tighter drop-shadow-lg text-center px-4">
                Assassin's <span className="text-red-600">Championship</span>
            </h1>
        </div>
      </div>

      <StatsOverview data={data} />
      {hasCompletedRaces && <Podium drivers={sortedDrivers} />}
      <DriversTable drivers={sortedDrivers} />
      {hasCompletedRaces && <EvolutionChart data={data} />}
      <ConstructorsTable constructors={sortedConstructors} hasCompletedRaces={hasCompletedRaces} />
    </div>
  );
}
