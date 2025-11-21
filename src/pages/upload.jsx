// @ts-ignore;
import React, { useState, useCallback } from 'react';
// @ts-ignore;
import { Button, Card, CardContent, CardHeader, CardTitle, Textarea, Input, useToast } from '@/components/ui';
// @ts-ignore;
import { Upload, Save, Send, Image, Tag, User, ArrowLeft } from 'lucide-react';

// @ts-ignore;
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
export default function UploadPage(props) {
  const {
    $w
  } = props;
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    author: '',
    category: '红色故事',
    tags: [],
    imageUrl: ''
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const {
    toast
  } = useToast();
  const navigateTo = $w.utils.navigateTo;
  const navigateBack = $w.utils.navigateBack;

  // 统一的数据验证
  const validateForm = () => {
    if (!formData.title.trim()) {
      toast({
        title: '标题不能为空',
        description: '请输入故事标题',
        variant: 'destructive'
      });
      return false;
    }
    if (!formData.content.trim()) {
      toast({
        title: '内容不能为空',
        description: '请输入故事内容',
        variant: 'destructive'
      });
      return false;
    }
    return true;
  };

  // 统一的数据保存
  const saveToDraft = useCallback(async () => {
    if (!validateForm()) return;
    try {
      setSaving(true);
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();
      const draftData = {
        ...formData,
        status: 'draft',
        createdAt: new Date(),
        updatedAt: new Date(),
        is_draft: true
      };
      await db.collection('red_story_draft').add(draftData);
      toast({
        title: '保存成功',
        description: '草稿已保存到草稿箱'
      });
      navigateTo({
        pageId: 'admin'
      });
    } catch (error) {
      console.error('保存草稿失败:', error);
      toast({
        title: '保存失败',
        description: error.message || '无法保存草稿',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  }, [formData, toast, navigateTo]);

  // 统一的数据发布
  const publishStory = useCallback(async () => {
    if (!validateForm()) return;
    try {
      setPublishing(true);
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();
      const storyData = {
        ...formData,
        status: 'published',
        publishedAt: new Date(),
        updatedAt: new Date(),
        views: 0,
        likes: 0
      };
      const result = await db.collection('red_story').add(storyData);
      toast({
        title: '发布成功',
        description: '故事已成功发布'
      });
      navigateTo({
        pageId: 'detail',
        params: {
          id: result.id
        }
      });
    } catch (error) {
      console.error('发布失败:', error);
      toast({
        title: '发布失败',
        description: error.message || '无法发布故事',
        variant: 'destructive'
      });
    } finally {
      setPublishing(false);
    }
  }, [formData, toast, navigateTo]);
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  const handleSubmit = e => {
    e.preventDefault();
  };
  return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <Button onClick={navigateBack} variant="ghost" className="text-slate-400 hover:text-white">
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回
          </Button>
          <h1 className="text-2xl font-bold text-white">创作新故事</h1>
        </div>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">故事信息</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">故事标题</label>
                <Input type="text" placeholder="请输入故事标题" value={formData.title} onChange={e => handleInputChange('title', e.target.value)} className="bg-slate-700 border-slate-600 text-white placeholder-slate-400" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">作者</label>
                <Input type="text" placeholder="请输入作者姓名" value={formData.author} onChange={e => handleInputChange('author', e.target.value)} className="bg-slate-700 border-slate-600 text-white placeholder-slate-400" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">故事内容</label>
                <Textarea placeholder="请输入故事内容..." value={formData.content} onChange={e => handleInputChange('content', e.target.value)} rows={10} className="bg-slate-700 border-slate-600 text-white placeholder-slate-400" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">故事分类</label>
                <select value={formData.category} onChange={e => handleInputChange('category', e.target.value)} className="w-full px-3 py-2 bg-slate-700 border-slate-600 text-white rounded-md">
                  <option value="红色故事">红色故事</option>
                  <option value="英雄事迹">英雄事迹</option>
                  <option value="革命历史">革命历史</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">图片链接</label>
                <Input type="url" placeholder="请输入图片URL" value={formData.imageUrl} onChange={e => handleInputChange('imageUrl', e.target.value)} className="bg-slate-700 border-slate-600 text-white placeholder-slate-400" />
              </div>

              <div className="flex items-center space-x-4">
                <Button type="button" onClick={saveToDraft} disabled={saving || publishing} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                  {saving ? '保存中...' : '保存草稿'}
                </Button>
                <Button type="button" onClick={publishStory} disabled={saving || publishing} className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600">
                  {publishing ? '发布中...' : '立即发布'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>;
}