// @ts-ignore;
import React, { useEffect, useState } from 'react';
// @ts-ignore;
import { cn } from '@/lib/utils';

export function FadeIn({
  children,
  delay = 0,
  duration = 500,
  className
}) {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);
  if (!children) {
    return null;
  }
  return <div className={cn('transition-all', isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4', className)} style={{
    transitionDuration: `${duration}ms`
  }}>
      {children}
    </div>;
}
export function SlideIn({
  children,
  direction = 'left',
  delay = 0,
  duration = 300,
  className
}) {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);
  if (!children) {
    return null;
  }
  const directionClasses = {
    left: isVisible ? 'translate-x-0' : '-translate-x-full',
    right: isVisible ? 'translate-x-0' : 'translate-x-full',
    up: isVisible ? 'translate-y-0' : '-translate-y-full',
    down: isVisible ? 'translate-y-0' : 'translate-y-full'
  };
  return <div className={cn('transition-transform', directionClasses[direction] || directionClasses.left, className)} style={{
    transitionDuration: `${duration}ms`
  }}>
      {children}
    </div>;
}
export function ScaleIn({
  children,
  delay = 0,
  duration = 300,
  className
}) {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);
  if (!children) {
    return null;
  }
  return <div className={cn('transition-all', isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95', className)} style={{
    transitionDuration: `${duration}ms`
  }}>
      {children}
    </div>;
}