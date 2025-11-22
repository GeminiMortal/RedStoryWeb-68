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
  const [navigating, setNavigating] = useState(false);

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
      const isDesktopView = window.innerWidth >= 768;
      setIsDesktop(isDesktopView);

      // 桌面端默认不折叠，移动端默认关闭
      if (isDesktopView) {
        setIsMobileOpen(false);
      } else {
        // 移动端保持折叠状态，但不打开侧边栏
        const savedCollapsed = sessionStorage.getItem('sidebarCollapsed');
        if (savedCollapsed !== null) {
          setIsCollapsed(savedCollapsed === 'true');
        }
      }
    };
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

  // 优化的导航函数
  const handleNavigation = async pageId => {
    if (navigating) return;
    try {
      setNavigating(true);
      // 添加短暂延迟以提供视觉反馈
      await new Promise(resolve => setTimeout(resolve, 100));
      navigateTo({
        pageId,
        params: {}
      });
      // 移动端导航后关闭侧边栏
      if (!isDesktop) {
        setIsMobileOpen(false);
      }
    } catch (error) {
      console.error('导航失败:', error);
    } finally {
      setNavigating(false);
    }
  };

  // 移动端遮罩层
  const MobileOverlay = () => <div className="fixed inset-0 bg-black/50 z-40 md:hidden animate-fade-in" onClick={toggleMobile} />;
  return <>
      {/* 移动端菜单按钮 - 仅在移动端显示 */}
      <button onClick={toggleMobile} disabled={navigating} className={cn("fixed top-4 left-4 z-50 md:hidden", "bg-slate-800/95 backdrop-blur-md p-3 rounded-xl border border-slate-700/50", "shadow-lg hover:shadow-xl transition-all duration-300", "hover:bg-slate-700/90 mobile-touch-target", "animate-slide-in", navigating && "opacity-50 cursor-not-allowed")}>
        <Menu className="w-5 h-5 text-white" />
      </button>

      {/* 移动端侧边栏 */}
      {isMobileOpen && <MobileOverlay />}
      
      {/* 侧边栏主体 - 桌面端固定显示，移动端可折叠 */}
      <div className={cn("fixed left-0 top-0 h-full", "bg-slate-800/95 backdrop-blur-md border-r border-slate-700/50", "flex flex-col transition-all duration-300 ease-in-out z-50", "md:translate-x-0", isMobileOpen ? "translate-x-0" : "-translate-x-full", isCollapsed && isDesktop ? "md:w-16" : "md:w-64", "w-64", "shadow-2xl")}>
        {/* Logo/标题区域 */}
        <div className={cn("p-6 border-b border-slate-700/50 flex items-center justify-between", "bg-gradient-to-r from-slate-800/50 to-slate-700/50", isCollapsed && isDesktop && "md:p-4 md:justify-center")}>
          {!isCollapsed || !isDesktop ? <h1 className="text-xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent animate-fade-in">
              红色故事
            </h1> : <BookOpen className="w-6 h-6 text-red-500 animate-glow" />}
          
          {/* 移动端关闭按钮 */}
          <button onClick={toggleMobile} disabled={navigating} className="md:hidden text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-700/50 transition-all duration-200 mobile-touch-target">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 导航菜单 */}
        <nav className="flex-1 p-4 overflow-y-auto custom-scrollbar">
          <ul className="space-y-2">
            {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return <li key={item.id} className="animate-slide-up" style={{
              animationDelay: `${index * 100}ms`
            }}>
                  <button onClick={() => handleNavigation(item.pageId)} disabled={navigating} className={cn("w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300", "hover:scale-105 hover:shadow-lg button-press", "mobile-touch-target", isActive ? "bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-md shadow-red-500/25" : "text-slate-300 hover:bg-slate-700/50 hover:text-white hover-lift", isCollapsed && isDesktop && "md:justify-center md:px-3", navigating && "opacity-50 cursor-not-allowed")}>
                    <Icon className={cn("w-5 h-5 flex-shrink-0 transition-transform duration-200", isActive && "animate-pulse")} />
                    {(!isCollapsed || !isDesktop) && <span className="animate-fade-in">{item.label}</span>}
                  </button>
                </li>;
          })}
          </ul>
        </nav>

        {/* 版权信息 */}
        <div className={cn("p-4 border-t border-slate-700/50 bg-gradient-to-r from-slate-800/30 to-slate-700/30", isCollapsed && isDesktop && "md:p-3")}>
          {!isCollapsed || !isDesktop ? <p className="text-xs text-slate-500 text-center animate-fade-in">
              © <span className="text-red-400 font-medium">sut</span>·code2501
            </p> : <Copyright className="w-4 h-4 text-slate-500 mx-auto animate-float" />}
        </div>

        {/* 折叠按钮 - 仅桌面端显示 */}
        {isDesktop && <button onClick={toggleSidebar} disabled={navigating} className={cn("absolute top-1/2 -right-3 transform -translate-y-1/2", "bg-slate-700 hover:from-red-500 hover:to-orange-500 text-white", "rounded-full p-2 shadow-lg border border-slate-600", "transition-all duration-300 hover:scale-110 hover:shadow-xl", "button-press animate-bounce-in", navigating && "opacity-50 cursor-not-allowed")}>
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>}
      </div>
    </>;
}