// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button, Card, CardContent, CardHeader, CardTitle, useToast } from '@/components/ui';
// @ts-ignore;
import { ArrowLeft, Save, Eye, FileText, Image as ImageIcon, Tag, User, Calendar, Clock, Send, BookOpen, AlertCircle } from 'lucide-react';
// @ts-ignore;
import { cn } from '@/lib/utils';

// @ts-ignore;
import { Sidebar } from '@/components/Sidebar';
// @ts-ignore;
import { MobileBottomNav } from '@/components/MobileBottomNav';

// 图片组件
const StoryImage = ({
  src,
  alt,
  className,
  onRemove
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  if (imageError || !src) {
    return <div className={cn("flex items-center justify-center bg-slate-700/50 rounded-lg border-2 border-dashed border-slate-600", className)}>
        <ImageIcon className="w-8 h-8 text-slate-500" />
      </div>;
  }
  return <div className={cn("relative overflow-hidden rounded-lg", className)}>
      {!imageLoaded && <div className="absolute inset-0 bg-slate-700/50 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-slate-500 border-t-transparent rounded-full animate-spin"></div>
        </div>}
      <img src={src} alt={alt || '故事图片'} className={cn("w-full h-full object-cover transition-opacity duration-300", imageLoaded ? "opacity-100" : "opacity-0")} onLoad={() => setImageLoaded(true)} onError={() => setImageError(true)} />
      {onRemove && <button onClick={onRemove} className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-600 text-white p-1.5 rounded-full transition-colors duration-200 button-press">
          <AlertCircle className="w-4 h-4" />
        </button>}
    </div>;
};
export default function EditPage(props) {
  const {
    $w
  } = props;
  const [storyData, setStoryData] = useState({
    title: '',
    content: '',
    author: '',
    image: '',
    tags: [],
    read_time: '5分钟阅读'
  });
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [isDraft, setIsDraft] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const {
    toast
  } = useToast();
  const navigateTo = $w.utils.navigateTo;
  const navigateBack = $w.utils.navigateBack;

  // 从URL参数获取编辑模式和草稿ID
  const urlParams = new URLSearchParams(window.location.search);
  const editMode = urlParams.get('edit') === 'true';
  const draftId = urlParams.get('draftId');
  const storyId = urlParams.get('storyId');
  useEffect(() => {
    // 如果是编辑模式，加载数据
    if (editMode && (draftId || storyId)) {
      loadStoryData();
    }
  }, [editMode, draftId, storyId]);
  const loadStoryData = async () => {
    try {
      setLoading(true);
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();
      let result;
      if (draftId) {
        // 加载草稿数据
        result = await db.collection('red_story_draft').doc(draftId).get();
        setIsDraft(true);
      } else if (storyId) {
        // 加载已发布故事数据
        result = await db.collection('red_story').doc(storyId).get();
        setIsDraft(false);
      }
      if (result && result.data) {
        const data = result.data;
        setStoryData({
          title: data.title || '',
          content: data.content || '',
          author: data.author || data.draftOwner || '',
          image: data.image || '',
          tags: data.tags || [],
          read_time: data.read_time || '5分钟阅读'
        });
        if (data.image) {
          setImagePreview(data.image);
        }
      }
    } catch (error) {
      console.error('加载数据失败:', error);
      toast({
        title: '加载失败',
        description: '无法加载故事数据，请重试',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  const handleInputChange = (field, value) => {
    setStoryData(prev => ({
      ...prev,
      [field]: value
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
      reader.onload = event => {
        const imageUrl = event.target.result;
        setImagePreview(imageUrl);
        setStoryData(prev => ({
          ...prev,
          image: imageUrl
        }));
      };
      reader.readAsDataURL(file);
    }
  };
  const removeImage = () => {
    setImagePreview('');
    setStoryData(prev => ({
      ...prev,
      image: ''
    }));
  };
  const handleAddTag = e => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!storyData.tags.includes(tagInput.trim())) {
        setStoryData(prev => ({
          ...prev,
          tags: [...prev.tags, tagInput.trim()]
        }));
      }
      setTagInput('');
    }
  };
  const removeTag = tagToRemove => {
    setStoryData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };
  const validateStoryData = () => {
    if (!storyData.title.trim()) {
      toast({
        title: '标题不能为空',
        description: '请输入故事标题',
        variant: 'destructive'
      });
      return false;
    }
    if (!storyData.content.trim()) {
      toast({
        title: '内容不能为空',
        description: '请输入故事内容',
        variant: 'destructive'
      });
      return false;
    }
    if (!storyData.author.trim()) {
      toast({
        title: '作者不能为空',
        description: '请输入作者名称',
        variant: 'destructive'
      });
      return false;
    }
    return true;
  };
  const calculateReadTime = content => {
    if (!content) return '5分钟阅读';
    const chineseChars = (content.match(/[\u4e00-\u9fa5]/g) || []).length;
    const englishWords = (content.match(/[a-zA-Z]+/g) || []).length;
    const readTime = Math.max(1, Math.ceil(chineseChars / 500 + englishWords / 200));
    return `${readTime}分钟阅读`;
  };
  const saveAsDraft = async () => {
    if (!validateStoryData()) return;
    try {
      setSaving(true);
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();
      const now = new Date();
      const draftData = {
        ...storyData,
        read_time: calculateReadTime(storyData.content),
        lastSavedAt: now,
        createdAt: isDraft && draftId ? storyData.createdAt : now,
        status: 'draft'
      };
      let result;
      if (isDraft && draftId) {
        // 更新现有草稿
        result = await db.collection('red_story_draft').doc(draftId).update(draftData);
      } else {
        // 创建新草稿
        result = await db.collection('red_story_draft').add(draftData);
      }
      setLastSaved(now);
      toast({
        title: '保存成功',
        description: '故事已保存为草稿'
      });
      // 更新URL参数，表示现在是草稿编辑模式
      if (!isDraft && result.id) {
        const newUrl = `${window.location.pathname}?edit=true&draftId=${result.id}`;
        window.history.replaceState({}, '', newUrl);
        setIsDraft(true);
      }
    } catch (error) {
      console.error('保存草稿失败:', error);
      toast({
        title: '保存失败',
        description: '无法保存草稿，请重试',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };
  const publishStory = async () => {
    if (!validateStoryData()) return;

    // 确认发布
    const confirmPublish = window.confirm('确定要发布这个故事吗？发布后将对所有用户可见。');
    if (!confirmPublish) return;
    try {
      setPublishing(true);
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();
      const now = new Date();
      const publishedData = {
        ...storyData,
        read_time: calculateReadTime(storyData.content),
        createdAt: now,
        updatedAt: now,
        status: 'published',
        views: 0
      };
      let result;
      if (isDraft && draftId) {
        // 从草稿发布：先添加到正式表，然后删除草稿
        result = await db.collection('red_story').add(publishedData);
        if (result.id) {
          // 删除原草稿
          await db.collection('red_story_draft').doc(draftId).remove();
        }
      } else if (storyId) {
        // 更新已发布的故事
        result = await db.collection('red_story').doc(storyId).update(publishedData);
        result.id = storyId;
      } else {
        // 直接发布新故事
        result = await db.collection('red_story').add(publishedData);
      }
      toast({
        title: '发布成功',
        description: '故事已成功发布'
      });

      // 发布成功后跳转到故事详情页
      if (result.id) {
        navigateTo({
          pageId: 'detail',
          params: {
            id: result.id
          }
        });
      }
    } catch (error) {
      console.error('发布失败:', error);
      toast({
        title: '发布失败',
        description: '无法发布故事，请重试',
        variant: 'destructive'
      });
    } finally {
      setPublishing(false);
    }
  };
  const previewStory = () => {
    if (!validateStoryData()) return;
    // 创建临时预览数据
    const previewData = {
      ...storyData,
      read_time: calculateReadTime(storyData.content),
      createdAt: new Date(),
      views: 0,
      _id: 'preview'
    };
    // 存储预览数据到 sessionStorage
    sessionStorage.setItem('storyPreview', JSON.stringify(previewData));
    // 打开新窗口预览
    const previewUrl = `${window.location.origin}/detail?id=preview`;
    window.open(previewUrl, '_blank');
  };
  const goBack = () => {
    if (storyData.title || storyData.content) {
      const confirmLeave = window.confirm('您有未保存的更改，确定要离开吗？');
      if (!confirmLeave) return;
    }
    navigateBack();
  };
  if (loading) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <Sidebar currentPage="upload" navigateTo={navigateTo} />
        <main className="content-transition sidebar-transition md:ml-16 lg:ml-64">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-slate-700 rounded w-1/3"></div>
              <div className="h-64 bg-slate-700 rounded"></div>
              <div className="space-y-2">
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
      <Sidebar currentPage="upload" navigateTo={navigateTo} />

      <main className="content-transition sidebar-transition md:ml-16 lg:ml-64 animate-fade-in">
        {/* 页面头部 */}
        <header className="bg-slate-800/90 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-40">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button onClick={goBack} variant="ghost" size="sm" className="text-slate-300 hover:text-white button-press">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  返回
                </Button>
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-5 h-5 text-red-500" />
                  <h1 className="text-xl font-semibold text-white">
                    {editMode ? isDraft ? '编辑草稿' : '编辑故事' : '创建新故事'}
                  </h1>
                </div>
                {isDraft && <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                    草稿模式
                  </span>}
              </div>
              <div className="flex items-center space-x-2">
                {lastSaved && <span className="text-xs text-slate-400">
                    最后保存: {lastSaved.toLocaleTimeString()}
                  </span>}
                <Button onClick={previewStory} variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-700 button-press">
                  <Eye className="w-4 h-4 mr-2" />
                  预览
                </Button>
                <Button onClick={saveAsDraft} variant="outline" size="sm" disabled={saving} className="border-blue-600 text-blue-400 hover:bg-blue-600/10 button-press">
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? '保存中...' : '保存草稿'}
                </Button>
                <Button onClick={publishStory} disabled={publishing} className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 shadow-lg hover:shadow-red-500/25 transition-all duration-300 transform hover:scale-105 button-press">
                  <Send className="w-4 h-4 mr-2" />
                  {publishing ? '发布中...' : '发布'}
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* 编辑表单 */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            {/* 基本信息 */}
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 hover-lift">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-red-500" />
                  基本信息
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    故事标题 <span className="text-red-500">*</span>
                  </label>
                  <input type="text" value={storyData.title} onChange={e => handleInputChange('title', e.target.value)} placeholder="请输入故事标题" className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-300" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    作者 <span className="text-red-500">*</span>
                  </label>
                  <input type="text" value={storyData.author} onChange={e => handleInputChange('author', e.target.value)} placeholder="请输入作者名称" className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-300" />
                </div>
              </CardContent>
            </Card>

            {/* 故事内容 */}
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 hover-lift">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-red-500" />
                  故事内容 <span className="text-red-500">*</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <textarea value={storyData.content} onChange={e => handleInputChange('content', e.target.value)} placeholder="请输入故事内容，支持换行..." rows={12} className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-300 resize-none font-serif leading-relaxed" />
                <div className="mt-2 text-xs text-slate-400">
                  字数: {storyData.content.length} | 预计阅读时间: {calculateReadTime(storyData.content)}
                </div>
              </CardContent>
            </Card>

            {/* 封面图片 */}
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 hover-lift">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <ImageIcon className="w-5 h-5 mr-2 text-red-500" />
                  封面图片
                </CardTitle>
              </CardHeader>
              <CardContent>
                {imagePreview ? <div className="space-y-4">
                    <StoryImage src={imagePreview} alt="封面预览" className="w-full h-64" onRemove={removeImage} />
                    <div className="flex items-center justify-center">
                      <label className="cursor-pointer">
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                        <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700 button-press">
                          <ImageIcon className="w-4 h-4 mr-2" />
                          更换图片
                        </Button>
                      </label>
                    </div>
                  </div> : <div className="border-2 border-dashed border-slate-600 rounded-xl p-8 text-center hover:border-red-500/50 transition-colors duration-300">
                    <ImageIcon className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                    <p className="text-slate-400 mb-4">点击或拖拽上传封面图片</p>
                    <label className="cursor-pointer">
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                      <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700 button-press">
                        <ImageIcon className="w-4 h-4 mr-2" />
                        选择图片
                      </Button>
                    </label>
                    <p className="text-xs text-slate-500 mt-2">支持 JPG、PNG 格式，大小不超过 5MB</p>
                  </div>}
              </CardContent>
            </Card>

            {/* 标签 */}
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50 hover-lift">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Tag className="w-5 h-5 mr-2 text-red-500" />
                  标签
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {storyData.tags.map((tag, index) => <span key={index} className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm flex items-center gap-1">
                        {tag}
                        <button onClick={() => removeTag(tag)} className="hover:text-red-300 transition-colors">
                          ×
                        </button>
                      </span>)}
                  </div>
                  <input type="text" value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyPress={handleAddTag} placeholder="输入标签后按回车添加" className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-300" />
                </div>
              </CardContent>
            </Card>

            {/* 操作按钮 */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <Button onClick={saveAsDraft} variant="outline" disabled={saving} className="border-blue-600 text-blue-400 hover:bg-blue-600/10 button-press">
                <Save className="w-4 h-4 mr-2" />
                {saving ? '保存中...' : '保存草稿'}
              </Button>
              <Button onClick={publishStory} disabled={publishing} className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 shadow-lg hover:shadow-red-500/25 transition-all duration-300 transform hover:scale-105 button-press">
                <Send className="w-4 h-4 mr-2" />
                {publishing ? '发布中...' : '发布故事'}
              </Button>
            </div>
          </div>
        </div>
      </main>

      <MobileBottomNav currentPage="upload" navigateTo={navigateTo} />
    </div>;
}