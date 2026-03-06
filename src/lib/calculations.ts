import { ChampionshipData, Driver, Constructor, RaceResult } from '../types';

const getPoints = (position: number, dnf: boolean): number => {
  if (dnf) return 0;
  const pointsMap = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
  return pointsMap[position - 1] || 0;
};

export function calculateStandings(data: ChampionshipData): ChampionshipData {
  // Reset points and stats
  const driversMap = new Map<string, Driver>(
    data.drivers.map(d => [d.id, { ...d, points: 0, fastestLaps: 0 }])
  );
  const constructorsMap = new Map<string, Constructor>(
    data.constructors.map(c => [c.id, { ...c, points: 0 }])
  );

  // Process each completed race
  data.races.forEach(race => {
    if (race.status === 'completed' && race.results) {
      race.results.forEach(result => {
        const driver = driversMap.get(result.driverId);
        if (driver) {
          // Calculate points based on position (2025 Rules: No FL point)
          const points = getPoints(result.position, result.dnf);
          
          // Add points
          driver.points += points;
          
          // Count fastest laps
          if (result.fastestLap) {
            driver.fastestLaps = (driver.fastestLaps || 0) + 1;
          }

          // Add points to constructor
          const constructor = Array.from(constructorsMap.values()).find(c => c.name === driver.team);
          if (constructor) {
            constructor.points += points;
          }
        }
      });
    }
  });

  return {
    ...data,
    drivers: Array.from(driversMap.values()),
    constructors: Array.from(constructorsMap.values()),
  };
}

export function getEvolutionData(data: ChampionshipData, topNDrivers: number = 5) {
  const topDrivers = [...data.drivers]
    .sort((a, b) => b.points - a.points)
    .slice(0, topNDrivers);

  const completedRaces = data.races.filter(r => r.status === 'completed');
  
  // Initialize cumulative points for top drivers
  const driverPoints = new Map<string, number>();
  topDrivers.forEach(d => driverPoints.set(d.id, 0));

  return completedRaces.map(race => {
    const point = { name: race.name }; // X-axis label
    
    // Update cumulative points for this race
    if (race.results) {
      race.results.forEach(result => {
        if (driverPoints.has(result.driverId)) {
          const current = driverPoints.get(result.driverId) || 0;
          const newTotal = current + result.points;
          driverPoints.set(result.driverId, newTotal);
        }
      });
    }

    // Add current totals to the data point
    topDrivers.forEach(driver => {
      // @ts-ignore - Dynamic property assignment for Recharts
      point[driver.name] = driverPoints.get(driver.id);
    });

    return point;
  });
}
