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
import { ErrorAlert, LoadingError } from '@/components/ErrorAlert';
// @ts-ignore;
import { ValidatedInput, ValidatedTextarea, ValidatedTagInput } from '@/components/FieldValidation';
// @ts-ignore;
import { validateStoryData, validateField, validateImageFile, calculateReadTime, sanitizeStoryData } from '@/lib/validation';
export default function UploadPage(props) {
  const {
    $w
  } = props;
  const [story, setStory] = useState({
    title: '',
    content: '',
    author: '',
    location: '',
    date: '',
    read_time: '',
    tags: [],
    image: '',
    status: 'draft'
  });

  // 验证状态
  const [validationErrors, setValidationErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const [isValidating, setIsValidating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const fileInputRef = useRef(null);
  const {
    toast
  } = useToast();
  const navigateTo = $w.utils.navigateTo;

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
    setStory(prev => ({
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
      setStory(prev => ({
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
    validateFieldRealTime(fieldName, story[fieldName]);
  };

  // 处理标签变化
  const handleTagsChange = e => {
    const value = e.target.value;
    setStory(prev => ({
      ...prev,
      tags: value
    }));
    if (touchedFields.tags) {
      validateFieldRealTime('tags', value);
    }
  };

  // 处理图片上传
  const handleImageUpload = async event => {
    const file = event.target.files[0];
    if (!file) return;

    // 验证图片文件
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      toast({
        title: '图片验证失败',
        description: validation.error,
        variant: 'destructive'
      });
      return;
    }
    try {
      setUploadingImage(true);

      // 创建预览
      const reader = new FileReader();
      reader.onload = e => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);

      // 模拟上传到云存储
      const base64 = await new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.readAsDataURL(file);
      });

      // 更新故事数据
      setStory(prev => ({
        ...prev,
        image: base64
      }));

      // 清除图片验证错误
      setValidationErrors(prev => ({
        ...prev,
        image: null
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

  // 预验证数据
  const preValidateData = data => {
    const sanitizedData = sanitizeStoryData(data);
    const validation = validateStoryData(sanitizedData, false);
    return validation;
  };

  // 保存草稿
  const handleSaveDraft = async () => {
    // 标记所有字段为已触摸
    const allFieldsTouched = Object.keys(story).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouchedFields(allFieldsTouched);

    // 预验证
    const validation = preValidateData(story);
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
      const storyId = `story_${Date.now()}`;
      const draftData = {
        ...sanitizeStoryData(story),
        story_id: storyId,
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

  // 发布故事
  const handlePublish = async () => {
    // 标记所有字段为已触摸
    const allFieldsTouched = Object.keys(story).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouchedFields(allFieldsTouched);

    // 预验证
    const validation = preValidateData(story);
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
      const storyId = `story_${Date.now()}`;

      // 准备发布数据
      const publishedData = {
        ...sanitizeStoryData(story),
        story_id: storyId,
        read_time: calculateReadTime(story.content),
        createdAt: now,
        updatedAt: now,
        status: 'published',
        views: 0,
        like_count: 0,
        share_count: 0
      };

      // 准备草稿数据
      const draftData = {
        ...sanitizeStoryData(story),
        story_id: storyId,
        read_time: calculateReadTime(story.content),
        draftOwner: $w.auth.currentUser?.name || '匿名用户',
        lastSavedAt: now,
        createdAt: now,
        status: 'draft'
      };

      // 同时存储到发布和草稿数据库
      await Promise.all([db.collection('red_story').doc(storyId).set(publishedData), db.collection('red_story_draft').doc(storyId).set(draftData)]);
      toast({
        title: '发布成功',
        description: '故事已发布并保存到草稿箱'
      });

      // 跳转到首页
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

  // 添加标签
  const handleAddTag = () => {
    if (tagInput.trim() && !story.tags.includes(tagInput.trim())) {
      const newTags = [...story.tags, tagInput.trim()];
      handleTagsChange({
        target: {
          value: newTags
        }
      });
      setTagInput('');
    }
  };

  // 移除标签
  const handleRemoveTag = tagToRemove => {
    const newTags = story.tags.filter(tag => tag !== tagToRemove);
    handleTagsChange({
      target: {
        value: newTags
      }
    });
  };

  // 返回首页
  const goBack = () => {
    navigateTo({
      pageId: 'index',
      params: {}
    });
  };

  // 重试加载
  const handleRetry = () => {
    setLoadError(null);
    // 重新初始化页面
    window.location.reload();
  };

  // 动态计算主内容区域的左边距
  const getMainContentClasses = () => {
    const baseClasses = "content-transition sidebar-transition animate-fade-in";
    if (sidebarCollapsed) {
      return `${baseClasses} md:ml-16`;
    } else {
      return `${baseClasses} md:ml-64`;
    }
  };

  // 如果有加载错误，显示错误组件
  if (loadError) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <Sidebar currentPage="upload" navigateTo={navigateTo} />
        <main className={getMainContentClasses()}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <LoadingError error={loadError} onRetry={handleRetry} onGoHome={goBack} />
          </div>
        </main>
        <MobileBottomNav currentPage="upload" navigateTo={navigateTo} />
      </div>;
  }
  return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <Sidebar currentPage="upload" navigateTo={navigateTo} />

      {/* 主内容区域 - 修复左边距问题 */}
      <main className={getMainContentClasses()}>
        {/* 桌面端头部 */}
        <header className="hidden md:block bg-slate-800/90 backdrop-blur-sm border-b border-slate-700 animate-slide-in">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-white">创建新故事</h1>
              <div className="flex items-center space-x-4">
                <Button onClick={goBack} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white transition-all">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  返回首页
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* 移动端返回栏 */}
        <div className="md:hidden bg-slate-800/90 backdrop-blur-sm border-b border-slate-700 px-4 py-3 flex items-center">
          <button onClick={goBack} className="flex items-center text-slate-300 hover:text-white">
            <ArrowLeft className="w-5 h-5 mr-2" />
            返回
          </button>
        </div>

        {/* 主要内容区域 */}
        <div className="max-w-4xl mx-auto p-4 md:p-8 pb-24 md:pb-8">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6 shadow-2xl animate-fade-in">
            <div className="space-y-6">
              {/* 标题 */}
              <ValidatedInput label="故事标题" required fieldName="title" value={story.title} onChange={e => handleFieldChange('title', e.target.value)} onBlur={() => handleFieldBlur('title')} error={validationErrors.title} touched={touchedFields.title} placeholder="请输入故事标题" />

              {/* 上传者 */}
              <ValidatedInput label="上传者" required fieldName="author" value={story.author} onChange={e => handleFieldChange('author', e.target.value)} onBlur={() => handleFieldBlur('author')} error={validationErrors.author} touched={touchedFields.author} placeholder="请输入上传者姓名" />

              {/* 地点 */}
              <ValidatedInput label="发生地点" fieldName="location" value={story.location} onChange={e => handleFieldChange('location', e.target.value)} onBlur={() => handleFieldBlur('location')} error={validationErrors.location} touched={touchedFields.location} placeholder="请输入故事发生地点（可选）" />

              {/* 时间时期 */}
              <ValidatedInput label="时间时期" fieldName="date" value={story.date} onChange={e => handleFieldChange('date', e.target.value)} onBlur={() => handleFieldBlur('date')} error={validationErrors.date} touched={touchedFields.date} placeholder="例如：抗日战争时期（可选）" />

              {/* 阅读时间 */}
              <ValidatedInput label="阅读时间" fieldName="read_time" value={story.read_time} onChange={e => handleFieldChange('read_time', e.target.value)} onBlur={() => handleFieldBlur('read_time')} error={validationErrors.read_time} touched={touchedFields.read_time} placeholder="例如：5分钟阅读" />

              {/* 标签 */}
              <ValidatedTagInput label="标签" required fieldName="tags" value={story.tags} onChange={handleTagsChange} onBlur={() => handleFieldBlur('tags')} error={validationErrors.tags} touched={touchedFields.tags} placeholder="输入标签后按回车添加" maxTags={10} />

              {/* 图片上传 */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  <ImageIcon className="w-4 h-4 inline mr-1" />
                  封面图片
                </label>
                
                {/* 图片预览区域 */}
                {imagePreview ? <div className="relative mb-4">
                    <div className="relative w-full h-64 bg-slate-700/50 rounded-xl overflow-hidden border-2 border-dashed border-slate-600">
                      <img src={imagePreview} alt="图片预览" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                        <Button onClick={triggerFileSelect} variant="outline" size="sm" className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30">
                          <Upload className="w-4 h-4 mr-2" />
                          更换图片
                        </Button>
                      </div>
                      <button onClick={removeImage} className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-600 text-white p-2 rounded-full transition-colors duration-200">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div> : <div className="border-2 border-dashed border-slate-600 rounded-xl p-8 text-center hover:border-red-500/50 transition-colors duration-300 mb-4">
                    <FileImage className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                    <p className="text-slate-400 mb-4">点击或拖拽上传封面图片</p>
                    <Button onClick={triggerFileSelect} disabled={uploadingImage} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white transition-all">
                      <Upload className="w-4 h-4 mr-2" />
                      {uploadingImage ? '上传中...' : '选择图片'}
                    </Button>
                    <p className="text-xs text-slate-500 mt-2">支持 JPG、PNG、WEBP 格式，大小不超过 5MB</p>
                  </div>}

                {/* 隐藏的文件输入 */}
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />

                {/* URL输入作为备选方案 */}
                <div className="mt-4">
                  <label className="block text-xs text-slate-400 mb-2">或输入图片URL</label>
                  <Input value={story.image && !imagePreview ? story.image : ''} onChange={e => handleFieldChange('image', e.target.value)} onBlur={() => handleFieldBlur('image')} placeholder="请输入图片URL" className="bg-slate-700/50 border-slate-600 text-white focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all" />
                </div>
              </div>

              {/* 内容 */}
              <ValidatedTextarea label="故事内容" required fieldName="content" value={story.content} onChange={e => handleFieldChange('content', e.target.value)} onBlur={() => handleFieldBlur('content')} error={validationErrors.content} touched={touchedFields.content} placeholder="请输入故事内容..." rows={10} showCharCount maxLength={5000} />

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
                <Button onClick={goBack} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white transition-all">
                  取消
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <MobileBottomNav currentPage="upload" navigateTo={navigateTo} />
    </div>;
}