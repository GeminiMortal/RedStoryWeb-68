// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Button, Input, Textarea, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, useToast } from '@/components/ui';
// @ts-ignore;
import { ArrowLeft, Save, Plus, X, Upload } from 'lucide-react';

// @ts-ignore;
import { PageHeader, BottomNav } from '@/components/Navigation';
export default function UploadPage(props) {
  const {
    $w
  } = props;
  const [story, setStory] = useState({
    title: '',
    content: '',
    author: '',
    location: '',
    tags: [],
    read_time: '5分钟',
    image: '',
    status: 'pending' // 草稿状态默认为待审核
  });
  const [saving, setSaving] = useState(false);
  const [newTag, setNewTag] = useState('');
  const {
    toast
  } = useToast();
  const navigateTo = $w.utils.navigateTo;
  const handleSubmit = async e => {
    e.preventDefault();
    if (!story.title.trim()) {
      toast({
        title: '标题不能为空',
        description: '请输入故事标题',
        variant: 'destructive'
      });
      return;
    }
    if (!story.content.trim()) {
      toast({
        title: '内容不能为空',
        description: '请输入故事内容',
        variant: 'destructive'
      });
      return;
    }
    try {
      setSaving(true);
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();

      // 修改为写入 red_story_draft 数据模型
      const storyData = {
        ...story,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      await db.collection('red_story_draft').add(storyData);
      toast({
        title: '提交成功',
        description: '故事已提交到草稿箱，等待审核'
      });

      // 清空表单
      setStory({
        title: '',
        content: '',
        author: '',
        location: '',
        tags: [],
        read_time: '5分钟',
        image: '',
        status: 'pending'
      });

      // 返回首页
      navigateTo({
        pageId: 'index',
        params: {}
      });
    } catch (err) {
      console.error('保存失败:', err);
      toast({
        title: '保存失败',
        description: err.message || '请稍后重试',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };
  const handleChange = (field, value) => {
    setStory(prev => ({
      ...prev,
      [field]: value
    }));
  };
  const addTag = () => {
    if (newTag.trim() && !story.tags.includes(newTag.trim())) {
      setStory(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };
  const removeTag = tagToRemove => {
    setStory(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };
  const goBack = () => {
    navigateTo({
      pageId: 'index',
      params: {}
    });
  };
  return <div className="min-h-screen bg-gray-900 text-white">
      <PageHeader title="上传红色故事" showBack={true} onBack={goBack} />
      
      <main className="max-w-4xl mx-auto px-4 py-8 pb-24">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 标题 */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">故事标题 *</label>
            <Input value={story.title} onChange={e => handleChange('title', e.target.value)} placeholder="请输入故事标题" className="bg-gray-800 border-gray-700 text-white placeholder-gray-500" required />
          </div>

          {/* 作者 */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">作者</label>
            <Input value={story.author} onChange={e => handleChange('author', e.target.value)} placeholder="请输入作者姓名" className="bg-gray-800 border-gray-700 text-white placeholder-gray-500" />
          </div>

          {/* 地点 */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">故事地点</label>
            <Input value={story.location} onChange={e => handleChange('location', e.target.value)} placeholder="请输入故事发生地点" className="bg-gray-800 border-gray-700 text-white placeholder-gray-500" />
          </div>

          {/* 阅读时间 */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">阅读时长</label>
            <Select value={story.read_time} onValueChange={value => handleChange('read_time', value)}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="选择阅读时长" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3分钟">3分钟</SelectItem>
                <SelectItem value="5分钟">5分钟</SelectItem>
                <SelectItem value="10分钟">10分钟</SelectItem>
                <SelectItem value="15分钟">15分钟</SelectItem>
                <SelectItem value="20分钟">20分钟</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 标签 */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">标签</label>
            <div className="flex gap-2 mb-2">
              <Input value={newTag} onChange={e => setNewTag(e.target.value)} placeholder="添加标签" className="bg-gray-800 border-gray-700 text-white placeholder-gray-500" onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addTag())} />
              <Button type="button" onClick={addTag} variant="outline" className="border-gray-600 text-gray-300">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {story.tags.map((tag, index) => <span key={index} className="inline-flex items-center gap-1 px-3 py-1 bg-red-900/30 text-red-300 text-sm rounded-full border border-red-800/50">
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)} className="text-red-400 hover:text-red-300">
                    <X className="w-3 h-3" />
                  </button>
                </span>)}
            </div>
          </div>

          {/* 图片URL */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">故事图片URL</label>
            <Input value={story.image} onChange={e => handleChange('image', e.target.value)} placeholder="请输入图片URL" className="bg-gray-800 border-gray-700 text-white placeholder-gray-500" />
            {story.image && <img src={story.image} alt="预览" className="mt-2 rounded-lg max-h-48 object-cover" />}
          </div>

          {/* 故事内容 */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">故事内容 *</label>
            <Textarea value={story.content} onChange={e => handleChange('content', e.target.value)} placeholder="请输入故事内容..." className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 min-h-[300px]" required />
          </div>

          {/* 状态提示 */}
          <div className="bg-blue-900/20 border border-blue-600/50 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Upload className="w-5 h-5 text-blue-400 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-blue-300">草稿状态</h3>
                <p className="text-sm text-blue-200 mt-1">
                  您的故事将先保存到草稿箱，经过审核后才会正式发布。
                </p>
              </div>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-3 pt-6 border-t border-gray-700">
            <Button type="button" onClick={goBack} variant="outline" className="border-gray-600 text-gray-300">
              <ArrowLeft className="w-4 h-4 mr-2" />
              取消
            </Button>
            <Button type="submit" disabled={saving} className="bg-red-600 hover:bg-red-700">
              {saving ? '提交中...' : <><Save className="w-4 h-4 mr-2" />提交草稿</>}
            </Button>
          </div>
        </form>
      </main>
      
      <BottomNav currentPage="upload" navigateTo={navigateTo} />
    </div>;
}