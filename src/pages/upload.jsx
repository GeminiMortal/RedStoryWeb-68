// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button, Card, CardContent, CardHeader, CardTitle, Badge, useToast } from '@/components/ui';
// @ts-ignore;
import { Upload, Image as ImageIcon, Tag, X, Save, Eye } from 'lucide-react';
// @ts-ignore;
import { cn } from '@/lib/utils';

// @ts-ignore;
import { Sidebar } from '@/components/Sidebar';
// @ts-ignore;
import { MobileBottomNav } from '@/components/MobileBottomNav';
// @ts-ignore;
import { useSidebar } from '@/components/SidebarStore';
// @ts-ignore;
import { FadeIn } from '@/components/AnimationProvider';
export default function UploadPage(props) {
  const {
    $w
  } = props || {};
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    author: '',
    tags: [],
    image: '',
    status: 'draft'
  });
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState({});
  const {
    toast
  } = useToast();
  const {
    isOpen
  } = useSidebar() || {};
  const navigateTo = $w?.utils?.navigateTo || (() => {});

  // 安全获取用户信息
  const currentUser = $w?.auth?.currentUser || {};
  const userName = currentUser?.name || currentUser?.nickName || '匿名用户';

  // 设置默认作者
  useEffect(() => {
    if (currentUser?.name || currentUser?.nickName) {
      setFormData(prev => ({
        ...prev,
        author: userName
      }));
    }
  }, [userName]);
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // 清除对应字段的错误
    setErrors(prev => ({
      ...prev,
      [field]: ''
    }));
  };
  const handleImageUpload = async e => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      toast({
        title: '错误',
        description: '请选择图片文件',
        variant: 'destructive'
      });
      return;
    }

    // 验证文件大小 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: '错误',
        description: '图片大小不能超过5MB',
        variant: 'destructive'
      });
      return;
    }
    try {
      setLoading(true);
      const tcb = await $w?.cloud?.getCloudInstance?.();
      if (!tcb) {
        toast({
          title: '错误',
          description: '云开发服务不可用',
          variant: 'destructive'
        });
        return;
      }

      // 上传到云存储
      const fileName = `story_${Date.now()}_${file.name}`;
      const result = await tcb.uploadFile({
        cloudPath: `images/${fileName}`,
        filePath: file
      });
      if (result?.fileID) {
        // 获取临时URL
        const tempUrl = await tcb.getTempFileURL({
          fileList: [result.fileID]
        });
        const imageUrl = tempUrl?.fileList?.[0]?.tempFileURL || '';
        setImagePreview(imageUrl);
        setFormData(prev => ({
          ...prev,
          image: imageUrl
        }));
      }
    } catch (error) {
      console.error('图片上传失败:', error);
      toast({
        title: '上传失败',
        description: error.message || '图片上传失败，请重试',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (!trimmedTag) return;
    if (formData.tags.includes(trimmedTag)) {
      toast({
        title: '提示',
        description: '标签已存在',
        variant: 'default'
      });
      return;
    }
    if (formData.tags.length >= 5) {
      toast({
        title: '提示',
        description: '最多添加5个标签',
        variant: 'default'
      });
      return;
    }
    setFormData(prev => ({
      ...prev,
      tags: [...prev.tags, trimmedTag]
    }));
    setTagInput('');
  };
  const handleRemoveTag = tagToRemove => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };
  const validateForm = () => {
    const newErrors = {};
    if (!formData.title?.trim()) {
      newErrors.title = '标题不能为空';
    } else if (formData.title.length > 100) {
      newErrors.title = '标题不能超过100个字符';
    }
    if (!formData.content?.trim()) {
      newErrors.content = '内容不能为空';
    } else if (formData.content.length < 10) {
      newErrors.content = '内容不能少于10个字符';
    } else if (formData.content.length > 10000) {
      newErrors.content = '内容不能超过10000个字符';
    }
    if (formData.author?.length > 50) {
      newErrors.author = '作者名不能超过50个字符';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (status = 'draft') => {
    if (!validateForm()) {
      toast({
        title: '表单验证失败',
        description: '请检查表单内容',
        variant: 'destructive'
      });
      return;
    }
    try {
      setLoading(true);
      const tcb = await $w?.cloud?.getCloudInstance?.();
      if (!tcb) {
        toast({
          title: '错误',
          description: '云开发服务不可用',
          variant: 'destructive'
        });
        return;
      }
      const db = tcb.database();
      const storyData = {
        ...formData,
        status,
        author: formData.author || userName,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        views: 0,
        likes: 0,
        shares: 0
      };
      const result = await db.collection('red_story').add(storyData);
      if (result?._id) {
        toast({
          title: status === 'published' ? '发布成功' : '保存成功',
          description: `故事已${status === 'published' ? '发布' : '保存为草稿'}`,
          variant: 'default'
        });
        navigateTo?.({
          pageId: 'detail',
          params: {
            id: result._id
          }
        });
      }
    } catch (error) {
      console.error('保存失败:', error);
      toast({
        title: '保存失败',
        description: error.message || '请重试',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  const handleSaveDraft = () => {
    handleSubmit('draft');
  };
  const handlePublish = () => {
    handleSubmit('published');
  };
  return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <Sidebar currentPage="upload" navigateTo={navigateTo} />

      <main className={cn("transition-all duration-300 ease-in-out", isOpen ? "lg:ml-64" : "lg:ml-0")}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <FadeIn>
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-white">创建新故事</CardTitle>
                <p className="text-slate-400 mt-2">分享您的红色故事，传承革命精神</p>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* 标题 */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    故事标题 *
                  </label>
                  <input type="text" value={formData.title} onChange={e => handleInputChange('title', e.target.value)} placeholder="请输入故事标题" maxLength={100} className={cn("w-full px-3 py-2 bg-slate-700/50 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20", errors.title ? "border-red-500" : "border-slate-600")} />
                  {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title}</p>}
                  <p className="text-slate-400 text-xs mt-1">{formData.title.length}/100</p>
                </div>

                {/* 作者 */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    作者
                  </label>
                  <input type="text" value={formData.author} onChange={e => handleInputChange('author', e.target.value)} placeholder="请输入作者名" maxLength={50} className={cn("w-full px-3 py-2 bg-slate-700/50 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20", errors.author ? "border-red-500" : "border-slate-600")} />
                  {errors.author && <p className="text-red-400 text-sm mt-1">{errors.author}</p>}
                  <p className="text-slate-400 text-xs mt-1">{formData.author.length}/50</p>
                </div>

                {/* 内容 */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    故事内容 *
                  </label>
                  <textarea value={formData.content} onChange={e => handleInputChange('content', e.target.value)} placeholder="请输入故事内容，支持Markdown格式" rows={10} maxLength={10000} className={cn("w-full px-3 py-2 bg-slate-700/50 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 resize-none", errors.content ? "border-red-500" : "border-slate-600")} />
                  {errors.content && <p className="text-red-400 text-sm mt-1">{errors.content}</p>}
                  <p className="text-slate-400 text-xs mt-1">{formData.content.length}/10000</p>
                </div>

                {/* 图片上传 */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    故事图片
                  </label>
                  <div className="flex items-center space-x-4">
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="image-upload" />
                    <label htmlFor="image-upload" className="flex items-center px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white cursor-pointer hover:bg-slate-700 transition-colors">
                      <ImageIcon className="w-4 h-4 mr-2" />
                      选择图片
                    </label>
                    {imagePreview && <div className="relative">
                        <img src={imagePreview} alt="预览" className="w-20 h-20 object-cover rounded-lg" />
                        <button onClick={() => {
                      setImagePreview('');
                      setFormData(prev => ({
                        ...prev,
                        image: ''
                      }));
                    }} className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600">
                          <X className="w-3 h-3" />
                        </button>
                      </div>}
                  </div>
                  <p className="text-slate-400 text-xs mt-1">支持 JPG、PNG、GIF，最大 5MB</p>
                </div>

                {/* 标签 */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    标签
                  </label>
                  <div className="flex items-center space-x-2 mb-2">
                    <input type="text" value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyPress={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }} placeholder="输入标签后按回车" maxLength={20} className="flex-1 px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20" />
                    <Button type="button" onClick={handleAddTag} variant="outline" className="border-red-500/50 text-red-400 hover:bg-red-500/10">
                      <Tag className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map(tag => <Badge key={tag} variant="secondary" className="bg-slate-700 text-white">
                        {tag}
                        <button onClick={() => handleRemoveTag(tag)} className="ml-2 text-slate-300 hover:text-white">
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>)}
                  </div>
                  <p className="text-slate-400 text-xs mt-1">{formData.tags.length}/5 个标签</p>
                </div>

                {/* 操作按钮 */}
                <div className="flex space-x-4">
                  <Button onClick={handleSaveDraft} disabled={loading} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                    <Save className="w-4 h-4 mr-2" />
                    保存草稿
                  </Button>
                  <Button onClick={handlePublish} disabled={loading} className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600">
                    <Eye className="w-4 h-4 mr-2" />
                    发布故事
                  </Button>
                </div>
              </CardContent>
            </Card>
          </FadeIn>
        </div>
      </main>

      <MobileBottomNav currentPage="upload" navigateTo={navigateTo} />
    </div>;
}