// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button } from '@/components/ui';
// @ts-ignore;
import { ArrowLeft, Calendar, MapPin, Clock, Tag, User, Edit, Trash2, Share2, Heart, AlertCircle, BookOpen, ExternalLink, MessageCircle, Plus } from 'lucide-react';

// @ts-ignore;
import { PageHeader, BreadcrumbNav, safeNavigate } from '@/components/Navigation';
export default function DetailPage(props) {
  const {
    $w
  } = props;
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [relatedStories, setRelatedStories] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);

  // 从URL参数获取故事ID
  const storyId = props.$w.page.dataset.params.id;

  // 检查管理员权限
  useEffect(() => {
    const checkAdminStatus = () => {
      const adminLoggedIn = localStorage.getItem('adminLoggedIn');
      setIsAdmin(adminLoggedIn === 'true');
    };
    checkAdminStatus();
  }, []);

  // 加载故事详情和相关故事
  useEffect(() => {
    if (!storyId) {
      setError('未提供故事ID');
      setLoading(false);
      return;
    }
    const loadStory = async () => {
      try {
        setLoading(true);
        console.log('加载故事详情，ID:', storyId);

        // 使用云开发实例直接调用数据库
        const tcb = await $w.cloud.getCloudInstance();
        const db = tcb.database();

        // 查询当前故事
        const storyResult = await db.collection('red_story').doc(storyId).get();
        console.log('故事详情加载结果:', storyResult);
        if (storyResult && storyResult.data) {
          setStory(storyResult.data);

          // 加载相关故事（同标签或同作者）
          const tags = storyResult.data.tags || [];
          const author = storyResult.data.author || '';

          // 查询相关故事
          let relatedQuery = db.collection('red_story').where({
            _id: db.command.neq(storyId),
            status: 'published'
          });

          // 如果有标签，按标签匹配
          if (tags.length > 0) {
            relatedQuery = relatedQuery.where({
              tags: db.command.in(tags)
            });
          } else if (author) {
            // 如果没有标签，按作者匹配
            relatedQuery = relatedQuery.where({
              author: author
            });
          }
          const relatedResult = await relatedQuery.limit(3).get();
          if (relatedResult && relatedResult.data) {
            setRelatedStories(relatedResult.data);
          }
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
  }, [storyId]);

  // 删除故事
  const handleDelete = async () => {
    setDeleting(true);
    try {
      console.log('删除故事，ID:', storyId);

      // 使用云开发实例直接调用数据库
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();

      // 删除数据
      const result = await db.collection('red_story').doc(storyId).remove();
      console.log('删除结果:', result);
      $w.utils.navigateTo({
        pageId: 'admin',
        params: {}
      });
    } catch (err) {
      console.error('删除故事失败:', err);
      setError(`删除失败: ${err.message || '未知错误'}`);
    } finally {
      setDeleting(false);
      setDeleteConfirm(false);
    }
  };

  // 导航函数
  const navigateTo = $w.utils.navigateTo;
  const goBack = () => {
    $w.utils.navigateBack();
  };
  const goToEdit = () => {
    navigateTo({
      pageId: 'edit',
      params: {
        id: storyId
      }
    });
  };
  const goToAdmin = () => {
    navigateTo({
      pageId: 'admin',
      params: {}
    });
  };
  const goToDetail = id => {
    navigateTo({
      pageId: 'detail',
      params: {
        id
      }
    });
  };

  // 格式化日期
  const formatDate = timestamp => {
    if (!timestamp) return '未知时间';
    const date = new Date(timestamp);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 格式化阅读时间
  const formatReadTime = time => {
    if (!time) return '5分钟';
    return time;
  };

  // 分享功能
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: story.title,
          text: story.content.substring(0, 200) + '...',
          url: window.location.href
        });
      } catch (err) {
        console.log('分享取消:', err);
      }
    } else {
      // 复制链接到剪贴板
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('链接已复制到剪贴板');
      } catch (err) {
        console.error('复制失败:', err);
        alert('复制失败，请手动复制链接');
      }
    }
  };

  // 收藏功能
  const handleFavorite = () => {
    // 获取已收藏的故事
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    const isFavorited = favorites.includes(storyId);
    if (isFavorited) {
      // 取消收藏
      const newFavorites = favorites.filter(id => id !== storyId);
      localStorage.setItem('favorites', JSON.stringify(newFavorites));
      alert('已取消收藏');
    } else {
      // 添加收藏
      favorites.push(storyId);
      localStorage.setItem('favorites', JSON.stringify(favorites));
      alert('已收藏');
    }
  };

  // 检查是否已收藏
  const isFavorited = () => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    return favorites.includes(storyId);
  };

  // 面包屑导航
  const breadcrumbs = [{
    label: '首页',
    href: true,
    onClick: () => navigateTo({
      pageId: 'index',
      params: {}
    })
  }, {
    label: '红色故事',
    href: true,
    onClick: () => navigateTo({
      pageId: 'index',
      params: {}
    })
  }, {
    label: story?.title || '故事详情'
  }];

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
  if (error || !story) {
    return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">加载失败</h2>
          <p className="text-gray-400 mb-6">{error || '未找到该红色故事'}</p>
          <div className="flex gap-4 justify-center">
            <Button onClick={goBack} variant="outline" className="border-gray-600 text-gray-300">
              返回上一页
            </Button>
            <Button onClick={() => navigateTo({
            pageId: 'index',
            params: {}
          })} className="bg-red-600 hover:bg-red-700 text-white">
              回到首页
            </Button>
          </div>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-gray-900 text-white">
      {/* 背景装饰 */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-gray-900 to-gray-900"></div>
      
      {/* 顶部导航 */}
      <PageHeader title={story.title} showBack={true} backAction={goBack} breadcrumbs={breadcrumbs} actions={isAdmin ? [{
      label: '编辑',
      icon: Edit,
      onClick: goToEdit,
      className: 'text-gray-300 hover:text-white'
    }, {
      label: '删除',
      icon: Trash2,
      onClick: () => setDeleteConfirm(true),
      className: 'text-red-400 hover:text-red-300'
    }, {
      label: '管理',
      icon: BookOpen,
      onClick: goToAdmin,
      className: 'text-gray-300 hover:text-white'
    }] : [{
      label: '管理',
      icon: BookOpen,
      onClick: goToAdmin,
      className: 'text-gray-300 hover:text-white'
    }]} />

      {/* 主要内容 */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        {/* 错误提示 */}
        {error && <div className="bg-red-900/50 border border-red-600 text-red-200 px-4 py-3 rounded-lg mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
            <Button onClick={() => setError(null)} variant="ghost" size="sm" className="text-red-300 hover:text-red-100">
              ×
            </Button>
          </div>}

        {/* 故事头部卡片 */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-700 mb-8">
          {/* 故事图片 */}
          {story.image && <div className="relative h-64 md:h-96">
              <img src={story.image} alt={story.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6">
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 leading-tight">{story.title}</h1>
                <div className="flex flex-wrap items-center gap-4 text-gray-300">
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {story.author || '佚名'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {formatReadTime(story.read_time)}
                  </span>
                  {story.date && <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(story.date)}
                    </span>}
                  {story.location && <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {story.location}
                    </span>}
                </div>
              </div>
            </div>}

          {/* 故事元信息 */}
          <div className="p-6 md:p-8">
            {/* 标签 */}
            {story.tags && story.tags.length > 0 && <div className="flex flex-wrap gap-2 mb-6">
                {story.tags.map((tag, index) => <span key={index} className="px-3 py-1 bg-red-900/30 text-red-300 text-sm rounded-full border border-red-800/50 flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    {tag}
                  </span>)}
              </div>}

            {/* 故事正文 */}
            <div className="prose prose-invert max-w-none">
              <div className="text-gray-300 leading-relaxed whitespace-pre-wrap text-lg">
                {story.content}
              </div>
            </div>

            {/* 故事信息卡片 */}
            <div className="mt-8 p-6 bg-gray-900/30 rounded-lg border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">故事信息</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">作者：</span>
                  <span className="text-gray-300">{story.author || '佚名'}</span>
                </div>
                <div>
                  <span className="text-gray-400">发布时间：</span>
                  <span className="text-gray-300">{formatDate(story.createdAt)}</span>
                </div>
                {story.date && <div>
                    <span className="text-gray-400">故事时间：</span>
                    <span className="text-gray-300">{formatDate(story.date)}</span>
                  </div>}
                {story.location && <div>
                    <span className="text-gray-400">故事地点：</span>
                    <span className="text-gray-300">{story.location}</span>
                  </div>}
                <div>
                  <span className="text-gray-400">阅读时长：</span>
                  <span className="text-gray-300">{formatReadTime(story.read_time)}</span>
                </div>
                <div>
                  <span className="text-gray-400">状态：</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${story.status === 'published' ? 'bg-green-900/50 text-green-300' : 'bg-yellow-900/50 text-yellow-300'}`}>
                    {story.status === 'published' ? '已发布' : '草稿'}
                  </span>
                </div>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="mt-8 pt-6 border-t border-gray-700">
              <div className="flex flex-wrap gap-3">
                <Button onClick={handleShare} variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                  <Share2 className="w-4 h-4 mr-2" />
                  分享故事
                </Button>
                <Button onClick={handleFavorite} variant="outline" className={`border-gray-600 ${isFavorited() ? 'text-red-400 bg-red-900/20' : 'text-gray-300'} hover:bg-gray-800`}>
                  <Heart className={`w-4 h-4 mr-2 ${isFavorited() ? 'fill-current' : ''}`} />
                  {isFavorited() ? '已收藏' : '收藏'}
                </Button>
                {isAdmin && <Button onClick={goToEdit} variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                    <Edit className="w-4 h-4 mr-2" />
                    编辑
                  </Button>}
                <Button onClick={() => navigateTo({
                pageId: 'index',
                params: {}
              })} variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                  <BookOpen className="w-4 h-4 mr-2" />
                  更多故事
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* 相关故事推荐 */}
        {relatedStories.length > 0 && <section className="mt-12">
            <h2 className="text-2xl font-bold text-white mb-6">相关红色故事</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedStories.map(relatedStory => <div key={relatedStory._id} className="bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700 hover:border-red-600/50 transition-all duration-300 group cursor-pointer" onClick={() => goToDetail(relatedStory._id)}>
                  <div className="relative h-48 overflow-hidden">
                    {relatedStory.image ? <img src={relatedStory.image} alt={relatedStory.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" /> : <div className="w-full h-full bg-gradient-to-br from-red-900/30 to-gray-800 flex items-center justify-center">
                        <BookOpen className="w-12 h-12 text-red-400" />
                      </div>}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-lg font-semibold text-white mb-1 line-clamp-2">{relatedStory.title}</h3>
                      <p className="text-sm text-gray-300">{relatedStory.author || '佚名'}</p>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-gray-400 text-sm line-clamp-2 mb-3">{relatedStory.content}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>{formatReadTime(relatedStory.read_time)}</span>
                      </div>
                      <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>)}
            </div>
          </section>}

        {/* 底部操作区 */}
        <div className="mt-12 bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <h3 className="text-lg font-semibold text-white mb-2">继续探索红色记忆</h3>
              <p className="text-gray-400">发现更多感人至深的红色故事</p>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => navigateTo({
              pageId: 'index',
              params: {}
            })} className="bg-red-600 hover:bg-red-700 text-white">
                <BookOpen className="w-4 h-4 mr-2" />
                浏览更多
              </Button>
              {isAdmin && <Button onClick={goToUpload} variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                  <Plus className="w-4 h-4 mr-2" />
                  上传故事
                </Button>}
            </div>
          </div>
        </div>
      </main>

      {/* 删除确认对话框 */}
      {deleteConfirm && <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-medium text-white mb-4">确认删除红色故事？</h3>
            <p className="text-gray-400 mb-6">删除后故事将无法恢复，确定要删除吗？</p>
            <div className="flex gap-3 justify-end">
              <Button onClick={() => setDeleteConfirm(false)} variant="outline" className="border-gray-600 text-gray-300">
                取消
              </Button>
              <Button onClick={handleDelete} disabled={deleting} className="bg-red-600 hover:bg-red-700 text-white">
                {deleting ? '删除中...' : '确认删除'}
              </Button>
            </div>
          </div>
        </div>}
    </div>;
}