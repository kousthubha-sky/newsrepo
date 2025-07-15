import React from 'react';
import { Wifi, WifiOff, Signal } from 'lucide-react';
import { useNetworkInfo } from '../hooks/useNetworkInfo';
import { cn } from '../lib/utils';

export const NetworkStatus: React.FC = () => {
  const networkInfo = useNetworkInfo();

  const getNetworkIcon = () => {
    if (!networkInfo.isOnline) {
      return <WifiOff className="w-4 h-4" />;
    }
    
    switch (networkInfo.quality) {
      case 'fast':
        return <Wifi className="w-4 h-4" />;
      case 'slow':
        return <Signal className="w-4 h-4" />;
      default:
        return <WifiOff className="w-4 h-4" />;
    }
  };

  const getNetworkLabel = () => {
    if (!networkInfo.isOnline) return 'Offline';
    
    switch (networkInfo.quality) {
      case 'fast':
        return `Fast Network`;
      case 'slow':
        return `Slow Network`;
      default:
        return 'Unknown';
    }
  };

  const getNetworkDescription = () => {
    if (!networkInfo.isOnline) return 'No internet connection';
    
    switch (networkInfo.quality) {
      case 'fast':
        return 'High quality images enabled';
      case 'slow':
        return 'Optimized for slow connection';
      default:
        return 'Connection status unknown';
    }
  };

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-lg text-sm">
      <div className={cn(
        "flex items-center gap-2",
        networkInfo.quality === 'fast' && "text-network-fast",
        networkInfo.quality === 'slow' && "text-network-slow",
        !networkInfo.isOnline && "text-network-offline"
      )}>
        {getNetworkIcon()}
        <div>
          <div className="font-medium">{getNetworkLabel()}</div>
          <div className="text-xs text-muted-foreground">
            {getNetworkDescription()}
          </div>
        </div>
      </div>
      
      {networkInfo.saveData && (
        <div className="ml-auto text-xs bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400 px-2 py-1 rounded">
          Data Saver
        </div>
      )}
    </div>
  );
};