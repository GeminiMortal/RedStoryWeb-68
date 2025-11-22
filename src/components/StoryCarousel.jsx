// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button } from '@/components/ui';
// @ts-ignore;
import { ChevronLeft, ChevronRight, Eye, Heart, Clock, User } from 'lucide-react';
// @ts-ignore;
import { cn } from '@/lib/utils';

export function StoryCarousel({
  stories,
  onNavigate,
  className
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [navigating, setNavigating] = useState(false);

  // 自动播放
  useEffect(() => {
    if (!isAutoPlaying || stories.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % stories.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, stories.length]);

  // 手动切换
  const goToPrevious = () => {
    setCurrentIndex(prev => (prev - 1 + stories.length) % stories.length);
    setIsAutoPlaying(false);
  };
  const goToNext = () => {
    setCurrentIndex(prev => (prev + 1) % stories.length);
    setIsAutoPlaying(false);
  };
  const goToSlide = index => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  // 优化的导航函数
  const handleNavigate = async (pageId, params = {}) => {
    if (navigating) return;
    try {
      setNavigating(true);
      // 添加短暂延迟以提供视觉反馈
      await new Promise(resolve => setTimeout(resolve, 100));
      onNavigate(pageId, params);
    } catch (error) {
      console.error('导航失败:', error);
    } finally {
      setNavigating(false);
    }
  };

  // 格式化日期
  const formatDate = timestamp => {
    if (!timestamp) return '未知时间';
    return new Date(timestamp).toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric'
    });
  };
  if (!stories || stories.length === 0) {
    return null;
  }
  const currentStory = stories[currentIndex];
  return <div className={cn("relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", className)}>
      {/* 轮播容器 */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 shadow-2xl">
        {/* 主要内容区域 */}
        <div className="relative h-96 md:h-[500px]">
          {/* 背景图片 */}
          {currentStory.image && <div className="absolute inset-0">
              <img src={currentStory.image} alt={currentStory.title} className="w-full h-full object-cover" onError={e => {
            e.target.style.display = 'none';
          }} />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent"></div>
            </div>}

          {/* 内容覆盖层 */}
          <div className="absolute inset-0 flex items-center">
            <div className="max-w-2xl mx-auto px-6 md:px-12 text-white">
              {/* 标题 */}
              <h2 className="text-2xl md:text-4xl font-bold mb-4 line-clamp-2 animate-fade-in">
                {currentStory.title || '无标题'}
              </h2>

              {/* 描述 */}
              <p className="text-slate-200 text-sm md:text-base mb-6 line-clamp-3 animate-fade-in" style={{
              animationDelay: '0.2s'
            }}>
                {currentStory.content || '暂无内容'}
              </p>

              {/* 元信息 */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-300 mb-6 animate-fade-in" style={{
              animationDelay: '0.4s'
            }}>
                <span className="flex items-center bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full">
                  <User className="w-4 h-4 mr-2" />
                  {currentStory.author || '佚名'}
                </span>
                <span className="flex items-center bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full">
                  <Clock className="w-4 h-4 mr-2" />
                  {formatDate(currentStory.createdAt)}
                </span>
                <span className="flex items-center bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full">
                  <Eye className="w-4 h-4 mr-2" />
                  {currentStory.views || 0}
                </span>
                <span className="flex items-center bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full">
                  <Heart className="w-4 h-4 mr-2" />
                  {currentStory.likes || 0}
                </span>
              </div>

              {/* 操作按钮 */}
              <div className="flex gap-3 animate-fade-in" style={{
              animationDelay: '0.6s'
            }}>
                <Button onClick={() => handleNavigate('detail', {
                id: currentStory._id
              })} disabled={navigating} className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white shadow-lg hover:shadow-red-500/25 transition-all duration-300 transform hover:scale-105 button-press">
                  <Eye className="w-4 h-4 mr-2" />
                  阅读故事
                </Button>
              </div>
            </div>
          </div>

          {/* 导航按钮 */}
          {stories.length > 1 && <>
              <button onClick={goToPrevious} className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-110 button-press">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={goToNext} className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-110 button-press">
                <ChevronRight className="w-5 h-5" />
              </button>
            </>}
        </div>

        {/* 指示器 */}
        {stories.length > 1 && <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {stories.map((_, index) => <button key={index} onClick={() => goToSlide(index)} className={cn("w-3 h-3 rounded-full transition-all duration-300", index === currentIndex ? "bg-white shadow-lg scale-110" : "bg-white/50 hover:bg-white/70")} />)}
          </div>}
      </div>

      {/* 缩略图列表 */}
      {stories.length > 1 && <div className="mt-6 flex space-x-4 overflow-x-auto pb-2 custom-scrollbar">
          {stories.map((story, index) => <button key={story._id} onClick={() => goToSlide(index)} className={cn("flex-shrink-0 w-24 h-16 rounded-lg overflow-hidden border-2 transition-all duration-300 hover:scale-105 button-press", index === currentIndex ? "border-red-500 shadow-lg shadow-red-500/25" : "border-slate-600 hover:border-slate-500")}>
              {story.image ? <img src={story.image} alt={story.title} className="w-full h-full object-cover" onError={e => {
          e.target.style.display = 'none';
        }} /> : <div className="w-full h-full bg-slate-700 flex items-center justify-center">
                  <span className="text-slate-400 text-xs">无图</span>
                </div>}
            </button>)}
        </div>}
    </div>;
}