// @ts-ignore;
import React, { Component } from 'react';
// @ts-ignore;
import { Button, Alert, AlertDescription, AlertTitle } from '@/components/ui';
// @ts-ignore;
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

// 错误边界组件
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    };
  }
  static getDerivedStateFromError(error) {
    // 更新 state 使下一次渲染能够显示降级后的 UI
    return {
      hasError: true,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }
  componentDidCatch(error, errorInfo) {
    // 记录错误信息
    console.error('错误边界捕获到错误:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });

    // 可以在这里发送错误报告到服务器
    this.reportError(error, errorInfo);
  }
  reportError = (error, errorInfo) => {
    // 模拟错误报告
    const errorReport = {
      errorId: this.state.errorId,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // 在实际项目中，这里应该发送到错误监控服务
    console.log('错误报告:', errorReport);
  };
  handleReload = () => {
    window.location.reload();
  };
  handleGoHome = () => {
    window.location.href = '/';
  };
  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    });
  };
  render() {
    if (this.state.hasError) {
      return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center p-4">
          <div className="max-w-2xl w-full">
            <Alert className="bg-slate-800/50 border-red-500/50">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <AlertTitle className="text-red-400">页面出现错误</AlertTitle>
              <AlertDescription className="text-slate-300 mt-4 space-y-4">
                <div>
                  <p className="mb-2">抱歉，页面遇到了意外错误。这可能是由于以下原因造成的：</p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-slate-400">
                    <li>网络连接问题</li>
                    <li>服务器暂时不可用</li>
                    <li>浏览器兼容性问题</li>
                    <li>数据加载失败</li>
                  </ul>
                </div>

                <div className="bg-slate-700/50 p-3 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Bug className="w-4 h-4 text-slate-400 mr-2" />
                    <span className="text-sm font-medium text-slate-300">错误信息</span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono">
                    错误ID: {this.state.errorId}
                  </p>
                  {this.state.error && <p className="text-xs text-red-400 font-mono mt-1">
                      {this.state.error.message}
                    </p>}
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <Button onClick={this.handleReset} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    重试
                  </Button>
                  <Button onClick={this.handleReload} className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover-to-orange-600">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    刷新页面
                  </Button>
                  <Button onClick={this.handleGoHome} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                    <Home className="w-4 h-4 mr-2" />
                    返回首页
                  </Button>
                </div>

                <div className="text-xs text-slate-500 pt-4 border-t border-slate-700">
                  如果问题持续存在，请联系技术支持并提供错误ID: {this.state.errorId}
                </div>
              </AlertDescription>
            </Alert>
          </div>
        </div>;
    }
    return this.props.children;
  }
}

// 数据加载错误组件
export const DataLoadError = ({
  error,
  onRetry,
  onGoBack,
  title = "数据加载失败",
  description = "无法加载数据，请检查网络连接后重试",
  showDetails = false
}) => {
  const [showErrorDetails, setShowErrorDetails] = React.useState(showDetails);
  return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        <Alert className="bg-slate-800/50 border-red-500/50">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <AlertTitle className="text-red-400">{title}</AlertTitle>
          <AlertDescription className="text-slate-300 mt-4 space-y-4">
            <p>{description}</p>
            
            {error && <div className="space-y-2">
                <Button onClick={() => setShowErrorDetails(!showErrorDetails)} variant="ghost" size="sm" className="text-slate-400 hover:text-slate-300 p-0 h-auto">
                  {showErrorDetails ? '隐藏' : '显示'}错误详情
                </Button>
                
                {showErrorDetails && <div className="bg-slate-700/50 p-3 rounded-lg">
                    <p className="text-xs text-red-400 font-mono break-all">
                      {error.message || error}
                    </p>
                  </div>}
              </div>}

            <div className="flex flex-wrap gap-3 pt-2">
              {onRetry && <Button onClick={onRetry} className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  重试
                </Button>}
              {onGoBack && <Button onClick={onGoBack} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                  返回
                </Button>}
            </div>
          </AlertDescription>
        </Alert>
      </div>
    </div>;
};

// 网络错误组件
export const NetworkError = ({
  onRetry,
  onGoBack
}) => {
  return <DataLoadError title="网络连接失败" description="无法连接到服务器，请检查网络连接后重试" onRetry={onRetry} onGoBack={onGoBack} />;
};

// 服务器错误组件
export const ServerError = ({
  onRetry,
  onGoBack
}) => {
  return <DataLoadError title="服务器错误" description="服务器暂时不可用，请稍后重试" onRetry={onRetry} onGoBack={onGoBack} />;
};

// 权限错误组件
export const PermissionError = ({
  onGoBack,
  message = "您没有权限访问此内容"
}) => {
  return <DataLoadError title="权限不足" description={message} onRetry={null} onGoBack={onGoBack} />;
};

// 404错误组件
export const NotFoundError = ({
  onGoBack
}) => {
  return <DataLoadError title="页面不存在" description="抱歉，您访问的页面不存在或已被移除" onRetry={null} onGoBack={onGoBack} />;
};