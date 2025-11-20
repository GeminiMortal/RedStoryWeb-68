// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button } from '@/components/ui';
// @ts-ignore;
import { ArrowLeft, Plus, Edit, Trash2, Eye, Search, Filter, AlertCircle, LogOut, Shield, CheckCircle, FileText, Send, Clock } from 'lucide-react';

// @ts-ignore;
import { PageHeader, BreadcrumbNav, safeNavigate } from '@/components/Navigation';
export default function AdminPage(props) {
  const {
    $w
  } = props;
  const [stories, setStories] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [activeTab, setActiveTab] = useState('published'); // 'published' 或 'drafts'
  const [publishConfirm, setPublishConfirm] = useState(null);
  const [publishing, setPublishing] = useState(false);
  const storiesPerPage = 10;

  // 检查登录状态 - 优化版本
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        setCheckingAuth(true);

        // 从localStorage获取登录状态
        const isLoggedIn = localStorage.getItem('adminLoggedIn');

        // 如果已登录，直接加载数据
        if (isLoggedIn === 'true') {
          setAuthChecked(true);
          setCheckingAuth(false);
          return true;
        }

        // 如果未登录，跳转到登录页
        console.log('未登录，跳转到登录页面');
        setTimeout(() => {
          $w.utils.navigateTo({
            pageId: 'login',
            params: {}
          });
        }, 100);
        return false;
      } catch (err) {
        console.error('权限检查失败:', err);
        setError('权限检查失败，请重新登录');
        setCheckingAuth(false);
        return false;
      }
    };
    checkAuthStatus();
  }, [$w]);

  // 加载故事和草稿数据 - 只在权限检查通过后执行
  useEffect(() => {
    if (!authChecked) return;
    const loadData = async () => {
      try {
        setLoading(true);
        console.log('加载管理页面数据...');

        // 使用云开发实例直接调用数据库
        const tcb = await $w.cloud.getCloudInstance();
        const db = tcb.database();

        // 查询正式发布内容
        const storiesResult = await db.collection('red_story').orderBy('createdAt', 'desc').get();
        console.log('正式发布内容加载结果:', storiesResult);
        if (storiesResult && storiesResult.data) {
          setStories(storiesResult.data);
        } else {
          setStories([]);
        }

        // 查询草稿内容
        const draftsResult = await db.collection('red_story_draft').orderBy('updatedAt', 'desc').get();
        console.log('草稿内容加载结果:', draftsResult);
        if (draftsResult && draftsResult.data) {
          setDrafts(draftsResult.data);
        } else {
          setDrafts([]);
        }

        // 计算分页
        const totalItems = activeTab === 'published' ? storiesResult.data?.length || 0 : draftsResult.data?.length || 0;
        const totalPagesCount = Math.ceil(totalItems / storiesPerPage);
        setTotalPages(totalPagesCount);
      } catch (err) {
        console.error('加载数据失败:', err);
        setError(`加载失败: ${err.message || '未知错误'}`);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [authChecked, activeTab]);

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

  // 切换标签页
  const handleTabChange = tab => {
    setActiveTab(tab);
    setCurrentPage(1);
    setSearchTerm('');
    setFilterStatus('all');
  };

  // 获取当前显示的数据
  const getCurrentData = () => {
    const data = activeTab === 'published' ? stories : drafts;
    const filteredData = data.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || item.author.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === 'all' || item.status === filterStatus;
      return matchesSearch && matchesFilter;
    });
    return filteredData;
  };
  const currentData = getCurrentData();
  const paginatedData = currentData.slice((currentPage - 1) * storiesPerPage, currentPage * storiesPerPage);

  // 删除故事或草稿
  const handleDelete = async (itemId, isDraftItem = false) => {
    setDeleting(true);
    try {
      console.log('删除内容，ID:', itemId, '是否为草稿:', isDraftItem);

      // 使用云开发实例直接调用数据库
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();

      // 删除数据
      const collectionName = isDraftItem ? 'red_story_draft' : 'red_story';
      const result = await db.collection(collectionName).doc(itemId).remove();
      console.log('删除结果:', result);

      // 更新本地数据
      if (isDraftItem) {
        setDrafts(drafts.filter(draft => draft._id !== itemId));
      } else {
        setStories(stories.filter(story => story._id !== itemId));
      }
      setDeleteConfirm(null);
    } catch (err) {
      console.error('删除失败:', err);
      setError(`删除失败: ${err.message || '未知错误'}`);
    } finally {
      setDeleting(false);
    }
  };

  // 发布草稿
  const handlePublishDraft = async draft => {
    setPublishing(true);
    try {
      console.log('发布草稿，ID:', draft._id);

      // 使用云开发实例直接调用数据库
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();

      // 准备发布数据
      const publishData = {
        ...draft,
        status: 'published',
        updatedAt: Date.now(),
        is_draft: false,
        draft_version: 0
      };

      // 删除草稿中的特殊字段
      delete publishData._id;
      delete publishData.is_draft;
      delete publishData.draft_version;

      // 添加到正式发布
      const result = await db.collection('red_story').add(publishData);
      console.log('发布结果:', result);

      // 删除草稿
      await db.collection('red_story_draft').doc(draft._id).remove();
      console.log('草稿已删除');

      // 更新本地数据
      setDrafts(drafts.filter(d => d._id !== draft._id));
      setStories([publishData, ...stories]);
      setPublishConfirm(null);
    } catch (err) {
      console.error('发布失败:', err);
      setError(`发布失败: ${err.message || '未知错误'}`);
    } finally {
      setPublishing(false);
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
  const goToEdit = (itemId, isDraftItem = false) => {
    navigateTo({
      pageId: 'edit',
      params: {
        id: itemId,
        isDraft: isDraftItem
      }
    });
  };
  const goToDetail = itemId => {
    navigateTo({
      pageId: 'detail',
      params: {
        id: itemId
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

  // 权限检查中状态
  if (checkingAuth) {
    return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-400">正在检查权限...</p>
        </div>
      </div>;
  }

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

        {/* 欢迎信息 */}
        <div className="bg-green-900/30 border border-green-600 text-green-200 px-4 py-3 rounded-lg mb-6">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span>欢迎回来！您已成功登录管理后台</span>
          </div>
        </div>

        {/* 统计信息 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">已发布</p>
                <p className="text-2xl font-bold text-white">{stories.length}</p>
              </div>
              <Eye className="w-8 h-8 text-green-400" />
            </div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">草稿</p>
                <p className="text-2xl font-bold text-white">{drafts.length}</p>
              </div>
              <FileText className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">总计</p>
                <p className="text-2xl font-bold text-white">{stories.length + drafts.length}</p>
              </div>
              <Shield className="w-8 h-8 text-red-400" />
            </div>
          </div>
        </div>

        {/* 标签页切换 */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-2 mb-6 border border-gray-700">
          <div className="flex gap-2">
            <button onClick={() => handleTabChange('published')} className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${activeTab === 'published' ? 'bg-red-600 text-white' : 'text-gray-300 hover:text-white'}`}>
              <Eye className="w-4 h-4 inline-block mr-2" />
              已发布 ({stories.length})
            </button>
            <button onClick={() => handleTabChange('drafts')} className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${activeTab === 'drafts' ? 'bg-yellow-600 text-white' : 'text-gray-300 hover:text-white'}`}>
              <FileText className="w-4 h-4 inline-block mr-2" />
              草稿 ({drafts.length})
            </button>
          </div>
        </div>

        {/* 操作栏 */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 mb-6 border border-gray-700">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* 搜索框 */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input type="text" placeholder={`搜索${activeTab === 'published' ? '已发布' : '草稿'}标题或作者...`} value={searchTerm} onChange={handleSearch} className="w-full pl-10 pr-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent" />
            </div>

            {/* 筛选和操作按钮 */}
            <div className="flex gap-2">
              {/* 上传按钮 */}
              <Button onClick={goToUpload} className="bg-red-600 hover:bg-red-700 text-white">
                <Plus className="w-5 h-5 mr-2" />
                上传故事
              </Button>
            </div>
          </div>
        </div>

        {/* 内容列表 */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700">
          {paginatedData.length === 0 ? <div className="text-center py-12">
              <Shield className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">
                {activeTab === 'published' ? '暂无已发布故事' : '暂无草稿'}
              </p>
            </div> : <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">标题</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">作者</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">状态</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      {activeTab === 'published' ? '发布时间' : '更新时间'}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {paginatedData.map(item => <tr key={item._id} className="hover:bg-gray-700/30">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{item.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{item.author || '佚名'}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadgeClass(item.status)}`}>
                          {getStatusText(item.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {formatDate(activeTab === 'published' ? item.createdAt : item.updatedAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => goToDetail(item._id)} className="text-blue-400 hover:text-blue-300 p-1">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button onClick={() => goToEdit(item._id, activeTab === 'drafts')} className="text-yellow-400 hover:text-yellow-300 p-1">
                            <Edit className="w-4 h-4" />
                          </button>
                          {activeTab === 'drafts' && <button onClick={() => setPublishConfirm(item)} className="text-green-400 hover:text-green-300 p-1">
                              <Send className="w-4 h-4" />
                            </button>}
                          <button onClick={() => setDeleteConfirm({
                      id: item._id,
                      isDraft: activeTab === 'drafts',
                      title: item.title
                    })} className="text-red-400 hover:text-red-300 p-1">
                            <Trash2 className="w-4 h-4" />
                          </button>
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
              第 {currentPage} 页 / 共 {totalPages} 页
            </div>
            <div className="flex gap-2">
              <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="px-3 py-1 bg-gray-800 border border-gray-700 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                上一页
              </button>
              <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="px-3 py-1 bg-gray-800 border border-gray-700 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                下一页
              </button>
            </div>
          </div>}
      </main>

      {/* 删除确认弹窗 */}
      {deleteConfirm && <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-medium text-white mb-2">确认删除</h3>
            <p className="text-gray-300 mb-4">
              确定要删除"{deleteConfirm.title}"吗？此操作不可撤销。
            </p>
            <div className="flex gap-3 justify-end">
              <Button onClick={() => setDeleteConfirm(null)} variant="ghost" className="text-gray-300 hover:text-white">
                取消
              </Button>
              <Button onClick={() => handleDelete(deleteConfirm.id, deleteConfirm.isDraft)} disabled={deleting} className="bg-red-600 hover:bg-red-700 text-white">
                {deleting ? '删除中...' : '确认删除'}
              </Button>
            </div>
          </div>
        </div>}

      {/* 发布确认弹窗 */}
      {publishConfirm && <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-medium text-white mb-2">确认发布草稿</h3>
            <p className="text-gray-300 mb-4">
              确定要将"{publishConfirm.title}"发布为正式内容吗？发布后草稿将被删除。
            </p>
            <div className="flex gap-3 justify-end">
              <Button onClick={() => setPublishConfirm(null)} variant="ghost" className="text-gray-300 hover:text-white">
                取消
              </Button>
              <Button onClick={() => handlePublishDraft(publishConfirm)} disabled={publishing} className="bg-green-600 hover:bg-green-700 text-white">
                {publishing ? '发布中...' : '确认发布'}
              </Button>
            </div>
          </div>
        </div>}
    </div>;
}