// @ts-ignore;
import React, { useState, useEffect, useRef, useCallback } from 'react';
// @ts-ignore;
import { Button, Badge, useToast } from '@/components/ui';
// @ts-ignore;
import { ArrowLeft, Clock, User, Calendar, Eye, Share2, Heart, Bookmark, BookOpen, Text, Minus, Plus, ChevronLeft, CheckCircle, Loader2, Edit3, Home, RefreshCw, AlertCircle } from 'lucide-react';
// @ts-ignore;
import { cn } from '@/lib/utils';

// @ts-ignore;
import { Sidebar } from '@/components/Sidebar';
// @ts-ignore;
import { MobileBottomNav } from '@/components/MobileBottomNav';

// 内容处理函数
const processContent = content => {
  if (!content) return '';

  // 处理换行符和段落
  let processed = content
  // 统一换行符
  .replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  // 处理多个连续换行符
  .replace(/\n{3,}/g, '\n\n')
  // 处理段落开头空格
  .replace(/\n(?!$)/g, '\n  ')
  // 确保段落间有适当间距
  .replace(/\n\n/g, '\n\n');
  return processed.trim();
};

// 检测是否到达文章末尾
const useScrollEndDetection = callback => {
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;

      // 当滚动到距离底部100px以内时触发
      if (scrollTop + clientHeight >= scrollHeight - 100) {
        callback();
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [callback]);
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
  const [sidebarState, setSidebarState] = useState({
    isCollapsed: false,
    isDesktop: true
  });
  const [gestureState, setGestureState] = useState({
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    isSwiping: false,
    showHint: false
  });
  const [hasReachedEnd, setHasReachedEnd] = useState(false);
  const [showEndMessage, setShowEndMessage] = useState(false);
  const [navigating, setNavigating] = useState(false);
  const gestureRef = useRef(null);
  const {
    toast
  } = useToast();
  const navigateTo = $w.utils.navigateTo;
  const navigateBack = $w.utils.navigateBack;

  // 字体大小映射
  const fontSizeMap = {
    small: {
      text: 'text-sm',
      leading: 'leading-relaxed',
      spacing: 'space-y-4'
    },
    medium: {
      text: 'text-base',
      leading: 'leading-relaxed',
      spacing: 'space-y-6'
    },
    large: {
      text: 'text-lg',
      leading: 'leading-loose',
      spacing: 'space-y-8'
    }
  };

  // 处理文章末尾检测
  const handleScrollEnd = useCallback(() => {
    if (!hasReachedEnd && story && story._id !== 'preview') {
      setHasReachedEnd(true);
      setShowEndMessage(true);

      // 3秒后隐藏提示
      setTimeout(() => {
        setShowEndMessage(false);
      }, 3000);

      // 记录阅读完成
      try {
        const readStories = JSON.parse(localStorage.getItem('readStories') || '[]');
        if (!readStories.includes(story._id)) {
          readStories.push(story._id);
          localStorage.setItem('readStories', JSON.stringify(readStories));
        }
      } catch (error) {
        console.warn('保存阅读记录失败:', error);
      }
    }
  }, [hasReachedEnd, story]);
  useScrollEndDetection(handleScrollEnd);

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

  // 优化的返回函数
  const handleNavigateBack = useCallback(async () => {
    if (navigating) return;
    try {
      setNavigating(true);
      await new Promise(resolve => setTimeout(resolve, 100));
      navigateBack();
    } catch (error) {
      console.error('返回失败:', error);
      // 如果返回失败，尝试跳转到首页
      handleNavigate('index');
    } finally {
      setNavigating(false);
    }
  }, [navigating, navigateBack, handleNavigate, toast]);

  // 优化的故事加载函数
  const loadStory = useCallback(async storyId => {
    try {
      setLoading(true);
      setError(null);

      // 检查是否为预览模式
      if (storyId === 'preview') {
        const previewData = sessionStorage.getItem('previewStory');
        if (previewData) {
          const parsedData = JSON.parse(previewData);
          setStory(parsedData);
          setLoading(false);
          return;
        } else {
          throw new Error('预览数据不存在');
        }
      }
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();
      const result = await db.collection('red_story').doc(storyId).get();
      if (result && result.data) {
        const storyData = {
          ...result.data,
          title: result.data.title || '无标题',
          content: result.data.content || '暂无内容',
          author: result.data.author || '佚名',
          tags: Array.isArray(result.data.tags) ? result.data.tags : [],
          views: typeof result.data.views === 'number' ? result.data.views : 0
        };
        setStory(storyData);

        // 增加阅读次数（异步执行，不阻塞页面渲染）
        try {
          await db.collection('red_story').doc(storyId).update({
            views: (storyData.views || 0) + 1,
            lastReadAt: new Date()
          });
        } catch (updateError) {
          console.warn('更新阅读次数失败:', updateError);
          // 不影响用户阅读，只记录警告
        }
      } else {
        throw new Error('故事不存在或已被删除');
      }
    } catch (err) {
      console.error('加载故事失败:', err);
      const errorMessage = err.message || '加载失败，请稍后重试';
      setError(errorMessage);
      toast({
        title: '加载失败',
        description: errorMessage,
        variant: 'destructive',
        action: storyId !== 'preview' ? {
          label: '重试',
          onClick: () => loadStory(storyId)
        } : undefined
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // 检查收藏状态
  const checkBookmarkStatus = useCallback(storyId => {
    if (storyId === 'preview') return; // 预览模式不检查收藏状态

    try {
      const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
      setIsBookmarked(bookmarks.includes(storyId));
    } catch (error) {
      console.warn('检查收藏状态失败:', error);
      setIsBookmarked(false);
    }
  }, []);

  // 手势处理
  const handleTouchStart = useCallback(e => {
    const touch = e.touches[0];
    setGestureState({
      startX: touch.clientX,
      startY: touch.clientY,
      currentX: touch.clientX,
      currentY: touch.clientY,
      isSwiping: false,
      showHint: false
    });
  }, []);
  const handleTouchMove = useCallback(e => {
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
  }, [gestureState.startX, gestureState.startY]);
  const handleTouchEnd = useCallback(() => {
    const deltaX = gestureState.currentX - gestureState.startX;
    const deltaY = gestureState.currentY - gestureState.startY;
    const angle = Math.abs(Math.atan2(deltaY, deltaX) * 180 / Math.PI);

    // 触发返回条件：左滑距离 > 60px 且角度 < 30°
    if (deltaX < -60 && angle < 30) {
      handleNavigateBack();
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
  }, [gestureState, handleNavigateBack]);

  // 收藏功能
  const toggleBookmark = useCallback(() => {
    if (!story || story._id === 'preview') {
      toast({
        title: '预览模式',
        description: '预览模式下无法收藏',
        variant: 'destructive'
      });
      return;
    }
    try {
      const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
      if (isBookmarked) {
        const newBookmarks = bookmarks.filter(id => id !== story._id);
        localStorage.setItem('bookmarks', JSON.stringify(newBookmarks));
        setIsBookmarked(false);
        toast({
          title: '已取消收藏',
          description: '故事已从收藏夹移除'
        });
      } else {
        bookmarks.push(story._id);
        localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
        setIsBookmarked(true);
        toast({
          title: '收藏成功',
          description: '故事已添加到收藏夹'
        });
      }
    } catch (error) {
      console.error('收藏操作失败:', error);
      toast({
        title: '操作失败',
        description: '收藏操作失败，请重试',
        variant: 'destructive'
      });
    }
  }, [story, isBookmarked, toast]);

  // 分享功能
  const shareStory = useCallback(async () => {
    if (!story || story._id === 'preview') {
      toast({
        title: '预览模式',
        description: '预览模式下无法分享',
        variant: 'destructive'
      });
      return;
    }
    try {
      if (navigator.share) {
        await navigator.share({
          title: story.title || '红色故事',
          text: (story.content || '').substring(0, 100) + '...',
          url: window.location.href
        });
      } else {
        // 复制链接到剪贴板
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: '链接已复制',
          description: '故事链接已复制到剪贴板'
        });
      }
    } catch (err) {
      console.log('分享取消或失败:', err);
      if (err.name !== 'AbortError') {
        toast({
          title: '分享失败',
          description: '无法分享故事，请重试',
          variant: 'destructive'
        });
      }
    }
  }, [story, toast]);

  // 字体大小调整
  const changeFontSize = useCallback(size => {
    setFontSize(size);
    try {
      localStorage.setItem('detailFontSize', size);
      toast({
        title: '字体大小已调整',
        description: `已设置为${size === 'small' ? '小' : size === 'medium' ? '中' : '大'}字体`,
        duration: 2000
      });
    } catch (error) {
      console.warn('保存字体设置失败:', error);
    }
  }, [toast]);

  // 格式化函数
  const formatDate = useCallback(timestamp => {
    if (!timestamp) return '未知时间';
    try {
      return new Date(timestamp).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
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

  // 从URL参数获取故事ID
  const storyId = props.$w.page.dataset.params?.id;
  useEffect(() => {
    if (storyId) {
      loadStory(storyId);
      checkBookmarkStatus(storyId);

      // 加载保存的字体大小设置
      try {
        const savedFontSize = localStorage.getItem('detailFontSize') || 'medium';
        setFontSize(savedFontSize);
      } catch (error) {
        console.warn('加载字体设置失败:', error);
      }
    }
  }, [storyId, loadStory, checkBookmarkStatus]);
  useEffect(() => {
    // 监听滚动事件计算阅读进度
    const handleScroll = () => {
      try {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const progress = Math.min(Math.max(scrollTop / scrollHeight * 100, 0), 100);
        setReadingProgress(progress);
      } catch (error) {
        console.warn('计算阅读进度失败:', error);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 计算主内容区域的边距
  const getMainMargin = useCallback(() => {
    if (!sidebarState.isDesktop) return 'ml-0';
    return sidebarState.isCollapsed ? 'md:ml-16' : 'md:ml-64';
  }, [sidebarState]);

  // 处理后的内容
  const processedContent = story ? processContent(story.content) : '';

  // 错误状态组件
  const ErrorState = () => <div className="text-center py-16">
      <AlertCircle className="w-24 h-24 text-red-500 mx-auto mb-6" />
      <h2 className="text-2xl font-bold text-slate-400 mb-4">{error}</h2>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button onClick={() => loadStory(storyId)} disabled={loading} className="bg-red-500 hover:bg-red-600">
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
          重新加载
        </Button>
        <Button onClick={handleNavigateBack} disabled={navigating} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white">
          {navigating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ArrowLeft className="w-4 h-4 mr-2" />}
          返回上页
        </Button>
        <Button onClick={() => handleNavigate('index')} disabled={navigating} className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600">
          {navigating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Home className="w-4 h-4 mr-2" />}
          返回首页
        </Button>
      </div>
    </div>;
  if (loading) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <Sidebar currentPage="index" navigateTo={navigateTo} onStateChange={setSidebarState} />
        <main className={cn("transition-all duration-300 ease-in-out", getMainMargin())}>
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
        <Sidebar currentPage="index" navigateTo={navigateTo} onStateChange={setSidebarState} />
        <main className={cn("transition-all duration-300 ease-in-out", getMainMargin())}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <ErrorState />
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

      {/* 阅读完成提示 */}
      {showEndMessage && <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50 bg-green-600/90 backdrop-blur-sm text-white px-6 py-3 rounded-full shadow-lg transition-all duration-500 animate-bounce">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">阅读完成</span>
          </div>
        </div>}

      <Sidebar currentPage="index" navigateTo={navigateTo} onStateChange={setSidebarState} />

      {/* 主内容区域 - 响应式边距 */}
      <main className={cn("transition-all duration-300 ease-in-out", getMainMargin())}>
        {/* 移动端返回按钮 */}
        <div className="md:hidden sticky top-0 bg-slate-800/90 backdrop-blur-sm border-b border-slate-700 px-4 py-3 flex items-center justify-between z-40">
          <Button onClick={handleNavigateBack} disabled={navigating} variant="ghost" size="sm" className="text-slate-300 hover:text-white">
            {navigating ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowLeft className="w-4 h-4 mr-2" />}
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
              <img src={story.image} alt={story.title} className="w-full h-full object-cover" onError={e => {
            e.target.style.display = 'none';
          }} />
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
                <span>{story.views}次阅读</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
                {story.title}
              </h1>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-slate-400" />
                  <span className="text-slate-300">{story.author}</span>
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

        {/* 文章内容 - 优化显示效果 */}
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd} ref={gestureRef}>
          <div className={cn("prose prose-invert prose-lg max-w-none", fontSizeMap[fontSize].spacing)}>
            <div className={cn("text-slate-300 font-serif transition-all duration-300", fontSizeMap[fontSize].text, fontSizeMap[fontSize].leading, "text-justify",
          // 两端对齐
          "break-words",
          // 长单词换行
          "select-text" // 允许选择文本
          )}>
              {processedContent.split('\n\n').map((paragraph, index) => <p key={index} className="mb-6 indent-8 first:indent-0">
                  {paragraph.trim()}
                </p>)}
            </div>
          </div>

          {/* 文章结束标记 */}
          <div className="mt-16 mb-8 text-center">
            <div className="inline-flex items-center space-x-2 text-slate-500">
              <div className="w-8 h-px bg-slate-600"></div>
              <span className="text-sm">全文完</span>
              <div className="w-8 h-px bg-slate-600"></div>
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
                {story._id !== 'preview' && <Button onClick={() => handleNavigate('edit', {
                id: story._id
              })} variant="outline" className="border-orange-600 text-orange-400 hover:bg-orange-600/10">
                    <Edit3 className="w-4 h-4 mr-2" />
                    编辑
                  </Button>}
              </div>
              <div className="flex items-center space-x-2">
                <Button onClick={handleNavigateBack} disabled={navigating} variant="ghost" className="text-slate-400 hover:text-white">
                  {navigating ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowLeft className="w-4 h-4 mr-2" />}
                  返回列表
                </Button>
                <Button onClick={() => handleNavigate('index')} disabled={navigating} variant="ghost" className="text-slate-400 hover:text-white">
                  {navigating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Home className="w-4 h-4 mr-2" />}
                  首页
                </Button>
              </div>
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
          {story._id !== 'preview' && <Button onClick={() => handleNavigate('edit', {
          id: story._id
        })} size="icon" className="bg-orange-600 hover:bg-orange-700">
              <Edit3 className="w-4 h-4" />
            </Button>}
          <Button onClick={handleNavigateBack} size="icon" className="bg-slate-700 hover:bg-slate-600">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </div>
      </main>

      <MobileBottomNav currentPage="detail" navigateTo={navigateTo} />
    </div>;
}