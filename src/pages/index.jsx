// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button } from '@/components/ui';
// @ts-ignore;
import { ArrowRight, Calendar, MapPin, Users, Clock, BookOpen, Search, Filter, Heart, Share2, Eye } from 'lucide-react';

export default function IndexPage(props) {
  const {
    $w
  } = props;
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTag, setFilterTag] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 6;

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
            filter: {
              where: {
                status: {
                  $eq: 'published' // 只显示已发布的故事
                }
              }
            },
            select: {
              $master: true // 返回所有字段
            },
            orderBy: [{
              order: 'desc' // 按排序字段降序
            }, {
              createdAt: 'desc' // 再按创建时间降序
            }],
            getCount: true,
            pageSize: pageSize,
            offset: (currentPage - 1) * pageSize
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

          // 计算总页数
          const totalCount = result.totalCount || 0;
          setTotalPages(Math.ceil(totalCount / pageSize));
        } else {
          setStories([]);
          setTotalPages(0);
        }
      } catch (err) {
        console.error('加载红色故事失败:', err);
        setError('加载红色故事失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };
    loadStories();
  }, [currentPage, $w]);

  // 获取所有标签
  const getAllTags = () => {
    const tags = new Set();
    stories.forEach(story => {
      if (story.tags && story.tags.length > 0) {
        story.tags.forEach(tag => tags.add(tag));
      }
    });
    return Array.from(tags);
  };

  // 过滤故事
  const filteredStories = stories.filter(story => {
    const matchesSearch = story.title.toLowerCase().includes(searchTerm.toLowerCase()) || story.content.toLowerCase().includes(searchTerm.toLowerCase()) || story.author && story.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = filterTag === 'all' || story.tags.includes(filterTag);
    return matchesSearch && matchesTag;
  });

  // 导航函数 - 确保正确传递故事ID
  const navigateToDetail = storyId => {
    console.log('跳转到详情页，故事ID:', storyId); // 调试日志
    if (!storyId) {
      console.error('故事ID为空，无法跳转');
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

  // 分页控制
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
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

  // 截取内容预览
  const getContentPreview = (content, maxLength = 120) => {
    if (!content) return '暂无内容';
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  // 加载状态
  if (loading) {
    return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-400">加载红色故事中...</p>
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
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">红色记忆</h1>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <button className="text-gray-300 hover:text-white transition-colors">首页</button>
            <button onClick={navigateToAdmin} className="text-gray-300 hover:text-white transition-colors">管理</button>
            <button onClick={navigateToUpload} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors">
              上传故事
            </button>
          </nav>
          {/* 移动端菜单按钮 */}
          <button className="md:hidden text-gray-300 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* 英雄区域 */}
        <section className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            传承<span className="text-red-600">红色基因</span>
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            记录革命历史，传承红色精神，让每一个红色故事都被永远铭记
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={navigateToUpload} className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 text-lg">
              <BookOpen className="w-5 h-5 mr-2" />
              分享红色故事
            </Button>
            <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800 px-8 py-3 text-lg">
              了解更多
            </Button>
          </div>
        </section>

        {/* 搜索和过滤 */}
        <section className="mb-12">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-gray-700">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* 搜索框 */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="搜索红色故事..." className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent" />
                </div>
              </div>

              {/* 标签过滤 */}
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <select value={filterTag} onChange={e => setFilterTag(e.target.value)} className="px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent">
                  <option value="all">全部标签</option>
                  {getAllTags().map(tag => <option key={tag} value={tag}>
                      {tag}
                    </option>)}
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* 故事列表 */}
        <section className="mb-12">
          {filteredStories.length === 0 ? <div className="text-center py-16">
              <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">
                {searchTerm || filterTag !== 'all' ? '没有找到匹配的红色故事' : '暂无红色故事'}
              </h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || filterTag !== 'all' ? '尝试调整搜索条件或筛选标签' : '成为第一个分享红色故事的人'}
              </p>
              {!searchTerm && filterTag === 'all' && <Button onClick={navigateToUpload} className="bg-red-600 hover:bg-red-700 text-white">
                  <BookOpen className="w-4 h-4 mr-2" />
                  创建第一个红色故事
                </Button>}
            </div> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredStories.map(story => <div key={story.id} onClick={() => navigateToDetail(story.id)} className="bg-gray-800/50 backdrop-blur-sm rounded-2xl overflow-hidden shadow-2xl border border-gray-700 hover:border-red-600/50 transition-all duration-300 hover:shadow-red-600/20 hover:shadow-2xl group cursor-pointer">
                  {/* 图片区域 */}
                  <div className="relative h-48 overflow-hidden">
                    {story.image ? <img src={story.image} alt={story.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" /> : <div className="w-full h-full bg-gradient-to-br from-red-900/30 to-gray-800/30 flex items-center justify-center">
                        <BookOpen className="w-12 h-12 text-gray-600" />
                      </div>}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    
                    {/* 标签 */}
                    {story.tags && story.tags.length > 0 && <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                        {story.tags.slice(0, 2).map((tag, index) => <span key={index} className="px-2 py-1 bg-red-900/80 text-red-200 rounded-full text-xs backdrop-blur-sm">
                            {tag}
                          </span>)}
                      </div>}
                  </div>

                  {/* 内容区域 */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-red-400 transition-colors line-clamp-2">
                      {story.title}
                    </h3>
                    
                    <p className="text-gray-300 mb-4 line-clamp-3">
                      {getContentPreview(story.content, 150)}
                    </p>

                    {/* 元信息 */}
                    <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{story.author || '佚名'}</span>
                      </div>
                      {story.readTime && <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{story.readTime}</span>
                        </div>}
                    </div>

                    {/* 时间地点 */}
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                      {story.date && <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{story.date}</span>
                        </div>}
                      {story.location && <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>{story.location}</span>
                        </div>}
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Eye className="w-4 h-4" />
                        <span>查看详情</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-red-400 transition-colors" />
                    </div>
                  </div>
                </div>)}
            </div>}
        </section>

        {/* 分页 */}
        {totalPages > 1 && <div className="flex justify-center items-center gap-4">
            <Button onClick={handlePrevPage} disabled={currentPage === 1} variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed">
              上一页
            </Button>
            <span className="text-gray-300">
              第 {currentPage} 页，共 {totalPages} 页
            </span>
            <Button onClick={handleNextPage} disabled={currentPage === totalPages} variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed">
              下一页
            </Button>
          </div>}
      </main>

      {/* 页脚 */}
      <footer className="relative z-10 bg-black/50 backdrop-blur-sm border-t border-gray-800 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center text-gray-400">
            <p>© 2023 红色记忆 - 传承革命精神，弘扬红色文化</p>
            <p className="mt-2 text-sm">让红色基因代代相传，让革命精神永放光芒</p>
          </div>
        </div>
      </footer>
    </div>;
}