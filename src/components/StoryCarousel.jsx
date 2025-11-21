// @ts-ignore;
import React, { useState, useEffect, useCallback } from 'react';
// @ts-ignore;
import { Button } from '@/components/ui';
// @ts-ignore;
import { ChevronLeft, ChevronRight, Eye, Play, Pause } from 'lucide-react';
// @ts-ignore;
import { cn } from '@/lib/utils';

export function StoryCarousel({
  stories,
  onNavigate
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);

  // 过滤有图片的故事作为轮播项
  const carouselStories = stories.filter(story => story.image).slice(0, 5);
  if (carouselStories.length === 0) return null;

  // 自动播放逻辑
  useEffect(() => {
    if (!isAutoPlay || isHovered || !isPlaying) return;
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % carouselStories.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isAutoPlay, isHovered, isPlaying, carouselStories.length]);

  // 切换轮播
  const goToPrevious = useCallback(() => {
    setCurrentIndex(prev => (prev - 1 + carouselStories.length) % carouselStories.length);
    setIsPlaying(false); // 手动切换时暂停自动播放
    setTimeout(() => setIsPlaying(true), 10000); // 10秒后恢复自动播放
  }, [carouselStories.length]);
  const goToNext = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % carouselStories.length);
    setIsPlaying(false); // 手动切换时暂停自动播放
    setTimeout(() => setIsPlaying(true), 10000); // 10秒后恢复自动播放
  }, [carouselStories.length]);
  const goToSlide = useCallback(index => {
    setCurrentIndex(index);
    setIsPlaying(false); // 手动切换时暂停自动播放
    setTimeout(() => setIsPlaying(true), 10000); // 10秒后恢复自动播放
  }, []);
  const toggleAutoPlay = () => {
    setIsPlaying(!isPlaying);
  };
  const handleStoryClick = storyId => {
    onNavigate('detail', {
      id: storyId
    });
  };
  const currentStory = carouselStories[currentIndex];
  return <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      {/* 轮播容器 */}
      <div className="relative h-96 md:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
        {/* 背景图片 */}
        <div className="absolute inset-0">
          {carouselStories.map((story, index) => <div key={story._id} className={cn("absolute inset-0 transition-all duration-700 ease-in-out", index === currentIndex ? "opacity-100 translate-x-0" : index < currentIndex ? "opacity-0 -translate-x-full" : "opacity-0 translate-x-full")}>
              <img src={story.image} alt={story.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
            </div>)}
        </div>

        {/* 内容区域 */}
        <div className="absolute inset-0 flex items-end">
          <div className="w-full p-8 md:p-12">
            <div className="max-w-2xl">
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-sm text-red-400 font-semibold bg-red-500/20 px-3 py-1 rounded-full">
                  精选故事
                </span>
                <span className="text-sm text-slate-300">
                  {currentIndex + 1} / {carouselStories.length}
                </span>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight line-clamp-2">
                {currentStory.title}
              </h2>
              
              <p className="text-slate-200 text-lg mb-6 line-clamp-3">
                {currentStory.content}
              </p>
              
              <div className="flex items-center space-x-4">
                <Button onClick={() => handleStoryClick(currentStory._id)} className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 shadow-lg hover:shadow-red-500/25 transition-all duration-300 transform hover:scale-105">
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

        {/* 控制按钮 */}
        <button onClick={goToPrevious} className="absolute left-4 top-1/2 -translate-y-1/2 bg-slate-800/70 hover:bg-slate-700/90 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-200 hover:scale-110">
          <ChevronLeft className="w-6 h-6" />
        </button>
        
        <button onClick={goToNext} className="absolute right-4 top-1/2 -translate-y-1/2 bg-slate-800/70 hover:bg-slate-700/90 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-200 hover:scale-110">
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* 自动播放控制按钮 */}
        <button onClick={toggleAutoPlay} className="absolute top-4 right-4 bg-slate-800/70 hover:bg-slate-700/90 backdrop-blur-sm text-white p-2 rounded-full transition-all duration-200">
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>

        {/* 指示器 */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
          {carouselStories.map((_, index) => <button key={index} onClick={() => goToSlide(index)} className={cn("w-2 h-2 rounded-full transition-all duration-300", index === currentIndex ? "bg-red-500 w-8" : "bg-slate-400/50 hover:bg-slate-300/70")} />)}
        </div>

        {/* 自动播放状态指示 */}
        <div className="absolute bottom-4 right-4 text-xs text-slate-300 bg-slate-800/70 backdrop-blur-sm px-3 py-1 rounded-full">
          {isPlaying ? '自动播放中' : '已暂停'}
        </div>
      </div>
    </div>;
}