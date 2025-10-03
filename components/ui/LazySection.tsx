'use client';

import React, { useState, useRef, useEffect } from 'react';

interface LazySectionProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  rootMargin?: string;
  threshold?: number;
  className?: string;
}

const LazySection: React.FC<LazySectionProps> = ({
  children,
  fallback = <div className="h-64 bg-gray-100 animate-pulse rounded-xl" />,
  rootMargin = '100px',
  threshold = 0.1,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasLoaded) {
          setIsVisible(true);
          setHasLoaded(true);
          // Délai pour éviter le flash
          setTimeout(() => {
            setIsVisible(true);
          }, 100);
        }
      },
      {
        rootMargin,
        threshold
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, [rootMargin, threshold, hasLoaded]);

  return (
    <div ref={sectionRef} className={className}>
      {isVisible ? children : fallback}
    </div>
  );
};

export default LazySection;