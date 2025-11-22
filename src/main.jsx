// @ts-ignore;
import React from 'react';

import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

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

// Create root and render app
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render with error boundary
root.render(<React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>);

// Report web vitals in development
if (process.env.NODE_ENV === 'development') {
  import('web-vitals').then(({
    getCLS,
    getFID,
    getFCP,
    getLCP,
    getTTFB
  }) => {
    getCLS(reportWebVitals);
    getFID(reportWebVitals);
    getFCP(reportWebVitals);
    getLCP(reportWebVitals);
    getTTFB(reportWebVitals);
  });
}

// Global error handlers
window.addEventListener('error', event => {
  console.error('Global error:', event.error);
});
window.addEventListener('unhandledrejection', event => {
  console.error('Unhandled promise rejection:', event.reason);
});