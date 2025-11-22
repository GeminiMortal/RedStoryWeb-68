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
        return 'bg-yellow-900/50 border-yellow-600 text-yellow-200';
      case 'info':
        return 'bg-blue-900/50 border-blue-600 text-blue-200';
      default:
        return 'bg-red-900/50 border-red-600 text-red-200';
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
  return <div className={cn("border rounded-lg p-4 backdrop-blur-sm animate-fade-in", getAlertStyles(), className)}>
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
            {showRetry && onRetry && <Button onClick={onRetry} variant="outline" size="sm" className="border-current/30 text-current hover:bg-current/10">
                <RefreshCw className="w-3 h-3 mr-1" />
                重试
              </Button>}
            {showHome && onGoHome && <Button onClick={onGoHome} variant="outline" size="sm" className="border-current/30 text-current hover:bg-current/10">
                <Home className="w-3 h-3 mr-1" />
                返回首页
              </Button>}
            {showBack && onGoBack && <Button onClick={onGoBack} variant="outline" size="sm" className="border-current/30 text-current hover:bg-current/10">
                <ArrowLeft className="w-3 h-3 mr-1" />
                返回
              </Button>}
          </div>
        </div>
        
        {onDismiss && <Button onClick={onDismiss} variant="ghost" size="sm" className="text-current/70 hover:text-current hover:bg-current/10">
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