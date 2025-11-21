// @ts-ignore;
import React, { useState, useEffect } from 'react';
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

  // 确保有故事数据
  const validStories = stories.filter(story => story && story.title);
  if (validStories.length === 0) {
    return null;
  }
  const nextSlide = () => {
    setCurrentIndex(prev => (prev + 1) % validStories.length);
  };
  const prevSlide = () => {
    setCurrentIndex(prev => (prev - 1 + validStories.length) % validStories.length);
  };
  const goToSlide = index => {
    setCurrentIndex(index);
  };

  // 自动播放
  useEffect(() => {
    if (!isAutoPlaying || validStories.length <= 1) return;
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [currentIndex, isAutoPlaying, validStories.length]);
  const currentStory = validStories[currentIndex];
  if (!currentStory) return null;
  return <div className={cn("relative w-full overflow-hidden", className)}>
      <div className="relative h-96 md:h-[500px] rounded-2xl overflow-hidden">
        {/* 背景图片 */}
        <div className="absolute inset-0">
          <img src={currentStory.image || `https://picsum.photos/seed/${currentStory._id || 'default'}/1200/600`} alt={currentStory.title} className="w-full h-full object-cover" onError={e => {
          e.target.src = 'https://picsum.photos/1200/600';
        }} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        </div>

        {/* 内容区域 */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
          <div className="max-w-4xl">
            <h2 className="text-2xl md:text-4xl font-bold text-white mb-2 md:mb-4 line-clamp-2">
              {currentStory.title}
            </h2>
            <p className="text-slate-300 mb-4 line-clamp-3 max-w-2xl">
              {currentStory.content || '暂无描述'}
            </p>
            <div className="flex items-center space-x-4 text-sm text-slate-400 mb-6">
              <span>{currentStory.author || '佚名'}</span>
              <span>•</span>
              <span>{currentStory.views || 0} 次浏览</span>
            </div>
            <Button onClick={() => onNavigate && onNavigate({
            pageId: 'detail',
            params: {
              id: currentStory._id
            }
          })} className="bg-red-500 hover:bg-red-600 text-white">
              阅读故事
            </Button>
          </div>
        </div>

        {/* 导航按钮 */}
        {validStories.length > 1 && <>
            <Button variant="ghost" size="icon" className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white" onClick={prevSlide}>
              <ChevronLeft className="w-6 h-6" />
            </Button>
            <Button variant="ghost" size="icon" className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white" onClick={nextSlide}>
              <ChevronRight className="w-6 h-6" />
            </Button>
          </>}

        {/* 指示器 */}
        {validStories.length > 1 && <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
            {validStories.map((_, index) => <button key={index} className={cn("w-2 h-2 rounded-full transition-all", index === currentIndex ? "bg-red-500 w-8" : "bg-white/50 hover:bg-white/70")} onClick={() => goToSlide(index)} />)}
          </div>}
      </div>
    </div>;
};

// 确保正确导出
export default StoryCarousel;