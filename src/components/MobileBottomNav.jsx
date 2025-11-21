// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Button } from '@/components/ui';
// @ts-ignore;
import { Home, BookOpen, PlusCircle, Settings, User } from 'lucide-react';
// @ts-ignore;
import { cn } from '@/lib/utils';

// @ts-ignore;
import { useGlobalState } from './GlobalStateProvider';
export function MobileBottomNav({
  currentPage,
  navigateTo
}) {
  const {
    sidebarState,
    setSidebarState
  } = useGlobalState();
  const navItems = [{
    id: 'index',
    label: '首页',
    icon: Home
  }, {
    id: 'stories',
    label: '故事',
    icon: BookOpen
  }, {
    id: 'upload',
    label: '创作',
    icon: PlusCircle
  }, {
    id: 'admin',
    label: '管理',
    icon: Settings
  }, {
    id: 'profile',
    label: '我的',
    icon: User
  }];
  const handleNavClick = pageId => {
    // 如果侧边栏打开，先关闭它
    if (!sidebarState.isDesktop && sidebarState.isOpen) {
      setSidebarState(prev => ({
        ...prev,
        isOpen: false
      }));
    }
    navigateTo({
      pageId
    });
  };
  return <div className={cn("fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-sm border-t border-slate-700 z-50 md:hidden", sidebarState.isOpen && "hidden")}>
      <div className="flex items-center justify-around py-2">
        {navItems.map(item => {
        const Icon = item.icon;
        const isActive = currentPage === item.id;
        return <Button key={item.id} onClick={() => handleNavClick(item.id)} variant="ghost" className={cn("flex flex-col items-center justify-center p-2 h-16 w-16", isActive ? "text-red-500" : "text-slate-400 hover:text-white")}>
            <Icon className="w-5 h-5 mb-1" />
            <span className="text-xs">{item.label}</span>
          </Button>;
      })}
      </div>
    </div>;
}