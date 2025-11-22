// @ts-ignore;
import React, { useState, useEffect, useCallback } from 'react';
// @ts-ignore;
import { Button } from '@/components/ui';
// @ts-ignore;
import { ChevronLeft, ChevronRight, Eye } from 'lucide-react';
// @ts-ignore;
import { cn } from '@/lib/utils';

export function StoryCarousel({
  stories,
  onNavigate
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  // 过滤有图片的故事作为轮播项
  const carouselStories = stories.filter(story => story.image).slice(0, 5);
  if (carouselStories.length === 0) return null;

  // 自动播放逻辑
  useEffect(() => {
    if (!isAutoPlay || isHovered) return;
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % carouselStories.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isAutoPlay, isHovered, carouselStories.length]);

  // 切换轮播
  const goToPrevious = useCallback(() => {
    setCurrentIndex(prev => (prev - 1 + carouselStories.length) % carouselStories.length);
  }, [carouselStories.length]);
  const goToNext = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % carouselStories.length);
  }, [carouselStories.length]);
  const goToSlide = useCallback(index => {
    setCurrentIndex(index);
  }, []);
  const handleStoryClick = storyId => {
    // 修复：使用对象参数方式调用，与首页保持一致
    onNavigate({
      pageId: 'detail',
      params: {
        id: storyId
      }
    });
  };
  const currentStory = carouselStories[currentIndex];
  return <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 animate-fade-in" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      
      {/* 轮播容器 */}
      <div className="relative h-96 md:h-[500px] rounded-2xl overflow-hidden shadow-2xl hover-lift">
        {/* 背景图片 */}
        <div className="absolute inset-0">
          {carouselStories.map((story, index) => <div key={story._id} className={cn("absolute inset-0 transition-opacity duration-500 cursor-pointer", index === currentIndex ? "opacity-100" : "opacity-0")} onClick={() => handleStoryClick(story._id)}>
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
              }} className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 shadow-lg hover:shadow-red-500/25 transition-all duration-300 transform hover:scale-105 button-press">
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
        <button onClick={e => {
        e.stopPropagation();
        goToPrevious();
      }} className="absolute left-4 top-1/2 -translate-y-1/2 bg-slate-800/50 hover:bg-slate-700/70 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-200 hover:scale-110 button-press">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button onClick={e => {
        e.stopPropagation();
        goToNext();
      }} className="absolute right-4 top-1/2 -translate-y-1/2 bg-slate-800/50 hover:bg-slate-700/70 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-200 hover:scale-110 button-press">
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* 指示器 */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
          {carouselStories.map((_, index) => <button key={index} onClick={e => {
          e.stopPropagation();
          goToSlide(index);
        }} className={cn("w-2 h-2 rounded-full transition-all duration-300 button-press", index === currentIndex ? "bg-red-500 w-8" : "bg-slate-400/50 hover:bg-slate-300/70")} />)}
        </div>

        {/* 自动播放状态指示器 */}
        <div className="absolute top-4 right-4">
          <div className={cn("text-xs text-white bg-slate-800/70 backdrop-blur-sm px-3 py-1 rounded-full transition-opacity duration-300", isHovered ? "opacity-100" : "opacity-0")}>
            {isAutoPlay ? '自动播放已暂停' : '自动播放已停止'}
          </div>
        </div>

        {/* 移动端滑动提示 */}
        <div className="absolute bottom-4 right-4 md:hidden">
          <div className="text-xs text-slate-300 bg-slate-800/50 backdrop-blur-sm px-3 py-1 rounded-full">
            左右滑动切换
          </div>
        </div>
      </div>
    </div>;
}