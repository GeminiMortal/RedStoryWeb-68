// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Button, Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui';
// @ts-ignore;
import { Edit3, Trash2, Eye, Send, User, Calendar, Clock, CheckSquare, Square } from 'lucide-react';
// @ts-ignore;
import { cn } from '@/lib/utils';

export function StoryCard({
  story,
  type = 'published',
  selected = false,
  onSelect,
  onEdit,
  onView,
  onPublish,
  onDelete,
  showCheckbox = false
}) {
  const formatDate = timestamp => {
    if (!timestamp) return '未知时间';
    try {
      return new Date(timestamp).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return '日期格式错误';
    }
  };
  const handleCardClick = e => {
    if (showCheckbox && e.target.closest('.checkbox-area')) {
      return;
    }
    if (type === 'published') {
      onView(story._id, e);
    }
  };
  return <Card className={cn("bg-slate-800/50 backdrop-blur-sm border transition-all duration-300 cursor-pointer", selected ? "border-blue-500/50 bg-blue-500/5" : "border-slate-700/50", type === 'published' ? "hover:border-green-500/50" : "hover:border-blue-500/50")} onClick={handleCardClick}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className={cn("flex items-start space-x-3 flex-1", showCheckbox && "space-x-3")}>
            {showCheckbox && <div className="checkbox-area">
                <Button onClick={() => onSelect(story._id)} variant="ghost" size="sm" className="mt-1 p-1">
                  {selected ? <CheckSquare className="w-4 h-4 text-blue-400" /> : <Square className="w-4 h-4 text-slate-400" />}
                </Button>
              </div>}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-2">{story.title}</h3>
              <p className="text-slate-400 text-sm mb-3 line-clamp-2">{story.content}</p>
              <div className="flex items-center space-x-4 text-xs text-slate-500">
                <span className="flex items-center">
                  <User className="w-3 h-3 mr-1" />
                  {story.author}
                </span>
                <span className="flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  {formatDate(story.updatedAt)}
                </span>
                {type === 'published' && <span className="flex items-center">
                    <Eye className="w-3 h-3 mr-1" />
                    {story.views}次阅读
                  </span>}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2 ml-4">
            {type === 'published' ? <>
                <Button onClick={e => onView(story._id, e)} variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                  <Eye className="w-4 h-4" />
                </Button>
                <Button onClick={e => onEdit(story._id, e)} variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                  <Edit3 className="w-4 h-4" />
                </Button>
                <Button onClick={e => onDelete(story._id, e)} variant="ghost" size="sm" className="text-slate-400 hover:text-red-400">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </> : <>
                <Button onClick={e => onEdit(story._id, e)} variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                  <Edit3 className="w-4 h-4" />
                </Button>
                <Button onClick={e => onPublish(story._id, e)} variant="ghost" size="sm" className="text-slate-400 hover:text-green-400">
                  <Send className="w-4 h-4" />
                </Button>
                <Button onClick={e => onDelete(story._id, e)} variant="ghost" size="sm" className="text-slate-400 hover:text-red-400">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </>}
          </div>
        </div>
      </CardContent>
    </Card>;
}