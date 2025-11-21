// @ts-ignore;
import React from 'react';

import { GlobalStateProvider } from '@/components/GlobalStateProvider';
export default function App(props) {
  return <GlobalStateProvider>
      {/* 原有 App 内容保持不变 */}
    </GlobalStateProvider>;
}