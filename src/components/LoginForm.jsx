// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Button } from '@/components/ui';
// @ts-ignore;
import { User, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

export function LoginForm({
  formData,
  onInputChange,
  onSubmit,
  showPassword,
  onTogglePassword,
  loading,
  error,
  onClearError
}) {
  return <form onSubmit={onSubmit} className="space-y-6">
      {/* 用户名 */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          <User className="w-4 h-4 inline mr-2" />
          用户名
        </label>
        <input type="text" name="username" value={formData.username} onChange={onInputChange} placeholder="请输入用户名" className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent" autoComplete="username" />
      </div>

      {/* 密码 */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          <Lock className="w-4 h-4 inline mr-2" />
          密码
        </label>
        <div className="relative">
          <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={onInputChange} placeholder="请输入密码" className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent pr-12" autoComplete="current-password" />
          <button type="button" onClick={onTogglePassword} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* 错误提示 */}
      {error && <div className="bg-red-900/50 border border-red-600 text-red-200 px-4 py-3 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
          <Button onClick={onClearError} variant="ghost" size="sm" className="text-red-300 hover:text-red-100">
            ×
          </Button>
        </div>}

      {/* 提交按钮 */}
      <Button type="submit" disabled={loading} className="w-full bg-red-600 hover:bg-red-700 text-white">
        {loading ? <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            登录中...
          </div> : '登录'}
      </Button>
    </form>;
}