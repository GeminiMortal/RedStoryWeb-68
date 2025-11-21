// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Home, BookOpen, Settings, PlusCircle } from 'lucide-react';
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
    id: 'upload',
    label: '新建',
    icon: PlusCircle,
    pageId: 'upload'
  }, {
    id: 'admin',
    label: '管理',
    icon: Settings,
    pageId: 'admin'
  }];
  return <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-800/95 backdrop-blur-md border-t border-slate-700 z-50">
      <div className="flex items-center justify-around py-2">
        {navItems.map(item => {
        const Icon = item.icon;
        const isActive = currentPage === item.id;
        return <button key={item.id} onClick={() => navigateTo({
          pageId: item.pageId,
          params: {}
        })} className={cn("flex flex-col items-center justify-center space-y-1 px-3 py-2 rounded-lg transition-all duration-200", "hover:scale-110", isActive ? "text-red-500" : "text-slate-400 hover:text-white")}>
            <Icon className="w-5 h-5" />
            <span className="text-xs font-medium">{item.label}</span>
          </button>;
      })}
      </div>
    </div>;
}