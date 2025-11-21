// @ts-ignore;
import React, { useState, useEffect, useRef } from 'react';
// @ts-ignore;
import { ChevronLeft, ChevronRight } from 'lucide-react';
// @ts-ignore;
import { Button } from '@/components/ui';
// @ts-ignore;
import { cn } from '@/lib/utils';

// 故事轮播组件
export const StoryCarousel = ({
  stories = [],
  onNavigate,
  className
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const intervalRef = useRef(null);

  // 确保有故事数据
  const validStories = stories.filter(story => story && story.title);
  if (validStories.length === 0) {
    return null;
  }

  // 自动播放逻辑
  useEffect(() => {
    if (isAutoPlaying && validStories.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % validStories.length);
      }, 5000);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isAutoPlaying, validStories.length]);
  const handlePrevious = () => {
    setCurrentIndex(prev => (prev - 1 + validStories.length) % validStories.length);
    setIsAutoPlaying(false);
  };
  const handleNext = () => {
    setCurrentIndex(prev => (prev + 1) % validStories.length);
    setIsAutoPlaying(false);
  };
  const handleStoryClick = story => {
    if (onNavigate && story._id) {
      onNavigate({
        pageId: 'detail',
        params: {
          id: story._id
        }
      });
    }
  };
  const currentStory = validStories[currentIndex];
  if (!currentStory) return null;
  return <div className={cn("relative w-full overflow-hidden rounded-2xl", className)}>
      <div className="relative h-64 md:h-80 lg:h-96">
        {/* 背景图片 */}
        {currentStory.image && <div className="absolute inset-0">
            <img src={currentStory.image} alt={currentStory.title} className="w-full h-full object-cover" onError={e => {
          e.target.style.display = 'none';
        }} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
          </div>}

        {/* 内容区域 */}
        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
          <div className="max-w-2xl">
            <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2 line-clamp-2">
              {currentStory.title}
            </h3>
            <p className="text-slate-200 text-sm md:text-base mb-4 line-clamp-2">
              {currentStory.content || '暂无描述'}
            </p>
            <div className="flex items-center space-x-4 text-sm text-slate-300">
              <span>{currentStory.author || '佚名'}</span>
              <span>•</span>
              <span>{currentStory.views || 0} 次浏览</span>
            </div>
          </div>
        </div>

        {/* 导航按钮 */}
        {validStories.length > 1 && <>
            <Button variant="ghost" size="icon" className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white" onClick={handlePrevious}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white" onClick={handleNext}>
              <ChevronRight className="w-5 h-5" />
            </Button>
          </>}

        {/* 指示器 */}
        {validStories.length > 1 && <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
            {validStories.map((_, index) => <button key={index} className={cn("w-2 h-2 rounded-full transition-all duration-300", index === currentIndex ? "bg-white w-8" : "bg-white/50 hover:bg-white/70")} onClick={() => {
          setCurrentIndex(index);
          setIsAutoPlaying(false);
        }} />)}
          </div>}
      </div>

      {/* 缩略图导航 */}
      {validStories.length > 1 && <div className="flex space-x-2 mt-4 overflow-x-auto pb-2">
          {validStories.map((story, index) => <button key={story._id || index} className={cn("flex-shrink-0 w-20 h-12 rounded-lg overflow-hidden relative transition-all duration-300", index === currentIndex ? "ring-2 ring-red-500 scale-105" : "opacity-70 hover:opacity-100")} onClick={() => {
        setCurrentIndex(index);
        setIsAutoPlaying(false);
      }}>
              {story.image ? <img src={story.image} alt={story.title} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-slate-700 flex items-center justify-center">
                  <span className="text-xs text-white">{index + 1}</span>
                </div>}
            </button>)}
        </div>}
    </div>;
};

// 确保正确导出
export default StoryCarousel;