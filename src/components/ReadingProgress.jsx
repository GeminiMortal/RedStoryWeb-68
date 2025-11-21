// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { cn } from '@/lib/utils';

export function ReadingProgress({
  progress = 0
}) {
  const safeProgress = Math.max(0, Math.min(100, Number(progress) || 0));
  return <div className="fixed top-0 left-0 right-0 h-1 bg-slate-800 z-50">
      <div className="h-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-300" style={{
      width: `${safeProgress}%`
    }} />
    </div>;
}