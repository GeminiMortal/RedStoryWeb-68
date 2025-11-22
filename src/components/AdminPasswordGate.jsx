// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { BookOpen, Lock } from 'lucide-react';

// @ts-ignore;
import { LoginForm } from '@/components/LoginForm';
export function AdminPasswordGate({
  onAuthenticated,
  navigateTo
}) {
  // 处理登录验证
  const handleLogin = async formData => {
    // 模拟登录验证
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 简单的验证逻辑（实际项目中应该调用后端API）
    if (formData.username === 'admin' && formData.password === 'admin123') {
      onAuthenticated();
    } else {
      throw new Error('用户名或密码错误');
    }
  };

  // 返回首页 - 修复导航方式
  const handleGoHome = () => {
    if (navigateTo) {
      navigateTo({
        pageId: 'index',
        params: {}
      });
    } else {
      // 兜底方案
      window.location.href = '/';
    }
  };
  return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center p-4">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl animate-pulse" style={{
        animationDelay: '1s'
      }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse" style={{
        animationDelay: '2s'
      }}></div>
      </div>

      {/* 登录容器 */}
      <div className="relative w-full max-w-md">
        {/* Logo和标题区域 */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl mb-4 shadow-lg shadow-red-500/25">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent mb-2">
            红色故事
          </h1>
          <p className="text-slate-400 text-sm flex items-center justify-center">
            <Lock className="w-4 h-4 mr-2" />
            管理员登录
          </p>
        </div>

        {/* 登录表单 */}
        <LoginForm onLogin={handleLogin} onGoHome={handleGoHome} />
      </div>
    </div>;
}