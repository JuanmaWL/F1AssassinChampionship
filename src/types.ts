export type TeamColor = string;

export interface Driver {
  id: string;
  name: string;
  team: string;
  teamColor: TeamColor;
  points: number;
  avatarUrl?: string;
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
  raceTime?: string; // e.g., "1:32:45.123" or "+12.456s"
}

export interface Race {
  id: string;
  name: string;
  circuit: string;
  date: string; // ISO date string
  status: RaceStatus;
  results?: RaceResult[];
  polePosition?: string; // Driver ID
}

export interface ChampionshipData {
  drivers: Driver[];
  constructors: Constructor[];
  races: Race[];
}
