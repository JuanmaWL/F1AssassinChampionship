import { useState, useEffect, useMemo } from 'react';
import { dataService, VisitData } from '../../services/dataService';
import { Loader2, Users, Monitor, Smartphone, Tablet, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function MetricsViewer() {
  const [visits, setVisits] = useState<VisitData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVisits = async () => {
      setIsLoading(true);
      const data = await dataService.getVisits();
      setVisits(data);
      setIsLoading(false);
    };
    fetchVisits();
  }, []);

  const metrics = useMemo(() => {
    if (!visits.length) return null;

    const uniqueIps = new Set(visits.map(v => v.hashedIp));
    const totalUnique = uniqueIps.size;
    const totalVisits = visits.length;

    const devices = {
      desktop: visits.filter(v => v.deviceType === 'desktop').length,
      mobile: visits.filter(v => v.deviceType === 'mobile').length,
      tablet: visits.filter(v => v.deviceType === 'tablet').length,
    };

    // Group by day for the chart
    const visitsByDay = new Map<string, { date: string, unique: Set<string>, total: number }>();
    
    // Sort visits chronologically for the chart
    const sortedVisits = [...visits].sort((a, b) => a.timestamp - b.timestamp);
    
    sortedVisits.forEach(v => {
      const date = new Date(v.timestamp).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
      if (!visitsByDay.has(date)) {
        visitsByDay.set(date, { date, unique: new Set(), total: 0 });
      }
      const dayData = visitsByDay.get(date)!;
      dayData.unique.add(v.hashedIp);
      dayData.total += 1;
    });

    const chartData = Array.from(visitsByDay.values()).map(d => ({
      date: d.date,
      Únicos: d.unique.size,
      Totales: d.total
    }));

    return { totalUnique, totalVisits, devices, chartData };
  }, [visits]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin mb-4" />
        <p className="font-mono text-xs uppercase tracking-widest">Cargando métricas...</p>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-500">
        <Activity className="w-12 h-12 mb-4 opacity-20" />
        <p className="font-mono text-xs uppercase tracking-widest">No hay datos de visitas aún</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/50 border border-white/10 rounded-xl p-6 flex flex-col items-center justify-center text-center">
          <Users className="w-8 h-8 text-emerald-500 mb-2" />
          <span className="text-3xl font-black text-white">{metrics.totalUnique}</span>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Visitantes Únicos</span>
        </div>
        <div className="bg-slate-900/50 border border-white/10 rounded-xl p-6 flex flex-col items-center justify-center text-center">
          <Activity className="w-8 h-8 text-blue-500 mb-2" />
          <span className="text-3xl font-black text-white">{metrics.totalVisits}</span>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Visitas Totales</span>
        </div>
        <div className="bg-slate-900/50 border border-white/10 rounded-xl p-6 flex flex-col items-center justify-center text-center">
          <Smartphone className="w-8 h-8 text-purple-500 mb-2" />
          <span className="text-3xl font-black text-white">
            {Math.round((metrics.devices.mobile / metrics.totalVisits) * 100 || 0)}%
          </span>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Móvil</span>
        </div>
        <div className="bg-slate-900/50 border border-white/10 rounded-xl p-6 flex flex-col items-center justify-center text-center">
          <Monitor className="w-8 h-8 text-amber-500 mb-2" />
          <span className="text-3xl font-black text-white">
            {Math.round((metrics.devices.desktop / metrics.totalVisits) * 100 || 0)}%
          </span>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Desktop</span>
        </div>
      </div>

      <div className="bg-slate-900/50 border border-white/10 rounded-xl p-6">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2">
          <Activity size={16} className="text-emerald-500" />
          Actividad Reciente
        </h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={metrics.chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.5} />
              <XAxis 
                dataKey="date" 
                stroke="#94a3b8" 
                tick={{ fill: '#94a3b8', fontSize: 11 }} 
                tickMargin={10}
              />
              <YAxis 
                stroke="#94a3b8" 
                tick={{ fill: '#94a3b8', fontSize: 11 }} 
                tickMargin={10}
                allowDecimals={false}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem' }}
                itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                labelStyle={{ color: '#94a3b8', fontSize: '10px', textTransform: 'uppercase', marginBottom: '4px' }}
              />
              <Line 
                type="monotone" 
                dataKey="Únicos" 
                stroke="#10b981" 
                strokeWidth={3} 
                dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#0f172a' }} 
                activeDot={{ r: 6, strokeWidth: 0 }} 
              />
              <Line 
                type="monotone" 
                dataKey="Totales" 
                stroke="#3b82f6" 
                strokeWidth={2} 
                strokeDasharray="5 5"
                dot={false}
                activeDot={{ r: 4 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
