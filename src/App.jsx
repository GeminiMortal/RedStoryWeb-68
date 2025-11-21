// @ts-ignore;
import React from 'react';

import { GlobalStateProvider } from '@/components/GlobalStateProvider';

// 手动导入所有页面组件
import HomePage from './pages/index.jsx';
import DetailPage from './pages/detail.jsx';
import UploadPage from './pages/upload.jsx';
import AdminPage from './pages/admin.jsx';
import EditPage from './pages/edit.jsx';
import LoginPage from './pages/login.jsx';

// 页面组件映射
const pageComponents = {
  index: HomePage,
  detail: DetailPage,
  upload: UploadPage,
  admin: AdminPage,
  edit: EditPage,
  login: LoginPage
};
export default function App(props) {
  const {
    pageId
  } = props;
  const PageComponent = pageComponents[pageId];
  if (!PageComponent) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">页面不存在</h1>
          <p className="text-slate-400">请求的页面 "{pageId}" 未找到</p>
        </div>
      </div>;
  }
  return <GlobalStateProvider>
      <PageComponent {...props} />
    </GlobalStateProvider>;
}