// @ts-ignore;
import React, { createContext, useContext, useReducer, useEffect } from 'react';

// 创建全局上下文
const SidebarContext = createContext();

// 状态管理 reducer
function sidebarReducer(state, action) {
  switch (action.type) {
    case 'TOGGLE_COLLAPSED':
      const newCollapsed = !state.isCollapsed;
      localStorage.setItem('sidebarCollapsed', String(newCollapsed));
      return {
        ...state,
        isCollapsed: newCollapsed
      };
    case 'SET_COLLAPSED':
      localStorage.setItem('sidebarCollapsed', String(action.payload));
      return {
        ...state,
        isCollapsed: action.payload
      };
    case 'TOGGLE_MOBILE':
      return {
        ...state,
        isMobileOpen: !state.isMobileOpen
      };
    case 'SET_MOBILE':
      return {
        ...state,
        isMobileOpen: action.payload
      };
    case 'SET_DESKTOP':
      return {
        ...state,
        isDesktop: action.payload
      };
    default:
      return state;
  }
}

// 初始状态
const initialState = {
  isCollapsed: false,
  isMobileOpen: false,
  isDesktop: false
};

// 全局状态提供者
export function SidebarProvider({
  children
}) {
  const [state, dispatch] = useReducer(sidebarReducer, initialState);

  // 从 localStorage 加载初始状态
  useEffect(() => {
    const savedCollapsed = localStorage.getItem('sidebarCollapsed');
    if (savedCollapsed !== null) {
      dispatch({
        type: 'SET_COLLAPSED',
        payload: savedCollapsed === 'true'
      });
    }
  }, []);

  // 监听窗口大小变化
  useEffect(() => {
    const checkScreenSize = () => {
      const isDesktopView = window.innerWidth >= 768;
      dispatch({
        type: 'SET_DESKTOP',
        payload: isDesktopView
      });
      if (isDesktopView) {
        dispatch({
          type: 'SET_MOBILE',
          payload: false
        });
      }
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // 监听 localStorage 变化（多标签页同步）
  useEffect(() => {
    const handleStorageChange = e => {
      if (e.key === 'sidebarCollapsed' && e.newValue !== null) {
        dispatch({
          type: 'SET_COLLAPSED',
          payload: e.newValue === 'true'
        });
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  const value = {
    ...state,
    toggleCollapsed: () => dispatch({
      type: 'TOGGLE_COLLAPSED'
    }),
    setCollapsed: collapsed => dispatch({
      type: 'SET_COLLAPSED',
      payload: collapsed
    }),
    toggleMobile: () => dispatch({
      type: 'TOGGLE_MOBILE'
    }),
    setMobile: open => dispatch({
      type: 'SET_MOBILE',
      payload: open
    })
  };
  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

// 自定义 hook 使用全局状态
export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within SidebarProvider');
  }
  return context;
}