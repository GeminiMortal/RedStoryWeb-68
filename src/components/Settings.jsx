// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Label, Switch, Input, Button } from '@/components/ui';
// @ts-ignore;
import { Save } from 'lucide-react';

export function SettingsView() {
  return <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">系统设置</h1>
        <p className="text-gray-500">配置系统参数和偏好设置</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>网站设置</CardTitle>
            <CardDescription>配置网站基本信息</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="site-name">网站名称</Label>
              <Input id="site-name" defaultValue="管理后台" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="site-description">网站描述</Label>
              <Input id="site-description" defaultValue="现代化管理后台系统" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>邮件设置</CardTitle>
            <CardDescription>配置邮件服务器</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="smtp-server">SMTP服务器</Label>
              <Input id="smtp-server" placeholder="smtp.example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtp-port">端口</Label>
              <Input id="smtp-port" type="number" defaultValue={587} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>功能开关</CardTitle>
            <CardDescription>启用或禁用系统功能</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="user-registration">用户注册</Label>
              <Switch id="user-registration" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="email-verification">邮箱验证</Label>
              <Switch id="email-verification" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="maintenance-mode">维护模式</Label>
              <Switch id="maintenance-mode" />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button>
            <Save className="w-4 h-4 mr-2" />
            保存设置
          </Button>
        </div>
      </div>
    </div>;
}