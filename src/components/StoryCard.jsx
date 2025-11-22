// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Button, Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui';
// @ts-ignore;
import { Edit, Trash2, Eye, Clock, Calendar, User } from 'lucide-react';
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
  return <div className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 hover:border-red-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-red-500/10 animate-fade-in card-hover hover-lift" style={{
    animationDelay: `${index * 100}ms`
  }}>
      <Card className="h-full border-0 bg-transparent">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardTitle className="text-white text-lg line-clamp-1 group-hover:text-red-400 transition-colors duration-300">
                {story.title || (type === 'draft' ? '无标题草稿' : '无标题')}
              </CardTitle>
              <div className="flex flex-wrap items-center gap-2 text-sm text-slate-400 mt-2">
                <span className="flex items-center gap-1 bg-slate-700/50 px-2 py-1 rounded-full">
                  <User className="w-3 h-3" />
                  {story.author || story.draftOwner || '佚名'}
                </span>
                <span className="flex items-center gap-1 bg-slate-700/50 px-2 py-1 rounded-full">
                  <Calendar className="w-3 h-3" />
                  {formatDate(story.createdAt || story.lastSavedAt)}
                </span>
                {story.read_time && <span className="flex items-center gap-1 bg-slate-700/50 px-2 py-1 rounded-full">
                    <Clock className="w-3 h-3" />
                    {story.read_time}
                  </span>}
                <Badge variant="outline" className={cn("text-xs border", type === 'published' ? "border-green-600/50 text-green-400 bg-green-500/10" : "border-blue-600/50 text-blue-400 bg-blue-500/10")}>
                  {type === 'published' ? '已发布' : '草稿'}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-slate-300 text-sm mb-4 line-clamp-2 leading-relaxed">
            {truncateContent(story.content)}
          </p>
          
          {story.tags && story.tags.length > 0 && <div className="flex flex-wrap gap-1 mb-4">
              {story.tags.slice(0, 3).map((tag, index) => <span key={index} className={cn("px-2 py-1 text-xs rounded-full transition-colors cursor-pointer", type === 'published' ? "bg-red-900/30 text-red-300 hover:bg-red-900/50" : "bg-blue-900/30 text-blue-300 hover:bg-blue-900/50")}>
                  {tag}
                </span>)}
            </div>}

          <div className="flex gap-2">
            {type === 'published' && <Button size="sm" variant="outline" onClick={() => onView(story._id)} className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white transition-all button-press touch-target">
                <Eye className="w-3 h-3 mr-1" />
                查看
              </Button>}
            <Button size="sm" onClick={() => onEdit(story._id, type === 'draft')} className="bg-blue-600 hover:bg-blue-700 transition-all button-press touch-target">
              <Edit className="w-3 h-3 mr-1" />
              编辑
            </Button>
            <Button size="sm" variant="destructive" onClick={() => onDelete(story._id, type === 'draft')} className="bg-red-600 hover:bg-red-700 transition-all button-press touch-target">
              <Trash2 className="w-3 h-3 mr-1" />
              删除
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>;
}