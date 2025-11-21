// @ts-ignore;
import React, { createContext, useContext, useState, useEffect } from 'react';

// 创建 Context
const SidebarContext = createContext({
  isOpen: false,
  isCollapsed: false,
  isDesktop: false,
  toggleSidebar: () => {},
  openSidebar: () => {},
  closeSidebar: () => {},
  collapseSidebar: () => {},
  expandSidebar: () => {},
  setDesktop: () => {},
  handleResize: () => {}
});

// 自定义 Hook
export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}

// Provider 组件
export function SidebarProvider({
  children
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDesktop, setIsDesktop] = useState(typeof window !== 'undefined' ? window.innerWidth >= 1024 : false);

  // 从 localStorage 加载状态
  useEffect(() => {
    try {
      const saved = localStorage.getItem('sidebar-state');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.isCollapsed !== undefined) {
          setIsCollapsed(parsed.isCollapsed);
        }
      }
    } catch (error) {
      console.error('Failed to load sidebar state:', error);
    }
  }, []);

  // 保存状态到 localStorage
  useEffect(() => {
    try {
      localStorage.setItem('sidebar-state', JSON.stringify({
        isCollapsed
      }));
    } catch (error) {
      console.error('Failed to save sidebar state:', error);
    }
  }, [isCollapsed]);

  // 响应式处理
  const handleResize = () => {
    if (typeof window !== 'undefined') {
      const newIsDesktop = window.innerWidth >= 1024;
      setIsDesktop(newIsDesktop);
      setIsOpen(false); // 窗口大小变化时关闭移动端菜单
      if (!newIsDesktop) {
        setIsCollapsed(false); // 移动端不折叠
      }
    }
  };
  useEffect(() => {
    if (typeof window === 'undefined') return;
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const toggleSidebar = () => setIsOpen(prev => !prev);
  const openSidebar = () => setIsOpen(true);
  const closeSidebar = () => setIsOpen(false);
  const collapseSidebar = () => setIsCollapsed(true);
  const expandSidebar = () => setIsCollapsed(false);
  const value = {
    isOpen,
    isCollapsed,
    isDesktop,
    toggleSidebar,
    openSidebar,
    closeSidebar,
    collapseSidebar,
    expandSidebar,
    setDesktop,
    handleResize
  };
  return <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>;
}