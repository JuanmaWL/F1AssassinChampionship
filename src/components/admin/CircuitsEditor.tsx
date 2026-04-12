import { CIRCUITS } from '../../data/circuits';
import { CircuitTrack } from '../CircuitTrack';
import { cn } from '../../lib/utils';
import { Compass, Info, Hash } from 'lucide-react';

export function CircuitsEditor() {
  const circuitsList = Object.values(CIRCUITS);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black italic text-white uppercase tracking-tighter flex items-center gap-3">
            <Compass className="w-8 h-8 text-blue-500" />
            Administración de Circuitos
          </h2>
          <p className="text-slate-400 text-sm mt-1">Gestiona los trazados y metadatos de los circuitos del campeonato.</p>
        </div>
        <div className="bg-slate-900 border border-white/10 px-6 py-3 rounded-2xl flex items-center gap-3 shadow-lg">
          <Hash className="text-blue-400" size={20} />
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Circuitos</span>
            <span className="text-xl font-black text-white leading-none">{circuitsList.length}</span>
          </div>
        </div>
      </div>

      <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl flex items-start gap-3">
        <Info className="text-blue-400 shrink-0 mt-0.5" size={18} />
        <p className="text-xs text-blue-200/70 leading-relaxed">
          Los cambios realizados aquí son <strong className="text-blue-300">temporales</strong> y sirven para previsualizar trazados. Para que los cambios sean permanentes, debes actualizar el archivo <code className="bg-black/30 px-1 rounded text-blue-400">src/data/circuits.ts</code> con los nuevos valores de <code className="bg-black/30 px-1 rounded text-blue-400">svgPath</code>.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {circuitsList.map((circuit, index) => (
          <div key={circuit.id} className="bg-slate-900 border border-white/10 rounded-3xl p-5 flex flex-col gap-4 group hover:border-blue-500/30 transition-all duration-300 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Hash size={60} className="text-white" />
            </div>
            
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-xs font-black text-slate-400 border border-white/10">
                  {index + 1}
                </span>
                <h3 className="font-black italic text-white uppercase tracking-tight">{circuit.name}</h3>
              </div>
              <span className="text-2xl drop-shadow-md">{circuit.flag}</span>
            </div>

            <div className="w-full h-48 bg-slate-950 rounded-2xl flex items-center justify-center border border-white/5 relative overflow-hidden group-hover:border-blue-500/20 transition-colors">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.05),transparent_70%)]"></div>
              <CircuitTrack circuitInfo={circuit} className="w-40 h-40 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]" />
            </div>

            <div className="space-y-3 relative z-10">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">ID del Circuito</label>
                <div className="bg-slate-950 border border-white/5 rounded-xl px-3 py-2 text-xs text-slate-300 font-mono">
                  {circuit.id}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">SVG Path (Trazado)</label>
                <textarea 
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-[10px] text-blue-400 font-mono focus:outline-none focus:border-blue-500/50 transition-all resize-none h-24"
                  defaultValue={circuit.svgPath}
                  spellCheck={false}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
