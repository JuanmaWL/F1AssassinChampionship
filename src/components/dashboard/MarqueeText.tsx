import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'motion/react';

export const MarqueeText = ({ text, className }: { text: string; className?: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [shouldScroll, setShouldScroll] = useState(false);
  const [scrollAmount, setScrollAmount] = useState(0);

  useEffect(() => {
    const checkWidth = () => {
      if (containerRef.current && textRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const textWidth = textRef.current.offsetWidth;
        if (textWidth > containerWidth) {
           setShouldScroll(true);
           setScrollAmount(textWidth - containerWidth + 0); // No extra padding needed if we mask or space
        } else {
           setShouldScroll(false);
        }
      }
    };
    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, [text]);

  return (
    <div ref={containerRef} className="w-full overflow-hidden relative isolate flex items-center h-full">
       {/* If should scroll, we fade out the right edge a bit */}
       {shouldScroll && (
         <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-slate-900 to-transparent z-10 pointer-events-none"></div>
       )}
       {/* We use a simple back and forth motion */}
      <motion.div
        ref={textRef}
        className={`whitespace-nowrap inline-block ${className}`}
        animate={shouldScroll ? { x: [0, -scrollAmount, -scrollAmount, 0, 0] } : { x: 0 }}
        transition={shouldScroll ? { duration: 6 + scrollAmount / 15, ease: "linear", repeat: Infinity } : {}}
        style={{ paddingRight: shouldScroll ? '0.5rem' : '0' }}
      >
        {text}
      </motion.div>
    </div>
  );
};
