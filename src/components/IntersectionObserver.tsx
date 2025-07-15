import React, { useRef, useEffect, useState } from 'react';

interface IntersectionObserverProps {
  children: React.ReactNode;
  onIntersect?: () => void;
  threshold?: number;
  rootMargin?: string;
  enabled?: boolean;
}

export const IntersectionObserver: React.FC<IntersectionObserverProps> = ({
  children,
  onIntersect,
  threshold = 0.1,
  rootMargin = '50px',
  enabled = true,
}) => {
  const targetRef = useRef<HTMLDivElement>(null);
  const [hasIntersected, setHasIntersected] = useState(false);

  useEffect(() => {
    if (!enabled || hasIntersected) return;

    const element = targetRef.current;
    if (!element) return;

    const observer = new window.IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setHasIntersected(true);
          onIntersect?.();
          observer.disconnect();
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [enabled, hasIntersected, onIntersect, rootMargin, threshold]);

  return (
    <div ref={targetRef}>
      {children}
    </div>
  );
};
