// @ts-ignore;
import React, { useState, useEffect, useRef } from 'react';
// @ts-ignore;
import { Button, Badge, useToast } from '@/components/ui';
// @ts-ignore;
import { ArrowLeft, Clock, User, Calendar, Eye, Share2, Bookmark, BookOpen } from 'lucide-react';
// @ts-ignore;
import { cn } from '@/lib/utils';

// @ts-ignore;
import { Sidebar } from '@/components/Sidebar';
// @ts-ignore;
import { MobileBottomNav } from '@/components/MobileBottomNav';
// @ts-ignore;
import { useSidebar } from '@/components/SidebarStore';
// @ts-ignore;
import { FadeIn } from '@/components/AnimationProvider';
// @ts-ignore;
import { ContentRenderer } from '@/components/ContentRenderer';
// @ts-ignore;
import { ReadingProgress } from '@/components/ReadingProgress';
// @ts-ignore;
import { FontSettings } from '@/components/FontSettings';
export default function DetailPage(props) {
  const {
    $w
  } = props || {};
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
    showHint: false,
    opacity: 1
  });
  const {
    toast
  } = useToast();
  const contentRef = useRef(null);
  const {
    isOpen
  } = useSidebar() || {};
  const navigateTo = $w?.utils?.navigateTo || (() => {});

  // 安全获取故事ID
  const storyId = props?.page?.dataset?.params?.id || '1';

  // 从 localStorage 加载字体设置
  useEffect(() => {
    try {
      const savedSettings = localStorage?.getItem?.('fontSettings');
      if (savedSettings) {
        setFontSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('加载字体设置失败:', error);
    }
  }, []);

  // 保存字体设置到 localStorage
  useEffect(() => {
    try {
      localStorage?.setItem?.('fontSettings', JSON.stringify(fontSettings));
    } catch (error) {
      console.error('保存字体设置失败:', error);
    }
  }, [fontSettings]);

  // 获取故事数据
  useEffect(() => {
    const fetchStory = async () => {
      if (!storyId) {
        setError('无效的故事ID');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const tcb = await $w?.cloud?.getCloudInstance?.();
        if (!tcb) {
          throw new Error('云开发服务不可用');
        }
        const db = tcb.database();

        // 获取故事详情
        const result = await db.collection('red_story').doc(storyId).get();
        if (result?.data) {
          setStory(result.data);

          // 更新浏览量
          try {
            await db.collection('red_story').doc(storyId).update({
              views: (result.data.views || 0) + 1
            });
          } catch (updateError) {
            console.error('更新浏览量失败:', updateError);
          }
        } else {
          // 使用模拟数据
          const mockStory = {
            _id: storyId,
            title: "井冈山革命根据地的建立",
            author: "党史研究专家",
            content: `# 井冈山革命根据地的建立\n\n## 历史背景\n\n1927年，大革命失败后，中国共产党开始独立领导武装斗争。毛泽东同志率领秋收起义部队向井冈山进军，开创了中国革命的新道路。\n\n## 重要事件\n\n### 三湾改编\n1927年9月29日，起义部队到达江西永新县三湾村，毛泽东主持了著名的"三湾改编"，确立了党对军队的绝对领导。\n\n### 井冈山会师\n1928年4月，朱德、陈毅率领南昌起义保存下来的部队和湘南起义农军到达井冈山，与毛泽东领导的部队胜利会师。\n\n## 历史意义\n\n井冈山革命根据地的建立，开创了农村包围城市、武装夺取政权的革命道路，为中国革命的胜利奠定了基础。\n\n> "星星之火，可以燎原。" —— 毛泽东`,
            category: "革命历史",
            readTime: 8,
            views: 1567,
            createdAt: Date.now() - 86400000 * 7,
            tags: ["井冈山", "革命根据地", "党史"]
          };
          setStory(mockStory);
        }
      } catch (err) {
        console.error('加载故事失败:', err);
        setError(err.message || '加载失败');
        toast({
          title: "加载失败",
          description: err.message || "无法加载故事内容",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    fetchStory();
  }, [storyId, toast]);

  // 监听滚动更新阅读进度
  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return;
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = Math.max(document.body.scrollHeight, document.body.offsetHeight, document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight) - window.innerHeight;
      const progress = docHeight > 0 ? Math.min(scrollTop / docHeight * 100, 100) : 0;
      setReadingProgress(progress);
    };
    window.addEventListener('scroll', handleScroll, {
      passive: true
    });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 手势处理
  useEffect(() => {
    const handleTouchStart = e => {
      const touch = e.touches?.[0];
      if (!touch) return;
      setGestureState(prev => ({
        ...prev,
        startX: touch.clientX,
        startY: touch.clientY,
        isSwiping: false,
        isAnimating: false
      }));
    };
    const handleTouchMove = e => {
      if (gestureState.isAnimating) return;
      const touch = e.touches?.[0];
      if (!touch) return;
      const deltaX = touch.clientX - gestureState.startX;
      const deltaY = touch.clientY - gestureState.startY;

      // 检查是否为水平滑动
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
        e.preventDefault();
        const translateX = Math.max(-100, Math.min(100, deltaX));
        const opacity = Math.max(0.3, 1 - Math.abs(deltaX) / 500);
        setGestureState(prev => ({
          ...prev,
          currentX: touch.clientX,
          currentY: touch.clientY,
          translateX,
          opacity,
          isSwiping: true,
          showHint: Math.abs(deltaX) > 100
        }));
      }
    };
    const handleTouchEnd = () => {
      if (!gestureState.isSwiping || gestureState.isAnimating) return;
      setGestureState(prev => ({
        ...prev,
        isAnimating: true
      }));
      if (Math.abs(gestureState.translateX) > 150) {
        // 触发返回
        navigateTo({
          pageId: 'index',
          params: {}
        });
      } else {
        // 重置位置
        setGestureState(prev => ({
          ...prev,
          translateX: 0,
          opacity: 1,
          isSwiping: false,
          showHint: false,
          isAnimating: false
        }));
      }
    };
    document.addEventListener('touchstart', handleTouchStart, {
      passive: true
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
  }, [gestureState, navigateTo]);
  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast({
      title: isBookmarked ? "已取消收藏" : "已收藏",
      description: isBookmarked ? "已从收藏夹移除" : "已添加到收藏夹",
      variant: "default"
    });
  };
  const handleShare = async () => {
    if (!story) return;
    const shareData = {
      title: story.title || '红色故事',
      text: story.title || '红色故事',
      url: window.location.href
    };
    if (navigator.share && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if (err.name !== 'AbortError') {
          toast({
            title: "分享失败",
            description: "无法分享此内容",
            variant: "destructive"
          });
        }
      }
    } else {
      // 复制链接
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "链接已复制",
          description: "故事链接已复制到剪贴板",
          variant: "default"
        });
      } catch (err) {
        toast({
          title: "复制失败",
          description: "无法复制链接",
          variant: "destructive"
        });
      }
    }
  };
  const formatDate = timestamp => {
    if (!timestamp) return '未知时间';
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return '未知时间';
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return '未知时间';
    }
  };
  const formatReadTime = content => {
    if (!content) return '5分钟阅读';
    const wordCount = content?.length || 0;
    const readTime = Math.max(1, Math.ceil(wordCount / 500));
    return `${readTime}分钟阅读`;
  };
  if (loading) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-pulse text-center">
          <BookOpen className="w-12 h-12 text-red-500 animate-bounce mx-auto" />
          <p className="text-slate-400 mt-4">加载中...</p>
        </div>
      </div>;
  }
  if (error) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-xl mb-4">加载失败</p>
          <p className="text-slate-400 mb-4">{error}</p>
          <Button onClick={() => navigateTo({
          pageId: 'index',
          params: {}
        })} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回首页
          </Button>
        </div>
      </div>;
  }
  if (!story) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400 text-xl mb-4">故事不存在</p>
          <Button onClick={() => navigateTo({
          pageId: 'index',
          params: {}
        })} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回首页
          </Button>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-slate-900">
      <ReadingProgress progress={readingProgress} />
      
      {/* 侧边栏 */}
      <Sidebar currentPage="detail" navigateTo={navigateTo} />
      
      {/* 主内容区 */}
      <div className={cn("transition-all duration-300", isOpen ? "lg:ml-64" : "lg:ml-0")} style={{
      transform: `translateX(${gestureState.translateX}px)`,
      opacity: gestureState.opacity,
      transition: gestureState.isAnimating ? 'transform 0.3s ease-out, opacity 0.3s ease-out' : 'none'
    }}>
        {/* 顶部导航 */}
        <div className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => navigateTo({
              pageId: 'index',
              params: {}
            })} className="hover:bg-slate-800">
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-white truncate max-w-xs">
                  {story.title || '故事详情'}
                </h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <FontSettings fontSettings={fontSettings} onSettingsChange={setFontSettings} />
              <Button variant="ghost" size="sm" onClick={handleBookmark} className={cn("hover:bg-slate-800", isBookmarked && "text-red-500")}>
                <Bookmark className={cn("w-4 h-4", isBookmarked && "fill-current")} />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleShare} className="hover:bg-slate-800">
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* 故事信息卡片 */}
        <FadeIn>
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="bg-slate-800 rounded-lg p-6 mb-8">
              <h1 className="text-3xl font-bold text-white mb-4">
                {story.title || '无标题'}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-1" />
                  {story.author || '佚名'}
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {formatDate(story.createdAt)}
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {formatReadTime(story.content)}
                </div>
                <div className="flex items-center">
                  <Eye className="w-4 h-4 mr-1" />
                  {story.views || 0}次浏览
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                {(story.tags || []).map((tag, index) => <Badge key={index} variant="secondary" className="bg-slate-700">
                    {tag}
                  </Badge>)}
              </div>
            </div>

            {/* 故事内容 */}
            <FadeIn delay={200}>
              <div ref={contentRef} className="bg-slate-800 rounded-lg p-6">
                <ContentRenderer content={story.content || '暂无内容'} fontSettings={fontSettings} />
              </div>
            </FadeIn>

            {/* 手势提示 */}
            {gestureState.showHint && <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-slate-700 text-white px-4 py-2 rounded-lg shadow-lg z-50">
                滑动返回
              </div>}
          </div>
        </FadeIn>
      </div>

      <MobileBottomNav currentPage="detail" navigateTo={navigateTo} />
    </div>;
}