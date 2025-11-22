// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Button } from '@/components/ui';
// @ts-ignore;
import { AlertCircle, X, RefreshCw, Home, ArrowLeft } from 'lucide-react';
// @ts-ignore;
import { cn } from '@/lib/utils';

export function ErrorAlert({
  title,
  message,
  details,
  type = 'error',
  // 'error', 'warning', 'info'
  showRetry = false,
  showHome = false,
  showBack = false,
  onRetry,
  onGoHome,
  onGoBack,
  onDismiss,
  className
}) {
  const getAlertStyles = () => {
    switch (type) {
      case 'warning':
        return 'bg-yellow-900/50 border-yellow-600/50 text-yellow-200 shadow-lg';
      case 'info':
        return 'bg-blue-900/50 border-blue-600/50 text-blue-200 shadow-lg';
      default:
        return 'bg-red-900/50 border-red-600/50 text-red-200 shadow-lg';
    }
  };
  const getIconColor = () => {
    switch (type) {
      case 'warning':
        return 'text-yellow-400';
      case 'info':
        return 'text-blue-400';
      default:
        return 'text-red-400';
    }
  };
  return <div className={cn("border rounded-xl p-4 backdrop-blur-sm animate-fade-in", getAlertStyles(), className)}>
      <div className="flex items-start space-x-3">
        <AlertCircle className={cn("w-5 h-5 mt-0.5 flex-shrink-0", getIconColor())} />
        <div className="flex-1 min-w-0">
          {title && <h3 className="text-sm font-semibold mb-1">
              {title}
            </h3>}
          {message && <p className="text-sm mb-2">
              {message}
            </p>}
          {details && <p className="text-xs opacity-80 mb-3">
              {details}
            </p>}
          
          {/* 操作按钮 */}
          <div className="flex flex-wrap gap-2">
            {showRetry && onRetry && <Button onClick={onRetry} variant="outline" size="sm" className="border-current/30 text-current hover:bg-current/10 transition-all button-press touch-target">
                <RefreshCw className="w-3 h-3 mr-1" />
                重试
              </Button>}
            {showHome && onGoHome && <Button onClick={onGoHome} variant="outline" size="sm" className="border-current/30 text-current hover:bg-current/10 transition-all button-press touch-target">
                <Home className="w-3 h-3 mr-1" />
                返回首页
              </Button>}
            {showBack && onGoBack && <Button onClick={onGoBack} variant="outline" size="sm" className="border-current/30 text-current hover:bg-current/10 transition-all button-press touch-target">
                <ArrowLeft className="w-3 h-3 mr-1" />
                返回
              </Button>}
          </div>
        </div>
        
        {onDismiss && <Button onClick={onDismiss} variant="ghost" size="sm" className="text-current/70 hover:text-current hover:bg-current/10 transition-all button-press touch-target">
            <X className="w-4 h-4" />
          </Button>}
      </div>
    </div>;
}

// 加载错误组件
export function LoadingError({
  error,
  onRetry,
  onGoHome,
  onGoBack
}) {
  return <ErrorAlert type="error" title="加载失败" message={error || '数据加载时出现错误'} details="请检查网络连接或稍后重试" showRetry={!!onRetry} showHome={!!onGoHome} showBack={!!onGoBack} onRetry={onRetry} onGoHome={onGoHome} onGoBack={onGoBack} />;
}

// 网络错误组件
export function NetworkError({
  onRetry,
  onGoHome
}) {
  return <ErrorAlert type="warning" title="网络连接异常" message="无法连接到服务器" details="请检查网络设置或稍后重试" showRetry={!!onRetry} showHome={!!onGoHome} onRetry={onRetry} onGoHome={onGoHome} />;
}

// 权限错误组件
export function PermissionError({
  message = "权限不足",
  onGoHome
}) {
  return <ErrorAlert type="warning" title="访问受限" message={message} details="您没有权限访问此内容" showHome={!!onGoHome} onGoHome={onGoHome} />;
}

// 表单错误组件
export function FormError({
  errors,
  fieldName,
  className
}) {
  if (!errors || !errors[fieldName]) return null;
  return <ErrorAlert type="error" message={errors[fieldName]} showDismiss={false} className={cn("mt-2", className)} />;
}

// 全局错误边界组件
export function GlobalError({
  error,
  resetError
}) {
  return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50 shadow-strong animate-fade-in">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6 animate-bounce" />
          <h2 className="text-2xl font-bold text-white mb-4">出现错误</h2>
          <p className="text-slate-400 mb-6">
            {error?.message || '应用程序遇到了意外错误'}
          </p>
          <div className="space-x-4">
            <Button onClick={resetError} className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 transition-all button-press">
              <RefreshCw className="w-4 h-4 mr-2" />
              重试
            </Button>
            <Button onClick={() => window.location.href = '/'} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700 transition-all button-press">
              <Home className="w-4 h-4 mr-2" />
              返回首页
            </Button>
          </div>
        </div>
      </div>
    </div>;
}