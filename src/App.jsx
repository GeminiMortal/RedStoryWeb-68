// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { useToast } from '@/components/ui';

// Import pages
import HomePage from '@/pages/index.jsx';
import UploadPage from '@/pages/upload.jsx';
import AdminPage from '@/pages/admin.jsx';
import DetailPage from '@/pages/detail.jsx';
import EditPage from '@/pages/edit.jsx';
import LoginPage from '@/pages/login.jsx';

// Import components
import { Sidebar } from '@/components/Sidebar';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { ErrorAlert } from '@/components/ErrorAlert';
export default function App(props) {
  const [currentPage, setCurrentPage] = useState('index');
  const [pageParams, setPageParams] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const {
    toast
  } = useToast();

  // 页面路由配置
  const pages = {
    index: HomePage,
    upload: UploadPage,
    admin: AdminPage,
    detail: DetailPage,
    edit: EditPage,
    login: LoginPage
  };

  // 初始化应用
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setLoading(true);

        // 检查必要的环境
        if (typeof window === 'undefined') {
          throw new Error('应用需要在浏览器环境中运行');
        }

        // 检查必要的API
        if (!window.$w) {
          throw new Error('应用环境未正确初始化');
        }

        // 初始化用户状态
        await initializeUserState();

        // 设置页面路由
        setupRouting();
        setIsInitialized(true);
        toast({
          title: '应用加载成功',
          description: '欢迎使用红色故事平台'
        });
      } catch (error) {
        console.error('应用初始化失败:', error);
        setError(error.message || '应用初始化失败');
        toast({
          title: '初始化失败',
          description: error.message || '应用初始化失败，请刷新页面重试',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };
    initializeApp();
  }, []);

  // 初始化用户状态
  const initializeUserState = async () => {
    try {
      // 检查用户登录状态
      const user = window.$w?.auth?.currentUser;
      if (user) {
        console.log('当前用户:', user);
      }
    } catch (error) {
      console.warn('用户状态初始化失败:', error);
    }
  };

  // 设置页面路由
  const setupRouting = () => {
    // 监听页面参数变化
    const handleParamsChange = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const page = urlParams.get('page') || 'index';
      const params = {};

      // 解析所有参数
      for (const [key, value] of urlParams.entries()) {
        if (key !== 'page') {
          params[key] = value;
        }
      }
      setCurrentPage(page);
      setPageParams(params);
    };

    // 初始参数解析
    handleParamsChange();

    // 监听浏览器前进后退
    window.addEventListener('popstate', handleParamsChange);
  };

  // 页面导航函数
  const navigateTo = ({
    pageId,
    params = {}
  }) => {
    try {
      // 构建URL参数
      const urlParams = new URLSearchParams();
      urlParams.set('page', pageId);

      // 添加其他参数
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          urlParams.set(key, String(value));
        }
      });

      // 更新URL
      const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
      window.history.pushState({
        pageId,
        params
      }, '', newUrl);

      // 更新状态
      setCurrentPage(pageId);
      setPageParams(params);

      // 滚动到顶部
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      console.log('导航到页面:', pageId, params);
    } catch (error) {
      console.error('页面导航失败:', error);
      toast({
        title: '导航失败',
        description: '页面跳转出现问题，请重试',
        variant: 'destructive'
      });
    }
  };

  // 返回上一页
  const navigateBack = () => {
    try {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        // 如果没有历史记录，返回首页
        navigateTo({
          pageId: 'index',
          params: {}
        });
      }
    } catch (error) {
      console.error('返回上一页失败:', error);
      navigateTo({
        pageId: 'index',
        params: {}
      });
    }
  };

  // 获取当前页面组件
  const getCurrentPageComponent = () => {
    const PageComponent = pages[currentPage];
    if (!PageComponent) {
      return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-6">📖</div>
            <h1 className="text-2xl font-bold text-red-400 mb-4">页面不存在</h1>
            <p className="text-slate-400 mb-6">
              抱歉，您访问的页面不存在。
            </p>
            <button onClick={() => navigateTo({
            pageId: 'index',
            params: {}
          })} className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105">
              返回首页
            </button>
          </div>
        </div>;
    }
    return React.createElement(PageComponent, {
      $w: {
        auth: window.$w?.auth || {
          currentUser: null
        },
        utils: {
          navigateTo,
          navigateBack,
          redirectTo: navigateTo
        },
        page: {
          dataset: {
            params: pageParams
          }
        },
        cloud: window.$w?.cloud || {
          callFunction: async () => ({}),
          getCloudInstance: async () => null
        }
      }
    });
  };

  // 加载状态
  if (loading) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <LoadingSkeleton type="page" title="加载中" description="正在初始化应用..." />
      </div>;
  }

  // 错误状态
  if (error) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center">
        <ErrorAlert type="error" title="应用初始化失败" message={error} showRetry={true} onRetry={() => window.location.reload()} position="center" />
      </div>;
  }

  // 未初始化状态
  if (!isInitialized) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-slate-400">正在初始化应用...</p>
        </div>
      </div>;
  }

  // 渲染应用
  return <div className="App">
      {getCurrentPageComponent()}
    </div>;
}