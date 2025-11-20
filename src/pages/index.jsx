// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button, Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui';
// @ts-ignore;
import { BookOpen, Clock, MapPin, User, Eye, Plus, Search } from 'lucide-react';

// @ts-ignore;
import { Sidebar } from '@/components/Sidebar';
// @ts-ignore;
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
// @ts-ignore;
import { MobileBottomNav } from '@/components/MobileBottomNav';
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
      setLoading(true);
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();

      // 修正：使用正确的字段名和查询条件
      const result = await db.collection('red_story').where({
        status: 'published'
      }).orderBy('createdAt', 'desc').limit(20).get();
      if (result && result.data) {
        setStories(result.data);
      }
    } catch (error) {
      console.error('加载故事失败:', error);
      toast({
        title: '加载失败',
        description: '无法加载故事列表',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // 修正：使用正确的字段名进行搜索
  const filteredStories = stories.filter(story => (story.title || '').toLowerCase().includes(searchTerm.toLowerCase()) || (story.content || '').toLowerCase().includes(searchTerm.toLowerCase()));
  const formatDate = timestamp => {
    if (!timestamp) return '未知时间';
    return new Date(timestamp).toLocaleDateString('zh-CN');
  };
  return <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <Sidebar currentPage="index" navigateTo={navigateTo} />
      
      {/* 移动端顶部导航 */}
      <div className="md:hidden bg-gray-800/90 backdrop-blur-sm border-b border-gray-700 px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">红色故事</h1>
      </div>

      {/* 主内容区域 */}
      <div className="flex-1 transition-all duration-300 ease-in-out md:ml-0">
        {/* 桌面端头部 */}
        <header className="hidden md:block bg-gray-800/90 backdrop-blur-sm border-b border-gray-700">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
                红色故事
              </h1>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input type="text" placeholder="搜索故事..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all" />
                </div>
                <Button onClick={() => navigateTo({
                pageId: 'upload',
                params: {}
              })} className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-red-500/25 transition-all duration-300 transform hover:scale-105">
                  <Plus className="w-4 h-4 mr-2" />
                  新建故事
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* 移动端搜索 */}
        <div className="md:hidden p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input type="text" placeholder="搜索故事..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500" />
          </div>
        </div>

        {/* 主要内容 */}
        <main className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-8 pb-24 md:pb-8">
          {loading ? <LoadingSkeleton type="card" count={6} /> : filteredStories.length === 0 ? <div className="text-center py-12 animate-fade-in">
              <BookOpen className="w-20 h-20 text-gray-600 mx-auto mb-4 animate-bounce" />
              <h3 className="text-xl font-medium text-gray-400 mb-2">
                {searchTerm ? '未找到相关故事' : '暂无故事'}
              </h3>
              <p className="text-gray-500 mb-6">
                {searchTerm ? '尝试其他关键词' : '开始创建您的第一个红色故事吧'}
              </p>
              {!searchTerm && <Button onClick={() => navigateTo({
            pageId: 'upload',
            params: {}
          })} className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-red-500/25 transition-all duration-300 transform hover:scale-105">
                  <Plus className="w-4 h-4 mr-2" />
                  创建故事
                </Button>}
            </div> : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {filteredStories.map((story, index) => <div key={story._id} className="bg-gray-800/50 backdrop-blur-sm border-gray-700 hover:border-red-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-red-500/10 hover:-translate-y-1 animate-fade-in" style={{
            animationDelay: `${index * 100}ms`
          }}>
                  <Card>
                    {story.image && <div className="aspect-video overflow-hidden rounded-t-lg">
                        <img src={story.image} alt={story.title} className="w-full h-full object-cover transition-transform duration-300 hover:scale-110" onError={e => {
                  e.target.style.display = 'none';
                }} />
                      </div>}
                    <CardHeader>
                      <CardTitle className="text-white text-lg line-clamp-2">
                        {story.title || '无标题'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                        {story.content || '暂无内容'}
                      </p>
                      
                      {story.tags && story.tags.length > 0 && <div className="flex flex-wrap gap-1 mb-3">
                          {story.tags.slice(0, 3).map((tag, idx) => <Badge key={idx} variant="outline" className="border-red-500/30 text-red-400 text-xs">
                              {tag}
                            </Badge>)}
                        </div>}

                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-3">
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
                  })} className="text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>)}
            </div>}
        </main>
      </div>

      <MobileBottomNav currentPage="index" navigateTo={navigateTo} />
    </div>;
}