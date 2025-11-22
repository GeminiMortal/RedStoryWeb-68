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
import { MobileValidatedInput, MobileValidatedTextarea, MobileValidatedTagInput, MobileValidationSummary, MobileSubmitButton } from '@/components/MobileValidation';
// @ts-ignore;
import { validateStoryData, validateField, validateImageFile, calculateReadTime, sanitizeStoryData } from '@/lib/validation';
// @ts-ignore;
import { offlineStorage } from '@/lib/offlineStorage';
// @ts-ignore;
import { dataCache } from '@/lib/cache';
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
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const fileInputRef = useRef(null);
  const {
    toast
  } = useToast();
  const navigateTo = $w.utils.navigateTo;

  // 监听网络状态
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
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
      if (isOnline) {
        // 在线保存
        await db.collection('red_story_draft').doc(storyId).set(draftData);
        toast({
          title: '保存成功',
          description: '已保存到草稿箱'
        });
      } else {
        // 离线保存
        await offlineStorage.saveDraft(draftData);
        await offlineStorage.addToSyncQueue({
          type: 'save_draft',
          data: draftData
        });
        toast({
          title: '离线保存成功',
          description: '草稿已保存到本地，网络恢复后将自动同步'
        });
      }
      navigateTo({
        pageId: 'edit',
        params: {
          edit: true,
          draftId: storyId
        }
      });
    } catch (err) {
      console.error('保存失败:', err);

      // 保存失败时尝试离线保存
      try {
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
        await offlineStorage.saveDraft(draftData);
        await offlineStorage.addToSyncQueue({
          type: 'save_draft',
          data: draftData
        });
        toast({
          title: '离线保存成功',
          description: '网络异常，已保存到本地'
        });
        navigateTo({
          pageId: 'edit',
          params: {
            edit: true,
            draftId: storyId
          }
        });
      } catch (offlineError) {
        console.error('离线保存也失败:', offlineError);
        toast({
          title: '保存失败',
          description: err.message || '请稍后重试',
          variant: 'destructive'
        });
      }
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

    // 确认发布
    const confirmPublish = window.confirm('确定要发布这个故事吗？发布后将对所有用户可见。');
    if (!confirmPublish) return;
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
      if (isOnline) {
        // 在线发布
        await Promise.all([db.collection('red_story').doc(storyId).set(publishedData), db.collection('red_story_draft').doc(storyId).set(draftData)]);

        // 清除相关缓存
        dataCache.clear('stories');
        toast({
          title: '发布成功',
          description: '故事已发布并保存到草稿箱'
        });

        // 跳转到首页
        navigateTo({
          pageId: 'index',
          params: {}
        });
      } else {
        // 离线发布 - 添加到同步队列
        await offlineStorage.addToSyncQueue({
          type: 'publish_story',
          data: {
            publishedData,
            draftData
          }
        });
        toast({
          title: '离线发布成功',
          description: '故事已添加到发布队列，网络恢复后将自动发布'
        });

        // 跳转到首页
        navigateTo({
          pageId: 'index',
          params: {}
        });
      }
    } catch (err) {
      console.error('发布失败:', err);

      // 发布失败时尝试离线保存
      try {
        const storyId = `story_${Date.now()}`;
        const publishedData = {
          ...sanitizeStoryData(story),
          story_id: storyId,
          read_time: calculateReadTime(story.content),
          createdAt: new Date(),
          updatedAt: new Date(),
          status: 'published',
          views: 0,
          like_count: 0,
          share_count: 0
        };
        await offlineStorage.addToSyncQueue({
          type: 'publish_story',
          data: publishedData
        });
        toast({
          title: '离线发布成功',
          description: '网络异常，已添加到发布队列'
        });
        navigateTo({
          pageId: 'index',
          params: {}
        });
      } catch (offlineError) {
        console.error('离线发布也失败:', offlineError);
        toast({
          title: '发布失败',
          description: err.message || '请稍后重试',
          variant: 'destructive'
        });
      }
    } finally {
      setPublishing(false);
    }
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

  // 如果有加载错误，显示错误组件
  if (loadError) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <Sidebar currentPage="upload" navigateTo={navigateTo} />
        <main className="content-transition sidebar-transition md:ml-16 lg:ml-64 animate-fade-in">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <LoadingError error={loadError} onRetry={handleRetry} onGoHome={goBack} />
          </div>
        </main>
        <MobileBottomNav currentPage="upload" navigateTo={navigateTo} />
      </div>;
  }
  return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <Sidebar currentPage="upload" navigateTo={navigateTo} />

      {/* 主内容区域 */}
      <main className="content-transition sidebar-transition md:ml-16 lg:ml-64 animate-fade-in">
        {/* 桌面端头部 */}
        <header className="hidden md:block bg-slate-800/90 backdrop-blur-sm border-b border-slate-700 animate-slide-in">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-white">创建新故事</h1>
              <div className="flex items-center space-x-4">
                {/* 网络状态指示 */}
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-red-400'}`}></div>
                  <span className="text-sm text-slate-400">
                    {isOnline ? '在线' : '离线'}
                  </span>
                </div>
                <Button onClick={goBack} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white transition-all">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  返回首页
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* 移动端返回栏 */}
        <div className="md:hidden bg-slate-800/90 backdrop-blur-sm border-b border-slate-700 px-4 py-3 flex items-center justify-between">
          <button onClick={goBack} className="flex items-center text-slate-300 hover:text-white">
            <ArrowLeft className="w-5 h-5 mr-2" />
            返回
          </button>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-red-400'}`}></div>
            <span className="text-xs text-slate-400">
              {isOnline ? '在线' : '离线'}
            </span>
          </div>
        </div>

        {/* 主要内容区域 */}
        <div className="max-w-4xl mx-auto p-4 md:p-8 pb-24 md:pb-8">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6 shadow-2xl animate-fade-in">
            {/* 离线提示 */}
            {!isOnline && <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <div className="flex items-center space-x-2 text-yellow-400">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">离线模式</span>
                </div>
                <p className="text-xs text-yellow-300 mt-1">
                  当前处于离线状态，内容将保存到本地并在网络恢复后自动同步
                </p>
              </div>}

            <div className="space-y-6">
              {/* 验证错误汇总 */}
              <MobileValidationSummary errors={validationErrors} touched={touchedFields} />

              {/* 标题 */}
              <MobileValidatedInput label="故事标题" required fieldName="title" value={story.title} onChange={e => handleFieldChange('title', e.target.value)} onBlur={() => handleFieldBlur('title')} error={validationErrors.title} touched={touchedFields.title} placeholder="请输入故事标题" />

              {/* 作者 */}
              <MobileValidatedInput label="作者" required fieldName="author" value={story.author} onChange={e => handleFieldChange('author', e.target.value)} onBlur={() => handleFieldBlur('author')} error={validationErrors.author} touched={touchedFields.author} placeholder="请输入作者姓名" />

              {/* 地点 */}
              <MobileValidatedInput label="发生地点" required fieldName="location" value={story.location} onChange={e => handleFieldChange('location', e.target.value)} onBlur={() => handleFieldBlur('location')} error={validationErrors.location} touched={touchedFields.location} placeholder="请输入故事发生地点" />

              {/* 时间时期 */}
              <MobileValidatedInput label="时间时期" required fieldName="date" value={story.date} onChange={e => handleFieldChange('date', e.target.value)} onBlur={() => handleFieldBlur('date')} error={validationErrors.date} touched={touchedFields.date} placeholder="例如：抗日战争时期" />

              {/* 阅读时间 */}
              <MobileValidatedInput label="阅读时间" fieldName="read_time" value={story.read_time} onChange={e => handleFieldChange('read_time', e.target.value)} onBlur={() => handleFieldBlur('read_time')} error={validationErrors.read_time} touched={touchedFields.read_time} placeholder="例如：5分钟阅读" />

              {/* 标签 */}
              <MobileValidatedTagInput label="标签" required fieldName="tags" value={story.tags} onChange={handleTagsChange} onBlur={() => handleFieldBlur('tags')} error={validationErrors.tags} touched={touchedFields.tags} placeholder="输入标签后按回车添加" maxTags={10} />

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
              <MobileValidatedTextarea label="故事内容" required fieldName="content" value={story.content} onChange={e => handleFieldChange('content', e.target.value)} onBlur={() => handleFieldBlur('content')} error={validationErrors.content} touched={touchedFields.content} placeholder="请输入故事内容..." rows={10} showCharCount maxLength={5000} />

              {/* 操作按钮 */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-700">
                <MobileSubmitButton onClick={handleSaveDraft} disabled={saving} loading={saving} errors={validationErrors} touched={touchedFields} className="flex-1">
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? '保存中...' : '保存草稿'}
                </MobileSubmitButton>
                <MobileSubmitButton onClick={handlePublish} disabled={publishing} loading={publishing} errors={validationErrors} touched={touchedFields} className="flex-1">
                  <Send className="w-4 h-4 mr-2" />
                  {publishing ? '发布中...' : '发布'}
                </MobileSubmitButton>
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