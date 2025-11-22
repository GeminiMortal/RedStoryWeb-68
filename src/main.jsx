// @ts-ignore;
import React from 'react';

// Error boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }
  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error
    };
  }
  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-6">📖</div>
            <h1 className="text-2xl font-bold text-red-400 mb-4">页面加载失败</h1>
            <p className="text-slate-400 mb-6">
              抱歉，页面加载时出现错误。请刷新页面重试。
            </p>
            <button onClick={() => window.location.reload()} className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105">
              重新加载
            </button>
            {process.env.NODE_ENV === 'development' && <details className="mt-4 text-left">
                <summary className="cursor-pointer text-slate-400">错误详情</summary>
                <pre className="mt-2 p-4 bg-slate-800 rounded text-xs text-red-400 overflow-auto">
                  {this.state.error?.toString()}
                </pre>
              </details>}
          </div>
        </div>;
    }
    return this.props.children;
  }
}

// Performance monitoring
const reportWebVitals = metric => {
  console.log('Web Vital:', metric);
  // 可以发送到分析服务
};

// 初始化应用
const initializeApp = () => {
  try {
    // 检查必要的环境
    if (typeof window === 'undefined') {
      throw new Error('应用需要在浏览器环境中运行');
    }

    // 检查必要的API
    if (!window.$w) {
      throw new Error('应用环境未正确初始化');
    }

    // 导入并渲染应用
    import('./App.jsx').then(({
      default: App
    }) => {
      // 使用系统内置的React渲染方式
      const rootElement = document.getElementById('root');
      if (!rootElement) {
        throw new Error('找不到根元素');
      }

      // 使用React 18的createRoot API（如果可用）
      if (React.createRoot) {
        const root = React.createRoot(rootElement);
        root.render(React.createElement(React.StrictMode, null, React.createElement(ErrorBoundary, null, React.createElement(App))));
      } else {
        // 兼容旧版本React
        React.render(React.createElement(React.StrictMode, null, React.createElement(ErrorBoundary, null, React.createElement(App))), rootElement);
      }
      console.log('应用渲染成功');
    }).catch(error => {
      console.error('应用加载失败:', error);
      showErrorFallback(error);
    });
  } catch (error) {
    console.error('应用初始化失败:', error);
    showErrorFallback(error);
  }
};

// 显示错误回退界面
const showErrorFallback = error => {
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = `
      <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center p-4">
        <div class="text-center max-w-md">
          <div class="text-6xl mb-6">📖</div>
          <h1 class="text-2xl font-bold text-red-400 mb-4">应用加载失败</h1>
          <p class="text-slate-400 mb-6">
            抱歉，应用加载时出现错误。请刷新页面重试。
          </p>
          <button onclick="window.location.reload()" class="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105">
            重新加载
          </button>
          ${process.env.NODE_ENV === 'development' ? `
            <details class="mt-4 text-left">
              <summary class="cursor-pointer text-slate-400">错误详情</summary>
              <pre class="mt-2 p-4 bg-slate-800 rounded text-xs text-red-400 overflow-auto">${error?.toString() || '未知错误'}</pre>
            </details>
          ` : ''}
        </div>
      </div>
    `;
  }
};

// DOM加载完成后初始化应用
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}

// 全局错误处理
window.addEventListener('error', event => {
  console.error('Global error:', event.error);
  showErrorFallback(event.error);
});
window.addEventListener('unhandledrejection', event => {
  console.error('Unhandled promise rejection:', event.reason);
  showErrorFallback(event.reason);
});

// 性能监控
window.addEventListener('load', () => {
  if ('performance' in window) {
    const perfData = performance.getEntriesByType('navigation')[0];
    console.log('Page load time:', perfData.loadEventEnd - perfData.loadEventStart, 'ms');
  }
});