import { ChampionshipData, Driver, Constructor, RaceResult } from '../types';

const getPoints = (position: number, dnf: boolean, disqualified: boolean): number => {
  if (dnf || disqualified) return 0;
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
          // Calculate points based on position + adjustments
          let points = getPoints(result.position, result.dnf, result.isDisqualified || false);
          
          // Add manual adjustment (penalties/bonuses)
          if (result.pointsAdjustment) {
            points += result.pointsAdjustment;
          }
          
          // CRITICAL FIX: Update the result object's points to match the calculation
          // This ensures that charts and other views using result.points (like getEvolutionData)
          // see the correct, post-adjustment value.
          result.points = points;
          
          // Add points to driver
          const driverInMap = driversMap.get(result.driverId);
          if (driverInMap) {
            driverInMap.points += points;
            if (result.fastestLap) {
                driverInMap.fastestLaps = (driverInMap.fastestLaps || 0) + 1;
            }
          }

          // Add points to constructor
          // Find constructor by name (linked via driver.team)
          // We need to find the constructor ID that matches the driver's team name
          const driverTeamName = driver.team;
          const constructor = Array.from(constructorsMap.values()).find(c => c.name === driverTeamName);
          
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
