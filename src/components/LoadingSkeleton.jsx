// @ts-ignore;
import React from 'react';

export function LoadingSkeleton({
  type = 'card',
  count = 3
}) {
  if (type === 'card') {
    return <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 responsive-gap">
        {Array.from({
        length: count
      }).map((_, i) => <div key={i} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 animate-pulse mobile-card">
            <div className="aspect-video bg-slate-700 rounded-xl mb-4 skeleton-loading"></div>
            <div className="h-6 bg-slate-700 rounded w-3/4 mb-3 skeleton-loading"></div>
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
    return <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden animate-pulse mobile-card">
        <div className="aspect-video bg-slate-700 skeleton-loading"></div>
        <div className="p-6">
          <div className="h-8 bg-slate-700 rounded w-3/4 mb-4 skeleton-loading"></div>
          <div className="flex gap-4 mb-4 flex-wrap">
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
      }).map((_, i) => <div key={i} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 animate-pulse">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-slate-700 rounded-xl skeleton-loading"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-700 rounded w-3/4 skeleton-loading"></div>
                <div className="h-3 bg-slate-700 rounded w-1/2 skeleton-loading"></div>
              </div>
            </div>
          </div>)}
      </div>;
  }
  if (type === 'form') {
    return <div className="space-y-6">
        {Array.from({
        length: count
      }).map((_, i) => <div key={i} className="space-y-2">
            <div className="h-4 bg-slate-700 rounded w-1/4 skeleton-loading"></div>
            <div className="h-12 bg-slate-700 rounded-xl skeleton-loading"></div>
          </div>)}
      </div>;
  }

  // 默认加载状态
  return <div className="flex justify-center items-center h-64">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 loading-spin"></div>
        <p className="text-slate-400 text-sm animate-pulse">加载中...</p>
      </div>
    </div>;
}

// 页面级加载骨架屏
export function PageLoadingSkeleton({
  title = "加载中",
  description = "正在获取数据，请稍候..."
}) {
  return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-6 animate-fade-in">
        <div className="w-16 h-16 border-4 border-red-600/30 border-t-red-600 rounded-full animate-spin loading-spin mx-auto mb-6"></div>
        <h2 className="text-2xl font-bold text-white mb-2 animate-pulse">{title}</h2>
        <p className="text-slate-400 animate-pulse">{description}</p>
        
        {/* 加载进度指示器 */}
        <div className="mt-6 w-full bg-slate-700 rounded-full h-2 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full loading-spin" style={{
          width: '60%'
        }}></div>
        </div>
      </div>
    </div>;
}

// 内容区域加载骨架屏
export function ContentLoadingSkeleton({
  height = "200px"
}) {
  return <div className="animate-pulse">
      <div className="bg-slate-700 rounded-xl" style={{
      height
    }}></div>
    </div>;
}