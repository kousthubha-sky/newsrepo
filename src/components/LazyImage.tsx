import React from 'react';
import { useLazyImageLoader } from '../hooks/useIntersectionObserver';
import { useNetworkInfo, getOptimalImageQuality } from '../hooks/useNetworkInfo';
import { cn } from '../lib/utils';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className,
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzllYTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkxvYWRpbmcuLi48L3RleHQ+PC9zdmc+'
}) => {
  const networkInfo = useNetworkInfo();
  const optimalQuality = getOptimalImageQuality(networkInfo.quality);
  
  // Modify the image URL based on network quality
  const optimizedSrc = src.includes('unsplash.com') 
    ? `${src}&w=${optimalQuality.width}&h=${optimalQuality.height}&fm=${optimalQuality.format}&q=80`
    : src;

  const { targetRef, imageSrc, isLoaded, isError, isIntersecting } = useLazyImageLoader(
    optimizedSrc,
    placeholder
  );

  return (
    <div 
      ref={targetRef}
      className={cn(
        "relative overflow-hidden bg-muted",
        className
      )}
    >
      {!isLoaded && !isError && (
        <div className="absolute inset-0 shimmer" />
      )}
      
      {isError ? (
        <div className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground">
          <div className="text-center">
            <div className="text-2xl mb-2">📷</div>
            <div className="text-sm">Failed to load image</div>
          </div>
        </div>
      ) : (
        <img
          src={imageSrc}
          alt={alt}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-300",
            isLoaded ? "opacity-100" : "opacity-0"
          )}
          loading="lazy"
        />
      )}
      
      {/* Network quality indicator */}
      {isIntersecting && (
        <div className="absolute top-2 right-2">
          <div className={cn(
            "network-indicator",
            networkInfo.quality === 'fast' && "network-fast",
            networkInfo.quality === 'slow' && "network-slow",
            networkInfo.quality === 'offline' && "network-offline"
          )}>
            <div className={cn(
              "w-2 h-2 rounded-full",
              networkInfo.quality === 'fast' && "bg-green-500",
              networkInfo.quality === 'slow' && "bg-orange-500",
              networkInfo.quality === 'offline' && "bg-gray-500"
            )} />
            <span className="text-xs font-medium">
              {networkInfo.quality === 'fast' && 'HD'}
              {networkInfo.quality === 'slow' && 'SD'}
              {networkInfo.quality === 'offline' && 'OFF'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};