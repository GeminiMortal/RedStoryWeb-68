// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button, Badge } from '@/components/ui';
// @ts-ignore;
import { ArrowLeft, Edit, Share2, Heart, Clock, Calendar, MapPin, User, Eye, BookOpen, Tag } from 'lucide-react';
// @ts-ignore;
import { cn } from '@/lib/utils';

// @ts-ignore;
import { Sidebar } from '@/components/Sidebar';
export default function DetailPage(props) {
  const {
    $w
  } = props;
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const navigateTo = $w.utils.navigateTo;
  const storyId = $w.page.dataset.params.id;
  useEffect(() => {
    const loadStory = async () => {
      if (!storyId) {
        setError('故事ID不能为空');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const tcb = await $w.cloud.getCloudInstance();
        const db = tcb.database();
        const result = await db.collection('red_story').doc(storyId).get();
        if (result && result.data) {
          if (result.data.status === 'published') {
            setStory(result.data);
          } else {
            setError('该故事尚未发布或已被下架');
          }
        } else {
          setError('故事不存在');
        }
      } catch (err) {
        console.error('加载故事失败:', err);
        setError(`加载失败: ${err.message || '未知错误'}`);
      } finally {
        setLoading(false);
      }
    };
    if (storyId) {
      loadStory();
    } else {
      setLoading(false);
      setError('未提供故事ID');
    }
  }, [storyId]);
  const goBack = () => {
    navigateTo({
      pageId: 'index',
      params: {}
    });
  };
  const goToEdit = () => {
    if (!storyId) return;
    navigateTo({
      pageId: 'edit',
      params: {
        id: storyId
      }
    });
  };
  const handleLike = () => {
    setIsLiked(!isLiked);
  };
  const formatDate = timestamp => {
    if (!timestamp) return '未知时间';
    return new Date(timestamp).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  if (loading) {
    return <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        <Sidebar currentPage="detail" navigateTo={navigateTo} />
        <div className="flex-1 transition-all duration-300 ease-in-out flex items-center justify-center">
          <div className="text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
              <div className="absolute inset-0 animate-ping rounded-full h-12 w-12 border border-red-600 opacity-20"></div>
            </div>
            <p className="text-gray-400 mt-4">加载故事中...</p>
          </div>
        </div>
      </div>;
  }
  if (error || !story) {
    return <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        <Sidebar currentPage="detail" navigateTo={navigateTo} />
        <div className="flex-1 transition-all duration-300 ease-in-out">
          <header className="bg-gray-800/80 backdrop-blur-sm border-b border-gray-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <button onClick={goBack} className="flex items-center text-gray-300 hover:text-white transition-colors">
                <ArrowLeft className="w-5 h-5 mr-2" />
                返回
              </button>
            </div>
          </header>
          
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-red-900/20 border border-red-600/50 rounded-xl p-8 text-center backdrop-blur-sm">
              <BookOpen className="w-16 h-16 text-red-400 mx-auto mb-4 animate-bounce" />
              <h2 className="text-xl font-semibold text-white mb-2">加载失败</h2>
              <p className="text-gray-400 mb-4">{error || '故事不存在'}</p>
              <Button onClick={goBack} className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 transition-all duration-200 transform hover:scale-105">
                返回首页
              </Button>
            </div>
          </main>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <Sidebar currentPage="detail" navigateTo={navigateTo} />
      
      <div className="flex-1 transition-all duration-300 ease-in-out">
        {/* 故事头部 */}
        <header className="relative">
          {story.image && <div className="absolute inset-0 h-96">
              <img src={story.image} alt={story.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent"></div>
            </div>}
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <button onClick={goBack} className="flex items-center text-gray-300 hover:text-white transition-colors mb-4">
              <ArrowLeft className="w-5 h-5 mr-2" />
              返回列表
            </button>
            
            <div className={story.image ? "pt-64" : "pt-4"}>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                {story.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300">
                <span className="flex items-center gap-1 bg-gray-800/50 px-3 py-1 rounded-full">
                  <User className="w-4 h-4" />
                  {story.author || '佚名'}
                </span>
                <span className="flex items-center gap-1 bg-gray-800/50 px-3 py-1 rounded-full">
                  <Calendar className="w-4 h-4" />
                  {formatDate(story.createdAt)}
                </span>
                <span className="flex items-center gap-1 bg-gray-800/50 px-3 py-1 rounded-full">
                  <Clock className="w-4 h-4" />
                  {story.read_time || '5分钟阅读'}
                </span>
                {story.location && <span className="flex items-center gap-1 bg-gray-800/50 px-3 py-1 rounded-full">
                    <MapPin className="w-4 h-4" />
                    {story.location}
                  </span>}
              </div>

              {story.tags && story.tags.length > 0 && <div className="flex flex-wrap gap-2 mt-4">
                  {story.tags.map((tag, index) => <Badge key={index} variant="outline" className="border-red-500/50 text-red-400 bg-red-500/10">
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </Badge>)}
                </div>}
            </div>
          </div>
        </header>

        {/* 故事内容 */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <article className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 md:p-8 shadow-2xl">
            <div className="prose prose-invert prose-lg max-w-none">
              <p className="text-gray-300 leading-relaxed whitespace-pre-wrap text-lg">
                {story.content}
              </p>
            </div>

            {/* 操作按钮 */}
            <div className="flex flex-wrap gap-3 mt-8 pt-8 border-t border-gray-700/50">
              <Button onClick={goBack} variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700/50 transition-all duration-200">
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回
              </Button>
              <Button onClick={goToEdit} className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 transition-all duration-200 transform hover:scale-105">
                <Edit className="w-4 h-4 mr-2" />
                编辑
              </Button>
              <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700/50 transition-all duration-200">
                <Share2 className="w-4 h-4 mr-2" />
                分享
              </Button>
              <Button onClick={handleLike} variant={isLiked ? "default" : "outline"} className={cn("transition-all duration-200", isLiked ? "bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700" : "border-gray-600 text-gray-300 hover:bg-gray-700/50")}>
                <Heart className={cn("w-4 h-4 mr-2", isLiked && "fill-current")} />
                {isLiked ? '已收藏' : '收藏'}
              </Button>
            </div>
          </article>
        </main>
      </div>
    </div>;
}