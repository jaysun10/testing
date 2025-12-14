import { useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { trackPageView } from '../lib/analytics';

export const useAnalytics = () => {
  const [location] = useLocation();
  const prevLocationRef = useRef<string | null>(null);
  
  useEffect(() => {
    // Track initial page view and subsequent route changes
    if (prevLocationRef.current !== location) {
      trackPageView(location);
      prevLocationRef.current = location;
    }
  }, [location]);
};
