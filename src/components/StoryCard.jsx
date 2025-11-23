// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Button, useToast } from '@/components/ui';
// @ts-ignore;
import { Heart, Share2, Eye, Clock, MapPin, User, Tag, MoreVertical, Edit, Trash2, ExternalLink } from 'lucide-react';

// @ts-ignore;
import { StoryActions } from '@/components/StoryActions';
// @ts-ignore;
import { StoryImage } from '@/components/StoryImage';
export function StoryCard({
  story,
  onEdit,
  onDelete,
  onShare,
  onLike,
  onView,
  showActions = true,
  compact = false,
  className = '',
  navigateTo
}) {
  const [isLiked, setIsLiked] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showFullContent, setShowFullContent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const {
    toast
  } = useToast();

  // 处理点赞
  const handleLike = async () => {
    try {
      setIsLoading(true);
      setIsLiked(!isLiked);
      if (onLike) {
        await onLike(story, !isLiked);
      }
      toast({
        title: isLiked ? '取消点赞' : '点赞成功',
        description: isLiked ? '已取消点赞' : '感谢您的点赞'
      });
    } catch (error) {
      // 恢复状态
      setIsLiked(isLiked);
      toast({
        title: '操作失败',
        description: '请稍后重试',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 处理分享
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: story.title,
          text: story.content?.substring(0, 100) + '...',
          url: window.location.href
        });
      } else {
        // 复制到剪贴板
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: '链接已复制',
          description: '故事链接已复制到剪贴板'
        });
      }
      if (onShare) {
        await onShare(story);
      }
    } catch (error) {
      toast({
        title: '分享失败',
        description: '请稍后重试',
        variant: 'destructive'
      });
    }
  };

  // 处理查看
  const handleView = () => {
    if (onView) {
      onView(story);
    }
  };

  // 格式化日期
  const formatDate = timestamp => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      return '今天';
    } else if (diffDays === 2) {
      return '昨天';
    } else if (diffDays <= 7) {
      return `${diffDays}天前`;
    } else {
      return date.toLocaleDateString('zh-CN', {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  // 截断文本
  const truncateText = (text, maxLength = 150) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // 计算阅读时间
  const getReadTime = () => {
    if (story.read_time) {
      return story.read_time;
    }
    if (story.content) {
      const wordsPerMinute = 200;
      const words = story.content.length;
      const minutes = Math.ceil(words / wordsPerMinute);
      return `${minutes}分钟阅读`;
    }
    return '5分钟阅读';
  };

  // 处理内容展开/收起
  const toggleContent = () => {
    setShowFullContent(!showFullContent);
  };

  // 处理卡片点击
  const handleCardClick = e => {
    // 如果点击的是按钮或链接，不触发卡片点击
    if (e.target.closest('button') || e.target.closest('a')) {
      return;
    }
    if (onView) {
      onView(story);
    }
  };

  // 紧凑模式样式
  if (compact) {
    return <div className={`bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-4 hover:border-slate-600 transition-all duration-300 cursor-pointer ${className}`} onClick={handleCardClick}>
        <div className="flex items-start space-x-4">
          {/* 缩略图 */}
          {story.image && <div className="flex-shrink-0">
              <StoryImage src={story.image} alt={story.title} className="w-16 h-16 rounded-lg object-cover" />
            </div>}
          
          {/* 内容 */}
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold text-sm mb-1 truncate">
              {story.title || '无标题'}
            </h3>
            <p className="text-slate-400 text-xs mb-2 line-clamp-2">
              {truncateText(story.content, 80)}
            </p>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center space-x-3">
                {story.author && <span className="flex items-center">
                    <User className="w-3 h-3 mr-1" />
                    {story.author}
                  </span>}
                <span className="flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {getReadTime()}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                {story.view_count !== undefined && <span className="flex items-center">
                    <Eye className="w-3 h-3 mr-1" />
                    {story.view_count}
                  </span>}
                <button onClick={handleLike} disabled={isLoading} className={`flex items-center transition-colors ${isLiked ? 'text-red-400' : 'text-slate-500 hover:text-red-400'}`}>
                  <Heart className={`w-3 h-3 mr-1 ${isLiked ? 'fill-current' : ''}`} />
                  {story.like_count || 0}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>;
  }

  // 完整模式
  return <div className={`bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden hover:border-slate-600 transition-all duration-300 hover:shadow-lg hover:shadow-slate-900/20 ${className}`} onClick={handleCardClick}>
      {/* 图片区域 */}
      {story.image && <div className="relative h-48 overflow-hidden">
          <StoryImage src={story.image} alt={story.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          
          {/* 右上角操作按钮 */}
          {showActions && <div className="absolute top-3 right-3">
              <StoryActions story={story} onEdit={onEdit} onDelete={onDelete} onShare={handleShare} />
            </div>}
          
          {/* 底部信息 */}
          <div className="absolute bottom-3 left-3 right-3">
            <h2 className="text-white font-bold text-lg mb-1 line-clamp-2">
              {story.title || '无标题'}
            </h2>
            <div className="flex items-center text-white/80 text-sm space-x-4">
              {story.author && <span className="flex items-center">
                  <User className="w-4 h-4 mr-1" />
                  {story.author}
                </span>}
              <span className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {getReadTime()}
              </span>
            </div>
          </div>
        </div>}

      {/* 内容区域 */}
      <div className="p-6">
        {/* 元信息 */}
        <div className="flex items-center justify-between text-sm text-slate-400 mb-4">
          <div className="flex items-center space-x-4">
            {story.date && <span className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {story.date}
              </span>}
            {story.location && <span className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                {story.location}
              </span>}
          </div>
          <span className="text-xs">
            {formatDate(story.createdAt)}
          </span>
        </div>

        {/* 故事内容 */}
        <div className="mb-4">
          <p className="text-slate-300 leading-relaxed">
            {showFullContent ? story.content : truncateText(story.content)}
          </p>
          {story.content && story.content.length > 150 && <button onClick={toggleContent} className="text-red-400 hover:text-red-300 text-sm mt-2 transition-colors">
              {showFullContent ? '收起' : '展开阅读'}
            </button>}
        </div>

        {/* 标签 */}
        {story.tags && story.tags.length > 0 && <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {story.tags.map((tag, index) => <span key={index} className="px-2 py-1 bg-slate-700/50 text-slate-300 text-xs rounded-full border border-slate-600">
                  <Tag className="w-3 h-3 inline mr-1" />
                  {tag}
                </span>)}
            </div>
          </div>}

        {/* 统计信息 */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-700">
          <div className="flex items-center space-x-6 text-sm text-slate-400">
            {story.view_count !== undefined && <span className="flex items-center">
                <Eye className="w-4 h-4 mr-1" />
                {story.view_count} 次查看
              </span>}
            {story.like_count !== undefined && <span className="flex items-center">
                <Heart className="w-4 h-4 mr-1" />
                {story.like_count} 次点赞
              </span>}
            {story.share_count !== undefined && <span className="flex items-center">
                <Share2 className="w-4 h-4 mr-1" />
                {story.share_count} 次分享
              </span>}
          </div>

          {/* 操作按钮 */}
          <div className="flex items-center space-x-2">
            <button onClick={handleLike} disabled={isLoading} className={`flex items-center px-3 py-1 rounded-lg transition-all ${isLiked ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700 hover:text-red-400 border border-slate-600'}`}>
              <Heart className={`w-4 h-4 mr-1 ${isLiked ? 'fill-current' : ''}`} />
              {isLiked ? '已点赞' : '点赞'}
            </button>
            
            <button onClick={handleShare} className="flex items-center px-3 py-1 rounded-lg bg-slate-700/50 text-slate-400 hover:bg-slate-700 hover:text-blue-400 border border-slate-600 transition-all">
              <Share2 className="w-4 h-4 mr-1" />
              分享
            </button>
            
            {onView && <button onClick={handleView} className="flex items-center px-3 py-1 rounded-lg bg-slate-700/50 text-slate-400 hover:bg-slate-700 hover:text-green-400 border border-slate-600 transition-all">
                <ExternalLink className="w-4 h-4 mr-1" />
                查看详情
              </button>}
          </div>
        </div>
      </div>
    </div>;
}