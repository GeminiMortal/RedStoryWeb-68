// @ts-ignore;
import React, { useState, useEffect, useRef } from 'react';
// @ts-ignore;
import { Button } from '@/components/ui';
// @ts-ignore;
import { BookOpen, Calendar, MapPin, Clock, Search, Filter, Plus, Eye, ArrowRight, Star, Heart, Share2, Menu, X, Settings, AlertCircle, ChevronLeft, ChevronRight, Play, Pause, User } from 'lucide-react';

// @ts-ignore;
import { PageHeader, BottomNav, QuickNav, BreadcrumbNav } from '@/components/Navigation';
export default function HomePage(props) {
  const {
    $w
  } = props;
  const [stories, setStories] = useState([]);
  const [featuredStories, setFeaturedStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTag, setFilterTag] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const storiesPerPage = 9;
  const carouselRef = useRef(null);

  // 加载故事列表
  useEffect(() => {
    const loadStories = async () => {
      try {
        setLoading(true);
        console.log('加载首页数据...');

        // 使用云开发实例直接调用数据库
        const tcb = await $w.cloud.getCloudInstance();
        const db = tcb.database();

        // 查询已发布的故事，按创建时间倒序排列
        const result = await db.collection('red_story').where({
          status: 'published'
        }).orderBy('createdAt', 'desc').get();
        console.log('首页数据加载结果:', result);
        if (result && result.data) {
          setStories(result.data);
          // 选择前5个故事作为精选
          setFeaturedStories(result.data.slice(0, 5));
          const totalPagesCount = Math.ceil(result.data.length / storiesPerPage);
          setTotalPages(totalPagesCount);
        } else {
          setStories([]);
          setFeaturedStories([]);
          setTotalPages(1);
        }
      } catch (err) {
        console.error('加载故事列表失败:', err);
        setError(`加载失败: ${err.message || '未知错误'}`);
      } finally {
        setLoading(false);
      }
    };
    loadStories();
  }, []);

  // 轮播自动播放
  useEffect(() => {
    if (!isPlaying || featuredStories.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % featuredStories.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPlaying, featuredStories.length]);

  // 处理搜索
  const handleSearch = e => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // 处理筛选
  const handleFilter = tag => {
    setFilterTag(tag);
    setCurrentPage(1);
  };

  // 轮播控制
  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % featuredStories.length);
  };
  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + featuredStories.length) % featuredStories.length);
  };
  const goToSlide = index => {
    setCurrentSlide(index);
  };
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  // 过滤故事
  const filteredStories = stories.filter(story => {
    const matchesSearch = story.title.toLowerCase().includes(searchTerm.toLowerCase()) || story.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterTag === 'all' || story.tags && story.tags.includes(filterTag);
    return matchesSearch && matchesFilter;
  });

  // 分页故事
  const paginatedStories = filteredStories.slice((currentPage - 1) * storiesPerPage, currentPage * storiesPerPage);

  // 获取所有标签
  const allTags = [...new Set(stories.flatMap(story => story.tags || []))];

  // 导航函数
  const navigateTo = $w.utils.navigateTo;
  const goToDetail = storyId => {
    navigateTo({
      pageId: 'detail',
      params: {
        id: storyId
      }
    });
  };
  const goToAdmin = () => {
    navigateTo({
      pageId: 'admin',
      params: {}
    });
  };
  const goToUpload = () => {
    navigateTo({
      pageId: 'upload',
      params: {}
    });
  };

  // 格式化日期
  const formatDate = timestamp => {
    if (!timestamp) return '未知时间';
    const date = new Date(timestamp);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  // 面包屑导航
  const breadcrumbs = [{
    label: '首页',
    href: true,
    onClick: () => navigateTo({
      pageId: 'index',
      params: {}
    })
  }];

  // 加载状态
  if (loading) {
    return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-400">加载红色故事中...</p>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-gray-900 text-white">
      {/* 背景装饰 */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-gray-900 to-gray-900"></div>
      
      {/* 顶部导航 */}
      <PageHeader title="红色记忆" showBack={false} breadcrumbs={breadcrumbs} actions={[{
      label: '菜单',
      icon: Menu,
      onClick: () => setMobileMenuOpen(!mobileMenuOpen),
      className: 'text-gray-300 hover:text-white'
    }]} />


      {/* 移动端菜单 */}
      {mobileMenuOpen && <div className="fixed inset-0 bg-black/50 z-50 lg:hidden">
          <div className="bg-gray-800 w-64 h-full shadow-xl">
            <div className="p-4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-red-600">菜单</h2>
                <Button onClick={() => setMobileMenuOpen(false)} variant="ghost" className="text-gray-300 hover:text-white">
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <div className="space-y-2">
                <Button onClick={() => {
              navigateTo({
                pageId: 'index',
                params: {}
              });
              setMobileMenuOpen(false);
            }} variant="ghost" className="w-full justify-start text-gray-300 hover:text-white">
                  <BookOpen className="w-5 h-5 mr-3" />
                  首页
                </Button>
                <Button onClick={() => {
              goToAdmin();
              setMobileMenuOpen(false);
            }} variant="ghost" className="w-full justify-start text-gray-300 hover:text-white">
                  <Settings className="w-5 h-5 mr-3" />
                  管理后台
                </Button>
                <Button onClick={() => {
              goToUpload();
              setMobileMenuOpen(false);
            }} variant="ghost" className="w-full justify-start text-gray-300 hover:text-white">
                  <Plus className="w-5 h-5 mr-3" />
                  上传故事
                </Button>
              </div>
            </div>
          </div>
        </div>}

      {/* 主要内容 */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 py-8 pb-24">
        {/* 错误提示 */}
        {error && <div className="bg-red-900/50 border border-red-600 text-red-200 px-4 py-3 rounded-lg mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
            <Button onClick={() => setError(null)} variant="ghost" size="sm" className="text-red-300 hover:text-red-100">
              ×
            </Button>
          </div>}

        {/* 轮播区域 */}
        {featuredStories.length > 0 && <section className="mb-12">
            <div className="relative rounded-2xl overflow-hidden" ref={carouselRef}>
              {/* 轮播内容 */}
              <div className="relative h-96 md:h-[500px]">
                {featuredStories.map((story, index) => <div key={story._id} className={`absolute inset-0 transition-opacity duration-500 ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="relative h-full">
                      {/* 背景图片 */}
                      {story.image ? <img src={story.image} alt={story.title} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gradient-to-br from-red-900/50 to-gray-800 flex items-center justify-center">
                          <BookOpen className="w-24 h-24 text-red-400 opacity-50" />
                        </div>}
                      
                      {/* 渐变遮罩 */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                      
                      {/* 内容区域 */}
                      <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                        <div className="max-w-4xl">
                          <div className="flex items-center gap-2 mb-4">
                            <span className="px-3 py-1 bg-red-600 text-white text-sm font-medium rounded-full">精选故事</span>
                            <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-sm rounded-full">
                              {story.read_time || '5分钟阅读'}
                            </span>
                          </div>
                          
                          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 line-clamp-2">
                            {story.title}
                          </h2>
                          
                          <p className="text-gray-200 text-lg mb-4 line-clamp-3">
                            {story.content.substring(0, 150)}...
                          </p>
                          
                          <div className="flex items-center gap-4 mb-6">
                            <span className="text-gray-300 flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {formatDate(story.createdAt)}
                            </span>
                            <span className="text-gray-300 flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {story.location || '未知地点'}
                            </span>
                            <span className="text-gray-300 flex items-center gap-1">
                              <User className="w-4 h-4" />
                              {story.author || '佚名'}
                            </span>
                          </div>
                          
                          <div className="flex gap-3">
                            <Button onClick={() => goToDetail(story._id)} className="bg-red-600 hover:bg-red-700 text-white px-6 py-3">
                              <Eye className="w-5 h-5 mr-2" />
                              阅读全文
                            </Button>
                            <Button variant="outline" className="border-white/30 text-white hover:bg-white/10">
                              <Share2 className="w-5 h-5 mr-2" />
                              分享
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>)}
              </div>

              {/* 导航按钮 */}
              <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors z-10">
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors z-10">
                <ChevronRight className="w-6 h-6" />
              </button>

              {/* 播放控制 */}
              <button onClick={togglePlay} className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors z-10">
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </button>

              {/* 指示器 */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {featuredStories.map((_, index) => <button key={index} onClick={() => goToSlide(index)} className={`w-2 h-2 rounded-full transition-all ${index === currentSlide ? 'w-8 bg-red-600' : 'bg-white/50 hover:bg-white/70'}`} />)}
              </div>
            </div>
          </section>}

        {/* 英雄区域 - 如果没有精选故事 */}
        {featuredStories.length === 0 && <section className="mb-12">
            <div className="bg-gradient-to-r from-red-900/30 to-red-800/30 rounded-2xl p-8 md:p-12 border border-red-800/30">
              <div className="max-w-3xl">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  传承红色记忆
                  <span className="block text-2xl md:text-3xl text-red-400 mt-2">铭记革命历史</span>
                </h1>
                <p className="text-lg text-gray-300 mb-6">
                  在这里，我们记录着那些感人至深的红色故事，传承着革命先辈的崇高精神。
                  每一个故事都是一段历史的见证，每一份记忆都是民族精神的瑰宝。
                </p>
                <QuickNav navigateTo={navigateTo} className="flex-wrap gap-3" />
              </div>
            </div>
          </section>}

        {/* 搜索和筛选 */}
        <section className="mb-8">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              {/* 搜索框 */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input type="text" placeholder="搜索红色故事..." value={searchTerm} onChange={handleSearch} className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent" />
              </div>

              {/* 标签筛选 */}
              <div className="flex flex-wrap gap-2">
                <button onClick={() => handleFilter('all')} className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${filterTag === 'all' ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
                  全部
                </button>
                {allTags.map(tag => <button key={tag} onClick={() => handleFilter(tag)} className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${filterTag === tag ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
                    {tag}
                  </button>)}
              </div>
            </div>
          </div>
        </section>

        {/* 故事列表 */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">红色故事集</h2>
            <p className="text-gray-400">
              共 {filteredStories.length} 个故事
            </p>
          </div>

          {paginatedStories.length === 0 ? <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-12 text-center border border-gray-700">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-300 mb-2">暂无红色故事</h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || filterTag !== 'all' ? '没有找到符合条件的故事' : '还没有上传任何红色故事'}
              </p>
              {!searchTerm && filterTag === 'all' && <Button onClick={goToUpload} className="bg-red-600 hover:bg-red-700 text-white">
                  <Plus className="w-5 h-5 mr-2" />
                  上传第一个故事
                </Button>}
            </div> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedStories.map(story => <div key={story._id} className="bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700 hover:border-red-600/50 transition-all duration-300 group">
                  {/* 故事图片 */}
                  <div className="relative h-48 overflow-hidden">
                    {story.image ? <img src={story.image} alt={story.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" /> : <div className="w-full h-full bg-gradient-to-br from-red-900/30 to-gray-800 flex items-center justify-center">
                        <BookOpen className="w-12 h-12 text-red-400" />
                      </div>}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-lg font-semibold text-white mb-1 line-clamp-1">{story.title}</h3>
                      <p className="text-sm text-gray-300">{story.author || '佚名'}</p>
                    </div>
                  </div>

                  {/* 故事内容 */}
                  <div className="p-6">
                    <p className="text-gray-300 text-sm mb-4 line-clamp-3">{story.content}</p>

                    {/* 故事元信息 */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {story.tags && story.tags.map((tag, index) => <span key={index} className="px-2 py-1 bg-red-900/30 text-red-300 text-xs rounded-full border border-red-800/50">
                          {tag}
                        </span>)}
                    </div>

                    {/* 底部信息 */}
                    <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {story.read_time || '5分钟'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(story.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex gap-2">
                      <Button onClick={() => goToDetail(story._id)} className="flex-1 bg-red-600 hover:bg-red-700 text-white">
                        <Eye className="w-4 h-4 mr-2" />
                        阅读全文
                      </Button>
                      <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                        <Heart className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>)}
            </div>}
        </section>

        {/* 分页 */}
        {totalPages > 1 && <div className="mt-8 flex items-center justify-between">
            <div className="text-sm text-gray-400">
              显示第 {(currentPage - 1) * storiesPerPage + 1} - {Math.min(currentPage * storiesPerPage, filteredStories.length)} 条，共 {filteredStories.length} 条
            </div>
            <div className="flex items-center space-x-2">
              <Button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} variant="outline" className="border-gray-600 text-gray-300">
                上一页
              </Button>
              {Array.from({
            length: totalPages
          }, (_, i) => i + 1).map(page => <button key={page} onClick={() => setCurrentPage(page)} className={`px-3 py-1 text-sm rounded-md transition-colors ${currentPage === page ? 'bg-red-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>
                  {page}
                </button>)}
              <Button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} variant="outline" className="border-gray-600 text-gray-300">
                下一页
              </Button>
            </div>
          </div>}
      </main>

      {/* 底部导航 */}
      <BottomNav currentPage="home" navigateTo={navigateTo} />
    </div>;
}