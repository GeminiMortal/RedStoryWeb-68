// @ts-ignore;
import React from 'react';

export function LoadingSkeleton({
  type = 'card',
  count = 3
}) {
  if (type === 'card') {
    return <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({
        length: count
      }).map((_, i) => <div key={i} className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 animate-pulse border border-slate-700/50 shadow-soft">
            <div className="aspect-video bg-slate-700 rounded-lg mb-4 skeleton-loading"></div>
            <div className="h-6 bg-slate-700 rounded w-3/4 mb-2 skeleton-loading"></div>
            <div className="h-4 bg-slate-700 rounded w-full mb-2 skeleton-loading"></div>
            <div className="h-4 bg-slate-700 rounded w-5/6 mb-4 skeleton-loading"></div>
            <div className="flex gap-2">
              <div className="h-8 bg-slate-700 rounded w-16 skeleton-loading"></div>
              <div className="h-8 bg-slate-700 rounded w-16 skeleton-loading"></div>
            </div>
          </div>)}
      </div>;
  }
  if (type === 'detail') {
    return <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl overflow-hidden animate-pulse border border-slate-700/50 shadow-soft">
        <div className="aspect-video bg-slate-700 skeleton-loading"></div>
        <div className="p-6">
          <div className="h-8 bg-slate-700 rounded w-3/4 mb-4 skeleton-loading"></div>
          <div className="flex gap-4 mb-4">
            <div className="h-4 bg-slate-700 rounded w-24 skeleton-loading"></div>
            <div className="h-4 bg-slate-700 rounded w-32 skeleton-loading"></div>
            <div className="h-4 bg-slate-700 rounded w-20 skeleton-loading"></div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-slate-700 rounded w-full skeleton-loading"></div>
            <div className="h-4 bg-slate-700 rounded w-full skeleton-loading"></div>
            <div className="h-4 bg-slate-700 rounded w-5/6 skeleton-loading"></div>
          </div>
        </div>
      </div>;
  }
  if (type === 'list') {
    return <div className="space-y-4">
        {Array.from({
        length: count
      }).map((_, i) => <div key={i} className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 animate-pulse border border-slate-700/50 shadow-soft">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-slate-700 rounded-lg skeleton-loading"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-700 rounded w-3/4 skeleton-loading"></div>
                <div className="h-3 bg-slate-700 rounded w-1/2 skeleton-loading"></div>
              </div>
            </div>
          </div>)}
      </div>;
  }
  return <div className="flex justify-center items-center h-64">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        <p className="text-slate-400 text-sm">加载中<span className="loading-dots"></span></p>
      </div>
    </div>;
}