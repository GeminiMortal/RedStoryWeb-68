// @ts-ignore;
import React, { useState, useEffect, useRef } from 'react';
// @ts-ignore;
import { Button, Card, CardContent, CardHeader, CardTitle, useToast } from '@/components/ui';
// @ts-ignore;
import { ArrowLeft, Save, Upload, Image as ImageIcon, X, Eye, Send, FileText, Clock, User, Hash, Edit3, Loader2, Home } from 'lucide-react';
// @ts-ignore;
import { cn } from '@/lib/utils';

// @ts-ignore;
import { Sidebar } from '@/components/Sidebar';
// @ts-ignore;
import { MobileBottomNav } from '@/components/MobileBottomNav';
export default function EditPage(props) {
  const {
    $w
  } = props;
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    author: '',
    tags: '',
    image: ''
  });
  const [originalData, setOriginalData] = useState({
    title: '',
    content: '',
    author: '',
    tags: '',
    image: ''
  });
  const [imagePreview, setImagePreview] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [navigating, setNavigating] = useState(false);
  const [sidebarState, setSidebarState] = useState({
    isCollapsed: false,
    isDesktop: true
  });
  const fileInputRef = useRef(null);
  const {
    toast
  } = useToast();
  const navigateTo = $w.utils.navigateTo;
  const navigateBack = $w.utils.navigateBack;

  // 从URL参数获取故事ID
  const storyId = props.$w.page.dataset.params?.id;
  useEffect(() => {
    if (storyId) {
      loadStory();
    }
  }, [storyId]);
  const loadStory = async () => {
    try {
      setLoading(true);
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();
      const result = await db.collection('red_story').doc(storyId).get();
      if (result && result.data) {
        const story = result.data;
        const data = {
          title: story.title || '',
          content: story.content || '',
          author: story.author || '',
          tags: story.tags ? story.tags.join(', ') : '',
          image: story.image || ''
        };
        setFormData(data);
        setOriginalData(data);
        if (story.image) {
          setImagePreview(story.image);
        }
      } else {
        toast({
          title: '故事不存在',
          description: '无法找到要编辑的故事',
          variant: 'destructive'
        });
        handleNavigateBack();
      }
    } catch (error) {
      console.error('加载故事失败:', error);
      toast({
        title: '加载失败',
        description: '无法加载故事内容',
        variant: 'destructive'
      });
      handleNavigateBack();
    } finally {
      setLoading(false);
    }
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
  const handleImageUpload = e => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: '文件过大',
          description: '图片大小不能超过5MB',
          variant: 'destructive'
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result;
        setImagePreview(result);
        setFormData(prev => ({
          ...prev,
          image: result
        }));
      };
      reader.readAsDataURL(file);
    }
  };
  const removeImage = () => {
    setImagePreview('');
    setFormData(prev => ({
      ...prev,
      image: ''
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  const validateForm = () => {
    if (!formData.title.trim()) {
      toast({
        title: '请输入标题',
        description: '标题不能为空',
        variant: 'destructive'
      });
      return false;
    }
    if (!formData.content.trim()) {
      toast({
        title: '请输入内容',
        description: '内容不能为空',
        variant: 'destructive'
      });
      return false;
    }
    if (formData.content.length < 50) {
      toast({
        title: '内容过短',
        description: '内容至少需要50个字符',
        variant: 'destructive'
      });
      return false;
    }
    return true;
  };

  // 优化的导航函数
  const handleNavigate = async (pageId, params = {}) => {
    if (navigating) return; // 防止重复点击

    try {
      setNavigating(true);

      // 添加导航延迟以显示加载状态
      await new Promise(resolve => setTimeout(resolve, 100));
      navigateTo({
        pageId,
        params
      });
    } catch (error) {
      console.error('导航失败:', error);
      toast({
        title: '跳转失败',
        description: '页面跳转出现问题，请重试',
        variant: 'destructive'
      });
    } finally {
      setNavigating(false);
    }
  };

  // 优化的返回函数
  const handleNavigateBack = async () => {
    if (navigating) return;
    try {
      setNavigating(true);
      await new Promise(resolve => setTimeout(resolve, 100));
      navigateBack();
    } catch (error) {
      console.error('返回失败:', error);
      // 如果返回失败，尝试跳转到首页
      handleNavigate('index');
    } finally {
      setNavigating(false);
    }
  };

  // 检查是否有未保存的更改
  const hasUnsavedChanges = () => {
    return JSON.stringify(formData) !== JSON.stringify(originalData) || imagePreview !== originalData.image;
  };

  // 带确认的返回处理
  const handleBackWithConfirm = async () => {
    if (hasUnsavedChanges()) {
      const confirmed = window.confirm('您有未保存的更改，确定要离开吗？');
      if (!confirmed) return;
    }
    handleNavigateBack();
  };
  const saveAsDraft = async () => {
    if (!validateForm()) return;
    setIsSaving(true);
    try {
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();
      const storyData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        status: 'draft',
        updatedAt: new Date()
      };
      await db.collection('red_story').doc(storyId).update(storyData);

      // 更新原始数据
      setOriginalData({
        ...formData,
        image: imagePreview
      });
      toast({
        title: '草稿已保存',
        description: '您的修改已保存为草稿'
      });
    } catch (error) {
      console.error('保存草稿失败:', error);
      toast({
        title: '保存失败',
        description: '草稿保存失败，请重试',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };
  const publishStory = async () => {
    if (!validateForm()) return;
    setIsPublishing(true);
    try {
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();
      const storyData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        status: 'published',
        publishedAt: new Date(),
        updatedAt: new Date()
      };
      await db.collection('red_story').doc(storyId).update(storyData);
      toast({
        title: '发布成功',
        description: '故事已成功发布'
      });
      // 发布后跳转到详情页
      handleNavigate('detail', {
        id: storyId
      });
    } catch (error) {
      console.error('发布失败:', error);
      toast({
        title: '发布失败',
        description: '故事发布失败，请重试',
        variant: 'destructive'
      });
    } finally {
      setIsPublishing(false);
    }
  };
  const previewStory = () => {
    if (!validateForm()) return;
    // 创建临时预览数据
    const previewData = {
      ...formData,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      createdAt: new Date(),
      updatedAt: new Date(),
      views: 0,
      _id: 'preview'
    };
    // 存储预览数据到 sessionStorage
    sessionStorage.setItem('previewStory', JSON.stringify(previewData));
    // 跳转到预览页面
    handleNavigate('detail', {
      id: 'preview'
    });
  };

  // 计算主内容区域的边距
  const getMainMargin = () => {
    if (!sidebarState.isDesktop) return 'ml-0';
    return sidebarState.isCollapsed ? 'md:ml-16' : 'md:ml-64';
  };
  if (loading) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <Sidebar currentPage="admin" navigateTo={navigateTo} onStateChange={setSidebarState} />
        <main className={cn("transition-all duration-300 ease-in-out", getMainMargin())}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="animate-pulse">
              <div className="h-8 bg-slate-700 rounded w-1/3 mb-4"></div>
              <div className="h-64 bg-slate-700 rounded mb-6"></div>
              <div className="space-y-3">
                <div className="h-4 bg-slate-700 rounded"></div>
                <div className="h-4 bg-slate-700 rounded w-5/6"></div>
                <div className="h-4 bg-slate-700 rounded w-4/6"></div>
              </div>
            </div>
          </div>
        </main>
      </div>;
  }
  return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <Sidebar currentPage="admin" navigateTo={navigateTo} onStateChange={setSidebarState} />

      {/* 主内容区域 - 响应式边距 */}
      <main className={cn("transition-all duration-300 ease-in-out", getMainMargin())}>
        {/* 页面头部 */}
        <header className="bg-slate-800/90 backdrop-blur-sm border-b border-slate-700">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button onClick={handleBackWithConfirm} disabled={navigating || isSaving || isPublishing} variant="ghost" size="sm" className="text-slate-300 hover:text-white">
                  {navigating ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowLeft className="w-4 h-4 mr-2" />}
                  返回
                </Button>
                <h1 className="text-2xl font-bold text-white flex items-center">
                  <Edit3 className="w-6 h-6 mr-2 text-orange-500" />
                  编辑故事
                </h1>
              </div>
              <div className="flex items-center space-x-2">
                <Button onClick={previewStory} disabled={isSaving || isPublishing} variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                  <Eye className="w-4 h-4 mr-2" />
                  预览
                </Button>
                <Button onClick={saveAsDraft} disabled={isSaving || isPublishing} variant="outline" size="sm" className="border-blue-600 text-blue-400 hover:bg-blue-600/10">
                  {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  {isSaving ? '保存中...' : '保存草稿'}
                </Button>
                <Button onClick={publishStory} disabled={isSaving || isPublishing} className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600">
                  {isPublishing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                  {isPublishing ? '发布中...' : '发布'}
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* 表单内容 */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <FileText className="w-5 h-5 mr-2 text-red-500" />
                编辑故事信息
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 标题输入 */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  标题 <span className="text-red-500">*</span>
                </label>
                <input type="text" name="title" value={formData.title} onChange={handleInputChange} placeholder="请输入故事标题" className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all" />
              </div>

              {/* 作者输入 */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  作者
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input type="text" name="author" value={formData.author} onChange={handleInputChange} placeholder="请输入作者名称" className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all" />
                </div>
              </div>

              {/* 标签输入 */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  标签
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input type="text" name="tags" value={formData.tags} onChange={handleInputChange} placeholder="请输入标签，多个标签用逗号分隔" className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all" />
                </div>
                <p className="mt-1 text-xs text-slate-500">例如：革命历史,英雄事迹,红色教育</p>
              </div>

              {/* 图片上传 */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  封面图片
                </label>
                {imagePreview ? <div className="relative">
                    <img src={imagePreview} alt="预览" className="w-full h-48 object-cover rounded-xl" />
                    <Button onClick={removeImage} variant="destructive" size="icon" className="absolute top-2 right-2">
                      <X className="w-4 h-4" />
                    </Button>
                  </div> : <div className="border-2 border-dashed border-slate-600 rounded-xl p-8 text-center hover:border-red-500/50 transition-colors">
                    <ImageIcon className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                    <p className="text-slate-400 mb-4">点击上传封面图片</p>
                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                    <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                      <Upload className="w-4 h-4 mr-2" />
                      选择图片
                    </Button>
                    <p className="mt-2 text-xs text-slate-500">支持 JPG、PNG 格式，大小不超过 5MB</p>
                  </div>}
              </div>

              {/* 内容输入 */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  故事内容 <span className="text-red-500">*</span>
                </label>
                <textarea name="content" value={formData.content} onChange={handleInputChange} placeholder="请输入故事内容，不少于50个字符" rows={12} className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all resize-none" />
                <div className="mt-2 flex justify-between">
                  <p className="text-xs text-slate-500">
                    {formData.content.length} 个字符
                  </p>
                  {formData.content.length > 0 && formData.content.length < 50 && <p className="text-xs text-red-400">
                      内容至少需要50个字符
                    </p>}
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-700">
                <Button onClick={saveAsDraft} disabled={isSaving || isPublishing} className="border-blue-600 text-blue-400 hover:bg-blue-600/10 flex-1">
                  {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  {isSaving ? '保存中...' : '保存草稿'}
                </Button>
                <Button onClick={previewStory} disabled={isSaving || isPublishing} className="border-slate-600 text-slate-300 hover:bg-slate-700 flex-1">
                  <Eye className="w-4 h-4 mr-2" />
                  预览
                </Button>
                <Button onClick={publishStory} disabled={isSaving || isPublishing} className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 flex-1">
                  {isPublishing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                  {isPublishing ? '发布中...' : '发布故事'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 操作说明 */}
          <Card className="mt-6 bg-slate-800/30 backdrop-blur-sm border-slate-700/30">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-orange-500" />
                操作说明
              </h3>
              <div className="space-y-2 text-sm text-slate-400">
                <p>• <span className="text-blue-400">保存草稿</span>：将修改保存为草稿状态，故事不会出现在首页</p>
                <p>• <span className="text-green-400">预览</span>：查看修改后的显示效果，不会保存更改</p>
                <p>• <span className="text-red-400">发布</span>：将故事发布到首页，所有用户可见</p>
                <p>• 发布后的故事会记录发布时间，并按发布时间排序</p>
              </div>
            </CardContent>
          </Card>

          {/* 快速导航 */}
          <div className="mt-6 flex justify-center space-x-4">
            <Button onClick={() => handleNavigate('index')} disabled={navigating} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
              {navigating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Home className="w-4 h-4 mr-2" />}
              返回首页
            </Button>
            <Button onClick={() => handleNavigate('detail', {
            id: storyId
          })} disabled={navigating} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
              查看详情
            </Button>
          </div>
        </div>
      </main>

      <MobileBottomNav currentPage="admin" navigateTo={navigateTo} />
    </div>;
}