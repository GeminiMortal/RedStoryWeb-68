// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { useToast } from '@/components/ui';
// @ts-ignore;
import { BookOpen, AlertCircle, ArrowLeft, Save, Send, Eye, Loader2, Home } from 'lucide-react';

// @ts-ignore;
import { Sidebar } from '@/components/Sidebar';
// @ts-ignore;
import { MobileBottomNav } from '@/components/MobileBottomNav';
// @ts-ignore;
import { ErrorAlert, LoadingError } from '@/components/ErrorAlert';
// @ts-ignore;
import { ValidatedInput, ValidatedTextarea, ValidatedTagInput } from '@/components/FieldValidation';
// @ts-ignore;
import { validateStoryData, validateField, calculateReadTime, sanitizeStoryData } from '@/lib/validation';
export default function EditPage(props) {
  const {
    $w
  } = props;
  const [storyData, setStoryData] = useState({
    title: '',
    content: '',
    author: '',
    image: '',
    tags: [],
    read_time: '5分钟阅读',
    location: '',
    date: ''
  });

  // 验证状态
  const [validationErrors, setValidationErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});

  // 操作状态
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [isDraft, setIsDraft] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [storyId, setStoryId] = useState(null);
  const [draftId, setDraftId] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const {
    toast
  } = useToast();
  const navigateTo = $w.utils.navigateTo;
  const navigateBack = $w.utils.navigateBack;

  // 从URL参数获取编辑信息
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const edit = urlParams.get('edit') === 'true';
    const draftIdParam = urlParams.get('draftId');
    const storyIdParam = urlParams.get('storyId');
    setEditMode(edit);
    setDraftId(draftIdParam);
    setStoryId(storyIdParam);
    if (edit && (draftIdParam || storyIdParam)) {
      loadStoryData(draftIdParam, storyIdParam);
    }
  }, []);

  // 监听侧边栏折叠状态
  useEffect(() => {
    const checkSidebarState = () => {
      const savedCollapsed = sessionStorage.getItem('sidebarCollapsed');
      setSidebarCollapsed(savedCollapsed === 'true');
    };
    checkSidebarState();

    // 监听 sessionStorage 变化
    const handleStorageChange = () => {
      checkSidebarState();
    };
    window.addEventListener('storage', handleStorageChange);

    // 定期检查状态变化
    const interval = setInterval(checkSidebarState, 500);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // 动态计算主内容区域的左边距
  const getMainContentClasses = () => {
    const baseClasses = "content-transition sidebar-transition animate-fade-in";
    if (sidebarCollapsed) {
      return `${baseClasses} md:ml-16`;
    } else {
      return `${baseClasses} md:ml-64`;
    }
  };

  // 加载故事数据
  const loadStoryData = async (draftIdParam, storyIdParam) => {
    try {
      setLoading(true);
      setLoadError(null);
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();
      let result;
      if (draftIdParam) {
        // 加载草稿数据
        result = await db.collection('red_story_draft').doc(draftIdParam).get();
        setIsDraft(true);
      } else if (storyIdParam) {
        // 加载已发布故事数据
        result = await db.collection('red_story').doc(storyIdParam).get();
        setIsDraft(false);
      }
      if (result && result.data) {
        const data = result.data;
        setStoryData({
          title: data.title || '',
          content: data.content || '',
          author: data.author || '',
          image: data.image || '',
          tags: data.tags || [],
          read_time: data.read_time || '5分钟阅读',
          location: data.location || '',
          date: data.date || ''
        });
        setLastSaved(data.lastSavedAt || data.updatedAt || data.createdAt);
        toast({
          title: '加载成功',
          description: '故事数据已加载'
        });
      } else {
        throw new Error('故事不存在');
      }
    } catch (error) {
      console.error('加载故事数据失败:', error);
      const errorMessage = error.message || '加载故事数据失败';
      setLoadError(errorMessage);
      toast({
        title: '加载失败',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // 实时验证单个字段
  const validateFieldRealTime = (fieldName, value) => {
    const error = validateField(fieldName, value);
    setValidationErrors(prev => ({
      ...prev,
      [fieldName]: error
    }));
    return !error;
  };

  // 处理字段变化
  const handleFieldChange = (fieldName, value) => {
    setStoryData(prev => ({
      ...prev,
      [fieldName]: value
    }));

    // 实时验证
    if (touchedFields[fieldName]) {
      validateFieldRealTime(fieldName, value);
    }

    // 自动计算阅读时间
    if (fieldName === 'content') {
      const readTime = calculateReadTime(value);
      setStoryData(prev => ({
        ...prev,
        read_time: readTime
      }));
    }
  };

  // 处理字段失焦
  const handleFieldBlur = fieldName => {
    setTouchedFields(prev => ({
      ...prev,
      [fieldName]: true
    }));
    validateFieldRealTime(fieldName, storyData[fieldName]);
  };

  // 处理标签变化
  const handleTagsChange = e => {
    const value = e.target.value;
    setStoryData(prev => ({
      ...prev,
      tags: value
    }));
    if (touchedFields.tags) {
      validateFieldRealTime('tags', value);
    }
  };

  // 预验证数据
  const preValidateData = data => {
    const sanitizedData = sanitizeStoryData(data);
    const validation = validateStoryData(sanitizedData, false);
    return validation;
  };

  // 保存草稿
  const handleSaveDraft = async () => {
    // 标记所有字段为已触摸
    const allFieldsTouched = Object.keys(storyData).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouchedFields(allFieldsTouched);

    // 预验证
    const validation = preValidateData(storyData);
    setValidationErrors(validation.errors);
    if (!validation.isValid) {
      toast({
        title: '验证失败',
        description: '请检查输入内容',
        variant: 'destructive'
      });
      return;
    }
    try {
      setSaving(true);
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();
      const now = new Date();
      const currentDraftId = draftId || `story_${Date.now()}`;
      const draftData = {
        ...sanitizeStoryData(storyData),
        story_id: storyId || currentDraftId,
        read_time: calculateReadTime(storyData.content),
        draftOwner: $w.auth.currentUser?.name || '匿名用户',
        lastSavedAt: now,
        createdAt: storyData.createdAt || now,
        status: 'draft'
      };
      await db.collection('red_story_draft').doc(currentDraftId).set(draftData);
      setDraftId(currentDraftId);
      setLastSaved(now);
      setIsDraft(true);
      toast({
        title: '保存成功',
        description: '草稿已保存'
      });
    } catch (error) {
      console.error('保存草稿失败:', error);
      toast({
        title: '保存失败',
        description: error.message || '请稍后重试',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  // 发布故事
  const handlePublish = async () => {
    // 标记所有字段为已触摸
    const allFieldsTouched = Object.keys(storyData).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouchedFields(allFieldsTouched);

    // 预验证
    const validation = preValidateData(storyData);
    setValidationErrors(validation.errors);
    if (!validation.isValid) {
      toast({
        title: '验证失败',
        description: '请检查输入内容',
        variant: 'destructive'
      });
      return;
    }
    try {
      setPublishing(true);
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();
      const now = new Date();
      const currentStoryId = storyId || `story_${Date.now()}`;

      // 准备发布数据
      const publishedData = {
        ...sanitizeStoryData(storyData),
        story_id: currentStoryId,
        read_time: calculateReadTime(storyData.content),
        createdAt: storyData.createdAt || now,
        updatedAt: now,
        status: 'published',
        views: storyData.views || 0,
        likes: storyData.likes || 0,
        share_count: storyData.share_count || 0
      };

      // 准备草稿数据
      const draftData = {
        ...sanitizeStoryData(storyData),
        story_id: currentStoryId,
        read_time: calculateReadTime(storyData.content),
        draftOwner: $w.auth.currentUser?.name || '匿名用户',
        lastSavedAt: now,
        createdAt: storyData.createdAt || now,
        status: 'draft'
      };

      // 同时存储到发布和草稿数据库
      await Promise.all([db.collection('red_story').doc(currentStoryId).set(publishedData), db.collection('red_story_draft').doc(currentStoryId).set(draftData)]);
      setStoryId(currentStoryId);
      setDraftId(currentStoryId);
      setLastSaved(now);
      setIsDraft(false);
      toast({
        title: '发布成功',
        description: '故事已发布并保存到草稿箱'
      });

      // 跳转到详情页
      navigateTo({
        pageId: 'detail',
        params: {
          id: currentStoryId
        }
      });
    } catch (error) {
      console.error('发布失败:', error);
      toast({
        title: '发布失败',
        description: error.message || '请稍后重试',
        variant: 'destructive'
      });
    } finally {
      setPublishing(false);
    }
  };

  // 预览功能
  const handlePreview = () => {
    if (!storyData.title || !storyData.content) {
      toast({
        title: '预览失败',
        description: '请先填写标题和内容',
        variant: 'destructive'
      });
      return;
    }
    setPreviewing(true);
    // 模拟预览功能
    setTimeout(() => {
      setPreviewing(false);
      toast({
        title: '预览功能',
        description: '预览功能开发中...'
      });
    }, 1000);
  };

  // 返回上一页
  const handleGoBack = () => {
    navigateBack();
  };

  // 返回首页
  const handleGoHome = () => {
    navigateTo({
      pageId: 'index',
      params: {}
    });
  };

  // 重试加载
  const handleRetry = () => {
    setLoadError(null);
    if (draftId || storyId) {
      loadStoryData(draftId, storyId);
    }
  };

  // 格式化日期
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

  // 如果有加载错误，显示错误组件
  if (loadError) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <Sidebar currentPage="edit" navigateTo={navigateTo} />
        <main className={getMainContentClasses()}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <LoadingError error={loadError} onRetry={handleRetry} onGoHome={handleGoHome} onGoBack={handleGoBack} />
          </div>
        </main>
        <MobileBottomNav currentPage="edit" navigateTo={navigateTo} />
      </div>;
  }
  return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <Sidebar currentPage="edit" navigateTo={navigateTo} />

      {/* 主内容区域 - 修复左边距问题 */}
      <main className={getMainContentClasses()}>
        {/* 桌面端头部 */}
        <header className="hidden md:block bg-slate-800/90 backdrop-blur-sm border-b border-slate-700 animate-slide-in">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-bold text-white">
                  {editMode ? '编辑故事' : '创建故事'}
                </h1>
                {isDraft && <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm border border-yellow-500/30">
                    草稿
                  </span>}
                {lastSaved && <span className="text-sm text-slate-400">
                    最后保存：{formatDate(lastSaved)}
                  </span>}
              </div>
              <div className="flex items-center space-x-4">
                <button onClick={handleGoBack} className="flex items-center text-slate-300 hover:text-white transition-colors">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  返回
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* 移动端返回栏 */}
        <div className="md:hidden bg-slate-800/90 backdrop-blur-sm border-b border-slate-700 px-4 py-3 flex items-center justify-between">
          <button onClick={handleGoBack} className="flex items-center text-slate-300 hover:text-white">
            <ArrowLeft className="w-5 h-5 mr-2" />
            返回
          </button>
          <h1 className="text-lg font-bold text-white">
            {editMode ? '编辑故事' : '创建故事'}
          </h1>
          <div className="w-16"></div>
        </div>

        {/* 主要内容区域 */}
        <div className="max-w-4xl mx-auto p-4 md:p-8 pb-24 md:pb-8">
          {loading ? <div className="animate-pulse space-y-6">
              <div className="h-10 bg-slate-700 rounded w-3/4"></div>
              <div className="h-12 bg-slate-700 rounded"></div>
              <div className="h-12 bg-slate-700 rounded"></div>
              <div className="h-32 bg-slate-700 rounded"></div>
              <div className="h-64 bg-slate-700 rounded"></div>
            </div> : <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6 shadow-2xl animate-fade-in">
              <div className="space-y-6">
                {/* 标题 */}
                <ValidatedInput label="故事标题" required fieldName="title" value={storyData.title} onChange={e => handleFieldChange('title', e.target.value)} onBlur={() => handleFieldBlur('title')} error={validationErrors.title} touched={touchedFields.title} placeholder="请输入故事标题" />

                {/* 上传者 */}
                <ValidatedInput label="上传者" required fieldName="author" value={storyData.author} onChange={e => handleFieldChange('author', e.target.value)} onBlur={() => handleFieldBlur('author')} error={validationErrors.author} touched={touchedFields.author} placeholder="请输入上传者姓名" />

                {/* 地点 */}
                <ValidatedInput label="发生地点" fieldName="location" value={storyData.location} onChange={e => handleFieldChange('location', e.target.value)} onBlur={() => handleFieldBlur('location')} error={validationErrors.location} touched={touchedFields.location} placeholder="请输入故事发生地点（可选）" />

                {/* 时间时期 */}
                <ValidatedInput label="时间时期" fieldName="date" value={storyData.date} onChange={e => handleFieldChange('date', e.target.value)} onBlur={() => handleFieldBlur('date')} error={validationErrors.date} touched={touchedFields.date} placeholder="例如：抗日战争时期（可选）" />

                {/* 阅读时间 */}
                <ValidatedInput label="阅读时间" fieldName="read_time" value={storyData.read_time} onChange={e => handleFieldChange('read_time', e.target.value)} onBlur={() => handleFieldBlur('read_time')} error={validationErrors.read_time} touched={touchedFields.read_time} placeholder="例如：5分钟阅读" />

                {/* 标签 - 改为非强制选项 */}
                <ValidatedTagInput label="标签" fieldName="tags" value={storyData.tags} onChange={handleTagsChange} onBlur={() => handleFieldBlur('tags')} error={validationErrors.tags} touched={touchedFields.tags} placeholder="输入标签后按回车添加（可选）" maxTags={10} />

                {/* 图片URL */}
                <ValidatedInput label="封面图片URL" fieldName="image" value={storyData.image} onChange={e => handleFieldChange('image', e.target.value)} onBlur={() => handleFieldBlur('image')} error={validationErrors.image} touched={touchedFields.image} placeholder="请输入图片URL" />

                {/* 内容 */}
                <ValidatedTextarea label="故事内容" required fieldName="content" value={storyData.content} onChange={e => handleFieldChange('content', e.target.value)} onBlur={() => handleFieldBlur('content')} error={validationErrors.content} touched={touchedFields.content} placeholder="请输入故事内容..." rows={12} showCharCount maxLength={5000} />

                {/* 操作按钮 */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-700">
                  <button onClick={handleSaveDraft} disabled={saving} className="flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white rounded-xl transition-all duration-300 transform hover:scale-105 button-press">
                    {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    {saving ? '保存中...' : '保存草稿'}
                  </button>
                  <button onClick={handlePublish} disabled={publishing} className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 disabled:from-red-800 disabled:to-orange-800 disabled:cursor-not-allowed text-white rounded-xl shadow-lg hover:shadow-red-500/25 transition-all duration-300 transform hover:scale-105 button-press">
                    {publishing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                    {publishing ? '发布中...' : '发布'}
                  </button>
                  <button onClick={handlePreview} disabled={previewing} className="flex items-center justify-center px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:cursor-not-allowed text-white rounded-xl transition-all duration-300 transform hover:scale-105 button-press">
                    {previewing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Eye className="w-4 h-4 mr-2" />}
                    {previewing ? '预览中...' : '预览'}
                  </button>
                  <button onClick={handleGoBack} className="flex items-center justify-center px-6 py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-xl transition-all duration-300 transform hover:scale-105 button-press">
                    取消
                  </button>
                </div>

                {/* 状态信息 */}
                <div className="flex flex-wrap gap-4 text-sm text-slate-400 pt-4 border-t border-slate-700">
                  {isDraft && <span className="flex items-center">
                    <BookOpen className="w-4 h-4 mr-1" />
                    当前为草稿状态
                  </span>}
                  {storyData.read_time && <span className="flex items-center">
                    <span className="w-4 h-4 mr-1">⏱</span>
                    预计阅读时间：{storyData.read_time}
                  </span>}
                  {storyData.tags && storyData.tags.length > 0 && <span className="flex items-center">
                    <span className="w-4 h-4 mr-1">🏷</span>
                    已添加 {storyData.tags.length} 个标签
                  </span>}
                </div>
              </div>
            </div>}
        </div>
      </main>

      <MobileBottomNav currentPage="edit" navigateTo={navigateTo} />
    </div>;
}