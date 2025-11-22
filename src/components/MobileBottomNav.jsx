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
  return <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-800/95 backdrop-blur-md border-t border-slate-700/50 z-50 animate-slide-in mobile-safe-area shadow-strong">
      <div className="flex items-center justify-around py-2 px-1">
        {navItems.map(item => {
        const Icon = item.icon;
        const isActive = currentPage === item.id;
        return <button key={item.id} onClick={() => navigateTo({
          pageId: item.pageId,
          params: {}
        })} className={cn("flex flex-col items-center justify-center space-y-1 px-3 py-2 rounded-lg transition-all duration-200 touch-target", "hover:scale-110 button-press", isActive ? "text-red-500 bg-red-500/10" : "text-slate-400 hover:text-white hover:bg-slate-700/50")}>
            <Icon className="w-5 h-5" />
            <span className="text-xs font-medium">{item.label}</span>
          </button>;
      })}
      </div>
    </div>;
}