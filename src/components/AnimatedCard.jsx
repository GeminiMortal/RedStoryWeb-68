// @ts-ignore;
import React from 'react';

export function AnimatedCard({
  children,
  delay = 0
}) {
  return <div style={{
    opacity: 0,
    transform: 'translateY(20px)',
    transition: 'opacity 0.5s ease, transform 0.5s ease',
    transitionDelay: `${delay * 0.1}s`
  }} onAnimationEnd={e => {
    e.currentTarget.style.opacity = 1;
    e.currentTarget.style.transform = 'translateY(0)';
  }} className="transform transition-all duration-300 hover:scale-105">
      {children}
    </div>;
}