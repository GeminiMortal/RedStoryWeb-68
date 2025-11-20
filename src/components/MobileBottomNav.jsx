// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Home, BookOpen, Settings, Plus } from 'lucide-react';
// @ts-ignore;
import { cn } from '@/lib/utils';

export function MobileBottomNav({
  currentPage,
  navigateTo
}) {
  const navItems = [{
    id: 'index',
    label: '首页',
    icon: Home,
    pageId: 'index'
  }, {
    id: 'stories',
    label: '故事',
    icon: BookOpen,
    pageId: 'index'
  }, {
    id: 'admin',
    label: '管理',
    icon: Settings,
    pageId: 'admin'
  }];
  return <div className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700">
      <div className="flex justify-around items-center py-2">
        {navItems.map(item => {
        const Icon = item.icon;
        const isActive = currentPage === item.id;
        return <button key={item.id} onClick={() => navigateTo({
          pageId: item.pageId,
          params: {}
        })} className={cn("flex flex-col items-center p-2 rounded-lg transition-colors", isActive ? "text-red-500" : "text-gray-400 hover:text-white")}>
            <Icon className="w-5 h-5 mb-1" />
            <span className="text-xs">{item.label}</span>
          </button>;
      })}
        
        <button onClick={() => navigateTo({
        pageId: 'upload',
        params: {}
      })} className="flex flex-col items-center p-2 rounded-lg bg-red-600 text-white">
          <Plus className="w-5 h-5 mb-1" />
          <span className="text-xs">新建</span>
        </button>
      </div>
    </div>;
}