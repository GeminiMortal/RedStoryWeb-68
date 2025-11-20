// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button, Input, Textarea, useToast } from '@/components/ui';
// @ts-ignore;
import { ArrowLeft, Save, Upload, Tag, MapPin, Clock, User, BookOpen } from 'lucide-react';

// @ts-ignore;
import { Sidebar } from '@/components/Sidebar';
export default function EditPage(props) {
  const {
    $w
  } = props;
  const [story, setStory] = useState({
    title: '',
    content: '',
    author: '',
    location: '',
    read_time: '',
    tags: [],
    image: '',
    status: 'draft'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [tagInput, setTagInput] = useState('');
  const {
    toast
  } = useToast();
  const navigateTo = $w.utils.navigateTo;

  // 修正参数访问方式 - 直接使用 params.id
  const storyId = $w.page.dataset.params.id;
  useEffect(() => {
    const loadStory = async () => {
      if (!storyId) {
        setError('故事ID不能为空');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const tcb = await $w.cloud.getCloudInstance();
        const db = tcb.database();

        // 1. 优先尝试加载草稿
        const draftResult = await db.collection('red_story_draft').doc(storyId).get();
        if (draftResult && draftResult.data) {
          setStory(draftResult.data);
          setLoading(false);
          return;
        }

        // 2. 无草稿则加载主库内容
        const mainResult = await db.collection('red_story').doc(storyId).get();
        if (mainResult && mainResult.data) {
          setStory({
            ...mainResult.data,
            status: 'draft'
          });
        } else {
          setError('故事不存在');
        }
      } catch (err) {
        console.error('加载故事失败:', err);
        setError(`加载失败: ${err.message || '未知错误'}`);
      } finally {
        setLoading(false);
      }
    };
    if (storyId) {
      loadStory();
    } else {
      setLoading(false);
      setError('未提供故事ID');
    }
  }, [storyId]);
  const handleSave = async () => {
    if (!story.title.trim() || !story.content.trim()) {
      toast({
        title: '保存失败',
        description: '标题和内容不能为空',
        variant: 'destructive'
      });
      return;
    }
    try {
      setSaving(true);
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();
      await db.collection('red_story_draft').doc(storyId).set({
        ...story,
        updatedAt: Date.now()
      });
      toast({
        title: '保存成功',
        description: '已保存到草稿箱'
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
  const handlePublish = async () => {
    if (!story.title.trim() || !story.content.trim()) {
      toast({
        title: '发布失败',
        description: '标题和内容不能为空',
        variant: 'destructive'
      });
      return;
    }
    try {
      setSaving(true);
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();

      // 1. 发布到主库
      await db.collection('red_story').doc(storyId).set({
        ...story,
        status: 'published',
        publishedAt: Date.now(),
        updatedAt: Date.now()
      });

      // 2. 删除草稿
      await db.collection('red_story_draft').doc(storyId).remove();
      toast({
        title: '发布成功',
        description: '故事已发布到主库'
      });
      navigateTo({
        pageId: 'detail',
        params: {
          id: storyId
        }
      });
    } catch (err) {
      console.error('发布失败:', err);
      toast({
        title: '发布失败',
        description: err.message || '请稍后重试',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };
  const handleAddTag = () => {
    if (tagInput.trim() && !story.tags.includes(tagInput.trim())) {
      setStory({
        ...story,
        tags: [...story.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };
  const handleRemoveTag = tagToRemove => {
    setStory({
      ...story,
      tags: story.tags.filter(tag => tag !== tagToRemove)
    });
  };
  const goBack = () => {
    navigateTo({
      pageId: 'index',
      params: {}
    });
  };
  if (loading) {
    return <div className="min-h-screen bg-gray-900 text-white flex">
        <Sidebar currentPage="edit" navigateTo={navigateTo} />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-400">加载编辑内容中...</p>
          </div>
        </div>
      </div>;
  }
  if (error) {
    return <div className="min-h-screen bg-gray-900 text-white flex">
        <Sidebar currentPage="edit" navigateTo={navigateTo} />
        <div className="flex-1 ml-64">
          <header className="bg-gray-800/80 backdrop-blur-sm border-b border-gray-700">
            <div className="max-w-7xl mx-auto px-6 py-4">
              <div className="flex items-center">
                <button onClick={goBack} className="flex items-center text-gray-300 hover:text-white">
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  返回
                </button>
              </div>
            </div>
          </header>
          
          <main className="max-w-7xl mx-auto px-6 py-8">
            <div className="bg-red-900/20 border border-red-600/50 rounded-lg p-8 text-center">
              <BookOpen className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">加载失败</h2>
              <p className="text-gray-400">{error}</p>
              <Button onClick={goBack} className="mt-4 bg-red-600 hover:bg-red-700">
                返回首页
              </Button>
            </div>
          </main>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-gray-900 text-white flex">
      <Sidebar currentPage="edit" navigateTo={navigateTo} />
      
      <div className="flex-1 ml-64">
        <header className="bg-gray-800/80 backdrop-blur-sm border-b border-gray-700">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button onClick={goBack} className="flex items-center text-gray-300 hover:text-white">
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  返回
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">标题</label>
                <Input value={story.title} onChange={e => setStory({
                ...story,
                title: e.target.value
              })} placeholder="请输入故事标题" className="bg-gray-700 border-gray-600 text-white" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">作者</label>
                <Input value={story.author} onChange={e => setStory({
                ...story,
                author: e.target.value
              })} placeholder="请输入作者姓名" className="bg-gray-700 border-gray-600 text-white" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  故事地点
                </label>
                <Input value={story.location} onChange={e => setStory({
                ...story,
                location: e.target.value
              })} placeholder="请输入故事发生地点" className="bg-gray-700 border-gray-600 text-white" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  阅读时间
                </label>
                <Input value={story.read_time} onChange={e => setStory({
                ...story,
                read_time: e.target.value
              })} placeholder="例如：5分钟阅读" className="bg-gray-700 border-gray-600 text-white" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Tag className="w-4 h-4 inline mr-1" />
                  标签
                </label>
                <div className="flex gap-2 mb-2">
                  <Input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleAddTag()} placeholder="添加标签" className="bg-gray-700 border-gray-600 text-white" />
                  <Button onClick={handleAddTag} className="bg-red-600 hover:bg-red-700">
                    添加
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {story.tags.map((tag, index) => <span key={index} className="px-3 py-1 bg-red-900/30 text-red-300 text-sm rounded-full border border-red-800/50">
                      {tag}
                      <button onClick={() => handleRemoveTag(tag)} className="ml-2 text-red-400 hover:text-red-300">
                        ×
                      </button>
                    </span>)}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Upload className="w-4 h-4 inline mr-1" />
                  图片URL
                </label>
                <Input value={story.image} onChange={e => setStory({
                ...story,
                image: e.target.value
              })} placeholder="请输入图片URL" className="bg-gray-700 border-gray-600 text-white" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">故事内容</label>
                <Textarea value={story.content} onChange={e => setStory({
                ...story,
                content: e.target.value
              })} placeholder="请输入故事内容..." rows={10} className="bg-gray-700 border-gray-600 text-white resize-none" />
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-700">
                <Button onClick={handleSave} disabled={saving} variant="outline" className="border-gray-600 text-gray-300">
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? '保存中...' : '保存草稿'}
                </Button>
                <Button onClick={handlePublish} disabled={saving} className="bg-red-600 hover:bg-red-700">
                  {saving ? '发布中...' : '发布故事'}
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>;
}