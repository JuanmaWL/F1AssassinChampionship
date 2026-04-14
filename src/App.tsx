import { useState, useEffect, lazy, Suspense } from 'react';
import { Dashboard as Standings } from './pages/Standings';
import { IntroAnimation } from './components/ui/IntroAnimation';
import { Loader2 } from 'lucide-react';
import { cn } from './lib/utils';
import { AnimatePresence, motion } from 'motion/react';
import { ChampionshipProvider, useChampionship } from './context/ChampionshipContext';
import { Footer } from './components/layout/Footer';
import { Header } from './components/layout/Header';
import { MobileNav } from './components/layout/MobileNav';
import { SeasonId } from './types';
import { useVisitTracker } from './hooks/useVisitTracker';

// Lazy loaded components
const CalendarView = lazy(() => import('./pages/CalendarView').then(module => ({ default: module.Calendar })));
const Admin = lazy(() => import('./pages/Admin').then(module => ({ default: module.AdminPanel })));
const SeasonDraft = lazy(() => import('./pages/SeasonDraft').then(module => ({ default: module.Draw })));
const H2H = lazy(() => import('./pages/H2H').then(module => ({ default: module.HeadToHead })));

export type Tab = 'dashboard' | 'calendar' | 'admin' | 'draw' | 'h2h';

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
      </AnimatePresence>

      <Header 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeSeason={activeSeason}
        handleSeasonChange={handleSeasonChange}
        isHistorical={isHistorical}
        data={data}
        setShowIntro={setShowIntro}
      />

      <MobileNav 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeSeason={activeSeason}
        handleSeasonChange={handleSeasonChange}
        isHistorical={isHistorical}
      />

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
                    {activeTab === 'dashboard' && <Standings />}
                    {activeTab === 'calendar' && <CalendarView />}
                    {activeTab === 'h2h' && <H2H />}
                    {activeTab === 'draw' && <SeasonDraft />}
                    {activeTab === 'admin' && <Admin />}
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
