// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button, useToast, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui';
// @ts-ignore;
import { Plus, Search, BookOpen, FileText, LogOut, Shield } from 'lucide-react';

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
export default function AdminPage(props) {
  const {
    $w
  } = props;
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [publishedStories, setPublishedStories] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('published');
  const [searchTerm, setSearchTerm] = useState('');
  const {
    toast
  } = useToast();
  const navigateTo = $w.utils.navigateTo;

  // 检查登录状态
  useEffect(() => {
    checkAuthStatus();
  }, []);
  const checkAuthStatus = () => {
    const isAuthenticated = localStorage.getItem('admin_authenticated') === 'true';
    const loginTime = localStorage.getItem('admin_login_time');

    // 检查是否在24小时内登录
    if (isAuthenticated && loginTime) {
      const now = Date.now();
      const loginTimestamp = parseInt(loginTime);
      const hoursSinceLogin = (now - loginTimestamp) / (1000 * 60 * 60);
      if (hoursSinceLogin < 24) {
        setIsAuthenticated(true);
        loadData();
        return;
      } else {
        // 超过24小时，清除登录状态
        localStorage.removeItem('admin_authenticated');
        localStorage.removeItem('admin_login_time');
      }
    }
    setIsAuthenticated(false);
  };
  const handleAuthenticated = () => {
    setIsAuthenticated(true);
    loadData();
  };
  const handleLogout = () => {
    localStorage.removeItem('admin_authenticated');
    localStorage.removeItem('admin_login_time');
    setIsAuthenticated(false);
    toast({
      title: '已退出登录',
      description: '您已安全退出管理界面'
    });
  };
  const loadData = async () => {
    try {
      setLoading(true);
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();

      // 加载已发布故事
      const publishedResult = await db.collection('red_story').where({
        status: 'published'
      }).orderBy('createdAt', 'desc').get();
      if (publishedResult && publishedResult.data) {
        setPublishedStories(publishedResult.data);
      }

      // 加载草稿
      const draftsResult = await db.collection('red_story_draft').orderBy('lastSavedAt', 'desc').get();
      if (draftsResult && draftsResult.data) {
        setDrafts(draftsResult.data);
      }
    } catch (err) {
      console.error('加载数据失败:', err);
      setError('加载失败，请稍后重试');
      toast({
        title: '加载失败',
        description: '无法加载数据',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  const handleEdit = (storyId, isDraft = false) => {
    navigateTo({
      pageId: 'edit',
      params: {
        id: storyId
      }
    });
  };
  const handleDelete = async (storyId, isDraft = false) => {
    const collectionName = isDraft ? 'red_story_draft' : 'red_story';
    const itemType = isDraft ? '草稿' : '故事';
    if (!confirm(`确定要删除这个${itemType}吗？此操作不可恢复！`)) return;
    try {
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();
      await db.collection(collectionName).doc(storyId).remove();
      toast({
        title: '删除成功',
        description: `${itemType}已删除`
      });
      loadData(); // 重新加载数据
    } catch (err) {
      console.error('删除失败:', err);
      toast({
        title: '删除失败',
        description: err.message || '请稍后重试',
        variant: 'destructive'
      });
    }
  };
  const handleView = storyId => {
    navigateTo({
      pageId: 'detail',
      params: {
        id: storyId
      }
    });
  };

  // 搜索过滤
  const filteredPublished = publishedStories.filter(story => (story.title || '').toLowerCase().includes(searchTerm.toLowerCase()) || (story.content || '').toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredDrafts = drafts.filter(draft => (draft.title || '无标题草稿').toLowerCase().includes(searchTerm.toLowerCase()));

  // 如果未认证，显示密码验证界面
  if (!isAuthenticated) {
    return <AdminPasswordGate onAuthenticated={handleAuthenticated} />;
  }

  // 加载状态
  if (loading) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <Sidebar currentPage="admin" navigateTo={navigateTo} />
        <div className="flex-1 transition-all duration-300 ease-in-out">
          <header className="bg-slate-800/90 backdrop-blur-sm border-b border-slate-700 px-6 py-4">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
              <h1 className="text-2xl font-bold text-white">故事管理</h1>
              <Button onClick={() => navigateTo({
              pageId: 'upload',
              params: {}
            })} className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-red-500/25 transition-all duration-300">
                <Plus className="w-4 h-4 mr-2" />
                新建故事
              </Button>
            </div>
          </header>
          <main className="max-w-7xl mx-auto px-6 py-8">
            <LoadingSkeleton type="card" count={6} />
          </main>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <Sidebar currentPage="admin" navigateTo={navigateTo} />
      
      <div className="flex-1 transition-all duration-300 ease-in-out">
        <header className="bg-slate-800/90 backdrop-blur-sm border-b border-slate-700 px-4 md:px-6 py-4">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-white">故事管理</h1>
              <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 border border-green-500/50 rounded-full">
                <Shield className="w-4 h-4 text-green-400" />
                <span className="text-sm text-green-400">已认证</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative flex-1 md:flex-initial">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input type="text" placeholder="搜索故事..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full md:w-64 pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all" />
              </div>
              <Button onClick={() => navigateTo({
              pageId: 'upload',
              params: {}
            })} className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-red-500/25 transition-all duration-300">
                <Plus className="w-4 h-4 mr-2" />
                新建
              </Button>
              <Button onClick={handleLogout} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white transition-all">
                <LogOut className="w-4 h-4 mr-2" />
                退出
              </Button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-8 pb-24 md:pb-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-slate-800 border-slate-700 max-w-md mx-auto md:mx-0">
              <TabsTrigger value="published" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-red-600 data-[state=active]:text-white transition-all">
                <BookOpen className="w-4 h-4 mr-2" />
                已发布 ({filteredPublished.length})
              </TabsTrigger>
              <TabsTrigger value="drafts" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white transition-all">
                <FileText className="w-4 h-4 mr-2" />
                草稿箱 ({filteredDrafts.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="published" className="mt-6">
              {filteredPublished.length === 0 ? <div className="text-center py-12 animate-fade-in">
                  <BookOpen className="w-20 h-20 text-slate-600 mx-auto mb-4 animate-bounce" />
                  <h3 className="text-xl font-medium text-slate-400 mb-2">
                    {searchTerm ? '未找到相关故事' : '暂无已发布故事'}
                  </h3>
                  <p className="text-slate-500 mb-6">
                    {searchTerm ? '尝试其他关键词' : '开始创建您的第一个红色故事吧'}
                  </p>
                  {!searchTerm && <Button onClick={() => navigateTo({
                pageId: 'upload',
                params: {}
              })} className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-red-500/25 transition-all duration-300">
                      <Plus className="w-4 h-4 mr-2" />
                      创建故事
                    </Button>}
                </div> : <div className="grid gap-4">
                  {filteredPublished.map((story, index) => <StoryCard key={story._id} story={story} type="published" index={index} onEdit={handleEdit} onDelete={handleDelete} onView={handleView} />)}
                </div>}
            </TabsContent>

            <TabsContent value="drafts" className="mt-6">
              {filteredDrafts.length === 0 ? <div className="text-center py-12 animate-fade-in">
                  <FileText className="w-20 h-20 text-slate-600 mx-auto mb-4 animate-bounce" />
                  <h3 className="text-xl font-medium text-slate-400 mb-2">
                    {searchTerm ? '未找到相关草稿' : '暂无草稿'}
                  </h3>
                  <p className="text-slate-500 mb-6">
                    {searchTerm ? '尝试其他关键词' : '创建或编辑故事时会自动保存为草稿'}
                  </p>
                  {!searchTerm && <Button onClick={() => navigateTo({
                pageId: 'upload',
                params: {}
              })} className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-blue-500/25 transition-all duration-300">
                      <Plus className="w-4 h-4 mr-2" />
                      创建草稿
                    </Button>}
                </div> : <div className="grid gap-4">
                  {filteredDrafts.map((draft, index) => <StoryCard key={draft._id} story={draft} type="draft" index={index} onEdit={handleEdit} onDelete={handleDelete} />)}
                </div>}
            </TabsContent>
          </Tabs>
        </main>
      </div>

      <MobileBottomNav currentPage="admin" navigateTo={navigateTo} />
    </div>;
}