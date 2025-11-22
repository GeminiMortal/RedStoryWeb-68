// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Home, BookOpen, Settings, Copyright, ChevronLeft, ChevronRight, Menu, X } from 'lucide-react';
// @ts-ignore;
import { cn } from '@/lib/utils';

export function Sidebar({
  currentPage,
  navigateTo
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  // 从 sessionStorage 读取侧边栏状态
  useEffect(() => {
    const savedCollapsed = sessionStorage.getItem('sidebarCollapsed');
    if (savedCollapsed !== null) {
      setIsCollapsed(savedCollapsed === 'true');
    }
  }, []);

  // 保存侧边栏状态到 sessionStorage
  const updateCollapsedState = collapsed => {
    setIsCollapsed(collapsed);
    sessionStorage.setItem('sidebarCollapsed', String(collapsed));
  };

  // 监听窗口大小变化
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      const isDesktopView = width >= 1024; // lg
      const isTabletView = width >= 768 && width < 1024; // md to lg
      const isMobileView = width < 768; // below md

      setIsDesktop(isDesktopView);
      setIsTablet(isTabletView);

      // 桌面端默认不折叠，平板端默认折叠，移动端默认关闭
      if (isDesktopView) {
        setIsMobileOpen(false);
        // 桌面端保持用户选择的折叠状态
      } else if (isTabletView) {
        setIsMobileOpen(false);
        // 平板端默认折叠
        if (savedCollapsed === null) {
          setIsCollapsed(true);
        }
      } else {
        // 移动端保持折叠状态，但不打开侧边栏
        setIsCollapsed(true);
      }
    };
    const savedCollapsed = sessionStorage.getItem('sidebarCollapsed');
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);
  const navItems = [{
    id: 'index',
    label: '主页',
    icon: Home,
    pageId: 'index'
  }, {
    id: 'admin',
    label: '管理',
    icon: Settings,
    pageId: 'admin'
  }];
  const toggleSidebar = () => {
    updateCollapsedState(!isCollapsed);
  };
  const toggleMobile = () => {
    setIsMobileOpen(!isMobileOpen);
  };
  const handleNavigation = pageId => {
    navigateTo({
      pageId,
      params: {}
    });
    setIsMobileOpen(false);
  };

  // 获取侧边栏宽度类名
  const getSidebarWidthClass = () => {
    if (isMobileOpen) {
      return 'w-80'; // 移动端展开时使用更大的宽度
    }
    if (isCollapsed) {
      return isDesktop ? 'w-16' : 'w-64';
    }
    return 'w-64';
  };

  // 获取主内容区域偏移类名
  const getMainContentOffsetClass = () => {
    if (isMobileOpen) {
      return 'ml-80'; // 移动端展开时偏移
    }
    if (isCollapsed) {
      return isDesktop ? 'ml-16' : 'ml-64';
    }
    return 'ml-64';
  };

  // 移动端遮罩层
  const MobileOverlay = () => <div className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300" onClick={toggleMobile} />;
  return <>
      {/* 移动端菜单按钮 - 仅在移动端显示 */}
      <button onClick={toggleMobile} className={cn("fixed top-4 left-4 z-50 bg-slate-800/90 backdrop-blur-sm p-2.5 rounded-xl border border-slate-700 shadow-lg hover:bg-slate-700/90 transition-all duration-200", "block md:hidden")}>
        <Menu className="w-5 h-5 text-white" />
      </button>

      {/* 移动端侧边栏 */}
      {isMobileOpen && <MobileOverlay />}
      
      {/* 侧边栏主体 - 优化响应式设计 */}
      <div className={cn("fixed left-0 top-0 h-full bg-slate-800/95 backdrop-blur-md border-r border-slate-700/50 flex flex-col transition-all duration-300 ease-in-out z-50", getSidebarWidthClass(), "md:translate-x-0", isMobileOpen ? "translate-x-0" : "-translate-x-full")}>
        {/* Logo/标题区域 */}
        <div className={cn("p-6 border-b border-slate-700/50 flex items-center justify-between", isCollapsed && isDesktop && "md:p-3 md:justify-center", isMobileOpen && "p-6")}>
          {!isCollapsed || !isDesktop ? <h1 className="text-xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
              红色故事
            </h1> : <BookOpen className="w-6 h-6 text-red-500" />}
          
          {/* 移动端关闭按钮 */}
          <button onClick={toggleMobile} className="md:hidden text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 导航菜单 */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return <li key={item.id}>
                  <button onClick={() => handleNavigation(item.pageId)} className={cn("w-full flex items-center space-x-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200", "hover:scale-105 hover:shadow-lg", isActive ? "bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-md" : "text-slate-300 hover:bg-slate-700/50 hover:text-white", isCollapsed && isDesktop && "md:justify-center md:px-2", isMobileOpen && "py-4 px-4")}>
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {(!isCollapsed || !isDesktop) && <span>{item.label}</span>}
                  </button>
                </li>;
          })}
          </ul>
        </nav>

        {/* 版权信息 */}
        <div className={cn("p-4 border-t border-slate-700/50", isCollapsed && isDesktop && "md:p-2", isMobileOpen && "p-6")}>
          {!isCollapsed || !isDesktop ? <p className="text-xs text-slate-500 text-center">
              © <span className="text-red-400">sut</span>·code2501
            </p> : <Copyright className="w-4 h-4 text-slate-500 mx-auto" />}
        </div>

        {/* 折叠按钮 - 仅桌面端显示 */}
        {isDesktop && <button onClick={toggleSidebar} className={cn("absolute top-1/2 -right-3 transform -translate-y-1/2", "bg-slate-700 hover:from-red-500 hover:to-orange-500 text-white", "rounded-full p-1.5 shadow-lg border border-slate-600", "transition-all duration-200 hover:scale-110")}>
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>}
      </div>

      {/* 主内容区域偏移 - 通过CSS类控制 */}
      <style jsx>{`
        .main-content-area {
          margin-left: ${isMobileOpen ? '20rem' : isCollapsed && isDesktop ? '4rem' : '16rem'};
          transition: margin-left 0.3s ease-in-out;
        }
        
        @media (max-width: 768px) {
          .main-content-area {
            margin-left: 0;
          }
        }
        
        @media (min-width: 768px) and (max-width: 1023px) {
          .main-content-area {
            margin-left: ${isCollapsed ? '4rem' : '16rem'};
          }
        }
        
        @media (min-width: 1024px) {
          .main-content-area {
            margin-left: ${isCollapsed ? '4rem' : '16rem'};
          }
        }
      `}</style>
    </>;
}