// @ts-ignore;
import React, { useState, useEffect, useRef } from 'react';
// @ts-ignore;
import { Button, Card, CardContent, CardHeader, CardTitle, useToast } from '@/components/ui';
// @ts-ignore;
import { ArrowLeft, Save, Eye, FileText, Image as ImageIcon, Tag, User, Calendar, Clock, Send, BookOpen, AlertCircle } from 'lucide-react';
// @ts-ignore;
import { cn } from '@/lib/utils';

// @ts-ignore;
import { Sidebar } from '@/components/Sidebar';
// @ts-ignore;
import { MobileBottomNav } from '@/components/MobileBottomNav';
// @ts-ignore;
import { ErrorBoundary, DataLoadError } from '@/components/ErrorBoundary';
// @ts-ignore;
import { FormField, TagInput, ImageUpload } from '@/components/FormField';
// @ts-ignore;
import { useFieldValidation, validateFormData, FormValidationStatus, ValidationProgress } from '@/components/DataValidation';

// 图片组件
const StoryImage = ({
  src,
  alt,
  className,
  onRemove
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  if (imageError || !src) {
    return <div className={cn("flex items-center justify-center bg-slate-700/50 rounded-lg border-2 border-dashed border-slate-600", className)}>
        <ImageIcon className="w-8 h-8 text-slate-500" />
      </div>;
  }
  return <div className={cn("relative overflow-hidden rounded-lg", className)}>
      {!imageLoaded && <div className="absolute inset-0 bg-slate-700/50 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-slate-500 border-t-transparent rounded-full animate-spin"></div>
        </div>}
      <img src={src} alt={alt || '故事图片'} className={cn("w-full h-full object-cover transition-opacity duration-300", imageLoaded ? "opacity-100" : "opacity-0")} onLoad={() => setImageLoaded(true)} onError={() => setImageError(true)} />
      {onRemove && <button onClick={onRemove} className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-600 text-white p-1.5 rounded-full transition-colors duration-200 button-press">
          <AlertCircle className="w-4 h-4" />
        </button>}
    </div>;
};
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
    read_time: '5分钟阅读'
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [isDraft, setIsDraft] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [lastAutoSave, setLastAutoSave] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const autoSaveTimeoutRef = useRef(null);
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

  // 字段验证Hook
  const titleValidation = useFieldValidation('title', storyData.title);
  const contentValidation = useFieldValidation('content', storyData.content);
  const authorValidation = useFieldValidation('author', storyData.author);
  const tagsValidation = useFieldValidation('tags', storyData.tags);
  useEffect(() => {
    // 如果是编辑模式，加载数据
    if (editMode && (draftId || storyId)) {
      loadStoryData();
    }
  }, [editMode, draftId, storyId]);
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
          read_time: data.read_time || '5分钟阅读'
        });
        if (data.image) {
          setImagePreview(data.image);
        }
        setLastSaved(new Date(data.lastSavedAt || data.updatedAt || data.createdAt));
      } else {
        throw new Error('故事数据不存在');
      }
    } catch (error) {
      console.error('加载数据失败:', error);
      setLoadError(error);
      toast({
        title: '加载失败',
        description: '无法加载故事数据，请重试',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // 自动保存功能
  const triggerAutoSave = () => {
    if (!autoSaveEnabled || !storyData.title.trim() || !storyData.content.trim()) return;
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    autoSaveTimeoutRef.current = setTimeout(() => {
      handleAutoSave();
    }, 30000); // 30秒自动保存
  };
  const handleAutoSave = async () => {
    if (!storyData.title.trim() || !storyData.content.trim()) return;
    try {
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();
      const now = new Date();
      const draftData = {
        ...storyData,
        read_time: calculateReadTime(storyData.content),
        lastSavedAt: now,
        createdAt: isDraft && draftId ? storyData.createdAt : now,
        status: 'draft',
        draftOwner: $w.auth.currentUser?.name || '匿名用户',
        isAutoSave: true
      };
      let result;
      if (isDraft && draftId) {
        // 更新现有草稿
        result = await db.collection('red_story_draft').doc(draftId).update(draftData);
      } else {
        // 创建新草稿
        result = await db.collection('red_story_draft').add(draftData);
      }
      setLastAutoSave(now);
      console.log('自动保存成功');
    } catch (error) {
      console.error('自动保存失败:', error);
    }
  };
  const handleInputChange = (field, value) => {
    setStoryData(prev => ({
      ...prev,
      [field]: value
    }));

    // 标记字段为已触摸
    setTouchedFields(prev => ({
      ...prev,
      [field]: true
    }));

    // 触发自动保存
    triggerAutoSave();
  };
  const handleImageUpload = (imageData, metadata = {}) => {
    if (metadata.error) {
      toast({
        title: '图片上传失败',
        description: metadata.error,
        variant: 'destructive'
      });
      return;
    }
    setImagePreview(imageData);
    setStoryData(prev => ({
      ...prev,
      image: imageData
    }));

    // 触发自动保存
    triggerAutoSave();
  };
  const removeImage = () => {
    setImagePreview('');
    setStoryData(prev => ({
      ...prev,
      image: ''
    }));

    // 触发自动保存
    triggerAutoSave();
  };
  const handleAddTag = tags => {
    handleInputChange('tags', tags);
  };
  const removeTag = tagToRemove => {
    const newTags = storyData.tags.filter(tag => tag !== tagToRemove);
    handleInputChange('tags', newTags);
  };
  const validateStoryData = () => {
    const formData = {
      title: storyData.title,
      content: storyData.content,
      author: storyData.author,
      tags: storyData.tags
    };
    const validation = validateFormData(formData);
    setValidationErrors(validation.errors);

    // 标记所有字段为已触摸
    const allTouched = {};
    Object.keys(formData).forEach(field => {
      allTouched[field] = true;
    });
    setTouchedFields(allTouched);
    return validation.isValid;
  };
  const calculateReadTime = content => {
    if (!content) return '5分钟阅读';
    const chineseChars = (content.match(/[\u4e00-\u9fa5]/g) || []).length;
    const englishWords = (content.match(/[a-zA-Z]+/g) || []).length;
    const readTime = Math.max(1, Math.ceil(chineseChars / 500 + englishWords / 200));
    return `${readTime}分钟阅读`;
  };
  const saveAsDraft = async () => {
    if (!validateStoryData()) {
      toast({
        title: '保存失败',
        description: '请检查表单中的错误信息',
        variant: 'destructive'
      });
      return;
    }
    try {
      setSaving(true);
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();
      const now = new Date();
      const draftData = {
        ...storyData,
        read_time: calculateReadTime(storyData.content),
        lastSavedAt: now,
        createdAt: isDraft && draftId ? storyData.createdAt : now,
        status: 'draft',
        draftOwner: $w.auth.currentUser?.name || '匿名用户'
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
  const publishStory = async () => {
    if (!validateStoryData()) {
      toast({
        title: '发布失败',
        description: '请检查表单中的错误信息',
        variant: 'destructive'
      });
      return;
    }

    // 确认发布
    const confirmPublish = window.confirm('确定要发布这个故事吗？发布后将对所有用户可见。');
    if (!confirmPublish) return;
    try {
      setPublishing(true);
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();
      const now = new Date();
      const publishedData = {
        ...storyData,
        read_time: calculateReadTime(storyData.content),
        createdAt: now,
        updatedAt: now,
        status: 'published',
        views: 0
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
  const previewStory = () => {
    if (!validateStoryData()) {
      toast({
        title: '预览失败',
        description: '请检查表单中的错误信息',
        variant: 'destructive'
      });
      return;
    }
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
  };
  const goBack = () => {
    if (storyData.title || storyData.content) {
      const confirmLeave = window.confirm('您有未保存的更改，确定要离开吗？');
      if (!confirmLeave) return;
    }
    navigateBack();
  };

  // 重试加载
  const handleRetry = () => {
    loadStoryData();
  };

  // 返回上一页
  const handleGoBack = () => {
    navigateBack();
  };

  // 组件卸载时清理定时器
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  // 计算验证进度
  const totalFields = 4; // title, content, author, tags
  const validatedFields = Object.values(touchedFields).filter(Boolean).length;

  // 加载状态
  if (loading) {
    return <ErrorBoundary>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
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
        </div>
      </ErrorBoundary>;
  }

  // 错误状态
  if (loadError) {
    return <ErrorBoundary>
        <DataLoadError error={loadError} onRetry={handleRetry} onGoBack={handleGoBack} title="加载故事失败" description="无法加载故事数据，请检查网络连接后重试" />
      </ErrorBoundary>;
  }
  return <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <Sidebar currentPage="upload" navigateTo={navigateTo} />

        <main className="content-transition sidebar-transition md:ml-16 lg:ml-64 animate-fade-in">
          {/* 页面头部 */}
          <header className="bg-slate-800/90 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-40">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Button onClick={goBack} variant="ghost" size="sm" className="text-slate-300 hover:text-white button-press">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    返回
                  </Button>
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
                  <Button onClick={previewStory} variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-700 button-press">
                    <Eye className="w-4 h-4 mr-2" />
                    预览
                  </Button>
                  <Button onClick={saveAsDraft} variant="outline" size="sm" disabled={saving} className="border-blue-600 text-blue-400 hover:bg-blue-600/10 button-press">
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? '保存中...' : '保存草稿'}
                  </Button>
                  <Button onClick={publishStory} disabled={publishing} className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 shadow-lg hover:shadow-red-500/25 transition-all duration-300 transform hover:scale-105 button-press">
                    <Send className="w-4 h-4 mr-2" />
                    {publishing ? '发布中...' : '发布'}
                  </Button>
                </div>
              </div>
            </div>
          </header>

          {/* 验证状态显示 */}
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <FormValidationStatus validation={{
            isValid: Object.keys(validationErrors).length === 0,
            errors: validationErrors
          }} className="mb-4" />
            <ValidationProgress totalFields={totalFields} validatedFields={validatedFields} />
          </div>

          {/* 主要内容区域 */}
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 md:pb-8">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6 shadow-2xl animate-fade-in">
              <div className="space-y-6">
                {/* 标题 */}
                <FormField label="标题" name="title" value={titleValidation.value} onChange={titleValidation.handleChange} onBlur={titleValidation.handleBlur} placeholder="请输入故事标题" required validation={titleValidation.validation} touched={titleValidation.touched} error={validationErrors.title} icon={BookOpen} className="bg-slate-700/50 border-slate-600 text-white focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all" />

                {/* 上传者 */}
                <FormField label="上传者" name="author" value={authorValidation.value} onChange={authorValidation.handleChange} onBlur={authorValidation.handleBlur} placeholder="请输入上传者姓名" required validation={authorValidation.validation} touched={authorValidation.touched} error={validationErrors.author} icon={User} className="bg-slate-700/50 border-slate-600 text-white focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all" />

                {/* 标签 */}
                <TagInput label="标签" name="tags" value={tagsValidation.value} onChange={handleAddTag} onBlur={tagsValidation.handleBlur} placeholder="输入标签后按回车添加" required validation={tagsValidation.validation} touched={tagsValidation.touched} maxTags={10} className="bg-slate-700/50 border-slate-600 text-white focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all" />

                {/* 图片上传 */}
                <ImageUpload label="封面图片" name="image" value={storyData.image} onChange={handleImageUpload} onBlur={() => {}} required={false} validation={{
                isValid: true,
                message: ''
              }} touched={false} className="bg-slate-700/50 border-slate-600 text-white focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all" />

                {/* 内容 */}
                <FormField label="故事内容" name="content" type="textarea" value={contentValidation.value} onChange={contentValidation.handleChange} onBlur={contentValidation.handleBlur} placeholder="请输入故事内容..." required validation={contentValidation.validation} touched={contentValidation.touched} error={validationErrors.content} className="bg-slate-700/50 border-slate-600 text-white resize-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all" rows={12} />

                {/* 自动保存状态 */}
                {lastAutoSave && <div className="text-xs text-slate-500 text-center">
                    最后自动保存: {lastAutoSave.toLocaleTimeString()}
                  </div>}

                {/* 操作按钮 */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-700">
                  <Button onClick={saveAsDraft} disabled={saving} variant="outline" className="border-blue-600 text-blue-400 hover:bg-blue-600/10 transition-all">
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? '保存中...' : '保存草稿'}
                  </Button>
                  <Button onClick={publishStory} disabled={publishing} className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 shadow-lg hover:shadow-red-500/25 transition-all duration-300 transform hover:scale-105">
                    <Send className="w-4 h-4 mr-2" />
                    {publishing ? '发布中...' : '发布'}
                  </Button>
                  <Button onClick={goBack} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white transition-all">
                    取消
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </main>

        <MobileBottomNav currentPage="upload" navigateTo={navigateTo} />
      </div>
    </ErrorBoundary>;
}