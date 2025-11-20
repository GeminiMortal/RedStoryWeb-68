// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button } from '@/components/ui';
// @ts-ignore;
import { ArrowLeft, Calendar, MapPin, Users, Clock, Tag, Share2, Heart, Eye, ImageOff, Edit } from 'lucide-react';

export default function DetailPage(props) {
  const {
    $w
  } = props;
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [liked, setLiked] = useState(false);

  // 从URL参数获取故事ID
  const storyId = props.$w.page.dataset.params.id;

  // 从数据模型加载故事详情
  useEffect(() => {
    if (!storyId) {
      setError('未提供故事ID');
      setLoading(false);
      return;
    }
    const loadStory = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('加载故事详情，ID:', storyId);
        const result = await $w.cloud.callDataSource({
          dataSourceName: 'red_story',
          methodName: 'wedaGetItemV2',
          params: {
            filter: {
              where: {
                _id: {
                  $eq: storyId
                }
              }
            },
            select: {
              $master: true
            }
          }
        });
        console.log('故事详情查询结果:', result);
        if (result) {
          const storyData = {
            id: result._id,
            title: result.title || '未命名故事',
            content: result.content || '',
            image: result.image || '',
            date: result.date || '',
            location: result.location || '',
            author: result.author || '佚名',
            readTime: result.read_time || '5分钟',
            tags: Array.isArray(result.tags) ? result.tags : [],
            status: result.status || 'draft',
            order: result.order || 0,
            createdAt: result.createdAt,
            updatedAt: result.updatedAt
          };
          setStory(storyData);
          setImageError(false);
        } else {
          setError('未找到该红色故事');
        }
      } catch (err) {
        console.error('加载故事详情失败:', err);
        setError(`加载失败: ${err.message || '未知错误'}`);
      } finally {
        setLoading(false);
      }
    };
    loadStory();
  }, [storyId, $w]);

  // 处理图片加载错误
  const handleImageError = () => {
    console.log('图片加载失败:', story?.image);
    setImageError(true);
  };

  // 处理图片加载成功
  const handleImageLoad = () => {
    setImageError(false);
  };

  // 分享功能
  const handleShare = async () => {
    if (navigator.share && story) {
      try {
        await navigator.share({
          title: story.title,
          text: story.content.substring(0, 100) + '...',
          url: window.location.href
        });
      } catch (err) {
        console.log('分享失败:', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href).then(() => {
        alert('链接已复制到剪贴板');
      });
    }
  };

  // 点赞功能
  const handleLike = () => {
    setLiked(!liked);
  };

  // 导航函数
  const goBack = () => {
    $w.utils.navigateBack();
  };
  const navigateToAdmin = () => {
    $w.utils.navigateTo({
      pageId: 'admin',
      params: {}
    });
  };
  const navigateToEdit = () => {
    if (!storyId) {
      setError('故事ID无效，无法编辑');
      return;
    }
    $w.utils.navigateTo({
      pageId: 'edit',
      params: {
        id: storyId
      }
    });
  };

  // 格式化日期
  const formatDate = dateString => {
    if (!dateString) return '未知时间';
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // 加载状态
  if (loading) {
    return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-400">加载故事详情中...</p>
        </div>
      </div>;
  }

  // 错误状态
  if (error) {
    return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-400 mb-4">{error}</h2>
          <div className="flex gap-4 justify-center">
            <Button onClick={goBack} className="bg-red-600 hover:bg-red-700 text-white">
              返回
            </Button>
            <Button onClick={() => window.location.reload()} variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
              重新加载
            </Button>
          </div>
        </div>
      </div>;
  }

  // 故事不存在
  if (!story) {
    return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-400 mb-4">故事不存在</h2>
          <Button onClick={goBack} className="bg-red-600 hover:bg-red-700 text-white">
            返回
          </Button>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-gray-900 text-white">
      {/* 背景装饰 */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-gray-900 to-gray-900"></div>
      
      {/* 顶部导航 */}
      <header className="relative z-10 bg-black/50 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button onClick={goBack} variant="ghost" className="text-gray-300 hover:text-white">
            <ArrowLeft className="w-5 h-5 mr-2" />
            返回
          </Button>
          <h1 className="text-xl font-bold text-red-600">红色故事详情</h1>
          <div className="flex gap-2">
            <Button onClick={navigateToEdit} variant="ghost" className="text-blue-400 hover:text-blue-300">
              <Edit className="w-4 h-4 mr-1" />
              编辑
            </Button>
            <Button onClick={navigateToAdmin} variant="ghost" className="text-gray-300 hover:text-white">
              管理
            </Button>
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        {/* 故事标题 */}
        <h1 className="text-4xl font-bold text-white mb-6 text-center">{story.title}</h1>

        {/* 故事图片 */}
        <div className="mb-8">
          {story.image && !imageError ? <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img src={story.image} alt={story.title} onLoad={handleImageLoad} onError={handleImageError} className="w-full h-96 object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            </div> : <div className="w-full h-96 bg-gradient-to-br from-red-900/30 to-gray-800/30 rounded-2xl flex items-center justify-center border border-gray-700">
              <div className="text-center">
                <ImageOff className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">{imageError ? '图片加载失败' : '暂无图片'}</p>
              </div>
            </div>}
        </div>

        {/* 故事元信息 */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-center">
            <div className="flex items-center justify-center gap-2">
              <Users className="w-5 h-5 text-red-400" />
              <div>
                <div className="text-sm text-gray-400">作者</div>
                <div className="font-medium text-white">{story.author}</div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Calendar className="w-5 h-5 text-red-400" />
              <div>
                <div className="text-sm text-gray-400">时间</div>
                <div className="font-medium text-white">{story.date || '未知'}</div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2">
              <MapPin className="w-5 h-5 text-red-400" />
              <div>
                <div className="text-sm text-gray-400">地点</div>
                <div className="font-medium text-white">{story.location || '未知'}</div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Clock className="w-5 h-5 text-red-400" />
              <div>
                <div className="text-sm text-gray-400">阅读时长</div>
                <div className="font-medium text-white">{story.readTime}</div>
              </div>
            </div>
          </div>
        </div>

        {/* 标签 */}
        {story.tags && story.tags.length > 0 && <div className="mb-8">
            <div className="flex flex-wrap gap-2 justify-center">
              {story.tags.map((tag, index) => <span key={index} className="px-3 py-1 bg-red-900/50 text-red-300 rounded-full text-sm backdrop-blur-sm">
                  <Tag className="w-3 h-3 inline mr-1" />
                  {tag}
                </span>)}
            </div>
          </div>}

        {/* 故事内容 */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <div className="w-1 h-8 bg-red-600 mr-4"></div>
            故事详情
          </h2>
          <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed">
            <p className="whitespace-pre-wrap">{story.content}</p>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex justify-center gap-4">
          <Button onClick={handleShare} variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
            <Share2 className="w-4 h-4 mr-2" />
            分享
          </Button>
          <Button onClick={handleLike} variant="outline" className={`border-gray-600 ${liked ? 'text-red-400 bg-red-900/20' : 'text-gray-300'} hover:bg-gray-800`}>
            <Heart className={`w-4 h-4 mr-2 ${liked ? 'fill-current' : ''}`} />
            {liked ? '已收藏' : '收藏'}
          </Button>
          <Button onClick={navigateToEdit} className="bg-red-600 hover:bg-red-700 text-white">
            <Edit className="w-4 h-4 mr-2" />
            编辑故事
          </Button>
        </div>

        {/* 底部信息 */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <p>发布时间：{formatDate(story.createdAt)}</p>
          <p className="mt-2">让红色基因代代相传，让革命精神永放光芒</p>
        </div>
      </main>
    </div>;
}