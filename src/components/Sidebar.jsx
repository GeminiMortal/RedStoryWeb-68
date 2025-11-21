// @ts-ignore;
import React, { useEffect } from 'react';
// @ts-ignore;
import { Button } from '@/components/ui';
// @ts-ignore;
import { Home, BookOpen, PlusCircle, Settings, User, Menu, X, LogOut } from 'lucide-react';
// @ts-ignore;
import { cn } from '@/lib/utils';

// @ts-ignore;
import { useGlobalState } from './GlobalStateProvider';
export function Sidebar({
  currentPage,
  navigateTo
}) {
  const {
    sidebarState,
    setSidebarState
  } = useGlobalState();
  const menuItems = [{
    id: 'index',
    label: '首页',
    icon: Home
  }, {
    id: 'stories',
    label: '故事列表',
    icon: BookOpen
  }, {
    id: 'upload',
    label: '创作故事',
    icon: PlusCircle
  }, {
    id: 'admin',
    label: '管理中心',
    icon: Settings
  }, {
    id: 'profile',
    label: '个人中心',
    icon: User
  }];
  const toggleSidebar = () => {
    setSidebarState(prev => ({
      ...prev,
      isOpen: !prev.isOpen
    }));
  };
  const handleNavClick = pageId => {
    navigateTo({
      pageId
    });
    if (!sidebarState.isDesktop) {
      setSidebarState(prev => ({
        ...prev,
        isOpen: false
      }));
    }
  };
  const handleOverlayClick = () => {
    if (!sidebarState.isDesktop) {
      setSidebarState(prev => ({
        ...prev,
        isOpen: false
      }));
    }
  };
  return <>
      {/* 移动端遮罩层 */}
      {!sidebarState.isDesktop && sidebarState.isOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={handleOverlayClick} />}
      
      {/* 侧边栏 */}
      <aside className={cn("fixed left-0 top-0 h-full bg-slate-900/95 backdrop-blur-sm border-r border-slate-700 z-50 transition-transform duration-300 ease-in-out", sidebarState.isDesktop ? "translate-x-0" : sidebarState.isOpen ? "translate-x-0" : "-translate-x-full", sidebarState.isCollapsed && sidebarState.isDesktop ? "w-16" : "w-64")}>
        <div className="flex flex-col h-full">
          {/* 侧边栏头部 */}
          <div className="flex items-center justify-between p-4 border-b border-slate-700">
            {!sidebarState.isCollapsed && <h2 className="text-lg font-bold text-white">红色故事</h2>}
            <Button onClick={toggleSidebar} variant="ghost" size="sm" className="text-slate-400 hover:text-white">
              {sidebarState.isOpen || sidebarState.isDesktop ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
          
          {/* 菜单项 */}
          <nav className="flex-1 p-4">
            {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return <Button key={item.id} onClick={() => handleNavClick(item.id)} variant="ghost" className={cn("w-full justify-start mb-2", sidebarState.isCollapsed && "justify-center px-2", isActive ? "bg-red-500/20 text-red-400" : "text-slate-400 hover:text-white")}>
                <Icon className={cn("w-5 h-5", !sidebarState.isCollapsed && "mr-3")} />
                {!sidebarState.isCollapsed && <span>{item.label}</span>}
              </Button>;
          })}
          </nav>
          
          {/* 底部操作 */}
          <div className="p-4 border-t border-slate-700">
            <Button variant="ghost" className={cn("w-full justify-start text-slate-400 hover:text-white", sidebarState.isCollapsed && "justify-center px-2")}>
              <LogOut className={cn("w-5 h-5", !sidebarState.isCollapsed && "mr-3")} />
              {!sidebarState.isCollapsed && <span>退出登录</span>}
            </Button>
          </div>
        </div>
      </aside>
    </>;
}