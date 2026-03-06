export type TeamColor = string;

export interface Driver {
  id: string;
  name: string;
  team: string;
  teamColor: TeamColor;
  points: number;
  avatarUrl?: string;
  fastestLaps?: number;
}

export interface Constructor {
  id: string;
  name: string;
  color: TeamColor;
  points: number;
  logoUrl?: string;
}

export type RaceStatus = 'completed' | 'pending';

export interface RaceResult {
  driverId: string;
  position: number;
  points: number;
  fastestLap: boolean;
  dnf: boolean;
  raceTime?: string; // Total race time or gap (e.g., "1:32:45.123" or "+12.456s")
  fastestLapTime?: string; // Best lap time (e.g., "1:18.456")
  pitStops?: number;
}

export interface Race {
  id: string;
  name: string;
  circuit: string;
  date: string; // ISO date string
  flagCode?: string; // ISO country code for flag (e.g., 'cn', 'es')
  status: RaceStatus;
  results?: RaceResult[];
  polePosition?: string; // Driver ID
}

export interface ChampionshipData {
  drivers: Driver[];
  constructors: Constructor[];
  races: Race[];
}
