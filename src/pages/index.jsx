// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button, Card, CardContent, CardHeader, CardTitle, Badge } from '@/components/ui';
// @ts-ignore;
import { BookOpen, Clock, MapPin, User, Eye, Plus, Search, TrendingUp, Heart } from 'lucide-react';

// @ts-ignore;
import { Sidebar } from '@/components/Sidebar';
export default function HomePage(props) {
  const {
    $w
  } = props;
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [featuredStory, setFeaturedStory] = useState(null);
  const navigateTo = $w.utils.navigateTo;
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
      }).orderBy('createdAt', 'desc').limit(20).get();
      if (result && result.data) {
        setStories(result.data);
        // 设置第一个故事为特色故事
        if (result.data.length > 0) {
          setFeaturedStory(result.data[0]);
        }
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
    return new Date(timestamp).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  const formatReadTime = readTime => {
    if (!readTime) return '5分钟阅读';
    return readTime;
  };
  return <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <Sidebar currentPage="index" navigateTo={navigateTo} />
      
      <div className="flex-1 transition-all duration-300 ease-in-out md:ml-0">
        {/* 英雄区域 */}
        <header className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-orange-600/20"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width=%2260%22%20height=%2260%22%20viewBox=%220%200%2060%2060%22%20xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg%20fill=%22none%22%20fill-rule=%22evenodd%22%3E%3Cg%20fill=%22%239C92AC%22%20fill-opacity=%220.05%22%3E%3Cpath%20d=%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent animate-pulse">
                红色故事
              </h1>
              <p className="mt-4 text-xl text-gray-300 max-w-2xl mx-auto">
                传承红色基因，讲述革命故事
              </p>
            </div>
          </div>
        </header>

        {/* 搜索栏 */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
          <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 shadow-xl">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input type="text" placeholder="搜索故事标题或内容..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-200" />
              </div>
              <Button onClick={() => navigateTo({
              pageId: 'upload',
              params: {}
            })} className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 transition-all duration-200 transform hover:scale-105">
                <Plus className="w-4 h-4 mr-2" />
                新建故事
              </Button>
            </div>
          </div>
        </div>

        {/* 主要内容 */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {loading ? <div className="flex justify-center items-center h-64">
              <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
                <div className="absolute inset-0 animate-ping rounded-full h-12 w-12 border border-red-600 opacity-20"></div>
              </div>
            </div> : filteredStories.length === 0 ? <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4 animate-bounce" />
              <h3 className="text-lg font-medium text-gray-400 mb-2">暂无故事</h3>
              <p className="text-gray-500 mb-4">开始创建您的第一个红色故事吧</p>
              <Button onClick={() => navigateTo({
            pageId: 'upload',
            params: {}
          })} className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 transition-all duration-200 transform hover:scale-105">
                <Plus className="w-4 h-4 mr-2" />
                创建故事
              </Button>
            </div> : <>
              {/* 特色故事 */}
              {featuredStory && !searchTerm && <div className="mb-8">
                  <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                    <TrendingUp className="w-6 h-6 mr-2 text-red-500" />
                    精选故事
                  </h2>
                  <Card className="bg-gradient-to-r from-gray-800/80 to-gray-700/80 border-gray-600 hover:border-red-500/50 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl">
                    <div className="grid md:grid-cols-2 gap-6">
                      {featuredStory.image && <div className="aspect-video overflow-hidden rounded-lg">
                          <img src={featuredStory.image} alt={featuredStory.title} className="w-full h-full object-cover transition-transform duration-300 hover:scale-110" />
                        </div>}
                      <div className="p-6">
                        <CardHeader>
                          <CardTitle className="text-2xl text-white mb-2">{featuredStory.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-300 mb-4 line-clamp-3">
                            {featuredStory.content}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 text-sm text-gray-400">
                              <span className="flex items-center">
                                <User className="w-4 h-4 mr-1" />
                                {featuredStory.author || '佚名'}
                              </span>
                              <span className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                {formatDate(featuredStory.createdAt)}
                              </span>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => navigateTo({
                        pageId: 'detail',
                        params: {
                          id: featuredStory._id
                        }
                      })} className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </div>
                    </div>
                  </Card>
                </div>}

              {/* 故事列表 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredStories.map((story, index) => <Card key={story._id} className="bg-gray-800/80 backdrop-blur-sm border-gray-600 hover:border-red-500/50 transition-all duration-300 transform hover:scale-105 hover:shadow-xl" style={{
              animationDelay: `${index * 100}ms`
            }}>
                    {story.image && <div className="aspect-video overflow-hidden rounded-t-lg">
                        <img src={story.image} alt={story.title} className="w-full h-full object-cover transition-transform duration-300 hover:scale-110" />
                      </div>}
                    <CardHeader>
                      <CardTitle className="text-white text-lg line-clamp-2">{story.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                        {story.content}
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
                  })} className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>)}
              </div>
            </>}
        </main>
      </div>
    </div>;
}