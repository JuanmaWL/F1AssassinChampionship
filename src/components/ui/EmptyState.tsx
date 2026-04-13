import { ReactNode } from 'react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { useChampionship } from '../../context/ChampionshipContext';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  className?: string;
}

export function EmptyState({ icon, title, description, className }: EmptyStateProps) {
  const { isHistorical } = useChampionship();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-12 flex flex-col items-center justify-center text-center min-h-[65vh] flex-grow",
        className
      )}
    >
      <div className={cn(
        "w-20 h-20 rounded-full flex items-center justify-center mb-6 border",
        isHistorical ? "bg-amber-950/30 border-amber-500/20 text-amber-500" : "bg-slate-800/50 border-white/5 text-slate-500"
      )}>
        {icon}
      </div>
      <h3 className="text-2xl font-black italic text-white uppercase tracking-tighter mb-3">
        {title}
      </h3>
      <p className="text-slate-400 text-sm max-w-md mx-auto font-mono uppercase tracking-widest leading-relaxed">
        {description}
      </p>
      <div className="mt-8 flex gap-3">
          {[1, 2, 3].map(i => (
              <div 
                key={i} 
                className={cn(
                  "w-2 h-2 rounded-full animate-pulse",
                  isHistorical ? "bg-amber-700/50" : "bg-slate-700"
                )} 
                style={{ animationDelay: `${i * 0.2}s` }} 
              />
          ))}
      </div>
    </motion.div>
  );
}
