// @ts-ignore;
import React, { useState, useEffect, useCallback, useRef } from 'react';
// @ts-ignore;
import { Button, Card, CardContent, useToast } from '@/components/ui';
// @ts-ignore;
import { ArrowLeft, Share2, Heart, Eye, Clock, User, ZoomIn, ZoomOut, Home, Settings } from 'lucide-react';
// @ts-ignore;
import { cn } from '@/lib/utils';

// @ts-ignore;
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
// @ts-ignore;
import { ErrorState } from '@/components/ErrorState';
export default function DetailPage(props) {
  const {
    $w
  } = props;
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fontSize, setFontSize] = useState(16); // 默认中号字体
  const [lineHeight, setLineHeight] = useState(1.8);
  const [showGestureHint, setShowGestureHint] = useState(false);
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);
  const [readingProgress, setReadingProgress] = useState(0);
  const contentRef = useRef(null);
  const {
    toast
  } = useToast();
  const storyId = props.$w.page.dataset.params?.id;
  const navigateTo = $w.utils.navigateTo;
  const navigateBack = $w.utils.navigateBack;

  // 字体大小配置
  const fontSizes = {
    small: {
      fontSize: 14,
      lineHeight: 1.6,
      name: '小'
    },
    medium: {
      fontSize: 16,
      lineHeight: 1.8,
      name: '中'
    },
    large: {
      fontSize: 18,
      lineHeight: 2.0,
      name: '大'
    }
  };

  // 当前字体大小状态
  const [currentFontSize, setCurrentFontSize] = useState('medium');

  // 统一的数据模型调用
  const loadStory = useCallback(async () => {
    if (!storyId) {
      setError('故事ID无效');
      toast({
        title: '错误',
        description: '故事ID无效',
        variant: 'destructive'
      });
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();

      // 获取故事详情
      const result = await db.collection('red_story').doc(storyId).get();
      const storyData = result.data;
      if (!storyData) {
        setError('故事不存在');
        toast({
          title: '故事不存在',
          description: '该故事可能已被删除',
          variant: 'destructive'
        });
        return;
      }

      // 标准化字段
      const normalizedStory = {
        ...storyData,
        id: storyId,
        title: storyData.title || '无标题',
        content: storyData.content || '',
        author: storyData.author || '佚名',
        publishedAt: storyData.publishedAt || storyData.createdAt || new Date(),
        views: (storyData.views || 0) + 1,
        imageUrl: storyData.imageUrl || '',
        tags: storyData.tags || []
      };
      setStory(normalizedStory);

      // 更新浏览量
      await db.collection('red_story').doc(storyId).update({
        views: normalizedStory.views
      });
    } catch (error) {
      console.error('加载故事失败:', error);
      setError(error.message || '无法加载故事内容');
      toast({
        title: '加载失败',
        description: error.message || '无法加载故事内容',
        variant: 'destructive',
        action: {
          label: '返回首页',
          onClick: () => navigateTo({
            pageId: 'index'
          })
        }
      });
    } finally {
      setLoading(false);
    }
  }, [storyId, toast, navigateTo]);

  // 加载故事
  useEffect(() => {
    loadStory();
  }, [loadStory]);

  // 字体大小调节
  const handleFontSizeChange = sizeKey => {
    setCurrentFontSize(sizeKey);
    const newSize = fontSizes[sizeKey];
    setFontSize(newSize.fontSize);
    setLineHeight(newSize.lineHeight);
  };

  // 手势返回功能
  const handleTouchStart = useCallback(e => {
    setTouchStartX(e.touches[0].clientX);
  }, []);
  const handleTouchMove = useCallback(e => {
    setTouchEndX(e.touches[0].clientX);
  }, []);
  const handleTouchEnd = useCallback(() => {
    const swipeDistance = touchEndX - touchStartX;
    if (swipeDistance < -100) {
      // 左滑超过100px
      setShowGestureHint(true);
      setTimeout(() => {
        navigateBack();
      }, 300);
    }
  }, [touchStartX, touchEndX, navigateBack]);

  // 显示手势提示
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowGestureHint(true);
      const hideTimer = setTimeout(() => {
        setShowGestureHint(false);
      }, 3000);
      return () => clearTimeout(hideTimer);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // 滚动进度计算
  useEffect(() => {
    const handleScroll = () => {
      if (contentRef.current) {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = Math.min(scrollTop / docHeight * 100, 100);
        setReadingProgress(progress);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 渲染富文本内容
  const renderContent = content => {
    if (!content) return null;
    return content.split('\n').map((paragraph, index) => {
      const trimmed = paragraph.trim();
      if (trimmed === '') {
        return <br key={index} />;
      }

      // 处理图片标记 [img:url]
      if (trimmed.startsWith('[img:') && trimmed.endsWith(']')) {
        const imageUrl = trimmed.slice(5, -1);
        return <div key={index} className="my-6">
            <img src={imageUrl} alt="故事图片" className="w-full max-w-2xl mx-auto rounded-lg shadow-lg" onError={e => {
            e.target.style.display = 'none';
          }} />
          </div>;
      }

      // 处理标题标记
      if (trimmed.startsWith('# ')) {
        return <h1 key={index} className="text-2xl font-bold text-white my-6" style={{
          fontSize: `${fontSize + 8}px`,
          lineHeight
        }}>
            {trimmed.slice(2)}
          </h1>;
      }
      if (trimmed.startsWith('## ')) {
        return <h2 key={index} className="text-xl font-semibold text-white my-5" style={{
          fontSize: `${fontSize + 4}px`,
          lineHeight
        }}>
            {trimmed.slice(3)}
          </h2>;
      }
      if (trimmed.startsWith('### ')) {
        return <h3 key={index} className="text-lg font-medium text-white my-4" style={{
          fontSize: `${fontSize + 2}px`,
          lineHeight
        }}>
            {trimmed.slice(4)}
          </h3>;
      }

      // 处理引用
      if (trimmed.startsWith('> ')) {
        return <blockquote key={index} className="border-l-4 border-red-500 pl-6 my-6 italic text-slate-400" style={{
          fontSize: `${fontSize}px`,
          lineHeight
        }}>
            {trimmed.slice(2)}
          </blockquote>;
      }

      // 普通段落
      return <p key={index} className="mb-4 text-slate-300 leading-relaxed" style={{
        fontSize: `${fontSize}px`,
        lineHeight,
        textIndent: '2em'
      }}>
          {trimmed}
        </p>;
    });
  };

  // 格式化日期
  const formatDate = date => {
    if (!date) return '未知时间';
    try {
      return new Date(date).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return '日期格式错误';
    }
  };

  // 加载状态
  if (loading) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <LoadingSkeleton type="detail" />
        </div>
      </div>;
  }

  // 错误状态
  if (error) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <ErrorState message={error} onRetry={loadStory} onBack={() => navigateTo({
          pageId: 'index'
        })} />
        </div>
      </div>;
  }
  if (!story) {
    return null;
  }
  return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
      {/* 阅读进度条 */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-slate-700 z-50">
        <div className="h-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-300" style={{
        width: `${readingProgress}%`
      }} />
      </div>

      {/* 顶部固定导航栏 */}
      <nav className="fixed top-0 left-0 right-0 bg-slate-900/90 backdrop-blur-sm border-b border-slate-700 z-40">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Button onClick={navigateBack} variant="ghost" className="text-slate-300 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5 mr-2" />
            返回
          </Button>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-slate-400 hidden sm:inline">字体大小</span>
            <div className="flex space-x-1 bg-slate-800 rounded-lg p-1">
              {Object.entries(fontSizes).map(([key, config]) => <button key={key} onClick={() => handleFontSizeChange(key)} className={cn("px-3 py-1 text-xs rounded transition-colors", currentFontSize === key ? "bg-red-500 text-white" : "text-slate-400 hover:bg-slate-700")}>
                  {config.name}
                </button>)}
            </div>
          </div>
        </div>
      </nav>

      {/* 内容区域 */}
      <main className="pt-16 pb-20" ref={contentRef}>
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* 文章标题 */}
          <h1 className="text-3xl font-bold text-white mb-4" style={{
          fontSize: `${fontSize + 12}px`,
          lineHeight
        }}>
            {story.title}
          </h1>
          
          {/* 文章信息 */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400 mb-8">
            <span className="flex items-center">
              <User className="w-4 h-4 mr-1" />
              {story.author}
            </span>
            <span className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              {formatDate(story.publishedAt)}
            </span>
            <span className="flex items-center">
              <Eye className="w-4 h-4 mr-1" />
              {story.views}次阅读
            </span>
            {story.tags && story.tags.length > 0 && <div className="flex gap-2">
                {story.tags.map((tag, index) => <span key={index} className="px-2 py-1 bg-slate-700 text-xs rounded-full text-slate-300">
                    {tag}
                  </span>)}
              </div>}
          </div>

          {/* 封面图片 */}
          {story.imageUrl && <div className="mb-8">
              <img src={story.imageUrl} alt={story.title} className="w-full max-w-2xl mx-auto rounded-lg shadow-xl" onError={e => {
            e.target.style.display = 'none';
          }} />
            </div>}

          {/* 正文内容 */}
          <article className="reading-content">
            {renderContent(story.content)}
          </article>

          {/* 底部操作栏 */}
          <div className="flex items-center justify-between mt-12 pt-8 border-t border-slate-700">
            <Button onClick={() => navigateTo({
            pageId: 'index'
          })} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
              <Home className="w-4 h-4 mr-2" />
              返回首页
            </Button>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                <Heart className="w-4 h-4 mr-2" />
                收藏
              </Button>
              <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                <Share2 className="w-4 h-4 mr-2" />
                分享
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* 底部手势提示 */}
      <div className={cn("fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-slate-800/90 backdrop-blur-sm rounded-full px-4 py-2 text-sm text-slate-300 transition-all duration-300", showGestureHint ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4")}>
        <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
        </svg>
        左滑返回上一页
      </div>
    </div>;
}