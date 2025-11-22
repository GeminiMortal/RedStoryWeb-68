// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button, Input, useToast } from '@/components/ui';
// @ts-ignore;
import { Lock, Eye, EyeOff, LogIn, Loader2, Home, Shield } from 'lucide-react';
// @ts-ignore;
import { cn } from '@/lib/utils';

export function AdminPasswordGate({
  onAuthenticated,
  navigateTo
}) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const {
    toast
  } = useToast();

  // 检查登录状态
  useEffect(() => {
    checkLoginStatus();
  }, []);
  const checkLoginStatus = () => {
    try {
      const adminLoginState = localStorage.getItem('adminLoginState');
      if (adminLoginState) {
        const loginData = JSON.parse(adminLoginState);
        // 检查登录状态是否有效（24小时内）
        const now = Date.now();
        const loginTime = loginData.loginTime;
        const twentyFourHours = 24 * 60 * 60 * 1000;
        if (loginData.isAuthenticated && now - loginTime < twentyFourHours) {
          setIsAuthenticated(true);
          onAuthenticated();
          return;
        } else {
          // 登录状态过期，清除本地存储
          localStorage.removeItem('adminLoginState');
        }
      }
    } catch (error) {
      console.error('检查登录状态失败:', error);
      localStorage.removeItem('adminLoginState');
    }
  };
  const handlePasswordSubmit = async () => {
    if (!password.trim()) {
      toast({
        title: '密码不能为空',
        description: '请输入管理员密码',
        variant: 'destructive'
      });
      return;
    }
    try {
      setLoading(true);

      // 模拟密码验证
      await new Promise(resolve => setTimeout(resolve, 800));
      if (password === 'admin123') {
        // 验证成功，保存登录状态
        const loginData = {
          username: 'admin',
          role: 'admin',
          loginTime: Date.now(),
          isAuthenticated: true
        };
        localStorage.setItem('adminLoginState', JSON.stringify(loginData));
        setIsAuthenticated(true);
        onAuthenticated();
        toast({
          title: '验证成功',
          description: '欢迎进入管理中心'
        });
      } else {
        toast({
          title: '验证失败',
          description: '密码错误，请重试',
          variant: 'destructive'
        });
        setPassword('');
      }
    } catch (error) {
      console.error('验证失败:', error);
      toast({
        title: '验证失败',
        description: '验证过程中出现错误，请重试',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  const handleKeyPress = e => {
    if (e.key === 'Enter') {
      handlePasswordSubmit();
    }
  };
  const handleReturnToHome = () => {
    navigateTo({
      pageId: 'index',
      params: {}
    });
  };
  if (isAuthenticated) {
    return null; // 已认证时不显示任何内容
  }
  return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center p-4">
      {/* 增强的背景装饰 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-full blur-3xl animate-pulse" style={{
        animationDelay: '1s'
      }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse" style={{
        animationDelay: '2s'
      }}></div>
        {/* 添加网格背景 */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width=%2760%27%20height=%2760%27%20viewBox=%270%200%2060%2060%27%20xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cg%20fill=%27none%27%20fill-rule=%27evenodd%27%3E%3Cg%20fill=%27%239C92AC%27%20fill-opacity=%270.05%27%3E%3Ccircle%20cx=%2730%27%20cy=%2730%27%20r=%271%27/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50"></div>
      </div>

      {/* 返回主界面按钮 - 优化样式 */}
      <div className="fixed top-6 left-6 z-50">
        <Button onClick={handleReturnToHome} variant="outline" size="sm" className="bg-slate-800/90 backdrop-blur-md border-slate-600/50 text-slate-300 hover:bg-slate-700/90 hover:text-white hover:border-slate-500 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 group">
          <Home className="w-4 h-4 mr-2 group-hover:animate-bounce" />
          返回主界面
        </Button>
      </div>

      {/* 验证表单容器 */}
      <div className="relative w-full max-w-md">
        {/* 验证卡片 - 增强视觉效果 */}
        <div className="bg-slate-800/90 backdrop-blur-xl rounded-3xl border border-slate-700/50 shadow-2xl p-10 animate-fade-in relative overflow-hidden">
          {/* 卡片内部光效 */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none"></div>
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent"></div>
          
          {/* 头部 - 重新设计 */}
          <div className="text-center mb-10 relative z-10">
            <div className="relative inline-block">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-500 via-red-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl transform hover:scale-105 transition-transform duration-300">
                <Shield className="w-10 h-10 text-white drop-shadow-lg" />
              </div>
              {/* 添加光环效果 */}
              <div className="absolute inset-0 w-20 h-20 bg-gradient-to-br from-orange-500/30 to-red-500/30 rounded-2xl mx-auto blur-xl animate-pulse"></div>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent mb-3">
              管理员验证
            </h1>
            <p className="text-slate-400 text-base leading-relaxed">
              请输入管理员密码以访问管理中心
            </p>
          </div>

          {/* 密码输入区域 - 重新设计 */}
          <div className="space-y-8 relative z-10">
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-slate-300 tracking-wide">
                管理员密码
              </label>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-xl blur-sm group-hover:blur-none transition-all duration-300"></div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 z-10" />
                  <Input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} onKeyPress={handleKeyPress} placeholder="请输入管理员密码" className="pl-12 pr-12 py-4 bg-slate-700/60 border-slate-600/50 text-white placeholder-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30 focus:bg-slate-700/80 transition-all duration-300 rounded-xl backdrop-blur-sm" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors duration-200 z-10">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* 验证按钮 - 重新设计 */}
            <Button onClick={handlePasswordSubmit} disabled={loading} className="w-full bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 hover:from-orange-600 hover:via-red-600 hover:to-orange-700 shadow-lg hover:shadow-orange-500/30 transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-0.5 disabled:transform-none disabled:shadow-lg py-4 text-base font-semibold rounded-xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              {loading ? <>
                  <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                  验证中...
                </> : <>
                  <LogIn className="w-5 h-5 mr-3" />
                  进入管理中心
                </>}
            </Button>

            {/* 移除了密码提示信息 */}
          </div>
        </div>

        {/* 底部装饰 - 增强视觉效果 */}
        <div className="text-center mt-8 relative z-10">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-800/50 backdrop-blur-sm rounded-full border border-slate-700/30">
            <div className="w-2 h-2 bg-gradient-to-r from-red-500 to-orange-500 rounded-full animate-pulse"></div>
            <p className="text-slate-500 text-sm font-medium">
              红色故事平台 - 管理中心
            </p>
            <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-full animate-pulse" style={{
            animationDelay: '0.5s'
          }}></div>
          </div>
        </div>
      </div>

      {/* 移动端底部返回按钮 - 优化样式 */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 md:hidden z-50">
        <Button onClick={handleReturnToHome} variant="outline" size="sm" className="bg-slate-800/90 backdrop-blur-md border-slate-600/50 text-slate-300 hover:bg-slate-700/90 hover:text-white hover:border-slate-500 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 group">
          <Home className="w-4 h-4 mr-2 group-hover:animate-bounce" />
          返回主界面
        </Button>
      </div>
    </div>;
}