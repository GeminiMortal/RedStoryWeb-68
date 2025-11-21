// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { cn } from '@/lib/utils';
// @ts-ignore;
import { LayoutDashboard, Users, FileText, Settings, LogOut } from 'lucide-react';

const menuItems = [{
  id: 'dashboard',
  label: '仪表板',
  icon: LayoutDashboard
}, {
  id: 'users',
  label: '用户管理',
  icon: Users
}, {
  id: 'content',
  label: '内容管理',
  icon: FileText
}, {
  id: 'settings',
  label: '系统设置',
  icon: Settings
}];
export function Sidebar({
  activeTab,
  onTabChange
}) {
  return <div className="w-64 bg-gray-900 text-white h-full flex flex-col">
      <div className="p-6">
        <h1 className="text-xl font-bold">管理后台</h1>
      </div>
      
      <nav className="flex-1 px-4">
        <ul className="space-y-2">
          {menuItems.map(item => {
          const Icon = item.icon;
          return <li key={item.id}>
                <button onClick={() => onTabChange(item.id)} className={cn("w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors", activeTab === item.id ? "bg-blue-600 text-white" : "text-gray-300 hover:bg-gray-800 hover:text-white")}>
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              </li>;
        })}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-gray-800">
        <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white">
          <LogOut className="w-5 h-5" />
          <span>退出登录</span>
        </button>
      </div>
    </div>;
}