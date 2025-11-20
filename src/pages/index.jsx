// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button } from '@/components/ui';
// @ts-ignore;
import { ChevronLeft, ChevronRight, Calendar, MapPin, Users, Clock, BookOpen, Heart, Share2, ArrowRight, Star } from 'lucide-react';

export default function IndexPage(props) {
  const {
    $w
  } = props;
  const [currentSlide, setCurrentSlide] = useState(0);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [featuredStories, setFeaturedStories] = useState([]);
  const [recentStories, setRecentStories] = useState([]);
  const [autoPlay, setAutoPlay] = useState(true);

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
            filter: {
              where: {
                status: {
                  $eq: 'published' // 只显示已发布的故事
                }
              }
            },
            orderBy: [{
              order: 'desc' // 按排序字段降序
            }, {
              createdAt: 'desc' // 再按创建时间降序
            }],
            getCount: true,
            pageSize: 20 // 获取最多20条记录
          }
        });
        if (result.records && result.records.length > 0) {
          // 将数据库字段映射为前端所需格式
          const mappedStories = result.records.map(record => ({
            id: record._id,
            title: record.title || '未命名故事',
            content: record.content || '暂无内容',
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

          // 设置轮播图数据（取前5个有图片的故事）
          const withImages = mappedStories.filter(story => story.image);
          setFeaturedStories(withImages.slice(0, 5));

          // 设置最新故事（取前6个）
          setRecentStories(mappedStories.slice(0, 6));
        } else {
          setStories([]);
          setFeaturedStories([]);
          setRecentStories([]);
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

  // 自动轮播
  useEffect(() => {
    if (!autoPlay || featuredStories.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % featuredStories.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [autoPlay, featuredStories.length]);

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

  // 导航到详情页
  const navigateToDetail = storyId => {
    $w.utils.navigateTo({
      pageId: 'detail',
      params: {
        id: storyId
      }
    });
  };

  // 导航到上传页面
  const navigateToUpload = () => {
    $w.utils.navigateTo({
      pageId: 'upload',
      params: {}
    });
  };

  // 导航到管理页面
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

  // 截取内容预览
  const getContentPreview = (content, maxLength = 100) => {
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
            <a href="#" className="text-gray-300 hover:text-white transition-colors">首页</a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors">故事</a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors">历史</a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors">关于</a>
          </nav>
          <div className="flex items-center gap-3">
            <Button onClick={navigateToUpload} variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
              上传故事
            </Button>
            <Button onClick={navigateToAdmin} className="bg-red-600 hover:bg-red-700 text-white">
              管理后台
            </Button>
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="relative z-10">
        {/* 轮播图区域 */}
        {featuredStories.length > 0 && <section className="relative h-[600px] overflow-hidden">
            <div className="absolute inset-0">
              {featuredStories.map((story, index) => <div key={story.id} className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}>
                  <div className="relative h-full">
                    {story.image ? <img src={story.image} alt={story.title} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gradient-to-br from-red-900/30 to-gray-800/30 flex items-center justify-center">
                        <div className="text-center text-gray-400">
                          <BookOpen className="w-24 h-24 mx-auto mb-4" />
                          <p className="text-xl">暂无配图</p>
                        </div>
                      </div>}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                    
                    {/* 轮播图内容 - 可点击跳转 */}
                    <div onClick={() => navigateToDetail(story.id)} className="absolute bottom-0 left-0 right-0 p-8 md:p-12 cursor-pointer group">
                      <div className="max-w-4xl mx-auto">
                        <div className="flex items-center gap-2 text-red-400 mb-4">
                          <Star className="w-5 h-5" />
                          <span className="text-sm font-medium">精选故事</span>
                        </div>
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 group-hover:text-red-400 transition-colors">
                          {story.title}
                        </h2>
                        <p className="text-lg md:text-xl text-gray-200 mb-6 line-clamp-2">
                          {getContentPreview(story.content, 150)}
                        </p>
                        <div className="flex flex-wrap items-center gap-4 text-gray-300 mb-6">
                          {story.date && <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {story.date}
                            </span>}
                          {story.location && <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {story.location}
                            </span>}
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {story.author || '佚名'}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-red-400 font-medium">点击查看详情</span>
                          <ArrowRight className="w-5 h-5 text-red-400 group-hover:translate-x-2 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>)}
            </div>

            {/* 轮播控制按钮 */}
            <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors">
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* 轮播指示器 */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {featuredStories.map((_, index) => <button key={index} onClick={() => goToSlide(index)} className={`w-2 h-2 rounded-full transition-all ${index === currentSlide ? 'bg-red-600 w-8' : 'bg-white/50 hover:bg-white/70'}`} />)}
            </div>
          </section>}

        {/* 统计数据 */}
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-red-600 mb-2">{stories.length}</div>
              <div className="text-gray-400">红色故事</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-red-600 mb-2">{Math.floor(stories.length * 1.5)}</div>
              <div className="text-gray-400">历史人物</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-red-600 mb-2">{Math.floor(stories.length * 3)}</div>
              <div className="text-gray-400">革命地点</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-red-600 mb-2">{Math.floor(stories.length * 10)}</div>
              <div className="text-gray-400">传承人次</div>
            </div>
          </div>
        </section>

        {/* 最新故事 */}
        {recentStories.length > 0 && <section className="py-16 px-4 bg-gray-800/30">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-white">最新故事</h2>
                <Button onClick={() => navigateToAdmin()} variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                  查看全部
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {recentStories.map(story => <div key={story.id} onClick={() => navigateToDetail(story.id)} className="bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700 hover:border-red-600/50 transition-all cursor-pointer group">
                    <div className="aspect-video relative overflow-hidden">
                      {story.image ? <img src={story.image} alt={story.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" /> : <div className="w-full h-full bg-gradient-to-br from-red-900/30 to-gray-800/30 flex items-center justify-center">
                          <BookOpen className="w-12 h-12 text-gray-600" />
                        </div>}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-red-400 transition-colors">
                        {story.title}
                      </h3>
                      <p className="text-gray-400 mb-4 line-clamp-2">
                        {getContentPreview(story.content, 100)}
                      </p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-3">
                          {story.date && <span>{story.date}</span>}
                          {story.location && <span>·</span>}
                          {story.location && <span>{story.location}</span>}
                        </div>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>)}
              </div>
            </div>
          </section>}

        {/* 行动号召 */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-white mb-6">传承红色基因，讲述革命故事</h2>
            <p className="text-xl text-gray-300 mb-8">
              每一个红色故事都是一段珍贵的历史记忆，让我们一起记录和传承这些宝贵的精神财富
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={navigateToUpload} className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 text-lg">
                上传红色故事
              </Button>
              <Button onClick={() => navigateToAdmin()} variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800 px-8 py-3 text-lg">
                浏览更多故事
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* 页脚 */}
      <footer className="relative z-10 bg-black/50 backdrop-blur-sm border-t border-gray-800 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">红色记忆</h3>
              </div>
              <p className="text-gray-400">
                传承红色基因，讲述革命故事，让历史永远铭记。
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">快速链接</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">首页</a></li>
                <li><a href="#" className="hover:text-white transition-colors">故事列表</a></li>
                <li><a href="#" className="hover:text-white transition-colors">上传故事</a></li>
                <li><a href="#" className="hover:text-white transition-colors">关于我们</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">功能</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">故事浏览</a></li>
                <li><a href="#" className="hover:text-white transition-colors">内容上传</a></li>
                <li><a href="#" className="hover:text-white transition-colors">数据管理</a></li>
                <li><a href="#" className="hover:text-white transition-colors">分享传播</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">联系我们</h4>
              <ul className="space-y-2 text-gray-400">
                <li>邮箱：contact@redmemory.com</li>
                <li>电话：400-123-4567</li>
                <li>地址：北京市朝阳区</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 红色记忆. 保留所有权利.</p>
          </div>
        </div>
      </footer>
    </div>;
}