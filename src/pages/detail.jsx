// @ts-ignore;
import React, { useState, useEffect, useCallback, useRef } from 'react';
// @ts-ignore;
import { Button, Badge, useToast } from '@/components/ui';
// @ts-ignore;
import { ArrowLeft, Clock, User, Calendar, Eye, Share2, Heart, Bookmark, BookOpen, Text, Minus, Plus } from 'lucide-react';
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
    isActive: false,
    startX: 0,
    currentX: 0,
    threshold: 60
  });
  const touchStartRef = useRef(null);
  const {
    toast
  } = useToast();
  const navigateTo = $w.utils.navigateTo;
  const navigateBack = $w.utils.navigateBack;

  // 字体大小配置
  const fontSizes = {
    small: 'text-sm leading-relaxed',
    medium: 'text-lg leading-relaxed',
    large: 'text-xl leading-relaxed'
  };
  const fontSizeLabels = {
    small: '小',
    medium: '中',
    large: '大'
  };

  // 从URL参数获取故事ID
  const storyId = props.$w.page.dataset.params?.id;
  useEffect(() => {
    if (storyId) {
      loadStory();
      checkBookmarkStatus();
      loadFontSizePreference();
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
  useEffect(() => {
    // 保存字体大小偏好到 localStorage
    localStorage.setItem('readingFontSize', fontSize);
  }, [fontSize]);

  // 手势返回功能
  useEffect(() => {
    const handleTouchStart = e => {
      const touch = e.touches[0];
      // 只在移动端且从屏幕左侧边缘开始
      if (window.innerWidth < 768 && touch.clientX < 50) {
        setGestureState(prev => ({
          ...prev,
          isActive: true,
          startX: touch.clientX,
          currentX: touch.clientX
        }));
        touchStartRef.current = touch;
      }
    };
    const handleTouchMove = e => {
      if (!gestureState.isActive) return;
      const touch = e.touches[0];
      setGestureState(prev => ({
        ...prev,
        currentX: touch.clientX
      }));

      // 阻止默认滚动行为
      if (Math.abs(touch.clientX - gestureState.startX) > 10) {
        e.preventDefault();
      }
    };
    const handleTouchEnd = e => {
      if (!gestureState.isActive) return;
      const distance = gestureState.currentX - gestureState.startX;
      if (distance >= gestureState.threshold) {
        // 触发返回
        navigateBack();
        toast({
          title: '手势返回',
          description: '已返回上一页',
          duration: 1000
        });
      }
      setGestureState(prev => ({
        ...prev,
        isActive: false,
        startX: 0,
        currentX: 0
      }));
      touchStartRef.current = null;
    };

    // 添加触摸事件监听
    document.addEventListener('touchstart', handleTouchStart, {
      passive: false
    });
    document.addEventListener('touchmove', handleTouchMove, {
      passive: false
    });
    document.addEventListener('touchend', handleTouchEnd, {
      passive: true
    });
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [gestureState.isActive, gestureState.startX, gestureState.currentX, gestureState.threshold, navigateBack, toast]);
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
  const loadFontSizePreference = () => {
    const savedSize = localStorage.getItem('readingFontSize') || 'medium';
    setFontSize(savedSize);
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
  const changeFontSize = newSize => {
    setFontSize(newSize);
    toast({
      title: '字体大小已调整',
      description: `已设置为${fontSizeLabels[newSize]}号字体`,
      duration: 2000
    });
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
      {/* 手势返回视觉指示器 */}
      {gestureState.isActive && <div className="fixed top-0 left-0 h-full w-1 bg-red-500/50 z-50 transition-all duration-300" style={{
      transform: `translateX(${Math.min(gestureState.currentX - gestureState.startX, gestureState.threshold)}px)`
    }} />}
      
      {/* 手势返回提示 */}
      {gestureState.isActive && gestureState.currentX - gestureState.startX > 20 && <div className="fixed top-20 left-4 bg-slate-800/90 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-sm z-50 animate-fade-in">
          <ArrowLeft className="w-4 h-4 inline mr-1" />
          滑动返回
        </div>}

      {/* 阅读进度条 */}
      <div className="fixed top-0 left-0 w-full h-1 bg-slate-700 z-50">
        <div className="h-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-300" style={{
        width: `${readingProgress}%`
      }} />
      </div>

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
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Text className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-300">字体大小</span>
            </div>
            <div className="flex items-center space-x-1">
              {Object.entries(fontSizes).map(([size, className]) => <button key={size} onClick={() => changeFontSize(size)} className={cn("px-3 py-1.5 text-sm rounded-md transition-all duration-200", fontSize === size ? "bg-red-500 text-white shadow-md" : "bg-slate-700 text-slate-300 hover:bg-slate-600")}>
                  {fontSizeLabels[size]}
                </button>)}
            </div>
          </div>
        </div>

        {/* 文章内容 */}
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="prose prose-invert max-w-none">
            <div className={cn("text-slate-300 whitespace-pre-wrap font-serif transition-all duration-300", fontSizes[fontSize])}>
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
          <div className="bg-slate-800/90 backdrop-blur-sm rounded-lg p-2 space-y-2 shadow-lg">
            <Button onClick={() => changeFontSize('small')} size="icon" variant={fontSize === 'small' ? 'default' : 'ghost'} className={fontSize === 'small' ? 'bg-red-500' : 'bg-slate-700 hover:bg-slate-600'}>
              <Text className="w-4 h-4" />
            </Button>
            <Button onClick={() => changeFontSize('medium')} size="icon" variant={fontSize === 'medium' ? 'default' : 'ghost'} className={fontSize === 'medium' ? 'bg-red-500' : 'bg-slate-700 hover:bg-slate-600'}>
              <Text className="w-4 h-4" />
            </Button>
            <Button onClick={() => changeFontSize('large')} size="icon" variant={fontSize === 'large' ? 'default' : 'ghost'} className={fontSize === 'large' ? 'bg-red-500' : 'bg-slate-700 hover:bg-slate-600'}>
              <Text className="w-4 h-4" />
            </Button>
          </div>
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

      {/* 移动端底部导航 */}
      <MobileBottomNav currentPage="detail" navigateTo={navigateTo} />
    </div>;
}