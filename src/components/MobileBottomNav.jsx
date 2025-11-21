// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Button } from '@/components/ui';
// @ts-ignore;
import { Home, PlusCircle, Shield } from 'lucide-react';
// @ts-ignore;
import { cn } from '@/lib/utils';

const navItems = [{
  id: 'index',
  label: '首页',
  icon: Home
}, {
  id: 'upload',
  label: '新建',
  icon: PlusCircle
}, {
  id: 'admin',
  label: '管理',
  icon: Shield
}];
export function MobileBottomNav({
  currentPage = 'index',
  navigateTo
}) {
  if (typeof navigateTo !== 'function') {
    return null;
  }
  const handleNavigation = pageId => {
    navigateTo({
      pageId,
      params: {}
    });
  };
  return <div className="fixed bottom-0 left-0 right-0 bg-slate-800 border-t border-slate-700 lg:hidden z-40">
      <div className="flex items-center justify-around py-2">
        {navItems.map(item => {
        const Icon = item.icon;
        const isActive = currentPage === item.id;
        return <Button key={item.id} variant="ghost" size="sm" className={cn("flex flex-col items-center space-y-1 py-2 px-3", isActive ? "text-red-400" : "text-slate-400 hover:text-white")} onClick={() => handleNavigation(item.id)}>
              <Icon className="w-5 h-5" />
              <span className="text-xs">{item.label}</span>
            </Button>;
      })}
      </div>
    </div>;
}