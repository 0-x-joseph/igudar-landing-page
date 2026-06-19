"use client";
import { useEffect, useRef, useState, ReactNode } from 'react';

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  direction?: 'up' | 'left' | 'right';
  delay?: number;
}

const AnimatedSection = ({
  children,
  className = '',
  direction = 'up',
  delay = 0,
}: AnimatedSectionProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [delay]);

  const directionClass =
    direction === 'left'
      ? 'slide-left'
      : direction === 'right'
        ? 'slide-right'
        : '';

  return (
    <div
      ref={ref}
      className={`animate-on-scroll ${directionClass} ${isVisible ? 'visible' : ''} ${className}`}
    >
      {children}
    </div>
  );
};

export default AnimatedSection;
