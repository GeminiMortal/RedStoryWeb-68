// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Button } from '@/components/ui';
// @ts-ignore;
import { ArrowLeft, User, Lock, AlertCircle, Eye, EyeOff, Shield } from 'lucide-react';

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
  const [error, setError] = useState(null);

  // 处理表单输入变化
  const handleInputChange = e => {
    const {
      name,
      value
    } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // 清除错误信息
    if (error) {
      setError(null);
    }
  };

  // 处理表单提交
  const handleSubmit = async e => {
    e.preventDefault();

    // 验证必填字段
    if (!formData.username.trim()) {
      setError('请输入用户名');
      return;
    }
    if (!formData.password.trim()) {
      setError('请输入密码');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // 模拟登录验证延迟
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 验证用户名和密码
      if (formData.username === 'admin' && formData.password === 'admin') {
        // 登录成功，保存登录状态到localStorage
        localStorage.setItem('adminLoggedIn', 'true');
        console.log('登录成功，跳转到管理页面');
        $w.utils.navigateTo({
          pageId: 'admin',
          params: {}
        });
      } else {
        // 登录失败
        setError('用户名或密码错误，请重试');
      }
    } catch (err) {
      console.error('登录失败:', err);
      setError('登录失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 导航函数
  const goBack = () => {
    $w.utils.navigateBack();
  };

  // 切换密码显示状态
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      {/* 背景装饰 */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-gray-900 to-gray-900"></div>
      
      {/* 顶部导航 */}
      <header className="absolute top-0 left-0 right-0 z-10 bg-black/50 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button onClick={goBack} variant="ghost" className="text-gray-300 hover:text-white">
            <ArrowLeft className="w-5 h-5 mr-2" />
            返回主页
          </Button>
          <h1 className="text-2xl font-bold text-red-600">管理员登录</h1>
          <div className="w-24"></div>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="relative z-10 w-full max-w-md mx-auto px-4 pt-20">
        {/* 登录表单容器 */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-gray-700">
          {/* 登录图标和标题 */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">管理员登录</h2>
            <p className="text-gray-400 text-sm">请输入管理员账号和密码</p>
          </div>

          {/* 错误提示 */}
          {error && <div className="bg-red-900/50 border border-red-600 text-red-200 px-4 py-3 rounded-lg mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
              <Button onClick={() => setError(null)} variant="ghost" size="sm" className="text-red-300 hover:text-red-100">
                ×
              </Button>
            </div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 用户名输入框 */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                用户名
              </label>
              <input type="text" name="username" value={formData.username} onChange={handleInputChange} placeholder="请输入用户名" className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent" autoComplete="username" disabled={loading} />
            </div>

            {/* 密码输入框 */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Lock className="w-4 h-4 inline mr-2" />
                密码
              </label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleInputChange} placeholder="请输入密码" className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent pr-12" autoComplete="current-password" disabled={loading} />
                <button type="button" onClick={togglePasswordVisibility} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 focus:outline-none" disabled={loading}>
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* 登录按钮 */}
            <Button type="submit" disabled={loading} className="w-full bg-red-600 hover:bg-red-700 text-white py-3">
              {loading ? <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  登录中...
                </div> : '登录'}
            </Button>
          </form>

          {/* 提示信息 */}
          <div className="mt-6 p-4 bg-gray-900/30 rounded-lg">
            <p className="text-sm text-gray-400 text-center">
              <span className="text-red-400">提示：</span>
              默认用户名和密码都是 <span className="text-white font-mono bg-gray-800 px-2 py-1 rounded">admin</span>
            </p>
          </div>
        </div>

        {/* 底部装饰 */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            红色记忆管理系统
          </p>
          <p className="text-gray-600 text-xs mt-1">
            © 2025 Red Memory. All rights reserved.
          </p>
        </div>
      </main>
    </div>;
}