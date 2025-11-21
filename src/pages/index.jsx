// @ts-ignore;
import React, { useState, useEffect, useCallback } from 'react';
// @ts-ignore;
import { Button, Card, CardContent, CardHeader, CardTitle, Badge, useToast } from '@/components/ui';
// @ts-ignore;
import { BookOpen, Clock, User, Eye, Search, Filter, ChevronRight, Plus, Home, Settings, UserCircle, Menu, X } from 'lucide-react';
// @ts-ignore;
import { cn } from '@/lib/utils';

// @ts-ignore;
import { StoryCarousel } from '@/components/StoryCarousel';
// @ts-ignore;
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
export default function HomePage(props) {
  const {
    $w
  } = props;
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [featuredStories, setFeaturedStories] = useState([]);
  const [recentStories, setRecentStories] = useState([]);
  const {
    toast
  } = useToast();
  const navigateTo = $w.utils.navigateTo;

  // 统一的数据模型调用
  const loadStories = useCallback(async () => {
    try {
      setLoading(true);
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();

      // 使用标准字段名
      const result = await db.collection('red_story').where({
        status: 'published'
      }).orderBy('publishedAt', 'desc').get();
      const storiesData = result.data || [];
      setStories(storiesData);

      // 设置精选故事（前3个）
      setFeaturedStories(storiesData.slice(0, 3));

      // 设置最近故事（前6个）
      setRecentStories(storiesData.slice(0, 6));
    } catch (error) {
      console.error('加载故事失败:', error);
      toast({
        title: '加载失败',
        description: error.message || '无法加载故事数据',
        variant: 'destructive',
        action: {
          label: '重试',
          onClick: loadStories
        }
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);
  useEffect(() => {
    loadStories();
  }, [loadStories]);

  // 统一字段处理
  const formatStory = story => ({
    id: story._id,
    title: story.title || '无标题',
    content: story.content || '',
    author: story.author || '佚名',
    category: story.category || '红色故事',
    publishedAt: story.publishedAt || story.createdAt || new Date(),
    views: story.views || 0,
    imageUrl: story.imageUrl || '',
    tags: story.tags || []
  });

  // 过滤逻辑
  const filteredStories = stories.filter(story => {
    const matchesSearch = !searchTerm || story.title?.toLowerCase().includes(searchTerm.toLowerCase()) || story.content?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || story.category === filterCategory;
    return matchesSearch && matchesCategory;
  });
  if (loading) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <LoadingSkeleton count={6} type="story" />
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <StoryCarousel stories={featuredStories} />
            <div className="mt-8">
              <h2 className="text-2xl font-bold text-white mb-4">最近故事</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recentStories.map(story => {
                const formatted = formatStory(story);
                return <Card key={formatted.id} className="bg-slate-800 border-slate-700 hover:bg-slate-700 transition-colors cursor-pointer" onClick={() => navigateTo(`/story/${formatted.id}`)}>
                      <CardHeader>
                        <CardTitle className="text-white">{formatted.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center space-x-4 text-sm text-slate-400">
                          <span className="flex items-center"><User className="w-4 h-4 mr-1" />{formatted.author}</span>
                          <span className="flex items-center"><Clock className="w-4 h-4 mr-1" />{new Date(formatted.publishedAt).toLocaleDateString()}</span>
                          <span className="flex items-center"><Eye className="w-4 h-4 mr-1" />{formatted.views}</span>
                        </div>
                      </CardContent>
                    </Card>;
              })}
              </div>
            </div>
          </div>
          <div className="lg:col-span-1">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">搜索与筛选</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input type="text" placeholder="搜索故事..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="all">所有分类</option>
                    <option value="红色故事">红色故事</option>
                    <option value="英雄事迹">英雄事迹</option>
                    <option value="革命历史">革命历史</option>
                  </select>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-slate-800 border-slate-700 mt-4">
              <CardHeader>
                <CardTitle className="text-white">热门标签</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {['红色故事', '英雄事迹', '革命历史', '抗战', '长征'].map(tag => <Badge key={tag} variant="secondary" className="cursor-pointer hover:bg-blue-600">
                      {tag}
                    </Badge>)}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>;
}