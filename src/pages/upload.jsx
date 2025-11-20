// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button } from '@/components/ui';
// @ts-ignore;
import { ArrowLeft, Upload as UploadIcon, FileText, Check, Plus, Loader2, Save, Home } from 'lucide-react';

// @ts-ignore;
import { FormInput } from '@/components/FormInput';
// @ts-ignore;
import { ImageUpload } from '@/components/ImageUpload';
// @ts-ignore;
import { TagManager } from '@/components/TagManager';
// @ts-ignore;
import { DraftIndicator } from '@/components/DraftIndicator';
export default function UploadPage(props) {
  const {
    $w,
    page
  } = props;
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    date: '',
    location: '',
    image: '',
    author: '',
    read_time: '',
    tags: [],
    status: 'draft',
    // 默认状态为草稿
    order: 0 // 默认排序
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [newTag, setNewTag] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [hasDraft, setHasDraft] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  // 获取来源页面参数
  const fromPage = page?.dataset?.params?.from;

  // 本地存储键名
  const DRAFT_KEY = 'red_story_draft';

  // 页面加载时恢复暂存的草稿
  useEffect(() => {
    const loadDraft = () => {
      try {
        const draftData = localStorage.getItem(DRAFT_KEY);
        if (draftData) {
          const draft = JSON.parse(draftData);
          setFormData(draft.formData);
          setHasDraft(true);
          setLastSaved(draft.savedAt);
          console.log('已恢复暂存的草稿');
        }
      } catch (err) {
        console.error('恢复草稿失败:', err);
      }
    };
    loadDraft();
  }, []);

  // 自动保存草稿
  useEffect(() => {
    const saveDraft = () => {
      // 只有表单有内容时才保存草稿
      const hasContent = formData.title.trim() || formData.content.trim() || formData.date || formData.location || formData.author || formData.tags.length > 0;
      if (hasContent) {
        try {
          const draftData = {
            formData,
            savedAt: new Date().toISOString()
          };
          localStorage.setItem(DRAFT_KEY, JSON.stringify(draftData));
          setHasDraft(true);
          setLastSaved(draftData.savedAt);
        } catch (err) {
          console.error('保存草稿失败:', err);
        }
      }
    };

    // 防抖保存，避免频繁保存
    const timer = setTimeout(saveDraft, 2000);
    return () => clearTimeout(timer);
  }, [formData]);

  // 手动保存草稿
  const handleSaveDraft = async () => {
    setIsSavingDraft(true);
    try {
      const draftData = {
        formData,
        savedAt: new Date().toISOString()
      };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draftData));
      setHasDraft(true);
      setLastSaved(draftData.savedAt);
      setError(null);
      setTimeout(() => {
        setIsSavingDraft(false);
      }, 1000);
    } catch (err) {
      console.error('手动保存草稿失败:', err);
      setError('保存草稿失败');
      setIsSavingDraft(false);
    }
  };

  // 清除草稿
  const clearDraft = () => {
    if (window.confirm('确定要清除暂存的草稿吗？此操作不可恢复。')) {
      try {
        localStorage.removeItem(DRAFT_KEY);
        setHasDraft(false);
        setLastSaved(null);
        // 重置表单为初始状态
        setFormData({
          title: '',
          content: '',
          date: '',
          location: '',
          image: '',
          author: '',
          read_time: '',
          tags: [],
          status: 'draft',
          order: 0
        });
        setImageFile(null);
        setError(null);
      } catch (err) {
        console.error('清除草稿失败:', err);
        setError('清除草稿失败');
      }
    }
  };

  // 智能返回导航
  const handleSmartBack = () => {
    // 如果有草稿，提示用户
    if (hasDraft) {
      if (!confirm('您有未保存的草稿，确定要离开吗？')) {
        return;
      }
    }
    if (fromPage === 'index' || fromPage === 'admin') {
      $w.utils.navigateTo({
        pageId: fromPage,
        params: {}
      });
    } else {
      // 默认返回主页
      $w.utils.navigateTo({
        pageId: 'index',
        params: {}
      });
    }
  };

  // 返回主页
  const goHome = () => {
    if (hasDraft) {
      if (!confirm('您有未保存的草稿，确定要离开吗？')) {
        return;
      }
    }
    $w.utils.navigateTo({
      pageId: 'index',
      params: {}
    });
  };

  // 表单输入处理
  const handleInputChange = e => {
    const {
      name,
      value
    } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 标签管理
  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };
  const handleRemoveTag = tagToRemove => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };
  const handleKeyPress = e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  // 图片上传处理
  const handleImageUpload = async e => {
    const file = e.target.files[0];
    if (!file) return;

    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      setError('请选择图片文件');
      return;
    }

    // 检查文件大小 (限制为5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('图片大小不能超过5MB');
      return;
    }
    setImageFile(file);
    setUploadingImage(true);
    setError(null);
    try {
      // 获取云开发实例
      const tcb = await $w.cloud.getCloudInstance();

      // 上传图片到云存储
      const uploadResult = await tcb.uploadFile({
        cloudPath: `red-story-images/${Date.now()}-${file.name}`,
        fileContent: file
      });

      // 获取图片的下载链接
      const fileInfo = await tcb.getTempFileURL({
        fileList: [uploadResult.fileID]
      });
      if (fileInfo.fileList && fileInfo.fileList.length > 0) {
        const imageUrl = fileInfo.fileList[0].tempFileURL;
        setFormData(prev => ({
          ...prev,
          image: imageUrl
        }));
      }
    } catch (err) {
      console.error('图片上传失败:', err);
      setError('图片上传失败，请重试');
    } finally {
      setUploadingImage(false);
    }
  };

  // 移除已上传的图片
  const handleRemoveImage = () => {
    setImageFile(null);
    setFormData(prev => ({
      ...prev,
      image: ''
    }));
  };

  // 表单验证
  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('请输入故事标题');
      return false;
    }
    if (!formData.content.trim()) {
      setError('请输入故事内容');
      return false;
    }
    return true;
  };

  // 保存为草稿
  const handleSaveAsDraft = async e => {
    e.preventDefault();
    setError(null);
    if (!validateForm()) {
      return;
    }
    setIsSubmitting(true);
    try {
      // 准备要保存的数据
      const dataToSave = {
        ...formData,
        // 确保必填字段不为空
        title: formData.title.trim(),
        content: formData.content.trim(),
        // 可选字段处理
        date: formData.date.trim() || '',
        location: formData.location.trim() || '',
        author: formData.author.trim() || '佚名',
        read_time: formData.read_time.trim() || '5分钟',
        tags: formData.tags.length > 0 ? formData.tags : ['红色教育'],
        status: 'draft',
        // 保存为草稿
        order: Date.now() // 使用时间戳作为排序值
      };

      // 调用数据模型保存数据
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'red_story',
        methodName: 'wedaCreateV2',
        params: {
          data: dataToSave
        }
      });
      console.log('草稿保存成功:', result);

      // 清除本地草稿
      localStorage.removeItem(DRAFT_KEY);
      setHasDraft(false);
      setLastSaved(null);

      // 显示成功提示
      setShowSuccess(true);

      // 重置表单
      setFormData({
        title: '',
        content: '',
        date: '',
        location: '',
        image: '',
        author: '',
        read_time: '',
        tags: [],
        status: 'draft',
        order: 0
      });
      setImageFile(null);

      // 2秒后隐藏成功提示并跳转到管理页面
      setTimeout(() => {
        setShowSuccess(false);
        $w.utils.navigateTo({
          pageId: 'admin',
          params: {
            from: 'upload'
          }
        });
      }, 2000);
    } catch (err) {
      console.error('保存草稿失败:', err);
      setError('保存草稿失败，请稍后重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 提交发布
  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);
    if (!validateForm()) {
      return;
    }
    setIsSubmitting(true);
    try {
      // 准备要保存的数据
      const dataToSave = {
        ...formData,
        // 确保必填字段不为空
        title: formData.title.trim(),
        content: formData.content.trim(),
        // 可选字段处理
        date: formData.date.trim() || '',
        location: formData.location.trim() || '',
        author: formData.author.trim() || '佚名',
        read_time: formData.read_time.trim() || '5分钟',
        tags: formData.tags.length > 0 ? formData.tags : ['红色教育'],
        status: 'published',
        // 直接发布
        order: Date.now() // 使用时间戳作为排序值
      };

      // 调用数据模型保存数据
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'red_story',
        methodName: 'wedaCreateV2',
        params: {
          data: dataToSave
        }
      });
      console.log('发布成功:', result);

      // 清除本地草稿
      localStorage.removeItem(DRAFT_KEY);
      setHasDraft(false);
      setLastSaved(null);

      // 显示成功提示
      setShowSuccess(true);

      // 重置表单
      setFormData({
        title: '',
        content: '',
        date: '',
        location: '',
        image: '',
        author: '',
        read_time: '',
        tags: [],
        status: 'draft',
        order: 0
      });
      setImageFile(null);

      // 2秒后隐藏成功提示并返回来源页面
      setTimeout(() => {
        setShowSuccess(false);
        if (fromPage === 'admin') {
          $w.utils.navigateTo({
            pageId: 'admin',
            params: {
              from: 'upload'
            }
          });
        } else {
          $w.utils.navigateTo({
            pageId: 'index',
            params: {
              from: 'upload'
            }
          });
        }
      }, 2000);
    } catch (err) {
      console.error('发布红色故事失败:', err);
      setError('发布失败，请稍后重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 格式化最后保存时间
  const formatLastSaved = dateString => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (minutes < 1) return '刚刚保存';
    if (minutes < 60) return `${minutes}分钟前保存`;
    if (hours < 24) return `${hours}小时前保存`;
    return `${days}天前保存`;
  };
  return <div className="min-h-screen bg-gray-900 text-white">
      {/* 背景装饰 */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-gray-900 to-gray-900"></div>
      
      {/* 顶部导航 */}
      <header className="relative z-10 bg-black/50 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button onClick={handleSmartBack} variant="ghost" className="text-gray-300 hover:text-white">
              <ArrowLeft className="w-5 h-5 mr-2" />
              返回
            </Button>
            {fromPage && <span className="text-sm text-gray-400">
                来自: {fromPage === 'index' ? '主页' : fromPage === 'admin' ? '管理后台' : '未知页面'}
              </span>}
          </div>
          <h1 className="text-2xl font-bold text-red-600">上传红色故事</h1>
          <div className="flex items-center gap-2">
            {/* 草稿状态指示器 */}
            {hasDraft && <div className="flex items-center gap-2 text-sm text-gray-400">
                <Save className="w-4 h-4" />
                <span>{formatLastSaved(lastSaved)}</span>
              </div>}
            <Button onClick={goHome} variant="ghost" className="text-gray-300 hover:text-white">
              <Home className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        {/* 草稿提示 */}
        <DraftIndicator hasDraft={hasDraft} lastSaved={lastSaved} onClearDraft={clearDraft} className="mb-6" />

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-gray-700">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 错误提示 */}
            {error && <div className="bg-red-900/50 border border-red-600 text-red-200 px-4 py-3 rounded-lg">
                {error}
              </div>}

            {/* 标题输入 */}
            <FormInput label="故事标题" name="title" value={formData.title} onChange={handleInputChange} placeholder="请输入红色故事标题" required icon={FileText} />

            {/* 时间和地点 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput label="时间时期" name="date" value={formData.date} onChange={handleInputChange} placeholder="如：1927-1930（可选）" />
              <FormInput label="发生地点" name="location" value={formData.location} onChange={handleInputChange} placeholder="如：江西井冈山（可选）" />
            </div>

            {/* 作者和阅读时间 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput label="作者" name="author" value={formData.author} onChange={handleInputChange} placeholder="如：中国共产党" />
              <FormInput label="阅读时间" name="read_time" value={formData.read_time} onChange={handleInputChange} placeholder="如：8分钟" />
            </div>

            {/* 内容输入 */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                故事内容 *
              </label>
              <textarea name="content" value={formData.content} onChange={handleInputChange} required rows={8} className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent resize-none" placeholder="请详细描述红色故事的内容和意义..." />
            </div>

            {/* 标签管理 */}
            <TagManager tags={formData.tags} newTag={newTag} onNewTagChange={e => setNewTag(e.target.value)} onAddTag={handleAddTag} onRemoveTag={handleRemoveTag} onKeyPress={handleKeyPress} />

            {/* 图片上传 */}
            <ImageUpload image={formData.image} onImageUpload={handleImageUpload} onRemoveImage={handleRemoveImage} uploadingImage={uploadingImage} />

            {/* 操作按钮 */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              {/* 左侧按钮 */}
              <div className="flex gap-4">
                <Button type="button" onClick={handleSmartBack} variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                  取消
                </Button>
                <Button type="button" onClick={handleSaveDraft} disabled={isSavingDraft} variant="outline" className="border-blue-600 text-blue-300 hover:bg-blue-900/20">
                  {isSavingDraft ? <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      保存中...
                    </> : <>
                      <Save className="w-4 h-4 mr-2" />
                      暂存草稿
                    </>}
                </Button>
              </div>

              {/* 右侧按钮 */}
              <div className="flex gap-4 ml-auto">
                <Button type="button" onClick={handleSaveAsDraft} disabled={isSubmitting} variant="outline" className="border-yellow-600 text-yellow-300 hover:bg-yellow-900/20">
                  {isSubmitting ? <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-300 mr-2"></div>
                      保存中...
                    </> : <>
                      <Save className="w-4 h-4 mr-2" />
                      保存为草稿
                    </>}
                </Button>
                <Button type="submit" disabled={isSubmitting} className="bg-red-600 hover:bg-red-700 text-white px-8">
                  {isSubmitting ? <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      发布中...
                    </> : <>
                      <UploadIcon className="w-4 h-4 mr-2" />
                      立即发布
                    </>}
                </Button>
              </div>
            </div>
          </form>
        </div>

        {/* 成功提示 */}
        {showSuccess && <div className="fixed top-20 right-4 bg-green-600 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 z-50 animate-pulse">
            <Check className="w-5 h-5" />
            <span>操作成功！正在跳转...</span>
          </div>}
      </main>
    </div>;
}