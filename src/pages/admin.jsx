// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button } from '@/components/ui';
// @ts-ignore;
import { ArrowLeft, Plus, Edit, Trash2, Eye, Search, Filter, AlertCircle, LogOut, Shield } from 'lucide-react';

// @ts-ignore;
import { PageHeader, BreadcrumbNav, safeNavigate } from '@/components/Navigation';
export default function AdminPage(props) {
  const {
    $w
  } = props;
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const storiesPerPage = 10;

  // 检查登录状态
  useEffect(() => {
    const checkAuthStatus = () => {
      const isLoggedIn = localStorage.getItem('adminLoggedIn');
      if (!isLoggedIn || isLoggedIn !== 'true') {
        console.log('未登录，跳转到登录页面');
        $w.utils.navigateTo({
          pageId: 'login',
          params: {}
        });
        return false;
      }
      return true;
    };

    // 检查登录状态，如果未登录则不继续执行
    if (!checkAuthStatus()) {
      return;
    }

    // 加载故事列表
    const loadStories = async () => {
      try {
        setLoading(true);
        console.log('加载管理页面数据...');

        // 使用云开发实例直接调用数据库
        const tcb = await $w.cloud.getCloudInstance();
        const db = tcb.database();

        // 查询数据
        const result = await db.collection('red_story').orderBy('createdAt', 'desc').get();
        console.log('管理页面数据加载结果:', result);
        if (result && result.data) {
          setStories(result.data);
          const totalPagesCount = Math.ceil(result.data.length / storiesPerPage);
          setTotalPages(totalPagesCount);
        } else {
          setStories([]);
          setTotalPages(1);
        }
      } catch (err) {
        console.error('加载故事列表失败:', err);
        setError(`加载失败: ${err.message || '未知错误'}`);
      } finally {
        setLoading(false);
      }
    };
    loadStories();
  }, [$w]);

  // 处理搜索
  const handleSearch = e => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // 处理筛选
  const handleFilter = status => {
    setFilterStatus(status);
    setCurrentPage(1);
  };

  // 过滤故事
  const filteredStories = stories.filter(story => {
    const matchesSearch = story.title.toLowerCase().includes(searchTerm.toLowerCase()) || story.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || story.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // 分页故事
  const paginatedStories = filteredStories.slice((currentPage - 1) * storiesPerPage, currentPage * storiesPerPage);

  // 删除故事
  const handleDelete = async storyId => {
    setDeleting(true);
    try {
      console.log('删除故事，ID:', storyId);

      // 使用云开发实例直接调用数据库
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();

      // 删除数据
      const result = await db.collection('red_story').doc(storyId).remove();
      console.log('删除结果:', result);
      setStories(stories.filter(story => story._id !== storyId));
      setDeleteConfirm(null);
    } catch (err) {
      console.error('删除故事失败:', err);
      setError(`删除失败: ${err.message || '未知错误'}`);
    } finally {
      setDeleting(false);
    }
  };

  // 导航函数
  const navigateTo = $w.utils.navigateTo;
  const goBack = () => {
    $w.utils.navigateBack();
  };
  const goToUpload = () => {
    navigateTo({
      pageId: 'upload',
      params: {}
    });
  };
  const goToEdit = storyId => {
    navigateTo({
      pageId: 'edit',
      params: {
        id: storyId
      }
    });
  };
  const goToDetail = storyId => {
    navigateTo({
      pageId: 'detail',
      params: {
        id: storyId
      }
    });
  };

  // 退出登录
  const handleLogout = () => {
    if (confirm('确定要退出登录吗？')) {
      localStorage.removeItem('adminLoggedIn');
      console.log('退出登录，跳转到登录页面');
      navigateTo({
        pageId: 'login',
        params: {}
      });
    }
  };

  // 格式化日期
  const formatDate = timestamp => {
    if (!timestamp) return '未知时间';
    const date = new Date(timestamp);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 获取状态标签样式
  const getStatusBadgeClass = status => {
    switch (status) {
      case 'published':
        return 'bg-green-900/50 text-green-300 border-green-700';
      case 'draft':
        return 'bg-yellow-900/50 text-yellow-300 border-yellow-700';
      default:
        return 'bg-gray-900/50 text-gray-300 border-gray-700';
    }
  };

  // 获取状态文本
  const getStatusText = status => {
    switch (status) {
      case 'published':
        return '已发布';
      case 'draft':
        return '草稿';
      default:
        return '未知';
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
    label: '管理后台'
  }];

  // 加载状态
  if (loading) {
    return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-400">加载管理数据中...</p>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-gray-900 text-white">
      {/* 背景装饰 */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-gray-900 to-gray-900"></div>
      
      {/* 顶部导航 */}
      <PageHeader title="红色故事管理" showBack={true} backAction={goBack} breadcrumbs={breadcrumbs} actions={[{
      label: '退出',
      icon: LogOut,
      onClick: handleLogout,
      className: 'text-gray-300 hover:text-white'
    }]} />

      {/* 主要内容 */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 py-8">
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

        {/* 操作栏 */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 mb-6 border border-gray-700">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* 搜索框 */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input type="text" placeholder="搜索故事标题或作者..." value={searchTerm} onChange={handleSearch} className="w-full pl-10 pr-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent" />
            </div>

            {/* 筛选和操作按钮 */}
            <div className="flex gap-2">
              {/* 筛选按钮组 */}
              <div className="flex bg-gray-900/50 rounded-lg border border-gray-700">
                <button onClick={() => handleFilter('all')} className={`px-4 py-2 text-sm font-medium transition-colors ${filterStatus === 'all' ? 'bg-red-600 text-white' : 'text-gray-300 hover:text-white'}`}>
                  全部
                </button>
                <button onClick={() => handleFilter('published')} className={`px-4 py-2 text-sm font-medium transition-colors border-l border-gray-700 ${filterStatus === 'published' ? 'bg-red-600 text-white' : 'text-gray-300 hover:text-white'}`}>
                  已发布
                </button>
                <button onClick={() => handleFilter('draft')} className={`px-4 py-2 text-sm font-medium transition-colors border-l border-gray-700 ${filterStatus === 'draft' ? 'bg-red-600 text-white' : 'text-gray-300 hover:text-white'}`}>
                  草稿
                </button>
              </div>

              {/* 上传按钮 */}
              <Button onClick={goToUpload} className="bg-red-600 hover:bg-red-700 text-white">
                <Plus className="w-5 h-5 mr-2" />
                上传故事
              </Button>
            </div>
          </div>
        </div>

        {/* 统计信息 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">总故事数</p>
                <p className="text-2xl font-bold text-white">{stories.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center">
                <Filter className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">已发布</p>
                <p className="text-2xl font-bold text-green-400">{stories.filter(s => s.status === 'published').length}</p>
              </div>
              <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center">
                <Eye className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">草稿</p>
                <p className="text-2xl font-bold text-yellow-400">{stories.filter(s => s.status === 'draft').length}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-600/20 rounded-lg flex items-center justify-center">
                <Edit className="w-6 h-6 text-yellow-400" />
              </div>
            </div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">筛选结果</p>
                <p className="text-2xl font-bold text-red-400">{filteredStories.length}</p>
              </div>
              <div className="w-12 h-12 bg-red-600/20 rounded-lg flex items-center justify-center">
                <Search className="w-6 h-6 text-red-400" />
              </div>
            </div>
          </div>
        </div>

        {/* 故事列表 */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
          {paginatedStories.length === 0 ? <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Filter className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-medium text-gray-300 mb-2">暂无红色故事</h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || filterStatus !== 'all' ? '没有找到符合筛选条件的故事' : '还没有上传任何红色故事'}
              </p>
              {!searchTerm && filterStatus === 'all' && <Button onClick={goToUpload} className="bg-red-600 hover:bg-red-700 text-white">
                  <Plus className="w-5 h-5 mr-2" />
                  上传第一个故事
                </Button>}
            </div> : <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900/50 border-b border-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">故事信息</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">作者</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">状态</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">创建时间</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {paginatedStories.map(story => <tr key={story._id} className="hover:bg-gray-700/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-4">
                          {story.image && <img src={story.image} alt={story.title} className="w-16 h-16 object-cover rounded-lg" />}
                          <div>
                            <h3 className="text-sm font-medium text-white mb-1 line-clamp-1">{story.title}</h3>
                            <p className="text-xs text-gray-400 line-clamp-2">{story.content.substring(0, 100)}...</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-300">{story.author || '佚名'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusBadgeClass(story.status)}`}>
                          {getStatusText(story.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-300">{formatDate(story.createdAt)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <Button onClick={() => goToDetail(story._id)} variant="ghost" size="sm" className="text-gray-300 hover:text-white">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button onClick={() => goToEdit(story._id)} variant="ghost" size="sm" className="text-gray-300 hover:text-white">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button onClick={() => setDeleteConfirm(story._id)} variant="ghost" size="sm" className="text-red-400 hover:text-red-300">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>)}
                </tbody>
              </table>
            </div>}
        </div>

        {/* 分页 */}
        {totalPages > 1 && <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-400">
              显示第 {(currentPage - 1) * storiesPerPage + 1} - {Math.min(currentPage * storiesPerPage, filteredStories.length)} 条，共 {filteredStories.length} 条
            </div>
            <div className="flex items-center space-x-2">
              <Button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} variant="outline" className="border-gray-600 text-gray-300">
                上一页
              </Button>
              {Array.from({
            length: totalPages
          }, (_, i) => i + 1).map(page => <button key={page} onClick={() => setCurrentPage(page)} className={`px-3 py-1 text-sm rounded-md transition-colors ${currentPage === page ? 'bg-red-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>
                  {page}
                </button>)}
              <Button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} variant="outline" className="border-gray-600 text-gray-300">
                下一页
              </Button>
            </div>
          </div>}
      </main>

      {/* 删除确认对话框 */}
      {deleteConfirm && <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-medium text-white mb-4">确认删除红色故事？</h3>
            <p className="text-gray-400 mb-6">删除后故事将无法恢复，确定要删除吗？</p>
            <div className="flex gap-3 justify-end">
              <Button onClick={() => setDeleteConfirm(null)} variant="outline" className="border-gray-600 text-gray-300">
                取消
              </Button>
              <Button onClick={() => handleDelete(deleteConfirm)} disabled={deleting} className="bg-red-600 hover:bg-red-700 text-white">
                {deleting ? '删除中...' : '确认删除'}
              </Button>
            </div>
          </div>
        </div>}
    </div>;
}