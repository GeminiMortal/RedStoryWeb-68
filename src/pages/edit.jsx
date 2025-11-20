// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button } from '@/components/ui';
// @ts-ignore;
import { ArrowLeft, Upload, Image, Calendar, MapPin, Clock, Tag, User, AlertCircle, CheckCircle, Save, Eye, Edit3, RefreshCw } from 'lucide-react';

// @ts-ignore;
import { PageHeader, BreadcrumbNav } from '@/components/Navigation';
export default function EditPage(props) {
  const {
    $w
  } = props;
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    image: '',
    date: '',
    location: '',
    author: '',
    read_time: '',
    tags: [],
    status: 'published',
    order: 0
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [saveMode, setSaveMode] = useState('publish'); // 'draft' 或 'publish'
  const [tagInput, setTagInput] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [isDraft, setIsDraft] = useState(false);
  const [storyId, setStoryId] = useState(null);

  // 从URL参数获取故事ID
  useEffect(() => {
    const id = props.$w.page.dataset.params.id;
    setStoryId(id);
  }, [props.$w.page.dataset.params]);

  // 加载故事数据
  useEffect(() => {
    if (!storyId) {
      setError('未提供故事ID');
      setLoading(false);
      return;
    }
    const loadStory = async () => {
      try {
        setLoading(true);
        console.log('加载故事数据，ID:', storyId);

        // 使用云开发实例直接调用数据库
        const tcb = await $w.cloud.getCloudInstance();
        const db = tcb.database();

        // 先尝试从正式发布中查找
        let storyResult = await db.collection('red_story').doc(storyId).get();

        // 如果正式发布中没有，尝试从草稿中查找
        if (!storyResult || !storyResult.data) {
          storyResult = await db.collection('red_story_draft').doc(storyId).get();
          if (storyResult && storyResult.data) {
            setIsDraft(true);
            setSaveMode('draft');
          }
        }
        console.log('故事数据加载结果:', storyResult);
        if (storyResult && storyResult.data) {
          const story = storyResult.data;
          setFormData({
            title: story.title || '',
            content: story.content || '',
            image: story.image || '',
            date: story.date || '',
            location: story.location || '',
            author: story.author || '',
            read_time: story.read_time || '',
            tags: story.tags || [],
            status: story.status || 'published',
            order: story.order || 0
          });
          setImagePreview(story.image || null);
        } else {
          setError('未找到该红色故事');
        }
      } catch (err) {
        console.error('加载故事数据失败:', err);
        setError(`加载失败: ${err.message || '未知错误'}`);
      } finally {
        setLoading(false);
      }
    };
    loadStory();
  }, [storyId]);

  // 导航函数
  const navigateTo = $w.utils.navigateTo;
  const goBack = () => {
    $w.utils.navigateBack();
  };
  const goToAdmin = () => {
    navigateTo({
      pageId: 'admin',
      params: {}
    });
  };

  // 处理表单输入变化
  const handleInputChange = e => {
    const {
      name,
      value,
      type,
      files
    } = e.target;
    if (type === 'file') {
      const file = files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = e => {
          setImagePreview(e.target.result);
          setFormData(prev => ({
            ...prev,
            image: e.target.result
          }));
        };
        reader.readAsDataURL(file);
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    // 清除错误信息
    if (error) {
      setError(null);
    }
  };

  // 处理标签输入
  const handleTagInput = e => {
    setTagInput(e.target.value);
  };

  // 添加标签
  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
      setTagInput('');
    }
  };

  // 移除标签
  const removeTag = tagToRemove => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // 处理标签输入的键盘事件
  const handleTagKeyPress = e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  // 处理保存模式切换
  const handleSaveModeChange = mode => {
    setSaveMode(mode);
    setFormData(prev => ({
      ...prev,
      status: mode === 'draft' ? 'draft' : 'published'
    }));
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
    setSaving(true);
    setError(null);
    try {
      console.log(`开始${saveMode === 'draft' ? '更新草稿' : '更新正式发布'}...`);

      // 使用云开发实例直接调用数据库
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();

      // 准备更新数据
      const updateData = {
        ...formData,
        updatedAt: Date.now()
      };

      // 根据保存模式选择更新的数据模型
      const collectionName = saveMode === 'draft' ? 'red_story_draft' : 'red_story';

      // 更新数据
      const result = await db.collection(collectionName).doc(storyId).update(updateData);
      console.log('更新结果:', result);

      // 如果从草稿转为正式发布，需要删除草稿
      if (saveMode === 'publish' && isDraft) {
        await db.collection('red_story_draft').doc(storyId).remove();
        console.log('草稿已删除');
      }

      // 显示成功提示
      setSuccess(true);

      // 延迟跳转
      setTimeout(() => {
        navigateTo({
          pageId: 'admin',
          params: {}
        });
      }, 2000);
    } catch (err) {
      console.error('更新失败:', err);
      setError(`更新失败: ${err.message || '未知错误'}`);
    } finally {
      setSaving(false);
    }
  };

  // 面包屑导航
  const breadcrumbs = [{
    label: '首页',
    href: true,
    onClick: () => navigateTo({
      pageId: 'index',
      params: {}
    })
  }, {
    label: '管理后台',
    href: true,
    onClick: goToAdmin
  }, {
    label: '编辑红色故事'
  }];

  // 加载状态
  if (loading) {
    return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-400">加载故事数据中...</p>
        </div>
      </div>;
  }

  // 成功状态
  if (success) {
    return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">
            {saveMode === 'draft' ? '草稿更新成功！' : '发布更新成功！'}
          </h2>
          <p className="text-gray-400 mb-4">
            {saveMode === 'draft' ? '您的草稿已更新，可在管理后台继续编辑' : '您的红色故事已成功更新'}
          </p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-gray-900 text-white">
      {/* 背景装饰 */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-gray-900 to-gray-900"></div>
      
      {/* 顶部导航 */}
      <PageHeader title="编辑红色故事" showBack={true} backAction={goBack} breadcrumbs={breadcrumbs} />

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

        {/* 当前状态提示 */}
        <div className={`bg-${isDraft ? 'yellow' : 'green'}-900/30 border border-${isDraft ? 'yellow' : 'green'}-600 text-${isDraft ? 'yellow' : 'green'}-200 px-4 py-3 rounded-lg mb-6`}>
          <div className="flex items-center gap-2">
            {isDraft ? <Edit3 className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span>当前正在编辑：{isDraft ? '草稿内容' : '正式发布内容'}</span>
          </div>
        </div>

        {/* 保存模式选择 */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 mb-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">保存模式选择</h3>
          <div className="flex gap-4">
            <button onClick={() => handleSaveModeChange('draft')} className={`flex-1 p-4 rounded-lg border-2 transition-all ${saveMode === 'draft' ? 'border-yellow-600 bg-yellow-900/20' : 'border-gray-600 hover:border-gray-500'}`}>
              <div className="text-center">
                <Edit3 className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
                <h4 className="font-semibold text-white mb-1">更新草稿</h4>
                <p className="text-sm text-gray-400">仅更新草稿内容，不会立即发布</p>
              </div>
            </button>
            <button onClick={() => handleSaveModeChange('publish')} className={`flex-1 p-4 rounded-lg border-2 transition-all ${saveMode === 'publish' ? 'border-green-600 bg-green-900/20' : 'border-gray-600 hover:border-gray-500'}`}>
              <div className="text-center">
                <Eye className="w-8 h-8 mx-auto mb-2 text-green-400" />
                <h4 className="font-semibold text-white mb-1">更新发布</h4>
                <p className="text-sm text-gray-400">
                  {isDraft ? '将草稿转为正式发布' : '更新正式发布内容'}
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* 编辑表单 */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-gray-700">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 故事标题 */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                故事标题 *
              </label>
              <input type="text" name="title" value={formData.title} onChange={handleInputChange} placeholder="请输入红色故事标题" className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent" required />
            </div>

            {/* 故事内容 */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                故事内容 *
              </label>
              <textarea name="content" value={formData.content} onChange={handleInputChange} placeholder="请详细描述红色故事的内容..." rows={8} className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent resize-none" required />
            </div>

            {/* 配图上传 */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                故事配图
              </label>
              <div className="flex items-center gap-4">
                <input type="file" accept="image/*" onChange={handleInputChange} className="hidden" id="image-upload" />
                <label htmlFor="image-upload" className="cursor-pointer bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-gray-300 hover:bg-gray-800/50 transition-colors">
                  <Upload className="w-5 h-5 inline-block mr-2" />
                  更换图片
                </label>
                {imagePreview && <div className="relative">
                    <img src={imagePreview} alt="预览" className="w-20 h-20 object-cover rounded-lg border border-gray-700" />
                    <button type="button" onClick={() => {
                  setImagePreview(null);
                  setFormData(prev => ({
                    ...prev,
                    image: ''
                  }));
                }} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                      ×
                    </button>
                  </div>}
              </div>
            </div>

            {/* 故事信息 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Calendar className="w-4 h-4 inline-block mr-1" />
                  时间时期
                </label>
                <input type="text" name="date" value={formData.date} onChange={handleInputChange} placeholder="如：1949年10月1日" className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <MapPin className="w-4 h-4 inline-block mr-1" />
                  发生地点
                </label>
                <input type="text" name="location" value={formData.location} onChange={handleInputChange} placeholder="如：北京天安门" className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <User className="w-4 h-4 inline-block mr-1" />
                  作者
                </label>
                <input type="text" name="author" value={formData.author} onChange={handleInputChange} placeholder="请输入作者姓名" className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Clock className="w-4 h-4 inline-block mr-1" />
                  阅读时间
                </label>
                <input type="text" name="read_time" value={formData.read_time} onChange={handleInputChange} placeholder="如：5分钟" className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent" />
              </div>
            </div>

            {/* 标签 */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Tag className="w-4 h-4 inline-block mr-1" />
                标签
              </label>
              <div className="flex gap-2 mb-2">
                <input type="text" value={tagInput} onChange={handleTagInput} onKeyPress={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const tag = tagInput.trim();
                  if (tag && !formData.tags.includes(tag)) {
                    setFormData(prev => ({
                      ...prev,
                      tags: [...prev.tags, tag]
                    }));
                    setTagInput('');
                  }
                }
              }} placeholder="输入标签后按回车添加" className="flex-1 px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent" />
                <button type="button" onClick={() => {
                const tag = tagInput.trim();
                if (tag && !formData.tags.includes(tag)) {
                  setFormData(prev => ({
                    ...prev,
                    tags: [...prev.tags, tag]
                  }));
                  setTagInput('');
                }
              }} className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                  添加
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => <span key={index} className="px-3 py-1 bg-red-900/30 text-red-300 text-sm rounded-full border border-red-800/50 flex items-center gap-1">
                    {tag}
                    <button type="button" onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    tags: prev.tags.filter(t => t !== tag)
                  }));
                }} className="ml-1 text-red-400 hover:text-red-300">
                      ×
                    </button>
                  </span>)}
              </div>
            </div>

            {/* 排序 */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                排序权重
              </label>
              <input type="number" name="order" value={formData.order} onChange={handleInputChange} placeholder="数字越大越靠前" className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent" />
            </div>

            {/* 提交按钮 */}
            <div className="pt-6 border-t border-gray-700">
              <div className="flex gap-4">
                <Button type="submit" disabled={saving} className={`flex-1 ${saveMode === 'draft' ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-red-600 hover:bg-red-700'} text-white`}>
                  {saving ? '保存中...' : saveMode === 'draft' ? '更新草稿' : '更新发布'}
                </Button>
                <Button type="button" onClick={goBack} variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                  取消
                </Button>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>;
}