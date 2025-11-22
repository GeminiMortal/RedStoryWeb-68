// @ts-ignore;
import React, { useState, useEffect, useCallback } from 'react';
// @ts-ignore;
import { Button, Card, CardContent, CardHeader, CardTitle, Badge, useToast } from '@/components/ui';
// @ts-ignore;
import { BookOpen, Clock, MapPin, User, Eye, Plus, Search, TrendingUp, Heart, Filter, Loader2, RefreshCw, ArrowRight } from 'lucide-react';
// @ts-ignore;
import { cn } from '@/lib/utils';

// @ts-ignore;
import { Sidebar } from '@/components/Sidebar';
// @ts-ignore;
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
// @ts-ignore;
import { MobileBottomNav } from '@/components/MobileBottomNav';
// @ts-ignore;
import { StoryCarousel } from '@/components/StoryCarousel';
export default function HomePage(props) {
  const {
    $w
  } = props;
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [navigating, setNavigating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [featuredStory, setFeaturedStory] = useState(null);
  const [filterTag, setFilterTag] = useState('');
  const [sidebarState, setSidebarState] = useState({
    isCollapsed: false,
    isDesktop: true
  });
  const [error, setError] = useState(null);
  const {
    toast
  } = useToast();
  const navigateTo = $w.utils.navigateTo;

  // 获取所有标签
  const allTags = [...new Set(stories.flatMap(story => story.tags || []))];

  // 优化的数据加载函数
  const loadStories = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();

      // 优化查询：只获取必要字段，按发布时间排序
      const result = await db.collection('red_story').where({
        status: 'published'
      }).field({
        _id: true,
        title: true,
        content: true,
        author: true,
        image: true,
        tags: true,
        createdAt: true,
        views: true
      }).orderBy('publishedAt', 'desc').limit(20).get();
      if (result && result.data) {
        const storiesData = result.data;

        // 数据验证和处理
        const processedStories = storiesData.map(story => ({
          ...story,
          title: story.title || '无标题',
          content: story.content || '暂无内容',
          author: story.author || '佚名',
          tags: Array.isArray(story.tags) ? story.tags : [],
          views: typeof story.views === 'number' ? story.views : 0
        }));
        setStories(processedStories);

        // 设置特色故事（第一个有图片的故事）
        const storyWithImage = processedStories.find(story => story.image);
        setFeaturedStory(storyWithImage || processedStories[0] || null);
        if (showRefresh) {
          toast({
            title: '刷新成功',
            description: `已加载 ${processedStories.length} 个故事`,
            duration: 2000
          });
        }
      } else {
        throw new Error('未获取到数据');
      }
    } catch (error) {
      console.error('加载故事失败:', error);
      const errorMessage = error.message || '网络连接异常';
      setError(errorMessage);
      toast({
        title: '加载失败',
        description: errorMessage,
        variant: 'destructive',
        action: {
          label: '重试',
          onClick: () => loadStories(true)
        }
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [toast]);

  // 初始化加载
  useEffect(() => {
    loadStories();
  }, [loadStories]);

  // 优化的导航函数
  const handleNavigate = useCallback(async (pageId, params = {}) => {
    if (navigating) return;
    try {
      setNavigating(true);
      await new Promise(resolve => setTimeout(resolve, 100));
      navigateTo({
        pageId,
        params
      });
    } catch (error) {
      console.error('导航失败:', error);
      toast({
        title: '跳转失败',
        description: '页面跳转出现问题，请重试',
        variant: 'destructive'
      });
    } finally {
      setNavigating(false);
    }
  }, [navigating, navigateTo, toast]);

  // 故事卡片点击处理
  const handleStoryClick = useCallback((storyId, event) => {
    if (event) {
      event.stopPropagation();
    }
    handleNavigate('detail', {
      id: storyId
    });
  }, [handleNavigate]);

  // 新建故事处理
  const handleCreateStory = useCallback(() => {
    handleNavigate('upload');
  }, [handleNavigate]);

  // 刷新处理
  const handleRefresh = useCallback(() => {
    loadStories(true);
  }, [loadStories]);

  // 清除搜索
  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setFilterTag('');
  }, []);

  // 过滤故事
  const filteredStories = React.useMemo(() => {
    return stories.filter(story => {
      const matchesSearch = !searchTerm || (story.title || '').toLowerCase().includes(searchTerm.toLowerCase()) || (story.content || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTag = !filterTag || (story.tags || []).includes(filterTag);
      return matchesSearch && matchesTag;
    });
  }, [stories, searchTerm, filterTag]);

  // 格式化函数
  const formatDate = useCallback(timestamp => {
    if (!timestamp) return '未知时间';
    try {
      return new Date(timestamp).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return '日期格式错误';
    }
  }, []);
  const formatReadTime = useCallback(content => {
    if (!content) return '5分钟阅读';
    const wordCount = content.length;
    const readTime = Math.max(1, Math.ceil(wordCount / 500));
    return `${readTime}分钟阅读`;
  }, []);

  // 计算主内容区域的边距
  const getMainMargin = useCallback(() => {
    if (!sidebarState.isDesktop) return 'ml-0';
    return sidebarState.isCollapsed ? 'md:ml-16' : 'md:ml-64';
  }, [sidebarState]);

  // 错误状态组件
  const ErrorState = () => <div className="text-center py-16 animate-fade-in">
      <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
        <RefreshCw className="w-12 h-12 text-red-500" />
      </div>
      <h3 className="text-2xl font-medium text-slate-400 mb-3">加载失败</h3>
      <p className="text-slate-500 mb-8 max-w-md mx-auto">{error}</p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button onClick={() => loadStories(true)} disabled={refreshing} className="bg-red-500 hover:bg-red-600">
          {refreshing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
          重新加载
        </Button>
        <Button onClick={clearSearch} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
          清除搜索
        </Button>
      </div>
    </div>;
  return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <Sidebar currentPage="index" navigateTo={navigateTo} onStateChange={setSidebarState} />

      {/* 主内容区域 - 响应式边距 */}
      <main className={cn("transition-all duration-300 ease-in-out", getMainMargin())}>
        {/* 桌面端头部 */}
        <header className="hidden md:block bg-slate-800/90 backdrop-blur-sm border-b border-slate-700">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                红色故事
              </h1>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input type="text" placeholder="搜索故事..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all" />
                </div>
                <Button onClick={handleRefresh} disabled={refreshing || loading} variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                  {refreshing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                </Button>
                <Button onClick={handleCreateStory} disabled={navigating} className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 shadow-lg hover:shadow-red-500/25 transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5">
                  {navigating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                  新建故事
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* 英雄区域 */}
        <header className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 via-orange-600/10 to-transparent"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width=%2740%27%20height=%2740%27%20viewBox=%270%200%2040%2040%27%20xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cg%20fill=%27%239C92AC%27%20fill-opacity=%270.03%27%3E%3Cpath%20d=%27M0%2040L40%200H20L0%2020M40%2040V20L20%2040%27/%3E%3C/g%3E%3C/svg%3E')]"></div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-red-400 via-orange-400 to-red-500 bg-clip-text text-transparent animate-pulse">
                红色故事
              </h1>
              <p className="mt-4 text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
                传承红色基因，讲述革命故事，让历史在新时代焕发光芒
              </p>
            </div>
          </div>
        </header>

        {/* 轮播区域 */}
        {!loading && !error && stories.length > 0 && <StoryCarousel stories={stories} onNavigate={handleNavigate} />}

        {/* 搜索和过滤区域 */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-slate-700/50">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input type="text" placeholder="搜索故事标题或内容..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-300" />
              </div>
              {allTags.length > 0 && <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <select value={filterTag} onChange={e => setFilterTag(e.target.value)} className="pl-10 pr-8 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-300">
                    <option value="">所有标签</option>
                    {allTags.map(tag => <option key={tag} value={tag}>{tag}</option>)}
                  </select>
                </div>}
              <Button onClick={handleRefresh} disabled={refreshing || loading} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                {refreshing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                刷新
              </Button>
              <Button onClick={handleCreateStory} disabled={navigating} className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 shadow-lg hover:shadow-red-500/25 transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5">
                {navigating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                新建故事
              </Button>
            </div>
          </div>
        </div>

        {/* 故事列表 */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          {loading ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, index) => <div key={index} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 animate-pulse">
                  <div className="aspect-video bg-slate-700 rounded-xl mb-4"></div>
                  <div className="h-6 bg-slate-700 rounded w-3/4 mb-3"></div>
                  <div className="h-4 bg-slate-700 rounded w-full mb-2"></div>
                  <div className="h-4 bg-slate-700 rounded w-2/3"></div>
                </div>)}
            </div> : error ? <div className="text-center py-16 animate-fade-in">
              <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <RefreshCw className="w-12 h-12 text-red-500" />
              </div>
              <h3 className="text-2xl font-medium text-slate-400 mb-3">加载失败</h3>
              <p className="text-slate-500 mb-8 max-w-md mx-auto">{error}</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={() => loadStories(true)} disabled={refreshing} className="bg-red-500 hover:bg-red-600">
                  {refreshing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                  重新加载
                </Button>
                <Button onClick={clearSearch} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                  清除搜索
                </Button>
              </div>
            </div> : filteredStories.length === 0 ? <div className="text-center py-16 animate-fade-in">
              <BookOpen className="w-24 h-24 text-slate-600 mx-auto mb-6 animate-bounce" />
              <h3 className="text-2xl font-medium text-slate-400 mb-3">
                {searchTerm || filterTag ? '未找到相关故事' : '暂无故事'}
              </h3>
              <p className="text-slate-500 mb-8 max-w-md mx-auto">
                {searchTerm || filterTag ? '尝试调整搜索条件或标签' : '开始创建您的第一个红色故事，让历史在新时代焕发光芒'}
              </p>
              {!searchTerm && !filterTag && <Button onClick={handleCreateStory} disabled={navigating} className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 shadow-lg hover:shadow-red-500/25 transition-all duration-300 transform hover:scale-105">
                  {navigating ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Plus className="w-5 h-5 mr-2" />}
                  创建第一个故事
                </Button>}
              {(searchTerm || filterTag) && <Button onClick={clearSearch} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                  清除搜索条件
                </Button>}
            </div> : <>
              {(searchTerm || filterTag) && <div className="mb-6">
                  <h2 className="text-xl font-bold text-white mb-2">
                    搜索结果 ({filteredStories.length}个故事)
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {searchTerm && <Badge variant="outline" className="border-red-500/50 text-red-400 bg-red-500/10">
                        搜索: {searchTerm}
                        <button onClick={() => setSearchTerm('')} className="ml-2 text-red-400 hover:text-red-300">×</button>
                      </Badge>}
                    {filterTag && <Badge variant="outline" className="border-orange-500/50 text-orange-400 bg-orange-500/10">
                        标签: {filterTag}
                        <button onClick={() => setFilterTag('')} className="ml-2 text-orange-400 hover:text-orange-300">×</button>
                      </Badge>}
                  </div>
                </div>}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredStories.map((story, index) => <div key={story._id} className="group animate-fade-in" style={{
              animationDelay: `${index * 100}ms`
            }}>
                    <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-red-500/10 hover:border-red-500/50 transition-all duration-300 transform hover:-translate-y-2 hover:scale-[1.02]">
                      {story.image && <div className="aspect-video overflow-hidden relative">
                          <img src={story.image} alt={story.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" onError={e => {
                    e.target.style.display = 'none';
                  }} />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>}
                      <CardHeader className="p-5">
                        <CardTitle className="text-white text-lg line-clamp-2 group-hover:text-red-400 transition-colors duration-300">
                          {story.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="px-5 pb-5">
                        <p className="text-slate-400 text-sm mb-4 line-clamp-3 leading-relaxed">
                          {story.content}
                        </p>
                        
                        {story.tags && story.tags.length > 0 && <div className="flex flex-wrap gap-1 mb-4">
                            {story.tags.slice(0, 3).map((tag, idx) => <Badge key={idx} variant="outline" className="border-red-500/30 text-red-400 text-xs bg-red-500/10 hover:bg-red-500/20 transition-colors">
                                {tag}
                              </Badge>)}
                          </div>}

                        <div className="flex items-center justify-between text-sm text-slate-500">
                          <div className="flex items-center space-x-3">
                            <span className="flex items-center bg-slate-700/50 px-2 py-1 rounded-full">
                              <User className="w-3 h-3 mr-1" />
                              {story.author}
                            </span>
                            <span className="flex items-center bg-slate-700/50 px-2 py-1 rounded-full">
                              <Clock className="w-3 h-3 mr-1" />
                              {formatDate(story.createdAt)}
                            </span>
                          </div>
                        </div>

                        {/* 添加阅读全文按钮 */}
                        <div className="mt-4 pt-4 border-t border-slate-700/50">
                          <Button onClick={e => {
                      e.stopPropagation();
                      handleStoryClick(story._id, e);
                    }} className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white text-sm py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105">
                            <BookOpen className="w-4 h-4 mr-2 inline-block" />
                            阅读全文
                            <ArrowRight className="w-4 h-4 ml-2 inline-block" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>)}
              </div>
            </>}
        </div>
      </main>

      <MobileBottomNav currentPage="index" navigateTo={navigateTo} />
    </div>;
}