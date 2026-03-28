import { ChampionshipData, Driver, Constructor } from '../types';

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

  // Deep-copy races so we don't mutate the original data in the context
  const processedRaces = data.races.map(race => ({
    ...race,
    results: race.results ? race.results.map(r => ({ ...r })) : undefined,
  }));

  // Precompute driver → constructor map (O(1) lookup instead of O(n) per result)
  const driverToConstructor = new Map<string, Constructor>();
  data.drivers.forEach(d => {
    const constructor = Array.from(constructorsMap.values()).find(c => c.name === d.team);
    if (constructor) driverToConstructor.set(d.id, constructor);
  });

  // Process each completed race
  processedRaces.forEach(race => {
    if (race.status === 'completed' && race.results) {
      race.results.forEach(result => {
        const driver = driversMap.get(result.driverId);
        if (driver) {
          let points = getPoints(result.position, result.dnf, result.isDisqualified || false);
          
          if (result.pointsAdjustment) {
            points += result.pointsAdjustment;
          }
          
          // Sync result.points on the copy so getEvolutionData sees post-adjustment values
          result.points = points;
          
          const driverInMap = driversMap.get(result.driverId);
          if (driverInMap) {
            driverInMap.points += points;
            if (result.fastestLap) {
                driverInMap.fastestLaps = (driverInMap.fastestLaps || 0) + 1;
            }
          }

          const constructor = driverToConstructor.get(result.driverId);
          if (constructor) {
            constructor.points += points;
          }
        }
      });
    }
  });

  return {
    ...data,
    races: processedRaces,
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
      (point as Record<string, number | string>)[driver.name] = driverPoints.get(driver.id) ?? 0;
    });

    return point;
  });
}

export function getConstructorEvolutionData(data: ChampionshipData, topNConstructors: number = 5) {
  const topConstructors = [...data.constructors]
    .sort((a, b) => b.points - a.points)
    .slice(0, topNConstructors);

  const completedRaces = data.races.filter(r => r.status === 'completed');
  
  // Initialize cumulative points for top constructors
  const constructorPoints = new Map<string, number>();
  topConstructors.forEach(c => constructorPoints.set(c.id, 0));

  // Map driverId to constructorId
  const driverToConstructor = new Map<string, string>();
  data.drivers.forEach(d => {
    const constructor = data.constructors.find(c => c.name === d.team);
    if (constructor) {
      driverToConstructor.set(d.id, constructor.id);
    }
  });

  return completedRaces.map(race => {
    const point = { name: race.name }; // X-axis label
    
    // Update cumulative points for this race
    if (race.results) {
      race.results.forEach(result => {
        const constructorId = driverToConstructor.get(result.driverId);
        if (constructorId && constructorPoints.has(constructorId)) {
          const current = constructorPoints.get(constructorId) || 0;
          const newTotal = current + result.points;
          constructorPoints.set(constructorId, newTotal);
        }
      });
    }

    // Add current totals to the data point
    topConstructors.forEach(constructor => {
      (point as Record<string, number | string>)[constructor.name] = constructorPoints.get(constructor.id) ?? 0;
    });

    return point;
  });
}