// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Button } from '@/components/ui';
// @ts-ignore;
import { ArrowLeft, Shield, AlertCircle } from 'lucide-react';

// @ts-ignore;
import { PageHeader, BreadcrumbNav } from '@/components/Navigation';
// @ts-ignore;
import { LoginForm } from '@/components/LoginForm';
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
  const navigateTo = $w.utils.navigateTo;
  const goBack = () => {
    $w.utils.navigateBack();
  };

  // 切换密码显示状态
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // 清除错误信息
  const clearError = () => {
    setError(null);
  };

  // 面包屑导航
  const breadcrumbs = [{
    label: '首页',
    href: true,
    onClick: () => navigateTo({
      pageId: 'index',
      params: {}
    })
  }, {
    label: '管理员登录'
  }];
  return <div className="min-h-screen bg-gray-900 text-white">
      {/* 背景装饰 */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-gray-900 to-gray-900"></div>
      
      {/* 顶部导航 */}
      <PageHeader title="管理员登录" showBack={true} backAction={goBack} breadcrumbs={breadcrumbs} />

      {/* 主要内容 */}
      <main className="relative z-10 max-w-md mx-auto px-4 py-8">
        {/* 安全提示 */}
        <div className="bg-yellow-900/30 border border-yellow-600 text-yellow-200 px-4 py-3 rounded-lg mb-6">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span className="text-sm">管理员登录 - 请确保您有权限访问此页面</span>
          </div>
        </div>

        {/* 登录表单 */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-gray-700">
          {/* 登录图标 */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">管理员登录</h2>
            <p className="text-gray-400">请输入您的管理员凭据</p>
          </div>

          <LoginForm formData={formData} onInputChange={handleInputChange} onSubmit={handleSubmit} showPassword={showPassword} onTogglePassword={togglePasswordVisibility} loading={loading} error={error} onClearError={clearError} />

          {/* 底部提示 */}
          <div className="mt-6 pt-6 border-t border-gray-700">
            <div className="text-center text-sm text-gray-400">
              <p>默认账号：admin / admin</p>
              <p className="mt-2">如遇问题请联系系统管理员</p>
            </div>
          </div>
        </div>

        {/* 返回首页 */}
        <div className="mt-6 text-center">
          <Button onClick={() => navigateTo({
          pageId: 'index',
          params: {}
        })} variant="ghost" className="text-gray-400 hover:text-white">
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回首页
          </Button>
        </div>
      </main>
    </div>;
}