// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button, Card, CardContent, CardHeader, CardTitle, Badge, useToast } from '@/components/ui';
// @ts-ignore;
import { Plus, Edit, Trash2, Eye, Clock, Calendar, User, BookOpen, AlertCircle } from 'lucide-react';

// @ts-ignore;
import { PageHeader, BottomNav } from '@/components/Navigation';
export default function AdminPage(props) {
  const {
    $w
  } = props;
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const {
    toast
  } = useToast();
  const navigateTo = $w.utils.navigateTo;

  // 仅加载已发布的故事
  useEffect(() => {
    loadStories();
  }, []);
  const loadStories = async () => {
    try {
      setLoading(true);
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();

      // 仅查询 red_story 主库中已发布的内容
      const result = await db.collection('red_story').where({
        status: 'published'
      }).orderBy('createdAt', 'desc').get();
      if (result && result.data) {
        setStories(result.data);
      }
    } catch (err) {
      console.error('加载故事列表失败:', err);
      setError('加载失败，请稍后重试');
      toast({
        title: '加载失败',
        description: '无法加载故事列表',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  const handleEdit = storyId => {
    navigateTo({
      pageId: 'edit',
      params: {
        id: storyId
      }
    });
  };
  const handleDelete = async storyId => {
    if (!confirm('确定要删除这个故事吗？此操作不可恢复！')) return;
    try {
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();
      await db.collection('red_story').doc(storyId).remove();
      toast({
        title: '删除成功',
        description: '故事已从主库删除'
      });
      loadStories(); // 重新加载列表
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
      day: '2-digit'
    });
  };
  const truncateContent = (content, maxLength = 100) => {
    if (!content) return '暂无内容';
    return content.length > maxLength ? content.substring(0, maxLength) + '...' : content;
  };
  if (loading) {
    return <div className="min-h-screen bg-gray-900 text-white">
        <PageHeader title="故事管理" showBack={true} onBack={() => navigateTo({
        pageId: 'index',
        params: {}
      })} />
        <main className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-400">加载故事列表中...</p>
          </div>
        </main>
        <BottomNav currentPage="admin" navigateTo={navigateTo} />
      </div>;
  }
  if (error) {
    return <div className="min-h-screen bg-gray-900 text-white">
        <PageHeader title="故事管理" showBack={true} onBack={() => navigateTo({
        pageId: 'index',
        params: {}
      })} />
        <main className="max-w-6xl mx-auto px-4 py-8">
          <div className="bg-red-900/20 border border-red-600/50 rounded-lg p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">加载失败</h2>
            <p className="text-gray-400">{error}</p>
            <Button onClick={loadStories} className="mt-4 bg-red-600 hover:bg-red-700">
              重新加载
            </Button>
          </div>
        </main>
        <BottomNav currentPage="admin" navigateTo={navigateTo} />
      </div>;
  }
  return <div className="min-h-screen bg-gray-900 text-white">
      <PageHeader title="故事管理" showBack={true} onBack={() => navigateTo({
      pageId: 'index',
      params: {}
    })} />
      
      <main className="max-w-6xl mx-auto px-4 py-8 pb-24">
        {/* 顶部操作栏 */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">已发布故事管理</h1>
            <p className="text-gray-400 mt-1">共 {stories.length} 个已发布故事</p>
          </div>
          <Button onClick={() => navigateTo({
          pageId: 'upload',
          params: {}
        })} className="bg-red-600 hover:bg-red-700">
            <Plus className="w-4 h-4 mr-2" />
            新建故事
          </Button>
        </div>

        {/* 故事列表 */}
        {stories.length === 0 ? <div className="text-center py-12">
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
            {stories.map(story => <Card key={story._id} className="bg-gray-800/50 border-gray-700">
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
      </main>
      
      <BottomNav currentPage="admin" navigateTo={navigateTo} />
    </div>;
}