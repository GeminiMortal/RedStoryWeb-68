// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button, Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui';
// @ts-ignore;
import { Plus, Search, Filter, Edit, Trash2, Eye, BookOpen, Users, TrendingUp, Calendar, Clock, BarChart3 } from 'lucide-react';

// @ts-ignore;
import { Sidebar } from '@/components/Sidebar';
// @ts-ignore;
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
// @ts-ignore;
import { MobileBottomNav } from '@/components/MobileBottomNav';
// @ts-ignore;
import { StoryCard } from '@/components/StoryCard';
// @ts-ignore;
import { AdminPasswordGate } from '@/components/AdminPasswordGate';
// @ts-ignore;
import { StatCard, InfoCard } from '@/components/AnimatedCard';
export default function AdminPage(props) {
  const {
    $w
  } = props;
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [stories, setStories] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [stats, setStats] = useState({
    totalStories: 0,
    totalDrafts: 0,
    totalViews: 0,
    totalLikes: 0
  });
  const navigateTo = $w.utils.navigateTo;

  // 监听侧边栏折叠状态
  useEffect(() => {
    const checkSidebarState = () => {
      const savedCollapsed = sessionStorage.getItem('sidebarCollapsed');
      setSidebarCollapsed(savedCollapsed === 'true');
    };
    checkSidebarState();

    // 监听 sessionStorage 变化
    const handleStorageChange = () => {
      checkSidebarState();
    };
    window.addEventListener('storage', handleStorageChange);

    // 定期检查状态变化（因为直接修改 sessionStorage 不会触发 storage 事件）
    const interval = setInterval(checkSidebarState, 500);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // 加载数据
  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);
  const loadData = async () => {
    try {
      setLoading(true);
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();

      // 加载已发布的故事
      const publishedResult = await db.collection('red_story').where({
        status: 'published'
      }).orderBy('createdAt', 'desc').get();

      // 加载草稿
      const draftResult = await db.collection('red_story_draft').orderBy('lastSavedAt', 'desc').get();
      if (publishedResult && publishedResult.data) {
        setStories(publishedResult.data);
      }
      if (draftResult && draftResult.data) {
        setDrafts(draftResult.data);
      }

      // 计算统计数据
      const totalStories = publishedResult?.data?.length || 0;
      const totalDrafts = draftResult?.data?.length || 0;
      const totalViews = publishedResult?.data?.reduce((sum, story) => sum + (story.views || 0), 0) || 0;
      const totalLikes = publishedResult?.data?.reduce((sum, story) => sum + (story.likes || 0), 0) || 0;
      setStats({
        totalStories,
        totalDrafts,
        totalViews,
        totalLikes
      });
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 过滤故事
  const filteredStories = stories.filter(story => {
    const matchesSearch = (story.title || '').toLowerCase().includes(searchTerm.toLowerCase()) || (story.content || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !filterStatus || story.status === filterStatus;
    return matchesSearch && matchesStatus;
  });
  const filteredDrafts = drafts.filter(draft => {
    const matchesSearch = (draft.title || '').toLowerCase().includes(searchTerm.toLowerCase()) || (draft.content || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // 动态计算主内容区域的左边距
  const getMainContentClasses = () => {
    const baseClasses = "content-transition sidebar-transition animate-fade-in";
    if (sidebarCollapsed) {
      return `${baseClasses} md:ml-16`;
    } else {
      return `${baseClasses} md:ml-64`;
    }
  };

  // 处理认证成功
  const handleAuthenticated = () => {
    setIsAuthenticated(true);
  };

  // 处理故事操作
  const handleEditStory = (id, isDraft = false) => {
    navigateTo({
      pageId: 'edit',
      params: {
        id,
        isDraft
      }
    });
  };
  const handleDeleteStory = async (id, isDraft = false) => {
    if (!confirm(isDraft ? '确定要删除这个草稿吗？' : '确定要删除这个故事吗？')) {
      return;
    }
    try {
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();
      const collectionName = isDraft ? 'red_story_draft' : 'red_story';
      await db.collection(collectionName).doc(id).remove();

      // 重新加载数据
      await loadData();
      alert(isDraft ? '草稿删除成功' : '故事删除成功');
    } catch (error) {
      console.error('删除失败:', error);
      alert('删除失败，请重试');
    }
  };
  const handleViewStory = id => {
    navigateTo({
      pageId: 'detail',
      params: {
        id
      }
    });
  };

  // 如果未认证，显示登录界面
  if (!isAuthenticated) {
    return <AdminPasswordGate onAuthenticated={handleAuthenticated} navigateTo={navigateTo} />;
  }
  return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <Sidebar currentPage="admin" navigateTo={navigateTo} />

      {/* 主内容区域 */}
      <main className={getMainContentClasses()}>
        {/* 桌面端头部 */}
        <header className="hidden md:block bg-slate-800/90 backdrop-blur-sm border-b border-slate-700 animate-slide-in">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                管理后台
              </h1>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input type="text" placeholder="搜索故事..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-300" />
                </div>
                <Button onClick={() => navigateTo({
                pageId: 'upload',
                params: {}
              })} className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 shadow-lg hover:shadow-red-500/25 transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5 button-press">
                  <Plus className="w-4 h-4 mr-2" />
                  新建故事
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* 英雄区域 */}
        <header className="relative overflow-hidden animate-fade-in">
          <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 via-orange-600/10 to-transparent gradient-animate"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width=%2740%27%20height=%2740%27%20viewBox=%270%200%2040%2040%27%20xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cg%20fill=%27%239C92AC%27%20fill-opacity=%270.03%27%3E%3Cpath%20d=%27M0%2040L40%200H20L0%2020M40%2040V20L20%2040%27/%3E%3C/g%3E%3C/svg%3E')]"></div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-red-400 via-orange-400 to-red-500 bg-clip-text text-transparent animate-pulse-slow">
                管理后台
              </h1>
              <p className="mt-4 text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed animate-fade-in" style={{
              animationDelay: '0.2s'
            }}>
                管理您的红色故事内容，查看统计数据
              </p>
            </div>
          </div>
        </header>

        {/* 统计卡片 */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-fade-in" style={{
        animationDelay: '0.3s'
      }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="已发布故事" value={stats.totalStories} icon={BookOpen} color="blue" delay={0} />
            <StatCard title="草稿数量" value={stats.totalDrafts} icon={Edit} color="yellow" delay={100} />
            <StatCard title="总阅读量" value={stats.totalViews} icon={Eye} color="green" delay={200} />
            <StatCard title="总点赞数" value={stats.totalLikes} icon={TrendingUp} color="red" delay={300} />
          </div>
        </div>

        {/* 搜索和过滤区域 */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-fade-in" style={{
        animationDelay: '0.4s'
      }}>
          <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-slate-700/50 hover-lift">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input type="text" placeholder="搜索故事标题或内容..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-300" />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="pl-10 pr-8 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-300">
                  <option value="">所有状态</option>
                  <option value="published">已发布</option>
                  <option value="draft">草稿</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* 内容区域 */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          {loading ? <LoadingSkeleton type="card" count={6} /> : <>
              {/* 已发布故事 */}
              <div className="mb-12 animate-fade-in" style={{
            animationDelay: '0.5s'
          }}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white flex items-center">
                    <BookOpen className="w-6 h-6 mr-3 text-red-400" />
                    已发布故事 ({filteredStories.length})
                  </h2>
                  <Button onClick={() => navigateTo({
                pageId: 'upload',
                params: {}
              })} className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 shadow-lg hover:shadow-red-500/25 transition-all duration-300 transform hover:scale-105 button-press">
                    <Plus className="w-4 h-4 mr-2" />
                    新建故事
                  </Button>
                </div>
                
                {filteredStories.length === 0 ? <div className="text-center py-16 bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50">
                    <BookOpen className="w-24 h-24 text-slate-600 mx-auto mb-6 animate-bounce" />
                    <h3 className="text-2xl font-medium text-slate-400 mb-3">
                      {searchTerm ? '未找到相关故事' : '暂无已发布故事'}
                    </h3>
                    <p className="text-slate-500 mb-8 max-w-md mx-auto">
                      {searchTerm ? '尝试调整搜索条件' : '开始创建您的第一个红色故事'}
                    </p>
                    {!searchTerm && <Button onClick={() => navigateTo({
                pageId: 'upload',
                params: {}
              })} className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 shadow-lg hover:shadow-red-500/25 transition-all duration-300 transform hover:scale-105 button-press">
                        <Plus className="w-5 h-5 mr-2" />
                        创建第一个故事
                      </Button>}
                  </div> : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredStories.map((story, index) => <StoryCard key={story._id} story={story} type="published" onEdit={handleEditStory} onDelete={handleDeleteStory} onView={handleViewStory} index={index} />)}
                  </div>}
              </div>

              {/* 草稿 */}
              <div className="animate-fade-in" style={{
            animationDelay: '0.6s'
          }}>
                <h2 className="text-2xl font-bold text-white flex items-center mb-6">
                  <Edit className="w-6 h-6 mr-3 text-yellow-400" />
                  草稿 ({filteredDrafts.length})
                </h2>
                
                {filteredDrafts.length === 0 ? <div className="text-center py-16 bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50">
                    <Edit className="w-24 h-24 text-slate-600 mx-auto mb-6 animate-bounce" />
                    <h3 className="text-2xl font-medium text-slate-400 mb-3">
                      {searchTerm ? '未找到相关草稿' : '暂无草稿'}
                    </h3>
                    <p className="text-slate-500 mb-8 max-w-md mx-auto">
                      {searchTerm ? '尝试调整搜索条件' : '创建新故事时会自动保存为草稿'}
                    </p>
                  </div> : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredDrafts.map((draft, index) => <StoryCard key={draft._id} story={draft} type="draft" onEdit={handleEditStory} onDelete={handleDeleteStory} index={index} />)}
                  </div>}
              </div>
            </>}
        </div>
      </main>

      {/* 移动端底部导航 */}
      <MobileBottomNav currentPage="admin" navigateTo={navigateTo} />
    </div>;
}