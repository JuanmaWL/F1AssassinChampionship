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
        
        const getBrowserInfo = (ua: string) => {
          let os = 'Unknown';
          if (/win/i.test(ua)) os = 'Windows';
          else if (/mac/i.test(ua)) os = 'macOS';
          else if (/linux/i.test(ua)) os = 'Linux';
          else if (/android/i.test(ua)) os = 'Android';
          else if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS';

          let browser = 'Unknown';
          if (/edg/i.test(ua)) browser = 'Edge';
          else if (/chrome/i.test(ua)) browser = 'Chrome';
          else if (/firefox/i.test(ua)) browser = 'Firefox';
          else if (/safari/i.test(ua)) browser = 'Safari';
          
          return { os, browser };
        };

        const { os, browser } = getBrowserInfo(userAgent);
        const language = navigator.language;
        const screenResolution = `${window.screen.width}x${window.screen.height}`;
        const referrer = document.referrer || 'Directo';
        const pathname = window.location.pathname;
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const touchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        const memory = (navigator as any).deviceMemory;
        const cores = navigator.hardwareConcurrency;
        
        let deviceType = 'desktop';
        if (/mobile/i.test(userAgent)) deviceType = 'mobile';
        if (/tablet/i.test(userAgent)) deviceType = 'tablet';

        // Save to Firebase
        await dataService.saveVisit({
          hashedIp,
          os,
          browser,
          language,
          screenResolution,
          deviceType,
          referrer,
          pathname,
          timezone,
          touchSupport,
          memory,
          cores,
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
