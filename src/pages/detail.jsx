// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button } from '@/components/ui';
// @ts-ignore;
import { ArrowLeft, Calendar, MapPin, Clock, Tag, User, Edit, Trash2, Share2, Heart, AlertCircle, BookOpen } from 'lucide-react';

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

  // 从URL参数获取故事ID
  const storyId = props.$w.page.dataset.params.id;

  // 加载故事详情
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

        // 查询数据
        const result = await db.collection('red_story').doc(storyId).get();
        console.log('故事详情加载结果:', result);
        if (result && result.data) {
          setStory(result.data);
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

  // 格式化日期
  const formatDate = timestamp => {
    if (!timestamp) return '未知时间';
    const date = new Date(timestamp);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // 分享功能
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: story.title,
        text: story.content.substring(0, 100) + '...',
        url: window.location.href
      });
    } else {
      // 复制链接到剪贴板
      navigator.clipboard.writeText(window.location.href);
      alert('链接已复制到剪贴板');
    }
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
      <PageHeader title={story.title} showBack={true} backAction={goBack} breadcrumbs={breadcrumbs} actions={[{
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

        {/* 故事头部 */}
        <article className="bg-gray-800/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-700">
          {/* 故事图片 */}
          {story.image && <div className="relative h-64 md:h-96">
              <img src={story.image} alt={story.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6">
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{story.title}</h1>
                <div className="flex items-center gap-4 text-gray-300">
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {story.author || '佚名'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {story.read_time || '5分钟'}
                  </span>
                </div>
              </div>
            </div>}

          {/* 故事内容 */}
          <div className="p-6 md:p-8">
            {/* 元信息 */}
            <div className="flex flex-wrap items-center gap-4 mb-6 pb-6 border-b border-gray-700">
              {story.date && <span className="flex items-center gap-1 text-gray-400">
                  <Calendar className="w-4 h-4" />
                  {formatDate(story.date)}
                </span>}
              {story.location && <span className="flex items-center gap-1 text-gray-400">
                  <MapPin className="w-4 h-4" />
                  {story.location}
                </span>}
              <span className="flex items-center gap-1 text-gray-400">
                <Clock className="w-4 h-4" />
                发布于 {formatDate(story.createdAt)}
              </span>
            </div>

            {/* 标签 */}
            {story.tags && story.tags.length > 0 && <div className="flex flex-wrap gap-2 mb-6">
                {story.tags.map((tag, index) => <span key={index} className="px-3 py-1 bg-red-900/30 text-red-300 text-sm rounded-full border border-red-800/50 flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    {tag}
                  </span>)}
              </div>}

            {/* 故事正文 */}
            <div className="prose prose-invert max-w-none">
              <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                {story.content}
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="mt-8 pt-6 border-t border-gray-700">
              <div className="flex flex-wrap gap-3">
                <Button onClick={handleShare} variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                  <Share2 className="w-4 h-4 mr-2" />
                  分享故事
                </Button>
                <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                  <Heart className="w-4 h-4 mr-2" />
                  收藏
                </Button>
                <Button onClick={goToEdit} variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                  <Edit className="w-4 h-4 mr-2" />
                  编辑
                </Button>
              </div>
            </div>
          </div>
        </article>

        {/* 相关推荐 */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-white mb-6">更多红色故事</h2>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <div className="text-center py-8">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400 mb-4">更多精彩红色故事，敬请期待</p>
              <Button onClick={() => navigateTo({
              pageId: 'index',
              params: {}
            })} className="bg-red-600 hover:bg-red-700 text-white">
                浏览更多故事
              </Button>
            </div>
          </div>
        </section>
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