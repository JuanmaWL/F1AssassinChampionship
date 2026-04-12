import { CircuitData } from '../data/circuits';
import { cn } from '../lib/utils';

export const CircuitTrack = ({ circuitInfo, className }: { circuitInfo: CircuitData | null, className?: string }) => {
  if (!circuitInfo) {
    return null;
  }

  const hasPath = (circuitInfo.svgPath && circuitInfo.svgPath.trim().length > 0) || 
                  (circuitInfo.svgPath2 && circuitInfo.svgPath2.length > 0 && circuitInfo.svgPath2.some(p => p.trim().length > 0));

  if (!hasPath) {
    console.warn(`CircuitTrack: No valid SVG paths for ${circuitInfo.id}`);
    return null;
  }

  // Determine stroke width based on viewBox size to maintain consistent thickness
  const viewBoxWidth = circuitInfo.viewBox ? parseInt(circuitInfo.viewBox.split(' ')[2]) : 200;
  const strokeWidth = viewBoxWidth > 300 ? "14" : "7";

  return (
    <svg 
      viewBox={circuitInfo.viewBox || "0 0 200 160"} 
      className={cn("overflow-visible", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      data-circuit-id={circuitInfo.id}
    >
      {circuitInfo.svgPath2 && circuitInfo.svgPath2.length > 0 ? (
        circuitInfo.svgPath2.map((d, i) => (
          d && d.trim().length > 0 ? <path key={i} d={d} opacity={i === 0 ? 1 : 0.6} /> : null
        ))
      ) : (
        circuitInfo.svgPath ? <path d={circuitInfo.svgPath} /> : null
      )}
    </svg>
  );
};
