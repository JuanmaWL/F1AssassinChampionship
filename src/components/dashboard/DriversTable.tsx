import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Timer, Users } from 'lucide-react';
import { motion } from 'motion/react';
import { Driver } from '../../types';
import { cn } from '../../lib/utils';

interface DriversTableProps {
  drivers: Driver[];
}

export function DriversTable({ drivers }: DriversTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(drivers.length / itemsPerPage);
  const paginatedDrivers = drivers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.4 }}
      className="bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
    >
      <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <h2 className="text-2xl font-black italic text-white uppercase tracking-tighter flex items-center gap-3">
          <span className="w-1 h-8 bg-red-600 rounded-full block"></span>
          Mundial de Pilotos
          </h2>
          <div className="flex gap-2">
              <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                  <ChevronLeft size={20} />
              </button>
              <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                  <ChevronRight size={20} />
              </button>
          </div>
      </div>
      
      <div className="overflow-x-auto">
          {drivers.length === 0 || drivers.every(d => d.points === 0) ? (
              <div className="py-20 flex flex-col items-center justify-center text-center px-6">
                  <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mb-6 border border-white/5">
                      <Users className="text-slate-500 w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-bold text-white italic uppercase tracking-wider mb-2">Parrilla en Preparación</h3>
                  <p className="text-slate-500 text-sm max-w-xs mx-auto font-mono uppercase tracking-widest">
                      Los pilotos están calentando motores. La clasificación se actualizará tras la primera carrera.
                  </p>
                  <div className="mt-8 flex gap-2">
                      {[1, 2, 3].map(i => (
                          <div key={i} className="w-2 h-2 rounded-full bg-red-500/20 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                      ))}
                  </div>
              </div>
          ) : (
              <table className="w-full text-left border-collapse">
              <thead>
                  <tr className="bg-slate-950/50 text-xs uppercase tracking-wider text-slate-500 font-medium">
                      <th className="py-4 px-6 w-16 text-center">POSICIÓN</th>
                      <th className="py-4 px-6">Piloto</th>
                      <th className="py-4 px-6 hidden md:table-cell">Equipo</th>
                      <th className="py-4 px-6 text-center" title="Vueltas Rápidas">Vueltas Rápidas</th>
                      <th className="py-4 px-6 text-right">Puntos</th>
                  </tr>
              </thead>
              <tbody>
                  {paginatedDrivers.map((driver, index) => {
                      const globalIndex = (currentPage - 1) * itemsPerPage + index;
                      return (
                          <motion.tr 
                              key={driver.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="border-b border-white/5 transition-all duration-300 group"
                              style={{
                                  // Inline style for subtle hover gradient based on team color
                                  // We use a CSS variable or direct style manipulation for the hover effect
                                  // Since Tailwind hover:bg-[color] is static, we use style for dynamic color
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = `linear-gradient(90deg, transparent, ${driver.teamColor}10, transparent)`;
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                              }}
                          >
                              <td className="py-4 px-6 text-center font-mono font-bold text-slate-400 group-hover:text-white">
                                  {globalIndex + 1}
                              </td>
                              <td className="py-4 px-6">
                                  <div className="flex items-center gap-4">
                                      <div className="w-1 h-8 rounded-full" style={{ backgroundColor: driver.teamColor }} />
                                      <div>
                                          <div className="font-bold text-white text-lg italic">{driver.name}</div>
                                          <div className="text-xs text-slate-500 md:hidden">{driver.team}</div>
                                      </div>
                                  </div>
                              </td>
                              <td className="py-4 px-6 hidden md:table-cell text-slate-400">
                                  {driver.team}
                              </td>
                              <td className="py-4 px-6 text-center">
                                  <div className="flex items-center justify-center gap-1 font-mono text-purple-400 font-bold">
                                    <Timer size={14} className="text-purple-500" />
                                    {driver.fastestLaps || 0}
                                  </div>
                              </td>
                              <td className="py-4 px-6 text-right">
                                  <div className="inline-block bg-slate-800 px-3 py-1 rounded-full border border-white/5 font-mono font-bold text-white min-w-[60px] text-center">
                                      {driver.points}
                                  </div>
                              </td>
                          </motion.tr>
                      );
                  })}
              </tbody>
          </table>
          )}
      </div>
      
      {/* Pagination Footer */}
      <div className="p-4 bg-slate-950/30 border-t border-white/5 flex justify-center">
          <div className="flex gap-1">
              {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={cn(
                          "w-2 h-2 rounded-full transition-all",
                          currentPage === i + 1 ? "bg-red-500 w-6" : "bg-slate-700 hover:bg-slate-500"
                      )}
                  />
              ))}
          </div>
      </div>
    </motion.div>
  );
}
