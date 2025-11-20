// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button, Input, Textarea, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, useToast } from '@/components/ui';
// @ts-ignore;
import { ArrowLeft, Save, Send, Clock, Calendar, User, MapPin } from 'lucide-react';

// @ts-ignore;
import { PageHeader, BottomNav } from '@/components/Navigation';
// @ts-ignore;
import { TagManager } from '@/components/TagManager';
// @ts-ignore;
import { ImagePreview } from '@/components/ImagePreview';
// @ts-ignore;
import { StatusIndicator } from '@/components/StatusIndicator';
export default function EditPage(props) {
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
    status: 'draft'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [dataSource, setDataSource] = useState('');
  const {
    toast
  } = useToast();
  const storyId = $w.page.dataset.params?.id;
  const navigateTo = $w.utils.navigateTo;

  // 加载故事数据（优先草稿库，回退主库）
  useEffect(() => {
    if (storyId) {
      loadStory();
    } else {
      setLoading(false);
    }
  }, [storyId]);
  const loadStory = async () => {
    try {
      setLoading(true);
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();

      // 1. 优先查询草稿库
      const draftResult = await db.collection('red_story_draft').where({
        _id: storyId
      }).get();
      if (draftResult && draftResult.data && draftResult.data.length > 0) {
        const draftData = draftResult.data[0];
        setStory({
          title: draftData.title || '',
          content: draftData.content || '',
          author: draftData.author || '',
          location: draftData.location || '',
          tags: draftData.tags || [],
          read_time: draftData.read_time || '5分钟',
          image: draftData.image || '',
          status: draftData.status || 'draft'
        });
        setDataSource('draft');
      } else {
        // 2. 草稿不存在，查询主库
        const mainResult = await db.collection('red_story').doc(storyId).get();
        if (mainResult && mainResult.data) {
          setStory({
            title: mainResult.data.title || '',
            content: mainResult.data.content || '',
            author: mainResult.data.author || '',
            location: mainResult.data.location || '',
            tags: mainResult.data.tags || [],
            read_time: mainResult.data.read_time || '5分钟',
            image: mainResult.data.image || '',
            status: mainResult.data.status || 'published'
          });
          setDataSource('main');
        } else {
          toast({
            title: '故事不存在',
            description: '未找到对应的故事数据',
            variant: 'destructive'
          });
        }
      }
    } catch (err) {
      console.error('加载故事失败:', err);
      toast({
        title: '加载失败',
        description: '无法加载故事数据',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // 保存草稿
  const handleSaveDraft = async () => {
    if (!validateForm()) return;
    try {
      setSaving(true);
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();
      const storyData = {
        ...story,
        updatedAt: Date.now()
      };
      if (dataSource === 'main') {
        await db.collection('red_story_draft').add({
          ...storyData,
          createdAt: Date.now()
        });
      } else {
        await db.collection('red_story_draft').doc(storyId).update(storyData);
      }
      toast({
        title: '草稿保存成功',
        description: '故事已保存到草稿箱'
      });
      navigateTo({
        pageId: 'admin',
        params: {}
      });
    } catch (err) {
      console.error('保存草稿失败:', err);
      toast({
        title: '保存草稿失败',
        description: err.message || '请稍后重试',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  // 发布故事
  const handlePublish = async () => {
    if (!validateForm()) return;
    try {
      setPublishing(true);
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();
      const storyData = {
        ...story,
        status: 'published',
        updatedAt: Date.now()
      };
      if (storyId && dataSource === 'main') {
        await db.collection('red_story').doc(storyId).update(storyData);
      } else {
        await db.collection('red_story').add({
          ...storyData,
          createdAt: Date.now()
        });
      }

      // 删除对应草稿（如果存在）
      if (dataSource === 'draft' || storyId) {
        try {
          await db.collection('red_story_draft').doc(storyId).remove();
        } catch (e) {
          console.log('草稿删除失败或不存在:', e);
        }
      }
      toast({
        title: '发布成功',
        description: '故事已正式发布'
      });
      navigateTo({
        pageId: 'admin',
        params: {}
      });
    } catch (err) {
      console.error('发布失败:', err);
      toast({
        title: '发布失败',
        description: err.message || '请稍后重试',
        variant: 'destructive'
      });
    } finally {
      setPublishing(false);
    }
  };
  const validateForm = () => {
    if (!story.title.trim()) {
      toast({
        title: '标题不能为空',
        description: '请输入故事标题',
        variant: 'destructive'
      });
      return false;
    }
    if (!story.content.trim()) {
      toast({
        title: '内容不能为空',
        description: '请输入故事内容',
        variant: 'destructive'
      });
      return false;
    }
    return true;
  };
  const handleChange = (field, value) => {
    setStory(prev => ({
      ...prev,
      [field]: value
    }));
  };
  const goBack = () => {
    navigateTo({
      pageId: 'admin',
      params: {}
    });
  };
  if (loading && storyId) {
    return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-400">加载故事数据中...</p>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-gray-900 text-white">
      <PageHeader title={storyId ? '编辑红色故事' : '创建红色故事'} showBack={true} onBack={goBack} />
      
      <main className="max-w-4xl mx-auto px-4 py-8 pb-24">
        {storyId && <StatusIndicator dataSource={dataSource} />}

        <form onSubmit={e => e.preventDefault()} className="space-y-6">
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
            <TagManager tags={story.tags} onTagsChange={tags => handleChange('tags', tags)} />
          </div>

          {/* 图片 */}
          <ImagePreview image={story.image} onImageChange={url => handleChange('image', url)} />

          {/* 故事内容 */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">故事内容 *</label>
            <Textarea value={story.content} onChange={e => handleChange('content', e.target.value)} placeholder="请输入故事内容..." className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 min-h-[300px]" required />
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-3 pt-6 border-t border-gray-700">
            <Button type="button" onClick={goBack} variant="outline" className="border-gray-600 text-gray-300">
              <ArrowLeft className="w-4 h-4 mr-2" />
              取消
            </Button>
            <Button type="button" onClick={handleSaveDraft} disabled={saving} variant="outline" className="border-gray-600 text-gray-300">
              <Save className="w-4 h-4 mr-2" />
              {saving ? '保存中...' : '保存草稿'}
            </Button>
            <Button type="button" onClick={handlePublish} disabled={publishing} className="bg-red-600 hover:bg-red-700">
              <Send className="w-4 h-4 mr-2" />
              {publishing ? '发布中...' : '正式发布'}
            </Button>
          </div>
        </form>
      </main>

      {/* 仅保留首页和上传两个底部导航 */}
      <BottomNav currentPage="edit" navigateTo={navigateTo} />
    </div>;
}