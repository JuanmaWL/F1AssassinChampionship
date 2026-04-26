import { useEffect } from 'react';

// Use a module-level lock count so that multiple components can request a scroll lock
// without overriding each other's cleanup.
let lockCount = 0;

export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (active) {
      lockCount++;
      if (lockCount === 1) {
        document.body.style.overflow = 'hidden';
      }
      
      return () => {
        lockCount--;
        if (lockCount === 0) {
          document.body.style.overflow = 'unset';
        }
      };
    }
  }, [active]);
}
