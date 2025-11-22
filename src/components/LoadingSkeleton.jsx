// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { cn } from '@/lib/utils';

export function LoadingSkeleton({
  type = 'card',
  count = 1,
  className
}) {
  const renderCardSkeleton = () => <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden shadow-soft animate-pulse">
      {/* 图片骨架 */}
      <div className="aspect-video bg-slate-700/50"></div>
      
      {/* 内容骨架 */}
      <div className="p-6 space-y-4">
        {/* 标题骨架 */}
        <div className="space-y-2">
          <div className="h-6 bg-slate-700/50 rounded-lg"></div>
          <div className="h-6 bg-slate-700/50 rounded-lg w-3/4"></div>
        </div>
        
        {/* 内容骨架 */}
        <div className="space-y-2">
          <div className="h-4 bg-slate-700/50 rounded"></div>
          <div className="h-4 bg-slate-700/50 rounded"></div>
          <div className="h-4 bg-slate-700/50 rounded w-2/3"></div>
        </div>
        
        {/* 标签骨架 */}
        <div className="flex gap-2">
          <div className="h-6 bg-slate-700/50 rounded-full w-16"></div>
          <div className="h-6 bg-slate-700/50 rounded-full w-20"></div>
          <div className="h-6 bg-slate-700/50 rounded-full w-14"></div>
        </div>
        
        {/* 元信息骨架 */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex gap-3">
            <div className="h-5 bg-slate-700/50 rounded-full w-20"></div>
            <div className="h-5 bg-slate-700/50 rounded-full w-24"></div>
          </div>
          <div className="h-5 bg-slate-700/50 rounded-full w-16"></div>
        </div>
      </div>
    </div>;
  const renderListSkeleton = () => <div className="space-y-4">
      {Array.from({
      length: count
    }).map((_, index) => <div key={index} className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 animate-pulse">
          <div className="flex items-center space-x-4">
            {/* 缩略图骨架 */}
            <div className="w-16 h-16 bg-slate-700/50 rounded-lg flex-shrink-0"></div>
            
            {/* 内容骨架 */}
            <div className="flex-1 space-y-2">
              <div className="h-5 bg-slate-700/50 rounded w-3/4"></div>
              <div className="h-4 bg-slate-700/50 rounded w-full"></div>
              <div className="h-4 bg-slate-700/50 rounded w-1/2"></div>
            </div>
            
            {/* 操作按钮骨架 */}
            <div className="flex space-x-2">
              <div className="w-8 h-8 bg-slate-700/50 rounded"></div>
              <div className="w-8 h-8 bg-slate-700/50 rounded"></div>
            </div>
          </div>
        </div>)}
    </div>;
  const renderDetailSkeleton = () => <div className="space-y-6 animate-pulse">
      {/* 头部骨架 */}
      <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8">
        <div className="text-center space-y-4">
          <div className="h-10 bg-slate-700/50 rounded w-3/4 mx-auto"></div>
          <div className="flex justify-center space-x-4">
            <div className="h-6 bg-slate-700/50 rounded w-20"></div>
            <div className="h-6 bg-slate-700/50 rounded w-24"></div>
            <div className="h-6 bg-slate-700/50 rounded w-16"></div>
            <div className="h-6 bg-slate-700/50 rounded w-20"></div>
          </div>
        </div>
      </div>
      
      {/* 封面图骨架 */}
      <div className="aspect-video bg-slate-700/50 rounded-2xl"></div>
      
      {/* 内容骨架 */}
      <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8">
        <div className="space-y-4">
          <div className="h-4 bg-slate-700/50 rounded"></div>
          <div className="h-4 bg-slate-700/50 rounded w-5/6"></div>
          <div className="h-4 bg-slate-700/50 rounded w-4/6"></div>
          <div className="h-4 bg-slate-700/50 rounded w-3/4"></div>
          <div className="h-4 bg-slate-700/50 rounded w-5/6"></div>
        </div>
      </div>
    </div>;
  const renderFormSkeleton = () => <div className="space-y-6 animate-pulse">
      {Array.from({
      length: count
    }).map((_, index) => <div key={index} className="space-y-2">
          <div className="h-4 bg-slate-700/50 rounded w-1/4"></div>
          <div className="h-12 bg-slate-700/50 rounded-xl"></div>
        </div>)}
    </div>;
  const renderSkeleton = () => {
    switch (type) {
      case 'list':
        return renderListSkeleton();
      case 'detail':
        return renderDetailSkeleton();
      case 'form':
        return renderFormSkeleton();
      case 'card':
      default:
        return renderCardSkeleton();
    }
  };
  if (count === 1) {
    return <div className={cn("animate-fade-in", className)}>
        {renderSkeleton()}
      </div>;
  }
  return <div className={cn("grid gap-6 animate-fade-in", type === 'card' ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1", className)}>
      {Array.from({
      length: count
    }).map((_, index) => <div key={index} className="animate-fade-in" style={{
      animationDelay: `${index * 100}ms`
    }}>
          {renderSkeleton()}
        </div>)}
    </div>;
}

// 页面级加载骨架
export function PageLoadingSkeleton({
  title = "加载中...",
  showNavigation = true,
  className
}) {
  return <div className={cn("min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white", className)}>
      {/* 导航骨架 */}
      {showNavigation && <div className="bg-slate-800/90 backdrop-blur-sm border-b border-slate-700 animate-pulse">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <div className="h-8 bg-slate-700/50 rounded w-32"></div>
              <div className="flex space-x-4">
                <div className="h-10 bg-slate-700/50 rounded w-24"></div>
                <div className="h-10 bg-slate-700/50 rounded w-32"></div>
              </div>
            </div>
          </div>
        </div>}
      
      {/* 内容骨架 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <div className="h-12 bg-slate-700/50 rounded w-64 mx-auto mb-4"></div>
          <div className="h-6 bg-slate-700/50 rounded w-96 mx-auto"></div>
        </div>
        
        <LoadingSkeleton type="card" count={6} />
      </div>
    </div>;
}

// 移动端优化的加载骨架
export function MobileLoadingSkeleton({
  type = 'card',
  count = 3,
  className
}) {
  return <div className={cn("px-4 py-6 space-y-4", className)}>
      {Array.from({
      length: count
    }).map((_, index) => <div key={index} className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 animate-pulse">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-slate-700/50 rounded-lg flex-shrink-0"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-700/50 rounded w-3/4"></div>
              <div className="h-3 bg-slate-700/50 rounded w-full"></div>
              <div className="h-3 bg-slate-700/50 rounded w-1/2"></div>
            </div>
          </div>
        </div>)}
    </div>;
}

// 脉冲加载动画组件
export function PulseLoader({
  size = 'md',
  color = 'red',
  className
}) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };
  const colorClasses = {
    red: 'text-red-500',
    blue: 'text-blue-500',
    green: 'text-green-500',
    orange: 'text-orange-500'
  };
  return <div className={cn("flex items-center justify-center", className)}>
      <div className={cn("animate-spin rounded-full border-2 border-current border-t-transparent", sizeClasses[size], colorClasses[color])}></div>
    </div>;
}

// 点加载动画组件
export function DotLoader({
  count = 3,
  size = 'md',
  color = 'red',
  className
}) {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
    xl: 'w-5 h-5'
  };
  const colorClasses = {
    red: 'bg-red-500',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    orange: 'bg-orange-500'
  };
  return <div className={cn("flex space-x-1 items-center justify-center", className)}>
      {Array.from({
      length: count
    }).map((_, index) => <div key={index} className={cn("rounded-full animate-bounce", sizeClasses[size], colorClasses[color])} style={{
      animationDelay: `${index * 0.1}s`
    }}></div>)}
    </div>;
}