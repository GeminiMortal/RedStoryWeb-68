// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Skeleton, Card } from '@/components/ui';

// 统一的加载骨架屏组件
export const LoadingSkeleton = ({
  count = 3,
  type = 'story'
}) => {
  if (type === 'story') {
    return <div className="space-y-4">
        {[...Array(count)].map((_, index) => <Card key={index} className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 p-6">
            <div className="space-y-3">
              <Skeleton className="h-6 w-1/3 bg-slate-700" />
              <Skeleton className="h-4 w-2/3 bg-slate-700" />
              <Skeleton className="h-4 w-1/2 bg-slate-700" />
              <div className="flex items-center space-x-4">
                <Skeleton className="h-3 w-20 bg-slate-700" />
                <Skeleton className="h-3 w-16 bg-slate-700" />
                <Skeleton className="h-3 w-12 bg-slate-700" />
              </div>
            </div>
          </Card>)}
      </div>;
  }
  if (type === 'detail') {
    return <div className="space-y-4">
        <Skeleton className="h-8 w-3/4 bg-slate-700" />
        <Skeleton className="h-4 w-1/2 bg-slate-700" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full bg-slate-700" />
          <Skeleton className="h-4 w-full bg-slate-700" />
          <Skeleton className="h-4 w-3/4 bg-slate-700" />
        </div>
      </div>;
  }
  return <div className="space-y-4">
      {[...Array(count)].map((_, index) => <div key={index} className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 rounded-xl p-6 animate-pulse">
          <div className="h-6 bg-slate-700 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-slate-700 rounded w-2/3 mb-2"></div>
          <div className="h-4 bg-slate-700 rounded w-1/2"></div>
        </div>)}
    </div>;
};

// 页面加载状态
export const PageLoading = ({
  message = '加载中...'
}) => <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-slate-400">{message}</p>
    </div>
  </div>;