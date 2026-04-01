import { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo, ReactNode } from 'react';
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
  const [data, setDataState] = useState<ChampionshipData>(mockData);
  const [isLoading, setIsLoading] = useState(true);
  const seasonCache = useRef<Map<SeasonId, ChampionshipData>>(new Map());

  const setData = useCallback((newData: ChampionshipData) => {
    seasonCache.current.set(activeSeason, newData);
    setDataState(newData);
  }, [activeSeason]);

  const loadData = useCallback(async (showGlobalLoading = true, bypassCache = false) => {
    if (!bypassCache && seasonCache.current.has(activeSeason)) {
      setDataState(seasonCache.current.get(activeSeason)!);
      if (showGlobalLoading) setIsLoading(false);
      return;
    }
    if (showGlobalLoading) setIsLoading(true);
    try {
      const fetchedData = await dataService.getData(activeSeason);
      seasonCache.current.set(activeSeason, fetchedData);
      setDataState(fetchedData);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      if (showGlobalLoading) setIsLoading(false);
    }
  }, [activeSeason]);

  useEffect(() => {
    loadData(true, false);
  }, [loadData]);

  const isHistorical = activeSeason === '2024';
  const refreshData = useCallback(() => loadData(false, true), [loadData]);

  const contextValue = useMemo(() => ({
    data,
    setData,
    activeSeason,
    setActiveSeason,
    isHistorical,
    isLoading,
    refreshData,
  }), [data, setData, activeSeason, setActiveSeason, isHistorical, isLoading, refreshData]);

  return (
    <ChampionshipContext.Provider value={contextValue}>
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