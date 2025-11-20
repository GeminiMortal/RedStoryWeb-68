// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button, Card, CardContent, CardHeader, CardTitle, Badge, useToast } from '@/components/ui';
// @ts-ignore;
import { Clock, MapPin, User, BookOpen, Search, Filter, Plus } from 'lucide-react';

// @ts-ignore;
import { PageHeader, BottomNav } from '@/components/Navigation';
export default function IndexPage(props) {
  const {
    $w
  } = props;
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('all');
  const [allTags, setAllTags] = useState([]);
  const {
    toast
  } = useToast();
  const navigateTo = $w.utils.navigateTo;

  // 加载已发布故事
  useEffect(() => {
    loadStories();
  }, []);
  const loadStories = async () => {
    try {
      setLoading(true);
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();
      const result = await db.collection('red_story').where({
        status: 'published'
      }).orderBy('createdAt', 'desc').get();
      if (result && result.data) {
        setStories(result.data);
        // 提取所有标签
        const tags = new Set();
        result.data.forEach(story => {
          if (story.tags) {
            story.tags.forEach(tag => tags.add(tag));
          }
        });
        setAllTags(['all', ...Array.from(tags)]);
      }
    } catch (err) {
      console.error('加载故事失败:', err);
      toast({
        title: '加载失败',
        description: '无法加载故事列表',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  const filteredStories = stories.filter(story => {
    const matchesSearch = story.title.toLowerCase().includes(searchTerm.toLowerCase()) || story.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = selectedTag === 'all' || story.tags && story.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });
  const handleStoryClick = storyId => {
    navigateTo({
      pageId: 'detail',
      params: {
        id: storyId
      }
    });
  };
  const handleUploadClick = () => {
    navigateTo({
      pageId: 'upload',
      params: {}
    });
  };
  const formatDate = timestamp => {
    if (!timestamp) return '未知时间';
    const date = new Date(timestamp);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };
  if (loading) {
    return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-400">加载红色故事中...</p>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-gray-900 text-white">
      <PageHeader title="红色故事" showBack={false} />
      
      <main className="max-w-6xl mx-auto px-4 py-8 pb-24">
        {/* 搜索和筛选 */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input type="text" placeholder="搜索故事标题或内容..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-600" />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto">
            <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
            {allTags.map(tag => <button key={tag} onClick={() => setSelectedTag(tag)} className={`px-3 py-1 rounded-full text-sm whitespace-nowrap transition-colors ${selectedTag === tag ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}>
                {tag === 'all' ? '全部' : tag}
              </button>)}
          </div>
        </div>

        {/* 故事列表 */}
        {filteredStories.length === 0 ? <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-400 mb-2">暂无故事</h3>
            <p className="text-gray-500 mb-4">开始创建您的第一个红色故事吧</p>
            <Button onClick={handleUploadClick} className="bg-red-600 hover:bg-red-700">
              <Plus className="w-4 h-4 mr-2" />
              创建故事
            </Button>
          </div> : <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredStories.map(story => <Card key={story._id} className="bg-gray-800/50 backdrop-blur-sm border-gray-700 hover:border-red-600/50 transition-all cursor-pointer group" onClick={() => handleStoryClick(story._id)}>
                <CardHeader className="pb-3">
                  <div className="aspect-video overflow-hidden rounded-lg mb-3">
                    {story.image ? <img src={story.image} alt={story.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" /> : <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                        <BookOpen className="w-8 h-8 text-gray-500" />
                      </div>}
                  </div>
                  <CardTitle className="text-white text-lg line-clamp-2">{story.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400 text-sm line-clamp-3 mb-3">{story.content}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {story.author || '佚名'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {story.read_time || '5分钟'}
                    </span>
                  </div>
                  {story.location && <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
                      <MapPin className="w-3 h-3" />
                      {story.location}
                    </div>}
                  {story.tags && story.tags.length > 0 && <div className="flex flex-wrap gap-1 mt-3">
                      {story.tags.slice(0, 3).map((tag, index) => <Badge key={index} variant="outline" className="border-red-600/50 text-red-400 text-xs">
                          {tag}
                        </Badge>)}
                    </div>}
                </CardContent>
              </Card>)}
          </div>}
      </main>
      
      {/* 仅保留首页和上传两个底部导航 */}
      <BottomNav currentPage="index" navigateTo={navigateTo} />
    </div>;
}