import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ChampionshipData, SeasonId } from '../types';
import { mockData } from '../mockData';
import { dataService } from '../services/dataService';

interface ChampionshipContextType {
  data: ChampionshipData;
  setData: (data: ChampionshipData) => void;
  activeSeason: SeasonId;
  setActiveSeason: (season: SeasonId) => void;
  isHistorical: boolean;
  isLoading: boolean;
  refreshData: () => Promise<void>;
}

const ChampionshipContext = createContext<ChampionshipContextType | undefined>(undefined);

export function ChampionshipProvider({ children }: { children: ReactNode }) {
  const [activeSeason, setActiveSeason] = useState<SeasonId>('2026');
  const [data, setData] = useState<ChampionshipData>(mockData);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async (showGlobalLoading = true) => {
      if (showGlobalLoading) setIsLoading(true);
      try {
          const fetchedData = await dataService.getData(activeSeason);
          setData(fetchedData);
      } catch (error) {
          console.error("Failed to load data:", error);
      } finally {
          if (showGlobalLoading) setIsLoading(false);
      }
  };

  useEffect(() => {
    loadData(true);
  }, [activeSeason]);

  const isHistorical = activeSeason === '2024';

  return (
    <ChampionshipContext.Provider value={{
      data,
      setData,
      activeSeason,
      setActiveSeason,
      isHistorical,
      isLoading,
      refreshData: () => loadData(false)
    }}>
      {children}
    </ChampionshipContext.Provider>
  );
}

export function useChampionship() {
  const context = useContext(ChampionshipContext);
  if (context === undefined) {
    throw new Error('useChampionship must be used within a ChampionshipProvider');
  }
  return context;
}
