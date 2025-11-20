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

  // 监听窗口大小变化，自动处理移动端状态
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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
    setIsCollapsed(!isCollapsed);
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

  // 移动端遮罩层
  const MobileOverlay = () => <div className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300" onClick={toggleMobile} />;
  return <>
      {/* 移动端菜单按钮 */}
      <button onClick={toggleMobile} className="fixed top-4 left-4 z-50 md:hidden bg-gray-800 p-2 rounded-lg border border-gray-700 shadow-lg">
        <Menu className="w-5 h-5 text-white" />
      </button>

      {/* 移动端侧边栏 */}
      {isMobileOpen && <MobileOverlay />}
      <div className={cn("fixed left-0 top-0 h-full bg-gray-800/95 backdrop-blur-sm border-r border-gray-700 flex flex-col transition-transform duration-300 ease-in-out z-50", "md:translate-x-0", isMobileOpen ? "translate-x-0" : "-translate-x-full", isCollapsed ? "md:w-16" : "md:w-64")}>
        {/* Logo/标题 */}
        <div className={cn("p-6 border-b border-gray-700/50 flex items-center justify-between", isCollapsed && "md:p-3")}>
          {!isCollapsed && <h1 className="text-xl font-bold text-white">
              红色故事
            </h1>}
          {isCollapsed && <BookOpen className="w-6 h-6 text-red-500 mx-auto" />}
          
          {/* 移动端关闭按钮 */}
          <button onClick={toggleMobile} className="md:hidden text-gray-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 导航菜单 */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return <li key={item.id}>
                  <button onClick={() => handleNavigation(item.pageId)} className={cn("w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200", "hover:scale-105 hover:shadow-lg", isActive ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md" : "text-gray-300 hover:bg-gray-700/50 hover:text-white", isCollapsed && "justify-center px-2")}>
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {!isCollapsed && <span>{item.label}</span>}
                  </button>
                </li>;
          })}
          </ul>
        </nav>

        {/* 版权信息 */}
        <div className={cn("p-4 border-t border-gray-700/50", isCollapsed && "md:p-2")}>
          {!isCollapsed && <p className="text-xs text-gray-500 text-center">
              © <span className="text-red-400">sut</span>·code2501
            </p>}
          {isCollapsed && <Copyright className="w-4 h-4 text-gray-500 mx-auto" />}
        </div>

        {/* 折叠按钮 - 仅桌面端显示 */}
        <button onClick={toggleSidebar} className="absolute top-1/2 -right-3 transform -translate-y-1/2 bg-gradient-to-r from-gray-700 to-gray-600 hover:from-red-500 hover:to-red-600 text-white rounded-full p-1.5 shadow-lg border border-gray-600 transition-all duration-200 hover:scale-110 hidden md:block">
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </>;
}