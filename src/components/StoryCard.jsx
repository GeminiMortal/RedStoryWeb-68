// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Button, Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui';
// @ts-ignore;
import { Edit, Trash2, Eye, Clock, Calendar, User, Heart, Share2 } from 'lucide-react';
// @ts-ignore;
import { cn } from '@/lib/utils';

export function StoryCard({
  story,
  type = 'published',
  onEdit,
  onDelete,
  onView,
  index = 0
}) {
  const [navigating, setNavigating] = useState(false);
  const formatDate = timestamp => {
    if (!timestamp) return '未知时间';
    return new Date(timestamp).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };
  const formatRelativeTime = timestamp => {
    if (!timestamp) return '未知时间';
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now - past;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) {
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        return `${diffMinutes}分钟前`;
      }
      return `${diffHours}小时前`;
    } else if (diffDays === 1) {
      return '昨天';
    } else if (diffDays < 7) {
      return `${diffDays}天前`;
    } else {
      return formatDate(timestamp);
    }
  };
  const truncateContent = (content, maxLength = 100) => {
    if (!content) return '暂无内容';
    return content.length > maxLength ? content.substring(0, maxLength) + '...' : content;
  };

  // 优化的导航函数
  const handleNavigate = async (action, ...args) => {
    if (navigating) return;
    try {
      setNavigating(true);
      // 添加短暂延迟以提供视觉反馈
      await new Promise(resolve => setTimeout(resolve, 100));
      action(...args);
    } catch (error) {
      console.error('操作失败:', error);
    } finally {
      setNavigating(false);
    }
  };
  return <div className={cn("group animate-fade-in card-hover", "bg-slate-800/50 backdrop-blur-sm border border-slate-700/50", "rounded-2xl overflow-hidden shadow-xl", "transition-all duration-300 hover:border-red-500/50", "hover:shadow-2xl hover:shadow-red-500/10", "mobile-card", "relative")} style={{
    animationDelay: `${index * 100}ms`
  }}>
      {/* 状态指示器 */}
      <div className={cn("absolute top-3 right-3 z-10", "px-2 py-1 rounded-full text-xs font-medium", "backdrop-blur-sm border", type === 'published' ? "bg-green-500/20 border-green-500/30 text-green-400" : "bg-blue-500/20 border-blue-500/30 text-blue-400")}>
        {type === 'published' ? '已发布' : '草稿'}
      </div>

      {/* 图片区域 */}
      {story.image && <div className="aspect-video overflow-hidden relative">
          <img src={story.image} alt={story.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" onError={e => {
        e.target.style.display = 'none';
      }} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {/* 悬停操作按钮 */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex space-x-2">
              {type === 'published' && <button onClick={() => handleNavigate(onView, story._id)} disabled={navigating} className="bg-white/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/30 transition-all duration-200 button-press">
                  <Eye className="w-4 h-4" />
                </button>}
              <button onClick={() => handleNavigate(onEdit, story._id, type === 'draft')} disabled={navigating} className="bg-blue-500/20 backdrop-blur-sm text-blue-400 p-2 rounded-full hover:bg-blue-500/30 transition-all duration-200 button-press">
                <Edit className="w-4 h-4" />
              </button>
              <button onClick={() => handleNavigate(onDelete, story._id, type === 'draft')} disabled={navigating} className="bg-red-500/20 backdrop-blur-sm text-red-400 p-2 rounded-full hover:bg-red-500/30 transition-all duration-200 button-press">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>}

      <CardHeader className={cn("p-5 pb-3", story.image && "pt-4")}>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-white text-lg line-clamp-2 group-hover:text-red-400 transition-colors duration-300 mb-2">
              {story.title || (type === 'draft' ? '无标题草稿' : '无标题')}
            </CardTitle>
            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-400">
              <span className="flex items-center gap-1 bg-slate-700/50 px-2 py-1 rounded-full">
                <User className="w-3 h-3" />
                {story.author || story.draftOwner || '佚名'}
              </span>
              <span className="flex items-center gap-1 bg-slate-700/50 px-2 py-1 rounded-full">
                <Calendar className="w-3 h-3" />
                {formatRelativeTime(story.createdAt || story.lastSavedAt)}
              </span>
              {story.read_time && <span className="flex items-center gap-1 bg-slate-700/50 px-2 py-1 rounded-full">
                  <Clock className="w-3 h-3" />
                  {story.read_time}
                </span>}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="px-5 pb-5">
        <p className="text-slate-300 text-sm mb-4 line-clamp-3 leading-relaxed">
          {truncateContent(story.content)}
        </p>
        
        {story.tags && story.tags.length > 0 && <div className="flex flex-wrap gap-1 mb-4">
            {story.tags.slice(0, 3).map((tag, index) => <span key={index} className={cn("px-2 py-1 text-xs rounded-full transition-all duration-200", "hover:scale-105 cursor-pointer", type === 'published' ? "bg-red-900/30 text-red-300 hover:bg-red-900/50 border border-red-500/20" : "bg-blue-900/30 text-blue-300 hover:bg-blue-900/50 border border-blue-500/20")}>
                {tag}
              </span>)}
          </div>}

        {/* 统计信息 */}
        {type === 'published' && <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
            <div className="flex items-center space-x-3">
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {story.views || 0}
              </span>
              <span className="flex items-center gap-1">
                <Heart className="w-3 h-3" />
                {story.likes || 0}
              </span>
            </div>
            <span className="text-slate-600">
              {formatDate(story.updatedAt)}
            </span>
          </div>}

        {/* 操作按钮 */}
        <div className="flex gap-2">
          {type === 'published' && <Button size="sm" variant="outline" onClick={() => handleNavigate(onView, story._id)} disabled={navigating} className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white transition-all duration-200 button-press flex-1">
              <Eye className="w-3 h-3 mr-1" />
              查看
            </Button>}
          <Button size="sm" onClick={() => handleNavigate(onEdit, story._id, type === 'draft')} disabled={navigating} className="bg-blue-600 hover:bg-blue-700 transition-all duration-200 button-press flex-1">
            <Edit className="w-3 h-3 mr-1" />
            编辑
          </Button>
          <Button size="sm" variant="destructive" onClick={() => handleNavigate(onDelete, story._id, type === 'draft')} disabled={navigating} className="bg-red-600 hover:bg-red-700 transition-all duration-200 button-press">
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </CardContent>
    </div>;
}