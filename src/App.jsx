// @ts-ignore;
import React from 'react';

// @ts-ignore;
import { SidebarProvider } from '@/components/SidebarStore';

// 包装整个应用以提供全局状态
export default function App(props) {
  return <SidebarProvider>
      {props.children}
    </SidebarProvider>;
}