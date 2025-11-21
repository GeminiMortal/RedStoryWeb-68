// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Home, BookOpen, Settings, Copyright, ChevronLeft, ChevronRight, Menu, X } from 'lucide-react';
// @ts-ignore;
import { cn } from '@/lib/utils';

// @ts-ignore;
import { useSidebar } from '@/components/SidebarStore';
export function Sidebar({
  currentPage,
  navigateTo
}) {
  const {
    isCollapsed,
    isMobileOpen,
    isDesktop,
    toggleCollapsed,
    setCollapsed,
    toggleMobile,
    setMobile
  } = useSidebar();
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
  const handleNavigation = pageId => {
    navigateTo({
      pageId,
      params: {}
    });
    setMobile(false);
  };

  // 移动端遮罩层
  const MobileOverlay = () => <div className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300" onClick={() => setMobile(false)} />;
  return <>
    {/* 移动端菜单按钮 - 仅在移动端显示 */}
    <button onClick={() => setMobile(true)} className={cn("fixed top-4 left-4 z-50 md:hidden bg-slate-800/90 backdrop-blur-sm p-2.5 rounded-xl border border-slate-700 shadow-lg hover:bg-slate-700/90 transition-all duration-200")}>
      <Menu className="w-5 h-5 text-white" />
    </button>

    {/* 移动端侧边栏 */}
    {isMobileOpen && <MobileOverlay />}
    
    {/* 侧边栏主体 */}
    <div className={cn("fixed left-0 top-0 h-full bg-slate-800/95 backdrop-blur-md border-r border-slate-700/50 flex flex-col transition-all duration-300 ease-in-out z-50", "md:translate-x-0", isMobileOpen ? "translate-x-0" : "-translate-x-full", isCollapsed && isDesktop ? "md:w-16" : "md:w-64", "w-64")}>
      {/* Logo/标题区域 */}
      <div className={cn("p-6 border-b border-slate-700/50 flex items-center justify-between", isCollapsed && isDesktop && "md:p-3 md:justify-center")}>
        {!isCollapsed || !isDesktop ? <h1 className="text-xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
            红色故事
          </h1> : <BookOpen className="w-6 h-6 text-red-500" />}
        
        {/* 移动端关闭按钮 */}
        <button onClick={() => setMobile(false)} className="md:hidden text-slate-400 hover:text-white p-1">
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
                <button onClick={() => handleNavigation(item.pageId)} className={cn("w-full flex items-center space-x-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200", "hover:scale-105 hover:shadow-lg", isActive ? "bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-md" : "text-slate-300 hover:bg-slate-700/50 hover:text-white", isCollapsed && isDesktop && "md:justify-center md:px-2")}>
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {(!isCollapsed || !isDesktop) && <span>{item.label}</span>}
                </button>
              </li>;
          })}
        </ul>
      </nav>

      {/* 版权信息 */}
      <div className={cn("p-4 border-t border-slate-700/50", isCollapsed && isDesktop && "md:p-2")}>
        {!isCollapsed || !isDesktop ? <p className="text-xs text-slate-500 text-center">
            © <span className="text-red-400">sut</span>·code2501
          </p> : <Copyright className="w-4 h-4 text-slate-500 mx-auto" />}
      </div>

      {/* 折叠按钮 - 仅桌面端显示 */}
      {isDesktop && <button onClick={toggleCollapsed} className={cn("absolute top-1/2 -right-3 transform -translate-y-1/2", "bg-slate-700 hover:from-red-500 hover:to-orange-500 text-white", "rounded-full p-1.5 shadow-lg border border-slate-600", "transition-all duration-200 hover:scale-110")}>
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>}
    </div>
  </>;
}