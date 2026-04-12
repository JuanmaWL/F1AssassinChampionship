import { useEffect } from 'react';
import { dataService } from '../services/dataService';

export function useVisitTracker() {
  useEffect(() => {
    const trackVisit = async () => {
      // 1. Check if it's a bot
      if (navigator.webdriver === true) {
        return;
      }

      // 2. Safe sessionStorage check
      try {
        if (sessionStorage.getItem('visit_tracked')) {
          return;
        }
      } catch (e) {
        // Ignore storage errors (e.g., blocked cookies/storage)
      }

      try {
        // 3. Fetch IP with 5-second timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch('https://api.ipify.org?format=json', {
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        
        const data = await response.json();
        const ip = data.ip;

        // Hash IP (SHA-256)
        const msgBuffer = new TextEncoder().encode(ip);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashedIp = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        // Get basic user agent info
        const userAgent = navigator.userAgent;
        let deviceType = 'desktop';
        if (/mobile/i.test(userAgent)) deviceType = 'mobile';
        if (/tablet/i.test(userAgent)) deviceType = 'tablet';

        // Save to Firebase
        await dataService.saveVisit({
          hashedIp,
          userAgent,
          deviceType,
          timestamp: Date.now()
        });

        // Safe sessionStorage set
        try {
          sessionStorage.setItem('visit_tracked', 'true');
        } catch (e) {
          // Ignore storage errors
        }
      } catch (error) {
        console.error('Error tracking visit:', error);
      }
    };

    trackVisit();
  }, []);
}
