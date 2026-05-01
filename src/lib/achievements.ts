import { ChampionshipData } from '../types';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  emoji: string;
  driverId: string;    // quién lo tiene
  value?: number | string; // dato cuantitativo (ej: "3 victorias")
}

export interface AchievementDefinition {
  id: string;
  name: string;
  description: string;
  emoji: string;
}

export const ALL_ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  // Competitive (Max of something)
  { id: 'speed_king', name: 'Rey de la Velocidad', description: 'Mayor número de vueltas rápidas', emoji: '🟣' },
  { id: 'kamikaze', name: 'Kamikaze', description: 'Mayor número de abandonos (DNF)', emoji: '🔴' },
  { id: 'remontador', name: 'El Remontador', description: 'Mayor diferencia positiva de posiciones en una carrera', emoji: '⚡' },
  { id: 'hat_trick', name: 'Hat-Trick', description: 'Mayor racha de victorias consecutivas', emoji: '👑' },
  { id: 'iron_points', name: 'Puntos de Hierro', description: 'Mayor número de carreras finalizadas sin DNF', emoji: '🛡️' },
  { id: 'tardio', name: 'El Tardío', description: 'Piloto con más carreras en última posición', emoji: '🐢' },
  { id: 'maestro_podio', name: 'Maestro del Podio', description: 'Mayor número de podios (Top 3)', emoji: '🍾' },
  { id: 'puntos_constantes', name: 'Siempre en los Puntos', description: 'Mayor número de carreras puntuando', emoji: '🎯' },
  { id: 'chico_malo', name: 'El Chico Malo', description: 'Piloto con mayor número de penalizaciones', emoji: '👮' },
  { id: 'dominador', name: 'El Dominador', description: 'Mayor número de victorias absolutas', emoji: '🥇' },
  { id: 'top_5', name: 'Top 5 Habitual', description: 'Mayor número de veces en el Top 5', emoji: '⭐' },
  { id: 'consistente', name: 'El Consistente', description: 'Menor desviación estándar de posiciones finales (mín. 3 carreras)', emoji: '🟡' },
  
  // Generic / Thresholds
  { id: 'bautismo_fuego', name: 'Bautismo de Fuego', description: 'Ha puntuado por primera vez', emoji: '🔥' },
  { id: 'finisher', name: 'Finisher', description: 'Ha terminado 5 carreras sin abandonar', emoji: '🏁' },
  { id: 'superviviente', name: 'Superviviente', description: 'Ha terminado 10 carreras sin abandonar', emoji: '🛡️' },
  { id: 'veterano', name: 'Veterano', description: 'Ha participado en 10 carreras o más', emoji: '🏎️' },
  { id: 'trotamundos', name: 'Trotamundos', description: 'Ha participado en 15 carreras', emoji: '🌍' },
  { id: 'sabor_champan', name: 'Sabor a Champán', description: 'Ha conseguido subir al podio alguna vez', emoji: '🥂' },
  { id: 'golden_boy', name: 'Golden Boy', description: 'Ha conseguido ganar al menos una carrera', emoji: '🌟' },
  { id: 'tractor', name: 'El Tractor', description: 'Acumula al menos 3 abandonos', emoji: '🚜' },
  { id: 'el_pupas', name: 'El Pupas', description: 'Acumula al menos 5 abandonos', emoji: '🚑' },
  { id: 'pasado_frenada', name: 'Pasado de Frenada', description: 'Ha recibido al menos 3 sanciones', emoji: '⚠️' },
  { id: 'peligro_publico', name: 'Peligro Público', description: 'Ha recibido al menos 5 sanciones', emoji: '⛔' },
  { id: 'vuela_bajo', name: 'Vuela Bajo', description: 'Ha logrado al menos 1 vuelta rápida', emoji: '✈️' },
  { id: 'rayo', name: 'El Rayo', description: 'Ha logrado al menos 3 vueltas rápidas', emoji: '⚡' },
  { id: 'racha_puntos', name: 'Cazador de Puntos', description: 'Ha puntuado en 3 carreras consecutivas', emoji: '🩸' },
  { id: 'racha_podios', name: 'Indomable', description: 'Ha subido al podio 3 carreras consecutivas', emoji: '🏆' },
  { id: 'casi_casi', name: 'Casi, casi', description: 'Al menos 3 veces en el Top 5 sin subir al podio', emoji: '🤏' },
  { id: 'medio_siglo', name: 'Medio Siglo', description: 'Ha logrado al menos 50 puntos en total', emoji: '🪙' },
  { id: 'centenario', name: 'Centenario', description: 'Ha logrado al menos 100 puntos en total', emoji: '💯' },
];

export function calculateAchievements(data: Pick<ChampionshipData, 'drivers' | 'races'>): Achievement[] {
  const achievements: Achievement[] = [];
  const completedRaces = data.races.filter(r => r.status === 'completed');
  
  if (completedRaces.length === 0) return achievements;

  // Driver states
  const driverStats: Record<string, {
    fastestLaps: number;
    dnfs: number;
    positions: number[];
    maxComeback: number;
    currentWinStreak: number;
    maxWinStreak: number;
    finishedNoDnfCount: number;
    lastPlaces: number;
    podiums: number;
    pointsFinishes: number;
    totalWins: number;
    sanctions: number;
    top5: number;
    // New stats
    racesEntered: number;
    currentPodiumStreak: number;
    maxPodiumStreak: number;
    currentPointsStreak: number;
    maxPointsStreak: number;
  }> = {};

  for (const driver of data.drivers) {
    driverStats[driver.id] = {
      fastestLaps: 0,
      dnfs: 0,
      positions: [],
      maxComeback: 0,
      currentWinStreak: 0,
      maxWinStreak: 0,
      finishedNoDnfCount: 0,
      lastPlaces: 0,
      podiums: 0,
      pointsFinishes: 0,
      totalWins: 0,
      sanctions: 0,
      top5: 0,
      racesEntered: 0,
      currentPodiumStreak: 0,
      maxPodiumStreak: 0,
      currentPointsStreak: 0,
      maxPointsStreak: 0
    };
  }

  // Iterate over races chronologically to calculate streaks
  const sortedRaces = [...completedRaces].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  for (const race of sortedRaces) {
    if (!race.results) continue;

    for (const result of race.results) {
      if (!driverStats[result.driverId]) continue; // In case a driver is missing

      const stats = driverStats[result.driverId];
      
      stats.racesEntered++;

      if (result.fastestLap) stats.fastestLaps++;
      if (result.dnf) stats.dnfs++;
      else stats.finishedNoDnfCount++;
      
      if (result.isSanctioned) stats.sanctions++;

      if (!result.dnf && result.position > 0) {
        stats.positions.push(result.position);
        
        if (result.position === 1) stats.totalWins++;
        if (result.position <= 3) stats.podiums++;
        if (result.position <= 5) stats.top5++;
        if (result.points > 0) stats.pointsFinishes++;
      }

      // Largest comeback
      if (!result.isSanctioned && result.originalPosition && result.position > 0 && result.originalPosition > 0) {
        const comeback = result.originalPosition - result.position;
        if (comeback > stats.maxComeback) {
          stats.maxComeback = comeback;
        }
      }

      // Win streak
      if (result.position === 1 && !result.dnf) {
        stats.currentWinStreak++;
        if (stats.currentWinStreak > stats.maxWinStreak) {
          stats.maxWinStreak = stats.currentWinStreak;
        }
      } else if (result.position > 0) { // participated but didn't win
        stats.currentWinStreak = 0;
      }
      
      // Podium Streak
      if (result.position <= 3 && !result.dnf && result.position > 0) {
        stats.currentPodiumStreak++;
        if (stats.currentPodiumStreak > stats.maxPodiumStreak) stats.maxPodiumStreak = stats.currentPodiumStreak;
      } else if (result.position > 0) {
        stats.currentPodiumStreak = 0;
      }
      
      // Points Streak
      if (result.points > 0 && !result.dnf) {
        stats.currentPointsStreak++;
        if (stats.currentPointsStreak > stats.maxPointsStreak) {
          stats.maxPointsStreak = stats.currentPointsStreak;
        }
      } else if (result.position > 0) {
        stats.currentPointsStreak = 0;
      }
    }

    // Determine max position for this race among finishers
    const maxPos = Math.max(...race.results.filter(r => !r.dnf && r.position > 0).map(r => r.position), 0);
    if (maxPos > 0) {
      for (const result of race.results) {
        if (!result.dnf && result.position === maxPos) {
           if (driverStats[result.driverId]) {
             driverStats[result.driverId].lastPlaces++;
           }
        }
      }
    }
  }

  // Helper to add achievements
  const addAchievement = (
     id: string, 
     name: string, 
     description: string, 
     emoji: string, 
     valueCheck: (stats: any) => number, 
     options: { mode: 'max' | 'threshold', threshold: number, descSuffix?: (val: number) => string }
  ) => {
    if (options.mode === 'max') {
      const maxVal = Math.max(...Object.values(driverStats).map(s => valueCheck(s)), 0);
      if (maxVal < options.threshold) return;
      const winners = data.drivers.filter(d => valueCheck(driverStats[d.id]) === maxVal);
      winners.forEach(w => {
        achievements.push({
          id, name, description, emoji, driverId: w.id,
          value: options.descSuffix ? options.descSuffix(maxVal) : undefined
        });
      });
    } else {
      const winners = data.drivers.filter(d => valueCheck(driverStats[d.id]) >= options.threshold);
      winners.forEach(w => {
        achievements.push({
          id, name, description, emoji, driverId: w.id,
          value: options.descSuffix ? options.descSuffix(valueCheck(driverStats[w.id])) : undefined
        });
      });
    }
  };

  // 1. Rey de la Velocidad
  addAchievement('speed_king', 'Rey de la Velocidad', 'Mayor número de vueltas rápidas', '🟣', s => s.fastestLaps, { mode: 'max', threshold: 1, descSuffix: v => `${v} VR` });

  // 2. Kamikaze
  addAchievement('kamikaze', 'Kamikaze', 'Mayor número de abandonos (DNF)', '🔴', s => s.dnfs, { mode: 'max', threshold: 1, descSuffix: v => `${v} DNF` });

  // 4. El Remontador
  addAchievement('remontador', 'El Remontador', 'Mayor diferencia positiva de posiciones en una carrera', '⚡', s => s.maxComeback, { mode: 'max', threshold: 1, descSuffix: v => `+${v} pos` });

  // 5. Hat-Trick
  addAchievement('hat_trick', 'Hat-Trick', 'Mayor racha de victorias consecutivas', '👑', s => s.maxWinStreak, { mode: 'max', threshold: 2, descSuffix: v => `${v} victorias` });

  // 6. Puntos de Hierro
  addAchievement('iron_points', 'Puntos de Hierro', 'Mayor número de carreras finalizadas sin DNF', '🛡️', s => s.finishedNoDnfCount, { mode: 'max', threshold: 1, descSuffix: v => `${v} carreras` });

  // 7. El Tardío
  addAchievement('tardio', 'El Tardío', 'Piloto con más carreras en última posición', '🐢', s => s.lastPlaces, { mode: 'max', threshold: 1, descSuffix: v => `${v} veces` });

  // 8. Maestro del Podio
  addAchievement('maestro_podio', 'Maestro del Podio', 'Mayor número de podios (Top 3)', '🍾', s => s.podiums, { mode: 'max', threshold: 2, descSuffix: v => `${v} podios` });

  // 9. Siempre en los Puntos
  addAchievement('puntos_constantes', 'Siempre en los Puntos', 'Mayor número de carreras puntuando', '🎯', s => s.pointsFinishes, { mode: 'max', threshold: 3, descSuffix: v => `${v} carreras` });
  
  // 10. El Sancionado
  addAchievement('chico_malo', 'El Chico Malo', 'Piloto con mayor número de penalizaciones', '👮', s => s.sanctions, { mode: 'max', threshold: 1, descSuffix: v => `${v} sanciones` });
  
  // 11. El Dominador
  addAchievement('dominador', 'El Dominador', 'Mayor número de victorias absolutas', '🥇', s => s.totalWins, { mode: 'max', threshold: 2, descSuffix: v => `${v} victorias` });
  
  // 12. Top 5 Habitual
  addAchievement('top_5', 'Top 5 Habitual', 'Mayor número de veces en el Top 5', '⭐', s => s.top5, { mode: 'max', threshold: 3, descSuffix: v => `${v} veces` });

  // GENERIC/THRESHOLD LOGROS:
  addAchievement('bautismo_fuego', 'Bautismo de Fuego', 'Ha puntuado por primera vez', '🔥', s => s.pointsFinishes, { mode: 'threshold', threshold: 1 });
  addAchievement('finisher', 'Finisher', 'Ha terminado 5 carreras sin abandonar', '🏁', s => s.finishedNoDnfCount, { mode: 'threshold', threshold: 5, descSuffix: v => `${v} carreras` });
  addAchievement('superviviente', 'Superviviente', 'Ha terminado 10 carreras sin abandonar', '🛡️', s => s.finishedNoDnfCount, { mode: 'threshold', threshold: 10, descSuffix: v => `${v} carreras` });
  addAchievement('veterano', 'Veterano', 'Ha participado en 10 carreras o más', '🏎️', s => s.racesEntered, { mode: 'threshold', threshold: 10, descSuffix: v => `${v} carreras` });
  addAchievement('trotamundos', 'Trotamundos', 'Ha participado en 15 carreras', '🌍', s => s.racesEntered, { mode: 'threshold', threshold: 15, descSuffix: v => `${v} carreras` });
  addAchievement('sabor_champan', 'Sabor a Champán', 'Ha conseguido subir al podio alguna vez', '🥂', s => s.podiums, { mode: 'threshold', threshold: 1 });
  addAchievement('golden_boy', 'Golden Boy', 'Ha conseguido ganar al menos una carrera', '🌟', s => s.totalWins, { mode: 'threshold', threshold: 1 });
  addAchievement('tractor', 'El Tractor', 'Acumula al menos 3 abandonos totales', '🚜', s => s.dnfs, { mode: 'threshold', threshold: 3, descSuffix: v => `${v} DNF` });
  addAchievement('el_pupas', 'El Pupas', 'Acumula al menos 5 abandonos totales', '🚑', s => s.dnfs, { mode: 'threshold', threshold: 5, descSuffix: v => `${v} DNF` });
  addAchievement('pasado_frenada', 'Pasado de Frenada', 'Ha recibido al menos 3 sanciones totales', '⚠️', s => s.sanctions, { mode: 'threshold', threshold: 3, descSuffix: v => `${v} sanc` });
  addAchievement('peligro_publico', 'Peligro Público', 'Ha recibido al menos 5 sanciones totales', '⛔', s => s.sanctions, { mode: 'threshold', threshold: 5, descSuffix: v => `${v} sanc` });
  addAchievement('vuela_bajo', 'Vuela Bajo', 'Ha logrado al menos 1 vuelta rápida', '✈️', s => s.fastestLaps, { mode: 'threshold', threshold: 1 });
  addAchievement('rayo', 'El Rayo', 'Ha logrado al menos 3 vueltas rápidas', '⚡', s => s.fastestLaps, { mode: 'threshold', threshold: 3 });
  addAchievement('racha_puntos', 'Cazador de Puntos', 'Ha puntuado en 3 carreras consecutivas', '🩸', s => s.maxPointsStreak, { mode: 'threshold', threshold: 3, descSuffix: v => `${v} seguidas` });
  addAchievement('racha_podios', 'Indomable', 'Ha subido al podio 3 carreras consecutivas', '🏆', s => s.maxPodiumStreak, { mode: 'threshold', threshold: 3, descSuffix: v => `${v} seguidos` });
  addAchievement('casi_casi', 'Casi, casi', 'Al menos 3 veces en el Top 5 sin subir al podio', '🤏', s => (s.top5 - s.podiums), { mode: 'threshold', threshold: 3, descSuffix: v => `${v} veces` });

  // Extra threshold achievements using driver points directly
  const addPointsThreshold = (id: string, name: string, desc: string, emoji: string, maxPoints: number) => {
     data.drivers.filter(d => d.points >= maxPoints).forEach(d => {
       achievements.push({ id, name, description: desc, emoji, driverId: d.id, value: `${d.points} pts` });
     });
  };
  addPointsThreshold('medio_siglo', 'Medio Siglo', 'Ha logrado al menos 50 puntos en total', '🪙', 50);
  addPointsThreshold('centenario', 'Centenario', 'Ha logrado al menos 100 puntos en total', '💯', 100);

  // 3. El Consistente
  // Lowest std dev (min 3 races)
  let minStdDev = Infinity;
  const stdDevs: Record<string, number> = {};

  for (const driver of data.drivers) {
    const sortedPositions = driverStats[driver.id].positions;
    if (sortedPositions.length >= 3) {
      const mean = sortedPositions.reduce((a, b) => a + b, 0) / sortedPositions.length;
      const variance = sortedPositions.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / sortedPositions.length;
      const stdDev = Math.sqrt(variance);
      stdDevs[driver.id] = stdDev;
      if (stdDev < minStdDev) minStdDev = stdDev;
    }
  }

  if (minStdDev !== Infinity) {
    const consistentes = data.drivers.filter(d => stdDevs[d.id] === minStdDev);
    consistentes.forEach(d => {
      achievements.push({
        id: 'consistente',
        name: 'El Consistente',
        description: 'Menor desviación estándar de posiciones finales (mín. 3 carreras participadas)',
        emoji: '🟡',
        driverId: d.id,
        value: `SD: ${minStdDev.toFixed(2)}`
      });
    });
  }

  return achievements;
}
