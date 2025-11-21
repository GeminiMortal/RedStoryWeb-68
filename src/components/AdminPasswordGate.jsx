// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Button, Input, useToast } from '@/components/ui';
// @ts-ignore;
import { Lock, Eye, EyeOff, Shield } from 'lucide-react';
// @ts-ignore;
import { cn } from '@/lib/utils';

export function AdminPasswordGate({
  onAuthenticated
}) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const {
    toast
  } = useToast();

  // 管理员密码（实际项目中应该从环境变量或配置文件获取）
  const ADMIN_PASSWORD = 'admin123';
  const handleSubmit = async e => {
    e.preventDefault();
    if (!password.trim()) {
      toast({
        title: '请输入密码',
        description: '密码不能为空',
        variant: 'destructive'
      });
      return;
    }
    setIsLoading(true);
    try {
      // 模拟验证延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      if (password === ADMIN_PASSWORD) {
        // 保存登录状态到 localStorage
        localStorage.setItem('admin_authenticated', 'true');
        localStorage.setItem('admin_login_time', Date.now().toString());
        toast({
          title: '验证成功',
          description: '欢迎进入管理界面'
        });
        onAuthenticated();
      } else {
        toast({
          title: '密码错误',
          description: '请输入正确的管理员密码',
          variant: 'destructive'
        });
        // 密码错误时添加震动效果
        const input = document.getElementById('admin-password');
        if (input) {
          input.classList.add('animate-shake');
          setTimeout(() => {
            input.classList.remove('animate-shake');
          }, 500);
        }
      }
    } catch (error) {
      toast({
        title: '验证失败',
        description: '网络错误，请稍后重试',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  const handleKeyPress = e => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };
  return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* 背景装饰 */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width=%2740%27%20height=%2740%27%20viewBox=%270%200%2040%2040%27%20xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cg%20fill=%27%239C92AC%27%20fill-opacity=%270.03%27%3E%3Cpath%20d=%27M0%2040L40%200H20L0%2020M40%2040V20L20%2040%27/%3E%3C/g%3E%3C/svg%3E')]"></div>
        
        {/* 主卡片 */}
        <div className="relative bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-slate-700/50 p-8">
          {/* 头部 */}
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">管理界面</h1>
            <p className="text-slate-400">请输入管理员密码以继续</p>
          </div>

          {/* 密码输入表单 */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input id="admin-password" type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} onKeyPress={handleKeyPress} placeholder="请输入管理员密码" className="pl-10 pr-12 py-3 bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-300" disabled={isLoading} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors">
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 shadow-lg hover:shadow-red-500/25 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed">
              {isLoading ? <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  验证中...
                </div> : <div className="flex items-center">
                  <Lock className="w-4 h-4 mr-2" />
                  验证密码
                </div>}
            </Button>
          </form>

          {/* 提示信息 */}
          <div className="mt-6 p-4 bg-slate-700/30 rounded-lg border border-slate-600/50">
            <p className="text-xs text-slate-400 text-center">
              <span className="text-red-400">提示：</span>
              默认密码为 admin123，请在生产环境中修改
            </p>
          </div>
        </div>

        {/* 底部信息 */}
        <div className="text-center mt-8">
          <p className="text-slate-500 text-sm">
            红色故事管理系统
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
          20%, 40%, 60%, 80% { transform: translateX(2px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>;
}