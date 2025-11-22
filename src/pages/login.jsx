// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Button, Input, useToast } from '@/components/ui';
// @ts-ignore;
import { ArrowLeft, User, Lock, Eye, EyeOff, LogIn, Home, Loader2 } from 'lucide-react';
// @ts-ignore;
import { cn } from '@/lib/utils';

// @ts-ignore;
import { LoginForm } from '@/components/LoginForm';
export default function LoginPage(props) {
  const {
    $w
  } = props;
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const {
    toast
  } = useToast();
  const navigateTo = $w.utils.navigateTo;

  // 处理表单输入变化
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 处理登录
  const handleLogin = async () => {
    if (!formData.username.trim() || !formData.password.trim()) {
      toast({
        title: '登录失败',
        description: '用户名和密码不能为空',
        variant: 'destructive'
      });
      return;
    }
    try {
      setLoading(true);

      // 模拟登录验证
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 简单的登录验证逻辑（实际项目中应该调用后端API）
      if (formData.username === 'admin' && formData.password === 'admin123') {
        // 登录成功
        toast({
          title: '登录成功',
          description: '欢迎回来，管理员！'
        });

        // 跳转到管理页面
        navigateTo({
          pageId: 'admin',
          params: {}
        });
      } else if (formData.username === 'user' && formData.password === 'user123') {
        // 登录成功
        toast({
          title: '登录成功',
          description: '欢迎回来！'
        });

        // 跳转到首页
        navigateTo({
          pageId: 'index',
          params: {}
        });
      } else {
        // 登录失败
        toast({
          title: '登录失败',
          description: '用户名或密码错误',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('登录失败:', error);
      toast({
        title: '登录失败',
        description: '登录过程中出现错误，请重试',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // 返回主界面
  const handleReturnToHome = () => {
    navigateTo({
      pageId: 'index',
      params: {}
    });
  };

  // 处理键盘事件
  const handleKeyPress = e => {
    if (e.key === 'Enter') {
      handleLogin();
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

      {/* 返回主界面按钮 - 固定在左上角 */}
      <div className="fixed top-4 left-4 z-50">
        <Button onClick={handleReturnToHome} variant="outline" size="sm" className="bg-slate-800/80 backdrop-blur-sm border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
          <Home className="w-4 h-4 mr-2" />
          返回主界面
        </Button>
      </div>

      {/* 登录表单容器 */}
      <div className="relative w-full max-w-md">
        {/* 登录卡片 */}
        <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-slate-700/50 shadow-2xl p-8 animate-fade-in">
          {/* 头部 */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <User className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">用户登录</h1>
            <p className="text-slate-400 text-sm">请输入您的用户名和密码</p>
          </div>

          {/* 登录表单 */}
          <div className="space-y-6">
            {/* 用户名输入 */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                用户名
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input type="text" value={formData.username} onChange={e => handleInputChange('username', e.target.value)} onKeyPress={handleKeyPress} placeholder="请输入用户名" className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-300" />
              </div>
            </div>

            {/* 密码输入 */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                密码
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input type={showPassword ? 'text' : 'password'} value={formData.password} onChange={e => handleInputChange('password', e.target.value)} onKeyPress={handleKeyPress} placeholder="请输入密码" className="pl-10 pr-10 bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-300" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors duration-200">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* 登录按钮 */}
            <Button onClick={handleLogin} disabled={loading} className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 shadow-lg hover:shadow-red-500/25 transition-all duration-300 transform hover:scale-105 disabled:transform-none disabled:shadow-lg">
              {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <LogIn className="w-5 h-5 mr-2" />}
              {loading ? '登录中...' : '登录'}
            </Button>

            {/* 提示信息 */}
            <div className="text-center">
              <p className="text-xs text-slate-500 mb-2">测试账号：</p>
              <div className="text-xs text-slate-400 space-y-1">
                <p>管理员：admin / admin123</p>
                <p>普通用户：user / user123</p>
              </div>
            </div>
          </div>
        </div>

        {/* 底部装饰 */}
        <div className="text-center mt-6">
          <p className="text-slate-500 text-sm">
            红色故事平台 - 传承红色基因，讲述革命故事
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