// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button, Input, useToast } from '@/components/ui';
// @ts-ignore;
import { Lock, Eye, EyeOff, LogIn, Loader2, Home } from 'lucide-react';
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

      {/* 返回主界面按钮 */}
      <div className="fixed top-4 left-4 z-50">
        <Button onClick={handleReturnToHome} variant="outline" size="sm" className="bg-slate-800/80 backdrop-blur-sm border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
          <Home className="w-4 h-4 mr-2" />
          返回主界面
        </Button>
      </div>

      {/* 验证表单容器 */}
      <div className="relative w-full max-w-md">
        {/* 验证卡片 */}
        <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-slate-700/50 shadow-2xl p-8 animate-fade-in">
          {/* 头部 */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">管理员验证</h1>
            <p className="text-slate-400 text-sm">请输入管理员密码以访问管理中心</p>
          </div>

          {/* 密码输入 */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                管理员密码
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} onKeyPress={handleKeyPress} placeholder="请输入管理员密码" className="pl-10 pr-10 bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors duration-200">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* 验证按钮 */}
            <Button onClick={handlePasswordSubmit} disabled={loading} className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg hover:shadow-orange-500/25 transition-all duration-300 transform hover:scale-105 disabled:transform-none disabled:shadow-lg">
              {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <LogIn className="w-5 h-5 mr-2" />}
              {loading ? '验证中...' : '进入管理中心'}
            </Button>

            {/* 提示信息 */}
            <div className="text-center">
              <p className="text-xs text-slate-500 mb-2">测试密码：</p>
              <div className="text-xs text-slate-400">
                <p>管理员：admin123</p>
              </div>
            </div>
          </div>
        </div>

        {/* 底部装饰 */}
        <div className="text-center mt-6">
          <p className="text-slate-500 text-sm">
            红色故事平台 - 管理中心
          </p>
        </div>
      </div>

      {/* 移动端底部返回按钮 */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 md:hidden">
        <Button onClick={handleReturnToHome} variant="outline" size="sm" className="bg-slate-800/80 backdrop-blur-sm border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white transition-all duration-300 shadow-lg">
          <Home className="w-4 h-4 mr-2" />
          返回主界面
        </Button>
      </div>
    </div>;
}