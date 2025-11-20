// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Home, BookOpen, Settings, Copyright } from 'lucide-react';
// @ts-ignore;
import { cn } from '@/lib/utils';

export function Sidebar({
  currentPage,
  navigateTo
}) {
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
  return <div className="fixed left-0 top-0 h-full w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
      {/* Logo/标题 */}
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-xl font-bold text-white">红色故事</h1>
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
            })} className={cn("w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors", isActive ? "bg-red-600 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white")}>
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              </li>;
        })}
        </ul>
      </nav>

      {/* 版权信息 */}
      <div className="p-4 border-t border-gray-700">
        <p className="text-xs text-gray-500 text-center">
          © sut·code2501
        </p>
      </div>
    </div>;
}