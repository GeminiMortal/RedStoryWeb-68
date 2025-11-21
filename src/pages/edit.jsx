// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Textarea, Badge } from '@/components/ui';
// @ts-ignore;
import { ArrowLeft, Edit, Tag, Save, Send, Trash2 } from 'lucide-react';
// @ts-ignore;
import { cn } from '@/lib/utils';

// @ts-ignore;
import { Sidebar } from '@/components/Sidebar';
// @ts-ignore;
import { MobileBottomNav } from '@/components/MobileBottomNav';
// @ts-ignore;
import { useSidebar } from '@/components/SidebarStore';
export default function EditPage(props) {
  const {
    $w
  } = props;
  const [story, setStory] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const [tags, setTags] = useState([]);
  const [image, setImage] = useState('');
  const [status, setStatus] = useState('draft');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const {
    isCollapsed,
    isDesktop
  } = useSidebar();
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
        const storyData = result.data;
        setStory(storyData);
        setTitle(storyData.title || '');
        setContent(storyData.content || '');
        setAuthor(storyData.author || '');
        setTags(storyData.tags || []);
        setImage(storyData.image || '');
        setStatus(storyData.status || 'draft');
      } else {
        alert('故事不存在！');
        navigateBack();
      }
    } catch (error) {
      console.error('加载故事失败:', error);
      alert('加载失败，请稍后重试！');
    } finally {
      setLoading(false);
    }
  };
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
  const handleSubmit = async e => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert('请填写标题和内容！');
      return;
    }
    try {
      setSaving(true);
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();
      const updateData = {
        title: title.trim(),
        content: content.trim(),
        author: author.trim() || '佚名',
        tags: tags,
        image: image.trim(),
        status: status,
        updatedAt: new Date().toISOString()
      };
      await db.collection('red_story').doc(storyId).update(updateData);
      alert('故事更新成功！');
      navigateTo({
        pageId: 'detail',
        params: {
          id: storyId
        }
      });
    } catch (error) {
      console.error('更新故事失败:', error);
      alert('更新失败，请稍后重试！');
    } finally {
      setSaving(false);
    }
  };
  const handleDelete = async () => {
    if (window.confirm('确定要删除这个故事吗？此操作不可恢复！')) {
      try {
        const tcb = await $w.cloud.getCloudInstance();
        const db = tcb.database();
        await db.collection('red_story').doc(storyId).remove();
        alert('故事删除成功！');
        navigateTo({
          pageId: 'index',
          params: {}
        });
      } catch (error) {
        console.error('删除故事失败:', error);
        alert('删除失败，请稍后重试！');
      }
    }
  };
  if (loading) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <Sidebar currentPage="index" navigateTo={navigateTo} />
        <main className={cn("transition-all duration-300 ease-in-out", isDesktop ? isCollapsed ? "md:ml-16" : "md:ml-64" : "ml-0")}>
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
      <Sidebar currentPage="index" navigateTo={navigateTo} />

      {/* 主内容区域 - 根���侧边栏状态动态调整 */}
      <main className={cn("transition-all duration-300 ease-in-out", isDesktop ? isCollapsed ? "md:ml-16" : "md:ml-64" : "ml-0")}>
        {/* 移动端返回按钮 */}
        <div className="md:hidden sticky top-0 bg-slate-800/90 backdrop-blur-sm border-b border-slate-700 px-4 py-3 flex items-center justify-between z-40">
          <Button onClick={navigateBack} variant="ghost" size="sm" className="text-slate-300 hover:text-white">
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回
          </Button>
          <div className="text-sm font-medium text-slate-300">编辑故事</div>
        </div>

        {/* 页面头部 */}
        <header className="hidden md:block bg-slate-800/90 backdrop-blur-sm border-b border-slate-700">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                编辑故事
              </h1>
              <div className="flex items-center space-x-4">
                <Button onClick={handleDelete} variant="outline" className="border-red-500 text-red-400 hover:bg-red-500/10">
                  <Trash2 className="w-4 h-4 mr-2" />
                  删除
                </Button>
                <Button onClick={navigateBack} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  返回
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* 编辑表单 */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white">编辑故事信息</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
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

                {/* 状态选择 */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">发布状态</label>
                  <select value={status} onChange={e => setStatus(e.target.value)} className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-md text-white focus:border-red-500 focus:ring-red-500/20">
                    <option value="draft">草稿</option>
                    <option value="pending">待审核</option>
                    <option value="published">发布</option>
                  </select>
                </div>

                {/* 提交按钮 */}
                <div className="flex items-center space-x-4">
                  <Button type="submit" disabled={saving} className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600">
                    {saving ? '保存中...' : <><Save className="w-4 h-4 mr-2" />保存修改</>}
                  </Button>
                  <Button type="button" onClick={navigateBack} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    取消
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      <MobileBottomNav currentPage="edit" navigateTo={navigateTo} />
    </div>;
}