// @ts-ignore;
import React, { createContext, useContext, useState, useEffect } from 'react';

// 创建上下文
const SidebarContext = createContext({
  isOpen: false,
  isCollapsed: false,
  isDesktop: false,
  toggleSidebar: () => {},
  toggleCollapse: () => {},
  setIsOpen: () => {},
  setIsCollapsed: () => {}
});

// 提供器组件
export const SidebarProvider = ({
  children
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const checkScreenSize = () => {
      const isDesktopScreen = window.innerWidth >= 768;
      setIsDesktop(isDesktopScreen);
      if (isDesktopScreen) {
        setIsOpen(true);
        setIsCollapsed(false);
      } else {
        setIsOpen(false);
        setIsCollapsed(false);
      }
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };
  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };
  return <SidebarContext.Provider value={{
    isOpen,
    isCollapsed,
    isDesktop,
    toggleSidebar,
    toggleCollapse,
    setIsOpen,
    setIsCollapsed
  }}>
      {children}
    </SidebarContext.Provider>;
};

// Hook 使用
export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within SidebarProvider');
  }
  return context;
};

// 默认导出
export default SidebarContext;