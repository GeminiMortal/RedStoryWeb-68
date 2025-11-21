// @ts-ignore;
import React, { useState, useEffect, useCallback } from 'react';
// @ts-ignore;
import { Button, Card, CardContent, CardHeader, CardTitle, useToast } from '@/components/ui';
// @ts-ignore;
import { ArrowLeft, Plus, Search, Filter, BookOpen, FileText, Calendar, Loader2, Home, Settings, Menu, RefreshCw } from 'lucide-react';
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
// @ts-ignore;
import { StoryList } from '@/components/StoryList';
// @ts-ignore;
import { DraftList } from '@/components/DraftList';
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

  // 加载数据
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

      // 并行加载已发布故事和草稿
      const [storiesResult, draftsResult] = await Promise.all([db.collection('red_story').where({
        status: 'published'
      }).orderBy('publishedAt', 'desc').get(), db.collection('red_story_draft').orderBy('updatedAt', 'desc').get()]);
      const publishedStories = storiesResult.data || [];
      const draftStories = draftsResult.data || [];
      setStories(publishedStories);
      setDrafts(draftStories);

      // 清空选择状态
      setSelectedDrafts(new Set());
      if (showRefresh) {
        toast({
          title: '刷新成功',
          description: `已加载 ${publishedStories.length} 个已发布故事，${draftStories.length} 个草稿`,
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
              {(filterStatus === 'all' || filterStatus === 'published') && <StoryList stories={filteredStories} onViewDetail={storyId => navigateTo({
            pageId: 'detail',
            params: {
              id: storyId
            }
          })} onEditStory={storyId => navigateTo({
            pageId: 'edit',
            params: {
              id: storyId,
              type: 'published'
            }
          })} />}

              {/* 草稿 */}
              {(filterStatus === 'all' || filterStatus === 'draft') && <DraftList drafts={filteredDrafts} selectedDrafts={selectedDrafts} batchProcessing={batchProcessing} onSelectDraft={setSelectedDrafts} onEditDraft={draftId => navigateTo({
            pageId: 'edit',
            params: {
              id: draftId,
              type: 'draft'
            }
          })} onPublishDraft={async draftId => {
            // 发布草稿逻辑
            try {
              const tcb = await $w.cloud.getCloudInstance();
              const db = tcb.database();
              const draftResult = await db.collection('red_story_draft').doc(draftId).get();
              const draftData = draftResult.data;
              if (!draftData) return;
              const publishData = {
                ...draftData,
                status: 'published',
                publishedAt: new Date(),
                updatedAt: new Date(),
                views: 0,
                likes: 0
              };
              delete publishData.is_draft;
              delete publishData.draft_version;
              delete publishData.original_id;
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
            }
          }} onDeleteDraft={async draftId => {
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
          }} onBatchPublish={async draftIds => {
            const confirmed = window.confirm(`确定要发布选中的 ${draftIds.length} 个草稿吗？发布后将对所有用户可见。`);
            if (!confirmed) return;
            setBatchProcessing(true);
            let successCount = 0;
            let failCount = 0;
            try {
              const tcb = await $w.cloud.getCloudInstance();
              const db = tcb.database();
              for (const draftId of draftIds) {
                try {
                  const draftResult = await db.collection('red_story_draft').doc(draftId).get();
                  const draftData = draftResult.data;
                  if (!draftData) continue;
                  const publishData = {
                    ...draftData,
                    status: 'published',
                    publishedAt: new Date(),
                    updatedAt: new Date(),
                    views: 0,
                    likes: 0
                  };
                  delete publishData.is_draft;
                  delete publishData.draft_version;
                  delete publishData.original_id;
                  await db.collection('red_story').add(publishData);
                  await db.collection('red_story_draft').doc(draftId).remove();
                  successCount++;
                } catch (error) {
                  console.error(`发布草稿 ${draftId} 失败:`, error);
                  failCount++;
                }
              }
              const message = `成功发布 ${successCount} 个草稿${failCount > 0 ? `，${failCount} 个失败` : ''}`;
              toast({
                title: '批量发布完成',
                description: message,
                variant: failCount > 0 ? 'destructive' : 'default'
              });
              clearSelection();
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
          }} onBatchDelete={async draftIds => {
            const confirmed = window.confirm(`确定要删除选中的 ${draftIds.length} 个草稿吗？此操作不可恢复。`);
            if (!confirmed) return;
            setBatchProcessing(true);
            let successCount = 0;
            let failCount = 0;
            try {
              const tcb = await $w.cloud.getCloudInstance();
              const db = tcb.database();
              for (const draftId of draftIds) {
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
              clearSelection();
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
          }} />}
            </>}
        </div>
      </main>

      <MobileBottomNav currentPage="admin" navigateTo={navigateTo} />
    </div>;
}