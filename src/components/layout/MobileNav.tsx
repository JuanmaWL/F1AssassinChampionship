import { motion } from 'motion/react';
import { BarChart2, Calendar as CalendarIcon, Swords } from 'lucide-react';
import { cn } from '../../lib/utils';
import { SEASONS, SeasonId } from '../../types';

export interface MobileNavProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  activeSeason: SeasonId;
  handleSeasonChange: (season: SeasonId) => void;
  isHistorical: boolean;
}

export function MobileNav({
  activeTab,
  setActiveTab,
  activeSeason,
  handleSeasonChange,
  isHistorical
}: MobileNavProps) {
  return (
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
  );
}
