// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Button } from '@/components/ui';
// @ts-ignore;
import { AlertCircle, RefreshCw } from 'lucide-react';

export function ErrorState({
  error,
  onRetry,
  onClearSearch,
  isRetrying = false
}) {
  return <div className="text-center py-16">
      <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
        <AlertCircle className="w-12 h-12 text-red-500" />
      </div>
      <h3 className="text-2xl font-medium text-slate-400 mb-3">加载失败</h3>
      <p className="text-slate-500 mb-8 max-w-md mx-auto">{error}</p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button onClick={onRetry} disabled={isRetrying} className="bg-red-500 hover:bg-red-600">
          {isRetrying ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
          重新加载
        </Button>
        {onClearSearch && <Button onClick={onClearSearch} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
          清除搜索
        </Button>}
      </div>
    </div>;
}