// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button, Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui';
// @ts-ignore;
import { BookOpen, Clock, User, Eye, Plus, Search, Filter, TrendingUp } from 'lucide-react';
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
// @ts-ignore;
import { useSidebar } from '@/components/SidebarStore';
// @ts-ignore;
import { FadeIn, AnimatedCard } from '@/components/AnimationProvider';
export default function HomePage(props) {
  const {
    $w
  } = props;
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [featuredStory, setFeaturedStory] = useState(null);
  const [filterTag, setFilterTag] = useState('');
  const [trendingStories, setTrendingStories] = useState([]);
  const {
    isCollapsed,
    isDesktop
  } = useSidebar();
  const navigateTo = $w.utils.navigateTo;

  // 获取所有标签
  const allTags = [...new Set(stories.flatMap(story => story.tags || []))];
  useEffect(() => {
    loadStories();
  }, []);
  const loadStories = async () => {
    try {
      setLoading(true);
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();

      // 获取已发布的故事
      const result = await db.collection('red_story').where({
        status: 'published'
      }).orderBy('createdAt', 'desc').limit(50).get();
      if (result && result.data) {
        setStories(result.data);

        // 设置特色故事（最新或阅读量最高的）
        const sortedByViews = [...result.data].sort((a, b) => (b.views || 0) - (a.views || 0));
        setFeaturedStory(sortedByViews[0] || result.data[0]);

        // 设置热门故事（按阅读量排序）
        setTrendingStories(sortedByViews.slice(0, 5));
      }
    } catch (error) {
      console.error('加载故事失败:', error);
    } finally {
      setLoading(false);
    }
  };
  const filteredStories = stories.filter(story => {
    const matchesSearch = (story.title || '').toLowerCase().includes(searchTerm.toLowerCase()) || (story.content || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = !filterTag || (story.tags || []).includes(filterTag);
    return matchesSearch && matchesTag;
  });
  const formatDate = timestamp => {
    if (!timestamp) return '未知时间';
    return new Date(timestamp).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  const formatReadTime = content => {
    if (!content) return '5分钟阅读';
    const wordCount = content.length;
    const readTime = Math.ceil(wordCount / 500);
    return `${readTime}分钟阅读`;
  };

  // 渲染故事卡片
  const StoryCard = ({
    story,
    index
  }) => <AnimatedCard delay={index * 100}>
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-red-500/10 hover:border-red-500/50 transition-all duration-300 transform hover:-translate-y-2 hover:scale-[1.02]">
        {story.image && <div className="aspect-video overflow-hidden relative">
            <img src={story.image} alt={story.title} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" onError={e => {
          e.target.style.display = 'none';
        }} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
          </div>}
        
        <CardHeader className="p-5">
          <CardTitle className="text-white text-lg line-clamp-2 hover:text-red-400 transition-colors duration-300">
            {story.title || '无标题'}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="px-5 pb-5">
          <p className="text-slate-400 text-sm mb-4 line-clamp-3 leading-relaxed">
            {story.content || '暂无内容'}
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
                {story.author || '佚名'}
              </span>
              <span className="flex items-center bg-slate-700/50 px-2 py-1 rounded-full">
                <Clock className="w-3 h-3 mr-1" />
                {formatDate(story.createdAt)}
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigateTo({
            pageId: 'detail',
            params: {
              id: story._id
            }
          })} className="text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200">
              <Eye className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </AnimatedCard>;
  return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <Sidebar currentPage="index" navigateTo={navigateTo} />

      {/* 主内容区域 - 根据侧边栏状态动态调整 */}
      <main className={cn("transition-all duration-300 ease-in-out", isDesktop ? isCollapsed ? "md:ml-16" : "md:ml-64" : "ml-0")}>
        
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
                <Button onClick={() => navigateTo({
                pageId: 'upload',
                params: {}
              })} className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 shadow-lg hover:shadow-red-500/25 transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5">
                  <Plus className="w-4 h-4 mr-2" />
                  新建故事
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* 英雄区域 - 添加动画 */}
        <header className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 via-orange-600/10 to-transparent"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width=%2740%27%20height=%2740%27%20viewBox=%270%200%2040%2040%27%20xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cg%20fill=%27%239C92AC%27%20fill-opacity=%270.03%27%3E%3Cpath%20d=%27M0%2040L40%200H20L0%2020M40%2040V20L20%2040%27/%3E%3C/g%3E%3C/svg%3E')]"></div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
            <FadeIn delay={200}>
              <div className="text-center">
                <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-red-400 via-orange-400 to-red-500 bg-clip-text text-transparent animate-pulse">
                  红色故事
                </h1>
                <p className="mt-4 text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
                  传承红色基因，讲述革命故事，让历史在新时代焕发光芒
                </p>
              </div>
            </FadeIn>
          </div>
        </header>

        {/* 轮播区域 - 使用优化后的 StoryCarousel */}
        {!loading && stories.length > 0 && <FadeIn delay={300}>
            <StoryCarousel stories={stories} onNavigate={navigateTo} />
          </FadeIn>}

        {/* 搜索和过滤区域 */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <FadeIn delay={400}>
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
                
                <Button onClick={() => navigateTo({
                pageId: 'upload',
                params: {}
              })} className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 shadow-lg hover:shadow-red-500/25 transition-all duration-300 transform hover:scale-105 hover:-translate-y-0.5">
                  <Plus className="w-4 h-4 mr-2" />
                  新建故事
                </Button>
              </div>
            </div>
          </FadeIn>
        </div>

        {/* 故事列表 */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          {loading ? <LoadingSkeleton type="card" count={6} /> : filteredStories.length === 0 ? <FadeIn delay={500}>
              <div className="text-center py-16 animate-fade-in">
                <BookOpen className="w-24 h-24 text-slate-600 mx-auto mb-6 animate-bounce" />
                <h3 className="text-2xl font-medium text-slate-400 mb-3">
                  {searchTerm || filterTag ? '未找到相关故事' : '暂无故事'}
                </h3>
                <p className="text-slate-500 mb-8 max-w-md mx-auto">
                  {searchTerm || filterTag ? '尝试调整搜索条件或标签' : '开始创建您的第一个红色故事，让历史在新时代焕发光芒'}
                </p>
                {!searchTerm && !filterTag && <Button onClick={() => navigateTo({
              pageId: 'upload',
              params: {}
            })} className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 shadow-lg hover:shadow-red-500/25 transition-all duration-300 transform hover:scale-105">
                    <Plus className="w-5 h-5 mr-2" />
                    创建第一个故事
                  </Button>}
              </div>
            </FadeIn> : <>
              {/* 搜索结果提示 */}
              {(searchTerm || filterTag) && <FadeIn delay={600}>
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-white mb-2">
                      搜索结果 ({filteredStories.length}个故事)
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {searchTerm && <Badge variant="outline" className="border-red-500/50 text-red-400 bg-red-500/10">
                          搜索: {searchTerm}
                          <button onClick={() => setSearchTerm('')} className="ml-2 text-red-400 hover:text-red-300">
                            ×
                          </button>
                        </Badge>}
                      {filterTag && <Badge variant="outline" className="border-orange-500/50 text-orange-400 bg-orange-500/10">
                          标签: {filterTag}
                          <button onClick={() => setFilterTag('')} className="ml-2 text-orange-400 hover:text-orange-300">
                            ×
                          </button>
                        </Badge>}
                    </div>
                  </div>
                </FadeIn>}

              {/* 热门故事区域 */}
              {trendingStories.length > 0 && !searchTerm && !filterTag && <FadeIn delay={700}>
                  <div className="mb-8">
                    <div className="flex items-center mb-4">
                      <TrendingUp className="w-5 h-5 text-red-400 mr-2" />
                      <h2 className="text-xl font-bold text-white">热门故事</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {trendingStories.slice(0, 4).map((story, index) => <StoryCard key={story._id} story={story} index={index} />)}
                    </div>
                  </div>
                </FadeIn>}

              {/* 故事网格 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredStories.map((story, index) => <StoryCard key={story._id} story={story} index={index} />)}
              </div>
            </>}
        </div>
      </main>

      <MobileBottomNav currentPage="index" navigateTo={navigateTo} />
    </div>;
}