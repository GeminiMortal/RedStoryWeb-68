// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Button } from '@/components/ui';
// @ts-ignore;
import { ArrowLeft, Upload, Calendar, MapPin, Tag, Clock, AlertCircle, CheckCircle } from 'lucide-react';

export default function UploadPage(props) {
  const {
    $w
  } = props;
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    author: '',
    date: '',
    location: '',
    readTime: '5分钟',
    tags: '',
    status: 'draft'
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // 处理表单输入变化
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

  // 处理图片选择
  const handleImageChange = e => {
    const file = e.target.files[0];
    if (file) {
      // 检查文件类型
      if (!file.type.startsWith('image/')) {
        setError('请选择图片文件');
        return;
      }

      // 检查文件大小 (最大5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('图片文件不能超过5MB');
        return;
      }
      setImageFile(file);

      // 创建预览
      const reader = new FileReader();
      reader.onload = e => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  // 上传图片到云存储
  const uploadImage = async file => {
    try {
      const cloud = await $w.cloud.getCloudInstance();

      // 生成唯一文件名
      const timestamp = Date.now();
      const fileName = `red_story_${timestamp}_${file.name}`;

      // 上传到云存储
      const uploadResult = await cloud.uploadFile({
        cloudPath: `red_stories/${fileName}`,
        filePath: file
      });
      console.log('图片上传成功:', uploadResult);
      return uploadResult.fileID;
    } catch (err) {
      console.error('图片上传失败:', err);
      throw new Error('图片上传失败: ' + err.message);
    }
  };

  // 处理表单提交
  const handleSubmit = async e => {
    e.preventDefault();

    // 验证必填字段
    if (!formData.title.trim()) {
      setError('请输入故事标题');
      return;
    }
    if (!formData.content.trim()) {
      setError('请输入故事内容');
      return;
    }
    setUploading(true);
    setError(null);
    try {
      let imageUrl = '';

      // 如果有图片，先上传图片
      if (imageFile) {
        console.log('开始上传图片...');
        imageUrl = await uploadImage(imageFile);
        console.log('图片URL:', imageUrl);
      }

      // 处理标签
      const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);

      // 保存到数据模型
      console.log('开始保存故事数据...');
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'red_story',
        methodName: 'wedaCreateV2',
        params: {
          data: {
            title: formData.title.trim(),
            content: formData.content.trim(),
            author: formData.author.trim() || '佚名',
            date: formData.date,
            location: formData.location.trim(),
            image: imageUrl,
            read_time: formData.readTime,
            tags: tagsArray,
            status: formData.status,
            order: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        }
      });
      console.log('故事保存成功:', result);
      setSuccess(true);

      // 清空表单
      setFormData({
        title: '',
        content: '',
        author: '',
        date: '',
        location: '',
        readTime: '5分钟',
        tags: '',
        status: 'draft'
      });
      setImageFile(null);
      setImagePreview('');

      // 显示成功消息
      setTimeout(() => {
        $w.utils.navigateTo({
          pageId: 'admin',
          params: {}
        });
      }, 2000);
    } catch (err) {
      console.error('保存故事失败:', err);
      setError(`保存失败: ${err.message || '未知错误'}`);
    } finally {
      setUploading(false);
    }
  };

  // 导航函数
  const goBack = () => {
    $w.utils.navigateBack();
  };

  // 成功状态
  if (success) {
    return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">上传成功！</h2>
          <p className="text-gray-400 mb-4">红色故事已成功保存</p>
          <p className="text-sm text-gray-500">正在跳转到管理页面...</p>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-gray-900 text-white">
      {/* 背景装饰 */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-gray-900 to-gray-900"></div>
      
      {/* 顶部导航 */}
      <header className="relative z-10 bg-black/50 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button onClick={goBack} variant="ghost" className="text-gray-300 hover:text-white">
            <ArrowLeft className="w-5 h-5 mr-2" />
            返回
          </Button>
          <h1 className="text-2xl font-bold text-red-600">上传红色故事</h1>
          <div className="w-24"></div>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        {/* 错误提示 */}
        {error && <div className="bg-red-900/50 border border-red-600 text-red-200 px-4 py-3 rounded-lg mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
            <Button onClick={() => setError(null)} variant="ghost" size="sm" className="text-red-300 hover:text-red-100">
              ×
            </Button>
          </div>}

        <form onSubmit={handleSubmit} className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-gray-700">
          {/* 图片上传 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">故事图片</label>
            <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-red-600/50 transition-colors">
              {imagePreview ? <div className="space-y-4">
                  <img src={imagePreview} alt="预览" className="max-w-full h-48 object-cover rounded-lg mx-auto" />
                  <Button type="button" onClick={() => {
                setImageFile(null);
                setImagePreview('');
              }} variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                    重新选择
                  </Button>
                </div> : <div className="space-y-4">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                  <div>
                    <label className="cursor-pointer">
                      <span className="text-red-400 hover:text-red-300">点击上传图片</span>
                      <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </label>
                    <p className="text-sm text-gray-500 mt-2">支持 JPG、PNG、GIF 格式，最大 5MB</p>
                  </div>
                </div>}
            </div>
          </div>

          {/* 标题 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              故事标题 <span className="text-red-400">*</span>
            </label>
            <input type="text" name="title" value={formData.title} onChange={handleInputChange} placeholder="请输入红色故事标题" className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent" required />
          </div>

          {/* 内容 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              故事内容 <span className="text-red-400">*</span>
            </label>
            <textarea name="content" value={formData.content} onChange={handleInputChange} placeholder="请详细描述红色故事的内容..." rows={6} className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent resize-none" required />
          </div>

          {/* 作者 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">作者</label>
            <input type="text" name="author" value={formData.author} onChange={handleInputChange} placeholder="请输入作者姓名" className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent" />
          </div>

          {/* 时间地点 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                发生时间
              </label>
              <input type="date" name="date" value={formData.date} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <MapPin className="w-4 h-4 inline mr-2" />
                发生地点
              </label>
              <input type="text" name="location" value={formData.location} onChange={handleInputChange} placeholder="请输入故事发生地点" className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent" />
            </div>
          </div>

          {/* 阅读时间和标签 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Clock className="w-4 h-4 inline mr-2" />
                阅读时长
              </label>
              <select name="readTime" value={formData.readTime} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent">
                <option value="3分钟">3分钟</option>
                <option value="5分钟">5分钟</option>
                <option value="10分钟">10分钟</option>
                <option value="15分钟">15分钟</option>
                <option value="20分钟">20分钟</option>
                <option value="30分钟">30分钟</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Tag className="w-4 h-4 inline mr-2" />
                标签
              </label>
              <input type="text" name="tags" value={formData.tags} onChange={handleInputChange} placeholder="用逗号分隔多个标签，如：革命,历史,英雄" className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent" />
            </div>
          </div>

          {/* 状态 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">发布状态</label>
            <select name="status" value={formData.status} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent">
              <option value="draft">草稿</option>
              <option value="published">发布</option>
            </select>
          </div>

          {/* 提交按钮 */}
          <div className="flex gap-4">
            <Button type="submit" disabled={uploading} className="flex-1 bg-red-600 hover:bg-red-700 text-white">
              {uploading ? <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  上传中...
                </div> : '保存红色故事'}
            </Button>
            <Button type="button" onClick={goBack} variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
              取消
            </Button>
          </div>
        </form>
      </main>
    </div>;
}