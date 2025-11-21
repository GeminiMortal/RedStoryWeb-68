// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button, Card, CardContent, CardHeader, CardTitle, useToast } from '@/components/ui';
// @ts-ignore;
import { User, Lock, Mail, Phone, Eye, EyeOff, LogIn, UserPlus } from 'lucide-react';
// @ts-ignore;
import { cn } from '@/lib/utils';

// @ts-ignore;
import { FadeIn } from '@/components/AnimationProvider';
export default function LoginPage(props) {
  const {
    $w
  } = props || {};
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const {
    toast
  } = useToast();
  const navigateTo = $w?.utils?.navigateTo || (() => {});

  // 检查是否已登录
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = $w?.auth?.currentUser;
        if (currentUser?.userId) {
          navigateTo({
            pageId: 'index',
            params: {}
          });
        }
      } catch (error) {
        console.error('检查登录状态失败:', error);
      }
    };
    checkAuth();
  }, [$w?.auth?.currentUser, navigateTo]);
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setErrors(prev => ({
      ...prev,
      [field]: ''
    }));
  };
  const validateForm = () => {
    const newErrors = {};
    if (isLogin) {
      if (!formData.username?.trim() && !formData.email?.trim()) {
        newErrors.username = '请输入用户名或邮箱';
      }
      if (!formData.password) {
        newErrors.password = '请输入密码';
      } else if (formData.password.length < 6) {
        newErrors.password = '密码至少6位';
      }
    } else {
      if (!formData.username?.trim()) {
        newErrors.username = '请输入用户名';
      } else if (formData.username.length < 3) {
        newErrors.username = '用户名至少3位';
      }
      if (!formData.email?.trim()) {
        newErrors.email = '请输入邮箱';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = '请输入有效邮箱';
      }
      if (!formData.phone?.trim()) {
        newErrors.phone = '请输入手机号';
      } else if (!/^1[3-9]\d{9}$/.test(formData.phone)) {
        newErrors.phone = '请输入有效手机号';
      }
      if (!formData.password) {
        newErrors.password = '请输入密码';
      } else if (formData.password.length < 6) {
        newErrors.password = '密码至少6位';
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = '两次密码不一致';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async e => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    setLoading(true);
    try {
      const tcb = await $w?.cloud?.getCloudInstance?.();
      if (!tcb) {
        throw new Error('云开发服务不可用');
      }
      if (isLogin) {
        // 登录逻辑 - 使用云函数验证
        const result = await tcb.callFunction({
          name: 'login',
          data: {
            username: formData.username || formData.email,
            password: formData.password
          }
        });
        if (result?.result?.success) {
          toast({
            title: "登录成功",
            description: `欢迎回来，${result.result.user?.name || '用户'}`,
            variant: "default"
          });
          navigateTo({
            pageId: 'index',
            params: {}
          });
        } else {
          throw new Error(result?.result?.message || '登录失败');
        }
      } else {
        // 注册逻辑 - 使用云函数注册
        const result = await tcb.callFunction({
          name: 'register',
          data: {
            username: formData.username,
            email: formData.email,
            phone: formData.phone,
            password: formData.password
          }
        });
        if (result?.result?.success) {
          toast({
            title: "注册成功",
            description: `欢迎加入，${formData.username}`,
            variant: "default"
          });
          navigateTo({
            pageId: 'index',
            params: {}
          });
        } else {
          throw new Error(result?.result?.message || '注册失败');
        }
      }
    } catch (error) {
      console.error('操作失败:', error);
      toast({
        title: isLogin ? "登录失败" : "注册失败",
        description: error.message || "请重试",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const handleGuestLogin = () => {
    // 游客登录
    toast({
      title: "游客登录",
      description: "您正在以游客身份浏览",
      variant: "default"
    });
    navigateTo({
      pageId: 'index',
      params: {}
    });
  };
  const handleSocialLogin = provider => {
    // 社交登录
    toast({
      title: "功能开发中",
      description: `${provider}登录功能正在开发中`,
      variant: "default"
    });
  };
  return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <FadeIn>
        <Card className="w-full max-w-md bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white text-center">
              {isLogin ? '欢迎回来' : '加入我们'}
            </CardTitle>
            <p className="text-slate-400 text-center mt-2">
              {isLogin ? '登录您的账户继续红色之旅' : '创建账户分享红色故事'}
            </p>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 用户名 */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  用户名
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input type="text" value={formData.username} onChange={e => handleInputChange('username', e.target.value)} placeholder={isLogin ? "用户名或邮箱" : "请输入用户名"} maxLength={20} className={cn("w-full pl-10 pr-3 py-2 bg-slate-700/50 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20", errors.username ? "border-red-500" : "border-slate-600")} />
                </div>
                {errors.username && <p className="text-red-400 text-sm mt-1">{errors.username}</p>}
              </div>

              {/* 邮箱 - 注册时显示 */}
              {!isLogin && <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    邮箱
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input type="email" value={formData.email} onChange={e => handleInputChange('email', e.target.value)} placeholder="请输入邮箱" className={cn("w-full pl-10 pr-3 py-2 bg-slate-700/50 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20", errors.email ? "border-red-500" : "border-slate-600")} />
                  </div>
                  {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
                </div>}

              {/* 手机号 - 注册时显示 */}
              {!isLogin && <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    手机号
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input type="tel" value={formData.phone} onChange={e => handleInputChange('phone', e.target.value)} placeholder="请输入手机号" className={cn("w-full pl-10 pr-3 py-2 bg-slate-700/50 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20", errors.phone ? "border-red-500" : "border-slate-600")} />
                  </div>
                  {errors.phone && <p className="text-red-400 text-sm mt-1">{errors.phone}</p>}
                </div>}

              {/* 密码 */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  密码
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input type={showPassword ? "text" : "password"} value={formData.password} onChange={e => handleInputChange('password', e.target.value)} placeholder="请输入密码" className={cn("w-full pl-10 pr-10 py-2 bg-slate-700/50 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20", errors.password ? "border-red-500" : "border-slate-600")} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
              </div>

              {/* 确认密码 - 注册时显示 */}
              {!isLogin && <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    确认密码
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input type={showConfirmPassword ? "text" : "password"} value={formData.confirmPassword} onChange={e => handleInputChange('confirmPassword', e.target.value)} placeholder="请再次输入密码" className={cn("w-full pl-10 pr-10 py-2 bg-slate-700/50 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20", errors.confirmPassword ? "border-red-500" : "border-slate-600")} />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white">
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>}
                </div>}

              {/* 提交按钮 */}
              <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600">
                {loading ? <div className="animate-pulse">处理中...</div> : isLogin ? <>
                    <LogIn className="w-4 h-4 mr-2" />
                    登录
                  </> : <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    注册
                  </>}
              </Button>

              {/* 游客登录 */}
              <Button type="button" onClick={handleGuestLogin} variant="outline" className="w-full border-slate-600 text-slate-300 hover:bg-slate-700">
                游客登录
              </Button>

              {/* 社交登录 */}
              <div className="space-y-2">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-700" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-slate-800 text-slate-400">或使用</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button type="button" onClick={() => handleSocialLogin('微信')} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                    微信登录
                  </Button>
                  <Button type="button" onClick={() => handleSocialLogin('QQ')} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                    QQ登录
                  </Button>
                </div>
              </div>

              {/* 切换登录/注册 */}
              <div className="text-center">
                <button type="button" onClick={() => {
                setIsLogin(!isLogin);
                setErrors({});
                setFormData({
                  username: '',
                  email: '',
                  phone: '',
                  password: '',
                  confirmPassword: ''
                });
              }} className="text-red-400 hover:text-red-300 text-sm">
                  {isLogin ? '还没有账户？立即注册' : '已有账户？立即登录'}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </FadeIn>
    </div>;
}