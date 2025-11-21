// @ts-ignore;
import React, { useState, useEffect, useRef } from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui';
// @ts-ignore;
import { ChevronLeft, ChevronRight, Eye } from 'lucide-react';
// @ts-ignore;
import { cn } from '@/lib/utils';

// @ts-ignore;
import { FadeIn, AnimatedCard } from '@/components/AnimationProvider';
export function StoryCarousel({
  stories,
  onNavigate
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [direction, setDirection] = useState('right');
  const intervalRef = useRef(null);
  const touchStartRef = useRef(null);
  const touchEndRef = useRef(null);

  // 自动轮播
  useEffect(() => {
    if (stories.length > 1) {
      intervalRef.current = setInterval(() => {
        handleNext();
      }, 5000);
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [stories.length, currentIndex]);

  // 处理下一张
  const handleNext = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setDirection('right');
    setTimeout(() => {
      setCurrentIndex(prev => (prev + 1) % stories.length);
      setIsTransitioning(false);
    }, 300);
  };

  // 处理上一张
  const handlePrev = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setDirection('left');
    setTimeout(() => {
      setCurrentIndex(prev => (prev - 1 + stories.length) % stories.length);
      setIsTransitioning(false);
    }, 300);
  };

  // 处理点击指示器
  const handleIndicatorClick = index => {
    if (isTransitioning || index === currentIndex) return;
    setDirection(index > currentIndex ? 'right' : 'left');
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex(index);
      setIsTransitioning(false);
    }, 300);
  };

  // 触摸处理
  const handleTouchStart = e => {
    touchStartRef.current = e.touches[0].clientX;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };
  const handleTouchMove = e => {
    touchEndRef.current = e.touches[0].clientX;
  };
  const handleTouchEnd = () => {
    if (!touchStartRef.current || !touchEndRef.current) return;
    const deltaX = touchEndRef.current - touchStartRef.current;
    if (Math.abs(deltaX) > 50) {
      if (deltaX > 0) {
        handlePrev();
      } else {
        handleNext();
      }
    }
    touchStartRef.current = null;
    touchEndRef.current = null;
  };

  // 格式化日期
  const formatDate = timestamp => {
    if (!timestamp) return '未知时间';
    return new Date(timestamp).toLocaleDateString('zh-CN', {
      month: 'long',
      day: 'numeric'
    });
  };
  if (!stories || stories.length === 0) {
    return null;
  }
  return <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-800/80 to-slate-700/80 backdrop-blur-sm border border-slate-700/50">
        {/* 轮播内容 */}
        <div className="relative h-96 md:h-[500px] overflow-hidden" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
          <div className={cn("flex transition-transform duration-300 ease-out", {
          'translate-x-0': !isTransitioning,
          '-translate-x-full': isTransitioning && direction === 'right',
          'translate-x-full': isTransitioning && direction === 'left'
        })} style={{
          transform: `translateX(-${currentIndex * 100}%)`
        }}>
            {stories.map((story, index) => <div key={story._id} className="w-full flex-shrink-0 h-full relative">
                <AnimatedCard>
                  <div className="absolute inset-0">
                    {story.image && <img src={story.image} alt={story.title} className="w-full h-full object-cover" />}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-8">
                    <FadeIn delay={200}>
                      <h3 className="text-2xl md:text-4xl font-bold text-white mb-2 line-clamp-2">
                        {story.title}
                      </h3>
                      <p className="text-slate-300 mb-4 line-clamp-3 max-w-2xl">
                        {story.content?.substring(0, 150)}...
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-slate-400">
                        <span>{formatDate(story.createdAt)}</span>
                        <span>•</span>
                        <span>{story.author || '佚名'}</span>
                      </div>
                      <Button onClick={() => onNavigate({
                    pageId: 'detail',
                    params: {
                      id: story._id
                    }
                  })} className="mt-4 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600">
                        <Eye className="w-4 h-4 mr-2" />
                        阅读故事
                      </Button>
                    </FadeIn>
                  </div>
                </AnimatedCard>
              </div>)}
          </div>
        </div>

        {/* 导航按钮 */}
        <button onClick={handlePrev} className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-200 hover:scale-110">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button onClick={handleNext} className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-200 hover:scale-110">
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* 指示器 */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
          {stories.map((_, index) => <button key={index} onClick={() => handleIndicatorClick(index)} className={cn("w-2 h-2 rounded-full transition-all duration-300", {
          'bg-red-500 scale-125': index === currentIndex,
          'bg-slate-400 hover:bg-slate-300': index !== currentIndex
        })} />)}
        </div>
      </div>
    </div>;
}