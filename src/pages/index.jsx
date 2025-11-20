// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button } from '@/components/ui';
// @ts-ignore;
import { Search, Filter, Clock, MapPin, Calendar, Users, Tag, Eye, ArrowRight, Plus } from 'lucide-react';

export default function HomePage(props) {
  const {
    $w
  } = props;
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // 从数据模型加载红色故事
  const loadStories = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('开始加载红色故事数据...');
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'red_story',
        methodName: 'wedaGetRecordsV2',
        params: {
          select: {
            $master: true
          },
          orderBy: [{
            createdAt: 'desc'
          }],
          getCount: true,
          pageSize: 50
        }
      });
      console.log('首页数据加载结果:', result);
      if (result.records && result.records.length > 0) {
        const mappedStories = result.records.map(record => ({
          id: record._id,
          title: record.title || '未命名故事',
          content: record.content || '',
          image: record.image || '',
          date: record.date || '',
          location: record.location || '',
          author: record.author || '佚名',
          readTime: record.read_time || '5分钟',
          tags: Array.isArray(record.tags) ? record.tags : [],
          status: record.status || 'draft',
          createdAt: record.createdAt
        }));
        setStories(mappedStories);
      } else {
        setStories([]);
      }
    } catch (err) {
      console.error('加载红色故事失败:', err);
      setError(`加载失败: ${err.message || '未知错误'}`);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadStories();
  }, [$w]);

  // 过滤故事
  const filteredStories = stories.filter(story => {
    const matchesSearch = story.title.toLowerCase().includes(searchTerm.toLowerCase()) || story.content.toLowerCase().includes(searchTerm.toLowerCase()) || story.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || story.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // 导航函数
  const navigateToDetail = storyId => {
    if (!storyId) {
      setError('故事ID无效');
      return;
    }
    $w.utils.navigateTo({
      pageId: 'detail',
      params: {
        id: storyId
      }
    });
  };
  const navigateToUpload = () => {
    $w.utils.navigateTo({
      pageId: 'upload',
      params: {}
    });
  };
  const navigateToAdmin = () => {
    $w.utils.navigateTo({
      pageId: 'admin',
      params: {}
    });
  };

  // 格式化日期
  const formatDate = dateString => {
    if (!dateString) return '未知时间';
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  if (loading) {
    return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-400">加载红色记忆中...</p>
        </div>
      </div>;
  }
  if (error) {
    return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-400 mb-4">{error}</h2>
          <Button onClick={loadStories} className="bg-red-600 hover:bg-red-700 text-white">
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
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-red-600 mb-2">红色记忆</h1>
              <p className="text-gray-300">传承红色基因，续红色血脉</p>
            </div>
            <div className="flex gap-3">
              <Button onClick={navigateToUpload} className="bg-red-600 hover:bg-red-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                分享故事
              </Button>
              <Button onClick={navigateToAdmin} variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                管理后台
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* 搜索和过滤 */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-gray-700 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="搜索红色故事..." className="w-full pl-10 pr-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent" />
              </div>
            </div>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent">
              <option value="all">全部故事</option>
              <option value="published">已发布</option>
              <option value="draft">草稿</option>
            </select>
          </div>
        </div>

        {/* 故事列表 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStories.map(story => <div key={story.id} className="bg-gray-800/50 backdrop-blur-sm rounded-2xl overflow-hidden shadow-2xl border border-gray-700 hover:border-red-600/50 transition-all duration-300 hover:shadow-red-900/20">
              {story.image ? <img src={story.image} alt={story.title} className="w-full h-48 object-cover" /> : <div className="w-full h-48 bg-gradient-to-br from-red-900/30 to-gray-800/30 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-red-900/50 rounded-full flex items-center justify-center mx-auto mb-2">
                      <svg className="w-8 h-8 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-gray-400 text-sm">暂无图片</p>
                  </div>
                </div>}
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">{story.title}</h3>
                <p className="text-gray-400 text-sm mb-4 line-clamp-3">{story.content}</p>
                
                <div className="flex items-center gap-4 text-sm text-gray-300 mb-4">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{story.author}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{story.readTime}</span>
                  </div>
                </div>

                {story.tags.length > 0 && <div className="flex flex-wrap gap-1 mb-4">
                    {story.tags.slice(0, 3).map((tag, index) => <span key={index} className="px-2 py-1 bg-red-900/30 text-red-300 rounded text-xs">
                        <Tag className="w-3 h-3 inline mr-1" />
                        {tag}
                      </span>)}
                  </div>}

                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-400">
                    {story.date && <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {story.date}
                      </div>}
                    {story.location && <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {story.location}
                      </div>}
                  </div>
                  <Button onClick={() => navigateToDetail(story.id)} variant="ghost" className="text-red-400 hover:text-red-300">
                    <Eye className="w-4 h-4 mr-1" />
                    查看
                  </Button>
                </div>
              </div>
            </div>)}
        </div>

        {filteredStories.length === 0 && <div className="text-center py-12">
            <div className="text-gray-400 mb-4">暂无红色故事</div>
            <Button onClick={navigateToUpload} className="bg-red-600 hover:bg-red-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              创建第一个红色故事
            </Button>
          </div>}
      </main>
    </div>;
}