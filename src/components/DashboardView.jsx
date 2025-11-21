// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Users, UserPlus, Activity, DollarSign } from 'lucide-react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';

import { StatCard } from '@/components/StatCard';
export function DashboardView() {
  const stats = [{
    title: '总用户数',
    value: '2,543',
    change: 12.5,
    changeType: 'up',
    icon: Users
  }, {
    title: '今日新增',
    value: '89',
    change: 8.2,
    changeType: 'up',
    icon: UserPlus
  }, {
    title: '活跃用户',
    value: '1,234',
    change: -2.1,
    changeType: 'down',
    icon: Activity
  }, {
    title: '总收入',
    value: '¥45,231',
    change: 15.3,
    changeType: 'up',
    icon: DollarSign
  }];
  return <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">仪表板</h1>
        <p className="text-gray-500">欢迎回来，管理员</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map(stat => <StatCard key={stat.title} {...stat} />)}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>最近活动</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">新用户注册</p>
                  <p className="text-xs text-gray-500">张三 注册了账户</p>
                </div>
                <span className="text-xs text-gray-500">2分钟前</span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">内容发布</p>
                  <p className="text-xs text-gray-500">李四 发布了新文章</p>
                </div>
                <span className="text-xs text-gray-500">5分钟前</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>系统状态</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">服务器状态</span>
                <span className="text-sm text-green-600 font-medium">正常运行</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">数据库连接</span>
                <span className="text-sm text-green-600 font-medium">已连接</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">API响应时间</span>
                <span className="text-sm text-gray-600">45ms</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>;
}