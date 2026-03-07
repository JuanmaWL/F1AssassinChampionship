import React from 'react';
import { motion } from 'motion/react';
import { Trophy } from 'lucide-react';
import { Constructor } from '../../types';
import { cn } from '../../lib/utils';

interface ConstructorsTableProps {
  constructors: Constructor[];
  hasCompletedRaces: boolean;
}

export function ConstructorsTable({ constructors, hasCompletedRaces }: ConstructorsTableProps) {
  const sortedConstructors = hasCompletedRaces 
    ? [...constructors].sort((a, b) => b.points - a.points)
    : [...constructors].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.4 }}
      className="bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
    >
      <div className="p-6 border-b border-white/10">
          <h2 className="text-2xl font-black italic text-white uppercase tracking-tighter flex items-center gap-3">
          <span className="w-1 h-8 bg-blue-600 rounded-full block"></span>
          Mundial de Constructores
          </h2>
      </div>
      
      <div className="overflow-x-auto">
          {constructors.length === 0 || constructors.every(c => c.points === 0) ? (
              <div className="py-20 flex flex-col items-center justify-center text-center px-6">
                  <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mb-6 border border-white/5">
                      <Trophy className="text-slate-500 w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-bold text-white italic uppercase tracking-wider mb-2">Fábricas en Marcha</h3>
                  <p className="text-slate-500 text-sm max-w-xs mx-auto font-mono uppercase tracking-widest">
                      Los ingenieros están ultimando los detalles. El mundial de constructores cobrará vida pronto.
                  </p>
                  <div className="mt-8 flex gap-2">
                      {[1, 2, 3].map(i => (
                          <div key={i} className="w-2 h-2 rounded-full bg-blue-500/20 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                      ))}
                  </div>
              </div>
          ) : (
              <table className="w-full text-left border-collapse">
              <thead>
                  <tr className="bg-slate-950/50 text-xs uppercase tracking-wider text-slate-500 font-medium">
                      <th className="py-4 px-6 w-16 text-center">POSICIÓN</th>
                      <th className="py-4 px-6">Equipo</th>
                      <th className="py-4 px-6 text-right">Puntos</th>
                  </tr>
              </thead>
              <tbody>
                  {sortedConstructors.map((constructor, index) => (
                      <motion.tr 
                          key={constructor.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={cn(
                              "border-b border-white/5 transition-all duration-300 group",
                              hasCompletedRaces && index === 0 ? "bg-yellow-500/10 hover:bg-yellow-500/20" : "",
                              hasCompletedRaces && index === 1 ? "bg-slate-400/10 hover:bg-slate-400/20" : "",
                              hasCompletedRaces && index === 2 ? "bg-orange-700/10 hover:bg-orange-700/20" : ""
                          )}
                      >
                          <td className="py-4 px-6 text-center font-mono font-bold text-slate-400 group-hover:text-white">
                              {hasCompletedRaces && index < 3 ? (
                                  <span className={cn(
                                      "inline-flex items-center justify-center w-8 h-8 rounded-full text-white shadow-lg",
                                      index === 0 ? "bg-yellow-500" :
                                      index === 1 ? "bg-slate-400" :
                                      "bg-orange-700"
                                  )}>
                                      {index + 1}
                                  </span>
                              ) : (
                                  <span>{index + 1}</span>
                              )}
                          </td>
                          <td className="py-4 px-6">
                              <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 rounded-lg bg-white/5 p-1 border border-white/10 flex items-center justify-center overflow-hidden">
                                      <img src={constructor.logoUrl || undefined} alt={constructor.name} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                                  </div>
                                  <div>
                                      <div className="font-bold text-white text-lg italic">{constructor.name}</div>
                                      <div className="w-full h-1 mt-1 rounded-full opacity-50" style={{ backgroundColor: constructor.color }}></div>
                                  </div>
                              </div>
                          </td>
                          <td className="py-4 px-6 text-right">
                              <div className="inline-block bg-slate-800 px-3 py-1 rounded-full border border-white/5 font-mono font-bold text-white min-w-[60px] text-center">
                                  {constructor.points}
                              </div>
                          </td>
                      </motion.tr>
                  ))}
              </tbody>
          </table>
          )}
      </div>
    </motion.div>
  );
}
