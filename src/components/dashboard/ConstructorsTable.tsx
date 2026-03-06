import React from 'react';
import { motion } from 'motion/react';
import { Constructor } from '../../types';

interface ConstructorsTableProps {
  constructors: Constructor[];
}

export function ConstructorsTable({ constructors }: ConstructorsTableProps) {
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
          <table className="w-full text-left border-collapse">
              <thead>
                  <tr className="bg-slate-950/50 text-xs uppercase tracking-wider text-slate-500 font-medium">
                      <th className="py-4 px-6 w-16 text-center">Pos</th>
                      <th className="py-4 px-6">Equipo</th>
                      <th className="py-4 px-6 text-right">Puntos</th>
                  </tr>
              </thead>
              <tbody>
                  {constructors.map((constructor, index) => (
                      <motion.tr 
                          key={constructor.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="border-b border-white/5 transition-all duration-300 group"
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = `linear-gradient(90deg, transparent, ${constructor.color}10, transparent)`;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                          }}
                      >
                          <td className="py-4 px-6 text-center font-mono font-bold text-slate-400 group-hover:text-white">
                              {index + 1}
                          </td>
                          <td className="py-4 px-6">
                              <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 rounded-lg bg-white/5 p-1 border border-white/10 flex items-center justify-center overflow-hidden">
                                      <img src={constructor.logoUrl} alt={constructor.name} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
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
      </div>
    </motion.div>
  );
}
