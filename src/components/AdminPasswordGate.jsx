// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Button, Card, CardContent, CardHeader, CardTitle, useToast } from '@/components/ui';
// @ts-ignore;
import { Shield, Lock } from 'lucide-react';

// @ts-ignore;
import { FadeIn } from './AnimationProvider';
export function AdminPasswordGate({
  onPasswordSubmit
}) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const {
    toast
  } = useToast();
  const handleSubmit = async e => {
    e.preventDefault();
    if (!password.trim()) {
      toast({
        title: '请输入密码',
        variant: 'destructive'
      });
      return;
    }
    setLoading(true);
    try {
      const result = await onPasswordSubmit?.(password);
      if (result !== true) {
        toast({
          title: '密码错误',
          description: '请重试',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: '验证失败',
        description: error.message || '请重试',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  return <FadeIn>
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <Shield className="w-12 h-12 text-red-500" />
            </div>
            <CardTitle className="text-2xl font-bold text-white text-center">
              管理员验证
            </CardTitle>
            <p className="text-slate-400 text-center mt-2">
              请输入管理员密码访问后台
            </p>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="请输入管理员密码" className="w-full pl-10 pr-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20" maxLength={50} />
              </div>
              
              <Button type="submit" disabled={loading || !password.trim()} className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600">
                {loading ? '验证中...' : '验证并进入'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </FadeIn>;
}