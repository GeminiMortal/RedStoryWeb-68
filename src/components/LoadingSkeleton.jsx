// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { cn } from '@/lib/utils';

export function LoadingSkeleton({
  type = 'card',
  count = 3,
  className
}) {
  const renderCardSkeleton = () => <div className={cn("bg-slate-800/50 rounded-2xl overflow-hidden", className)}>
      <div className="aspect-video bg-slate-700 animate-pulse" />
      <div className="p-5 space-y-3">
        <div className="h-4 bg-slate-700 rounded animate-pulse" />
        <div className="h-3 bg-slate-700 rounded animate-pulse w-3/4" />
        <div className="h-3 bg-slate-700 rounded animate-pulse w-1/2" />
        <div className="flex space-x-2">
          <div className="h-6 bg-slate-700 rounded-full animate-pulse w-16" />
          <div className="h-6 bg-slate-700 rounded-full animate-pulse w-20" />
        </div>
      </div>
    </div>;
  const renderListSkeleton = () => <div className={cn("space-y-4", className)}>
      {[...Array(count)].map((_, i) => <div key={i} className="bg-slate-800/50 rounded-lg p-4 space-y-3">
          <div className="h-4 bg-slate-700 rounded animate-pulse w-3/4" />
          <div className="h-3 bg-slate-700 rounded animate-pulse" />
          <div className="h-3 bg-slate-700 rounded animate-pulse w-5/6" />
        </div>)}
    </div>;
  const renderTextSkeleton = () => <div className={cn("space-y-3", className)}>
      {[...Array(count)].map((_, i) => <div key={i} className="h-3 bg-slate-700 rounded animate-pulse" style={{
      width: `${Math.random() * 40 + 60}%`
    }} />)}
    </div>;
  const skeletons = {
    card: renderCardSkeleton,
    list: renderListSkeleton,
    text: renderTextSkeleton
  };
  const SkeletonComponent = skeletons[type] || renderCardSkeleton;
  if (count <= 1) {
    return <SkeletonComponent />;
  }
  return <div className={cn("grid gap-6", {
    "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4": type === 'card',
    "grid-cols-1": type !== 'card'
  })}>
      {[...Array(Math.max(1, count))].map((_, i) => <SkeletonComponent key={i} />)}
    </div>;
}