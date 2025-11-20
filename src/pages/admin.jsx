// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button, Card, CardContent, CardHeader, CardTitle, Badge, useToast, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui';
// @ts-ignore;
import { Plus, Edit, Trash2, Eye, Clock, Calendar, User, BookOpen, AlertCircle, FileText } from 'lucide-react';

// @ts-ignore;
import { Sidebar } from '@/components/Sidebar';
export default function AdminPage(props) {
  const {
    $w
  } = props;
  const [publishedStories, setPublishedStories] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('published');
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
  if (loading) {
    return <div className="min-h-screen bg-gray-900 text-white flex">
        <Sidebar currentPage="admin" navigateTo={navigateTo} />
        <div className="flex-1 transition-all duration-300 ease-in-out">
          <header className="bg-gray-800/80 backdrop-blur-sm border-b border-gray-700">
            <div className="max-w-7xl mx-auto px-6 py-4">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white">故事管理</h1>
                <Button onClick={() => navigateTo({
                pageId: 'upload',
                params: {}
              })} className="bg-red-600 hover:bg-red-700">
                  <Plus className="w-4 h-4 mr-2" />
                  新建故事
                </Button>
              </div>
            </div>
          </header>
          <main className="max-w-7xl mx-auto px-6 py-8">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
              <p className="text-gray-400">加载数据中...</p>
            </div>
          </main>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-gray-900 text-white flex">
      <Sidebar currentPage="admin" navigateTo={navigateTo} />
      
      <div className="flex-1 transition-all duration-300 ease-in-out">
        <header className="bg-gray-800/80 backdrop-blur-sm border-b border-gray-700">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-white">故事管理</h1>
              <Button onClick={() => navigateTo({
              pageId: 'upload',
              params: {}
            })} className="bg-red-600 hover:bg-red-700">
                <Plus className="w-4 h-4 mr-2" />
                新建故事
              </Button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-800 border-gray-700 max-w-md">
              <TabsTrigger value="published" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
                已发布 ({publishedStories.length})
              </TabsTrigger>
              <TabsTrigger value="drafts" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                草稿箱 ({drafts.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="published" className="mt-6">
              {publishedStories.length === 0 ? <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-400 mb-2">暂无已发布故事</h3>
                  <p className="text-gray-500 mb-4">开始创建您的第一个红色故事吧</p>
                  <Button onClick={() => navigateTo({
                pageId: 'upload',
                params: {}
              })} className="bg-red-600 hover:bg-red-700">
                    <Plus className="w-4 h-4 mr-2" />
                    创建故事
                  </Button>
                </div> : <div className="grid gap-4">
                  {publishedStories.map(story => <Card key={story._id} className="bg-gray-800/50 border-gray-700">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <CardTitle className="text-white text-lg mb-2">{story.title}</CardTitle>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400">
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
                              <Badge variant="outline" className="border-green-600 text-green-400">
                                已发布
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-300 text-sm mb-4">
                          {truncateContent(story.content)}
                        </p>
                        
                        {story.tags && story.tags.length > 0 && <div className="flex flex-wrap gap-2 mb-4">
                            {story.tags.map((tag, index) => <span key={index} className="px-2 py-1 bg-red-900/30 text-red-300 text-xs rounded-full">
                                {tag}
                              </span>)}
                          </div>}

                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleView(story._id)} className="border-gray-600 text-gray-300">
                            <Eye className="w-3 h-3 mr-1" />
                            查看
                          </Button>
                          <Button size="sm" onClick={() => handleEdit(story._id)} className="bg-blue-600 hover:bg-blue-700">
                            <Edit className="w-3 h-3 mr-1" />
                            编辑
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(story._id)} className="bg-red-600 hover:bg-red-700">
                            <Trash2 className="w-3 h-3 mr-1" />
                            删除
                          </Button>
                        </div>
                      </CardContent>
                    </Card>)}
                </div>}
            </TabsContent>

            <TabsContent value="drafts" className="mt-6">
              {drafts.length === 0 ? <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-400 mb-2">暂无草稿</h3>
                  <p className="text-gray-500 mb-4">创建或编辑故事时会自动保存为草稿</p>
                  <Button onClick={() => navigateTo({
                pageId: 'upload',
                params: {}
              })} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    创建草稿
                  </Button>
                </div> : <div className="grid gap-4">
                  {drafts.map(draft => <Card key={draft._id} className="bg-gray-800/50 border-gray-700">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <CardTitle className="text-white text-lg mb-2">{draft.title || '无标题草稿'}</CardTitle>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400">
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {draft.draftOwner || '未知用户'}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatRelativeTime(draft.lastSavedAt)}
                              </span>
                              <Badge variant="outline" className="border-blue-600 text-blue-400">
                                草稿
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-300 text-sm mb-4">
                          {truncateContent(draft.content)}
                        </p>
                        
                        {draft.tags && draft.tags.length > 0 && <div className="flex flex-wrap gap-2 mb-4">
                            {draft.tags.map((tag, index) => <span key={index} className="px-2 py-1 bg-blue-900/30 text-blue-300 text-xs rounded-full">
                                {tag}
                              </span>)}
                          </div>}

                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleEdit(draft._id, true)} className="bg-blue-600 hover:bg-blue-700">
                            <Edit className="w-3 h-3 mr-1" />
                            编辑
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(draft._id, true)} className="bg-red-600 hover:bg-red-700">
                            <Trash2 className="w-3 h-3 mr-1" />
                            删除
                          </Button>
                        </div>
                      </CardContent>
                    </Card>)}
                </div>}
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>;
}