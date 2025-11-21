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
  const [fontSize, setFontSize] = useState(16);
  const [lineHeight, setLineHeight] = useState(1.8);
  const [readingProgress, setReadingProgress] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [sidebarState, setSidebarState] = useState({
    isCollapsed: false,
    isDesktop: true
  });
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

      // 标准化字段映射
      const normalizedStory = {
        id: storyData.story_id || storyData._id,
        title: storyData.title || '无标题',
        content: storyData.content || '',
        author: storyData.author || '佚名',
        publishedAt: storyData.updatedAt || storyData.createdAt || new Date(),
        views: 0,
        // 浏览量字段不存在，使用默认值
        imageUrl: storyData.image || '',
        tags: storyData.tags || [],
        location: storyData.location || '',
        date: storyData.date || '',
        readTime: storyData.read_time || ''
      };
      setStory(normalizedStory);
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
  useEffect(() => {
    loadStory();
  }, [loadStory]);

  // 字体大小调节
  useEffect(() => {
    setLineHeight(Math.max(1.4, fontSize / 10));
  }, [fontSize]);

  // 阅读进度计算
  useEffect(() => {
    if (!contentRef.current || !story) return;
    const handleScroll = () => {
      const content = contentRef.current;
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = content.scrollHeight - window.innerHeight;
      const progress = Math.min(scrollTop / scrollHeight * 100, 100);
      setReadingProgress(progress);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [story]);

  // 格式化日期
  const formatDate = date => {
    return new Date(date).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // 渲染故事内容
  const renderContent = content => {
    if (!content) return null;
    return content.split('\n').map((paragraph, index) => {
      if (paragraph.trim() === '') return <br key={index} />;

      // 处理图片标记 [img:url]
      if (paragraph.startsWith('[img:') && paragraph.endsWith(']')) {
        const imageUrl = paragraph.slice(5, -1);
        return <div key={index} className="my-6">
            <img src={imageUrl} alt="故事图片" className="w-full max-w-2xl mx-auto rounded-lg shadow-lg" onError={e => {
            e.target.style.display = 'none';
          }} />
          </div>;
      }

      // 处理标题标记
      if (paragraph.startsWith('# ')) {
        return <h1 key={index} className="text-2xl font-bold text-white my-6" style={{
          fontSize: `${fontSize + 8}px`,
          lineHeight
        }}>
            {paragraph.slice(2)}
          </h1>;
      }
      if (paragraph.startsWith('## ')) {
        return <h2 key={index} className="text-xl font-semibold text-white my-4" style={{
          fontSize: `${fontSize + 4}px`,
          lineHeight
        }}>
            {paragraph.slice(3)}
          </h2>;
      }

      // 普通段落
      return <p key={index} className="mb-4 text-slate-300 leading-relaxed" style={{
        fontSize: `${fontSize}px`,
        lineHeight,
        textIndent: '2em'
      }}>
          {paragraph}
        </p>;
    });
  };
  if (loading) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <LoadingSkeleton type="detail" />
        </div>
      </div>;
  }
  if (error) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">故事加载失败</h1>
          <p className="text-slate-400 mb-4">{error}</p>
          <Button onClick={() => navigateTo({
          pageId: 'index'
        })} className="bg-red-500 hover:bg-red-600">
            返回首页
          </Button>
        </div>
      </div>;
  }
  if (!story) {
    return null;
  }
  return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Sidebar currentPage="detail" navigateTo={navigateTo} onStateChange={setSidebarState} />
      
      {/* 阅读进度条 */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-slate-800 z-50">
        <div className="h-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-300" style={{
        width: `${readingProgress}%`
      }} />
      </div>

      {/* 主内容区域 */}
      <main className={cn("transition-all duration-300 ease-in-out", sidebarState.isDesktop ? sidebarState.isCollapsed ? "md:ml-16" : "md:ml-64" : "ml-0")}>
        {/* 顶部导航 */}
        <header className="sticky top-1 z-40 bg-slate-900/90 backdrop-blur-sm border-b border-slate-700/50">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Button onClick={navigateBack} variant="ghost" className="text-slate-400 hover:text-white flex items-center space-x-2">
                <ArrowLeft className="w-5 h-5" />
                <span>返回</span>
              </Button>
              
              <div className="flex items-center space-x-2">
                <Button onClick={() => setFontSize(Math.max(12, fontSize - 2))} variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <span className="text-sm text-slate-400 w-8 text-center">{fontSize}px</span>
                <Button onClick={() => setFontSize(Math.min(24, fontSize + 2))} variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                  <ZoomIn className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* 故事内容 */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          <article ref={contentRef} className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-slate-700/50">
            {/* 故事标题 */}
            <h1 className="text-4xl font-bold text-white mb-4" style={{
            fontSize: `${fontSize + 12}px`,
            lineHeight
          }}>
              {story.title}
            </h1>

            {/* 故事信息 */}
            <div className="flex items-center space-x-6 text-sm text-slate-400 mb-8 pb-8 border-b border-slate-700/50">
              <span className="flex items-center">
                <User className="w-4 h-4 mr-2" />
                {story.author}
              </span>
              <span className="flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                {formatDate(story.publishedAt)}
              </span>
              <span className="flex items-center">
                <Eye className="w-4 h-4 mr-2" />
                {story.views}次阅读
              </span>
              {story.category && <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-xs">
                  {story.category}
                </span>}
            </div>

            {/* 故事正文 */}
            <div className="prose prose-invert max-w-none">
              {renderContent(story.content)}
            </div>

            {/* 标签 */}
            {story.tags && story.tags.length > 0 && <div className="mt-8 pt-8 border-t border-slate-700/50">
                <div className="flex flex-wrap gap-2">
                  {story.tags.map((tag, index) => <span key={index} className="px-3 py-1 bg-slate-700/50 text-slate-300 rounded-full text-sm">
                      #{tag}
                    </span>)}
                </div>
              </div>}
          </article>

          {/* 底部操作栏 */}
          <div className="mt-8 flex items-center justify-between">
            <Button onClick={() => navigateTo({
            pageId: 'index'
          })} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
              <Home className="w-4 h-4 mr-2" />
              返回首页
            </Button>
            
            <div className="flex items-center space-x-4">
              <Button onClick={() => setIsLiked(!isLiked)} variant="outline" className={cn("border-slate-600", isLiked ? "bg-red-500/20 border-red-500 text-red-400" : "text-slate-300 hover:bg-slate-700")}>
                <Heart className={cn("w-4 h-4 mr-2", isLiked && "fill-current")} />
                {isLiked ? '已收藏' : '收藏'}
              </Button>
              
              <Button onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: story.title,
                  text: story.content.substring(0, 100) + '...',
                  url: window.location.href
                });
              } else {
                toast({
                  title: '分享功能',
                  description: '已复制链接到剪贴板'
                });
              }
            }} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                <Share2 className="w-4 h-4 mr-2" />
                分享
              </Button>
            </div>
          </div>
        </div>
      </main>

      <MobileBottomNav currentPage="detail" navigateTo={navigateTo} />
    </div>;
}