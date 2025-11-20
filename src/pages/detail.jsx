// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button } from '@/components/ui';
// @ts-ignore;
import { ArrowLeft, Calendar, MapPin, Users, Clock, Share2, Heart, BookOpen, MessageCircle, ThumbsUp, Eye, Home, List } from 'lucide-react';

export default function Detail(props) {
  const {
    $w,
    page
  } = props;
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [viewCount, setViewCount] = useState(0);
  const [relatedStories, setRelatedStories] = useState([]);
  const [showFullContent, setShowFullContent] = useState(false);

  // 安全获取页面参数
  const storyId = page?.dataset?.params?.id;
  const fromPage = page?.dataset?.params?.from;
  const searchParams = page?.dataset?.params?.search;
  const tagParams = page?.dataset?.params?.tag;
  const pageParams = page?.dataset?.params?.page;

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

          // 模拟浏览量和点赞数
          setViewCount(Math.floor(Math.random() * 1000) + 100);
          setLikeCount(Math.floor(Math.random() * 200) + 20);

          // 加载相关故事
          loadRelatedStories(mappedStory.tags, mappedStory.id);
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

  // 加载相关故事
  const loadRelatedStories = async (tags, currentStoryId) => {
    if (!tags || tags.length === 0) return;
    try {
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'red_story',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              _id: {
                $ne: currentStoryId // 排除当前故事
              },
              status: {
                $eq: 'published' // 只显示已发布的故事
              }
            }
          },
          select: {
            $master: true
          },
          orderBy: [{
            createdAt: 'desc'
          }],
          pageSize: 4 // 最多4个相关故事
        }
      });
      if (result.records && result.records.length > 0) {
        const mappedStories = result.records.map(record => ({
          id: record._id,
          title: record.title,
          content: record.content,
          image: record.image,
          date: record.date,
          location: record.location,
          author: record.author,
          readTime: record.read_time,
          tags: record.tags || [],
          createdAt: record.createdAt
        }));
        setRelatedStories(mappedStories);
      }
    } catch (err) {
      console.error('加载相关故事失败:', err);
    }
  };

  // 智能返回导航
  const handleSmartBack = () => {
    if (fromPage === 'index' || fromPage === 'admin') {
      // 构建返回参数
      const backParams = {};
      if (searchParams) backParams.search = searchParams;
      if (tagParams && tagParams !== 'all') backParams.tag = tagParams;
      if (pageParams && pageParams !== '1') backParams.page = pageParams;
      $w.utils.navigateTo({
        pageId: fromPage,
        params: backParams
      });
    } else {
      // 默认返回主页
      $w.utils.navigateTo({
        pageId: 'index',
        params: {}
      });
    }
  };

  // 返回主页
  const goHome = () => {
    $w.utils.navigateTo({
      pageId: 'index',
      params: {}
    });
  };

  // 返回列表
  const goToList = () => {
    if (fromPage === 'index' || fromPage === 'admin') {
      handleSmartBack();
    } else {
      $w.utils.navigateTo({
        pageId: 'index',
        params: {}
      });
    }
  };
  const handleShare = () => {
    // 构建分享URL，包含当前页面的所有参数
    const shareUrl = `${window.location.origin}${window.location.pathname}?id=${storyId}`;

    // 模拟分享功能
    if (navigator.share) {
      navigator.share({
        title: story?.title,
        text: story?.content?.substring(0, 100) + '...',
        url: shareUrl
      });
    } else {
      // 降级处理：复制链接到剪贴板
      navigator.clipboard.writeText(shareUrl);
      alert('链接已复制到剪贴板');
    }
  };
  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
  };
  const navigateToStory = storyId => {
    $w.utils.navigateTo({
      pageId: 'detail',
      params: {
        id: storyId,
        from: fromPage || 'index',
        search: searchParams,
        tag: tagParams,
        page: pageParams
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

  // 截取内容预览
  const getContentPreview = (content, maxLength = 150) => {
    if (!content) return '暂无内容';
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
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
          <div className="flex gap-4 justify-center">
            <Button onClick={handleSmartBack} className="bg-red-600 hover:bg-red-700 text-white">
              返回上一页
            </Button>
            <Button onClick={goHome} variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
              返回主页
            </Button>
          </div>
        </div>
      </div>;
  }

  // 无数据状态
  if (!story) {
    return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-400 mb-4">故事未找到</h2>
          <div className="flex gap-4 justify-center">
            <Button onClick={handleSmartBack} className="bg-red-600 hover:bg-red-700 text-white">
              返回上一页
            </Button>
            <Button onClick={goHome} variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
              返回主页
            </Button>
          </div>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-gray-900 text-white">
      {/* 背景装饰 */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-gray-900 to-gray-900"></div>
      
      {/* 顶部导航 */}
      <header className="relative z-10 bg-black/50 backdrop-blur-sm border-b border-gray-800 sticky top-0">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button onClick={handleSmartBack} variant="ghost" className="text-gray-300 hover:text-white">
              <ArrowLeft className="w-5 h-5 mr-2" />
              返回
            </Button>
            {fromPage && <span className="text-sm text-gray-400">
                来自: {fromPage === 'index' ? '主页' : fromPage === 'admin' ? '管理后台' : '未知页面'}
              </span>}
          </div>
          <h1 className="text-xl font-bold text-red-600">红色故事详情</h1>
          <div className="flex gap-2">
            <Button onClick={goHome} variant="ghost" className="text-gray-300 hover:text-white">
              <Home className="w-5 h-5" />
            </Button>
            <Button onClick={goToList} variant="ghost" className="text-gray-300 hover:text-white">
              <List className="w-5 h-5" />
            </Button>
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
        {/* 头图区域 */}
        <div className="mb-8 rounded-2xl overflow-hidden shadow-2xl relative">
          {story.image ? <img src={story.image} alt={story.title} className="w-full h-64 md:h-96 object-cover" /> : <div className="w-full h-64 md:h-96 bg-gradient-to-br from-red-900/30 to-gray-800/30 flex items-center justify-center">
              <div className="text-center text-gray-400">
                <BookOpen className="w-16 h-16 mx-auto mb-4" />
                <p>暂无配图</p>
              </div>
            </div>}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
          
          {/* 标题覆盖在图片上 */}
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 drop-shadow-lg">
              {story.title}
            </h1>
            
            {/* 统计信息 */}
            <div className="flex items-center gap-6 text-sm text-gray-200">
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {viewCount} 阅读
              </span>
              <span className="flex items-center gap-1">
                <ThumbsUp className="w-4 h-4" />
                {likeCount} 点赞
              </span>
            </div>
          </div>
        </div>

        {/* 文章信息卡片 */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-gray-700 mb-8">
          {/* 元信息 */}
          <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-gray-300">
            {story.date && <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {story.date}
              </span>}
            {story.location && <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {story.location}
              </span>}
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {story.author || '佚名'}
            </span>
            {story.readTime && <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {story.readTime}
              </span>}
          </div>

          {/* 标签 */}
          {story.tags && story.tags.length > 0 && <div className="flex flex-wrap gap-2 mb-6">
              {story.tags.map((tag, index) => <span key={index} className="px-3 py-1 bg-red-900/30 text-red-300 rounded-full text-sm border border-red-800/30">
                  {tag}
                </span>)}
            </div>}

          {/* 内容展示 */}
          <div className="prose prose-invert max-w-none">
            {showFullContent ? story.content.split('\n\n').map((paragraph, index) => <p key={index} className="text-gray-200 leading-relaxed mb-6 text-lg">
                  {paragraph}
                </p>) : <div>
                <p className="text-gray-200 leading-relaxed mb-6 text-lg">
                  {getContentPreview(story.content, 300)}
                </p>
                {story.content && story.content.length > 300 && <Button onClick={() => setShowFullContent(true)} variant="outline" className="border-red-600 text-red-400 hover:bg-red-900/20">
                    阅读全文
                  </Button>}
              </div>}
          </div>

          {/* 互动区域 */}
          <div className="flex items-center justify-between mt-12 pt-8 border-t border-gray-700">
            <div className="text-sm text-gray-400">
              革命精神永垂不朽 · 红色基因代代相传
            </div>
            <div className="flex gap-3">
              <Button onClick={handleShare} variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                <Share2 className="w-4 h-4 mr-2" />
                分享
              </Button>
              <Button onClick={handleLike} className={`${isLiked ? 'bg-red-600' : 'bg-gray-700'} hover:bg-red-700 text-white`}>
                <Heart className={`w-4 h-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
                {isLiked ? '已收藏' : '收藏'} ({likeCount})
              </Button>
            </div>
          </div>
        </div>

        {/* 相关故事推荐 */}
        {relatedStories.length > 0 && <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-red-600" />
              相关故事推荐
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedStories.map(relatedStory => <div key={relatedStory.id} onClick={() => navigateToStory(relatedStory.id)} className="bg-gray-900/50 rounded-xl p-6 border border-gray-700 hover:border-red-600/50 transition-all cursor-pointer hover:shadow-lg">
                  <div className="flex gap-4">
                    {relatedStory.image && <img src={relatedStory.image} alt={relatedStory.title} className="w-20 h-20 rounded-lg object-cover flex-shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                        {relatedStory.title}
                      </h3>
                      <p className="text-sm text-gray-400 line-clamp-2 mb-3">
                        {getContentPreview(relatedStory.content, 80)}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        {relatedStory.date && <span>{relatedStory.date}</span>}
                        {relatedStory.location && <span>·</span>}
                        {relatedStory.location && <span>{relatedStory.location}</span>}
                      </div>
                    </div>
                  </div>
                </div>)}
            </div>
          </div>}
      </main>
    </div>;
}