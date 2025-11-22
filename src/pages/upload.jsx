// @ts-ignore;
import React, { useState, useRef, useEffect } from 'react';
// @ts-ignore;
import { Button, Input, Textarea, useToast } from '@/components/ui';
// @ts-ignore;
import { ArrowLeft, Save, Upload, Tag, MapPin, Clock, User, BookOpen, Send, Image as ImageIcon, X, FileImage } from 'lucide-react';

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
export default function UploadPage(props) {
  const {
    $w
  } = props;
  const [story, setStory] = useState({
    title: '',
    content: '',
    author: '',
    location: '',
    read_time: '',
    tags: [],
    image: '',
    status: 'draft'
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [lastAutoSave, setLastAutoSave] = useState(null);
  const fileInputRef = useRef(null);
  const autoSaveTimeoutRef = useRef(null);
  const {
    toast
  } = useToast();
  const navigateTo = $w.utils.navigateTo;

  // 字段验证Hook
  const titleValidation = useFieldValidation('title', story.title);
  const contentValidation = useFieldValidation('content', story.content);
  const authorValidation = useFieldValidation('author', story.author);
  const locationValidation = useFieldValidation('location', story.location);
  const readTimeValidation = useFieldValidation('read_time', story.read_time);
  const tagsValidation = useFieldValidation('tags', story.tags);

  // 计算阅读时间
  const calculateReadTime = content => {
    if (!content) return '5分钟阅读';
    const chineseChars = (content.match(/[\u4e00-\u9fa5]/g) || []).length;
    const englishWords = (content.match(/[a-zA-Z]+/g) || []).length;
    const readTime = Math.max(1, Math.ceil(chineseChars / 500 + englishWords / 200));
    return `${readTime}分钟阅读`;
  };

  // 自动保存功能
  const triggerAutoSave = () => {
    if (!autoSaveEnabled) return;
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    autoSaveTimeoutRef.current = setTimeout(() => {
      handleAutoSave();
    }, 30000); // 30秒自动保存
  };
  const handleAutoSave = async () => {
    if (!story.title.trim() || !story.content.trim()) return;
    try {
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();
      const storyId = `auto_save_${Date.now()}`;
      const draftData = {
        ...story,
        read_time: calculateReadTime(story.content),
        draftOwner: $w.auth.currentUser?.name || '匿名用户',
        lastSavedAt: Date.now(),
        createdAt: Date.now(),
        status: 'draft',
        isAutoSave: true
      };
      await db.collection('red_story_draft').doc(storyId).set(draftData);
      setLastAutoSave(new Date());
      console.log('自动保存成功');
    } catch (error) {
      console.error('自动保存失败:', error);
    }
  };

  // 处理本地图片上传
  const handleImageUpload = async (imageData, metadata = {}) => {
    if (metadata.error) {
      toast({
        title: '图片上传失败',
        description: metadata.error,
        variant: 'destructive'
      });
      return;
    }
    try {
      setUploadingImage(true);
      setImagePreview(imageData);
      setStory(prev => ({
        ...prev,
        image: imageData
      }));
      toast({
        title: '上传成功',
        description: '图片已成功上传'
      });
    } catch (error) {
      console.error('图片上传失败:', error);
      toast({
        title: '上传失败',
        description: '图片上传失败，请重试',
        variant: 'destructive'
      });
    } finally {
      setUploadingImage(false);
    }
  };

  // 移除图片
  const removeImage = () => {
    setImagePreview('');
    setStory(prev => ({
      ...prev,
      image: ''
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 触发文件选择
  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  // 字段更新处理
  const handleFieldChange = (field, value) => {
    setStory(prev => ({
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

  // 标签操作
  const handleTagsChange = tags => {
    handleFieldChange('tags', tags);
  };

  // 预验证函数
  const preValidate = () => {
    const formData = {
      title: story.title,
      content: story.content,
      author: story.author,
      location: story.location,
      read_time: story.read_time,
      tags: story.tags
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

  // 保存草稿（只存储草稿数据库）
  const handleSaveDraft = async () => {
    if (!preValidate()) {
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
      const storyId = `story_${Date.now()}`;
      const draftData = {
        ...story,
        read_time: calculateReadTime(story.content),
        draftOwner: $w.auth.currentUser?.name || '匿名用户',
        lastSavedAt: Date.now(),
        createdAt: Date.now(),
        status: 'draft'
      };
      await db.collection('red_story_draft').doc(storyId).set(draftData);
      toast({
        title: '保存成功',
        description: '已保存到草稿箱'
      });
      navigateTo({
        pageId: 'edit',
        params: {
          id: storyId
        }
      });
    } catch (err) {
      console.error('保存失败:', err);
      toast({
        title: '保存失败',
        description: err.message || '请稍后重试',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  // 发布故事（同时存储发布和草稿数据库）
  const handlePublish = async () => {
    if (!preValidate()) {
      toast({
        title: '发布失败',
        description: '请检查表单中的错误信息',
        variant: 'destructive'
      });
      return;
    }
    try {
      setPublishing(true);
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();
      const now = new Date();
      const storyId = `story_${Date.now()}`;

      // 准备发布数据
      const publishedData = {
        ...story,
        read_time: calculateReadTime(story.content),
        createdAt: now,
        updatedAt: now,
        status: 'published',
        views: 0
      };

      // 准备草稿数据
      const draftData = {
        ...story,
        read_time: calculateReadTime(story.content),
        draftOwner: $w.auth.currentUser?.name || '匿名用户',
        lastSavedAt: now,
        createdAt: now,
        status: 'draft'
      };

      // 同时存储到发布和草稿数据库
      const [publishedResult, draftResult] = await Promise.all([db.collection('red_story').doc(storyId).set(publishedData), db.collection('red_story_draft').doc(storyId).set(draftData)]);
      toast({
        title: '发布成功',
        description: '故事已发布并保存到草稿箱'
      });

      // 跳转到首页，让用户可以看到刚刚发布的故事
      navigateTo({
        pageId: 'index',
        params: {}
      });
    } catch (err) {
      console.error('发布失败:', err);
      toast({
        title: '发布失败',
        description: err.message || '请稍后重试',
        variant: 'destructive'
      });
    } finally {
      setPublishing(false);
    }
  };

  // 重试加载
  const handleRetry = () => {
    setLoading(false);
  };

  // 返回上一页
  const handleGoBack = () => {
    navigateTo({
      pageId: 'index',
      params: {}
    });
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
  const totalFields = 6; // title, content, author, location, read_time, tags
  const validatedFields = Object.values(touchedFields).filter(Boolean).length;
  if (loading) {
    return <ErrorBoundary>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
          <Sidebar currentPage="upload" navigateTo={navigateTo} />
          <main className="content-transition sidebar-transition md:ml-16 lg:ml-64 animate-fade-in">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="animate-pulse space-y-6">
                <div className="h-8 bg-slate-700 rounded w-1/3"></div>
                <div className="space-y-4">
                  <div className="h-4 bg-slate-700 rounded"></div>
                  <div className="h-32 bg-slate-700 rounded"></div>
                  <div className="h-4 bg-slate-700 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          </main>
          <MobileBottomNav currentPage="upload" navigateTo={navigateTo} />
        </div>
      </ErrorBoundary>;
  }
  return <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <Sidebar currentPage="upload" navigateTo={navigateTo} />

        {/* 主内容区域 - 应用index界面的布局关系 */}
        <main className="content-transition sidebar-transition md:ml-16 lg:ml-64 animate-fade-in">
          {/* 桌面端头部 */}
          <header className="hidden md:block bg-slate-800/90 backdrop-blur-sm border-b border-slate-700 animate-slide-in">
            <div className="max-w-4xl mx-auto px-6 py-4">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white">创建新故事</h1>
                <div className="flex items-center space-x-4">
                  <Button onClick={handleGoBack} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white transition-all">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    返回首页
                  </Button>
                </div>
              </div>
            </div>
          </header>

          {/* 移动端返回栏 */}
          <div className="md:hidden bg-slate-800/90 backdrop-blur-sm border-b border-slate-700 px-4 py-3 flex items-center">
            <button onClick={handleGoBack} className="flex items-center text-slate-300 hover:text-white">
              <ArrowLeft className="w-5 h-5 mr-2" />
              返回
            </button>
          </div>

          {/* 主要内容区域 */}
          <div className="max-w-4xl mx-auto p-4 md:p-8 pb-24 md:pb-8">
            {/* 验证状态显示 */}
            <div className="mb-6">
              <FormValidationStatus validation={{
              isValid: Object.keys(validationErrors).length === 0,
              errors: validationErrors
            }} className="mb-4" />
              <ValidationProgress totalFields={totalFields} validatedFields={validatedFields} />
            </div>

            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6 shadow-2xl animate-fade-in">
              <div className="space-y-6">
                {/* 标题 */}
                <FormField label="标题" name="title" value={titleValidation.value} onChange={titleValidation.handleChange} onBlur={titleValidation.handleBlur} placeholder="请输入故事标题" required validation={titleValidation.validation} touched={titleValidation.touched} error={validationErrors.title} icon={BookOpen} className="bg-slate-700/50 border-slate-600 text-white focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all" />

                {/* 上传者 */}
                <FormField label="上传者" name="author" value={authorValidation.value} onChange={authorValidation.handleChange} onBlur={authorValidation.handleBlur} placeholder="请输入上传者姓名" required validation={authorValidation.validation} touched={authorValidation.touched} error={validationErrors.author} icon={User} className="bg-slate-700/50 border-slate-600 text-white focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all" />

                {/* 地点 */}
                <FormField label="故事地点" name="location" value={locationValidation.value} onChange={locationValidation.handleChange} onBlur={locationValidation.handleBlur} placeholder="请输入故事发生地点" required validation={locationValidation.validation} touched={locationValidation.touched} error={validationErrors.location} icon={MapPin} className="bg-slate-700/50 border-slate-600 text-white focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all" />

                {/* 阅读时间 */}
                <FormField label="阅读时间" name="read_time" value={readTimeValidation.value} onChange={readTimeValidation.handleChange} onBlur={readTimeValidation.handleBlur} placeholder="例如：5分钟阅读" required validation={readTimeValidation.validation} touched={readTimeValidation.touched} error={validationErrors.read_time} icon={Clock} className="bg-slate-700/50 border-slate-600 text-white focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all" />

                {/* 标签 */}
                <TagInput label="标签" name="tags" value={tagsValidation.value} onChange={handleTagsChange} onBlur={tagsValidation.handleBlur} placeholder="输入标签后按回车添加" required validation={tagsValidation.validation} touched={tagsValidation.touched} maxTags={10} className="bg-slate-700/50 border-slate-600 text-white focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all" />

                {/* 图片上传 */}
                <ImageUpload label="封面图片" name="image" value={story.image} onChange={handleImageUpload} onBlur={() => {}} required={false} validation={{
                isValid: true,
                message: ''
              }} touched={false} className="bg-slate-700/50 border-slate-600 text-white focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all" />

                {/* 内容 */}
                <FormField label="故事内容" name="content" type="textarea" value={contentValidation.value} onChange={contentValidation.handleChange} onBlur={contentValidation.handleBlur} placeholder="请输入故事内容..." required validation={contentValidation.validation} touched={contentValidation.touched} error={validationErrors.content} className="bg-slate-700/50 border-slate-600 text-white resize-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all" rows={10} />

                {/* 自动保存状态 */}
                {lastAutoSave && <div className="text-xs text-slate-500 text-center">
                    最后自动保存: {lastAutoSave.toLocaleTimeString()}
                  </div>}

                {/* 操作按钮 */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-700">
                  <Button onClick={handleSaveDraft} disabled={saving} variant="outline" className="border-blue-600 text-blue-400 hover:bg-blue-600/10 transition-all">
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? '保存中...' : '保存草稿'}
                  </Button>
                  <Button onClick={handlePublish} disabled={publishing} className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 shadow-lg hover:shadow-red-500/25 transition-all duration-300 transform hover:scale-105">
                    <Send className="w-4 h-4 mr-2" />
                    {publishing ? '发布中...' : '发布'}
                  </Button>
                  <Button onClick={handleGoBack} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white transition-all">
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