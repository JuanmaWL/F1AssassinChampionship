import { useMemo } from 'react';
import { motion } from 'motion/react';
import { Trophy } from 'lucide-react';
import { Constructor } from '../../types';
import { cn } from '../../lib/utils';

interface ConstructorsTableProps {
  constructors: Constructor[];
  hasCompletedRaces: boolean;
}

export function ConstructorsTable({ constructors, hasCompletedRaces }: ConstructorsTableProps) {
  const sortedConstructors = useMemo(() => {
    return hasCompletedRaces
      ? constructors
      : [...constructors].sort((a, b) => a.name.localeCompare(b.name));
  }, [constructors, hasCompletedRaces]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.4 }}
      className="bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
    >
      <div className="p-6 border-b border-white/10 bg-gradient-to-r from-blue-900/20 to-transparent">
          <div className="flex items-center gap-4">
            <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-[0_0_20px_rgba(59,130,246,0.3)] border border-blue-400/50">
              <img src="/icons/escudo.svg" alt="Mundial de Constructores" className="w-7 h-7 drop-shadow-md" />
            </div>
            <div>
              <h2 className="text-3xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 uppercase tracking-tighter pr-2">
                Mundial de Constructores
              </h2>
            </div>
          </div>
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
                                  <div className="relative flex items-center justify-center w-10 h-10 mx-auto">
                                      {index === 0 && (
                                          <>
                                              <div className="absolute inset-0 bg-yellow-500/30 rounded-full blur-md animate-pulse" />
                                              <div className="absolute -inset-2 bg-gradient-to-tr from-yellow-600/0 via-yellow-400/40 to-yellow-200/0 rounded-full animate-[spin_3s_linear_infinite]" />
                                          </>
                                      )}
                                      {index === 1 && (
                                          <>
                                              <div className="absolute inset-0 bg-slate-300/30 rounded-full blur-md animate-pulse" style={{ animationDelay: '0.5s' }} />
                                              <div className="absolute -inset-1 bg-gradient-to-tr from-slate-500/0 via-slate-300/40 to-slate-100/0 rounded-full animate-[spin_4s_linear_infinite_reverse]" />
                                          </>
                                      )}
                                      {index === 2 && (
                                          <>
                                              <div className="absolute inset-0 bg-orange-700/30 rounded-full blur-md animate-pulse" style={{ animationDelay: '1s' }} />
                                          </>
                                      )}
                                      <span className={cn(
                                          "relative z-10 flex items-center justify-center w-8 h-8 rounded-full text-white font-black shadow-lg border border-white/20",
                                          index === 0 ? "bg-gradient-to-br from-yellow-400 to-yellow-600 text-yellow-950 shadow-[0_0_15px_rgba(234,179,8,0.5)]" :
                                          index === 1 ? "bg-gradient-to-br from-slate-300 to-slate-500 text-slate-900 shadow-[0_0_15px_rgba(148,163,184,0.5)]" :
                                          "bg-gradient-to-br from-orange-500 to-orange-800 text-orange-50 shadow-[0_0_15px_rgba(194,65,12,0.5)]"
                                      )}>
                                          {index + 1}
                                      </span>
                                  </div>
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
