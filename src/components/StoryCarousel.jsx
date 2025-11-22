// @ts-ignore;
import React, { useState, useEffect, useCallback } from 'react';
// @ts-ignore;
import { Button, Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui';
// @ts-ignore;
import { ChevronLeft, ChevronRight, BookOpen, Clock, User, Eye, ArrowRight } from 'lucide-react';
// @ts-ignore;
import { cn } from '@/lib/utils';

export function StoryCarousel({
  stories,
  onNavigate
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isHovering, setIsHovering] = useState(false);

  // 筛选有图片的故事用于轮播
  const carouselStories = stories.filter(story => story.image).slice(0, 5);
  if (carouselStories.length === 0) {
    return null;
  }

  // 格式化日期
  const formatDate = timestamp => {
    if (!timestamp) return '未知时间';
    try {
      return new Date(timestamp).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return '日期格式错误';
    }
  };

  // 格式化阅读时间
  const formatReadTime = content => {
    if (!content) return '5分钟阅读';
    const wordCount = content.length;
    const readTime = Math.max(1, Math.ceil(wordCount / 500));
    return `${readTime}分钟阅读`;
  };

  // 导航到详情页
  const handleStoryClick = useCallback(storyId => {
    onNavigate('detail', {
      id: storyId
    });
  }, [onNavigate]);

  // 轮播控制
  const nextSlide = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % carouselStories.length);
  }, [carouselStories.length]);
  const prevSlide = useCallback(() => {
    setCurrentIndex(prev => (prev - 1 + carouselStories.length) % carouselStories.length);
  }, [carouselStories.length]);
  const goToSlide = useCallback(index => {
    setCurrentIndex(index);
  }, []);

  // 自动播放
  useEffect(() => {
    if (isAutoPlaying && !isHovering) {
      const timer = setInterval(nextSlide, 5000);
      return () => clearInterval(timer);
    }
  }, [isAutoPlaying, isHovering, nextSlide]);

  // 键盘导航
  useEffect(() => {
    const handleKeyDown = e => {
      if (e.key === 'ArrowLeft') {
        prevSlide();
      } else if (e.key === 'ArrowRight') {
        nextSlide();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [prevSlide, nextSlide]);
  const currentStory = carouselStories[currentIndex];
  return <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="relative" onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
        {/* 轮播指示器 */}
        <div className="flex justify-center space-x-2 mb-4">
          {carouselStories.map((_, index) => <button key={index} onClick={() => goToSlide(index)} className={cn("w-2 h-2 rounded-full transition-all duration-300", currentIndex === index ? "bg-red-500 w-8" : "bg-slate-600 hover:bg-slate-500")} />)}
        </div>

        {/* 轮播内容 */}
        <div className="relative h-96 md:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
          <div className="absolute inset-0">
            <img src={currentStory.image} alt={currentStory.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
          </div>

          {/* 内容区域 */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <div className="max-w-3xl">
              <h2 className="text-2xl md:text-4xl font-bold text-white mb-3 line-clamp-2">
                {currentStory.title}
              </h2>
              <p className="text-slate-200 text-sm md:text-base mb-4 line-clamp-3">
                {currentStory.content}
              </p>
              
              <div className="flex items-center space-x-4 text-sm text-slate-300 mb-6">
                <span className="flex items-center">
                  <User className="w-4 h-4 mr-1" />
                  {currentStory.author}
                </span>
                <span className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {formatDate(currentStory.createdAt)}
                </span>
                <span className="flex items-center">
                  <Eye className="w-4 h-4 mr-1" />
                  {currentStory.views}次阅读
                </span>
              </div>

              {/* 添加阅读全文按钮 */}
              <div className="flex items-center space-x-4">
                <Button onClick={() => handleStoryClick(currentStory._id)} className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105">
                  <BookOpen className="w-5 h-5 mr-2" />
                  阅读全文
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                
                {currentStory.tags && currentStory.tags.length > 0 && <div className="hidden md:flex items-center space-x-2">
                    {currentStory.tags.slice(0, 3).map((tag, index) => <Badge key={index} variant="outline" className="border-red-500/30 text-red-400 bg-red-500/10">
                        {tag}
                      </Badge>)}
                  </div>}
              </div>
            </div>
          </div>

          {/* 导航按钮 */}
          <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-300 transform hover:scale-110">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-300 transform hover:scale-110">
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* 缩略图导航 */}
        <div className="grid grid-cols-4 md:grid-cols-5 gap-2 mt-4">
          {carouselStories.map((story, index) => <div key={story._id} onClick={() => goToSlide(index)} className={cn("relative aspect-video rounded-lg overflow-hidden cursor-pointer transition-all duration-300", currentIndex === index ? "ring-2 ring-red-500 scale-105" : "opacity-70 hover:opacity-100")}>
              <img src={story.image} alt={story.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40"></div>
              <div className="absolute bottom-2 left-2 right-2">
                <p className="text-white text-xs font-medium line-clamp-1">{story.title}</p>
              </div>
            </div>)}
        </div>
      </div>
    </div>;
}