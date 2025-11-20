// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button } from '@/components/ui';
// @ts-ignore;
import { ArrowLeft, Calendar, MapPin, Users, Clock, Share2, Heart } from 'lucide-react';

export default function Detail(props) {
  const {
    $w,
    page
  } = props;
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLiked, setIsLiked] = useState(false);

  // 安全获取页面参数
  const storyId = page?.dataset?.params?.id;

  // 从数据模型加载红色故事详情
  useEffect(() => {
    const loadStory = async () => {
      if (!storyId) {
        setError('缺少故事ID参数');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const result = await $w.cloud.callDataSource({
          dataSourceName: 'red_story',
          methodName: 'wedaGetRecordsV2',
          params: {
            filter: {
              where: {
                _id: {
                  $eq: storyId
                }
              }
            },
            select: {
              $master: true // 返回所有字段
            },
            getCount: true,
            pageSize: 1 // 只获取一条记录
          }
        });
        if (result.records && result.records.length > 0) {
          const record = result.records[0];
          // 将数据库字段映射为前端所需格式
          const mappedStory = {
            id: record._id,
            title: record.title,
            content: record.content,
            image: record.image,
            date: record.date,
            location: record.location,
            author: record.author,
            readTime: record.read_time,
            tags: record.tags || [],
            status: record.status,
            order: record.order,
            createdAt: record.createdAt,
            updatedAt: record.updatedAt
          };
          setStory(mappedStory);
        } else {
          setError('未找到指定的红色故事');
        }
      } catch (err) {
        console.error('加载红色故事详情失败:', err);
        setError('加载红色故事详情失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };
    loadStory();
  }, [storyId, $w]);
  const goBack = () => {
    $w.utils.navigateBack();
  };
  const handleShare = () => {
    // 模拟分享功能
    if (navigator.share) {
      navigator.share({
        title: story?.title,
        text: story?.content?.substring(0, 100) + '...',
        url: window.location.href
      });
    } else {
      // 降级处理：复制链接到剪贴板
      navigator.clipboard.writeText(window.location.href);
      alert('链接已复制到剪贴板');
    }
  };
  const handleLike = () => {
    setIsLiked(!isLiked);
  };

  // 加载状态
  if (loading) {
    return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-400">加载红色故事详情中...</p>
        </div>
      </div>;
  }

  // 错误状态
  if (error) {
    return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-400 mb-4">{error}</h2>
          <Button onClick={goBack} className="bg-red-600 hover:bg-red-700 text-white">
            返回主页
          </Button>
        </div>
      </div>;
  }

  // 无数据状态
  if (!story) {
    return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-400 mb-4">故事未找到</h2>
          <Button onClick={goBack} className="bg-red-600 hover:bg-red-700 text-white">
            返回主页
          </Button>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-gray-900 text-white">
      {/* 背景装饰 */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-gray-900 to-gray-900"></div>
      
      {/* 顶部导航 */}
      <header className="relative z-10 bg-black/50 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button onClick={goBack} variant="ghost" className="text-gray-300 hover:text-white">
            <ArrowLeft className="w-5 h-5 mr-2" />
            返回主页
          </Button>
          <h1 className="text-xl font-bold text-red-600">红色故事详情</h1>
          <div className="flex gap-2">
            <Button onClick={handleShare} variant="ghost" className="text-gray-300 hover:text-white">
              <Share2 className="w-5 h-5" />
            </Button>
            <Button onClick={handleLike} variant="ghost" className={`${isLiked ? 'text-red-600' : 'text-gray-300'} hover:text-red-600`}>
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            </Button>
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        {/* 头图 */}
        <div className="mb-8 rounded-2xl overflow-hidden shadow-2xl relative">
          {story.image ? <img src={story.image} alt={story.title} className="w-full h-64 md:h-96 object-cover" /> : <div className="w-full h-64 md:h-96 bg-gradient-to-br from-red-900/30 to-gray-800/30 flex items-center justify-center">
              <div className="text-center text-gray-400">
                <div className="text-6xl mb-4">📖</div>
                <p>暂无配图</p>
              </div>
            </div>}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        </div>

        {/* 文章信息 */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-gray-700">
          {/* 标题 */}
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-6">
            {story.title}
          </h1>

          {/* 元信息 */}
          <div className="flex flex-wrap items-center gap-4 mb-8 text-sm text-gray-300">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {story.date}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {story.location}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {story.author || '佚名'}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {story.readTime || '5分钟'}
            </span>
          </div>

          {/* 标签 */}
          {story.tags && story.tags.length > 0 && <div className="flex flex-wrap gap-2 mb-8">
              {story.tags.map((tag, index) => <span key={index} className="px-3 py-1 bg-red-900/30 text-red-300 rounded-full text-sm">
                  {tag}
                </span>)}
            </div>}

          {/* 内容 */}
          <div className="prose prose-invert max-w-none">
            {story.content.split('\n\n').map((paragraph, index) => <p key={index} className="text-gray-200 leading-relaxed mb-6 text-lg">
                {paragraph}
              </p>)}
          </div>

          {/* 底部操作 */}
          <div className="flex items-center justify-between mt-12 pt-8 border-t border-gray-700">
            <div className="text-sm text-gray-400">
              革命精神永垂不朽 · 红色基因代代相传
            </div>
            <div className="flex gap-2">
              <Button onClick={handleShare} variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                <Share2 className="w-4 h-4 mr-2" />
                分享
              </Button>
              <Button onClick={handleLike} className={`${isLiked ? 'bg-red-600' : 'bg-gray-700'} hover:bg-red-700 text-white`}>
                <Heart className={`w-4 h-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
                {isLiked ? '已收藏' : '收藏'}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>;
}