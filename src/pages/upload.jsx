// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Textarea, Badge, useToast } from '@/components/ui';
// @ts-ignore;
import { ArrowLeft, Tag, Save, Send, CheckCircle } from 'lucide-react';
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
  } = props;
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const [tags, setTags] = useState([]);
  const [image, setImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const {
    isCollapsed,
    isDesktop
  } = useSidebar();
  const navigateTo = $w.utils.navigateTo;
  const navigateBack = $w.utils.navigateBack;
  const {
    toast
  } = useToast();

  // 添加标签
  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };
  const removeTag = tagToRemove => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  const handleKeyPress = e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };
  const handleSubmit = async (publishImmediately = false) => {
    if (!title.trim() || !content.trim()) {
      toast({
        title: '表单不完整',
        description: '请填写标题和内容',
        variant: 'destructive'
      });
      return;
    }
    try {
      setLoading(true);
      setIsPublishing(publishImmediately);
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();
      const storyData = {
        title: title.trim(),
        content: content.trim(),
        author: author.trim() || '佚名',
        tags: tags,
        image: image.trim(),
        status: publishImmediately ? 'published' : 'draft',
        views: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const result = await db.collection('red_story').add(storyData);
      if (result && result._id) {
        toast({
          title: publishImmediately ? '发布成功' : '保存成功',
          description: publishImmediately ? '故事已成功发布' : '故事已保存为草稿',
          duration: 3000
        });
        // 跳转到详情页或列表页
        if (publishImmediately) {
          navigateTo({
            pageId: 'detail',
            params: {
              id: result._id
            }
          });
        } else {
          navigateTo({
            pageId: 'index',
            params: {}
          });
        }
      }
    } catch (error) {
      console.error('创建故事失败:', error);
      toast({
        title: '操作失败',
        description: '请稍后重试',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
      setIsPublishing(false);
    }
  };
  return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <Sidebar currentPage="upload" navigateTo={navigateTo} />

      {/* 主内容区域 - 根据侧边栏状态动态调整 */}
      <main className={cn("transition-all duration-300 ease-in-out", isDesktop ? isCollapsed ? "md:ml-16" : "md:ml-64" : "ml-0")}>
        {/* 移动端返回按钮 */}
        <div className="md:hidden sticky top-0 bg-slate-800/90 backdrop-blur-sm border-b border-slate-700 px-4 py-3 flex items-center justify-between z-40">
          <Button onClick={navigateBack} variant="ghost" size="sm" className="text-slate-300 hover:text-white">
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回
          </Button>
          <div className="text-sm font-medium text-slate-300">创建故事</div>
        </div>

        {/* 页面头部 */}
        <header className="hidden md:block bg-slate-800/90 backdrop-blur-sm border-b border-slate-700">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                创建红色故事
              </h1>
              <Button onClick={navigateBack} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回列表
              </Button>
            </div>
          </div>
        </header>

        {/* 创建表单 */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <FadeIn delay={200}>
            <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white">故事信息</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={e => e.preventDefault()} className="space-y-6">
                  {/* 标题 */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">标题 *</label>
                    <Input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="请输入故事标题" className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-red-500 focus:ring-red-500/20" required />
                  </div>

                  {/* 作者 */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">作者</label>
                    <Input type="text" value={author} onChange={e => setAuthor(e.target.value)} placeholder="请输入作者姓名" className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-red-500 focus:ring-red-500/20" />
                  </div>

                  {/* 图片链接 */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">图片链接</label>
                    <Input type="url" value={image} onChange={e => setImage(e.target.value)} placeholder="请输入图片URL" className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-red-500 focus:ring-red-500/20" />
                  </div>

                  {/* 标签 */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">标签</label>
                    <div className="flex items-center space-x-2 mb-2">
                      <Input type="text" value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyPress={handleKeyPress} placeholder="输入标签后按回车" className="flex-1 bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-red-500 focus:ring-red-500/20" />
                      <Button type="button" onClick={addTag} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                        <Tag className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag, index) => <Badge key={index} variant="outline" className="border-red-500/30 text-red-400 bg-red-500/10">
                          {tag}
                          <button type="button" onClick={() => removeTag(tag)} className="ml-1 text-red-400 hover:text-red-300">
                            ×
                          </button>
                        </Badge>)}
                    </div>
                  </div>

                  {/* 内容 */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">内容 *</label>
                    <Textarea value={content} onChange={e => setContent(e.target.value)} placeholder="请输入故事内容..." rows={10} className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-red-500 focus:ring-red-500/20 resize-none" required />
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex items-center space-x-4 pt-4">
                    <Button type="button" onClick={() => handleSubmit(true)} disabled={loading} className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600">
                      {loading && isPublishing ? <div className="flex items-center">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          发布中...
                        </div> : <><CheckCircle className="w-4 h-4 mr-2" />立即发布</>}
                    </Button>
                    <Button type="button" onClick={() => handleSubmit(false)} disabled={loading} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                      {loading && !isPublishing ? <div className="flex items-center">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          保存中...
                        </div> : <><Save className="w-4 h-4 mr-2" />保存草稿</>}
                    </Button>
                    <Button type="button" onClick={navigateBack} variant="ghost" className="text-slate-400 hover:text-white">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      取消
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </FadeIn>
        </div>
      </main>

      <MobileBottomNav currentPage="upload" navigateTo={navigateTo} />
    </div>;
}