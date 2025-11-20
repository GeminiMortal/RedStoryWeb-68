// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Home, BookOpen } from 'lucide-react';

// 页面头部组件
export function PageHeader({
  title,
  showBack = false,
  onBack
}) {
  return <header className="bg-gray-800/80 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {showBack && <button onClick={onBack} className="p-2 text-gray-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>}
            <h1 className="text-xl font-bold text-white">{title}</h1>
          </div>
        </div>
      </div>
    </header>;
}

// 底部导航组件（仅保留首页和红色故事）
export function BottomNav({
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
    label: '红色故事',
    icon: BookOpen,
    pageId: 'index' // 跳转到首页的故事列表
  }];
  return <nav className="fixed bottom-0 left-0 right-0 bg-gray-800/90 backdrop-blur-sm border-t border-gray-700">
      <div className="max-w-md mx-auto">
        <div className="flex justify-around py-2">
          {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentPage === item.id || currentPage === 'detail' && item.id === 'stories';
          return <button key={item.id} onClick={() => navigateTo({
            pageId: item.pageId,
            params: {}
          })} className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${isActive ? 'text-red-400' : 'text-gray-400 hover:text-white'}`}>
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-xs">{item.label}</span>
            </button>;
        })}
        </div>
      </div>
    </nav>;
}