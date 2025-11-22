// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button, Card, CardContent, CardHeader, CardTitle, Badge, useToast } from '@/components/ui';
// @ts-ignore;
import { ArrowLeft, Calendar, User, MapPin, Clock, Eye, Heart, Share2, BookOpen, Tag, Loader2, Home, Edit3 } from 'lucide-react';
// @ts-ignore;
import { cn } from '@/lib/utils';

// @ts-ignore;
import { Sidebar } from '@/components/Sidebar';
// @ts-ignore;
import { MobileBottomNav } from '@/components/MobileBottomNav';
export default function DetailPage(props) {
  const {
    $w
  } = props;
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [navigating, setNavigating] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const {
    toast
  } = useToast();
  const navigateTo = $w.utils.navigateTo;
  const navigateBack = $w.utils.navigateBack;
  const {
    dataset
  } = $w.page;

  // 获取故事ID
  const storyId = dataset.params.id;

  // 优化的导航函数
  const handleNavigate = async (pageId, params = {}) => {
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
  };

  // 优化的返回函数
  const handleNavigateBack = async () => {
    if (navigating) return;
    try {
      setNavigating(true);
      await new Promise(resolve => setTimeout(resolve, 100));
      navigateBack();
    } catch (error) {
      console.error('返回失败:', error);
      handleNavigate('index');
    } finally {
      setNavigating(false);
    }
  };

  // 加载故事详情
  const loadStoryDetail = async () => {
    if (!storyId) {
      toast({
        title: '错误',
        description: '故事ID不存在',
        variant: 'destructive'
      });
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();

      // 获取故事详情
      const result = await db.collection('red_story').doc(storyId).get();
      if (result && result.data) {
        const storyData = result.data;
        setStory(storyData);
        setLikeCount(storyData.likes || 0);

        // 更新阅读量
        try {
          await db.collection('red_story').doc(storyId).update({
            views: (storyData.views || 0) + 1,
            updatedAt: new Date()
          });
        } catch (updateError) {
          console.error('更新阅读量失败:', updateError);
        }
      } else {
        toast({
          title: '故事不存在',
          description: '未找到指定的故事',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('加载故事详情失败:', error);
      toast({
        title: '加载失败',
        description: '无法加载故事详情',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadStoryDetail();
  }, [storyId]);

  // 点赞功能
  const handleLike = async () => {
    if (!story) return;
    try {
      const newLikedState = !liked;
      const newLikeCount = newLikedState ? likeCount + 1 : likeCount - 1;
      setLiked(newLikedState);
      setLikeCount(newLikeCount);

      // 更新数据库中的点赞数
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();
      await db.collection('red_story').doc(storyId).update({
        likes: newLikeCount,
        updatedAt: new Date()
      });
      toast({
        title: newLikedState ? '点赞成功' : '取消点赞',
        description: newLikedState ? '感谢您的支持' : '已取消点赞'
      });
    } catch (error) {
      console.error('点赞操作失败:', error);
      // 恢复状态
      setLiked(liked);
      setLikeCount(likeCount);
      toast({
        title: '操作失败',
        description: '点赞操作出现问题，请重试',
        variant: 'destructive'
      });
    }
  };

  // 分享功能
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: story?.title || '红色故事',
          text: story?.content?.substring(0, 100) + '...' || '分享一个红色故事',
          url: window.location.href
        });
      } catch (error) {
        console.log('分享取消或失败');
      }
    } else {
      // 复制链接到剪贴板
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: '链接已复制',
          description: '故事链接已复制到剪贴板'
        });
      } catch (error) {
        console.error('复制链接失败:', error);
        toast({
          title: '复制失败',
          description: '无法复制链接，请手动复制',
          variant: 'destructive'
        });
      }
    }
  };

  // 格式化日期
  const formatDate = timestamp => {
    if (!timestamp) return '未知时间';
    return new Date(timestamp).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 格式化阅读时间
  const formatReadTime = content => {
    if (!content) return '5分钟阅读';
    const wordsPerMinute = 300; // 假设每分钟阅读300字
    const wordCount = content.length;
    const readTime = Math.ceil(wordCount / wordsPerMinute);
    return `${readTime}分钟阅读`;
  };
  if (loading) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <Sidebar currentPage="detail" navigateTo={navigateTo} />
        <main className="content-transition sidebar-transition md:ml-16 lg:ml-64 animate-fade-in">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="animate-pulse">
              <div className="h-8 bg-slate-700 rounded w-3/4 mb-6"></div>
              <div className="h-64 bg-slate-700 rounded mb-6"></div>
              <div className="space-y-4">
                <div className="h-4 bg-slate-700 rounded"></div>
                <div className="h-4 bg-slate-700 rounded w-5/6"></div>
                <div className="h-4 bg-slate-700 rounded w-4/6"></div>
              </div>
            </div>
          </div>
        </main>
        <MobileBottomNav currentPage="detail" navigateTo={navigateTo} />
      </div>;
  }
  if (!story) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-24 h-24 text-slate-600 mx-auto mb-6 animate-bounce" />
          <h2 className="text-2xl font-bold text-slate-400 mb-4">故事不存在</h2>
          <p className="text-slate-500 mb-8">抱歉，未找到指定的故事内容</p>
          <div className="space-x-4">
            <Button onClick={handleNavigateBack} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回
            </Button>
            <Button onClick={() => handleNavigate('index')} className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600">
              <Home className="w-4 h-4 mr-2" />
              首页
            </Button>
          </div>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <Sidebar currentPage="detail" navigateTo={navigateTo} />

      {/* 主内容区域 - 优化布局关系 */}
      <main className="content-transition sidebar-transition md:ml-16 lg:ml-64 animate-fade-in">
        {/* 页面头部 */}
        <header className="bg-slate-800/90 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-40">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button onClick={handleNavigateBack} disabled={navigating} variant="ghost" size="sm" className="text-slate-300 hover:text-white">
                  {navigating ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowLeft className="w-4 h-4 mr-2" />}
                  返回
                </Button>
                <h1 className="text-xl font-bold text-white truncate max-w-md">
                  {story.title || '无标题'}
                </h1>
              </div>
              <div className="flex items-center space-x-2">
                <Button onClick={() => handleNavigate('edit', {
                id: storyId
              })} variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                  <Edit3 className="w-4 h-4 mr-2" />
                  编辑
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* 故事内容区域 - 优化主体和侧边栏关系 */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* 主要内容区域 - 占据3/4宽度 */}
            <div className="lg:col-span-3 space-y-8">
              {/* 故事头部信息 */}
              <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-slate-700/50">
                <div className="text-center mb-8">
                  <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
                    {story.title || '无标题'}
                  </h1>
                  <div className="flex flex-wrap justify-center gap-4 text-sm text-slate-400">
                    <span className="flex items-center bg-slate-700/50 px-3 py-1 rounded-full">
                      <User className="w-4 h-4 mr-2" />
                      {story.author || '佚名'}
                    </span>
                    <span className="flex items-center bg-slate-700/50 px-3 py-1 rounded-full">
                      <Calendar className="w-4 h-4 mr-2" />
                      {formatDate(story.createdAt)}
                    </span>
                    <span className="flex items-center bg-slate-700/50 px-3 py-1 rounded-full">
                      <Clock className="w-4 h-4 mr-2" />
                      {formatReadTime(story.content)}
                    </span>
                    <span className="flex items-center bg-slate-700/50 px-3 py-1 rounded-full">
                      <Eye className="w-4 h-4 mr-2" />
                      {story.views || 0}次阅读
                    </span>
                  </div>
                </div>

                {/* 故事封面图 */}
                {story.image && <div className="mb-8">
                    <div className="aspect-video rounded-xl overflow-hidden shadow-xl">
                      <img src={story.image} alt={story.title} className="w-full h-full object-cover" onError={e => {
                    e.target.style.display = 'none';
                  }} />
                    </div>
                  </div>}

                {/* 标签 */}
                {story.tags && story.tags.length > 0 && <div className="mb-8">
                    <div className="flex flex-wrap gap-2 justify-center">
                      {story.tags.map((tag, index) => <Badge key={index} variant="outline" className="border-red-500/50 text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-colors">
                          <Tag className="w-3 h-3 mr-1" />
                          {tag}
                        </Badge>)}
                    </div>
                  </div>}
              </div>

              {/* 故事正文 */}
              <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-slate-700/50">
                <div className="prose prose-invert prose-lg max-w-none">
                  <div className="text-slate-300 leading-relaxed whitespace-pre-wrap text-lg">
                    {story.content || '暂无内容'}
                  </div>
                </div>
              </div>

              {/* 互动区域 */}
              <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-slate-700/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <Button onClick={handleLike} variant="ghost" className={cn("flex items-center space-x-2 transition-all duration-200", liked ? "text-red-400 hover:text-red-300" : "text-slate-400 hover:text-red-400")}>
                      <Heart className={cn("w-5 h-5", liked && "fill-current")} />
                      <span>{likeCount}</span>
                    </Button>
                    <Button onClick={handleShare} variant="ghost" className="text-slate-400 hover:text-white transition-all duration-200">
                      <Share2 className="w-5 h-5 mr-2" />
                      分享
                    </Button>
                  </div>
                  <div className="text-sm text-slate-500">
                    最后更新：{formatDate(story.updatedAt)}
                  </div>
                </div>
              </div>
            </div>

            {/* 侧边栏 - 占据1/4宽度 */}
            <div className="lg:col-span-1 space-y-6">
              {/* 作者信息卡片 */}
              <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-700/50 rounded-2xl shadow-xl">
                <CardHeader className="pb-4">
                  <CardTitle className="text-white flex items-center">
                    <User className="w-5 h-5 mr-2 text-orange-500" />
                    作者信息
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
                      <User className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">
                      {story.author || '佚名'}
                    </h3>
                    <p className="text-sm text-slate-400">红色故事创作者</p>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">加入时间</span>
                      <span className="text-white">{formatDate(story.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">作品数量</span>
                      <span className="text-white">1</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 故事统计 */}
              <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-700/50 rounded-2xl shadow-xl">
                <CardHeader className="pb-4">
                  <CardTitle className="text-white flex items-center">
                    <BookOpen className="w-5 h-5 mr-2 text-blue-500" />
                    故事统计
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center">
                        <Eye className="w-4 h-4 mr-2" />
                        阅读量
                      </span>
                      <span className="text-white font-semibold">{story.views || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center">
                        <Heart className="w-4 h-4 mr-2" />
                        点赞数
                      </span>
                      <span className="text-white font-semibold">{likeCount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center">
                        <Clock className="w-4 h-4 mr-2" />
                        阅读时长
                      </span>
                      <span className="text-white font-semibold">{formatReadTime(story.content)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 相关操作 */}
              <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-700/50 rounded-2xl shadow-xl">
                <CardHeader className="pb-4">
                  <CardTitle className="text-white flex items-center">
                    <Edit3 className="w-5 h-5 mr-2 text-green-500" />
                    相关操作
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button onClick={() => handleNavigate('edit', {
                  id: storyId
                })} className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all duration-200">
                    <Edit3 className="w-4 h-4 mr-2" />
                    编辑故事
                  </Button>
                  <Button onClick={() => handleNavigate('index')} variant="outline" className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 transition-all duration-200">
                    <Home className="w-4 h-4 mr-2" />
                    返回首页
                  </Button>
                  <Button onClick={handleNavigateBack} variant="outline" className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 transition-all duration-200">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    返回上页
                  </Button>
                </CardContent>
              </Card>

              {/* 标签云 */}
              {story.tags && story.tags.length > 0 && <Card className="bg-slate-800/80 backdrop-blur-sm border-slate-700/50 rounded-2xl shadow-xl">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-white flex items-center">
                      <Tag className="w-5 h-5 mr-2 text-purple-500" />
                      故事标签
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {story.tags.map((tag, index) => <Badge key={index} variant="outline" className="border-purple-500/50 text-purple-400 bg-purple-500/10 hover:bg-purple-500/20 transition-colors cursor-pointer" onClick={() => {
                    // 可以添加标签搜索功能
                    toast({
                      title: '标签搜索',
                      description: `搜索标签：${tag}`
                    });
                  }}>
                          {tag}
                        </Badge>)}
                    </div>
                  </CardContent>
                </Card>}
            </div>
          </div>
        </div>
      </main>

      <MobileBottomNav currentPage="detail" navigateTo={navigateTo} />
    </div>;
}