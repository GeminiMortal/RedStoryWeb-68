// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Button } from '@/components/ui';
// @ts-ignore;
import { AlertCircle, X, RefreshCw, Home, ArrowLeft, Wifi, Shield, AlertTriangle } from 'lucide-react';
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
  className,
  position = 'top' // 'top', 'center', 'bottom'
}) {
  const getAlertStyles = () => {
    switch (type) {
      case 'warning':
        return 'bg-yellow-900/50 border-yellow-600 text-yellow-200 shadow-lg shadow-yellow-500/20';
      case 'info':
        return 'bg-blue-900/50 border-blue-600 text-blue-200 shadow-lg shadow-blue-500/20';
      default:
        return 'bg-red-900/50 border-red-600 text-red-200 shadow-lg shadow-red-500/20';
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
  const getIcon = () => {
    switch (type) {
      case 'warning':
        return AlertTriangle;
      case 'info':
        return AlertCircle;
      default:
        return AlertCircle;
    }
  };
  const Icon = getIcon();
  const getPositionClasses = () => {
    switch (position) {
      case 'center':
        return 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 max-w-md w-full mx-4';
      case 'bottom':
        return 'fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto';
      default:
        return 'relative';
    }
  };
  return <div className={cn("border rounded-xl p-4 backdrop-blur-sm animate-fade-in", getAlertStyles(), getPositionClasses(), className)}>
      <div className="flex items-start space-x-3">
        <Icon className={cn("w-5 h-5 mt-0.5 flex-shrink-0 animate-bounce", getIconColor())} />
        <div className="flex-1 min-w-0">
          {title && <h3 className="text-sm font-semibold mb-1 animate-slide-up">
              {title}
            </h3>}
          {message && <p className="text-sm mb-2 animate-slide-up" style={{
          animationDelay: '0.1s'
        }}>
              {message}
            </p>}
          {details && <p className="text-xs opacity-80 mb-3 animate-slide-up" style={{
          animationDelay: '0.2s'
        }}>
              {details}
            </p>}
          
          {/* 操作按钮 */}
          <div className="flex flex-wrap gap-2 animate-slide-up" style={{
          animationDelay: '0.3s'
        }}>
            {showRetry && onRetry && <Button onClick={onRetry} variant="outline" size="sm" className="border-current/30 text-current hover:bg-current/10 transition-all duration-200 button-press">
                <RefreshCw className="w-3 h-3 mr-1" />
                重试
              </Button>}
            {showHome && onGoHome && <Button onClick={onGoHome} variant="outline" size="sm" className="border-current/30 text-current hover:bg-current/10 transition-all duration-200 button-press">
                <Home className="w-3 h-3 mr-1" />
                返回首页
              </Button>}
            {showBack && onGoBack && <Button onClick={onGoBack} variant="outline" size="sm" className="border-current/30 text-current hover:bg-current/10 transition-all duration-200 button-press">
                <ArrowLeft className="w-3 h-3 mr-1" />
                返回
              </Button>}
          </div>
        </div>
        
        {onDismiss && <Button onClick={onDismiss} variant="ghost" size="sm" className="text-current/70 hover:text-current hover:bg-current/10 transition-all duration-200 button-press">
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
  onGoBack,
  position = 'center'
}) {
  return <ErrorAlert type="error" title="加载失败" message={error || '数据加载时出现错误'} details="请检查网络连接或稍后重试" showRetry={!!onRetry} showHome={!!onGoHome} showBack={!!onGoBack} onRetry={onRetry} onGoHome={onGoHome} onGoBack={onGoBack} position={position} />;
}

// 网络错误组件
export function NetworkError({
  onRetry,
  onGoHome,
  position = 'bottom'
}) {
  return <ErrorAlert type="warning" title="网络连接异常" message="无法连接到服务器" details="请检查网络设置或稍后重试" showRetry={!!onRetry} showHome={!!onGoHome} onRetry={onRetry} onGoHome={onGoHome} position={position} />;
}

// 权限错误组件
export function PermissionError({
  message = "权限不足",
  onGoHome,
  position = 'center'
}) {
  return <ErrorAlert type="warning" title="访问受限" message={message} details="您没有权限访问此内容" showHome={!!onGoHome} onGoHome={onGoHome} position={position} />;
}

// Toast 风格的错误提示
export function ToastError({
  title,
  message,
  onDismiss,
  duration = 5000
}) {
  React.useEffect(() => {
    if (duration > 0 && onDismiss) {
      const timer = setTimeout(onDismiss, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onDismiss]);
  return <div className="fixed top-4 right-4 z-50 max-w-sm w-full mx-4 animate-slide-in">
      <div className="bg-red-900/90 backdrop-blur-sm border border-red-600 text-red-200 rounded-xl p-4 shadow-lg shadow-red-500/20">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            {title && <h3 className="text-sm font-semibold mb-1">{title}</h3>}
            {message && <p className="text-sm">{message}</p>}
          </div>
          {onDismiss && <button onClick={onDismiss} className="text-red-400 hover:text-red-300 transition-colors duration-200">
              <X className="w-4 h-4" />
            </button>}
        </div>
      </div>
    </div>;
}

// 成功提示组件
export function SuccessAlert({
  title,
  message,
  onDismiss,
  duration = 3000
}) {
  React.useEffect(() => {
    if (duration > 0 && onDismiss) {
      const timer = setTimeout(onDismiss, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onDismiss]);
  return <div className="fixed top-4 right-4 z-50 max-w-sm w-full mx-4 animate-slide-in">
      <div className="bg-green-900/90 backdrop-blur-sm border border-green-600 text-green-200 rounded-xl p-4 shadow-lg shadow-green-500/20">
        <div className="flex items-start space-x-3">
          <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
          <div className="flex-1 min-w-0">
            {title && <h3 className="text-sm font-semibold mb-1">{title}</h3>}
            {message && <p className="text-sm">{message}</p>}
          </div>
          {onDismiss && <button onClick={onDismiss} className="text-green-400 hover:text-green-300 transition-colors duration-200">
              <X className="w-4 h-4" />
            </button>}
        </div>
      </div>
    </div>;
}