// @ts-ignore;
import { create } from 'zustand';
// @ts-ignore;
import { persist } from 'zustand/middleware';

export const useSidebar = create(
  persist(
    (set, get) => ({
      isOpen: false,
      isCollapsed: false,
      isDesktop: typeof window !== 'undefined' && window.innerWidth >= 1024,
      
      toggleSidebar: () => set((state) => ({ isOpen: !state.isOpen })),
      openSidebar: () => set({ isOpen: true }),
      closeSidebar: () => set({ isOpen: false }),
      
      collapseSidebar: () => set({ isCollapsed: true }),
      expandSidebar: () => set({ isCollapsed: false }),
      
      setDesktop: (isDesktop) => set({ isDesktop }),
      
      // 响应式处理
      handleResize: () => {
        if (typeof window === 'undefined') return;
        
        const isDesktop = window.innerWidth >= 1024;
        set({ 
          isDesktop,
          isOpen: false, // 窗口大小变化时关闭移动端菜单
          isCollapsed: isDesktop ? get().isCollapsed : false // 移动端不折叠
        });
      }
    }),
    {
      name: 'sidebar-storage',
      partialize: (state) => ({
        isCollapsed: state.isCollapsed
      })
    }
  )
);

// 响应式处理
if (typeof window !== 'undefined') {
  const handleResize = () => {
    useSidebar.getState().handleResize();
  };
  
  window.addEventListener('resize', handleResize);
  handleResize(); // 初始化
}