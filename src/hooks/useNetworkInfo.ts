import { useState, useEffect } from 'react';

interface NetworkConnection extends EventTarget {
  downlink: number;
  effectiveType: string;
  rtt: number;
  saveData: boolean;
}

interface NetworkInfo {
  downlink: number;
  effectiveType: string;
  rtt: number;
  saveData: boolean;
  isOnline: boolean;
  quality: 'fast' | 'slow' | 'offline';
}

declare global {
  interface Navigator {
    connection?: NetworkConnection;
    mozConnection?: NetworkConnection;
    webkitConnection?: NetworkConnection;
  }
}

export const useNetworkInfo = () => {
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo>({
    downlink: 0,
    effectiveType: '4g',
    rtt: 0,
    saveData: false,
    isOnline: navigator.onLine,
    quality: 'fast',
  });

  useEffect(() => {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

    const updateNetworkInfo = () => {
      const isOnline = navigator.onLine;
      
      if (!isOnline) {
        setNetworkInfo(prev => ({
          ...prev,
          isOnline: false,
          quality: 'offline',
        }));
        return;
      }

      if (connection) {
        const quality = getConnectionQuality(connection.effectiveType, connection.downlink);
        
        setNetworkInfo({
          downlink: connection.downlink,
          effectiveType: connection.effectiveType,
          rtt: connection.rtt,
          saveData: connection.saveData,
          isOnline,
          quality,
        });
      } else {
        // Fallback when Network Information API is not available
        setNetworkInfo(prev => ({
          ...prev,
          isOnline,
          quality: 'fast', // Assume fast connection as fallback
        }));
      }
    };

    const getConnectionQuality = (effectiveType: string, downlink: number): 'fast' | 'slow' | 'offline' => {
      if (effectiveType === 'slow-2g' || effectiveType === '2g') {
        return 'slow';
      }
      if (effectiveType === '3g' && downlink < 1.5) {
        return 'slow';
      }
      return 'fast';
    };

    // Initial check
    updateNetworkInfo();

    // Listen for online/offline events
    window.addEventListener('online', updateNetworkInfo);
    window.addEventListener('offline', updateNetworkInfo);

    // Listen for connection changes if supported
    if (connection) {
      connection.addEventListener('change', updateNetworkInfo);
    }

    return () => {
      window.removeEventListener('online', updateNetworkInfo);
      window.removeEventListener('offline', updateNetworkInfo);
      if (connection) {
        connection.removeEventListener('change', updateNetworkInfo);
      }
    };
  }, []);

  return networkInfo;
};

export const getOptimalImageQuality = (quality: string): { width: number; height: number; format: string } => {
  switch (quality) {
    case 'slow':
      return { width: 400, height: 200, format: 'webp' };
    case 'offline':
      return { width: 200, height: 100, format: 'webp' };
    default:
      return { width: 800, height: 400, format: 'webp' };
  }
};