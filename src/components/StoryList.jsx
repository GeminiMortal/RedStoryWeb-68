// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Card, CardContent, Button } from '@/components/ui';
// @ts-ignore;
import { User, Calendar, Eye, Edit3, BookOpen } from 'lucide-react';

export function StoryList({
  stories,
  onViewDetail,
  onEditStory
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
  if (stories.length === 0) {
    return <div className="mb-8">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center">
          <BookOpen className="w-5 h-5 mr-2 text-green-500" />
          已发布故事 (0)
        </h2>
        <div className="text-center py-8 bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/30">
          <BookOpen className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">暂无已发布的故事</p>
        </div>
      </div>;
  }
  return <div className="mb-8">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center">
        <BookOpen className="w-5 h-5 mr-2 text-green-500" />
        已发布故事 ({stories.length})
      </h2>
      <div className="space-y-4">
        {stories.map(story => <Card key={story._id} className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 hover:border-green-500/50 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-2">{story.title || '无标题'}</h3>
                  <p className="text-slate-400 text-sm mb-3 line-clamp-2">{story.content || '暂无内容'}</p>
                  <div className="flex items-center space-x-4 text-xs text-slate-500">
                    <span className="flex items-center">
                      <User className="w-3 h-3 mr-1" />
                      {story.author || '佚名'}
                    </span>
                    <span className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {formatDate(story.updatedAt)}
                    </span>
                    <span className="flex items-center">
                      <Eye className="w-3 h-3 mr-1" />
                      {story.views || 0}次阅读
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <Button onClick={e => onViewDetail(story._id, e)} variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button onClick={e => onEditStory(story._id, e)} variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                    <Edit3 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>)}
      </div>
    </div>;
}