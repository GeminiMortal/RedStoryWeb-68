// @ts-ignore;
import React, { createContext, useContext, useState, useEffect } from 'react';

// 创建全局状态上下文
const GlobalStateContext = createContext();

// 自定义 Hook 使用全局状态
export const useGlobalState = () => {
  const context = useContext(GlobalStateContext);
  if (!context) {
    throw new Error('useGlobalState must be used within GlobalStateProvider');
  }
  return context;
};

// 全局状态提供者组件
export const GlobalStateProvider = ({
  children
}) => {
  // 侧边栏状态
  const [sidebarState, setSidebarState] = useState({
    isCollapsed: false,
    isDesktop: true,
    isOpen: false
  });

  // 加载状态
  const [globalLoading, setGlobalLoading] = useState(false);

  // 用户状态
  const [user, setUser] = useState(null);

  // 响应式处理
  useEffect(() => {
    const handleResize = () => {
      const isDesktop = window.innerWidth >= 768;
      setSidebarState(prev => ({
        ...prev,
        isDesktop,
        isOpen: isDesktop ? prev.isOpen : false
      }));
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 移动端手势处理
  useEffect(() => {
    let touchStartX = 0;
    let touchEndX = 0;
    const handleTouchStart = e => {
      touchStartX = e.changedTouches[0].screenX;
    };
    const handleTouchEnd = e => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    };
    const handleSwipe = () => {
      if (!sidebarState.isDesktop) {
        const swipeDistance = touchEndX - touchStartX;
        if (swipeDistance > 50) {
          // 右滑打开侧边栏
          setSidebarState(prev => ({
            ...prev,
            isOpen: true
          }));
        } else if (swipeDistance < -50) {
          // 左滑关闭侧边栏
          setSidebarState(prev => ({
            ...prev,
            isOpen: false
          }));
        }
      }
    };
    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchend', handleTouchEnd);
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [sidebarState.isDesktop]);
  const value = {
    sidebarState,
    setSidebarState,
    globalLoading,
    setGlobalLoading,
    user,
    setUser
  };
  return <GlobalStateContext.Provider value={value}>
      {children}
    </GlobalStateContext.Provider>;
};