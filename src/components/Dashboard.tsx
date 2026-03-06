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

  return (
    <div className="space-y-12 pb-20">
      <StatsOverview data={data} />
      <Podium drivers={sortedDrivers} />
      <DriversTable drivers={sortedDrivers} />
      <EvolutionChart data={data} />
      <ConstructorsTable constructors={sortedConstructors} />
    </div>
  );
}
