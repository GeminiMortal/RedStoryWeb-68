// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button } from '@/components/ui';
// @ts-ignore;
import { Home, BookOpen, Plus, User, Settings, Search, Heart, Menu, X, ChevronUp, ChevronDown } from 'lucide-react';
// @ts-ignore;
import { cn } from '@/lib/utils';

// 移动端底部导航栏组件
export function MobileBottomNavigation({
  currentPage = 'index',
  navigateTo,
  className
}) {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // 监听滚动方向，自动隐藏/显示导航栏
  useEffect(() => {
    const controlNavbar = () => {
      const currentScrollY = window.scrollY;

      // 向下滚动时隐藏，向上滚动时显示
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };
    window.addEventListener('scroll', controlNavbar, {
      passive: true
    });
    return () => window.removeEventListener('scroll', controlNavbar);
  }, [lastScrollY]);
  const navItems = [{
    id: 'index',
    label: '首页',
    icon: Home,
    onClick: () => navigateTo({
      pageId: 'index',
      params: {}
    })
  }, {
    id: 'search',
    label: '搜索',
    icon: Search,
    onClick: () => {
      // 可以添加搜索页面或搜索功能
      console.log('搜索功能待实现');
    }
  }, {
    id: 'upload',
    label: '创建',
    icon: Plus,
    onClick: () => navigateTo({
      pageId: 'upload',
      params: {}
    }),
    isPrimary: true
  }, {
    id: 'favorites',
    label: '收藏',
    icon: Heart,
    onClick: () => {
      // 可以添加收藏页面
      console.log('收藏功能待实现');
    }
  }, {
    id: 'profile',
    label: '我的',
    icon: User,
    onClick: () => navigateTo({
      pageId: 'profile',
      params: {}
    })
  }];
  return <nav className={cn("fixed bottom-0 left-0 right-0 z-40 safe-area-bottom mobile-nav transition-transform duration-300", isVisible ? "translate-y-0" : "translate-y-full", className)}>
      <div className="bg-slate-800/95 backdrop-blur-strong border-t border-slate-700/50 px-2 py-2">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          const isPrimary = item.isPrimary;
          return <Button key={item.id} onClick={item.onClick} variant="ghost" className={cn("flex flex-col items-center justify-center p-2 min-w-0 flex-1 touch-target transition-all duration-200", "hover:bg-slate-700/50 active:scale-95", isActive ? "text-red-400" : "text-slate-400", isPrimary && "bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white shadow-lg hover:shadow-red-500/25 transform hover:scale-105")}>
                <Icon className={cn("w-5 h-5 mb-1", isPrimary && "w-6 h-6")} />
                <span className={cn("text-xs font-medium", isPrimary && "text-white")}>
                  {item.label}
                </span>
                
                {/* 活跃状态指示器 */}
                {isActive && !isPrimary && <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-red-400 rounded-full"></div>}
              </Button>;
        })}
        </div>
      </div>
    </nav>;
}

// 移动端顶部导航栏组件
export function MobileTopNavigation({
  title,
  showBack = false,
  showSearch = false,
  showMenu = false,
  onBack,
  onSearch,
  onMenu,
  className
}) {
  return <header className={cn("fixed top-0 left-0 right-0 z-40 safe-area-top mobile-nav transition-all duration-300", className)}>
      <div className="bg-slate-800/95 backdrop-blur-strong border-b border-slate-700/50 px-4 py-3">
        <div className="flex items-center justify-between max-w-md mx-auto">
          {/* 左侧 */}
          <div className="flex items-center space-x-3">
            {showBack && <Button onClick={onBack} variant="ghost" size="sm" className="p-2 text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all duration-200 button-press">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Button>}
            {title && <h1 className="text-lg font-semibold text-white truncate max-w-48">
                {title}
              </h1>}
          </div>
          
          {/* 右侧 */}
          <div className="flex items-center space-x-2">
            {showSearch && <Button onClick={onSearch} variant="ghost" size="sm" className="p-2 text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all duration-200 button-press">
                <Search className="w-5 h-5" />
              </Button>}
            {showMenu && <Button onClick={onMenu} variant="ghost" size="sm" className="p-2 text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all duration-200 button-press">
                <Settings className="w-5 h-5" />
              </Button>}
          </div>
        </div>
      </div>
    </header>;
}

// 移动端搜索栏组件
export function MobileSearchBar({
  value,
  onChange,
  onSubmit,
  onClose,
  placeholder = "搜索故事...",
  className
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  useEffect(() => {
    setIsExpanded(true);
  }, []);
  const handleSubmit = e => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(value);
    }
  };
  const handleClose = () => {
    setIsExpanded(false);
    setTimeout(() => {
      if (onClose) {
        onClose();
      }
    }, 300);
  };
  return <div className={cn("fixed top-0 left-0 right-0 z-50 safe-area-top bg-slate-800/95 backdrop-blur-strong border-b border-slate-700/50 transition-all duration-300", isExpanded ? "translate-y-0" : "-translate-y-full", className)}>
      <div className="px-4 py-3">
        <form onSubmit={handleSubmit} className="flex items-center space-x-3 max-w-md mx-auto">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} autoFocus className="w-full pl-10 pr-4 py-2.5 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-300 mobile-input" />
          </div>
          <Button type="button" onClick={handleClose} variant="ghost" size="sm" className="p-2 text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all duration-200 button-press">
            <X className="w-5 h-5" />
          </Button>
        </form>
      </div>
    </div>;
}

// 移动端抽屉菜单组件
export function MobileDrawer({
  isOpen,
  onClose,
  title,
  children,
  className
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);
  return <div className={cn("fixed inset-0 z-50", isOpen ? "visible" : "invisible")}>
      {/* 背景遮罩 */}
      <div className={cn("absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300", isOpen ? "opacity-100" : "opacity-0")} onClick={onClose}></div>
      
      {/* 抽屉内容 */}
      <div className={cn("absolute bottom-0 left-0 right-0 bg-slate-800/95 backdrop-blur-strong border-t border-slate-700/50 rounded-t-2xl mobile-modal transition-transform duration-300", isOpen ? "translate-y-0" : "translate-y-full", className)}>
        {/* 拖拽指示器 */}
        <div className="flex justify-center py-3">
          <div className="w-12 h-1 bg-slate-600 rounded-full"></div>
        </div>
        
        {/* 标题栏 */}
        {title && <div className="px-6 py-4 border-b border-slate-700/50">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">
                {title}
              </h2>
              <Button onClick={onClose} variant="ghost" size="sm" className="p-2 text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all duration-200 button-press">
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>}
        
        {/* 内容区域 */}
        <div className="px-6 py-4 max-h-96 overflow-y-auto mobile-scroll">
          {children}
        </div>
      </div>
    </div>;
}

// 移动端标签栏组件
export function MobileTabBar({
  tabs,
  activeTab,
  onTabChange,
  className
}) {
  return <div className={cn("bg-slate-800/95 backdrop-blur-strong border-t border-slate-700/50 px-4 py-2", className)}>
      <div className="flex space-x-1 max-w-md mx-auto">
        {tabs.map(tab => {
        const isActive = activeTab === tab.id;
        return <Button key={tab.id} onClick={() => onTabChange(tab.id)} variant="ghost" className={cn("flex-1 py-2 px-3 text-sm font-medium transition-all duration-200 rounded-lg", isActive ? "bg-red-500/20 text-red-400" : "text-slate-400 hover:text-white hover:bg-slate-700/50")}>
              {tab.label}
            </Button>;
      })}
      </div>
    </div>;
}

// 移动端浮动操作按钮组件
export function MobileFloatingActionButton({
  icon: Icon,
  onClick,
  position = 'bottom-right',
  size = 'md',
  color = 'red',
  className
}) {
  const positionClasses = {
    'bottom-right': 'bottom-20 right-4',
    'bottom-left': 'bottom-20 left-4',
    'top-right': 'top-20 right-4',
    'top-left': 'top-20 left-4'
  };
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-14 h-14',
    lg: 'w-16 h-16'
  };
  const colorClasses = {
    red: 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600',
    blue: 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600',
    green: 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
  };
  return <Button onClick={onClick} className={cn("fixed z-30 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 button-press", positionClasses[position], sizeClasses[size], colorClasses[color], className)}>
      <Icon className="w-6 h-6 text-white" />
    </Button>;
}

// 移动端页面容器组件
export function MobilePageContainer({
  children,
  showBack = false,
  title,
  onBack,
  className
}) {
  return <div className={cn("min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white", className)}>
      {/* 顶部导航 */}
      <MobileTopNavigation title={title} showBack={showBack} onBack={onBack} />
      
      {/* 主内容 */}
      <main className="pt-16 pb-20 px-4">
        {children}
      </main>
    </div>;
}

// 移动端导航状态管理Hook
export function useMobileNavigation() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const openSearch = () => setIsSearchOpen(true);
  const closeSearch = () => setIsSearchOpen(false);
  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);
  const changeTab = tabId => setActiveTab(tabId);
  return {
    isSearchOpen,
    isDrawerOpen,
    activeTab,
    openSearch,
    closeSearch,
    openDrawer,
    closeDrawer,
    changeTab
  };
}