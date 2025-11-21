// @ts-ignore;
import React, { useState, useEffect, useCallback } from 'react';
// @ts-ignore;
import { Button, Card, CardContent, CardHeader, CardTitle, useToast } from '@/components/ui';
// @ts-ignore;
import { ArrowLeft, Plus, Search, Filter, BookOpen, FileText, Calendar, Loader2, User, Settings, Menu, RefreshCw, Trash2, Send, CheckSquare, Square } from 'lucide-react';
// @ts-ignore;
import { cn } from '@/lib/utils';

// @ts-ignore;
import { Sidebar } from '@/components/Sidebar';
// @ts-ignore;
import { MobileBottomNav } from '@/components/MobileBottomNav';
// @ts-ignore;
import { AdminPasswordGate } from '@/components/AdminPasswordGate';
// @ts-ignore;
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
// @ts-ignore;
import { ErrorState } from '@/components/ErrorState';
// @ts-ignore;
import { AdminStats } from '@/components/AdminStats';
// @ts-ignore;
import { AdminSearch } from '@/components/AdminSearch';
export default function AdminPage(props) {
  const {
    $w
  } = props;
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [stories, setStories] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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

  // 统一的数据模型调用 - 使用标准字段名
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

      // 并行加载已发布故事和草稿 - 使用标准字段名
      const [storiesResult, draftsResult] = await Promise.all([db.collection('red_story').where({
        status: 'published'
      }).orderBy('updatedAt', 'desc').get(), db.collection('red_story_draft').orderBy('updatedAt', 'desc').get()]);
      const publishedStories = storiesResult.data || [];
      const draftStories = draftsResult.data || [];

      // 标准化字段映射
      const normalizedStories = publishedStories.map(story => ({
        id: story.story_id || story._id,
        title: story.title || '无标题',
        content: story.content || '',
        author: story.author || '佚名',
        image: story.image || '',
        date: story.date || '',
        location: story.location || '',
        read_time: story.read_time || '',
        tags: story.tags || [],
        status: story.status || 'published',
        createdAt: story.createdAt || new Date(),
        updatedAt: story.updatedAt || new Date()
      }));
      const normalizedDrafts = draftStories.map(draft => ({
        id: draft.story_id || draft._id,
        title: draft.title || '无标题',
        content: draft.content || '',
        author: draft.author || '佚名',
        image: draft.image || '',
        date: draft.date || '',
        location: draft.location || '',
        read_time: draft.read_time || '',
        tags: draft.tags || [],
        status: draft.status || 'draft',
        is_draft: draft.is_draft || true,
        draft_version: draft.draft_version || 1,
        original_id: draft.original_id || null,
        createdAt: draft.createdAt || new Date(),
        updatedAt: draft.updatedAt || new Date()
      }));
      setStories(normalizedStories);
      setDrafts(normalizedDrafts);

      // 清空选择状态
      setSelectedDrafts(new Set());
      if (showRefresh) {
        toast({
          title: '刷新成功',
          description: `已加载 ${normalizedStories.length} 个已发布故事，${normalizedDrafts.length} 个草稿`,
          duration: 3000
        });
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
  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated, loadData]);

  // 计算主内容区域的边距
  const getMainMargin = useCallback(() => {
    if (!sidebarState.isDesktop) return 'ml-0';
    return sidebarState.isCollapsed ? 'md:ml-16' : 'md:ml-64';
  }, [sidebarState]);

  // 过滤数据
  const getFilteredStories = useCallback(() => {
    return stories.filter(story => {
      const matchesSearch = !searchTerm || (story.title || '').toLowerCase().includes(searchTerm.toLowerCase()) || (story.content || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || filterStatus === 'published';
      return matchesSearch && matchesStatus;
    });
  }, [stories, searchTerm, filterStatus]);
  const getFilteredDrafts = useCallback(() => {
    return drafts.filter(draft => {
      const matchesSearch = !searchTerm || (draft.title || '').toLowerCase().includes(searchTerm.toLowerCase()) || (draft.content || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || filterStatus === 'draft';
      return matchesSearch && matchesStatus;
    });
  }, [drafts, searchTerm, filterStatus]);
  const filteredStories = getFilteredStories();
  const filteredDrafts = getFilteredDrafts();

  // 创建新故事
  const handleCreateStory = useCallback(() => {
    navigateTo({
      pageId: 'upload'
    });
  }, [navigateTo]);

  // 刷新处理
  const handleRefresh = useCallback(() => {
    loadData(true);
  }, [loadData]);

  // 处理草稿选择
  const handleSelectDraft = draftId => {
    const newSelected = new Set(selectedDrafts);
    if (newSelected.has(draftId)) {
      newSelected.delete(draftId);
    } else {
      newSelected.add(draftId);
    }
    setSelectedDrafts(newSelected);
  };

  // 处理全选
  const handleSelectAll = () => {
    const filteredDrafts = getFilteredDrafts();
    if (selectedDrafts.size === filteredDrafts.length) {
      setSelectedDrafts(new Set());
    } else {
      setSelectedDrafts(new Set(filteredDrafts.map(draft => draft.id)));
    }
  };

  // 发布草稿
  const handlePublishDraft = async draftId => {
    const confirmed = window.confirm('确定要发布这个草稿吗？发布后将对所有用户可见。');
    if (!confirmed) return;
    try {
      setBatchProcessing(true);
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();
      const draftResult = await db.collection('red_story_draft').doc(draftId).get();
      const draftData = draftResult.data;
      if (!draftData) {
        toast({
          title: '草稿不存在',
          description: '无法找到该草稿',
          variant: 'destructive'
        });
        return;
      }

      // 标准化发布数据
      const publishData = {
        title: draftData.title || '',
        content: draftData.content || '',
        author: draftData.author || '佚名',
        image: draftData.image || '',
        date: draftData.date || '',
        location: draftData.location || '',
        read_time: draftData.read_time || '',
        tags: draftData.tags || [],
        status: 'published',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const publishResult = await db.collection('red_story').add(publishData);
      await db.collection('red_story_draft').doc(draftId).remove();
      toast({
        title: '发布成功',
        description: '草稿已成功发布并删除',
        variant: 'default'
      });
      navigateTo({
        pageId: 'detail',
        params: {
          id: publishResult.id
        }
      });
      loadData(true);
    } catch (error) {
      toast({
        title: '发布失败',
        description: error.message || '无法发布草稿',
        variant: 'destructive'
      });
    } finally {
      setBatchProcessing(false);
    }
  };

  // 删除草稿
  const handleDeleteDraft = async draftId => {
    const confirmed = window.confirm('确定要删除这个草稿吗？此操作不可恢复。');
    if (!confirmed) return;
    try {
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();
      await db.collection('red_story_draft').doc(draftId).remove();
      toast({
        title: '删除成功',
        description: '草稿已成功删除'
      });
      loadData(true);
    } catch (error) {
      toast({
        title: '删除失败',
        description: error.message || '无法删除草稿',
        variant: 'destructive'
      });
    }
  };

  // 批量发布
  const handleBatchPublish = async () => {
    const selectedDraftList = getFilteredDrafts().filter(draft => selectedDrafts.has(draft.id));
    if (selectedDraftList.length === 0) return;
    const confirmed = window.confirm(`确定要发布选中的 ${selectedDraftList.length} 个草稿吗？发布后将对所有用户可见。`);
    if (!confirmed) return;
    setBatchProcessing(true);
    let successCount = 0;
    let failCount = 0;
    try {
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();
      for (const draft of selectedDraftList) {
        try {
          const publishData = {
            title: draft.title || '',
            content: draft.content || '',
            author: draft.author || '佚名',
            image: draft.image || '',
            date: draft.date || '',
            location: draft.location || '',
            read_time: draft.read_time || '',
            tags: draft.tags || [],
            status: 'published',
            createdAt: new Date(),
            updatedAt: new Date()
          };
          const publishResult = await db.collection('red_story').add(publishData);
          await db.collection('red_story_draft').doc(draft.id).remove();
          successCount++;
        } catch (error) {
          console.error(`发布草稿 ${draft.id} 失败:`, error);
          failCount++;
        }
      }
      const message = `成功发布 ${successCount} 个草稿${failCount > 0 ? `，${failCount} 个失败` : ''}`;
      toast({
        title: '批量发布完成',
        description: message,
        variant: failCount > 0 ? 'destructive' : 'default'
      });
      setSelectedDrafts(new Set());
      loadData(true);
    } catch (error) {
      toast({
        title: '批量发布失败',
        description: '操作过程中出现错误，请重试',
        variant: 'destructive'
      });
    } finally {
      setBatchProcessing(false);
    }
  };

  // 批量删除
  const handleBatchDelete = async () => {
    const selectedDraftList = getFilteredDrafts().filter(draft => selectedDrafts.has(draft.id));
    if (selectedDraftList.length === 0) return;
    const confirmed = window.confirm(`确定要删除选中的 ${selectedDraftList.length} 个草稿吗？此操作不可恢复。`);
    if (!confirmed) return;
    setBatchProcessing(true);
    let successCount = 0;
    let failCount = 0;
    try {
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();
      for (const draftId of selectedDraftList.map(d => d.id)) {
        try {
          await db.collection('red_story_draft').doc(draftId).remove();
          successCount++;
        } catch (error) {
          console.error(`删除草稿 ${draftId} 失败:`, error);
          failCount++;
        }
      }
      const message = `成功删除 ${successCount} 个草稿${failCount > 0 ? `，${failCount} 个失败` : ''}`;
      toast({
        title: '批量删除完成',
        description: message,
        variant: failCount > 0 ? 'destructive' : 'default'
      });
      setSelectedDrafts(new Set());
      loadData(true);
    } catch (error) {
      toast({
        title: '批量删除失败',
        description: '操作过程中出现错误，请重试',
        variant: 'destructive'
      });
    } finally {
      setBatchProcessing(false);
    }
  };

  // 格式化日期
  const formatDate = timestamp => {
    if (!timestamp) return '未知时间';
    try {
      return new Date(timestamp).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return '日期格式错误';
    }
  };
  if (!isAuthenticated) {
    return <AdminPasswordGate onAuthenticated={() => setIsAuthenticated(true)} />;
  }
  return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <Sidebar currentPage="admin" navigateTo={navigateTo} onStateChange={setSidebarState} />

      {/* 主内容区域 */}
      <main className={cn("transition-all duration-300 ease-in-out", getMainMargin())}>
        {/* 页面头部 */}
        <header className="bg-slate-800/90 backdrop-blur-sm border-b border-slate-700">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button onClick={navigateBack} variant="ghost" size="sm" className="text-slate-300 hover:text-white">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  返回
                </Button>
                <h1 className="text-2xl font-bold text-white flex items-center">
                  <Settings className="w-6 h-6 mr-2 text-orange-500" />
                  管理中心
                </h1>
              </div>
              <div className="flex items-center space-x-2">
                <Button onClick={handleRefresh} disabled={refreshing || loading} variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                  {refreshing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                </Button>
                <Button onClick={handleCreateStory} className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600">
                  <Plus className="w-4 h-4 mr-2" />
                  新建故事
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* 搜索和统计区域 */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          <AdminSearch searchTerm={searchTerm} filterStatus={filterStatus} onSearchChange={setSearchTerm} onFilterChange={setFilterStatus} />
          
          <AdminStats publishedCount={filteredStories.length} draftCount={filteredDrafts.length} totalCount={filteredStories.length + filteredDrafts.length} />
        </div>

        {/* 内容列表 */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          {loading ? <LoadingSkeleton count={5} type="story" /> : error ? <ErrorState message={error} onRetry={() => loadData(true)} onClear={() => {
          setSearchTerm('');
          setFilterStatus('all');
        }} /> : <>
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
                      {filteredStories.map(story => <Card key={story.id} className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 hover:border-green-500/50 transition-all duration-300">
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-white mb-2">{story.title}</h3>
                                <p className="text-slate-400 text-sm mb-3 line-clamp-2">{story.content}</p>
                                <div className="flex items-center space-x-4 text-xs text-slate-500">
                                  <span className="flex items-center">
                                    <User className="w-3 h-3 mr-1" />
                                    {story.author}
                                  </span>
                                  <span className="flex items-center">
                                    <Calendar className="w-3 h-3 mr-1" />
                                    {formatDate(story.updatedAt)}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2 ml-4">
                                <Button onClick={() => navigateTo({
                        pageId: 'detail',
                        params: {
                          id: story.id
                        }
                      })} variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                                  <BookOpen className="w-4 h-4" />
                                </Button>
                                <Button onClick={() => navigateTo({
                        pageId: 'edit',
                        params: {
                          id: story.id,
                          type: 'published'
                        }
                      })} variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                                  编辑
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>)}
                    </div>}
                </div>}

              {/* 草稿 */}
              {(filterStatus === 'all' || filterStatus === 'draft') && <div>
                  {/* 批量操作栏 */}
                  {filteredDrafts.length > 0 && <div className="mb-4 p-4 bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50">
                      <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-white flex items-center">
                          <FileText className="w-5 h-5 mr-2 text-blue-500" />
                          草稿箱 ({filteredDrafts.length})
                        </h2>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-slate-400">
                            已选择 {selectedDrafts.size} 个
                          </span>
                          <Button onClick={handleSelectAll} variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                            {selectedDrafts.size === filteredDrafts.length ? <CheckSquare className="w-4 h-4 mr-2" /> : <Square className="w-4 h-4 mr-2" />}
                            {selectedDrafts.size === filteredDrafts.length ? '取消全选' : '全选'}
                          </Button>
                          {selectedDrafts.size > 0 && <>
                              <Button onClick={handleBatchPublish} disabled={batchProcessing} variant="outline" size="sm" className="border-green-600 text-green-400 hover:bg-green-600/10">
                                <Send className="w-4 h-4 mr-2" />
                                批量发布
                              </Button>
                              <Button onClick={handleBatchDelete} disabled={batchProcessing} variant="outline" size="sm" className="border-red-600 text-red-400 hover:bg-red-600/10">
                                <Trash2 className="w-4 h-4 mr-2" />
                                批量删除
                              </Button>
                            </>}
                        </div>
                      </div>
                    </div>}

                  {filteredDrafts.length === 0 ? <div className="text-center py-8 bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/30">
                      <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                      <p className="text-slate-400">暂无草稿</p>
                    </div> : <div className="space-y-4">
                      {filteredDrafts.map(draft => <Card key={draft.id} className={`bg-slate-800/50 backdrop-blur-sm border transition-all duration-300 ${selectedDrafts.has(draft.id) ? "border-blue-500/50 bg-blue-500/5" : "border-slate-700/50 hover:border-blue-500/50"}`}>
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-3 flex-1">
                                <Button onClick={() => handleSelectDraft(draft.id)} variant="ghost" size="sm" className="mt-1 p-1">
                                  {selectedDrafts.has(draft.id) ? <CheckSquare className="w-4 h-4 text-blue-400" /> : <Square className="w-4 h-4 text-slate-400" />}
                                </Button>
                                <div className="flex-1">
                                  <h3 className="text-lg font-semibold text-white mb-2">
                                    {draft.title}
                                  </h3>
                                  <p className="text-slate-400 text-sm mb-3 line-clamp-2">
                                    {draft.content}
                                  </p>
                                  <div className="flex items-center space-x-4 text-xs text-slate-500">
                                    <span className="flex items-center">
                                      <User className="w-3 h-3 mr-1" />
                                      {draft.author}
                                    </span>
                                    <span className="flex items-center">
                                      <Calendar className="w-3 h-3 mr-1" />
                                      {formatDate(draft.updatedAt)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2 ml-4">
                                <Button onClick={() => navigateTo({
                        pageId: 'edit',
                        params: {
                          id: draft.id,
                          type: 'draft'
                        }
                      })} variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                                  编辑
                                </Button>
                                <Button onClick={() => handlePublishDraft(draft.id)} variant="ghost" size="sm" className="text-slate-400 hover:text-green-400">
                                  发布
                                </Button>
                                <Button onClick={() => handleDeleteDraft(draft.id)} variant="ghost" size="sm" className="text-slate-400 hover:text-red-400">
                                  删除
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>)}
                    </div>}
                </div>}
            </>}
        </div>
      </main>

      <MobileBottomNav currentPage="admin" navigateTo={navigateTo} />
    </div>;
}