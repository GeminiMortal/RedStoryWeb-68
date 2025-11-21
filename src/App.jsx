// @ts-ignore;
import React from 'react';

import { GlobalStateProvider } from '@/components/GlobalStateProvider';

// 获取所有页面组件
const pages = import.meta.glob('./pages/*.jsx', {
  eager: true
});

// 创建页面映射
const pageComponents = {};
Object.keys(pages).forEach(path => {
  const pageName = path.replace('./pages/', '').replace('.jsx', '');
  pageComponents[pageName] = pages[path].default;
});
export default function App(props) {
  const {
    pageId
  } = props;
  const PageComponent = pageComponents[pageId];
  if (!PageComponent) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">页面不存在</h1>
          <p className="text-slate-400">请求的页面未找到</p>
        </div>
      </div>;
  }
  return <GlobalStateProvider>
      <PageComponent {...props} />
    </GlobalStateProvider>;
}