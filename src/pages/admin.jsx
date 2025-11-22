// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button, Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui';
// @ts-ignore;
import { Settings, Users, BookOpen, BarChart3, Trash2, Edit, Eye, Search, Filter, Download, Upload, RefreshCw } from 'lucide-react';

// @ts-ignore;
import { Sidebar } from '@/components/Sidebar';
// @ts-ignore;
import { MobileBottomNav } from '@/components/MobileBottomNav';
// @ts-ignore;
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
// @ts-ignore;
import { StoryCard } from '@/components/StoryCard';
// @ts-ignore;
import { AdminPasswordGate } from '@/components/AdminPasswordGate';
export default function AdminPage(props) {
  const {
    $w
  } = props;
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [stories, setStories] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [activeTab, setActiveTab] = useState('published');
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

    // 定期检查状态变化
    const interval = setInterval(checkSidebarState, 500);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // 动态计算主内容区域的左边距
  const getMainContentClasses = () => {
    const baseClasses = "content-transition sidebar-transition animate-fade-in";
    if (sidebarCollapsed) {
      return `${baseClasses} md:ml-16`;
    } else {
      return `${baseClasses} md:ml-64`;
    }
  };

  // 认证成功后加载数据
  const handleAuthenticated = () => {
    setIsAuthenticated(true);
    loadAllData();
  };

  // 加载所有数据
  const loadAllData = async () => {
    try {
      setLoading(true);
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();

      // 并行加载已发布故事和草稿
      const [publishedResult, draftResult] = await Promise.all([db.collection('red_story').where({
        status: 'published'
      }).orderBy('createdAt', 'desc').get(), db.collection('red_story_draft').where({
        status: 'draft'
      }).orderBy('lastSavedAt', 'desc').get()]);

      // 处理已发布故事
      if (publishedResult && publishedResult.data) {
        setStories(publishedResult.data);
      }

      // 处理草稿
      if (draftResult && draftResult.data) {
        setDrafts(draftResult.data);
      }

      // 计算统计数据
      const totalViews = publishedResult.data?.reduce((sum, story) => sum + (story.views || 0), 0) || 0;
      const totalLikes = publishedResult.data?.reduce((sum, story) => sum + (story.likes || 0), 0) || 0;
      setStats({
        totalStories: publishedResult.data?.length || 0,
        totalDrafts: draftResult.data?.length || 0,
        totalViews,
        totalLikes
      });
    } catch (error) {
      console.error('加载数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 删除故事
  const handleDeleteStory = async (storyId, isDraft = false) => {
    const confirmMessage = isDraft ? '确定要删除这个草稿吗？' : '确定要删除这个故事吗？此操作不可恢复。';
    if (!window.confirm(confirmMessage)) return;
    try {
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();
      const collectionName = isDraft ? 'red_story_draft' : 'red_story';
      await db.collection(collectionName).doc(storyId).remove();

      // 更新本地状态
      if (isDraft) {
        setDrafts(prev => prev.filter(draft => draft._id !== storyId));
      } else {
        setStories(prev => prev.filter(story => story._id !== storyId));
      }

      // 重新加载统计数据
      loadAllData();
    } catch (error) {
      console.error('删除失败:', error);
      alert('删除失败，请重试');
    }
  };

  // 编辑故事
  const handleEditStory = (storyId, isDraft = false) => {
    if (isDraft) {
      navigateTo({
        pageId: 'edit',
        params: {
          edit: true,
          draftId: storyId
        }
      });
    } else {
      navigateTo({
        pageId: 'edit',
        params: {
          edit: true,
          storyId: storyId
        }
      });
    }
  };

  // 查看故事
  const handleViewStory = storyId => {
    navigateTo({
      pageId: 'detail',
      params: {
        id: storyId
      }
    });
  };

  // 过滤故事
  const filteredStories = stories.filter(story => {
    const matchesSearch = (story.title || '').toLowerCase().includes(searchTerm.toLowerCase()) || (story.author || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || story.status === filterStatus;
    return matchesSearch && matchesStatus;
  });
  const filteredDrafts = drafts.filter(draft => {
    const matchesSearch = (draft.title || '').toLowerCase().includes(searchTerm.toLowerCase()) || (draft.author || draft.draftOwner || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // 如果未认证，显示密码验证界面
  if (!isAuthenticated) {
    return <AdminPasswordGate onAuthenticated={handleAuthenticated} />;
  }
  return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <Sidebar currentPage="admin" navigateTo={navigateTo} />

      {/* 主内容区域 - 修复左边距问题 */}
      <main className={getMainContentClasses()}>
        {/* 页面头部 */}
        <header className="bg-slate-800/90 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center space-x-3">
                <Settings className="w-6 h-6 text-red-500" />
                <h1 className="text-2xl font-bold text-white">管理后台</h1>
              </div>
              
              <div className="flex items-center space-x-4">
                <Button onClick={loadAllData} disabled={loading} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white transition-all">
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  刷新
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* 统计卡片 */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 rounded-xl p-4 hover-lift">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <BookOpen className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-slate-400 text-sm">已发布</p>
                  <p className="text-white text-xl font-bold">{stats.totalStories}</p>
                </div>
              </div>
            </Card>
            
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 rounded-xl p-4 hover-lift">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <Edit className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-slate-400 text-sm">草稿</p>
                  <p className="text-white text-xl font-bold">{stats.totalDrafts}</p>
                </div>
              </div>
            </Card>
            
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 rounded-xl p-4 hover-lift">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Eye className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-slate-400 text-sm">总阅读量</p>
                  <p className="text-white text-xl font-bold">{stats.totalViews}</p>
                </div>
              </div>
            </Card>
            
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 rounded-xl p-4 hover-lift">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <p className="text-slate-400 text-sm">总点赞数</p>
                  <p className="text-white text-xl font-bold">{stats.totalLikes}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* 搜索和过滤 */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 mb-6 border border-slate-700/50">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input type="text" placeholder="搜索故事标题或作者..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-300" />
              </div>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-300">
                <option value="all">所有状态</option>
                <option value="published">已发布</option>
                <option value="draft">草稿</option>
                <option value="archived">已归档</option>
              </select>
            </div>
          </div>

          {/* 标签页 */}
          <div className="flex space-x-1 mb-6">
            <button onClick={() => setActiveTab('published')} className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${activeTab === 'published' ? 'bg-red-500 text-white' : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'}`}>
              已发布 ({stories.length})
            </button>
            <button onClick={() => setActiveTab('drafts')} className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${activeTab === 'drafts' ? 'bg-red-500 text-white' : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'}`}>
              草稿 ({drafts.length})
            </button>
          </div>

          {/* 内容区域 */}
          {loading ? <LoadingSkeleton type="card" count={6} /> : <div className="space-y-6">
              {activeTab === 'published' && <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredStories.map((story, index) => <StoryCard key={story._id} story={story} type="published" onEdit={handleEditStory} onDelete={handleDeleteStory} onView={handleViewStory} index={index} />)}
                </div>}
              
              {activeTab === 'drafts' && <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredDrafts.map((draft, index) => <StoryCard key={draft._id} story={draft} type="draft" onEdit={handleEditStory} onDelete={handleDeleteStory} onView={handleViewStory} index={index} />)}
                </div>}
              
              {(activeTab === 'published' && filteredStories.length === 0 || activeTab === 'drafts' && filteredDrafts.length === 0) && <div className="text-center py-16">
                  <BookOpen className="w-24 h-24 text-slate-600 mx-auto mb-6 animate-bounce" />
                  <h3 className="text-2xl font-medium text-slate-400 mb-3">
                    {searchTerm ? '未找到相关故事' : '暂无故事'}
                  </h3>
                  <p className="text-slate-500 mb-8 max-w-md mx-auto">
                    {searchTerm ? '尝试调整搜索条件' : '开始创建您的第一个红色故事'}
                  </p>
                  {!searchTerm && <Button onClick={() => navigateTo({
              pageId: 'upload',
              params: {}
            })} className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 shadow-lg hover:shadow-red-500/25 transition-all duration-300 transform hover:scale-105">
                      <Upload className="w-4 h-4 mr-2" />
                      创建故事
                    </Button>}
                </div>}
            </div>}
        </div>
      </main>

      <MobileBottomNav currentPage="admin" navigateTo={navigateTo} />
    </div>;
}