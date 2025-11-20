// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button, Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui';
// @ts-ignore;
import { BookOpen, Clock, MapPin, User, Eye, Plus, Search } from 'lucide-react';

// @ts-ignore;
import { Sidebar } from '@/components/Sidebar';
export default function HomePage(props) {
  const {
    $w
  } = props;
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigateTo = $w.utils.navigateTo;
  useEffect(() => {
    loadStories();
  }, []);
  const loadStories = async () => {
    try {
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();
      const result = await db.collection('red_story').where({
        status: 'published'
      }).orderBy('createdAt', 'desc').get();
      if (result && result.data) {
        setStories(result.data);
      }
    } catch (error) {
      console.error('加载故事失败:', error);
    } finally {
      setLoading(false);
    }
  };
  const filteredStories = stories.filter(story => story.title.toLowerCase().includes(searchTerm.toLowerCase()) || story.content.toLowerCase().includes(searchTerm.toLowerCase()));
  const formatDate = timestamp => {
    if (!timestamp) return '未知时间';
    return new Date(timestamp).toLocaleDateString('zh-CN');
  };
  return <div className="min-h-screen bg-gray-900 text-white flex">
      <Sidebar currentPage="index" navigateTo={navigateTo} />
      
      <div className="flex-1 ml-64">
        {/* 头部 */}
        <header className="bg-gray-800/80 backdrop-blur-sm border-b border-gray-700">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-white">红色故事</h1>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input type="text" placeholder="搜索故事..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500" />
                </div>
                <Button onClick={() => navigateTo({
                pageId: 'upload',
                params: {}
              })} className="bg-red-600 hover:bg-red-700">
                  <Plus className="w-4 h-4 mr-2" />
                  新建故事
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* 主要内容 */}
        <main className="max-w-7xl mx-auto px-6 py-8">
          {loading ? <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            </div> : filteredStories.length === 0 ? <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-400 mb-2">暂无故事</h3>
              <p className="text-gray-500 mb-4">开始创建您的第一个红色故事吧</p>
              <Button onClick={() => navigateTo({
            pageId: 'upload',
            params: {}
          })} className="bg-red-600 hover:bg-red-700">
                <Plus className="w-4 h-4 mr-2" />
                创建故事
              </Button>
            </div> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStories.map(story => <Card key={story._id} className="bg-gray-800/50 border-gray-700 hover:border-red-600 transition-colors">
                  {story.image && <div className="aspect-video overflow-hidden rounded-t-lg">
                      <img src={story.image} alt={story.title} className="w-full h-full object-cover" />
                    </div>}
                  <CardHeader>
                    <CardTitle className="text-white text-lg">{story.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                      {story.content}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center">
                          <User className="w-4 h-4 mr-1" />
                          {story.author || '佚名'}
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {formatDate(story.createdAt)}
                        </span>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => navigateTo({
                  pageId: 'detail',
                  params: {
                    id: story._id
                  }
                })} className="text-red-400 hover:text-red-300">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>)}
            </div>}
        </main>
      </div>
    </div>;
}