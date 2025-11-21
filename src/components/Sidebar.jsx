// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button } from '@/components/ui';
// @ts-ignore;
import { Home, BookOpen, PlusCircle, Settings, User, Menu, X, LogOut, FileText, Eye } from 'lucide-react';
// @ts-ignore;
import { cn } from '@/lib/utils';

const navigationItems = [{
  id: 'index',
  label: '首页',
  icon: Home,
  path: 'index'
}, {
  id: 'stories',
  label: '故事列表',
  icon: BookOpen,
  path: 'index'
}, {
  id: 'upload',
  label: '创作故事',
  icon: PlusCircle,
  path: 'upload'
}, {
  id: 'admin',
  label: '管理中心',
  icon: Settings,
  path: 'admin'
}, {
  id: 'profile',
  label: '个人中心',
  icon: User,
  path: 'profile'
}];
export function Sidebar({
  currentPage,
  navigateTo,
  onStateChange
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);

  // 响应式处理
  useEffect(() => {
    const handleResize = () => {
      const isDesktopView = window.innerWidth >= 768;
      setIsDesktop(isDesktopView);
      setIsMobileOpen(false);
      if (onStateChange) {
        onStateChange({
          isCollapsed,
          isDesktop: isDesktopView
        });
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isCollapsed, onStateChange]);

  // 处理导航
  const handleNavigate = pageId => {
    navigateTo({
      pageId
    });
    if (!isDesktop) {
      setIsMobileOpen(false);
    }
  };

  // 移动端遮罩层
  const MobileOverlay = () => <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsMobileOpen(false)} />;

  // 侧边栏内容
  const SidebarContent = () => <div className={cn("flex flex-col h-full bg-slate-800/95 backdrop-blur-sm border-r border-slate-700", isCollapsed && isDesktop ? "w-16" : "w-64")}>
      {/* Logo/标题 */}
      <div className={cn("flex items-center justify-between p-4 border-b border-slate-700", isCollapsed && isDesktop && "justify-center")}>
        {!isCollapsed || !isDesktop ? <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-lg">红色故事</span>
          </div> : <BookOpen className="w-6 h-6 text-red-500" />}
        
        {isDesktop && <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white p-1" onClick={() => setIsCollapsed(!isCollapsed)}>
            {isCollapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
          </Button>}
      </div>

      {/* 导航菜单 */}
      <nav className="flex-1 py-4">
        {navigationItems.map(item => {
        const Icon = item.icon;
        const isActive = currentPage === item.id;
        return <Button key={item.id} variant="ghost" className={cn("w-full flex items-center justify-start px-4 py-3 text-sm font-medium transition-colors duration-200", isCollapsed && isDesktop ? "justify-center px-2" : "justify-start", isActive ? "bg-red-500/20 text-red-400 border-r-2 border-red-500" : "text-slate-300 hover:bg-slate-700/50 hover:text-white")} onClick={() => handleNavigate(item.path)}>
              <Icon className={cn("w-5 h-5", !isCollapsed || !isDesktop ? "mr-3" : "")} />
              {(!isCollapsed || !isDesktop) && <span>{item.label}</span>}
            </Button>;
      })}
      </nav>

      {/* 底部操作 */}
      <div className="border-t border-slate-700 p-4">
        <Button variant="ghost" className={cn("w-full flex items-center justify-start text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-700/50", isCollapsed && isDesktop ? "justify-center px-2" : "justify-start")} onClick={() => {
        // 退出登录逻辑
        console.log('退出登录');
      }}>
          <LogOut className={cn("w-5 h-5", !isCollapsed || !isDesktop ? "mr-3" : "")} />
          {(!isCollapsed || !isDesktop) && <span>退出登录</span>}
        </Button>
      </div>
    </div>;
  return <>
      {/* 移动端 */}
      {!isDesktop && <>
          {/* 移动端菜单按钮 */}
          <Button variant="ghost" size="sm" className="fixed top-4 left-4 z-50 bg-slate-800/90 backdrop-blur-sm border border-slate-700" onClick={() => setIsMobileOpen(!isMobileOpen)}>
            <Menu className="w-5 h-5" />
          </Button>

          {/* 移动端侧边栏 */}
          {isMobileOpen && <MobileOverlay />}
          <div className={cn("fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out md:hidden", isMobileOpen ? "translate-x-0" : "-translate-x-full")}>
            <SidebarContent />
          </div>
        </>}

      {/* 桌面端 */}
      {isDesktop && <div className={cn("fixed inset-y-0 left-0 z-40 transition-all duration-300 ease-in-out", isCollapsed ? "w-16" : "w-64")}>
          <SidebarContent />
        </div>}
    </>;
}