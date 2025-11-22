// @ts-ignore;
import React, { useState, useEffect, useRef } from 'react';
// @ts-ignore;
import { Button, Badge, useToast } from '@/components/ui';
// @ts-ignore;
import { ArrowLeft, Clock, User, Calendar, Eye, Share2, Heart, Bookmark, BookOpen, Text, Minus, Plus, ChevronLeft, FileText, Image as ImageIcon, AlertCircle } from 'lucide-react';
// @ts-ignore;
import { cn } from '@/lib/utils';

// @ts-ignore;
import { Sidebar } from '@/components/Sidebar';
// @ts-ignore;
import { MobileBottomNav } from '@/components/MobileBottomNav';

// 内容处理工具函数
const processContent = content => {
  if (!content || typeof content !== 'string') {
    return {
      processedContent: '暂无内容',
      hasImages: false,
      wordCount: 0,
      readTime: 1
    };
  }

  // 处理换行符和段落
  let processedContent = content.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n') // 限制连续换行
  .trim();

  // 检查是否包含图片标记
  const hasImages = /!\[.*?\]\(.*?\)/.test(processedContent);

  // 计算字数（中文字符和英文单词）
  const chineseChars = (processedContent.match(/[\u4e00-\u9fa5]/g) || []).length;
  const englishWords = (processedContent.match(/[a-zA-Z]+/g) || []).length;
  const wordCount = chineseChars + englishWords;

  // 估算阅读时间（中文500字/分钟，英文200词/分钟）
  const readTime = Math.max(1, Math.ceil(chineseChars / 500 + englishWords / 200));
  return {
    processedContent,
    hasImages,
    wordCount,
    readTime
  };
};

// 图片组件
const StoryImage = ({
  src,
  alt,
  className
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  if (imageError || !src) {
    return <div className={cn("flex items-center justify-center bg-slate-700/50 rounded-lg", className)}>
        <ImageIcon className="w-8 h-8 text-slate-500" />
      </div>;
  }
  return <div className={cn("relative overflow-hidden rounded-lg", className)}>
      {!imageLoaded && <div className="absolute inset-0 bg-slate-700/50 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-slate-500 border-t-transparent rounded-full animate-spin"></div>
        </div>}
      <img src={src} alt={alt || '故事图片'} className={cn("w-full h-full object-cover transition-opacity duration-300", imageLoaded ? "opacity-100" : "opacity-0")} onLoad={() => setImageLoaded(true)} onError={() => setImageError(true)} />
    </div>;
};
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
  const [lineHeight, setLineHeight] = useState('relaxed');
  const [theme, setTheme] = useState('dark');
  const [gestureState, setGestureState] = useState({
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    isSwiping: false,
    showHint: false
  });
  const gestureRef = useRef(null);
  const contentRef = useRef(null);
  const {
    toast
  } = useToast();
  const navigateTo = $w.utils.navigateTo;
  const navigateBack = $w.utils.navigateBack;

  // 字体大小映射
  const fontSizeMap = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg',
    xl: 'text-xl'
  };

  // 行高映射
  const lineHeightMap = {
    tight: 'leading-tight',
    normal: 'leading-normal',
    relaxed: 'leading-relaxed',
    loose: 'leading-loose'
  };

  // 主题映射
  const themeMap = {
    dark: 'text-slate-300',
    sepia: 'text-amber-900',
    light: 'text-gray-800'
  };
  const themeBgMap = {
    dark: 'bg-slate-900',
    sepia: 'bg-amber-50',
    light: 'bg-gray-50'
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
    // 加载保存的阅读设置
    const savedFontSize = localStorage.getItem('detailFontSize') || 'medium';
    const savedLineHeight = localStorage.getItem('detailLineHeight') || 'relaxed';
    const savedTheme = localStorage.getItem('detailTheme') || 'dark';
    setFontSize(savedFontSize);
    setLineHeight(savedLineHeight);
    setTheme(savedTheme);
    if (storyId) {
      loadStory();
      checkBookmarkStatus();
    }
  }, [storyId]);
  useEffect(() => {
    // 监听滚动事件计算阅读进度
    const handleScroll = () => {
      if (!contentRef.current) return;
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const elementTop = contentRef.current.offsetTop;
      const elementHeight = contentRef.current.offsetHeight;
      const windowHeight = window.innerHeight;

      // 计算内容区域的滚动进度
      const contentScrollTop = Math.max(0, scrollTop - elementTop);
      const scrollableHeight = elementHeight - windowHeight;
      const progress = scrollableHeight > 0 ? Math.min(contentScrollTop / scrollableHeight * 100, 100) : 0;
      setReadingProgress(progress);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [story]);
  const loadStory = async () => {
    try {
      setLoading(true);
      setError(null);
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();
      const result = await db.collection('red_story').doc(storyId).get();
      if (result && result.data) {
        setStory(result.data);
        // 增加阅读次数
        try {
          await db.collection('red_story').doc(storyId).update({
            views: (result.data.views || 0) + 1,
            lastReadAt: new Date()
          });
        } catch (updateError) {
          console.warn('更新阅读次数失败:', updateError);
        }
      } else {
        setError('故事不存在或已被删除');
      }
    } catch (err) {
      console.error('加载故事失败:', err);
      setError('加载失败，请稍后重试');
      toast({
        title: '加载失败',
        description: '无法加载故事内容，请检查网络连接',
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
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: '链接已复制',
          description: '故事链接已复制到剪贴板'
        });
      } catch (err) {
        toast({
          title: '复制失败',
          description: '无法复制链接，请手动复制',
          variant: 'destructive'
        });
      }
    }
  };
  const changeFontSize = size => {
    setFontSize(size);
    localStorage.setItem('detailFontSize', size);
    toast({
      title: '字体大小已调整',
      description: `已设置为${size === 'small' ? '小' : size === 'medium' ? '中' : size === 'large' ? '大' : '特大'}字体`,
      duration: 2000
    });
  };
  const changeLineHeight = height => {
    setLineHeight(height);
    localStorage.setItem('detailLineHeight', height);
    toast({
      title: '行距已调整',
      description: `已设置为${height === 'tight' ? '紧密' : height === 'normal' ? '正常' : height === 'relaxed' ? '宽松' : '很宽松'}行距`,
      duration: 2000
    });
  };
  const changeTheme = newTheme => {
    setTheme(newTheme);
    localStorage.setItem('detailTheme', newTheme);
    toast({
      title: '主题已切换',
      description: `已切换到${newTheme === 'dark' ? '深色' : newTheme === 'sepia' ? '护眼' : '浅色'}主题`,
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
    const {
      readTime
    } = processContent(content);
    return `${readTime}分钟阅读`;
  };

  // 处理内容
  const {
    processedContent,
    hasImages,
    wordCount,
    readTime
  } = story ? processContent(story.content) : {
    processedContent: '',
    hasImages: false,
    wordCount: 0,
    readTime: 0
  };
  if (loading) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <Sidebar currentPage="index" navigateTo={navigateTo} />
        <main className="content-transition sidebar-transition md:ml-16 lg:ml-64">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-slate-700 rounded w-3/4"></div>
              <div className="h-64 bg-slate-700 rounded"></div>
              <div className="space-y-2">
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
        <main className="content-transition sidebar-transition md:ml-16 lg:ml-64">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center py-16">
              <AlertCircle className="w-24 h-24 text-slate-600 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-slate-400 mb-4">{error || '故事不存在'}</h2>
              <p className="text-slate-500 mb-8">故事可能已被删除或暂时无法访问</p>
              <Button onClick={navigateBack} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white button-press">
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回首页
              </Button>
            </div>
          </div>
        </main>
      </div>;
  }
  return <div className={cn("min-h-screen transition-colors duration-300", themeBgMap[theme])}>
      {/* 阅读进度条 */}
      <div className="fixed top-0 left-0 w-full h-1 bg-slate-200 dark:bg-slate-700 z-50">
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

      <main className={cn("content-transition sidebar-transition md:ml-16 lg:ml-64 animate-fade-in", theme === 'dark' ? 'text-white' : theme === 'sepia' ? 'text-amber-900' : 'text-gray-800')}>
        {/* 移动端返回按钮 */}
        <div className="md:hidden sticky top-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 px-4 py-3 flex items-center justify-between z-40">
          <Button onClick={navigateBack} variant="ghost" size="sm" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white button-press">
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回
          </Button>
          <div className="flex items-center space-x-2">
            <Button onClick={toggleBookmark} variant="ghost" size="sm" className={isBookmarked ? 'text-red-500' : 'text-slate-400'}>
              <Bookmark className="w-4 h-4" fill={isBookmarked ? 'currentColor' : 'none'} />
            </Button>
            <Button onClick={shareStory} variant="ghost" size="sm" className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* 文章头部 */}
        <header className="relative animate-slide-in">
          {story.image && <div className="relative h-64 md:h-96 overflow-hidden">
              <StoryImage src={story.image} alt={story.title} className="w-full h-full" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
            </div>}
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
            <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-2xl hover-lift">
              <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-4">
                <span className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {formatDate(story.createdAt)}
                </span>
                <span>•</span>
                <span className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {formatReadTime(story.content)}
                </span>
                <span>•</span>
                <span className="flex items-center">
                  <FileText className="w-4 h-4 mr-1" />
                  {wordCount}字
                </span>
                <span>•</span>
                <span className="flex items-center">
                  <Eye className="w-4 h-4 mr-1" />
                  {story.views || 0}次阅读
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
                {story.title || '无标题'}
              </h1>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-slate-400" />
                  <span className="text-slate-600 dark:text-slate-300">{story.author || '佚名'}</span>
                </div>
                {story.tags && story.tags.length > 0 && <div className="flex flex-wrap items-center gap-2">
                    {story.tags.map((tag, index) => <Badge key={index} variant="outline" className="border-red-500/30 text-red-400 text-sm bg-red-500/10">
                        {tag}
                      </Badge>)}
                  </div>}
              </div>
            </div>
          </div>
        </header>

        {/* 阅读设置工具栏 */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 animate-fade-in" style={{
        animationDelay: '0.2s'
      }}>
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-slate-200 dark:border-slate-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 字体大小 */}
              <div className="flex items-center space-x-2">
                <Text className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-600 dark:text-slate-300">字体</span>
                <div className="flex items-center space-x-1">
                  <Button onClick={() => changeFontSize('small')} variant={fontSize === 'small' ? 'default' : 'ghost'} size="sm" className={cn("px-2 py-1 button-press", fontSize === 'small' && "bg-red-500 hover:bg-red-600")}>
                    小
                  </Button>
                  <Button onClick={() => changeFontSize('medium')} variant={fontSize === 'medium' ? 'default' : 'ghost'} size="sm" className={cn("px-2 py-1 button-press", fontSize === 'medium' && "bg-red-500 hover:bg-red-600")}>
                    中
                  </Button>
                  <Button onClick={() => changeFontSize('large')} variant={fontSize === 'large' ? 'default' : 'ghost'} size="sm" className={cn("px-2 py-1 button-press", fontSize === 'large' && "bg-red-500 hover:bg-red-600")}>
                    大
                  </Button>
                  <Button onClick={() => changeFontSize('xl')} variant={fontSize === 'xl' ? 'default' : 'ghost'} size="sm" className={cn("px-2 py-1 button-press", fontSize === 'xl' && "bg-red-500 hover:bg-red-600")}>
                    特大
                  </Button>
                </div>
              </div>

              {/* 行高 */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-slate-600 dark:text-slate-300">行距</span>
                <div className="flex items-center space-x-1">
                  <Button onClick={() => changeLineHeight('tight')} variant={lineHeight === 'tight' ? 'default' : 'ghost'} size="sm" className={cn("px-2 py-1 button-press", lineHeight === 'tight' && "bg-red-500 hover:bg-red-600")}>
                    紧密
                  </Button>
                  <Button onClick={() => changeLineHeight('normal')} variant={lineHeight === 'normal' ? 'default' : 'ghost'} size="sm" className={cn("px-2 py-1 button-press", lineHeight === 'normal' && "bg-red-500 hover:bg-red-600")}>
                    正常
                  </Button>
                  <Button onClick={() => changeLineHeight('relaxed')} variant={lineHeight === 'relaxed' ? 'default' : 'ghost'} size="sm" className={cn("px-2 py-1 button-press", lineHeight === 'relaxed' && "bg-red-500 hover:bg-red-600")}>
                    宽松
                  </Button>
                  <Button onClick={() => changeLineHeight('loose')} variant={lineHeight === 'loose' ? 'default' : 'ghost'} size="sm" className={cn("px-2 py-1 button-press", lineHeight === 'loose' && "bg-red-500 hover:bg-red-600")}>
                    很宽
                  </Button>
                </div>
              </div>

              {/* 主题 */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-slate-600 dark:text-slate-300">主题</span>
                <div className="flex items-center space-x-1">
                  <Button onClick={() => changeTheme('dark')} variant={theme === 'dark' ? 'default' : 'ghost'} size="sm" className={cn("px-2 py-1 button-press", theme === 'dark' && "bg-red-500 hover:bg-red-600")}>
                    深色
                  </Button>
                  <Button onClick={() => changeTheme('sepia')} variant={theme === 'sepia' ? 'default' : 'ghost'} size="sm" className={cn("px-2 py-1 button-press", theme === 'sepia' && "bg-red-500 hover:bg-red-600")}>
                    护眼
                  </Button>
                  <Button onClick={() => changeTheme('light')} variant={theme === 'light' ? 'default' : 'ghost'} size="sm" className={cn("px-2 py-1 button-press", theme === 'light' && "bg-red-500 hover:bg-red-600")}>
                    浅色
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 文章内容 */}
        <article ref={contentRef} className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in" style={{
        animationDelay: '0.3s'
      }} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
          <div className="prose prose-lg max-w-none">
            <div className={cn("whitespace-pre-wrap font-serif transition-all duration-300", fontSizeMap[fontSize], lineHeightMap[lineHeight], themeMap[theme])}>
              {processedContent}
            </div>
          </div>

          {/* 文章底部操作栏 */}
          <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <Button onClick={toggleBookmark} variant="outline" className={cn("button-press", isBookmarked ? "border-red-500 text-red-500 bg-red-500/10" : "border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700")}>
                  <Bookmark className="w-4 h-4 mr-2" fill={isBookmarked ? 'currentColor' : 'none'} />
                  {isBookmarked ? '已收藏' : '收藏'}
                </Button>
                <Button onClick={shareStory} variant="outline" className="border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 button-press">
                  <Share2 className="w-4 h-4 mr-2" />
                  分享
                </Button>
              </div>
              <Button onClick={navigateBack} variant="ghost" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white button-press">
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回列表
              </Button>
            </div>
          </div>
        </article>

        {/* 桌面端底部操作栏 */}
        <div className="hidden md:block fixed bottom-8 right-8 space-y-2">
          <Button onClick={toggleBookmark} size="icon" className={cn("button-press shadow-lg", isBookmarked ? "bg-red-500 hover:bg-red-600" : "bg-slate-700 dark:bg-slate-600 hover:bg-slate-600 dark:hover:bg-slate-500")}>
            <Bookmark className="w-4 h-4" fill={isBookmarked ? 'currentColor' : 'none'} />
          </Button>
          <Button onClick={shareStory} size="icon" className="bg-slate-700 dark:bg-slate-600 hover:bg-slate-600 dark:hover:bg-slate-500 button-press shadow-lg">
            <Share2 className="w-4 h-4" />
          </Button>
          <Button onClick={navigateBack} size="icon" className="bg-slate-700 dark:bg-slate-600 hover:bg-slate-600 dark:hover:bg-slate-500 button-press shadow-lg">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </div>
      </main>

      <MobileBottomNav currentPage="detail" navigateTo={navigateTo} />
    </div>;
}