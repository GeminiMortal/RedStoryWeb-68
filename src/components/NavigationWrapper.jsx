// @ts-ignore;
import React, { useEffect } from 'react';

// @ts-ignore;
import { useSidebar } from '@/components/SidebarStore';

// 导航包装器组件 - 确保页面跳转时保持侧边栏状态
export function NavigationWrapper({
  children,
  pageId
}) {
  const {
    setCurrentPage,
    isCollapsed,
    isDesktop
  } = useSidebar();

  // 页面加载时设置当前页面
  useEffect(() => {
    setCurrentPage(pageId);
  }, [pageId, setCurrentPage]);

  // 计算内容区域样式
  const contentStyle = {
    transition: 'margin-left 300ms ease-in-out',
    marginLeft: isDesktop ? isCollapsed ? '4rem' : '16rem' : '0'
  };
  return <div style={contentStyle}>
      {children}
    </div>;
}