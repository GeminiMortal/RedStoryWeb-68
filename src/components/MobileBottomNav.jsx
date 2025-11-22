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
  const [navigating, setNavigating] = useState(false);
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

  // 优化的导航函数
  const handleNavigate = async pageId => {
    if (navigating) return;
    try {
      setNavigating(true);
      // 添加短暂延迟以提供视觉反馈
      await new Promise(resolve => setTimeout(resolve, 100));
      navigateTo({
        pageId,
        params: {}
      });
    } catch (error) {
      console.error('导航失败:', error);
    } finally {
      setNavigating(false);
    }
  };
  return <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 animate-slide-up mobile-safe-area">
      {/* 背景遮罩 */}
      <div className="absolute inset-0 bg-slate-800/95 backdrop-blur-md border-t border-slate-700/50 shadow-2xl"></div>
      
      {/* 导航内容 */}
      <div className="relative flex items-center justify-around py-2 px-4">
        {navItems.map((item, index) => {
        const Icon = item.icon;
        const isActive = currentPage === item.id;
        return <button key={item.id} onClick={() => handleNavigate(item.pageId)} disabled={navigating} className={cn("flex flex-col items-center justify-center space-y-1 px-4 py-2 rounded-xl transition-all duration-300", "mobile-touch-target button-press animate-fade-in", "hover:scale-110 hover-lift", isActive ? "text-red-500 bg-red-500/10 shadow-glow" : "text-slate-400 hover:text-white hover:bg-slate-700/50", navigating && "opacity-50 cursor-not-allowed")} style={{
          animationDelay: `${index * 100}ms`
        }}>
            <Icon className={cn("w-5 h-5 transition-all duration-200", isActive && "animate-pulse")} />
            <span className="text-xs font-medium">{item.label}</span>
            
            {/* 活跃状态指示器 */}
            {isActive && <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-red-500 rounded-full animate-bounce-in"></div>}
          </button>;
      })}
      </div>
      
      {/* 安全区域指示器 */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-red-500/50 to-transparent rounded-full"></div>
    </div>;
}