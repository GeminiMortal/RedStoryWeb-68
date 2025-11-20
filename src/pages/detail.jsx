// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button } from '@/components/ui';
// @ts-ignore;
import { ArrowLeft, Edit, Trash2, Share2, Heart, Clock, Calendar, MapPin, User, Eye, BookOpen } from 'lucide-react';

// @ts-ignore;
import { PageHeader, BottomNav } from '@/components/Navigation';
export default function DetailPage(props) {
  const {
    $w
  } = props;
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 修正参数访问方式
  const storyId = $w.page.dataset.params?.id;

  // 加载故事详情
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
          setStory(result.data);
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
  const navigateTo = $w.utils.navigateTo;
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
          <p className="text-gray-400">加载故事中...</p>
        </div>
      </div>;
  }
  if (error || !story) {
    return <div className="min-h-screen bg-gray-900 text-white">
        <PageHeader title="故事详情" showBack={true} onBack={goBack} />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-red-900/20 border border-red-600/50 rounded-lg p-8 text-center">
            <BookOpen className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">加载失败</h2>
            <p className="text-gray-400">{error || '故事不存在'}</p>
            <Button onClick={goBack} className="mt-4 bg-red-600 hover:bg-red-700">
              返回首页
            </Button>
          </div>
        </main>
        <BottomNav currentPage="detail" navigateTo={navigateTo} />
      </div>;
  }
  return <div className="min-h-screen bg-gray-900 text-white">
      <PageHeader title={story.title} showBack={true} onBack={goBack} />
      
      <main className="max-w-4xl mx-auto px-4 py-8 pb-24">
        <article className="bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700">
          {/* 故事图片 */}
          {story.image && <div className="relative h-64 md:h-96">
              <img src={story.image} alt={story.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            </div>}
          
          {/* 故事内容 */}
          <div className="p-6 md:p-8">
            {/* 标题和元信息 */}
            <div className="mb-6">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">{story.title}</h1>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                <span className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {story.author || '佚名'}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {formatDate(story.createdAt)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {story.read_time || '5分钟阅读'}
                </span>
                {story.location && <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {story.location}
                  </span>}
              </div>

              {story.tags && story.tags.length > 0 && <div className="flex flex-wrap gap-2 mt-4">
                  {story.tags.map((tag, index) => <span key={index} className="px-3 py-1 bg-red-900/30 text-red-300 text-sm rounded-full border border-red-800/50">
                      {tag}
                    </span>)}
                </div>}
            </div>

            {/* 故事正文 */}
            <div className="prose prose-invert max-w-none">
              <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{story.content}</p>
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-3 mt-8 pt-6 border-t border-gray-700">
              <Button onClick={goBack} variant="outline" className="border-gray-600 text-gray-300">
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回
              </Button>
              <Button onClick={goToEdit} className="bg-red-600 hover:bg-red-700">
                <Edit className="w-4 h-4 mr-2" />
                编辑
              </Button>
              <Button variant="outline" className="border-gray-600 text-gray-300">
                <Share2 className="w-4 h-4 mr-2" />
                分享
              </Button>
              <Button variant="outline" className="border-gray-600 text-gray-300">
                <Heart className="w-4 h-4 mr-2" />
                收藏
              </Button>
            </div>
          </div>
        </article>
      </main>
      
      <BottomNav currentPage="detail" navigateTo={navigateTo} />
    </div>;
}