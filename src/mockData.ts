import { ChampionshipData, RaceResult } from './types';
import { calculateStandings } from './lib/calculations';

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
    
    // Generate random fastest lap time (e.g., 1:18.xxx)
    const flBase = 78000; // 1m 18s
    const flRandom = Math.floor(Math.random() * 2000);
    const flTotal = flBase + flRandom;
    const flM = Math.floor(flTotal / 60000);
    const flS = Math.floor((flTotal % 60000) / 1000);
    const flMS = flTotal % 1000;
    const fastestLapTime = `${flM}:${flS.toString().padStart(2, '0')}.${flMS.toString().padStart(3, '0')}`;

    return {
      driverId: driver.id,
      position: index + 1,
      points: points,
      fastestLap: isFastestLap,
      dnf: false,
      raceTime: raceTime,
      fastestLapTime: fastestLapTime,
    };
  });
};

// Initial Drivers Data
const initialDrivers = [
  { id: 'd1', name: 'Azerjin', team: 'Thunder Speed F1 Team', teamColor: '#FFD700', points: 0, fastestLaps: 0 },
  { id: 'd2', name: 'Legna-1601', team: 'Thunder Speed F1 Team', teamColor: '#FFD700', points: 0, fastestLaps: 0 },
  { id: 'd3', name: 'Uyimero', team: 'Eagleclaw Racing Team', teamColor: '#C0C0C0', points: 0, fastestLaps: 0 },
  { id: 'd4', name: 'Minico', team: 'Eagleclaw Racing Team', teamColor: '#C0C0C0', points: 0, fastestLaps: 0 },
  { id: 'd5', name: 'Juasmo', team: 'Tractores F1 Team Racing', teamColor: '#32CD32', points: 0, fastestLaps: 0 },
  { id: 'd6', name: 'Pekeno-Salta', team: 'Tractores F1 Team Racing', teamColor: '#32CD32', points: 0, fastestLaps: 0 },
  { id: 'd7', name: 'Supereloy77', team: 'Nakamas Malakas F1 Team Racing', teamColor: '#FF8C00', points: 0, fastestLaps: 0 },
  { id: 'd8', name: 'Maximo384', team: 'Nakamas Malakas F1 Team Racing', teamColor: '#FF8C00', points: 0, fastestLaps: 0 },
  { id: 'd9', name: 'Roudy', team: 'Potatsio D.Canarias F1 Team Racing', teamColor: '#8A2BE2', points: 0, fastestLaps: 0 },
  { id: 'd10', name: 'Always Dave', team: 'Potatsio D.Canarias F1 Team Racing', teamColor: '#8A2BE2', points: 0, fastestLaps: 0 },
  { id: 'd11', name: 'Urbano62TV', team: 'Tarazed F1 Racing Team', teamColor: '#DC143C', points: 0, fastestLaps: 0 },
  { id: 'd12', name: 'Andrew Taragod', team: 'Tarazed F1 Racing Team', teamColor: '#DC143C', points: 0, fastestLaps: 0 },
  { id: 'd13', name: 'Ainzzu', team: 'Tarazed F1 Racing Team', teamColor: '#DC143C', points: 0, fastestLaps: 0 },
  { id: 'd14', name: 'Nacho_RB10', team: 'Alros F1 Team Racing', teamColor: '#FF69B4', points: 0, fastestLaps: 0 },
  { id: 'd15', name: 'Ubicypher', team: 'Alros F1 Team Racing', teamColor: '#FF69B4', points: 0, fastestLaps: 0 },
  { id: 'd16', name: 'Kisame', team: 'Assassin\'s Mania Racing Team', teamColor: '#00FFFF', points: 0, fastestLaps: 0 },
  { id: 'd17', name: 'Dorian', team: 'Assassin\'s Mania Racing Team', teamColor: '#00FFFF', points: 0, fastestLaps: 0 },
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
  { id: 'r1', name: 'Gran Premio de China', circuit: 'Shanghai International Circuit', date: '2025-03-02T21:00:00+01:00', flagCode: 'cn' },
  { id: 'r2', name: 'Gran Premio de Singapur', circuit: 'Marina Bay Street Circuit', date: '2025-03-16T21:00:00+01:00', flagCode: 'sg' },
  { id: 'r3', name: 'Gran Premio de Australia', circuit: 'Albert Park Circuit', date: '2025-03-30T21:00:00+02:00', flagCode: 'au' },
  { id: 'r4', name: 'Gran Premio de Abu Dhabi', circuit: 'Yas Marina Circuit', date: '2025-04-13T21:00:00+02:00', flagCode: 'ae' },
  { id: 'r5', name: 'Gran Premio de Brasil', circuit: 'Autódromo José Carlos Pace', date: '2025-04-27T21:00:00+02:00', flagCode: 'br' },
  { id: 'r6', name: 'Gran Premio de Azerbaiyán', circuit: 'Baku City Circuit', date: '2025-05-11T21:00:00+02:00', flagCode: 'az' },
  { id: 'r7', name: 'Gran Premio de Japón', circuit: 'Suzuka International Racing Course', date: '2025-05-25T21:00:00+02:00', flagCode: 'jp' },
  { id: 'r8', name: 'Gran Premio de Bélgica', circuit: 'Circuit de Spa-Francorchamps', date: '2025-06-08T21:00:00+02:00', flagCode: 'be' },
  { id: 'r9', name: 'Gran Premio de Gran Bretaña', circuit: 'Silverstone Circuit', date: '2025-06-22T21:00:00+02:00', flagCode: 'gb' },
  { id: 'r10', name: 'Gran Premio de Bahrein', circuit: 'Bahrain International Circuit', date: '2025-07-06T21:00:00+02:00', flagCode: 'bh' },
  { id: 'r11', name: 'Gran Premio de Mónaco', circuit: 'Circuit de Monaco', date: '2025-07-20T21:00:00+02:00', flagCode: 'mc' },
  { id: 'r12', name: 'Gran Premio de España', circuit: 'Circuit de Barcelona-Catalunya', date: '2025-08-03T21:00:00+02:00', flagCode: 'es' },
];

// Simulate Championship - All pending
const simulatedRaces = racesDef.map((race) => {
  return {
    ...race,
    status: 'pending' as const,
  };
});

// Calculate Totals using the centralized function
const initialData: ChampionshipData = {
  drivers: initialDrivers,
  constructors: initialConstructors,
  races: simulatedRaces,
};

export const mockData = calculateStandings(initialData);
