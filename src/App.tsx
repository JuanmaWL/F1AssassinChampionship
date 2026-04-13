import { useState, useEffect, lazy, Suspense } from 'react';
import { Dashboard } from './components/Dashboard';
import { IntroAnimation } from './components/IntroAnimation';
import { BarChart2, Calendar as CalendarIcon, Trophy, Loader2, Dices, Shield, Swords } from 'lucide-react';
import { cn } from './lib/utils';
import { AnimatePresence, motion } from 'motion/react';
import { ChampionshipProvider, useChampionship } from './context/ChampionshipContext';
import { Footer } from './components/layout/Footer';
import { SEASONS, SeasonId } from './types';
import { useVisitTracker } from './hooks/useVisitTracker';

// Lazy loaded components
const Calendar = lazy(() => import('./components/Calendar').then(module => ({ default: module.Calendar })));
const AdminPanel = lazy(() => import('./components/AdminPanel').then(module => ({ default: module.AdminPanel })));
const Draw = lazy(() => import('./components/Draw').then(module => ({ default: module.Draw })));
const HeadToHead = lazy(() => import('./components/HeadToHead').then(module => ({ default: module.HeadToHead })));

type Tab = 'dashboard' | 'calendar' | 'admin' | 'draw' | 'h2h';

const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center h-[50vh] text-slate-500">
    <Loader2 className="w-10 h-10 animate-spin mb-4 text-red-500" />
    <p className="font-mono text-xs uppercase tracking-widest">Cargando módulo...</p>
  </div>
);

const LoadingOverlay = () => (
  <div className="space-y-8 animate-pulse">
    <div className="h-64 md:h-96 bg-slate-900/50 rounded-2xl border border-white/5 relative overflow-hidden">
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-32 bg-slate-900/50 rounded-2xl border border-white/5 relative overflow-hidden">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        </div>
      ))}
    </div>
  </div>
);

function AppContent() {
  useVisitTracker();
  
  const [showIntro, setShowIntro] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isChangingSeason, setIsChangingSeason] = useState(false);
  
  const { data, activeSeason, setActiveSeason, isHistorical, isLoading } = useChampionship();

  const handleSeasonChange = (season: SeasonId) => {
    if (season === activeSeason) return;
    setIsChangingSeason(true);
    setTimeout(() => {
      setActiveSeason(season);
      setIsChangingSeason(false);
    }, 300); // Wait for exit animation to finish
  };

  // Prevent scrolling during intro
  useEffect(() => {
    if (showIntro) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [showIntro]);

  // Scroll to top when season or tab changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeSeason, activeTab]);

  // Guard to prevent staying on the draw tab if it's not active in the current season
  useEffect(() => {
    if (activeTab === 'draw' && !isLoading && !data.isDrawActive) {
      setActiveTab('dashboard');
    }
  }, [activeTab, data.isDrawActive, isLoading]);

  // Listen for custom tab switch events (e.g. from Draw component after saving)
  useEffect(() => {
    const handleSwitchTab = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail) setActiveTab(detail as Tab);
    };
    window.addEventListener('switch-tab', handleSwitchTab);
    return () => window.removeEventListener('switch-tab', handleSwitchTab);
  }, []);

  return (
    <div className={cn(
        "min-h-screen font-sans selection:bg-red-500/30 flex flex-col transition-colors duration-500 bg-slate-950",
        isHistorical ? "text-amber-50" : "text-slate-200"
    )}>
      <AnimatePresence>
        {showIntro && <IntroAnimation onComplete={() => setShowIntro(false)} activeSeason={activeSeason} />}
      </AnimatePresence>      {/* Header */}
      <header className={cn(
          "fixed top-0 left-0 right-0 z-[60] backdrop-blur-xl border-b h-20 flex items-center transition-all duration-500",
          isHistorical 
            ? "bg-slate-950/95 border-amber-900/40 shadow-[0_4px_30px_rgba(120,53,15,0.1)]" 
            : "bg-slate-950/90 border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)]"
      )}>        <div className="max-w-[1800px] mx-auto w-full flex items-center justify-between px-4 md:px-10 h-full gap-4 relative">
          
          {/* Left Section: Logo & Easter Egg Intro */}
          <div className="flex items-center shrink-0 z-10">
            <div 
              className="flex items-center gap-3 group cursor-pointer relative" 
              onClick={() => setActiveTab('dashboard')}
              onDoubleClick={() => {
                setShowIntro(true);
                const audio = new Audio('https://www.soundjay.com/buttons/sounds/button-3.mp3');
                audio.volume = 0.2;
                audio.play().catch(() => {});
              }}
              title="Doble clic para ver la intro"
            >
              <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center transform -skew-x-12 shadow-2xl transition-all duration-500 group-hover:rotate-3",
                  isHistorical 
                    ? "bg-gradient-to-br from-amber-600 to-amber-800 shadow-amber-900/40" 
                    : "bg-gradient-to-br from-red-600 to-red-800 shadow-red-900/40"
              )}>
                <Trophy className="text-white w-5 h-5 transform skew-x-12" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-2xl font-black italic tracking-tighter text-white uppercase leading-none">
                  F1 <span className={cn(isHistorical ? "text-amber-500" : "text-red-500")}>Assassins</span>
                </h1>
                <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-slate-500 mt-1">Championship</span>
              </div>
            </div>
          </div>

          {/* Center Section: Primary Navigation (Desktop) */}
          <div className="hidden md:flex flex-1 justify-center items-center min-w-0 z-0">
            <nav className="flex items-center bg-slate-900/40 rounded-2xl p-1 border border-white/5 backdrop-blur-sm">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={cn(
                  "px-3 xl:px-8 py-3 rounded-xl transition-all duration-300 flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] relative group",
                  activeTab === 'dashboard' ? "text-white" : "text-slate-500 hover:text-slate-300"
                )}
              >
                {activeTab === 'dashboard' && (
                  <motion.div 
                    layoutId="nav-active-bg" 
                    className={cn("absolute inset-0 rounded-xl z-0", isHistorical ? "bg-amber-500/5" : "bg-red-500/5")} 
                  />
                )}
                <div className="relative z-10 flex items-center gap-3">
                  <BarChart2 size={18} className={cn(activeTab === 'dashboard' ? (isHistorical ? "text-amber-500" : "text-red-500") : "text-slate-600")} />
                  <span className="hidden xl:inline whitespace-nowrap">Clasificación</span>
                </div>
                {activeTab === 'dashboard' && (
                  <motion.div 
                    layoutId="nav-indicator-line"
                    className={cn("absolute bottom-0 left-6 right-6 h-0.5 rounded-full", isHistorical ? "bg-amber-500 shadow-[0_0_10px_#f59e0b]" : "bg-red-500 shadow-[0_0_10px_#ef4444]")} 
                  />
                )}
              </button>
              
              <button
                onClick={() => setActiveTab('calendar')}
                className={cn(
                  "px-3 xl:px-8 py-3 rounded-xl transition-all duration-300 flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] relative group",
                  activeTab === 'calendar' ? "text-white" : "text-slate-500 hover:text-slate-300"
                )}
              >
                {activeTab === 'calendar' && (
                  <motion.div 
                    layoutId="nav-active-bg" 
                    className={cn("absolute inset-0 rounded-xl z-0", isHistorical ? "bg-amber-500/5" : "bg-red-500/5")} 
                  />
                )}
                <div className="relative z-10 flex items-center gap-3">
                  <CalendarIcon size={18} className={cn(activeTab === 'calendar' ? (isHistorical ? "text-amber-500" : "text-red-500") : "text-slate-600")} />
                  <span className="hidden xl:inline whitespace-nowrap">Calendario</span>
                </div>
                {activeTab === 'calendar' && (
                  <motion.div 
                    layoutId="nav-indicator-line"
                    className={cn("absolute bottom-0 left-6 right-6 h-0.5 rounded-full", isHistorical ? "bg-amber-500 shadow-[0_0_10px_#f59e0b]" : "bg-red-500 shadow-[0_0_10px_#ef4444]")} 
                  />
                )}
              </button>

              <button
                onClick={() => setActiveTab('h2h')}
                className={cn(
                  "px-3 xl:px-8 py-3 rounded-xl transition-all duration-300 flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] relative group",
                  activeTab === 'h2h' ? "text-white" : "text-slate-500 hover:text-slate-300"
                )}
              >
                {activeTab === 'h2h' && (
                  <motion.div 
                    layoutId="nav-active-bg" 
                    className={cn("absolute inset-0 rounded-xl z-0", isHistorical ? "bg-amber-500/5" : "bg-red-500/5")} 
                  />
                )}
                <div className="relative z-10 flex items-center gap-3">
                  <Swords size={18} className={cn(activeTab === 'h2h' ? (isHistorical ? "text-amber-500" : "text-red-500") : "text-slate-600")} />
                  <span className="hidden xl:inline whitespace-nowrap">Cara a Cara</span>
                </div>
                {activeTab === 'h2h' && (
                  <motion.div 
                    layoutId="nav-indicator-line"
                    className={cn("absolute bottom-0 left-6 right-6 h-0.5 rounded-full", isHistorical ? "bg-amber-500 shadow-[0_0_10px_#f59e0b]" : "bg-red-500 shadow-[0_0_10px_#ef4444]")} 
                  />
                )}
              </button>
            </nav>
          </div>

          {/* Right Section: Tools, Season Toggle & Admin */}
          <div className="flex items-center justify-end gap-2 md:gap-4 shrink-0 z-10">
            {/* Season Toggle - Minimalist - Moved to Right */}
            <div className="hidden md:flex items-center">
              <div className="relative bg-slate-900/60 rounded-full p-1 border border-white/5 flex items-center h-10 w-36 overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div 
                    key={activeSeason}
                    className={cn("absolute top-1 bottom-1 rounded-full shadow-lg z-0", activeSeason === '2024' ? "bg-amber-600" : "bg-red-600")}
                    initial={false}
                    animate={{ 
                      left: activeSeason === '2024' ? '4px' : '50%', 
                      width: 'calc(50% - 4px)',
                      opacity: 1
                    }}
                    exit={{ opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                </AnimatePresence>
                {SEASONS.map(season => (
                  <button
                    key={season}
                    onClick={() => handleSeasonChange(season)}
                    className={cn(
                      "relative z-10 flex-1 h-full text-[10px] font-bold uppercase tracking-widest transition-colors duration-300 flex items-center justify-center px-1 font-sans",
                      activeSeason === season ? "text-white" : "text-slate-500 hover:text-slate-300"
                    )}
                  >
                    {season === '2024' ? '24/25' : '2026'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-1 md:gap-2 bg-slate-900/40 p-1 rounded-xl border border-white/5">
              <AnimatePresence mode="popLayout" initial={false}>
                {data.isDrawActive && (
                  <motion.div
                    key="draw-button-container"
                    initial={{ opacity: 0, scale: 0.8, width: 0 }}
                    animate={{ opacity: 1, scale: 1, width: 'auto' }}
                    exit={{ opacity: 0, scale: 0.8, width: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25, opacity: { duration: 0.2 } }}
                    className="overflow-hidden"
                  >
                    <button
                        onClick={() => setActiveTab('draw')}
                        className={cn(
                            "p-2.5 rounded-lg transition-all group relative",
                            activeTab === 'draw' ? "bg-white/10 text-white shadow-lg" : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
                        )}
                        title="Sorteo de Pilotos"
                    >
                        <Dices size={18} className={cn(activeTab === 'draw' ? (isHistorical ? "text-amber-500" : "text-red-500") : "")} />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <button
                onClick={() => setActiveTab('admin')}
                className={cn(
                    "px-4 py-2.5 rounded-lg transition-all flex items-center gap-2.5 text-[10px] font-black uppercase tracking-[0.2em] border group relative overflow-hidden",
                    activeTab === 'admin' 
                        ? isHistorical ? "bg-amber-500 text-white border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)]" : "bg-red-600 text-white border-red-600 shadow-[0_0_20px_rgba(239,68,68,0.2)]"
                        : "bg-slate-900/50 border-white/5 text-slate-400 hover:text-white hover:bg-white/5"
                )}
              >
                <Shield size={14} className={cn(
                  "transition-transform duration-500 group-hover:scale-110",
                  activeTab === 'admin' ? "text-white" : (isHistorical ? "text-amber-500" : "text-red-500")
                )} />
                <span className="relative z-10">Admin</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Bar */}
      <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-1.5 flex items-center gap-1 shadow-2xl">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={cn(
            "flex flex-col items-center justify-center w-16 h-12 rounded-xl transition-all relative",
            activeTab === 'dashboard' ? "text-white" : "text-slate-500"
          )}
        >
          {activeTab === 'dashboard' && (
            <motion.div layoutId="mobile-nav-bg" className={cn("absolute inset-0 rounded-xl", isHistorical ? "bg-amber-500/20" : "bg-red-500/20")} />
          )}
          <BarChart2 size={20} className={cn(activeTab === 'dashboard' ? (isHistorical ? "text-amber-500" : "text-red-500") : "")} />
          <span className="text-[8px] font-black uppercase tracking-tighter mt-0.5">Clasif.</span>
        </button>

        <button
          onClick={() => setActiveTab('calendar')}
          className={cn(
            "flex flex-col items-center justify-center w-16 h-12 rounded-xl transition-all relative",
            activeTab === 'calendar' ? "text-white" : "text-slate-500"
          )}
        >
          {activeTab === 'calendar' && (
            <motion.div layoutId="mobile-nav-bg" className={cn("absolute inset-0 rounded-xl", isHistorical ? "bg-amber-500/20" : "bg-red-500/20")} />
          )}
          <CalendarIcon size={20} className={cn(activeTab === 'calendar' ? (isHistorical ? "text-amber-500" : "text-red-500") : "")} />
          <span className="text-[8px] font-black uppercase tracking-tighter mt-0.5">Calend.</span>
        </button>

        <button
          onClick={() => setActiveTab('h2h')}
          className={cn(
            "flex flex-col items-center justify-center w-16 h-12 rounded-xl transition-all relative",
            activeTab === 'h2h' ? "text-white" : "text-slate-500"
          )}
        >
          {activeTab === 'h2h' && (
            <motion.div layoutId="mobile-nav-bg" className={cn("absolute inset-0 rounded-xl", isHistorical ? "bg-amber-500/20" : "bg-red-500/20")} />
          )}
          <Swords size={20} className={cn(activeTab === 'h2h' ? (isHistorical ? "text-amber-500" : "text-red-500") : "")} />
          <span className="text-[8px] font-black uppercase tracking-tighter mt-0.5">H2H</span>
        </button>

        <div className="w-[1px] h-6 bg-white/10 mx-1"></div>

        <div className="flex items-center gap-1">
          {SEASONS.map(season => (
              <button
                key={season}
                onClick={() => handleSeasonChange(season)}
                className={cn(
                  "w-12 h-10 rounded-xl text-[9px] font-bold transition-all flex items-center justify-center font-sans",
                  activeSeason === season 
                    ? isHistorical ? "bg-amber-600 text-white" : "bg-red-600 text-white"
                    : "text-slate-500 hover:text-slate-300"
                )}
              >
                {season === '2024' ? '24/25' : '2026'}
              </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className={cn(
        "pt-28 pb-24 md:pb-8 px-4 md:px-8 mx-auto flex-grow w-full transition-all duration-500",
        activeTab === 'admin' ? "max-w-[1600px]" : "max-w-7xl"
      )}>
        <AnimatePresence mode="wait">
          {isLoading || isChangingSeason ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
              >
                <LoadingOverlay />
              </motion.div>
          ) : (
              <motion.div
                key={activeSeason + activeTab}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
              >
                <Suspense fallback={<LoadingSpinner />}>
                    {activeTab === 'dashboard' && <Dashboard />}
                    {activeTab === 'calendar' && <Calendar />}
                    {activeTab === 'h2h' && <HeadToHead />}
                    {activeTab === 'draw' && <Draw />}
                    {activeTab === 'admin' && <AdminPanel />}
                </Suspense>
              </motion.div>
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {!isLoading && !isChangingSeason && activeTab !== 'draw' && activeTab !== 'admin' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <Footer />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import { AuthProvider } from './context/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <ChampionshipProvider>
        <AppContent />
      </ChampionshipProvider>
    </AuthProvider>
  );
}