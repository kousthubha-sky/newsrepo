import React, { useRef, useEffect, useState, useCallback } from 'react';

interface CanvasImageProps {
  src: string;
  alt: string;
  className?: string;
  effects?: {
    grayscale?: boolean;
    blur?: number;
    brightness?: number;
  };
}

export const CanvasImage: React.FC<CanvasImageProps> = ({
  src,
  alt,
  className,
  effects = {},
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const drawImage = useCallback((image: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // Get container dimensions for proper scaling
    const container = containerRef.current;
    if (!container) return;
    
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    // Calculate scaled dimensions maintaining aspect ratio
    let targetWidth = containerWidth;
    let targetHeight = containerHeight;
    const imageAspect = image.width / image.height;
    const containerAspect = containerWidth / containerHeight;

    if (imageAspect > containerAspect) {
      // Image is wider than container proportionally
      targetHeight = containerWidth / imageAspect;
    } else {
      // Image is taller than container proportionally
      targetWidth = containerHeight * imageAspect;
    }

    // Set canvas size with device pixel ratio for sharp display
    const ratio = window.devicePixelRatio || 1;
    canvas.width = targetWidth * ratio;
    canvas.height = targetHeight * ratio;
    canvas.style.width = `${targetWidth}px`;
    canvas.style.height = `${targetHeight}px`;

    // Scale context for retina displays
    ctx.scale(ratio, ratio);

    // Clear previous content
    ctx.clearRect(0, 0, targetWidth, targetHeight);

    try {
      // Apply effects
      let filterString = '';
      if (effects.grayscale) filterString += 'grayscale(1) ';
      if (effects.blur) filterString += `blur(${effects.blur}px) `;
      if (effects.brightness) filterString += `brightness(${effects.brightness}) `;
      ctx.filter = filterString.trim() || 'none';

      // Calculate centered position
      const x = (canvas.width - targetWidth * ratio) / 2 / ratio;
      const y = (canvas.height - targetHeight * ratio) / 2 / ratio;

      // Draw image
      ctx.drawImage(image, x, y, targetWidth, targetHeight);

      // Reset filter
      ctx.filter = 'none';
      setIsLoaded(true);
      setError(null);
    } catch (err) {
      console.error('Error drawing image:', err);
      setError('Failed to draw image');
    }
  }, [effects]);

  const setupIntersectionObserver = useCallback(() => {
    if (!containerRef.current || observerRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !isLoaded && !imageRef.current) {
          // Load image when container becomes visible
          const img = new Image();
          img.crossOrigin = 'anonymous';
          imageRef.current = img;

          img.onload = () => {
            drawImage(img);
          };

          img.onerror = (error) => {
            console.error('Error loading image:', error);
            setError('Failed to load image');
            setIsLoaded(false);
          };

          img.src = src;
        }
      },
      {
        root: null,
        rootMargin: '50px',
        threshold: 0.1,
      }
    );

    observerRef.current.observe(containerRef.current);
  }, [src, drawImage, isLoaded]);

  useEffect(() => {
    setupIntersectionObserver();

    return () => {
      // Cleanup
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      if (imageRef.current) {
        imageRef.current.onload = null;
        imageRef.current.onerror = null;
        imageRef.current = null;
      }
    };
  }, [setupIntersectionObserver]);

  // Redraw when effects change
  useEffect(() => {
    if (imageRef.current && isLoaded) {
      drawImage(imageRef.current);
    }
  }, [effects, drawImage, isLoaded]);

  return (
    <div 
      ref={containerRef}
      className={`relative ${className}`}
      style={{ width: '100%', height: '100%' }}
    >
      <canvas
        ref={canvasRef}
        aria-label={alt}
        className={`absolute inset-0 transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
      {!isLoaded && !error && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50 text-red-500">
          <span className="text-sm">{error}</span>
        </div>
      )}
    </div>
  );
};
