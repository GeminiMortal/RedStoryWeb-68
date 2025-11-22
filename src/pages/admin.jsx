// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button, Card, CardContent, CardHeader, CardTitle, useToast } from '@/components/ui';
// @ts-ignore;
import { ArrowLeft, Edit3, Trash2, Eye, Plus, Search, Filter, BookOpen, Clock, User, Calendar, Send, Loader2, Home, FileText, CheckSquare, Square } from 'lucide-react';
// @ts-ignore;
import { cn } from '@/lib/utils';

// @ts-ignore;
import { Sidebar } from '@/components/Sidebar';
// @ts-ignore;
import { MobileBottomNav } from '@/components/MobileBottomNav';
// @ts-ignore;
import { AdminPasswordGate } from '@/components/AdminPasswordGate';
export default function AdminPage(props) {
  const {
    $w
  } = props;
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [stories, setStories] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [navigating, setNavigating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedDrafts, setSelectedDrafts] = useState(new Set());
  const [batchProcessing, setBatchProcessing] = useState(false);
  const {
    toast
  } = useToast();
  const navigateTo = $w.utils.navigateTo;
  const navigateBack = $w.utils.navigateBack;

  // 优化的导航函数
  const handleNavigate = async (pageId, params = {}) => {
    if (navigating) return; // 防止重复点击

    try {
      setNavigating(true);

      // 添加导航延迟以显示加载状态
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
  };

  // 优化的返回函数
  const handleNavigateBack = async () => {
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
  };

  // 选择管理函数
  const handleSelectDraft = draftId => {
    const newSelected = new Set(selectedDrafts);
    if (newSelected.has(draftId)) {
      newSelected.delete(draftId);
    } else {
      newSelected.add(draftId);
    }
    setSelectedDrafts(newSelected);
  };
  const handleSelectAllDrafts = () => {
    if (selectedDrafts.size === filteredDrafts.length) {
      setSelectedDrafts(new Set());
    } else {
      setSelectedDrafts(new Set(filteredDrafts.map(draft => draft._id)));
    }
  };
  const clearSelection = () => {
    setSelectedDrafts(new Set());
  };

  // 批量操作函数
  const handleBatchPublish = async () => {
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
    try {
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();
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
        }
      }
      if (successCount > 0) {
        toast({
          title: '批量发布完成',
          description: `成功发布 ${successCount} 个草稿${failCount > 0 ? `，${failCount} 个失败` : ''}`,
          variant: failCount > 0 ? 'destructive' : 'default'
        });
      }

      // 清空选择并重新加载数据
      clearSelection();
      loadData();
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
  };
  const handleBatchDelete = async () => {
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
    try {
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();
      for (const draftId of selectedDrafts) {
        try {
          await db.collection('red_story').doc(draftId).remove();
          successCount++;
        } catch (error) {
          console.error(`删除草稿 ${draftId} 失败:`, error);
          failCount++;
        }
      }
      if (successCount > 0) {
        toast({
          title: '批量删除完成',
          description: `成功删除 ${successCount} 个草稿${failCount > 0 ? `，${failCount} 个失败` : ''}`,
          variant: failCount > 0 ? 'destructive' : 'default'
        });
      }

      // 清空选择并重新加载数据
      clearSelection();
      loadData();
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
  };

  // 故事操作函数
  const handleEditStory = (storyId, event) => {
    if (event) {
      event.stopPropagation();
    }
    handleNavigate('edit', {
      id: storyId
    });
  };
  const handleViewStory = (storyId, event) => {
    if (event) {
      event.stopPropagation();
    }
    handleNavigate('detail', {
      id: storyId
    });
  };
  const handleCreateStory = () => {
    handleNavigate('upload');
  };
  const handlePublishStory = async (storyId, event) => {
    if (event) {
      event.stopPropagation();
    }
    const confirmed = window.confirm('确定要发布这个故事吗？发布后将对所有用户可见。');
    if (!confirmed) return;
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
      loadData();
    } catch (error) {
      console.error('发布失败:', error);
      toast({
        title: '发布失败',
        description: '无法发布故事，请重试',
        variant: 'destructive'
      });
    }
  };
  const handleDeleteStory = async (storyId, event) => {
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
      loadData();
    } catch (error) {
      console.error('删除失败:', error);
      toast({
        title: '删除失败',
        description: '无法删除故事，请重试',
        variant: 'destructive'
      });
    }
  };

  // 加载数据
  const loadData = async () => {
    try {
      setLoading(true);
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();

      // 加载所有故事
      const storiesResult = await db.collection('red_story').orderBy('updatedAt', 'desc').get();
      if (storiesResult && storiesResult.data) {
        const allStories = storiesResult.data;
        setStories(allStories.filter(story => story.status === 'published'));
        setDrafts(allStories.filter(story => story.status === 'draft'));
      }
    } catch (error) {
      console.error('加载数据失败:', error);
      toast({
        title: '加载失败',
        description: '无法加载故事数据',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  // 过滤数据
  const filteredStories = stories.filter(story => {
    const matchesSearch = (story.title || '').toLowerCase().includes(searchTerm.toLowerCase()) || (story.content || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || filterStatus === 'published';
    return matchesSearch && matchesStatus;
  });
  const filteredDrafts = drafts.filter(draft => {
    const matchesSearch = (draft.title || '').toLowerCase().includes(searchTerm.toLowerCase()) || (draft.content || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || filterStatus === 'draft';
    return matchesSearch && matchesStatus;
  });
  const formatDate = timestamp => {
    if (!timestamp) return '未知时间';
    return new Date(timestamp).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  if (!isAuthenticated) {
    return <AdminPasswordGate onAuthenticated={() => setIsAuthenticated(true)} />;
  }
  return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <Sidebar currentPage="admin" navigateTo={navigateTo} />

      {/* 主内容区域 - 与index界面完全一致的布局关系 */}
      <main className="content-transition sidebar-transition md:ml-16 lg:ml-64 animate-fade-in">
        {/* 页面头部 */}
        <header className="bg-slate-800/90 backdrop-blur-sm border-b border-slate-700 animate-slide-in">
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
          <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-slate-700/50 hover-lift">
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
              {/* 移除了搜索框边上的添加按钮 */}
            </div>
          </div>
        </div>

        {/* 统计信息 */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 rounded-2xl overflow-hidden shadow-xl card-hover">
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
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 rounded-2xl overflow-hidden shadow-xl card-hover">
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
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 rounded-2xl overflow-hidden shadow-xl card-hover">
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
            </div> : <>
              {/* 已发布故事 */}
              {(filterStatus === 'all' || filterStatus === 'published') && <div className="mb-8 animate-fade-in">
                  <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                    <BookOpen className="w-5 h-5 mr-2 text-green-500" />
                    已发布故事 ({filteredStories.length})
                  </h2>
                  {filteredStories.length === 0 ? <div className="text-center py-8 bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/30">
                      <BookOpen className="w-16 h-16 text-slate-600 mx-auto mb-4 animate-bounce" />
                      <p className="text-slate-400">暂无已发布的故事</p>
                    </div> : <div className="space-y-4">
                      {filteredStories.map((story, index) => <div key={story._id} className="group animate-fade-in" style={{
                animationDelay: `${index * 100}ms`
              }}>
                          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 rounded-2xl overflow-hidden shadow-xl card-hover hover:border-green-500/50 transition-all duration-300">
                            <CardContent className="p-6">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-green-400 transition-colors duration-300">{story.title || '无标题'}</h3>
                                  <p className="text-slate-400 text-sm mb-3 line-clamp-2">{story.content || '暂无内容'}</p>
                                  <div className="flex items-center space-x-4 text-xs text-slate-500">
                                    <span className="flex items-center bg-slate-700/50 px-2 py-1 rounded-full">
                                      <User className="w-3 h-3 mr-1" />
                                      {story.author || '佚名'}
                                    </span>
                                    <span className="flex items-center bg-slate-700/50 px-2 py-1 rounded-full">
                                      <Calendar className="w-3 h-3 mr-1" />
                                      {formatDate(story.updatedAt)}
                                    </span>
                                    <span className="flex items-center bg-slate-700/50 px-2 py-1 rounded-full">
                                      <Eye className="w-3 h-3 mr-1" />
                                      {story.views || 0}次阅读
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2 ml-4">
                                  <Button onClick={e => handleViewStory(story._id, e)} variant="ghost" size="sm" className="text-slate-400 hover:text-white transition-all duration-200 button-press">
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                  <Button onClick={e => handleEditStory(story._id, e)} variant="ghost" size="sm" className="text-slate-400 hover:text-white transition-all duration-200 button-press">
                                    <Edit3 className="w-4 h-4" />
                                  </Button>
                                  <Button onClick={e => handleDeleteStory(story._id, e)} variant="ghost" size="sm" className="text-slate-400 hover:text-red-400 transition-all duration-200 button-press">
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>)}
                    </div>}
                </div>}

              {/* 草稿 */}
              {(filterStatus === 'all' || filterStatus === 'draft') && <div className="animate-fade-in" style={{
            animationDelay: '0.2s'
          }}>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-white flex items-center">
                      <FileText className="w-5 h-5 mr-2 text-blue-500" />
                      草稿箱 ({filteredDrafts.length})
                    </h2>
                    {filteredDrafts.length > 0 && <div className="flex items-center space-x-2">
                        <span className="text-sm text-slate-400">
                          已选择 {selectedDrafts.size} 个
                        </span>
                        <Button onClick={handleSelectAllDrafts} variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-700 transition-all duration-200">
                          {selectedDrafts.size === filteredDrafts.length ? <CheckSquare className="w-4 h-4 mr-2" /> : <Square className="w-4 h-4 mr-2" />}
                          {selectedDrafts.size === filteredDrafts.length ? '取消全选' : '全选'}
                        </Button>
                        {selectedDrafts.size > 0 && <>
                            <Button onClick={handleBatchPublish} disabled={batchProcessing} variant="outline" size="sm" className="border-green-600 text-green-400 hover:bg-green-600/10 transition-all duration-200">
                              {batchProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                              批量发布
                            </Button>
                            <Button onClick={handleBatchDelete} disabled={batchProcessing} variant="outline" size="sm" className="border-red-600 text-red-400 hover:bg-red-600/10 transition-all duration-200">
                              {batchProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                              批量删除
                            </Button>
                          </>}
                      </div>}
                  </div>
                  {filteredDrafts.length === 0 ? <div className="text-center py-8 bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/30">
                      <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4 animate-bounce" />
                      <p className="text-slate-400">暂无草稿</p>
                    </div> : <div className="space-y-4">
                      {filteredDrafts.map((draft, index) => <div key={draft._id} className="group animate-fade-in" style={{
                animationDelay: `${index * 100 + 200}ms`
              }}>
                          <Card className={cn("bg-slate-800/50 backdrop-blur-sm border rounded-2xl overflow-hidden shadow-xl transition-all duration-300", selectedDrafts.has(draft._id) ? "border-blue-500/50 bg-blue-500/5" : "border-slate-700/50 hover:border-blue-500/50")}>
                            <CardContent className="p-6">
                              <div className="flex items-start justify-between">
                                <div className="flex items-start space-x-3 flex-1">
                                  <Button onClick={() => handleSelectDraft(draft._id)} variant="ghost" size="sm" className="mt-1 p-1">
                                    {selectedDrafts.has(draft._id) ? <CheckSquare className="w-4 h-4 text-blue-400" /> : <Square className="w-4 h-4 text-slate-400" />}
                                  </Button>
                                  <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors duration-300">{draft.title || '无标题'}</h3>
                                    <p className="text-slate-400 text-sm mb-3 line-clamp-2">{draft.content || '暂无内容'}</p>
                                    <div className="flex items-center space-x-4 text-xs text-slate-500">
                                      <span className="flex items-center bg-slate-700/50 px-2 py-1 rounded-full">
                                        <User className="w-3 h-3 mr-1" />
                                        {draft.author || '佚名'}
                                      </span>
                                      <span className="flex items-center bg-slate-700/50 px-2 py-1 rounded-full">
                                        <Calendar className="w-3 h-3 mr-1" />
                                        {formatDate(draft.updatedAt)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2 ml-4">
                                  <Button onClick={e => handleEditStory(draft._id, e)} variant="ghost" size="sm" className="text-slate-400 hover:text-white transition-all duration-200 button-press">
                                    <Edit3 className="w-4 h-4" />
                                  </Button>
                                  <Button onClick={e => handlePublishStory(draft._id, e)} variant="ghost" size="sm" className="text-slate-400 hover:text-green-400 transition-all duration-200 button-press">
                                    <Send className="w-4 h-4" />
                                  </Button>
                                  <Button onClick={e => handleDeleteStory(draft._id, e)} variant="ghost" size="sm" className="text-slate-400 hover:text-red-400 transition-all duration-200 button-press">
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>)}
                    </div>}
                </div>}
            </>}
        </div>

        {/* 快速导航 */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <div className="flex justify-center space-x-4">
            <Button onClick={() => handleNavigate('index')} disabled={navigating} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700 transition-all duration-200">
              {navigating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Home className="w-4 h-4 mr-2" />}
              返回首页
            </Button>
            <Button onClick={handleCreateStory} disabled={navigating} className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 shadow-lg hover:shadow-red-500/25 transition-all duration-300 transform hover:scale-105 button-press">
              {navigating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
              新建故事
            </Button>
          </div>
        </div>
      </main>

      <MobileBottomNav currentPage="admin" navigateTo={navigateTo} />
    </div>;
}