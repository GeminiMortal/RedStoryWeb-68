// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Home, BookOpen, Settings, PlusCircle } from 'lucide-react';
// @ts-ignore;
import { cn } from '@/lib/utils';

export function Navigation({
  currentPage,
  navigateTo,
  className
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
  return <nav className={cn("flex items-center space-x-1", className)}>
      {navItems.map(item => {
      const Icon = item.icon;
      const isActive = currentPage === item.id;
      return <button key={item.id} onClick={() => navigateTo({
        pageId: item.pageId,
        params: {}
      })} className={cn("flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300", "hover:scale-105 hover:shadow-lg button-press", "mobile-touch-target", isActive ? "bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-md shadow-red-500/25" : "text-slate-300 hover:bg-slate-700/50 hover:text-white hover-lift")}>
            <Icon className={cn("w-4 h-4 transition-transform duration-200", isActive && "animate-pulse")} />
            <span>{item.label}</span>
          </button>;
    })}
    </nav>;
}