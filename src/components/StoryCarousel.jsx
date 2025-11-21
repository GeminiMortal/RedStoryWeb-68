// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Card, CardContent } from '@/components/ui';
// @ts-ignore;
import { ChevronLeft, ChevronRight } from 'lucide-react';
// @ts-ignore;
import { cn } from '@/lib/utils';

// @ts-ignore;
import { FadeIn } from './AnimationProvider';
export function StoryCarousel({
  stories = [],
  onNavigate
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  // 安全获取有效故事
  const validStories = Array.isArray(stories) ? stories.filter(story => story && story.title && story._id) : [];
  if (validStories.length === 0) {
    return null;
  }
  const handlePrevious = () => {
    setCurrentIndex(prev => prev > 0 ? prev - 1 : validStories.length - 1);
  };
  const handleNext = () => {
    setCurrentIndex(prev => prev < validStories.length - 1 ? prev + 1 : 0);
  };
  const handleStoryClick = story => {
    if (story?._id && typeof onNavigate === 'function') {
      onNavigate({
        pageId: 'detail',
        params: {
          id: story._id
        }
      });
    }
  };
  const currentStory = validStories[currentIndex] || {};
  return <FadeIn>
      <div className="relative">
        <div className="overflow-hidden rounded-2xl">
          <div className="relative aspect-[16/9]">
            {currentStory.image ? <img src={currentStory.image} alt={currentStory.title || '故事图片'} className="w-full h-full object-cover" onError={e => {
            e.target.style.display = 'none';
          }} /> : <div className="w-full h-full bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center">
                <div className="text-center">
                  <h3 className="text-white text-xl font-bold mb-2">
                    {currentStory.title || '红色故事'}
                  </h3>
                  <p className="text-slate-300 text-sm">
                    {currentStory.author || '佚名'}
                  </p>
                </div>
              </div>}
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <h3 className="text-white text-2xl font-bold mb-2 line-clamp-2">
                {currentStory.title || '无标题'}
              </h3>
              <p className="text-slate-300 text-sm line-clamp-2">
                {currentStory.content || '暂无内容'}
              </p>
            </div>
          </div>
        </div>

        {/* 导航按钮 */}
        {validStories.length > 1 && <>
            <button onClick={handlePrevious} className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={handleNext} className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </>}

        {/* 指示器 */}
        {validStories.length > 1 && <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
            {validStories.map((_, index) => <button key={index} onClick={() => setCurrentIndex(index)} className={cn("w-2 h-2 rounded-full transition-colors", index === currentIndex ? "bg-white" : "bg-white/50")} />)}
          </div>}
      </div>
    </FadeIn>;
}