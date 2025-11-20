// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Button } from '@/components/ui';
// @ts-ignore;
import { ArrowLeft, Upload as UploadIcon, FileText, Image, X, Check, Plus, Tag } from 'lucide-react';

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
  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('请输入故事标题');
      return false;
    }
    if (!formData.content.trim()) {
      setError('请输入故事内容');
      return false;
    }
    if (!formData.date.trim()) {
      setError('请输入时间时期');
      return false;
    }
    if (!formData.location.trim()) {
      setError('请输入发生地点');
      return false;
    }
    return true;
  };
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
        date: formData.date.trim(),
        location: formData.location.trim(),
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
      console.log('保存成功:', result);

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

      // 2秒后隐藏成功提示并返回主页
      setTimeout(() => {
        setShowSuccess(false);
        $w.utils.navigateTo({
          pageId: 'index',
          params: {}
        });
      }, 2000);
    } catch (err) {
      console.error('保存红色故事失败:', err);
      setError('保存失败，请稍后重试');
    } finally {
      setIsSubmitting(false);
    }
  };
  const goBack = () => {
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
          <div className="w-20"></div>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 py-8">
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

            {/* 时间和地点 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  时间时期 *
                </label>
                <input type="text" name="date" value={formData.date} onChange={handleInputChange} required className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent" placeholder="如：1927-1930" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  发生地点 *
                </label>
                <input type="text" name="location" value={formData.location} onChange={handleInputChange} required className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent" placeholder="如：江西井冈山" />
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

            {/* 图片上传 */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Image className="inline w-4 h-4 mr-1" />
                配图链接（可选）
              </label>
              <input type="url" name="image" value={formData.image} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent" placeholder="请输入图片URL地址" />
            </div>

            {/* 提交按钮 */}
            <div className="flex justify-end gap-4 pt-4">
              <Button type="button" onClick={goBack} variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                取消
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-red-600 hover:bg-red-700 text-white px-8">
                {isSubmitting ? <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    保存中...
                  </> : <>
                    <UploadIcon className="w-4 h-4 mr-2" />
                    提交故事
                  </>}
              </Button>
            </div>
          </form>
        </div>

        {/* 成功提示 */}
        {showSuccess && <div className="fixed top-20 right-4 bg-green-600 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 z-50 animate-pulse">
            <Check className="w-5 h-5" />
            <span>红色故事上传成功！正在跳转...</span>
          </div>}
      </main>
    </div>;
}