// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Button } from '@/components/ui';
// @ts-ignore;
import { ArrowLeft, Home, BookOpen, Users, Settings, ChevronRight } from 'lucide-react';

// 面包屑导航组件
export function BreadcrumbNav({
  items,
  className = ''
}) {
  return <div className={`flex items-center space-x-2 text-sm ${className}`}>
      {items.map((item, index) => <React.Fragment key={index}>
          {index > 0 && <ChevronRight className="w-4 h-4 text-gray-500" />}
          {item.href ? <button onClick={item.onClick} className="text-gray-300 hover:text-white transition-colors">
              {item.label}
            </button> : <span className="text-gray-500">{item.label}</span>}
        </React.Fragment>)}
    </div>;
}

// 页面头部导航组件
export function PageHeader({
  title,
  showBack = true,
  backAction,
  breadcrumbs,
  actions,
  className = ''
}) {
  return <header className={`bg-black/50 backdrop-blur-sm border-b border-gray-800 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* 面包屑导航 */}
        {breadcrumbs && <div className="mb-3">
            <BreadcrumbNav items={breadcrumbs} />
          </div>}
        
        {/* 主要导航 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {showBack && <Button onClick={backAction} variant="ghost" className="text-gray-300 hover:text-white">
                <ArrowLeft className="w-5 h-5 mr-2" />
                返回
              </Button>}
            <h1 className="text-2xl font-bold text-red-600">{title}</h1>
          </div>
          
          {/* 右侧操作按钮 */}
          {actions && <div className="flex items-center space-x-2">
              {actions.map((action, index) => <Button key={index} onClick={action.onClick} variant={action.variant || 'ghost'} className={action.className}>
                  {action.icon && <action.icon className="w-5 h-5 mr-2" />}
                  {action.label}
                </Button>)}
            </div>}
        </div>
      </div>
    </header>;
}

// 底部导航组件
export function BottomNav({
  currentPage,
  navigateTo
}) {
  const navItems = [{
    id: 'home',
    label: '首页',
    icon: Home,
    pageId: 'index'
  }, {
    id: 'stories',
    label: '红色故事',
    icon: BookOpen,
    pageId: 'index'
  }, {
    id: 'about',
    label: '关于我们',
    icon: Users,
    pageId: 'index'
  }, {
    id: 'admin',
    label: '管理',
    icon: Settings,
    pageId: 'admin'
  }];
  return <nav className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-sm border-t border-gray-800 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-around items-center py-2">
          {navItems.map(item => {
          const isActive = currentPage === item.id;
          return <button key={item.id} onClick={() => navigateTo({
            pageId: item.pageId,
            params: {}
          })} className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${isActive ? 'text-red-500' : 'text-gray-400 hover:text-white'}`}>
                <item.icon className="w-5 h-5 mb-1" />
                <span className="text-xs">{item.label}</span>
              </button>;
        })}
        </div>
      </div>
    </nav>;
}

// 快速导航组件
export function QuickNav({
  navigateTo,
  className = ''
}) {
  const quickActions = [{
    label: '浏览故事',
    icon: BookOpen,
    action: () => navigateTo({
      pageId: 'index',
      params: {}
    }),
    variant: 'default',
    className: 'bg-red-600 hover:bg-red-700 text-white'
  }, {
    label: '上传故事',
    icon: BookOpen,
    action: () => navigateTo({
      pageId: 'upload',
      params: {}
    }),
    variant: 'outline',
    className: 'border-gray-600 text-gray-300 hover:bg-gray-800'
  }, {
    label: '管理后台',
    icon: Settings,
    action: () => navigateTo({
      pageId: 'admin',
      params: {}
    }),
    variant: 'outline',
    className: 'border-gray-600 text-gray-300 hover:bg-gray-800'
  }];
  return <div className={`flex flex-wrap gap-3 ${className}`}>
      {quickActions.map((action, index) => <Button key={index} onClick={action.action} variant={action.variant} className={action.className}>
          <action.icon className="w-4 h-4 mr-2" />
          {action.label}
        </Button>)}
    </div>;
}