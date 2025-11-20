// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button, Card, CardContent, CardHeader, CardTitle, Badge, useToast, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui';
// @ts-ignore;
import { Plus, Edit, Trash2, Eye, Clock, Calendar, User, BookOpen, FileText, Search } from 'lucide-react';

// @ts-ignore;
import { Sidebar } from '@/components/Sidebar';
// @ts-ignore;
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
// @ts-ignore;
import { MobileBottomNav } from '@/components/MobileBottomNav';
// @ts-ignore;
import { AnimatedCard } from '@/components/AnimatedCard';
export default function AdminPage(props) {
  const {
    $w
  } = props;
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
  useEffect(() => {
    loadData();
  }, []);
  const loadData = async () => {
    try {
      setLoading(true);
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();
      const publishedResult = await db.collection('red_story').where({
        status: 'published'
      }).orderBy('createdAt', 'desc').get();
      if (publishedResult && publishedResult.data) {
        setPublishedStories(publishedResult.data);
      }
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
      loadData();
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
  const formatDate = timestamp => {
    if (!timestamp) return '未知时间';
    const date = new Date(timestamp);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  const formatRelativeTime = timestamp => {
    if (!timestamp) return '未知时间';
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now - past;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        return `${diffMinutes}分钟前`;
      }
      return `${diffHours}小时前`;
    } else if (diffDays === 1) {
      return '昨天';
    } else if (diffDays < 7) {
      return `${diffDays}天前`;
    } else {
      return formatDate(timestamp);
    }
  };
  const truncateContent = (content, maxLength = 100) => {
    if (!content) return '暂无内容';
    return content.length > maxLength ? content.substring(0, maxLength) + '...' : content;
  };
  const filteredPublished = publishedStories.filter(story => story.title.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredDrafts = drafts.filter(draft => (draft.title || '').toLowerCase().includes(searchTerm.toLowerCase()));
  if (loading) {
    return <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        <Sidebar currentPage="admin" navigateTo={navigateTo} />
        <div className="flex-1 transition-all duration-300 ease-in-out">
          <header className="bg-gray-800/90 backdrop-blur-sm border-b border-gray-700 px-6 py-4">
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
  return <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <Sidebar currentPage="admin" navigateTo={navigateTo} />
      
      <div className="flex-1 transition-all duration-300 ease-in-out">
        <header className="bg-gray-800/90 backdrop-blur-sm border-b border-gray-700 px-4 md:px-6 py-4">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h1 className="text-2xl font-bold text-white">故事管理</h1>
            <div className="flex items-center gap-4">
              <div className="relative flex-1 md:flex-initial">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input type="text" placeholder="搜索故事..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full md:w-64 pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all" />
              </div>
              <Button onClick={() => navigateTo({
              pageId: 'upload',
              params: {}
            })} className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-red-500/25 transition-all duration-300">
                <Plus className="w-4 h-4 mr-2" />
                新建
              </Button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-8 pb-24 md:pb-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-800 border-gray-700 max-w-md mx-auto md:mx-0">
              <TabsTrigger value="published" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-red-600 data-[state=active]:text-white transition-all">
                已发布 ({filteredPublished.length})
              </TabsTrigger>
              <TabsTrigger value="drafts" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white transition-all">
                草稿箱 ({filteredDrafts.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="published" className="mt-6">
              {filteredPublished.length === 0 ? <div className="text-center py-12 animate-fade-in">
                  <BookOpen className="w-20 h-20 text-gray-600 mx-auto mb-4 animate-bounce" />
                  <h3 className="text-xl font-medium text-gray-400 mb-2">暂无已发布故事</h3>
                  <p className="text-gray-500 mb-6">开始创建您的第一个红色故事吧</p>
                  <Button onClick={() => navigateTo({
                pageId: 'upload',
                params: {}
              })} className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-red-500/25 transition-all duration-300">
                    <Plus className="w-4 h-4 mr-2" />
                    创建故事
                  </Button>
                </div> : <div className="grid gap-4">
                  {filteredPublished.map((story, index) => <AnimatedCard key={story._id} delay={index}>
                      <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700 hover:border-red-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-red-500/10">
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <CardTitle className="text-white text-lg line-clamp-1">{story.title}</CardTitle>
                              <div className="flex flex-wrap items-center gap-2 text-sm text-gray-400 mt-2">
                                <span className="flex items-center gap-1">
                                  <User className="w-3 h-3" />
                                  {story.author || '佚名'}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {formatDate(story.createdAt)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {story.read_time || '5分钟'}
                                </span>
                                <Badge variant="outline" className="border-green-600 text-green-400 text-xs">
                                  已发布
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                            {truncateContent(story.content)}
                          </p>
                          
                          {story.tags && story.tags.length > 0 && <div className="flex flex-wrap gap-1 mb-4">
                              {story.tags.slice(0, 3).map((tag, index) => <span key={index} className="px-2 py-1 bg-red-900/30 text-red-300 text-xs rounded-full">
                                  {tag}
                                </span>)}
                            </div>}

                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleView(story._id)} className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white transition-all">
                              <Eye className="w-3 h-3 mr-1" />
                              查看
                            </Button>
                            <Button size="sm" onClick={() => handleEdit(story._id)} className="bg-blue-600 hover:bg-blue-700 transition-all">
                              <Edit className="w-3 h-3 mr-1" />
                              编辑
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDelete(story._id)} className="bg-red-600 hover:bg-red-700 transition-all">
                              <Trash2 className="w-3 h-3 mr-1" />
                              删除
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </AnimatedCard>)}
                </div>}
            </TabsContent>

            <TabsContent value="drafts" className="mt-6">
              {filteredDrafts.length === 0 ? <div className="text-center py-12 animate-fade-in">
                  <FileText className="w-20 h-20 text-gray-600 mx-auto mb-4 animate-bounce" />
                  <h3 className="text-xl font-medium text-gray-400 mb-2">暂无草稿</h3>
                  <p className="text-gray-500 mb-6">创建或编辑故事时会自动保存为草稿</p>
                  <Button onClick={() => navigateTo({
                pageId: 'upload',
                params: {}
              })} className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-blue-500/25 transition-all duration-300">
                    <Plus className="w-4 h-4 mr-2" />
                    创建草稿
                  </Button>
                </div> : <div className="grid gap-4">
                  {filteredDrafts.map((draft, index) => <AnimatedCard key={draft._id} delay={index}>
                      <Card className="bg-gray-800/50 backdrop-blur-sm border-gray-700 hover:border-blue-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10">
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <CardTitle className="text-white text-lg line-clamp-1">{draft.title || '无标题草稿'}</CardTitle>
                              <div className="flex flex-wrap items-center gap-2 text-sm text-gray-400 mt-2">
                                <span className="flex items-center gap-1">
                                  <User className="w-3 h-3" />
                                  {draft.draftOwner || '未知用户'}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formatRelativeTime(draft.lastSavedAt)}
                                </span>
                                <Badge variant="outline" className="border-blue-600 text-blue-400 text-xs">
                                  草稿
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                            {truncateContent(draft.content)}
                          </p>
                          
                          {draft.tags && draft.tags.length > 0 && <div className="flex flex-wrap gap-1 mb-4">
                              {draft.tags.slice(0, 3).map((tag, index) => <span key={index} className="px-2 py-1 bg-blue-900/30 text-blue-300 text-xs rounded-full">
                                  {tag}
                                </span>)}
                            </div>}

                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleEdit(draft._id, true)} className="bg-blue-600 hover:bg-blue-700 transition-all">
                              <Edit className="w-3 h-3 mr-1" />
                              编辑
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDelete(draft._id, true)} className="bg-red-600 hover:bg-red-700 transition-all">
                              <Trash2 className="w-3 h-3 mr-1" />
                              删除
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </AnimatedCard>)}
                </div>}
            </TabsContent>
          </Tabs>
        </main>

        <MobileBottomNav currentPage="admin" navigateTo={navigateTo} />
      </div>
    </div>;
}