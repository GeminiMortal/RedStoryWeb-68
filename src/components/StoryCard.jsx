// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from '@/components/ui';
// @ts-ignore;
import { Clock, User, Eye } from 'lucide-react';
// @ts-ignore;
import { cn } from '@/lib/utils';

// @ts-ignore;
import { FadeIn } from './AnimationProvider';
export function StoryCard({
  story,
  index = 0,
  onNavigate
}) {
  if (!story || !story._id) {
    return null;
  }
  const formatDate = timestamp => {
    if (!timestamp) return '未知时间';
    try {
      return new Date(timestamp).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return '未知时间';
    }
  };
  const handleCardClick = () => {
    if (typeof onNavigate === 'function' && story._id) {
      onNavigate({
        pageId: 'detail',
        params: {
          id: story._id
        }
      });
    }
  };
  return <FadeIn delay={index * 100}>
      <Card className={cn("bg-slate-800/50 backdrop-blur-sm border-slate-700/50 rounded-2xl overflow-hidden", "shadow-xl hover:shadow-2xl hover:shadow-red-500/10 hover:border-red-500/50", "transition-all duration-300 transform hover:-translate-y-2 hover:scale-[1.02]", "cursor-pointer")} onClick={handleCardClick}>
        {story.image && <div className="aspect-video overflow-hidden relative">
            <img src={story.image} alt={story.title || '故事图片'} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" onError={e => {
          e.target.style.display = 'none';
        }} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
          </div>}
        
        <CardHeader className="p-5">
          <CardTitle className="text-white text-lg line-clamp-2 hover:text-red-400 transition-colors duration-300">
            {story.title || '无标题'}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="px-5 pb-5">
          <p className="text-slate-400 text-sm mb-4 line-clamp-3 leading-relaxed">
            {story.content || '暂无内容'}
          </p>
          
          {story.tags && Array.isArray(story.tags) && story.tags.length > 0 && <div className="flex flex-wrap gap-1 mb-4">
              {story.tags.slice(0, 3).map((tag, idx) => <Badge key={idx} variant="outline" className="border-red-500/30 text-red-400 text-xs bg-red-500/10 hover:bg-red-500/20 transition-colors">
                  {tag}
                </Badge>)}
            </div>}

          <div className="flex items-center justify-between text-sm text-slate-500">
            <div className="flex items-center space-x-3">
              <span className="flex items-center bg-slate-700/50 px-2 py-1 rounded-full">
                <User className="w-3 h-3 mr-1" />
                {story.author || '佚名'}
              </span>
              <span className="flex items-center bg-slate-700/50 px-2 py-1 rounded-full">
                <Clock className="w-3 h-3 mr-1" />
                {formatDate(story.createdAt)}
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={e => {
            e.stopPropagation();
            if (typeof onNavigate === 'function' && story._id) {
              onNavigate({
                pageId: 'detail',
                params: {
                  id: story._id
                }
              });
            }
          }} className="text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200">
              <Eye className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </FadeIn>;
}