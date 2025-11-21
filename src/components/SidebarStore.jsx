// @ts-ignore;
import React, { createContext, useContext, useReducer, useEffect } from 'react';

// 状态类型定义
const SIDEBAR_STATE_KEY = 'red_story_sidebar_state';

// 初始状态
const initialState = {
  isCollapsed: false,
  isDesktop: typeof window !== 'undefined' ? window.innerWidth >= 768 : true,
  currentPage: 'index',
  isAnimating: false
};

// 动作类型
const actionTypes = {
  TOGGLE_SIDEBAR: 'TOGGLE_SIDEBAR',
  SET_COLLAPSED: 'SET_COLLAPSED',
  SET_DESKTOP: 'SET_DESKTOP',
  SET_CURRENT_PAGE: 'SET_CURRENT_PAGE',
  SET_ANIMATING: 'SET_ANIMATING',
  RESTORE_STATE: 'RESTORE_STATE'
};

// 从localStorage恢复状态
const restoreState = () => {
  if (typeof window === 'undefined') return initialState;
  try {
    const saved = localStorage.getItem(SIDEBAR_STATE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...initialState,
        ...parsed,
        isDesktop: window.innerWidth >= 768
      };
    }
  } catch (error) {
    console.error('恢复侧边栏状态失败:', error);
  }
  return initialState;
};

// reducer函数
function sidebarReducer(state, action) {
  switch (action.type) {
    case actionTypes.TOGGLE_SIDEBAR:
      const newCollapsed = !state.isCollapsed;
      localStorage.setItem(SIDEBAR_STATE_KEY, JSON.stringify({
        ...state,
        isCollapsed: newCollapsed
      }));
      return {
        ...state,
        isCollapsed: newCollapsed
      };
    case actionTypes.SET_COLLAPSED:
      localStorage.setItem(SIDEBAR_STATE_KEY, JSON.stringify({
        ...state,
        isCollapsed: action.payload
      }));
      return {
        ...state,
        isCollapsed: action.payload
      };
    case actionTypes.SET_DESKTOP:
      return {
        ...state,
        isDesktop: action.payload
      };
    case actionTypes.SET_CURRENT_PAGE:
      localStorage.setItem(SIDEBAR_STATE_KEY, JSON.stringify({
        ...state,
        currentPage: action.payload
      }));
      return {
        ...state,
        currentPage: action.payload
      };
    case actionTypes.SET_ANIMATING:
      return {
        ...state,
        isAnimating: action.payload
      };
    case actionTypes.RESTORE_STATE:
      return restoreState();
    default:
      return state;
  }
}

// 创建上下文
const SidebarContext = createContext();

// 侧边栏提供者组件
export function SidebarProvider({
  children
}) {
  const [state, dispatch] = useReducer(sidebarReducer, initialState);

  // 监听窗口大小变化
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => {
      dispatch({
        type: actionTypes.SET_DESKTOP,
        payload: window.innerWidth >= 768
      });
    };

    // 初始化时恢复状态
    dispatch({
      type: actionTypes.RESTORE_STATE
    });

    // 监听窗口变化
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 监听localStorage变化（多标签页同步）
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleStorageChange = e => {
      if (e.key === SIDEBAR_STATE_KEY) {
        dispatch({
          type: actionTypes.RESTORE_STATE
        });
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  const value = {
    ...state,
    toggleSidebar: () => dispatch({
      type: actionTypes.TOGGLE_SIDEBAR
    }),
    setCollapsed: collapsed => dispatch({
      type: actionTypes.SET_COLLAPSED,
      payload: collapsed
    }),
    setCurrentPage: page => dispatch({
      type: actionTypes.SET_CURRENT_PAGE,
      payload: page
    }),
    setAnimating: animating => dispatch({
      type: actionTypes.SET_ANIMATING,
      payload: animating
    })
  };
  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

// 自定义hook
export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within SidebarProvider');
  }
  return context;
}