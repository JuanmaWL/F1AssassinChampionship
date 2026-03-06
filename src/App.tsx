import React, { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { Calendar } from './components/Calendar';
import { AdminPanel } from './components/AdminPanel';
import { mockData } from './mockData';
import { ChampionshipData } from './types';
import { LayoutDashboard, Calendar as CalendarIcon, Settings, Trophy } from 'lucide-react';
import { cn } from './lib/utils';

type Tab = 'dashboard' | 'calendar' | 'admin';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [data, setData] = useState<ChampionshipData>(mockData);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-red-500/30">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-white/5 h-16 flex items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-red-800 rounded-lg flex items-center justify-center transform -skew-x-12 shadow-lg shadow-red-900/20">
            <Trophy className="text-white w-5 h-5 transform skew-x-12" />
          </div>
          <h1 className="text-xl md:text-2xl font-black italic tracking-tighter text-white uppercase">
            F1 <span className="text-red-500">Assassins</span>
          </h1>
        </div>
        <div className="text-xs font-mono text-slate-500 hidden md:block">
          TEMPORADA 2025 // V1.0
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 px-4 md:px-8 max-w-7xl mx-auto min-h-[calc(100vh-80px)]">
        {activeTab === 'dashboard' && <Dashboard data={data} />}
        {activeTab === 'calendar' && <Calendar data={data} />}
        {activeTab === 'admin' && <AdminPanel data={data} onUpdateData={setData} />}
      </main>

      {/* Bottom Navigation (Mobile First) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-lg border-t border-white/10 pb-safe z-50">
        <div className="flex justify-around items-center h-16 max-w-md mx-auto">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={cn(
              "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors",
              activeTab === 'dashboard' ? "text-red-500" : "text-slate-500 hover:text-slate-300"
            )}
          >
            <LayoutDashboard size={24} strokeWidth={activeTab === 'dashboard' ? 2.5 : 2} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Clasificación</span>
          </button>
          
          <button
            onClick={() => setActiveTab('calendar')}
            className={cn(
              "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors",
              activeTab === 'calendar' ? "text-red-500" : "text-slate-500 hover:text-slate-300"
            )}
          >
            <CalendarIcon size={24} strokeWidth={activeTab === 'calendar' ? 2.5 : 2} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Calendario</span>
          </button>

          <button
            onClick={() => setActiveTab('admin')}
            className={cn(
              "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors",
              activeTab === 'admin' ? "text-red-500" : "text-slate-500 hover:text-slate-300"
            )}
          >
            <Settings size={24} strokeWidth={activeTab === 'admin' ? 2.5 : 2} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Admin</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
