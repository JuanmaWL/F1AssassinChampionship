import { motion } from 'motion/react';
import { useChampionship } from '../../context/ChampionshipContext';
import { cn } from '../../lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}

export function LoadingSpinner({ size = 'md', label, className }: LoadingSpinnerProps) {
  const { isHistorical } = useChampionship();
  
  const sizes = {
    sm: { circle: 30, stroke: 3, glow: 6 },
    md: { circle: 50, stroke: 4, glow: 10 },
    lg: { circle: 80, stroke: 6, glow: 15 },
  };

  const currentSize = sizes[size];
  const color = isHistorical ? '#f59e0b' : '#ef4444';
  
  // Create a buffer for the glow effect to prevent clipping
  const buffer = currentSize.glow * 2;
  const viewSize = currentSize.circle + buffer;
  const center = viewSize / 2;
  const radius = (currentSize.circle - currentSize.stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className={cn("flex flex-col items-center justify-center gap-4", className)}>
      <div className="relative" style={{ width: viewSize, height: viewSize }}>
        <motion.svg
          width={viewSize}
          height={viewSize}
          viewBox={`0 0 ${viewSize} ${viewSize}`}
          className="overflow-visible"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
        >
          {/* Subtle background track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={currentSize.stroke}
            className="text-white/5"
          />
          
          {/* Primary animated stroke with improved glow */}
          <motion.circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={currentSize.stroke}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference * 0.25 }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity, 
              repeatType: "reverse", 
              ease: "easeInOut" 
            }}
            strokeLinecap="round"
            className={isHistorical ? "text-amber-500" : "text-red-500"}
            style={{ 
              filter: `drop-shadow(0 0 ${currentSize.glow / 2}px ${color}) drop-shadow(0 0 ${currentSize.glow}px ${color}88)`
            }}
          />
        </motion.svg>
        
        {/* Central pulse dot for extra technological feel */}
        <div 
          className={cn(
            "absolute inset-0 m-auto rounded-full blur-[2px] animate-pulse",
            isHistorical ? "bg-amber-500/20" : "bg-red-500/20"
          )}
          style={{ width: currentSize.circle / 4, height: currentSize.circle / 4 }}
        />
      </div>
      {label && (
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">
          {label}
        </p>
      )}
    </div>
  );
}
