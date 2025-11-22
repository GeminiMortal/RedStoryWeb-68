// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { useToast } from '@/components/ui';
// @ts-ignore;
import { BookOpen, AlertCircle } from 'lucide-react';

// @ts-ignore;
import { Sidebar } from '@/components/Sidebar';
// @ts-ignore;
import { MobileBottomNav } from '@/components/MobileBottomNav';
// @ts-ignore;
import { ErrorAlert, LoadingError } from '@/components/ErrorAlert';
// @ts-ignore;
import { StoryForm } from '@/components/StoryForm';
// @ts-ignore;
import { StoryActions } from '@/components/StoryActions';
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
  const {
    toast
  } = useToast();
  const navigateTo = $w.utils.navigateTo;
  const navigateBack = $w.utils.navigateBack;

  // 从URL参数获取编辑模式和草稿ID
  const urlParams = new URLSearchParams(window.location.search);
  const editMode = urlParams.get('edit') === 'true';
  const draftId = urlParams.get('draftId');
  const storyId = urlParams.get('storyId');
  useEffect(() => {
    // 如果是编辑模式，加载数据
    if (editMode && (draftId || storyId)) {
      loadStoryData();
    }
  }, [editMode, draftId, storyId]);

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

  // 处理图片错误
  const handleImageError = errorMessage => {
    toast({
      title: '图片错误',
      description: errorMessage,
      variant: 'destructive'
    });
  };

  // 加载故事数据
  const loadStoryData = async () => {
    try {
      setLoading(true);
      setLoadError(null);
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();
      let result;
      if (draftId) {
        // 加载草稿数据
        result = await db.collection('red_story_draft').doc(draftId).get();
        setIsDraft(true);
      } else if (storyId) {
        // 加载已发布故事数据
        result = await db.collection('red_story').doc(storyId).get();
        setIsDraft(false);
      }
      if (result && result.data) {
        const data = result.data;
        setStoryData({
          title: data.title || '',
          content: data.content || '',
          author: data.author || data.draftOwner || '',
          image: data.image || '',
          tags: data.tags || [],
          read_time: data.read_time || '5分钟阅读',
          location: data.location || '',
          date: data.date || ''
        });
      } else {
        throw new Error('故事数据不存在');
      }
    } catch (error) {
      console.error('加载数据失败:', error);
      setLoadError(error.message || '无法加载故事数据，请重试');
      toast({
        title: '加载失败',
        description: '无法加载故事数据，请重试',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // 预验证数据
  const preValidateData = (data, isUpdate = false) => {
    const sanitizedData = sanitizeStoryData(data);
    const validation = validateStoryData(sanitizedData, isUpdate);
    return validation;
  };

  // 验证故事数据
  const validateStoryDataForm = () => {
    // 标记所有字段为已触摸
    const allFieldsTouched = Object.keys(storyData).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouchedFields(allFieldsTouched);

    // 预验证
    const validation = preValidateData(storyData, !isDraft);
    setValidationErrors(validation.errors);
    if (!validation.isValid) {
      toast({
        title: '验证失败',
        description: '请检查输入内容',
        variant: 'destructive'
      });
      return false;
    }
    return true;
  };

  // 保存草稿
  const handleSaveDraft = async () => {
    if (!validateStoryDataForm()) return;
    try {
      setSaving(true);
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();
      const now = new Date();
      const draftData = {
        ...sanitizeStoryData(storyData),
        read_time: calculateReadTime(storyData.content),
        lastSavedAt: now,
        createdAt: isDraft && draftId ? storyData.createdAt : now,
        status: 'draft'
      };
      let result;
      if (isDraft && draftId) {
        // 更新现有草稿
        result = await db.collection('red_story_draft').doc(draftId).update(draftData);
      } else {
        // 创建新草稿
        result = await db.collection('red_story_draft').add(draftData);
      }
      setLastSaved(now);
      toast({
        title: '保存成功',
        description: '故事已保存为草稿'
      });

      // 更新URL参数，表示现在是草稿编辑模式
      if (!isDraft && result.id) {
        const newUrl = `${window.location.pathname}?edit=true&draftId=${result.id}`;
        window.history.replaceState({}, '', newUrl);
        setIsDraft(true);
      }
    } catch (error) {
      console.error('保存草稿失败:', error);
      toast({
        title: '保存失败',
        description: '无法保存草稿，请重试',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  // 发布故事
  const handlePublish = async () => {
    if (!validateStoryDataForm()) return;

    // 确认发布
    const confirmPublish = window.confirm('确定要发布这个故事吗？发布后将对所有用户可见。');
    if (!confirmPublish) return;
    try {
      setPublishing(true);
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();
      const now = new Date();
      const publishedData = {
        ...sanitizeStoryData(storyData),
        read_time: calculateReadTime(storyData.content),
        createdAt: now,
        updatedAt: now,
        status: 'published',
        views: 0,
        like_count: 0,
        share_count: 0
      };
      let result;
      if (isDraft && draftId) {
        // 从草稿发布：先添加到正式表，然后删除草稿
        result = await db.collection('red_story').add(publishedData);
        if (result.id) {
          // 删除原草稿
          await db.collection('red_story_draft').doc(draftId).remove();
        }
      } else if (storyId) {
        // 更新已发布的故事
        result = await db.collection('red_story').doc(storyId).update(publishedData);
        result.id = storyId;
      } else {
        // 直接发布新故事
        result = await db.collection('red_story').add(publishedData);
      }
      toast({
        title: '发布成功',
        description: '故事已成功发布'
      });

      // 发布成功后跳转到故事详情页
      if (result.id) {
        navigateTo({
          pageId: 'detail',
          params: {
            id: result.id
          }
        });
      }
    } catch (error) {
      console.error('发布失败:', error);
      toast({
        title: '发布失败',
        description: '无法发布故事，请重试',
        variant: 'destructive'
      });
    } finally {
      setPublishing(false);
    }
  };

  // 预览故事
  const handlePreview = () => {
    if (!validateStoryDataForm()) return;
    try {
      setPreviewing(true);

      // 创建临时预览数据
      const previewData = {
        ...storyData,
        read_time: calculateReadTime(storyData.content),
        createdAt: new Date(),
        views: 0,
        _id: 'preview'
      };

      // 存储预览数据到 sessionStorage
      sessionStorage.setItem('storyPreview', JSON.stringify(previewData));

      // 打开新窗口预览
      const previewUrl = `${window.location.origin}/detail?id=preview`;
      window.open(previewUrl, '_blank');
      toast({
        title: '预览已打开',
        description: '故事预览已在新窗口中打开'
      });
    } catch (error) {
      console.error('预览失败:', error);
      toast({
        title: '预览失败',
        description: '无法打开预览，请重试',
        variant: 'destructive'
      });
    } finally {
      setPreviewing(false);
    }
  };

  // 返回
  const handleGoBack = () => {
    if (storyData.title || storyData.content) {
      const confirmLeave = window.confirm('您有未保存的更改，确定要离开吗？');
      if (!confirmLeave) return;
    }
    navigateBack();
  };

  // 重试加载
  const handleRetry = () => {
    setLoadError(null);
    loadStoryData();
  };

  // 加载状态
  if (loading) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <Sidebar currentPage="upload" navigateTo={navigateTo} />
        <main className="content-transition sidebar-transition md:ml-16 lg:ml-64">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-slate-700 rounded w-1/3"></div>
              <div className="h-64 bg-slate-700 rounded"></div>
              <div className="space-y-2">
                <div className="h-4 bg-slate-700 rounded"></div>
                <div className="h-4 bg-slate-700 rounded w-5/6"></div>
                <div className="h-4 bg-slate-700 rounded w-4/6"></div>
              </div>
            </div>
          </div>
        </main>
      </div>;
  }

  // 加载错误
  if (loadError) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <Sidebar currentPage="upload" navigateTo={navigateTo} />
        <main className="content-transition sidebar-transition md:ml-16 lg:ml-64 animate-fade-in">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <LoadingError error={loadError} onRetry={handleRetry} onGoBack={handleGoBack} />
          </div>
        </main>
        <MobileBottomNav currentPage="upload" navigateTo={navigateTo} />
      </div>;
  }
  return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <Sidebar currentPage="upload" navigateTo={navigateTo} />

      <main className="content-transition sidebar-transition md:ml-16 lg:ml-64 animate-fade-in">
        {/* 页面头部 */}
        <header className="bg-slate-800/90 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-40">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-5 h-5 text-red-500" />
                  <h1 className="text-xl font-semibold text-white">
                    {editMode ? isDraft ? '编辑草稿' : '编辑故事' : '创建新故事'}
                  </h1>
                </div>
                {isDraft && <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                    草稿模式
                  </span>}
              </div>
              <div className="flex items-center space-x-2">
                {lastSaved && <span className="text-xs text-slate-400">
                    最后保存: {lastSaved.toLocaleTimeString()}
                  </span>}
              </div>
            </div>
          </div>
        </header>

        {/* 编辑表单 */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            {/* 故事表单 */}
            <StoryForm storyData={storyData} validationErrors={validationErrors} touchedFields={touchedFields} onFieldChange={handleFieldChange} onFieldBlur={handleFieldBlur} onTagsChange={handleTagsChange} onImageError={handleImageError} />

            {/* 操作按钮 */}
            <StoryActions isDraft={isDraft} saving={saving} publishing={publishing} previewing={previewing} lastSaved={lastSaved} onSaveDraft={handleSaveDraft} onPublish={handlePublish} onPreview={handlePreview} onGoBack={handleGoBack} />
          </div>
        </div>
      </main>

      <MobileBottomNav currentPage="upload" navigateTo={navigateTo} />
    </div>;
}