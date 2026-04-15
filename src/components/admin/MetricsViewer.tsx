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

    const browsers = visits.reduce((acc, v) => {
      const browser = v.browser || 'Legacy/Desconocido';
      acc[browser] = (acc[browser] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const os = visits.reduce((acc, v) => {
      const system = v.os || 'Legacy/Desconocido';
      acc[system] = (acc[system] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const resolutions = visits.reduce((acc, v) => {
      if (!v.screenResolution) {
        acc['Desconocido'] = (acc['Desconocido'] || 0) + 1;
        return acc;
      }
      const [width] = v.screenResolution.split('x').map(Number);
      const type = width < 768 ? 'Mobile' : 'Desktop';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const referrers = visits.reduce((acc, v) => {
      const ref = v.referrer || 'Directo';
      acc[ref] = (acc[ref] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const timezones = visits.reduce((acc, v) => {
      const tz = v.timezone || 'Desconocido';
      acc[tz] = (acc[tz] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const hardware = {
      avgCores: visits.reduce((acc, v) => acc + (v.cores || 0), 0) / visits.length || 0,
      avgMemory: visits.reduce((acc, v) => acc + (v.memory || 0), 0) / visits.length || 0,
      touchDevices: visits.filter(v => v.touchSupport).length,
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

    return { totalUnique, totalVisits, devices, browsers, os, resolutions, referrers, timezones, hardware, chartData };
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/50 border border-white/10 rounded-xl p-6">
          <h3 className="text-sm font-bold text-white mb-4">Navegadores</h3>
          {Object.entries(metrics.browsers).map(([browser, count]) => (
            <div key={browser} className="flex justify-between text-xs mb-2">
              <span className="text-slate-400">{browser}</span>
              <span className="text-white font-mono">{count}</span>
            </div>
          ))}
        </div>
        <div className="bg-slate-900/50 border border-white/10 rounded-xl p-6">
          <h3 className="text-sm font-bold text-white mb-4">Sistemas Operativos</h3>
          {Object.entries(metrics.os).map(([os, count]) => (
            <div key={os} className="flex justify-between text-xs mb-2">
              <span className="text-slate-400">{os}</span>
              <span className="text-white font-mono">{count}</span>
            </div>
          ))}
        </div>
        <div className="bg-slate-900/50 border border-white/10 rounded-xl p-6">
          <h3 className="text-sm font-bold text-white mb-4">Resolución (Desktop vs Mobile)</h3>
          {Object.entries(metrics.resolutions).map(([type, count]) => (
            <div key={type} className="flex justify-between text-xs mb-2">
              <span className="text-slate-400">{type}</span>
              <span className="text-white font-mono">{count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/50 border border-white/10 rounded-xl p-6">
          <h3 className="text-sm font-bold text-white mb-4">Fuentes de Tráfico</h3>
          {Object.entries(metrics.referrers).slice(0, 5).map(([ref, count]) => (
            <div key={ref} className="flex justify-between text-xs mb-2">
              <span className="text-slate-400 truncate mr-2" title={ref}>{ref}</span>
              <span className="text-white font-mono">{count}</span>
            </div>
          ))}
        </div>
        <div className="bg-slate-900/50 border border-white/10 rounded-xl p-6">
          <h3 className="text-sm font-bold text-white mb-4">Zonas Horarias</h3>
          {Object.entries(metrics.timezones).slice(0, 5).map(([tz, count]) => (
            <div key={tz} className="flex justify-between text-xs mb-2">
              <span className="text-slate-400">{tz}</span>
              <span className="text-white font-mono">{count}</span>
            </div>
          ))}
        </div>
        <div className="bg-slate-900/50 border border-white/10 rounded-xl p-6">
          <h3 className="text-sm font-bold text-white mb-4">Capacidades Hardware (Promedio)</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Núcleos CPU</span>
              <span className="text-white font-mono">{metrics.hardware.avgCores.toFixed(1)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Memoria RAM</span>
              <span className="text-white font-mono">~{metrics.hardware.avgMemory.toFixed(1)} GB</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Dispositivos Táctiles</span>
              <span className="text-white font-mono">
                {Math.round((metrics.hardware.touchDevices / metrics.totalVisits) * 100 || 0)}%
              </span>
            </div>
          </div>
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
