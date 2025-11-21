// @ts-ignore;
import React, { useState, useEffect, useRef } from 'react';
// @ts-ignore;
import { Button, Badge, useToast } from '@/components/ui';
// @ts-ignore;
import { ArrowLeft, Clock, User, Calendar, Eye, Share2, Bookmark, BookOpen, Text } from 'lucide-react';
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
  const [error, setError] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [fontSettings, setFontSettings] = useState({
    size: 'medium',
    lineHeight: 'relaxed',
    paragraphSpacing: '6'
  });
  const [gestureState, setGestureState] = useState({
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    translateX: 0,
    isSwiping: false,
    isAnimating: false,
    showHint: false
  });
  const gestureRef = useRef(null);
  const contentRef = useRef(null);
  const {
    toast
  } = useToast();
  const navigateTo = $w.utils.navigateTo;
  const navigateBack = $w.utils.navigateBack;

  // 字体样式映射
  const fontStyleMap = {
    small: {
      fontSize: 'text-sm',
      lineHeight: 'leading-relaxed',
      paragraphSpacing: 'mb-4',
      letterSpacing: 'tracking-normal'
    },
    medium: {
      fontSize: 'text-base',
      lineHeight: 'leading-relaxed',
      paragraphSpacing: 'mb-5',
      letterSpacing: 'tracking-normal'
    },
    large: {
      fontSize: 'text-lg',
      lineHeight: 'leading-loose',
      paragraphSpacing: 'mb-6',
      letterSpacing: 'tracking-wide'
    }
  };

  // 从 localStorage 加载字体设置
  useEffect(() => {
    const savedSettings = localStorage.getItem('detailFontSettings');
    if (savedSettings) {
      try {
        setFontSettings(JSON.parse(savedSettings));
      } catch (e) {
        console.error('加载字体设置失败:', e);
      }
    }
  }, []);

  // 从URL参数获取故事ID
  const storyId = props.$w.page.dataset.params?.id;
  useEffect(() => {
    if (storyId) {
      loadStory();
      checkBookmarkStatus();
    }
  }, [storyId]);

  // 监听滚动事件计算阅读进度
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const progress = Math.min(scrollTop / scrollHeight * 100, 100);
      setReadingProgress(progress);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 手势处理 - 添加动画效果
  const handleTouchStart = e => {
    const touch = e.touches[0];
    setGestureState(prev => ({
      ...prev,
      startX: touch.clientX,
      startY: touch.clientY,
      currentX: touch.clientX,
      currentY: touch.clientY,
      translateX: 0,
      isSwiping: false,
      isAnimating: false,
      showHint: false
    }));
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
    if (isHorizontalSwipe && deltaX < 0) {
      // 限制最大滑动距离
      const maxTranslate = Math.min(Math.abs(deltaX), 100);
      setGestureState(prev => ({
        ...prev,
        currentX: touch.clientX,
        currentY: touch.clientY,
        translateX: -maxTranslate,
        isSwiping: true,
        showHint: Math.abs(deltaX) > 30
      }));

      // 防止页面滚动
      e.preventDefault();
    }
  };
  const handleTouchEnd = e => {
    const deltaX = gestureState.currentX - gestureState.startX;
    const deltaY = gestureState.currentY - gestureState.startY;
    const angle = Math.abs(Math.atan2(deltaY, deltaX) * 180 / Math.PI);

    // 触发返回条件：左滑距离 > 60px 且角度 < 30°
    if (deltaX < -60 && angle < 30) {
      // 开始返回动画
      setGestureState(prev => ({
        ...prev,
        translateX: -window.innerWidth,
        isAnimating: true
      }));

      // 延迟执行返回操作，等待动画完成
      setTimeout(() => {
        navigateBack();
      }, 300);
    } else {
      // 回弹动画
      setGestureState(prev => ({
        ...prev,
        translateX: 0,
        isAnimating: true
      }));

      // 重置状态
      setTimeout(() => {
        setGestureState({
          startX: 0,
          startY: 0,
          currentX: 0,
          currentY: 0,
          translateX: 0,
          isSwiping: false,
          isAnimating: false,
          showHint: false
        });
      }, 300);
    }
  };
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
  const changeFontSettings = size => {
    const newSettings = {
      ...fontSettings,
      size,
      lineHeight: size === 'large' ? 'leading-loose' : 'leading-relaxed',
      paragraphSpacing: size === 'small' ? 'mb-4' : size === 'medium' ? 'mb-5' : 'mb-6'
    };
    setFontSettings(newSettings);
    localStorage.setItem('detailFontSettings', JSON.stringify(newSettings));
    toast({
      title: '阅读设置已更新',
      description: `字体大小：${size === 'small' ? '小' : size === 'medium' ? '中' : '大'}，行高已同步调整`,
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

      {/* 手势返回遮罩层 */}
      {gestureState.isSwiping && gestureState.translateX < 0 && <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300 md:hidden" style={{
      opacity: Math.min(Math.abs(gestureState.translateX) / 100, 0.5)
    }} />}

      {/* 手势返回提示 */}
      {gestureState.showHint && <div className="fixed top-1/2 left-4 transform -translate-y-1/2 z-50 bg-slate-800/90 backdrop-blur-sm text-white px-4 py-2 rounded-lg shadow-lg transition-opacity duration-300 md:hidden">
          <div className="flex items-center space-x-2">
            <ArrowLeft className="w-5 h-5 animate-pulse" />
            <span className="text-sm">左滑返回</span>
          </div>
        </div>}

      <Sidebar currentPage="index" navigateTo={navigateTo} />

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
      <header className="relative overflow-hidden">
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
            <span className="text-sm text-slate-300">阅读设置</span>
          </div>
          <div className="flex items-center space-x-2">
            <Button onClick={() => changeFontSettings('small')} variant={fontSettings.size === 'small' ? 'default' : 'ghost'} size="sm" className={cn("px-3 py-1", fontSettings.size === 'small' && "bg-red-500 hover:bg-red-600")}>
              小
            </Button>
            <Button onClick={() => changeFontSettings('medium')} variant={fontSettings.size === 'medium' ? 'default' : 'ghost'} size="sm" className={cn("px-3 py-1", fontSettings.size === 'medium' && "bg-red-500 hover:bg-red-600")}>
              中
            </Button>
            <Button onClick={() => changeFontSettings('large')} variant={fontSettings.size === 'large' ? 'default' : 'ghost'} size="sm" className={cn("px-3 py-1", fontSettings.size === 'large' && "bg-red-500 hover:bg-red-600")}>
              大
            </Button>
          </div>
        </div>
      </div>

      {/* 文章内容 - 添加手势动画效果 */}
      <div className="relative overflow-hidden md:hidden">
        <div ref={contentRef} className="transition-transform duration-300 ease-out" style={{
        transform: `translateX(${gestureState.translateX}px)`,
        transition: gestureState.isAnimating ? 'transform 0.3s ease-out' : 'none'
      }}>
          <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
            <div className="prose prose-invert prose-lg max-w-none">
              <div className={cn("text-slate-300 whitespace-pre-wrap font-serif transition-all duration-300", fontStyleMap[fontSettings.size].fontSize, fontStyleMap[fontSettings.size].lineHeight, fontStyleMap[fontSettings.size].letterSpacing)}>
                {story.content.split('\n\n').map((paragraph, index) => <p key={index} className={cn("text-justify", fontStyleMap[fontSettings.size].paragraphSpacing)}>
                    {paragraph}
                  </p>)}
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
        </div>
      </div>

      {/* 桌面端内容 - 无手势动画 */}
      <div className="hidden md:block">
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="prose prose-invert prose-lg max-w-none">
            <div className={cn("text-slate-300 whitespace-pre-wrap font-serif transition-all duration-300", fontStyleMap[fontSettings.size].fontSize, fontStyleMap[fontSettings.size].lineHeight, fontStyleMap[fontSettings.size].letterSpacing)}>
              {story.content.split('\n\n').map((paragraph, index) => <p key={index} className={cn("text-justify", fontStyleMap[fontSettings.size].paragraphSpacing)}>
                  {paragraph}
                </p>)}
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
      </div>

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

      <MobileBottomNav currentPage="detail" navigateTo={navigateTo} />
    </div>;
}