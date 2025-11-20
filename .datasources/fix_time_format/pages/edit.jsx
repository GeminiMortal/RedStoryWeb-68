
// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button } from '@/components/ui';
// @ts-ignore;
import { ArrowLeft, Upload, Calendar, MapPin, Tag, Clock, AlertCircle, CheckCircle, Trash2, ImageOff, Save, X } from 'lucide-react';

export default function EditPage(props) {
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
  const [originalImage, setOriginalImage] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [deleteImageConfirm, setDeleteImageConfirm] = useState(false);
  const [loading, setLoading] = useState(true);

  // 从URL参数获取故事ID
  const storyId = props.$w.page.dataset.params.id;

  // 加载现有故事数据
  useEffect(() => {
    if (!storyId) {
      setError('未提供故事ID');
      setLoading(false);
      return;
    }
    const loadStory = async () => {
      try {
        setLoading(true);
        console.log('加载编辑数据，故事ID:', storyId);
        const result = await $w.cloud.callDataSource({
          dataSourceName: 'red_story',
          methodName: 'wedaGetRecordV2',
          params: {
            filter: {
              where: {
                _id: {
                  $eq: storyId
                }
              }
            },
            select: {
              $master: true
            }
          }
        });
        console.log('编辑页面加载结果:', result);
        if (result && result.record) {
          const record = result.record;
          setFormData({
            title: record.title || '',
            content: record.content || '',
            author: record.author || '',
            date: record.date || '',
            location: record.location || '',
            readTime: record.read_time || '5分钟',
            tags: Array.isArray(record.tags) ? record.tags.join(', ') : '',
            status: record.status || 'draft'
          });
          setOriginalImage(record.image || '');
          setImagePreview(record.image || '');
        } else {
          setError('未找到该红色故事');
        }
      } catch (err) {
        console.error('加载故事失败:', err);
        setError(`加载失败: ${err.message || '未知错误'}`);
      } finally {
        setLoading(false);
      }
    };
    loadStory();
  }, [storyId, $w]);

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
      if (!file.type.startsWith('image/')) {
        setError('请选择图片文件');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('图片文件不能超过5MB');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = e => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  // 删除图片
  const handleDeleteImage = () => {
    setDeleteImageConfirm(true);
  };
  const confirmDeleteImage = () => {
    setOriginalImage('');
    setImageFile(null);
    setImagePreview('');
    setDeleteImageConfirm(false);
  };
  const cancelDeleteImage = () => {
    setDeleteImageConfirm(false);
  };

  // 上传图片到云存储
  const uploadImage = async file => {
    try {
      const cloud = await $w.cloud.getCloudInstance();
      const timestamp = Date.now();
      const fileName = `red_story_${timestamp}_${file.name}`;
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
    if (!formData.title.trim()) {
      setError('请输入故事标题');
      return;
    }
    if (!formData.content.trim()) {
      setError('请输入故事内容');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      let imageUrl = originalImage;
      if (imageFile) {
        console.log('上传新图片...');
        imageUrl = await uploadImage(imageFile);
      } else if (!imagePreview && originalImage) {
        // 图片被删除
        imageUrl = '';
      }
      // 处理标签 - 确保返回数组类型
      const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      console.log('开始更新故事数据...');
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'red_story',
        methodName: 'wedaUpdateV2',
        params: {
          filter: {
            where: {
              _id: {
                $eq: storyId
              }
            }
          },
          data: {
            title: formData.title.trim(),
            // String
            content: formData.content.trim(),
            // Text
            author: formData.author.trim(),
            // String
            date: formData.date,
            // Date
            location: formData.location.trim(),
            // String
            image: imageUrl,
            // Image
            read_time: formData.readTime,
            // String
            tags: tagsArray,
            // Array
            status: formData.status,
            // String
            updatedAt: Date.now() // Date - 使用时间戳格式
          }
        }
      });
      console.log('更新结果:', result);
      setSuccess(true);
      setTimeout(() => {
        $w.utils.navigateTo({
          pageId: 'admin',
          params: {}
        });
      }, 2000);
    } catch (err) {
      console.error('更新故事失败:', err);
      setError(`更新失败: ${err.message || '未知错误'}`);
    } finally {
      setSaving(false);
    }
  };

  // 导航函数
  const goBack = () => {
    $w.utils.navigateBack();
  };
  const goToAdmin = () => {
    $w.utils.navigateTo({
      pageId: 'admin',
      params: {}
    });
  };

  // 加载状态
  if (loading) {
    return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-400">加载编辑数据中...</p>
        </div>
      </div>;
  }

  // 成功状态
  if (success) {
    return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">更新成功！</h2>
          <p className="text-gray-400 mb-4">红色故事已成功更新</p>
          <p className="text-sm text-gray-500">正在跳转到管理页面...</p>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-gray-900 text-white">
      {/* 背景装饰 */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-gray-900 to-gray-900"></div>
      
      {/* 顶部导航 */}
      <header className="relative z-10 bg-black/50 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button onClick={goBack} variant="ghost" className="text-gray-300 hover:text-white">
            <ArrowLeft className="w-5 h-5 mr-2" />
            返回
          </Button>
          <h1 className="text-2xl font-bold text-red-600">编辑红色故事</h1>
          <Button onClick={goToAdmin} variant="ghost" className="text-gray-300 hover:text-white">
            管理
          </Button>
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

        {/* 编辑提示 */}
        <div className="bg-blue-900/30 border border-blue-600 text-blue-200 px-4 py-3 rounded-lg mb-6">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>您正在编辑红色故事，修改后请记得保存</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-gray-700">
          {/* 图片编辑区域 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">故事图片</label>
            <div className="border-2 border-dashed border-gray-600 rounded-lg p-6">
              {imagePreview ? <div className="space-y-4">
                  <img src={imagePreview} alt="预览" className="max-w-full h-48 object-cover rounded-lg mx-auto" />
                  <div className="flex gap-2 justify-center">
                    <label className="cursor-pointer">
                      <span className="text-red-400 hover:text-red-300 text-sm">替换图片</span>
                      <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </label>
                    <button type="button" onClick={handleDeleteImage} className="text-red-400 hover:text-red-300 text-sm">
                      删除图片
                    </button>
                  </div>
                </div> : <div className="space-y-4">
                  <ImageOff className="w-12 h-12 text-gray-400 mx-auto" />
                  <div>
                    <label className="cursor-pointer">
                      <span className="text-red-400 hover:text-red-300">上传新图片</span>
                      <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </label>
                    <p className="text-sm text-gray-500 mt-2">支持 JPG、PNG、GIF 格式，最大 5MB</p>
                  </div>
                </div>}
            </div>
          </div>

          {/* 删除图片确认对话框 */}
          {deleteImageConfirm && <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-gray-800 rounded-lg p-6 max-w-sm mx-4">
                <h3 className="text-lg font-medium text-white mb-4">确认删除图片？</h3>
                <p className="text-gray-400 mb-6">删除后图片将无法恢复，确定要删除吗？</p>
                <div className="flex gap-3 justify-end">
                  <Button onClick={cancelDeleteImage} variant="outline" className="border-gray-600 text-gray-300">
                    取消
                  </Button>
                  <Button onClick={confirmDeleteImage} className="bg-red-600 hover:bg-red-700 text-white">
                    确认删除
                  </Button>
                </div>
              </div>
            </div>}

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
            <Button type="submit" disabled={saving || uploading} className="flex-1 bg-red-600 hover:bg-red-700 text-white">
              {saving || uploading ? <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {uploading ? '上传中...' : '保存中...'}
                </div> : <div className="flex items-center justify-center">
                  <Save className="w-4 h-4 mr-2" />
                  保存修改
                </div>}
            </Button>
            <Button type="button" onClick={goBack} variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
              <X className="w-4 h-4 mr-2" />
              取消
            </Button>
          </div>
        </form>
      </main>
    </div>;
}
  