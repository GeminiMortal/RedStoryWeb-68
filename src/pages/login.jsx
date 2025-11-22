// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Button, Input } from '@/components/ui';
// @ts-ignore;
import { Lock, User, Eye, EyeOff, AlertCircle, BookOpen } from 'lucide-react';
// @ts-ignore;
import { cn } from '@/lib/utils';

export default function LoginPage(props) {
  const {
    $w
  } = props;
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigateTo = $w.utils.navigateTo;

  // 处理表单输入变化
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // 清除错误信息
    if (error) {
      setError('');
    }
  };

  // 登录处理
  const handleLogin = async e => {
    e.preventDefault();
    if (!formData.username || !formData.password) {
      setError('请输入用户名和密码');
      return;
    }
    try {
      setLoading(true);
      setError('');

      // 模拟登录验证
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 简单的验证逻辑（实际项目中应该调用后端API）
      if (formData.username === 'admin' && formData.password === 'admin123') {
        // 登录成功，跳转到管理页面
        navigateTo({
          pageId: 'admin',
          params: {}
        });
      } else {
        setError('用户名或密码错误');
      }
    } catch (error) {
      console.error('登录失败:', error);
      setError('登录失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 返回首页
  const handleGoHome = () => {
    navigateTo({
      pageId: 'index',
      params: {}
    });
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

      {/* 登录表单容器 */}
      <div className="relative w-full max-w-md">
        {/* Logo和标题区域 */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl mb-4 shadow-lg shadow-red-500/25">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent mb-2">
            红色故事
          </h1>
          <p className="text-slate-400 text-sm">
            管理员登录
          </p>
        </div>

        {/* 登录表单 */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 shadow-2xl animate-slide-up">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* 用户名输入 */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">
                用户名
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input type="text" value={formData.username} onChange={e => handleInputChange('username', e.target.value)} placeholder="请输入用户名" className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-300" disabled={loading} />
              </div>
            </div>

            {/* 密码输入 */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">
                密码
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input type={showPassword ? 'text' : 'password'} value={formData.password} onChange={e => handleInputChange('password', e.target.value)} placeholder="请输入密码" className="pl-10 pr-10 bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-300" disabled={loading} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors duration-200" disabled={loading}>
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* 错误提示 */}
            {error && <div className="flex items-center space-x-2 p-3 bg-red-900/20 border border-red-500/30 rounded-lg animate-fade-in">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span className="text-red-400 text-sm">{error}</span>
              </div>}

            {/* 登录按钮 */}
            <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 disabled:from-red-800 disabled:to-orange-800 text-white font-medium py-3 rounded-xl shadow-lg hover:shadow-red-500/25 transition-all duration-300 transform hover:scale-105 button-press">
              {loading ? <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>登录中...</span>
                </div> : '登录'}
            </Button>
          </form>

          {/* 底部操作 */}
          <div className="mt-6 pt-6 border-t border-slate-700/50">
            <Button onClick={handleGoHome} variant="outline" className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white transition-all duration-300">
              返回首页
            </Button>
          </div>
        </div>

        {/* 提示信息 */}
        <div className="mt-6 text-center animate-fade-in" style={{
        animationDelay: '0.3s'
      }}>
          <p className="text-xs text-slate-500">
            默认账号：admin / admin123
          </p>
        </div>
      </div>
    </div>;
}