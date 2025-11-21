// @ts-ignore;
import React from 'react';

// @ts-ignore;
import { SidebarProvider } from '@/components/SidebarStore';
export default function App(props) {
  return <SidebarProvider>
      {props.children}
    </SidebarProvider>;
}