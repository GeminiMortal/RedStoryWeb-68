// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button } from '@/components/ui';
// @ts-ignore;
import { ArrowLeft, Upload as UploadIcon, FileText, Image, X, Check, Plus, Tag, Loader2, Save, RefreshCw, AlertCircle } from 'lucide-react';

export default function UploadPage(props) {
  const {
    $w
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
          params: {}
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

      // 2秒后隐藏成功提示并返回主页
      setTimeout(() => {
        setShowSuccess(false);
        $w.utils.navigateTo({
          pageId: 'index',
          params: {}
        });
      }, 2000);
    } catch (err) {
      console.error('发布红色故事失败:', err);
      setError('发布失败，请稍后重试');
    } finally {
      setIsSubmitting(false);
    }
  };
  const goBack = () => {
    // 如果有草稿，提示用户
    if (hasDraft) {
      if (!confirm('您有未保存的草稿，确定要离开吗？')) {
        return;
      }
    }
    $w.utils.navigateBack();
  };
  return <div className="min-h-screen bg-gray-900 text-white">
      {/* 背景装饰 */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-gray-900 to-gray-900"></div>
      
      {/* 顶部导航 */}
      <header className="relative z-10 bg-black/50 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button onClick={goBack} variant="ghost" className="text-gray-300 hover:text-white">
            <ArrowLeft className="w-5 h-5 mr-2" />
            返回主页
          </Button>
          <h1 className="text-2xl font-bold text-red-600">上传红色故事</h1>
          <div className="flex items-center gap-2">
            {/* 草稿状态指示器 */}
            {hasDraft && <div className="flex items-center gap-2 text-sm text-gray-400">
                <Save className="w-4 h-4" />
                <span>{formatLastSaved(lastSaved)}</span>
              </div>}
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        {/* 草稿提示 */}
        {hasDraft && <div className="bg-blue-900/30 border border-blue-600 text-blue-200 px-4 py-3 rounded-lg mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>已恢复暂存的草稿内容</span>
            </div>
            <Button onClick={clearDraft} variant="ghost" size="sm" className="text-blue-300 hover:text-blue-100">
              清除草稿
            </Button>
          </div>}

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-gray-700">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 错误提示 */}
            {error && <div className="bg-red-900/50 border border-red-600 text-red-200 px-4 py-3 rounded-lg">
                {error}
              </div>}

            {/* 标题输入 */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <FileText className="inline w-4 h-4 mr-1" />
                故事标题 *
              </label>
              <input type="text" name="title" value={formData.title} onChange={handleInputChange} required className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent" placeholder="请输入红色故事标题" />
            </div>

            {/* 时间和地点 - 改为可选 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  时间时期
                </label>
                <input type="text" name="date" value={formData.date} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent" placeholder="如：1927-1930（可选）" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  发生地点
                </label>
                <input type="text" name="location" value={formData.location} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent" placeholder="如：江西井冈山（可选）" />
              </div>
            </div>

            {/* 作者和阅读时间 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  作者
                </label>
                <input type="text" name="author" value={formData.author} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent" placeholder="如：中国共产党" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  阅读时间
                </label>
                <input type="text" name="read_time" value={formData.read_time} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent" placeholder="如：8分钟" />
              </div>
            </div>

            {/* 内容输入 */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                故事内容 *
              </label>
              <textarea name="content" value={formData.content} onChange={handleInputChange} required rows={8} className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent resize-none" placeholder="请详细描述红色故事的内容和意义..." />
            </div>

            {/* 标签管理 */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Tag className="inline w-4 h-4 mr-1" />
                标签
              </label>
              <div className="flex gap-2 mb-3">
                <input type="text" value={newTag} onChange={e => setNewTag(e.target.value)} onKeyPress={handleKeyPress} className="flex-1 px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent" placeholder="输入标签后按回车添加" />
                <Button type="button" onClick={handleAddTag} variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => <span key={index} className="inline-flex items-center gap-1 px-3 py-1 bg-red-900/30 text-red-300 rounded-full text-sm">
                    {tag}
                    <button type="button" onClick={() => handleRemoveTag(tag)} className="hover:text-red-100">
                      <X className="w-3 h-3" />
                    </button>
                  </span>)}
              </div>
            </div>

            {/* 图片上传 - 改为本地上传 */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Image className="inline w-4 h-4 mr-1" />
                配图（可选）
              </label>
              
              {/* 已上传图片预览 */}
              {formData.image && <div className="mb-4">
                  <div className="relative inline-block">
                    <img src={formData.image} alt="已上传的配图" className="w-32 h-32 object-cover rounded-lg border border-gray-600" />
                    <button type="button" onClick={handleRemoveImage} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>}

              {/* 上传按钮 */}
              <div className="flex items-center gap-4">
                <label className="cursor-pointer">
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploadingImage} />
                  <div className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    {uploadingImage ? <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>上传中...</span>
                      </> : <>
                        <UploadIcon className="w-4 h-4" />
                        <span>选择图片</span>
                      </>}
                  </div>
                </label>
                <span className="text-sm text-gray-400">支持 JPG、PNG、GIF 格式，最大 5MB</span>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              {/* 左侧按钮 */}
              <div className="flex gap-4">
                <Button type="button" onClick={goBack} variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
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