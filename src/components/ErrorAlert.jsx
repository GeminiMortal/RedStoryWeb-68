// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Button } from '@/components/ui';
// @ts-ignore;
import { AlertCircle, X, RefreshCw, Home, ArrowLeft, Wifi, WifiOff, Shield, Info } from 'lucide-react';
// @ts-ignore;
import { cn } from '@/lib/utils';

export function ErrorAlert({
  title,
  message,
  details,
  type = 'error',
  // 'error', 'warning', 'info', 'success'
  showRetry = false,
  showHome = false,
  showBack = false,
  showDismiss = true,
  onRetry,
  onGoHome,
  onGoBack,
  onDismiss,
  className,
  position = 'top',
  // 'top', 'bottom', 'center', 'inline'
  persistent = false
}) {
  const getAlertStyles = () => {
    switch (type) {
      case 'warning':
        return 'bg-orange-900/50 border-orange-600 text-orange-200 shadow-orange-500/25';
      case 'info':
        return 'bg-blue-900/50 border-blue-600 text-blue-200 shadow-blue-500/25';
      case 'success':
        return 'bg-green-900/50 border-green-600 text-green-200 shadow-green-500/25';
      default:
        return 'bg-red-900/50 border-red-600 text-red-200 shadow-red-500/25';
    }
  };
  const getIconColor = () => {
    switch (type) {
      case 'warning':
        return 'text-orange-400';
      case 'info':
        return 'text-blue-400';
      case 'success':
        return 'text-green-400';
      default:
        return 'text-red-400';
    }
  };
  const getIcon = () => {
    switch (type) {
      case 'warning':
        return AlertCircle;
      case 'info':
        return Info;
      case 'success':
        return AlertCircle;
      default:
        return AlertCircle;
    }
  };
  const Icon = getIcon();
  const getPositionClasses = () => {
    switch (position) {
      case 'bottom':
        return 'fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md';
      case 'center':
        return 'fixed inset-0 z-50 flex items-center justify-center p-4';
      case 'inline':
        return 'relative';
      default:
        return 'fixed top-4 left-4 right-4 z-50 mx-auto max-w-md';
    }
  };
  const alertClasses = cn("border rounded-xl p-4 backdrop-blur-sm animate-fade-in shadow-strong", getAlertStyles(), getPositionClasses(), className);
  const contentClasses = cn("flex items-start space-x-3", position === 'center' && "bg-slate-800/95 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50");
  return <div className={alertClasses}>
      <div className={contentClasses}>
        <Icon className={cn("w-5 h-5 mt-0.5 flex-shrink-0", getIconColor())} />
        <div className="flex-1 min-w-0">
          {title && <h3 className="text-sm font-semibold mb-1 mobile-text">
              {title}
            </h3>}
          {message && <p className="text-sm mb-2 leading-relaxed">
              {message}
            </p>}
          {details && <p className="text-xs opacity-80 mb-3 leading-relaxed">
              {details}
            </p>}
          
          {/* 操作按钮 */}
          <div className="flex flex-wrap gap-2">
            {showRetry && onRetry && <Button onClick={onRetry} variant="outline" size="sm" className="border-current/30 text-current hover:bg-current/10 transition-all duration-200 button-press">
                <RefreshCw className="w-3 h-3 mr-1" />
                重试
              </Button>}
            {showHome && onGoHome && <Button onClick={onGoHome} variant="outline" size="sm" className="border-current/30 text-current hover:bg-current/10 transition-all duration-200 button-press">
                <Home className="w-3 h-3 mr-1" />
                首页
              </Button>}
            {showBack && onGoBack && <Button onClick={onGoBack} variant="outline" size="sm" className="border-current/30 text-current hover:bg-current/10 transition-all duration-200 button-press">
                <ArrowLeft className="w-3 h-3 mr-1" />
                返回
              </Button>}
          </div>
        </div>
        
        {showDismiss && onDismiss && <Button onClick={onDismiss} variant="ghost" size="sm" className="text-current/70 hover:text-current hover:bg-current/10 transition-all duration-200 button-press">
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
  className
}) {
  return <ErrorAlert type="error" title="加载失败" message={error || '数据加载时出现错误'} details="请检查网络连接或稍后重试" showRetry={!!onRetry} showHome={!!onGoHome} showBack={!!onGoBack} onRetry={onRetry} onGoHome={onGoHome} onGoBack={onGoBack} className={className} />;
}

// 网络错误组件
export function NetworkError({
  onRetry,
  onGoHome,
  className
}) {
  return <ErrorAlert type="warning" title="网络连接异常" message="无法连接到服务器" details="请检查网络设置或稍后重试" icon={WifiOff} showRetry={!!onRetry} showHome={!!onGoHome} onRetry={onRetry} onGoHome={onGoHome} className={className} />;
}

// 权限错误组件
export function PermissionError({
  message = "权限不足",
  onGoHome,
  className
}) {
  return <ErrorAlert type="warning" title="访问受限" message={message} details="您没有权限访问此内容" icon={Shield} showHome={!!onGoHome} onGoHome={onGoHome} className={className} />;
}

// 成功提示组件
export function SuccessAlert({
  title,
  message,
  details,
  onDismiss,
  duration = 3000,
  className
}) {
  React.useEffect(() => {
    if (duration > 0 && onDismiss) {
      const timer = setTimeout(onDismiss, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onDismiss]);
  return <ErrorAlert type="success" title={title} message={message} details={details} showDismiss={!!onDismiss} onDismiss={onDismiss} className={className} />;
}

// Toast 风格的错误提示
export function ToastError({
  message,
  onDismiss,
  duration = 5000,
  className
}) {
  return <ErrorAlert message={message} showDismiss={!!onDismiss} onDismiss={onDismiss} position="top" persistent={false} className={cn("max-w-sm", className)} />;
}

// 模态框风格的错误提示
export function ModalError({
  title,
  message,
  details,
  onRetry,
  onGoHome,
  onDismiss,
  className
}) {
  return <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-slate-800/95 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 max-w-md w-full shadow-strong animate-scale-in">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">
            {title || '出现错误'}
          </h3>
          <p className="text-slate-400 mb-4 leading-relaxed">
            {message}
          </p>
          {details && <p className="text-sm text-slate-500 mb-6">
              {details}
            </p>}
          
          <div className="flex flex-col sm:flex-row gap-3">
            {onRetry && <Button onClick={onRetry} className="flex-1 bg-red-500 hover:bg-red-600 text-white transition-all duration-200 button-press">
                <RefreshCw className="w-4 h-4 mr-2" />
                重试
              </Button>}
            {onGoHome && <Button onClick={onGoHome} variant="outline" className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700 transition-all duration-200 button-press">
                <Home className="w-4 h-4 mr-2" />
                首页
              </Button>}
            {onDismiss && <Button onClick={onDismiss} variant="outline" className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700 transition-all duration-200 button-press">
                取消
              </Button>}
          </div>
        </div>
      </div>
    </div>;
}