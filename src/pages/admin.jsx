// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button } from '@/components/ui';
// @ts-ignore;
import { ArrowLeft, Trash2, Edit, Eye, Plus, Search, Filter, Calendar, MapPin, Tag, Clock } from 'lucide-react';

export default function AdminPage(props) {
  const {
    $w
  } = props;
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [deletingId, setDeletingId] = useState(null);

  // 从数据模型加载红色故事
  useEffect(() => {
    const loadStories = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await $w.cloud.callDataSource({
          dataSourceName: 'red_story',
          methodName: 'wedaGetRecordsV2',
          params: {
            select: {
              $master: true // 返回所有字段
            },
            orderBy: [{
              createdAt: 'desc' // 按创建时间降序排列
            }],
            getCount: true,
            pageSize: 100 // 获取最多100条记录
          }
        });
        if (result.records && result.records.length > 0) {
          // 将数据库字段映射为前端所需格式
          const mappedStories = result.records.map(record => ({
            id: record._id,
            title: record.title || '未命名故事',
            content: record.content || '',
            image: record.image,
            date: record.date,
            location: record.location,
            author: record.author,
            readTime: record.read_time,
            tags: record.tags || [],
            status: record.status,
            order: record.order,
            createdAt: record.createdAt,
            updatedAt: record.updatedAt
          }));
          setStories(mappedStories);
        } else {
          setStories([]);
        }
      } catch (err) {
        console.error('加载红色故事失败:', err);
        setError('加载红色故事失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };
    loadStories();
  }, [$w]);

  // 删除故事
  const handleDelete = async storyId => {
    if (!window.confirm('确定要删除这个红色故事吗？此操作不可恢复。')) {
      return;
    }
    setDeletingId(storyId);
    try {
      await $w.cloud.callDataSource({
        dataSourceName: 'red_story',
        methodName: 'wedaDeleteV2',
        params: {
          _id: storyId
        }
      });
      // 从本地状态中移除删除的故事
      setStories(prev => prev.filter(story => story.id !== storyId));
      alert('红色故事删除成功');
    } catch (err) {
      console.error('删除红色故事失败:', err);
      alert('删除失败，请稍后重试');
    } finally {
      setDeletingId(null);
    }
  };

  // 过滤和搜索故事
  const filteredStories = stories.filter(story => {
    const matchesSearch = story.title.toLowerCase().includes(searchTerm.toLowerCase()) || story.content && story.content.toLowerCase().includes(searchTerm.toLowerCase()) || story.author && story.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || story.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // 导航函数
  const goBack = () => {
    $w.utils.navigateBack();
  };
  const navigateToUpload = () => {
    $w.utils.navigateTo({
      pageId: 'upload',
      params: {}
    });
  };
  const navigateToDetail = storyId => {
    $w.utils.navigateTo({
      pageId: 'detail',
      params: {
        id: storyId
      }
    });
  };
  const navigateToEdit = storyId => {
    // 可以扩展编辑功能
    alert('编辑功能待实现');
  };

  // 格式化日期
  const formatDate = dateString => {
    if (!dateString) return '未知';
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 获取状态颜色
  const getStatusColor = status => {
    switch (status) {
      case 'published':
        return 'bg-green-900/30 text-green-300';
      case 'draft':
        return 'bg-yellow-900/30 text-yellow-300';
      default:
        return 'bg-gray-900/30 text-gray-300';
    }
  };

  // 获取状态文本
  const getStatusText = status => {
    switch (status) {
      case 'published':
        return '已发布';
      case 'draft':
        return '草稿';
      default:
        return '未知';
    }
  };

  // 加载状态
  if (loading) {
    return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-400">加载管理数据中...</p>
        </div>
      </div>;
  }

  // 错误状态
  if (error) {
    return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-400 mb-4">{error}</h2>
          <Button onClick={() => window.location.reload()} className="bg-red-600 hover:bg-red-700 text-white">
            重新加载
          </Button>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-gray-900 text-white">
      {/* 背景装饰 */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-gray-900 to-gray-900"></div>
      
      {/* 顶部导航 */}
      <header className="relative z-10 bg-black/50 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button onClick={goBack} variant="ghost" className="text-gray-300 hover:text-white">
            <ArrowLeft className="w-5 h-5 mr-2" />
            返回主页
          </Button>
          <h1 className="text-2xl font-bold text-red-600">后台管理</h1>
          <Button onClick={navigateToUpload} className="bg-red-600 hover:bg-red-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            新增故事
          </Button>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* 搜索和过滤 */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-gray-700 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* 搜索框 */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="搜索标题、内容或作者..." className="w-full pl-10 pr-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent" />
              </div>
            </div>

            {/* 状态过滤 */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent">
                <option value="all">全部状态</option>
                <option value="published">已发布</option>
                <option value="draft">草稿</option>
              </select>
            </div>
          </div>

          {/* 统计信息 */}
          <div className="flex gap-6 mt-4 text-sm text-gray-300">
            <span>总计: {stories.length} 个故事</span>
            <span>已发布: {stories.filter(s => s.status === 'published').length} 个</span>
            <span>草稿: {stories.filter(s => s.status === 'draft').length} 个</span>
          </div>
        </div>

        {/* 故事列表 */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700">
          {filteredStories.length === 0 ? <div className="p-12 text-center">
              <div className="text-gray-400 mb-4">
                {searchTerm || filterStatus !== 'all' ? '没有找到匹配的故事' : '暂无红色故事'}
              </div>
              {!searchTerm && filterStatus === 'all' && <Button onClick={navigateToUpload} className="bg-red-600 hover:bg-red-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  创建第一个红色故事
                </Button>}
            </div> : <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-700">
                  <tr className="text-left text-gray-300 text-sm">
                    <th className="px-6 py-4 font-medium">标题</th>
                    <th className="px-6 py-4 font-medium">作者</th>
                    <th className="px-6 py-4 font-medium">时间地点</th>
                    <th className="px-6 py-4 font-medium">状态</th>
                    <th className="px-6 py-4 font-medium">创建时间</th>
                    <th className="px-6 py-4 font-medium text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredStories.map(story => <tr key={story.id} className="hover:bg-gray-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {story.image && <img src={story.image} alt={story.title} className="w-12 h-12 rounded-lg object-cover" />}
                          <div>
                            <div className="font-medium text-white">{story.title}</div>
                            <div className="text-sm text-gray-400 line-clamp-1">
                              {story.content && story.content.length > 50 ? story.content.substring(0, 50) + '...' : story.content || '暂无内容'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-300">{story.author || '佚名'}</td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-300">
                          <div className="flex items-center gap-1 mb-1">
                            <Calendar className="w-3 h-3" />
                            {story.date}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {story.location}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(story.status)}`}>
                          {getStatusText(story.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">{formatDate(story.createdAt)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button onClick={() => navigateToDetail(story.id)} variant="ghost" size="sm" className="text-gray-300 hover:text-white">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button onClick={() => navigateToEdit(story.id)} variant="ghost" size="sm" className="text-gray-300 hover:text-white">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button onClick={() => handleDelete(story.id)} disabled={deletingId === story.id} variant="ghost" size="sm" className="text-red-400 hover:text-red-300">
                            {deletingId === story.id ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-400"></div> : <Trash2 className="w-4 h-4" />}
                          </Button>
                        </div>
                      </td>
                    </tr>)}
                </tbody>
              </table>
            </div>}
        </div>
      </main>
    </div>;
}