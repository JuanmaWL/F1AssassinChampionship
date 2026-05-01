import React from 'react';
import { createPortal } from 'react-dom';
import { Timer, X, MapPin, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Driver, Race } from '../../types';
import { TEXTURE_ASSETS, getFlagUrl } from '../../constants/assets';

interface FastestLapModalProps {
  driverId: string | null;
  drivers: Driver[];
  races: Race[];
  onClose: () => void;
}

export const FastestLapModal: React.FC<FastestLapModalProps> = ({
  driverId,
  drivers,
  races,
  onClose
}) => {
  return createPortal(
    <AnimatePresence>
      {driverId && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-slate-900 border border-purple-500/40 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden relative"
            onClick={(e) => e.stopPropagation()}
          >
            {(() => {
              const driver = drivers.find(d => d.id === driverId);
              const driverFastestLaps = races.filter(r => r.status === 'completed' && r.results?.some(res => res.driverId === driverId && res.fastestLap));
              
              return (
                <>
                  {/* Modal Header */}
                  <div className="relative h-32 bg-gradient-to-br from-purple-900/60 via-slate-900 to-slate-900 border-b border-purple-500/30 flex items-center px-10 overflow-hidden">
                    <div className="absolute inset-0 opacity-30 mix-blend-overlay" style={{ backgroundImage: `url('${TEXTURE_ASSETS.CARBON_FIBRE}')` }}></div>
                    
                    <div className="relative z-10 flex items-center gap-6">
                      <div className="w-16 h-16 rounded-2xl bg-purple-600/30 border border-purple-500/50 flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.5)]">
                        <Timer className="text-purple-400 animate-pulse" size={32} />
                      </div>
                      <div>
                        <h3 className="text-3xl font-black italic text-white uppercase tracking-tighter leading-none">
                          Vueltas Rápidas
                        </h3>
                        <div className="flex items-center gap-3 mt-3">
                          <div className="w-2 h-2 rounded-full bg-purple-500 animate-ping" />
                          <p className="text-sm font-black text-purple-400 uppercase tracking-[0.25em]">
                            {driver?.name}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <button 
                      onClick={onClose} 
                      className="absolute top-8 right-8 p-2.5 hover:bg-red-500/20 rounded-xl transition-all text-slate-400 hover:text-red-400 bg-black/40 backdrop-blur-md border border-white/10 group/close"
                      title="Cerrar"
                    >
                      <X size={24} className="group-hover/close:rotate-90 transition-transform duration-300" />
                    </button>
                  </div>

                  {/* Modal Body */}
                  <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar bg-slate-950/40">
                    <div className="grid grid-cols-1 gap-5">
                      {driverFastestLaps.length > 0 ? (
                        driverFastestLaps.map((race, idx) => {
                          const result = race.results?.find(res => res.driverId === driverId && res.fastestLap);
                          return (
                            <motion.div 
                              key={race.id}
                              initial={{ opacity: 0, y: 15 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.1 }}
                              className="group relative bg-slate-900/80 border border-white/10 rounded-2xl p-5 hover:bg-purple-600/10 hover:border-purple-500/40 transition-all duration-500 shadow-xl"
                            >
                              <div className="flex items-center justify-between gap-6">
                                <div className="flex items-center gap-6">
                                  {/* Flag & Round */}
                                  <div className="relative shrink-0">
                                    <div className="absolute -top-3 -left-3 z-10 w-8 h-8 bg-purple-600 rounded-xl flex items-center justify-center text-xs font-black text-white border-2 border-slate-900 shadow-xl">
                                      {idx + 1}
                                    </div>
                                    {race.flagCode ? (
                                      <img 
                                        src={getFlagUrl(race.flagCode, 160)} 
                                        alt={race.name} 
                                        className="w-20 h-12 rounded-xl shadow-2xl object-cover border border-white/10 group-hover:scale-110 transition-transform duration-700" 
                                      />
                                    ) : (
                                      <div className="w-20 h-12 rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center">
                                        <MapPin size={20} className="text-slate-600" />
                                      </div>
                                    )}
                                  </div>
                                  
                                  {/* Info */}
                                  <div className="flex flex-col gap-1.5">
                                    <h4 className="text-xl font-black italic text-white uppercase tracking-tight group-hover:text-purple-300 transition-colors leading-tight">
                                      {race.name}
                                    </h4>
                                    <div className="flex flex-wrap gap-x-6 gap-y-1.5 mt-1">
                                      <div className="flex items-center gap-2 text-xs text-slate-400 font-mono uppercase tracking-wider">
                                        <Calendar size={14} className="text-purple-500/80" />
                                        {new Date(race.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                                      </div>
                                      <div className="flex items-center gap-2 text-xs text-slate-500 font-mono uppercase tracking-wider">
                                        <MapPin size={14} className="text-purple-500/80" />
                                        {race.circuit}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Time & Badge */}
                                <div className="flex flex-col items-end gap-2 shrink-0">
                                  {result?.fastestLapTime ? (
                                    <div className="bg-purple-500/20 px-4 py-2 rounded-xl border border-purple-500/40 shadow-[0_0_20px_rgba(168,85,247,0.2)] group-hover:bg-purple-500/30 transition-colors">
                                      <span className="text-lg font-black text-purple-300 font-mono tracking-tighter">
                                        {result.fastestLapTime}
                                      </span>
                                    </div>
                                  ) : (
                                    <div className="w-12 h-12 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/20 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all duration-500">
                                      <Timer size={24} className="text-purple-400" />
                                    </div>
                                  )}
                                  <span className="text-[10px] font-black text-purple-500 uppercase tracking-[0.3em]">Púrpura</span>
                                </div>
                              </div>
                              
                              {/* Decorative elements */}
                              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                              <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-700" />
                            </motion.div>
                          );
                        })
                      ) : (
                        <div className="py-16 flex flex-col items-center justify-center text-center">
                          <Timer size={64} className="text-slate-800 mb-6" />
                          <p className="text-slate-500 font-mono text-sm uppercase tracking-widest">No hay vueltas rápidas registradas</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Modal Footer */}
                  <div className="p-5 bg-slate-900/90 border-t border-white/10 flex justify-center">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">
                      Assassin's Championship F1 • Datos de Telemetría
                    </p>
                  </div>
                </>
              );
            })()}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};
