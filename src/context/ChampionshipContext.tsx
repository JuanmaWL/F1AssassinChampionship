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
  
  // Cache para evitar peticiones innecesarias
  const seasonCache = useRef<Map<SeasonId, ChampionshipData>>(new Map());
  
  // Ref para rastrear la temporada activa real y evitar race conditions
  const activeSeasonRef = useRef<SeasonId>(activeSeason);

  // Sincronizamos el Ref cada vez que cambia la temporada
  useEffect(() => {
    activeSeasonRef.current = activeSeason;
  }, [activeSeason]);

  const setData = useCallback((newData: ChampionshipData) => {
    seasonCache.current.set(activeSeason, newData);
    setDataState(newData);
  }, [activeSeason]);

  const loadData = useCallback(async (showGlobalLoading = true, bypassCache = false) => {
    const seasonToLoad = activeSeason;

    // 1. Verificar Cache
    if (!bypassCache && seasonCache.current.has(seasonToLoad)) {
      setDataState(seasonCache.current.get(seasonToLoad)!);
      if (showGlobalLoading) setIsLoading(false);
      return;
    }

    if (showGlobalLoading) setIsLoading(true);

    try {
      const fetchedData = await dataService.getData(seasonToLoad);
      
      // 2. VALIDACIÓN DE RACE CONDITION
      // Solo actualizamos si la temporada que acabamos de cargar sigue siendo la activa
      if (seasonToLoad === activeSeasonRef.current) {
        seasonCache.current.set(seasonToLoad, fetchedData);
        setDataState(fetchedData);
      } else {
        console.warn(`Carga de datos descartada para ${seasonToLoad}: el usuario ya cambió de temporada.`);
      }
    } catch (error) {
      if (seasonToLoad === activeSeasonRef.current) {
        console.error("Failed to load data:", error);
      }
    } finally {
      // Solo quitamos el loading si seguimos en la misma temporada
      if (seasonToLoad === activeSeasonRef.current && showGlobalLoading) {
        setIsLoading(false);
      }
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