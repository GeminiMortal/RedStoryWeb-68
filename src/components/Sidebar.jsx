// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Home, BookOpen, Settings, Copyright, ChevronLeft, ChevronRight } from 'lucide-react';
// @ts-ignore;
import { cn } from '@/lib/utils';

export function Sidebar({
  currentPage,
  navigateTo
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navItems = [{
    id: 'index',
    label: '主页',
    icon: Home,
    pageId: 'index'
  }, {
    id: 'stories',
    label: '红色故事',
    icon: BookOpen,
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
  return <div className={cn("fixed left-0 top-0 h-full bg-gray-800 border-r border-gray-700 flex flex-col transition-all duration-300 ease-in-out", isCollapsed ? "w-16" : "w-64")}>
      {/* Logo/标题 */}
      <div className={cn("p-6 border-b border-gray-700", isCollapsed && "p-3")}>
        {!isCollapsed && <h1 className="text-xl font-bold text-white">红色故事</h1>}
        {isCollapsed && <BookOpen className="w-6 h-6 text-white mx-auto" />}
      </div>

      {/* 导航菜单 */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return <li key={item.id}>
                <button onClick={() => navigateTo({
              pageId: item.pageId,
              params: {}
            })} className={cn("w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors", isActive ? "bg-red-600 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white", isCollapsed && "justify-center px-2")}>
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && <span>{item.label}</span>}
                </button>
              </li>;
        })}
        </ul>
      </nav>

      {/* 版权信息 */}
      <div className={cn("p-4 border-t border-gray-700", isCollapsed && "p-2")}>
        {!isCollapsed && <p className="text-xs text-gray-500 text-center">© sut·code2501</p>}
        {isCollapsed && <Copyright className="w-4 h-4 text-gray-500 mx-auto" />}
      </div>

      {/* 折叠按钮 */}
      <button onClick={toggleSidebar} className="absolute top-1/2 -right-3 transform -translate-y-1/2 bg-gray-700 hover:bg-gray-600 text-white rounded-full p-1 shadow-lg border border-gray-600 transition-colors">
        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </div>;
}