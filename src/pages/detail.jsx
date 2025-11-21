// @ts-ignore;
import React, { useState, useEffect, useRef } from 'react';
// @ts-ignore;
import { Button, Badge, useToast } from '@/components/ui';
// @ts-ignore;
import { ArrowLeft, Clock, User, Calendar, Eye, Share2, Heart, Bookmark, BookOpen, Text, Minus, Plus, ChevronLeft } from 'lucide-react';
// @ts-ignore;
import { cn } from '@/lib/utils';

// @ts-ignore;
import { Sidebar } from '@/components/Sidebar';
// @ts-ignore;
import { MobileBottomNav } from '@/components/MobileBottomNav';
// @ts-ignore;

export default function DetailPage(props) {
  const {
    $w
  } = props;
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [fontSize, setFontSize] = useState('medium');
  const [gestureState, setGestureState] = useState({
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    isSwiping: false,
    showHint: false
  });
  const gestureRef = useRef(null);
  const {
    toast
  } = useToast();
  const navigateTo = $w.utils.navigateTo;
  const navigateBack = $w.utils.navigateBack;

  // 字体大小映射
  const fontSizeMap = {
    small: 'text-sm leading-relaxed',
    medium: 'text-base leading-relaxed',
    large: 'text-lg leading-relaxed'
  };

  // 手势处理
  const handleTouchStart = e => {
    const touch = e.touches[0];
    setGestureState({
      startX: touch.clientX,
      startY: touch.clientY,
      currentX: touch.clientX,
      currentY: touch.clientY,
      isSwiping: false,
      showHint: false
    });
  };
  const handleTouchMove = e => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    const deltaX = touch.clientX - gestureState.startX;
    const deltaY = touch.clientY - gestureState.startY;

    // 计算角度（弧度转角度）
    const angle = Math.abs(Math.atan2(deltaY, deltaX) * 180 / Math.PI);

    // 检查是否为水平滑动
    const isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY) * 2;
    const isLeftSwipe = deltaX < -60 && angle < 30;
    setGestureState(prev => ({
      ...prev,
      currentX: touch.clientX,
      currentY: touch.clientY,
      isSwiping: isHorizontalSwipe,
      showHint: isLeftSwipe
    }));

    // 防止页面滚动
    if (isHorizontalSwipe) {
      e.preventDefault();
    }
  };
  const handleTouchEnd = e => {
    const deltaX = gestureState.currentX - gestureState.startX;
    const deltaY = gestureState.currentY - gestureState.startY;
    const angle = Math.abs(Math.atan2(deltaY, deltaX) * 180 / Math.PI);

    // 触发返回条件：左滑距离 > 60px 且角度 < 30°
    if (deltaX < -60 && angle < 30) {
      navigateBack();
    }

    // 重置手势状态
    setGestureState({
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
      isSwiping: false,
      showHint: false
    });
  };

  // 从URL参数获取故事ID
  const storyId = props.$w.page.dataset.params?.id;
  useEffect(() => {
    // 加载保存的字体大小设置
    const savedFontSize = localStorage.getItem('detailFontSize') || 'medium';
    setFontSize(savedFontSize);
    if (storyId) {
      loadStory();
      checkBookmarkStatus();
    }
  }, [storyId]);
  useEffect(() => {
    // 监听滚动事件计算阅读进度
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const progress = Math.min(scrollTop / scrollHeight * 100, 100);
      setReadingProgress(progress);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const loadStory = async () => {
    try {
      setLoading(true);
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();
      const result = await db.collection('red_story').doc(storyId).get();
      if (result && result.data) {
        setStory(result.data);
        // 增加阅读次数
        await db.collection('red_story').doc(storyId).update({
          views: (result.data.views || 0) + 1
        });
      } else {
        setError('故事不存在');
      }
    } catch (err) {
      console.error('加载故事失败:', err);
      setError('加载失败，请稍后重试');
      toast({
        title: '加载失败',
        description: '无法加载故事内容',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  const checkBookmarkStatus = () => {
    const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
    setIsBookmarked(bookmarks.includes(storyId));
  };
  const toggleBookmark = () => {
    const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
    if (isBookmarked) {
      const newBookmarks = bookmarks.filter(id => id !== storyId);
      localStorage.setItem('bookmarks', JSON.stringify(newBookmarks));
      setIsBookmarked(false);
      toast({
        title: '已取消收藏',
        description: '故事已从收藏夹移除'
      });
    } else {
      bookmarks.push(storyId);
      localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
      setIsBookmarked(true);
      toast({
        title: '收藏成功',
        description: '故事已添加到收藏夹'
      });
    }
  };
  const shareStory = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: story?.title || '红色故事',
          text: story?.content?.substring(0, 100) + '...',
          url: window.location.href
        });
      } catch (err) {
        console.log('分享取消');
      }
    } else {
      // 复制链接到剪贴板
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: '链接已复制',
        description: '故事链接已复制到剪贴板'
      });
    }
  };
  const changeFontSize = size => {
    setFontSize(size);
    localStorage.setItem('detailFontSize', size);
    toast({
      title: '字体大小已调整',
      description: `已设置为${size === 'small' ? '小' : size === 'medium' ? '中' : '大'}字体`,
      duration: 2000
    });
  };
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
  const formatReadTime = content => {
    if (!content) return '5分钟阅读';
    const wordCount = content.length;
    const readTime = Math.ceil(wordCount / 500);
    return `${readTime}分钟阅读`;
  };
  if (loading) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <Sidebar currentPage="index" navigateTo={navigateTo} />
        <main className="transition-all duration-300 ease-in-out md:ml-16 lg:ml-64">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="animate-pulse">
              <div className="h-8 bg-slate-700 rounded w-1/3 mb-4"></div>
              <div className="h-64 bg-slate-700 rounded mb-6"></div>
              <div className="space-y-3">
                <div className="h-4 bg-slate-700 rounded"></div>
                <div className="h-4 bg-slate-700 rounded w-5/6"></div>
                <div className="h-4 bg-slate-700 rounded w-4/6"></div>
              </div>
            </div>
          </div>
        </main>
      </div>;
  }
  if (error || !story) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <Sidebar currentPage="index" navigateTo={navigateTo} />
        <main className="transition-all duration-300 ease-in-out md:ml-16 lg:ml-64">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center py-16">
              <BookOpen className="w-24 h-24 text-slate-600 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-slate-400 mb-4">{error || '故事不存在'}</h2>
              <Button onClick={navigateBack} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white">
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回首页
              </Button>
            </div>
          </div>
        </main>
      </div>;
  }
  return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* 阅读进度条 */}
      <div className="fixed top-0 left-0 w-full h-1 bg-slate-700 z-50">
        <div className="h-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-300" style={{
        width: `${readingProgress}%`
      }} />
      </div>

      {/* 手势返回提示 */}
      {gestureState.showHint && <div className="fixed top-1/2 left-4 transform -translate-y-1/2 z-50 bg-slate-800/90 backdrop-blur-sm text-white px-4 py-2 rounded-lg shadow-lg transition-opacity duration-300 md:hidden">
          <div className="flex items-center space-x-2">
            <ChevronLeft className="w-5 h-5 animate-pulse" />
            <span className="text-sm">左滑返回</span>
          </div>
        </div>}

      <Sidebar currentPage="index" navigateTo={navigateTo} />

      <main className="transition-all duration-300 ease-in-out md:ml-16 lg:ml-64">
        {/* 移动端返回按钮 */}
        <div className="md:hidden sticky top-0 bg-slate-800/90 backdrop-blur-sm border-b border-slate-700 px-4 py-3 flex items-center justify-between z-40">
          <Button onClick={navigateBack} variant="ghost" size="sm" className="text-slate-300 hover:text-white">
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回
          </Button>
          <div className="flex items-center space-x-2">
            <Button onClick={toggleBookmark} variant="ghost" size="sm" className={isBookmarked ? 'text-red-500' : 'text-slate-400'}>
              <Bookmark className="w-4 h-4" fill={isBookmarked ? 'currentColor' : 'none'} />
            </Button>
            <Button onClick={shareStory} variant="ghost" size="sm" className="text-slate-400 hover:text-white">
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* 文章头部 */}
        <header className="relative">
          {story.image && <div className="relative h-64 md:h-96 overflow-hidden">
              <img src={story.image} alt={story.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent"></div>
            </div>}
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
            <div className="bg-slate-800/90 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-2xl">
              <div className="flex items-center space-x-2 text-sm text-slate-400 mb-4">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(story.createdAt)}</span>
                <span>•</span>
                <Clock className="w-4 h-4" />
                <span>{formatReadTime(story.content)}</span>
                <span>•</span>
                <Eye className="w-4 h-4" />
                <span>{story.views || 0}次阅读</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
                {story.title}
              </h1>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-slate-400" />
                  <span className="text-slate-300">{story.author || '佚名'}</span>
                </div>
                {story.tags && story.tags.length > 0 && <div className="flex items-center space-x-2">
                    {story.tags.map((tag, index) => <Badge key={index} variant="outline" className="border-red-500/30 text-red-400 text-sm bg-red-500/10">
                        {tag}
                      </Badge>)}
                  </div>}
              </div>
            </div>
          </div>
        </header>

        {/* 字体大小调节工具栏 */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 flex items-center justify-between border border-slate-700/50">
            <div className="flex items-center space-x-2">
              <Text className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-300">字体大小</span>
            </div>
            <div className="flex items-center space-x-2">
              <Button onClick={() => changeFontSize('small')} variant={fontSize === 'small' ? 'default' : 'ghost'} size="sm" className={cn("px-3 py-1", fontSize === 'small' && "bg-red-500 hover:bg-red-600")}>
                小
              </Button>
              <Button onClick={() => changeFontSize('medium')} variant={fontSize === 'medium' ? 'default' : 'ghost'} size="sm" className={cn("px-3 py-1", fontSize === 'medium' && "bg-red-500 hover:bg-red-600")}>
                中
              </Button>
              <Button onClick={() => changeFontSize('large')} variant={fontSize === 'large' ? 'default' : 'ghost'} size="sm" className={cn("px-3 py-1", fontSize === 'large' && "bg-red-500 hover:bg-red-600")}>
                大
              </Button>
            </div>
          </div>
        </div>

        {/* 文章内容 - 添加手势事件监听 */}
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd} ref={gestureRef}>
          <div className="prose prose-invert prose-lg max-w-none">
            <div className={cn("text-slate-300 whitespace-pre-wrap font-serif transition-all duration-300", fontSizeMap[fontSize])}>
              {story.content}
            </div>
          </div>

          {/* 文章底部操作栏 */}
          <div className="mt-12 pt-8 border-t border-slate-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button onClick={toggleBookmark} variant="outline" className={isBookmarked ? 'border-red-500 text-red-500 bg-red-500/10' : 'border-slate-600 text-slate-300 hover:bg-slate-700'}>
                  <Bookmark className="w-4 h-4 mr-2" fill={isBookmarked ? 'currentColor' : 'none'} />
                  {isBookmarked ? '已收藏' : '收藏'}
                </Button>
                <Button onClick={shareStory} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                  <Share2 className="w-4 h-4 mr-2" />
                  分享
                </Button>
              </div>
              <Button onClick={navigateBack} variant="ghost" className="text-slate-400 hover:text-white">
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回列表
              </Button>
            </div>
          </div>
        </article>

        {/* 桌面端底部操作栏 */}
        <div className="hidden md:block fixed bottom-8 right-8 space-y-2">
          <Button onClick={toggleBookmark} size="icon" className={isBookmarked ? 'bg-red-500 hover:bg-red-600' : 'bg-slate-700 hover:bg-slate-600'}>
            <Bookmark className="w-4 h-4" fill={isBookmarked ? 'currentColor' : 'none'} />
          </Button>
          <Button onClick={shareStory} size="icon" className="bg-slate-700 hover:bg-slate-600">
            <Share2 className="w-4 h-4" />
          </Button>
          <Button onClick={navigateBack} size="icon" className="bg-slate-700 hover:bg-slate-600">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </div>
      </main>

      <MobileBottomNav currentPage="detail" navigateTo={navigateTo} />
    </div>;
}