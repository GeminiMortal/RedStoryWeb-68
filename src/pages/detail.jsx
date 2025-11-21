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
    showHint: false,
    velocity: 0,
    opacity: 1
  });
  const {
    toast
  } = useToast();
  const contentRef = useRef(null);
  const {
    isOpen
  } = useSidebar();
  const navigateTo = $w.utils.navigateTo;

  // 安全获取故事ID - 修复 dataset 读取错误
  const storyId = props.page?.dataset?.params?.id || '1';

  // 添加缺失的辅助函数
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

  // 从 localStorage 加载字体设置
  useEffect(() => {
    const savedSettings = localStorage.getItem('fontSettings');
    if (savedSettings) {
      try {
        setFontSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('加载字体设置失败:', error);
      }
    }
  }, []);

  // 保存字体设置到 localStorage
  useEffect(() => {
    localStorage.setItem('fontSettings', JSON.stringify(fontSettings));
  }, [fontSettings]);

  // 模拟获取故事数据
  useEffect(() => {
    const fetchStory = async () => {
      try {
        setLoading(true);
        const tcb = await $w.cloud.getCloudInstance();
        const db = tcb.database();

        // 获取故事详情
        const result = await db.collection('red_story').doc(storyId).get();
        if (result && result.data) {
          setStory(result.data);
        } else {
          // 使用模拟数据
          const mockStory = {
            _id: storyId,
            title: "赛博朋克2077：夜之城的觉醒",
            author: "银翼杀手",
            content: `# 第一章：觉醒\n\n在霓虹闪烁的夜之城，**霓虹灯**像毒蛇的眼睛一样注视着每一个过客。\n\n> "这座城市会吃掉你的灵魂，然后吐出你的空壳。"\n\n## 主角介绍\n\n*V*，一个来自荒坂塔的逃亡者，现在正躲在沃森区的某个破旧公寓里。\n\n### 关键物品\n\n- **生物芯片**：包含强尼·银手的数字灵魂\n- **螳螂刀**：荒坂公司最新研发的近战武器\n- **网络接入仓**：连接赛博空间的必备设备\n\n\`\`\`javascript\n// 主角的初始状态\nconst v = {\n  name: "V",\n  streetCred: 0,\n  eddies: 1000,\n  cyberware: ["Kiroshi Optics", "Subdermal Armor"]\n};\n\`\`\`\n\n## 故事开始\n\n夜已深，但夜之城从不睡觉。V站在公寓的窗前，看着外面**永不停息**的车流和全息广告。\n\n> 这是一个关于生存、背叛和救赎的故事。\n\n*你准备好进入夜之城了吗？*\n\n## 第二章：任务\n\nV接到了第一个任务：从**军用科技**的实验室里偷取一份机密文件。\n\n### 任务目标\n\n1. 潜入军用科技大楼\n2. 找到实验室\n3. 下载机密文件\n4. 安全撤离\n\n**注意**：这个任务有多个完成方式，你可以选择：\n\n- **潜行**：使用隐身和黑客技术\n- **战斗**：正面硬刚\n- **谈判**：用口才说服守卫\n\n\`\`\`python\n# 任务状态\nmission_status = {\n    "stealth": True,\n    "combat": False,\n    "negotiation": False\n}\n\`\`\`\n\n## 结局\n\n每个选择都会影响故事的走向。在夜之城，没有绝对的对错，只有生存和死亡。\n\n> "欢迎来到夜之城，别死得太快。"`,
            category: "科幻",
            readTime: 15,
            views: 1234,
            createdAt: "2024-11-21",
            tags: ["赛博朋克", "科幻", "冒险"]
          };
          setStory(mockStory);
        }
      } catch (err) {
        setError(err.message);
        toast({
          title: "加载失败",
          description: "无法加载故事内容",
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
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = Math.min(scrollTop / docHeight * 100, 100);
      setReadingProgress(progress);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 手势处理
  useEffect(() => {
    const handleTouchStart = e => {
      const touch = e.touches[0];
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
      const touch = e.touches[0];
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
    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove, {
      passive: false
    });
    document.addEventListener('touchend', handleTouchEnd);
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
      description: isBookmarked ? "已从收藏夹移除" : "已添加到收藏夹"
    });
  };
  const handleShare = async () => {
    if (navigator.share && story) {
      try {
        await navigator.share({
          title: story.title,
          text: story.title,
          url: window.location.href
        });
      } catch (err) {
        toast({
          title: "分享失败",
          description: "无法分享此内容",
          variant: "destructive"
        });
      }
    } else {
      // 复制链接
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "链接已复制",
        description: "故事链接已复制到剪贴板"
      });
    }
  };
  if (loading) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-pulse">
          <BookOpen className="w-12 h-12 text-red-500 animate-bounce" />
          <p className="text-slate-400 mt-4">加载中...</p>
        </div>
      </div>;
  }
  if (error) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-xl mb-4">加载失败</p>
          <Button onClick={() => navigateTo({
          pageId: 'index',
          params: {}
        })} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回
          </Button>
        </div>
      </div>;
  }
  if (!story) return null;
  return <div className="min-h-screen bg-slate-900">
      <ReadingProgress progress={readingProgress} />
      
      {/* 侧边栏 */}
      <Sidebar />
      
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
                  {story.title}
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
                {story.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-1" />
                  {story.author}
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {formatDate(story.createdAt)}
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {story.readTime || formatReadTime(story.content)}分钟阅读
                </div>
                <div className="flex items-center">
                  <Eye className="w-4 h-4 mr-1" />
                  {story.views || 0}次浏览
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                {(story.tags || []).map(tag => <Badge key={tag} variant="secondary" className="bg-slate-700">
                    {tag}
                  </Badge>)}
              </div>
            </div>

            {/* 故事内容 */}
            <FadeIn delay={200}>
              <div ref={contentRef} className="bg-slate-800 rounded-lg p-6">
                <ContentRenderer content={story.content} fontSettings={fontSettings} />
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