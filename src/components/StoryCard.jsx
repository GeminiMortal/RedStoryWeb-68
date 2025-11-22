// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Button, Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui';
// @ts-ignore;
import { Clock, User, Eye, Heart, Share2, MapPin, Calendar, Tag, Loader2 } from 'lucide-react';
// @ts-ignore;
import { cn } from '@/lib/utils';

export function StoryCard({
  story,
  onNavigate,
  onLike,
  onShare,
  className,
  showActions = true,
  compact = false
}) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(story.like_count || 0);
  const [isLiking, setIsLiking] = useState(false);
  const formatDate = timestamp => {
    if (!timestamp) return '未知时间';
    return new Date(timestamp).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  const formatReadTime = readTime => {
    if (!readTime) return '5分钟阅读';
    return readTime;
  };
  const handleLike = async () => {
    if (isLiking) return;
    try {
      setIsLiking(true);
      const newLikedState = !liked;
      const newLikeCount = newLikedState ? likeCount + 1 : likeCount - 1;
      setLiked(newLikedState);
      setLikeCount(newLikeCount);
      if (onLike) {
        await onLike(story._id, newLikedState);
      }
    } catch (error) {
      console.error('点赞操作失败:', error);
      // 恢复状态
      setLiked(liked);
      setLikeCount(likeCount);
    } finally {
      setIsLiking(false);
    }
  };
  const handleShare = async () => {
    if (onShare) {
      await onShare(story);
    } else {
      // 默认分享行为
      if (navigator.share) {
        try {
          await navigator.share({
            title: story.title || '红色故事',
            text: story.content?.substring(0, 100) + '...' || '分享一个红色故事',
            url: window.location.href
          });
        } catch (error) {
          console.log('分享取消或失败');
        }
      } else {
        // 复制链接到剪贴板
        try {
          await navigator.clipboard.writeText(window.location.href);
          // 这里可以添加 toast 提示
        } catch (error) {
          console.error('复制链接失败:', error);
        }
      }
    }
  };
  const handleCardClick = () => {
    if (onNavigate) {
      onNavigate('detail', {
        id: story._id
      });
    }
  };
  if (compact) {
    return <Card className={cn("bg-slate-800/60 backdrop-blur-sm border-slate-700/50 rounded-xl overflow-hidden shadow-soft hover:shadow-medium transition-all duration-300 cursor-pointer group mobile-card", className)} onClick={handleCardClick}>
        <div className="flex items-center p-4 space-x-4">
          {/* 缩略图 */}
          <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-slate-700/50">
            {story.image && !imageError ? <img src={story.image} alt={story.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" onLoad={() => setImageLoading(false)} onError={() => setImageError(true)} /> : <div className="w-full h-full flex items-center justify-center">
                <Tag className="w-6 h-6 text-slate-500" />
              </div>}
          </div>
          
          {/* 内容 */}
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-medium line-clamp-1 group-hover:text-red-400 transition-colors duration-200">
              {story.title || '无标题'}
            </h3>
            <p className="text-slate-400 text-sm line-clamp-2 mt-1">
              {story.content || '暂无内容'}
            </p>
            <div className="flex items-center space-x-3 mt-2 text-xs text-slate-500">
              <span className="flex items-center">
                <User className="w-3 h-3 mr-1" />
                {story.author || '佚名'}
              </span>
              <span className="flex items-center">
                <Eye className="w-3 h-3 mr-1" />
                {story.views || 0}
              </span>
            </div>
          </div>
          
          {/* 操作按钮 */}
          {showActions && <div className="flex-shrink-0 flex space-x-1">
              <Button variant="ghost" size="sm" onClick={e => {
            e.stopPropagation();
            handleLike();
          }} className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 button-press">
                <Heart className={cn("w-4 h-4", liked && "fill-current text-red-400")} />
              </Button>
              <Button variant="ghost" size="sm" onClick={e => {
            e.stopPropagation();
            handleShare();
          }} className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all duration-200 button-press">
                <Share2 className="w-4 h-4" />
              </Button>
            </div>}
        </div>
      </Card>;
  }
  return <Card className={cn("bg-slate-800/60 backdrop-blur-sm border-slate-700/50 rounded-2xl overflow-hidden shadow-soft hover:shadow-medium transition-all duration-300 cursor-pointer group card-hover mobile-card", className)} onClick={handleCardClick}>
      {/* 封面图片 */}
      {story.image && <div className="aspect-video overflow-hidden relative bg-slate-700/50">
          {imageLoading && <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-slate-500 animate-spin" />
            </div>}
          {!imageError ? <img src={story.image} alt={story.title} className={cn("w-full h-full object-cover transition-all duration-500 group-hover:scale-110", imageLoading ? "opacity-0" : "opacity-100")} onLoad={() => setImageLoading(false)} onError={() => setImageError(true)} /> : <div className="w-full h-full flex items-center justify-center">
              <Tag className="w-12 h-12 text-slate-500" />
            </div>}
          
          {/* 悬停覆盖层 */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  {story.tags?.slice(0, 2).map((tag, idx) => <Badge key={idx} variant="outline" className="border-white/30 text-white bg-white/20 backdrop-blur-sm text-xs">
                      {tag}
                    </Badge>)}
                </div>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm" onClick={e => {
                e.stopPropagation();
                handleLike();
              }} className="p-2 text-white hover:text-red-400 hover:bg-red-500/20 transition-all duration-200 button-press">
                    <Heart className={cn("w-4 h-4", liked && "fill-current text-red-400")} />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={e => {
                e.stopPropagation();
                handleShare();
              }} className="p-2 text-white hover:text-blue-400 hover:bg-blue-500/20 transition-all duration-200 button-press">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>}

      <CardHeader className="p-6 pb-4">
        <CardTitle className="text-white text-xl line-clamp-2 group-hover:text-red-400 transition-colors duration-300 font-semibold">
          {story.title || '无标题'}
        </CardTitle>
      </CardHeader>

      <CardContent className="px-6 pb-6 pt-0">
        {/* 内容预览 */}
        <p className="text-slate-400 text-sm mb-4 line-clamp-3 leading-relaxed">
          {story.content || '暂无内容'}
        </p>
        
        {/* 标签 */}
        {story.tags && story.tags.length > 0 && <div className="flex flex-wrap gap-2 mb-4">
            {story.tags.slice(0, 3).map((tag, idx) => <Badge key={idx} variant="outline" className="border-red-500/30 text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-colors duration-200 text-xs">
                <Tag className="w-3 h-3 mr-1" />
                {tag}
              </Badge>)}
          </div>}

        {/* 元信息 */}
        <div className="space-y-3">
          {/* 作者和日期 */}
          <div className="flex items-center justify-between text-sm text-slate-500">
            <div className="flex items-center space-x-4">
              <span className="flex items-center bg-slate-700/50 px-3 py-1.5 rounded-full">
                <User className="w-4 h-4 mr-2" />
                {story.author || '佚名'}
              </span>
              <span className="flex items-center bg-slate-700/50 px-3 py-1.5 rounded-full">
                <Calendar className="w-4 h-4 mr-2" />
                {formatDate(story.createdAt)}
              </span>
            </div>
            <span className="flex items-center bg-slate-700/50 px-3 py-1.5 rounded-full">
              <Clock className="w-4 h-4 mr-2" />
              {formatReadTime(story.read_time)}
            </span>
          </div>
          
          {/* 地点和统计 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-slate-500">
              {story.location && <span className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {story.location}
                </span>}
            </div>
            <div className="flex items-center space-x-4 text-sm text-slate-500">
              <span className="flex items-center">
                <Eye className="w-4 h-4 mr-1" />
                {story.views || 0}
              </span>
              <span className="flex items-center">
                <Heart className="w-4 h-4 mr-1" />
                {likeCount}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>;
}