// @ts-ignore;
import React, { useState, useEffect, useCallback } from 'react';
// @ts-ignore;
import { Button, Card, CardContent, CardHeader, CardTitle, useToast } from '@/components/ui';
// @ts-ignore;
import { ArrowLeft, Plus, Search, Filter, BookOpen, FileText, Calendar, Loader2, Home, RefreshCw } from 'lucide-react';
// @ts-ignore;
import { cn } from '@/lib/utils';

// @ts-ignore;
import { Sidebar } from '@/components/Sidebar';
// @ts-ignore;
import { MobileBottomNav } from '@/components/MobileBottomNav';
// @ts-ignore;
import { AdminPasswordGate } from '@/components/AdminPasswordGate';
// @ts-ignore;
import { StoryCard } from '@/components/StoryCard';
// @ts-ignore;
import { BatchOperations } from '@/components/BatchOperations';
// @ts-ignore;
import { ErrorState } from '@/components/ErrorState';
export default function AdminPage(props) {
  const {
    $w
  } = props;
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [stories, setStories] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [navigating, setNavigating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedDrafts, setSelectedDrafts] = useState(new Set());
  const [batchProcessing, setBatchProcessing] = useState(false);
  const [sidebarState, setSidebarState] = useState({
    isCollapsed: false,
    isDesktop: true
  });
  const [error, setError] = useState(null);
  const {
    toast
  } = useToast();
  const navigateTo = $w.utils.navigateTo;
  const navigateBack = $w.utils.navigateBack;

  // 优化的导航函数
  const handleNavigate = useCallback(async (pageId, params = {}) => {
    if (navigating) return;
    try {
      setNavigating(true);
      await new Promise(resolve => setTimeout(resolve, 100));
      navigateTo({
        pageId,
        params
      });
    } catch (error) {
      console.error('导航失败:', error);
      toast({
        title: '跳转失败',
        description: '页面跳转出现问题，请重试',
        variant: 'destructive'
      });
    } finally {
      setNavigating(false);
    }
  }, [navigating, navigateTo, toast]);

  // 优化的返回函数
  const handleNavigateBack = useCallback(async () => {
    if (navigating) return;
    try {
      setNavigating(true);
      await new Promise(resolve => setTimeout(resolve, 100));
      navigateBack();
    } catch (error) {
      console.error('返回失败:', error);
      // 如果返回失败，尝试跳转到首页
      handleNavigate('index');
    } finally {
      setNavigating(false);
    }
  }, [navigating, navigateBack, handleNavigate, toast]);

  // 优化的数据加载函数
  const loadData = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();

      // 优化查询：只获取必要字段
      const result = await db.collection('red_story').field({
        _id: true,
        title: true,
        content: true,
        author: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        publishedAt: true,
        views: true,
        tags: true
      }).orderBy('updatedAt', 'desc').get();
      if (result && result.data) {
        const allStories = result.data;

        // 数据验证和处理
        const processedStories = allStories.map(story => ({
          ...story,
          title: story.title || '无标题',
          content: story.content || '暂无内容',
          author: story.author || '佚名',
          tags: Array.isArray(story.tags) ? story.tags : [],
          views: typeof story.views === 'number' ? story.views : 0,
          status: story.status || 'draft'
        }));
        const publishedStories = processedStories.filter(story => story.status === 'published');
        const draftStories = processedStories.filter(story => story.status === 'draft');
        setStories(publishedStories);
        setDrafts(draftStories);

        // 清空选择状态
        setSelectedDrafts(new Set());
        if (showRefresh) {
          toast({
            title: '刷新成功',
            description: `已加载 ${processedStories.length} 个故事（${publishedStories.length} 个已发布，${draftStories.length} 个草稿）`,
            duration: 3000
          });
        }
      } else {
        throw new Error('未获取到数据');
      }
    } catch (error) {
      console.error('加载数据失败:', error);
      const errorMessage = error.message || '网络连接异常';
      setError(errorMessage);
      toast({
        title: '加载失败',
        description: errorMessage,
        variant: 'destructive',
        action: {
          label: '重试',
          onClick: () => loadData(true)
        }
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [toast]);

  // 初始化加载
  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated, loadData]);

  // 选择管理函数
  const handleSelectDraft = useCallback(draftId => {
    const newSelected = new Set(selectedDrafts);
    if (newSelected.has(draftId)) {
      newSelected.delete(draftId);
    } else {
      newSelected.add(draftId);
    }
    setSelectedDrafts(newSelected);
  }, [selectedDrafts]);
  const handleSelectAllDrafts = useCallback(() => {
    if (selectedDrafts.size === filteredDrafts.length) {
      setSelectedDrafts(new Set());
    } else {
      setSelectedDrafts(new Set(filteredDrafts.map(draft => draft._id)));
    }
  }, [selectedDrafts, filteredDrafts]);
  const clearSelection = useCallback(() => {
    setSelectedDrafts(new Set());
  }, []);

  // 批量操作函数
  const handleBatchPublish = useCallback(async () => {
    if (selectedDrafts.size === 0) {
      toast({
        title: '请选择草稿',
        description: '请先选择要发布的草稿',
        variant: 'destructive'
      });
      return;
    }
    const confirmed = window.confirm(`确定要发布选中的 ${selectedDrafts.size} 个草稿吗？`);
    if (!confirmed) return;
    setBatchProcessing(true);
    let successCount = 0;
    let failCount = 0;
    const failedItems = [];
    try {
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();

      // 批量处理
      for (const draftId of selectedDrafts) {
        try {
          await db.collection('red_story').doc(draftId).update({
            status: 'published',
            publishedAt: new Date(),
            updatedAt: new Date()
          });
          successCount++;
        } catch (error) {
          console.error(`发布草稿 ${draftId} 失败:`, error);
          failCount++;
          failedItems.push(draftId);
        }
      }

      // 显示结果
      if (successCount > 0) {
        const message = `成功发布 ${successCount} 个草稿${failCount > 0 ? `，${failCount} 个失败` : ''}`;
        toast({
          title: '批量发布完成',
          description: message,
          variant: failCount > 0 ? 'destructive' : 'default'
        });
      }

      // 清空选择并重新加载数据
      clearSelection();
      loadData(true);
    } catch (error) {
      console.error('批量发布失败:', error);
      toast({
        title: '批量发布失败',
        description: '操作过程中出现错误，请重试',
        variant: 'destructive'
      });
    } finally {
      setBatchProcessing(false);
    }
  }, [selectedDrafts, toast, clearSelection, loadData]);
  const handleBatchDelete = useCallback(async () => {
    if (selectedDrafts.size === 0) {
      toast({
        title: '请选择草稿',
        description: '请先选择要删除的草稿',
        variant: 'destructive'
      });
      return;
    }
    const confirmed = window.confirm(`确定要删除选中的 ${selectedDrafts.size} 个草稿吗？此操作不可恢复。`);
    if (!confirmed) return;
    setBatchProcessing(true);
    let successCount = 0;
    let failCount = 0;
    const failedItems = [];
    try {
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();

      // 批量处理
      for (const draftId of selectedDrafts) {
        try {
          await db.collection('red_story').doc(draftId).remove();
          successCount++;
        } catch (error) {
          console.error(`删除草稿 ${draftId} 失败:`, error);
          failCount++;
          failedItems.push(draftId);
        }
      }

      // 显示结果
      if (successCount > 0) {
        const message = `成功删除 ${successCount} 个草稿${failCount > 0 ? `，${failCount} 个失败` : ''}`;
        toast({
          title: '批量删除完成',
          description: message,
          variant: failCount > 0 ? 'destructive' : 'default'
        });
      }

      // 清空选择并重新加载数据
      clearSelection();
      loadData(true);
    } catch (error) {
      console.error('批量删除失败:', error);
      toast({
        title: '批量删除失败',
        description: '操作过程中出现错误，请重试',
        variant: 'destructive'
      });
    } finally {
      setBatchProcessing(false);
    }
  }, [selectedDrafts, toast, clearSelection, loadData]);

  // 单个故事操作函数
  const handleEditStory = useCallback((storyId, event) => {
    if (event) {
      event.stopPropagation();
    }
    handleNavigate('edit', {
      id: storyId
    });
  }, [handleNavigate]);
  const handleViewStory = useCallback((storyId, event) => {
    if (event) {
      event.stopPropagation();
    }
    handleNavigate('detail', {
      id: storyId
    });
  }, [handleNavigate]);
  const handleCreateStory = useCallback(() => {
    handleNavigate('upload');
  }, [handleNavigate]);
  const handlePublishStory = useCallback(async (storyId, event) => {
    if (event) {
      event.stopPropagation();
    }
    try {
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();
      await db.collection('red_story').doc(storyId).update({
        status: 'published',
        publishedAt: new Date(),
        updatedAt: new Date()
      });
      toast({
        title: '发布成功',
        description: '故事已成功发布'
      });

      // 重新加载数据
      loadData(true);
    } catch (error) {
      console.error('发布失败:', error);
      toast({
        title: '发布失败',
        description: '无法发布故事，请重试',
        variant: 'destructive'
      });
    }
  }, [toast, loadData]);
  const handleDeleteStory = useCallback(async (storyId, event) => {
    if (event) {
      event.stopPropagation();
    }
    const confirmed = window.confirm('确定要删除这个故事吗？此操作不可恢复。');
    if (!confirmed) return;
    try {
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();
      await db.collection('red_story').doc(storyId).remove();
      toast({
        title: '删除成功',
        description: '故事已成功删除'
      });

      // 重新加载数据
      loadData(true);
    } catch (error) {
      console.error('删除失败:', error);
      toast({
        title: '删除失败',
        description: '无法删除故事，请重试',
        variant: 'destructive'
      });
    }
  }, [toast, loadData]);

  // 刷新处理
  const handleRefresh = useCallback(() => {
    loadData(true);
  }, [loadData]);

  // 清除搜索
  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setFilterStatus('all');
  }, []);

  // 过滤数据
  const filteredStories = React.useMemo(() => {
    return stories.filter(story => {
      const matchesSearch = !searchTerm || (story.title || '').toLowerCase().includes(searchTerm.toLowerCase()) || (story.content || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || filterStatus === 'published';
      return matchesSearch && matchesStatus;
    });
  }, [stories, searchTerm, filterStatus]);
  const filteredDrafts = React.useMemo(() => {
    return drafts.filter(draft => {
      const matchesSearch = !searchTerm || (draft.title || '').toLowerCase().includes(searchTerm.toLowerCase()) || (draft.content || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || filterStatus === 'draft';
      return matchesSearch && matchesStatus;
    });
  }, [drafts, searchTerm, filterStatus]);

  // 计算主内容区域的边距
  const getMainMargin = useCallback(() => {
    if (!sidebarState.isDesktop) return 'ml-0';
    return sidebarState.isCollapsed ? 'md:ml-16' : 'md:ml-64';
  }, [sidebarState]);
  if (!isAuthenticated) {
    return <AdminPasswordGate onAuthenticated={() => setIsAuthenticated(true)} />;
  }
  return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <Sidebar currentPage="admin" navigateTo={navigateTo} onStateChange={setSidebarState} />

      {/* 主内容区域 - 响应式边距 */}
      <main className={cn("transition-all duration-300 ease-in-out", getMainMargin())}>
        {/* 页面头部 */}
        <header className="bg-slate-800/90 backdrop-blur-sm border-b border-slate-700">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button onClick={handleNavigateBack} disabled={navigating} variant="ghost" size="sm" className="text-slate-300 hover:text-white">
                  {navigating ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowLeft className="w-4 h-4 mr-2" />}
                  返回
                </Button>
                <h1 className="text-2xl font-bold text-white flex items-center">
                  <FileText className="w-6 h-6 mr-2 text-orange-500" />
                  管理中心
                </h1>
              </div>
              <div className="flex items-center space-x-2">
                <Button onClick={handleRefresh} disabled={refreshing || loading} variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                  {refreshing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                </Button>
                <Button onClick={handleCreateStory} disabled={navigating} className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600">
                  {navigating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                  新建故事
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* 搜索和过滤区域 */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-slate-700/50">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input type="text" placeholder="搜索故事标题或内容..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-300" />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="pl-10 pr-8 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-300">
                  <option value="all">全部状态</option>
                  <option value="published">已发布</option>
                  <option value="draft">草稿</option>
                </select>
              </div>
              <Button onClick={handleRefresh} disabled={refreshing || loading} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                {refreshing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                刷新
              </Button>
              <Button onClick={handleCreateStory} disabled={navigating} className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600">
                {navigating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                新建故事
              </Button>
            </div>
          </div>
        </div>

        {/* 统计信息 */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">已发布故事</p>
                    <p className="text-2xl font-bold text-white">{stories.length}</p>
                  </div>
                  <BookOpen className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">草稿箱</p>
                    <p className="text-2xl font-bold text-white">{drafts.length}</p>
                  </div>
                  <FileText className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">总计</p>
                    <p className="text-2xl font-bold text-white">{stories.length + drafts.length}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 故事列表 */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          {loading ? <div className="space-y-4">
              {[...Array(5)].map((_, index) => <div key={index} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 animate-pulse">
                  <div className="h-6 bg-slate-700 rounded w-1/3 mb-4"></div>
                  <div className="h-4 bg-slate-700 rounded w-2/3 mb-2"></div>
                  <div className="h-4 bg-slate-700 rounded w-1/2"></div>
                </div>)}
            </div> : error ? <ErrorState error={error} onRetry={() => loadData(true)} onClearSearch={clearSearch} isRetrying={refreshing} /> : <>
              {/* 已发布故事 */}
              {(filterStatus === 'all' || filterStatus === 'published') && <div className="mb-8">
                  <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                    <BookOpen className="w-5 h-5 mr-2 text-green-500" />
                    已发布故事 ({filteredStories.length})
                  </h2>
                  {filteredStories.length === 0 ? <div className="text-center py-8 bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/30">
                      <BookOpen className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                      <p className="text-slate-400">暂无已发布的故事</p>
                    </div> : <div className="space-y-4">
                      {filteredStories.map(story => <StoryCard key={story._id} story={story} type="published" onEdit={handleEditStory} onView={handleViewStory} onDelete={handleDeleteStory} />)}
                    </div>}
                </div>}

              {/* 草稿 */}
              {(filterStatus === 'all' || filterStatus === 'draft') && <div>
                  <BatchOperations selectedCount={selectedDrafts.size} totalCount={filteredDrafts.length} isAllSelected={selectedDrafts.size === filteredDrafts.length && filteredDrafts.length > 0} onSelectAll={handleSelectAllDrafts} onBatchPublish={handleBatchPublish} onBatchDelete={handleBatchDelete} isProcessing={batchProcessing} />
                  {filteredDrafts.length === 0 ? <div className="text-center py-8 bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/30">
                      <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                      <p className="text-slate-400">暂无草稿</p>
                    </div> : <div className="space-y-4">
                      {filteredDrafts.map(draft => <StoryCard key={draft._id} story={draft} type="draft" selected={selectedDrafts.has(draft._id)} onSelect={handleSelectDraft} onEdit={handleEditStory} onPublish={handlePublishStory} onDelete={handleDeleteStory} showCheckbox />)}
                    </div>}
                </div>}
            </>}
        </div>

        {/* 快速导航 */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <div className="flex justify-center space-x-4">
            <Button onClick={() => handleNavigate('index')} disabled={navigating} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
              {navigating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Home className="w-4 h-4 mr-2" />}
              返回首页
            </Button>
            <Button onClick={handleCreateStory} disabled={navigating} className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600">
              {navigating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
              新建故事
            </Button>
          </div>
        </div>
      </main>

      <MobileBottomNav currentPage="admin" navigateTo={navigateTo} />
    </div>;
}