// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Button, Input } from '@/components/ui';
// @ts-ignore;
import { Lock, User, Eye, EyeOff, AlertCircle } from 'lucide-react';
// @ts-ignore;
import { cn } from '@/lib/utils';

export function LoginForm({
  onLogin,
  onGoHome,
  loading = false,
  className
}) {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

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
  const handleSubmit = async e => {
    e.preventDefault();
    if (!formData.username || !formData.password) {
      setError('请输入用户名和密码');
      return;
    }
    try {
      setError('');
      await onLogin(formData);
    } catch (error) {
      console.error('登录失败:', error);
      setError(error.message || '登录失败，请重试');
    }
  };
  return <div className={cn("bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 shadow-2xl animate-slide-up", className)}>
      <form onSubmit={handleSubmit} className="space-y-6">
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
      {onGoHome && <div className="mt-6 pt-6 border-t border-slate-700/50">
          <Button onClick={onGoHome} variant="outline" className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white transition-all duration-300">
            返回首页
          </Button>
        </div>}
    </div>;
}