import { ChampionshipData, RaceResult } from './types';

// Helper to generate random results for simulation
const generateRandomResults = (raceId: string, drivers: { id: string }[]): RaceResult[] => {
  const shuffledDrivers = [...drivers].sort(() => Math.random() - 0.5);
  let baseTime = 5400000; // 1h 30m in ms

  return shuffledDrivers.map((driver, index) => {
    let points = 0;
    if (index === 0) points = 25;
    else if (index === 1) points = 18;
    else if (index === 2) points = 15;
    else if (index === 3) points = 12;
    else if (index === 4) points = 10;
    else if (index === 5) points = 8;
    else if (index === 6) points = 6;
    else if (index === 7) points = 4;
    else if (index === 8) points = 2;
    else if (index === 9) points = 1;

    // Random fastest lap for one of the top 10
    const isFastestLap = index < 10 && Math.random() < 0.1;
    if (isFastestLap) points += 1;

    // Generate race time
    let raceTime = '';
    if (index === 0) {
        const h = Math.floor(baseTime / 3600000);
        const m = Math.floor((baseTime % 3600000) / 60000);
        const s = Math.floor((baseTime % 60000) / 1000);
        const ms = baseTime % 1000;
        raceTime = `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
    } else {
        const gap = Math.random() * 5000 + (index * 2000);
        raceTime = `+${(gap / 1000).toFixed(3)}s`;
    }

    return {
      driverId: driver.id,
      position: index + 1,
      points: points,
      fastestLap: isFastestLap,
      dnf: false,
      raceTime: raceTime,
    };
  });
};

// Initial Drivers Data
const initialDrivers = [
  { id: 'd1', name: 'Azerjin', team: 'Thunder Speed F1 Team', teamColor: '#FFD700', points: 0 },
  { id: 'd2', name: 'Legna-1601', team: 'Thunder Speed F1 Team', teamColor: '#FFD700', points: 0 },
  { id: 'd3', name: 'Uyimero', team: 'Eagleclaw Racing Team', teamColor: '#C0C0C0', points: 0 },
  { id: 'd4', name: 'Minico', team: 'Eagleclaw Racing Team', teamColor: '#C0C0C0', points: 0 },
  { id: 'd5', name: 'Juasmo', team: 'Tractores F1 Team Racing', teamColor: '#32CD32', points: 0 },
  { id: 'd6', name: 'Pekeno-Salta', team: 'Tractores F1 Team Racing', teamColor: '#32CD32', points: 0 },
  { id: 'd7', name: 'Supereloy77', team: 'Nakamas Malakas F1 Team Racing', teamColor: '#FF8C00', points: 0 },
  { id: 'd8', name: 'Maximo384', team: 'Nakamas Malakas F1 Team Racing', teamColor: '#FF8C00', points: 0 },
  { id: 'd9', name: 'Roudy', team: 'Potatsio D.Canarias F1 Team Racing', teamColor: '#8A2BE2', points: 0 },
  { id: 'd10', name: 'Always Dave', team: 'Potatsio D.Canarias F1 Team Racing', teamColor: '#8A2BE2', points: 0 },
  { id: 'd11', name: 'Urbano62TV', team: 'Tarazed F1 Racing Team', teamColor: '#DC143C', points: 0 },
  { id: 'd12', name: 'Andrew Taragod', team: 'Tarazed F1 Racing Team', teamColor: '#DC143C', points: 0 },
  { id: 'd13', name: 'Ainzzu', team: 'Tarazed F1 Racing Team', teamColor: '#DC143C', points: 0 },
  { id: 'd14', name: 'Nacho_RB10', team: 'Alros F1 Team Racing', teamColor: '#FF69B4', points: 0 },
  { id: 'd15', name: 'Ubicypher', team: 'Alros F1 Team Racing', teamColor: '#FF69B4', points: 0 },
  { id: 'd16', name: 'Kisame', team: 'Assassin\'s Mania Racing Team', teamColor: '#00FFFF', points: 0 },
  { id: 'd17', name: 'Dorian', team: 'Assassin\'s Mania Racing Team', teamColor: '#00FFFF', points: 0 },
];

// Initial Constructors Data
const initialConstructors = [
  { id: 'c1', name: 'Thunder Speed F1 Team', color: '#FFD700', points: 0, logoUrl: 'https://picsum.photos/seed/thunder/200/200' },
  { id: 'c2', name: 'Eagleclaw Racing Team', color: '#C0C0C0', points: 0, logoUrl: 'https://picsum.photos/seed/eagle/200/200' },
  { id: 'c3', name: 'Tractores F1 Team Racing', color: '#32CD32', points: 0, logoUrl: 'https://picsum.photos/seed/tractor/200/200' },
  { id: 'c4', name: 'Nakamas Malakas F1 Team Racing', color: '#FF8C00', points: 0, logoUrl: 'https://picsum.photos/seed/nakama/200/200' },
  { id: 'c5', name: 'Potatsio D.Canarias F1 Team Racing', color: '#8A2BE2', points: 0, logoUrl: 'https://picsum.photos/seed/potatsio/200/200' },
  { id: 'c6', name: 'Tarazed F1 Racing Team', color: '#DC143C', points: 0, logoUrl: 'https://picsum.photos/seed/tarazed/200/200' },
  { id: 'c7', name: 'Alros F1 Team Racing', color: '#FF69B4', points: 0, logoUrl: 'https://picsum.photos/seed/alros/200/200' },
  { id: 'c8', name: 'Assassin\'s Mania Racing Team', color: '#00FFFF', points: 0, logoUrl: 'https://picsum.photos/seed/assassin/200/200' },
];

// Races Definition (2025 Dates)
const racesDef = [
  { id: 'r1', name: 'Gran Premio de China', circuit: 'Shanghai International Circuit', date: '2025-04-21' },
  { id: 'r2', name: 'Gran Premio de Singapur', circuit: 'Marina Bay Street Circuit', date: '2025-09-22' },
  { id: 'r3', name: 'Gran Premio de Australia', circuit: 'Albert Park Circuit', date: '2025-03-24' },
  { id: 'r4', name: 'Gran Premio de Abu Dhabi', circuit: 'Yas Marina Circuit', date: '2025-12-08' },
  { id: 'r5', name: 'Gran Premio de Brasil', circuit: 'Autódromo José Carlos Pace', date: '2025-11-03' },
  { id: 'r6', name: 'Gran Premio de Azerbaiyán', circuit: 'Baku City Circuit', date: '2025-09-15' },
  { id: 'r7', name: 'Gran Premio de Japón', circuit: 'Suzuka International Racing Course', date: '2025-04-07' },
  { id: 'r8', name: 'Gran Premio de Bélgica', circuit: 'Circuit de Spa-Francorchamps', date: '2025-07-28' },
  { id: 'r9', name: 'Gran Premio de Gran Bretaña', circuit: 'Silverstone Circuit', date: '2025-07-07' },
  { id: 'r10', name: 'Gran Premio de Bahrein', circuit: 'Bahrain International Circuit', date: '2025-03-02' },
  { id: 'r11', name: 'Gran Premio de Mónaco', circuit: 'Circuit de Monaco', date: '2025-05-26' },
  { id: 'r12', name: 'Gran Premio de España', circuit: 'Circuit de Barcelona-Catalunya', date: '2025-06-23' },
];

// Simulate Championship
const simulatedRaces = racesDef.map((race) => {
  const results = generateRandomResults(race.id, initialDrivers);
  return {
    ...race,
    status: 'completed' as const,
    results,
  };
});

// Calculate Totals
const calculatedDrivers = initialDrivers.map((driver) => {
  let totalPoints = 0;
  simulatedRaces.forEach((race) => {
    const result = race.results.find((r) => r.driverId === driver.id);
    if (result) totalPoints += result.points;
  });
  return { ...driver, points: totalPoints };
});

const calculatedConstructors = initialConstructors.map((cons) => {
  const teamDrivers = calculatedDrivers.filter((d) => d.team === cons.name);
  const totalPoints = teamDrivers.reduce((sum, d) => sum + d.points, 0);
  return { ...cons, points: totalPoints };
});

export const mockData: ChampionshipData = {
  drivers: calculatedDrivers,
  constructors: calculatedConstructors,
  races: simulatedRaces,
};
