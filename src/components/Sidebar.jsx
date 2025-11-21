// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Button } from '@/components/ui';
// @ts-ignore;
import { Home, PlusCircle, Shield, LogOut, Menu, X } from 'lucide-react';
// @ts-ignore;
import { cn } from '@/lib/utils';

// @ts-ignore;
import { useSidebar } from './SidebarStore';
const menuItems = [{
  id: 'index',
  label: '首页',
  icon: Home
}, {
  id: 'upload',
  label: '新建故事',
  icon: PlusCircle
}, {
  id: 'admin',
  label: '管理后台',
  icon: Shield
}];
export function Sidebar({
  currentPage = 'index',
  navigateTo
}) {
  const {
    isOpen,
    isCollapsed,
    isDesktop,
    toggleSidebar,
    collapseSidebar,
    expandSidebar
  } = useSidebar() || {};
  const handleNavigation = pageId => {
    if (typeof navigateTo === 'function') {
      navigateTo({
        pageId,
        params: {}
      });
    }
  };
  const handleLogout = () => {
    // 这里可以添加登出逻辑
    console.log('Logout clicked');
  };

  // 移动端侧边栏
  if (!isDesktop) {
    return <>
        {/* 移动端遮罩层 */}
        {isOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={toggleSidebar} />}
        
        {/* 移动端侧边栏 */}
        <div className={cn("fixed inset-y-0 left-0 z-50 w-64 bg-slate-800 border-r border-slate-700", "transform transition-transform duration-300 ease-in-out lg:hidden", isOpen ? "translate-x-0" : "-translate-x-full")}>
          <div className="flex items-center justify-between p-4 border-b border-slate-700">
            <h2 className="text-white font-bold">菜单</h2>
            <Button variant="ghost" size="sm" onClick={toggleSidebar} className="text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </Button>
          </div>
          
          <nav className="p-4 space-y-2">
            {menuItems.map(item => {
            const Icon = item.icon;
            return <Button key={item.id} variant={currentPage === item.id ? "secondary" : "ghost"} className={cn("w-full justify-start text-left", currentPage === item.id ? "bg-red-500/20 text-red-400" : "text-slate-300 hover:text-white hover:bg-slate-700")} onClick={() => {
              handleNavigation(item.id);
              toggleSidebar?.();
            }}>
                  <Icon className="w-4 h-4 mr-3" />
                  {item.label}
                </Button>;
          })}
            
            <Button variant="ghost" className="w-full justify-start text-left text-slate-300 hover:text-white hover:bg-slate-700" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-3" />
              退出登录
            </Button>
          </nav>
        </div>
      </>;
  }

  // 桌面端侧边栏
  return <div className={cn("fixed left-0 top-0 h-full bg-slate-800 border-r border-slate-700", "transition-all duration-300 ease-in-out z-30", isCollapsed ? "w-16" : "w-64")}>
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        {!isCollapsed && <h2 className="text-white font-bold">红色故事</h2>}
        <Button variant="ghost" size="sm" onClick={isCollapsed ? expandSidebar : collapseSidebar} className="text-slate-400 hover:text-white">
          <Menu className="w-5 h-5" />
        </Button>
      </div>
      
      <nav className="p-4 space-y-2">
        {menuItems.map(item => {
        const Icon = item.icon;
        return <Button key={item.id} variant={currentPage === item.id ? "secondary" : "ghost"} className={cn("w-full justify-start text-left", currentPage === item.id ? "bg-red-500/20 text-red-400" : "text-slate-300 hover:text-white hover:bg-slate-700", isCollapsed && "justify-center px-2")} onClick={() => handleNavigation(item.id)} title={isCollapsed ? item.label : ''}>
              <Icon className={cn("w-4 h-4", !isCollapsed && "mr-3")} />
              {!isCollapsed && item.label}
            </Button>;
      })}
        
        <Button variant="ghost" className={cn("w-full justify-start text-left text-slate-300 hover:text-white hover:bg-slate-700", isCollapsed && "justify-center px-2")} onClick={handleLogout} title={isCollapsed ? '退出登录' : ''}>
          <LogOut className={cn("w-4 h-4", !isCollapsed && "mr-3")} />
          {!isCollapsed && '退出登录'}
        </Button>
      </nav>
    </div>;
}