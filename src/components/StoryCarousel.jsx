// @ts-ignore;
import React, { useState, useEffect, useCallback, useRef } from 'react';
// @ts-ignore;
import { Button } from '@/components/ui';
// @ts-ignore;
import { ChevronLeft, ChevronRight, Eye, Circle, Pause, Play } from 'lucide-react';
// @ts-ignore;
import { cn } from '@/lib/utils';

export function StoryCarousel({
  stories,
  onNavigate
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const intervalRef = useRef(null);

  // 过滤有图片的故事作为轮播项
  const carouselStories = stories.filter(story => story.image).slice(0, 5);
  if (carouselStories.length === 0) return null;

  // 清除自动播放定时器
  const clearAutoPlay = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // 设置自动播放
  const startAutoPlay = () => {
    clearAutoPlay();
    if (isAutoPlay && !isHovered) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % carouselStories.length);
      }, 5000);
    }
  };

  // 自动播放控制
  useEffect(() => {
    startAutoPlay();
    return () => clearAutoPlay();
  }, [isAutoPlay, isHovered, carouselStories.length]);

  // 切换轮播
  const goToPrevious = useCallback(() => {
    clearAutoPlay();
    setCurrentIndex(prev => (prev - 1 + carouselStories.length) % carouselStories.length);
    // 手动操作后延迟恢复自动播放
    setTimeout(startAutoPlay, 3000);
  }, [carouselStories.length]);
  const goToNext = useCallback(() => {
    clearAutoPlay();
    setCurrentIndex(prev => (prev + 1) % carouselStories.length);
    // 手动操作后延迟恢复自动播放
    setTimeout(startAutoPlay, 3000);
  }, [carouselStories.length]);
  const goToSlide = useCallback(index => {
    clearAutoPlay();
    setCurrentIndex(index);
    // 手动操作后延迟恢复自动播放
    setTimeout(startAutoPlay, 3000);
  }, []);
  const handleStoryClick = storyId => {
    onNavigate('detail', {
      id: storyId
    });
  };
  const toggleAutoPlay = () => {
    setIsAutoPlay(!isAutoPlay);
  };
  const currentStory = carouselStories[currentIndex];
  return <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      
      {/* 轮播容器 */}
      <div className="relative h-96 md:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
        {/* 背景图片 */}
        <div className="absolute inset-0">
          {carouselStories.map((story, index) => <div key={story._id} className={cn("absolute inset-0 transition-all duration-500 cursor-pointer", index === currentIndex ? "opacity-100 scale-100" : "opacity-0 scale-105")} onClick={() => handleStoryClick(story._id)}>
              <img src={story.image} alt={story.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
            </div>)}
        </div>

        {/* 内容区域 */}
        <div className="absolute inset-0 flex items-end">
          <div className="w-full p-8 md:p-12">
            <div className="max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
                {currentStory.title}
              </h2>
              <p className="text-slate-200 text-lg mb-6 line-clamp-3">
                {currentStory.content}
              </p>
              <div className="flex items-center space-x-4">
                <Button onClick={e => {
                e.stopPropagation();
                handleStoryClick(currentStory._id);
              }} className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 shadow-lg hover:shadow-red-500/25 transition-all duration-300 transform hover:scale-105">
                  <Eye className="w-4 h-4 mr-2" />
                  阅读全文
                </Button>
                <div className="flex items-center space-x-2 text-sm text-slate-300">
                  <span>{currentStory.author || '佚名'}</span>
                  <span>•</span>
                  <span>{new Date(currentStory.createdAt).toLocaleDateString('zh-CN')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 左右切换按钮 */}
        <button onClick={e => {
        e.stopPropagation();
        goToPrevious();
      }} className={cn("absolute left-4 top-1/2 -translate-y-1/2 bg-slate-800/70 hover:bg-slate-700/90 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-200 hover:scale-110 z-10", "opacity-0 group-hover:opacity-100")} aria-label="上一张">
          <ChevronLeft className="w-6 h-6" />
        </button>
        
        <button onClick={e => {
        e.stopPropagation();
        goToNext();
      }} className={cn("absolute right-4 top-1/2 -translate-y-1/2 bg-slate-800/70 hover:bg-slate-700/90 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-200 hover:scale-110 z-10", "opacity-0 group-hover:opacity-100")} aria-label="下一张">
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* 轮播指示器 */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center space-x-3 z-10">
          {carouselStories.map((_, index) => <button key={index} onClick={e => {
          e.stopPropagation();
          goToSlide(index);
        }} className={cn("transition-all duration-300 rounded-full", index === currentIndex ? "w-8 h-2 bg-red-500" : "w-2 h-2 bg-slate-400/50 hover:bg-slate-300/70")} aria-label={`跳转到第${index + 1}张`} />)}
        </div>

        {/* 自动播放控制按钮 */}
        <button onClick={e => {
        e.stopPropagation();
        toggleAutoPlay();
      }} className={cn("absolute top-4 right-4 bg-slate-800/70 hover:bg-slate-700/90 backdrop-blur-sm text-white p-2 rounded-full transition-all duration-200 z-10", "opacity-0 group-hover:opacity-100")} aria-label={isAutoPlay ? "暂停自动播放" : "开始自动播放"}>
          {isAutoPlay ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>

        {/* 当前位置指示器 */}
        <div className="absolute top-4 left-4 bg-slate-800/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm z-10">
          {currentIndex + 1} / {carouselStories.length}
        </div>

        {/* 移动端滑动提示 */}
        <div className="absolute bottom-4 right-4 md:hidden bg-slate-800/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
          左右滑动切换
        </div>
      </div>
    </div>;
}