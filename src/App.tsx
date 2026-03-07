import React, { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { Calendar } from './components/Calendar';
import { AdminPanel } from './components/AdminPanel';
import { IntroAnimation } from './components/IntroAnimation';
import { mockData } from './mockData';
import { ChampionshipData, SeasonId } from './types';
import { BarChart2, Calendar as CalendarIcon, Settings, Trophy, Play, Loader2, History } from 'lucide-react';
import { cn } from './lib/utils';
import { AnimatePresence } from 'motion/react';
import { dataService } from './services/dataService';

type Tab = 'dashboard' | 'calendar' | 'admin';

export default function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [activeSeason, setActiveSeason] = useState<SeasonId>('2026');
  const [data, setData] = useState<ChampionshipData>(mockData);
  const [isLoading, setIsLoading] = useState(true);

  // Prevent scrolling during intro
  useEffect(() => {
    if (showIntro) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [showIntro]);

  // Load data from Firebase on mount and when season changes
  useEffect(() => {
    const loadData = async () => {
        setIsLoading(true);
        try {
            const fetchedData = await dataService.getData(activeSeason);
            setData(fetchedData);
        } catch (error) {
            console.error("Failed to load data:", error);
        } finally {
            setIsLoading(false);
        }
    };
    loadData();
  }, [activeSeason]);

  const isHistorical = activeSeason === '2024';

  return (
    <div className={cn(
        "min-h-screen font-sans selection:bg-red-500/30 flex flex-col transition-colors duration-500",
        isHistorical ? "bg-slate-950 text-amber-50" : "bg-slate-950 text-slate-200"
    )}>
      <AnimatePresence>
        {showIntro && <IntroAnimation onComplete={() => setShowIntro(false)} activeSeason={activeSeason} />}
      </AnimatePresence>

      {/* Header */}
      <header className={cn(
          "fixed top-0 left-0 right-0 z-[60] backdrop-blur-md border-b h-16 flex items-center justify-between px-4 md:px-8 transition-colors duration-500",
          isHistorical ? "bg-slate-950/90 border-amber-900/30" : "bg-slate-950/80 border-white/5"
      )}>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center transform -skew-x-12 shadow-lg transition-colors duration-500",
                isHistorical ? "bg-gradient-to-br from-amber-600 to-amber-800 shadow-amber-900/20" : "bg-gradient-to-br from-red-600 to-red-800 shadow-red-900/20"
            )}>
              <Trophy className="text-white w-5 h-5 transform skew-x-12" />
            </div>
            <h1 className="text-xl md:text-2xl font-black italic tracking-tighter text-white uppercase hidden sm:block">
              F1 <span className={cn(isHistorical ? "text-amber-500" : "text-red-500")}>Assassins</span>
            </h1>
            <h1 className="text-xl font-black italic tracking-tighter text-white uppercase sm:hidden">
              F1 <span className={cn(isHistorical ? "text-amber-500" : "text-red-500")}>A</span>
            </h1>
          </div>

          {/* Season Selector */}
          <div className="hidden md:flex bg-slate-900/50 rounded-full p-1 border border-white/5">
            <button
                onClick={() => setActiveSeason('2024')}
                className={cn(
                    "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1",
                    activeSeason === '2024' 
                        ? "bg-amber-600 text-white shadow-lg shadow-amber-900/20" 
                        : "text-slate-500 hover:text-amber-400"
                )}
            >
                <History size={12} />
                24/25
            </button>
            <button
                onClick={() => setActiveSeason('2026')}
                className={cn(
                    "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider transition-all",
                    activeSeason === '2026' 
                        ? "bg-red-600 text-white shadow-lg shadow-red-900/20" 
                        : "text-slate-500 hover:text-red-400"
                )}
            >
                2026
            </button>
          </div>
        </div>

        {/* Navigation - Moved to Header */}
        <nav className="flex items-center gap-1 md:gap-2">
            <button
                onClick={() => setActiveTab('dashboard')}
                className={cn(
                    "px-3 py-2 rounded-md transition-all flex items-center gap-2 text-xs md:text-sm font-bold uppercase tracking-wider",
                    activeTab === 'dashboard' 
                        ? cn("bg-white/10 text-white shadow-[0_0_10px_rgba(255,255,255,0.1)] border border-white/10", isHistorical && "shadow-amber-500/10")
                        : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
                )}
            >
                <BarChart2 size={16} className={cn(activeTab === 'dashboard' ? (isHistorical ? "text-amber-500" : "text-red-500") : "")} />
                <span className="hidden md:inline">Clasificación</span>
            </button>
            
            <button
                onClick={() => setActiveTab('calendar')}
                className={cn(
                    "px-3 py-2 rounded-md transition-all flex items-center gap-2 text-xs md:text-sm font-bold uppercase tracking-wider",
                    activeTab === 'calendar' 
                        ? cn("bg-white/10 text-white shadow-[0_0_10px_rgba(255,255,255,0.1)] border border-white/10", isHistorical && "shadow-amber-500/10")
                        : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
                )}
            >
                <CalendarIcon size={16} className={cn(activeTab === 'calendar' ? (isHistorical ? "text-amber-500" : "text-red-500") : "")} />
                <span className="hidden md:inline">Calendario</span>
            </button>

            <div className="w-[1px] h-6 bg-white/10 mx-1 md:mx-2"></div>

            <button
                onClick={() => setActiveTab('admin')}
                className={cn(
                    "px-3 py-2 rounded-md transition-all flex items-center gap-2 text-xs md:text-sm font-bold uppercase tracking-wider",
                    activeTab === 'admin' 
                        ? cn(
                            "border shadow-[0_0_10px_rgba(220,38,38,0.1)]",
                            isHistorical ? "bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-amber-500/10" : "bg-red-500/10 text-red-400 border-red-500/20"
                          )
                        : cn("text-slate-500", isHistorical ? "hover:text-amber-400 hover:bg-amber-500/5" : "hover:text-red-400 hover:bg-red-500/5")
                )}
                title="Admin Panel"
            >
                <Settings size={16} />
                <span className="hidden md:inline">Admin</span>
            </button>
            
             <button 
                onClick={() => setShowIntro(true)}
                className="ml-2 text-slate-700 hover:text-white transition-colors p-2 rounded-full hover:bg-white/5"
                title="Reproducir Intro"
            >
                <Play size={14} />
            </button>
        </nav>
      </header>

      {/* Main Content */}
      <main className="pt-24 px-4 md:px-8 max-w-7xl mx-auto flex-grow w-full">
        {/* Mobile Season Selector */}
        <div className="md:hidden flex justify-center mb-6">
            <div className="bg-slate-900/50 rounded-full p-1 border border-white/5 flex">
                <button
                    onClick={() => setActiveSeason('2024')}
                    className={cn(
                        "px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1",
                        activeSeason === '2024' 
                            ? "bg-amber-600 text-white shadow-lg shadow-amber-900/20" 
                            : "text-slate-500 hover:text-amber-400"
                    )}
                >
                    <History size={12} />
                    24/25
                </button>
                <button
                    onClick={() => setActiveSeason('2026')}
                    className={cn(
                        "px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all",
                        activeSeason === '2026' 
                            ? "bg-red-600 text-white shadow-lg shadow-red-900/20" 
                            : "text-slate-500 hover:text-red-400"
                    )}
                >
                    2026
                </button>
            </div>
        </div>

        {isLoading ? (
            <div className="flex flex-col items-center justify-center h-[50vh] text-slate-500">
                <Loader2 className={cn("w-10 h-10 animate-spin mb-4", isHistorical ? "text-amber-500" : "text-red-500")} />
                <p className="font-mono text-xs uppercase tracking-widest">Cargando datos...</p>
            </div>
        ) : (
            <>
                {activeTab === 'dashboard' && <Dashboard data={data} activeSeason={activeSeason} />}
                {activeTab === 'calendar' && <Calendar data={data} activeSeason={activeSeason} />}
                {activeTab === 'admin' && <AdminPanel data={data} onUpdateData={setData} activeSeason={activeSeason} />}
            </>
        )}
      </main>

      {/* Footer */}
      <footer className="py-8 text-center border-t border-white/5 mt-auto bg-slate-950 relative z-10">
        <div className="flex flex-col items-center justify-center gap-2 opacity-40 hover:opacity-80 transition-opacity duration-500">
            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-slate-500 to-transparent mb-2"></div>
            <p className="text-[10px] md:text-xs font-mono tracking-[0.3em] uppercase text-slate-400">
                Developed by <span className="text-white font-bold">juasmo</span>
            </p>
            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-slate-500 to-transparent mt-2"></div>
        </div>
      </footer>
    </div>
  );
}
