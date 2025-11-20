// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button } from '@/components/ui';
// @ts-ignore;
import { ArrowLeft, Edit, Share2, Heart, Clock, Calendar, MapPin, User, BookOpen } from 'lucide-react';
// @ts-ignore;
import { cn } from '@/lib/utils';

// @ts-ignore;
import { Sidebar } from '@/components/Sidebar';
// @ts-ignore;
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
// @ts-ignore;
import { MobileBottomNav } from '@/components/MobileBottomNav';
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
  const handleShare = async () => {
    if (navigator.share && story) {
      try {
        await navigator.share({
          title: story.title,
          text: story.content.substring(0, 100) + '...',
          url: window.location.href
        });
      } catch (err) {
        console.log('分享取消');
      }
    }
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
    return <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex">
        <Sidebar currentPage="detail" navigateTo={navigateTo} />
        <div className="flex-1 transition-all duration-300 ease-in-out p-4 md:p-8">
          <LoadingSkeleton type="detail" />
        </div>
      </div>;
  }
  if (error || !story) {
    return <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex">
        <Sidebar currentPage="detail" navigateTo={navigateTo} />
        <div className="flex-1 transition-all duration-300 ease-in-out">
          <header className="bg-gray-800/90 backdrop-blur-sm border-b border-gray-700 md:hidden">
            <div className="px-4 py-3">
              <button onClick={goBack} className="flex items-center text-gray-300 hover:text-white">
                <ArrowLeft className="w-5 h-5 mr-2" />
                返回
              </button>
            </div>
          </header>
          
          <main className="max-w-4xl mx-auto p-4 md:p-8">
            <div className="bg-red-900/20 border border-red-600/50 rounded-xl p-8 text-center animate-fade-in">
              <BookOpen className="w-20 h-20 text-red-400 mx-auto mb-4 animate-bounce" />
              <h2 className="text-2xl font-bold text-white mb-2">加载失败</h2>
              <p className="text-gray-400 mb-6">{error || '故事不存在'}</p>
              <Button onClick={goBack} className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-red-500/25 transition-all duration-300">
                返回首页
              </Button>
            </div>
          </main>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <Sidebar currentPage="detail" navigateTo={navigateTo} />
      
      {/* 移动端返回栏 */}
      <div className="md:hidden bg-gray-800/90 backdrop-blur-sm border-b border-gray-700 px-4 py-3 flex items-center">
        <button onClick={goBack} className="flex items-center text-gray-300 hover:text-white">
          <ArrowLeft className="w-5 h-5 mr-2" />
          返回
        </button>
      </div>

      <div className="flex-1 transition-all duration-300 ease-in-out">
        <main className="max-w-4xl mx-auto p-4 md:p-8 pb-24 md:pb-8">
          <article className="bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700 shadow-2xl">
            {story.image && <div className="relative h-48 md:h-64 lg:h-96">
                <img src={story.image} alt={story.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              </div>}
            
            <div className="p-6 md:p-8">
              <div className="mb-6 animate-fade-in">
                <h1 className="text-2xl md:text-4xl font-bold text-white mb-4 leading-tight">{story.title}</h1>
                
                <div className="flex flex-wrap items-center gap-3 md:gap-4 text-sm text-gray-400">
                  <span className="flex items-center bg-gray-700/50 px-3 py-1 rounded-full">
                    <User className="w-4 h-4 mr-1" />
                    {story.author || '佚名'}
                  </span>
                  <span className="flex items-center bg-gray-700/50 px-3 py-1 rounded-full">
                    <Calendar className="w-4 h-4 mr-1" />
                    {formatDate(story.createdAt)}
                  </span>
                  <span className="flex items-center bg-gray-700/50 px-3 py-1 rounded-full">
                    <Clock className="w-4 h-4 mr-1" />
                    {story.read_time || '5分钟阅读'}
                  </span>
                  {story.location && <span className="flex items-center bg-gray-700/50 px-3 py-1 rounded-full">
                      <MapPin className="w-4 h-4 mr-1" />
                      {story.location}
                    </span>}
                </div>

                {story.tags && story.tags.length > 0 && <div className="flex flex-wrap gap-2 mt-4">
                    {story.tags.map((tag, index) => <span key={index} className="px-3 py-1 bg-red-900/30 text-red-300 text-sm rounded-full border border-red-800/50 animate-fade-in" style={{
                  animationDelay: `${index * 0.1}s`
                }}>
                        {tag}
                      </span>)}
                  </div>}
              </div>

              <div className="prose prose-invert max-w-none">
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap text-base md:text-lg animate-fade-in">
                  {story.content}
                </p>
              </div>

              <div className="flex flex-wrap gap-3 mt-8 pt-6 border-t border-gray-700">
                <Button onClick={goBack} variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white transition-all">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  返回
                </Button>
                <Button onClick={goToEdit} className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-red-500/25 transition-all duration-300">
                  <Edit className="w-4 h-4 mr-2" />
                  编辑
                </Button>
                <Button onClick={handleShare} variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white transition-all">
                  <Share2 className="w-4 h-4 mr-2" />
                  分享
                </Button>
                <Button onClick={handleLike} variant="outline" className={isLiked ? 'bg-red-600 text-white border-red-600' : 'border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white'}>
                  <Heart className={cn("w-4 h-4 mr-2", isLiked && "fill-current")} />
                  {isLiked ? '已收藏' : '收藏'}
                </Button>
              </div>
            </div>
          </article>
        </main>
      </div>

      <MobileBottomNav currentPage="detail" navigateTo={navigateTo} />
    </div>;
}