// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button, Card, CardContent, CardHeader, CardTitle, Badge, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui';
// @ts-ignore;
import { Shield, Users, FileText, Settings } from 'lucide-react';
// @ts-ignore;
import { cn } from '@/lib/utils';

// @ts-ignore;
import { Sidebar } from '@/components/Sidebar';
// @ts-ignore;
import { MobileBottomNav } from '@/components/MobileBottomNav';
// @ts-ignore;
import { useSidebar } from '@/components/SidebarStore';
// @ts-ignore;
import { FadeIn } from '@/components/AnimationProvider';
// @ts-ignore;
import { AdminPasswordGate } from '@/components/AdminPasswordGate';
// @ts-ignore;
import { DashboardView } from '@/components/DashboardView';
// @ts-ignore;
import { UserManagement } from '@/components/UserManagement';
// @ts-ignore;
import { ContentManagement } from '@/components/ContentManagement';
// @ts-ignore;
import { Settings as SettingsPage } from '@/components/Settings';
export default function AdminPage(props) {
  const {
    $w
  } = props || {};
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    totalStories: 0,
    publishedStories: 0,
    draftStories: 0,
    totalUsers: 0,
    todayViews: 0
  });
  const [stories, setStories] = useState([]);
  const [users, setUsers] = useState([]);
  const {
    isOpen
  } = useSidebar() || {};
  const navigateTo = $w?.utils?.navigateTo || (() => {});

  // 检查管理员权限
  useEffect(() => {
    checkAdminPermission();
  }, []);
  const checkAdminPermission = async () => {
    try {
      setLoading(true);
      const tcb = await $w?.cloud?.getCloudInstance?.();
      if (!tcb) {
        setLoading(false);
        return;
      }

      // 检查当前用户是否为管理员
      const currentUser = $w?.auth?.currentUser;
      if (!currentUser) {
        setLoading(false);
        return;
      }

      // 从权限表检查
      const permissionResult = await tcb.database().collection('red_story_permissions').where({
        userId: currentUser.userId,
        role: 'admin'
      }).get();
      if (permissionResult?.data?.length > 0) {
        setIsAuthenticated(true);
        loadAdminData();
      } else {
        // 检查是否为第一个用户（默认管理员）
        const userCount = await tcb.database().collection('red_story_permissions').count();
        if (userCount?.total === 0) {
          // 创建默认管理员
          await tcb.database().collection('red_story_permissions').add({
            userId: currentUser.userId,
            role: 'admin',
            createdAt: Date.now()
          });
          setIsAuthenticated(true);
          loadAdminData();
        }
      }
    } catch (error) {
      console.error('权限检查失败:', error);
    } finally {
      setLoading(false);
    }
  };
  const loadAdminData = async () => {
    try {
      const tcb = await $w?.cloud?.getCloudInstance?.();
      if (!tcb) return;
      const db = tcb.database();

      // 加载故事统计
      const storiesResult = await db.collection('red_story').get();
      const allStories = storiesResult?.data || [];
      setStories(allStories);
      setStats({
        totalStories: allStories.length,
        publishedStories: allStories.filter(s => s?.status === 'published').length,
        draftStories: allStories.filter(s => s?.status === 'draft').length,
        totalUsers: 0,
        // 需要用户系统
        todayViews: allStories.reduce((sum, s) => sum + (s?.views || 0), 0)
      });

      // 加载用户列表
      const usersResult = await db.collection('red_story_permissions').get();
      setUsers(usersResult?.data || []);
    } catch (error) {
      console.error('加载管理数据失败:', error);
    }
  };
  const handlePasswordSubmit = async password => {
    // 简单的密码验证，实际应该使用云函数
    if (password === 'admin123') {
      setIsAuthenticated(true);
      loadAdminData();
      return true;
    }
    return false;
  };
  if (loading) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-pulse">
          <Shield className="w-12 h-12 text-red-500 animate-bounce" />
          <p className="text-slate-400 mt-4">检查权限中...</p>
        </div>
      </div>;
  }
  if (!isAuthenticated) {
    return <AdminPasswordGate onPasswordSubmit={handlePasswordSubmit} />;
  }
  const tabs = [{
    id: 'dashboard',
    label: '仪表盘',
    icon: Shield
  }, {
    id: 'content',
    label: '内容管理',
    icon: FileText
  }, {
    id: 'users',
    label: '用户管理',
    icon: Users
  }, {
    id: 'settings',
    label: '系统设置',
    icon: Settings
  }];
  return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <Sidebar currentPage="admin" navigateTo={navigateTo} />

      <main className={cn("transition-all duration-300 ease-in-out", isOpen ? "lg:ml-64" : "lg:ml-0")}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <FadeIn>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">管理后台</h1>
              <p className="text-slate-400">管理红色故事内容和用户权限</p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="bg-slate-800/50 border-slate-700">
                {tabs.map(tab => <TabsTrigger key={tab.id} value={tab.id} className="data-[state=active]:bg-red-500 data-[state=active]:text-white">
                    <tab.icon className="w-4 h-4 mr-2" />
                    {tab.label}
                  </TabsTrigger>)}
              </TabsList>

              <TabsContent value="dashboard">
                <DashboardView stats={stats} stories={stories} />
              </TabsContent>

              <TabsContent value="content">
                <ContentManagement stories={stories} onRefresh={loadAdminData} />
              </TabsContent>

              <TabsContent value="users">
                <UserManagement users={users} onRefresh={loadAdminData} />
              </TabsContent>

              <TabsContent value="settings">
                <SettingsPage />
              </TabsContent>
            </Tabs>
          </FadeIn>
        </div>
      </main>

      <MobileBottomNav currentPage="admin" navigateTo={navigateTo} />
    </div>;
}