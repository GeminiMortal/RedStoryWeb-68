// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button, Input, Textarea, useToast } from '@/components/ui';
// @ts-ignore;
import { ArrowLeft, Save, Upload, Tag, MapPin, Clock, User, BookOpen, Send } from 'lucide-react';

// @ts-ignore;
import { Sidebar } from '@/components/Sidebar';
// @ts-ignore;
import { MobileBottomNav } from '@/components/MobileBottomNav';
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
        const draftResult = await db.collection('red_story_draft').doc(storyId).get();
        if (draftResult && draftResult.data) {
          setStory(draftResult.data);
          setLoading(false);
          return;
        }
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
      await db.collection('red_story').doc(storyId).set({
        ...story,
        status: 'published',
        publishedAt: Date.now(),
        updatedAt: Date.now()
      });
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
    return <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        <Sidebar currentPage="edit" navigateTo={navigateTo} />
        <div className="flex-1 transition-all duration-300 ease-in-out flex items-center justify-center">
          <div className="text-center animate-fade-in">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-400">加载编辑内容中...</p>
          </div>
        </div>
      </div>;
  }
  if (error) {
    return <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        <Sidebar currentPage="edit" navigateTo={navigateTo} />
        <div className="flex-1 transition-all duration-300 ease-in-out">
          <header className="bg-gray-800/90 backdrop-blur-sm border-b border-gray-700 md:hidden">
            <div className="px-4 py-3">
              <button onClick={goBack} className="flex items-center text-gray-300 hover:text-white">
                <ArrowLeft className="w-5 h-5 mr-2" />
                返回
              </button>
            </div>
          </header>
          
          <main className="max-w-4xl mx-auto p-4 md:p-8">
            <div className="bg-red-900/20 border border-red-600/50 rounded-xl p-8 text-center animate-fade-in">
              <BookOpen className="w-20 h-20 text-red-400 mx-auto mb-4 animate-bounce" />
              <h2 className="text-2xl font-bold text-white mb-2">加载失败</h2>
              <p className="text-gray-400 mb-6">{error}</p>
              <Button onClick={goBack} className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-red-500/25 transition-all duration-300">
                返回首页
              </Button>
            </div>
          </main>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <Sidebar currentPage="edit" navigateTo={navigateTo} />
      
      {/* 移动端返回栏 */}
      <div className="md:hidden bg-gray-800/90 backdrop-blur-sm border-b border-gray-700 px-4 py-3 flex items-center">
        <button onClick={goBack} className="flex items-center text-gray-300 hover:text-white">
          <ArrowLeft className="w-5 h-5 mr-2" />
          返回
        </button>
      </div>

      <div className="flex-1 transition-all duration-300 ease-in-out">
        <header className="hidden md:block bg-gray-800/90 backdrop-blur-sm border-b border-gray-700">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-white">编辑故事</h1>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto p-4 md:p-8 pb-24 md:pb-8">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 p-6 shadow-2xl animate-fade-in">
            <div className="space-y-6">
              {/* 标题 */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <BookOpen className="w-4 h-4 inline mr-1" />
                  标题 *
                </label>
                <Input value={story.title} onChange={e => setStory({
                ...story,
                title: e.target.value
              })} placeholder="请输入故事标题" className="bg-gray-700/50 border-gray-600 text-white focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all" />
              </div>

              {/* 作者 */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <User className="w-4 h-4 inline mr-1" />
                  作者
                </label>
                <Input value={story.author} onChange={e => setStory({
                ...story,
                author: e.target.value
              })} placeholder="请输入作者姓名" className="bg-gray-700/50 border-gray-600 text-white focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all" />
              </div>

              {/* 地点 */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  故事地点
                </label>
                <Input value={story.location} onChange={e => setStory({
                ...story,
                location: e.target.value
              })} placeholder="请输入故事发生地点" className="bg-gray-700/50 border-gray-600 text-white focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all" />
              </div>

              {/* 阅读时间 */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  阅读时间
                </label>
                <Input value={story.read_time} onChange={e => setStory({
                ...story,
                read_time: e.target.value
              })} placeholder="例如：5分钟阅读" className="bg-gray-700/50 border-gray-600 text-white focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all" />
              </div>

              {/* 标签 */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Tag className="w-4 h-4 inline mr-1" />
                  标签
                </label>
                <div className="flex gap-2 mb-2">
                  <Input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleAddTag()} placeholder="添加标签" className="bg-gray-700/50 border-gray-600 text-white focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all" />
                  <Button onClick={handleAddTag} className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 transition-all">
                    添加
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {story.tags.map((tag, index) => <span key={index} className="px-3 py-1 bg-red-900/30 text-red-300 text-sm rounded-full border border-red-800/50 animate-fade-in">
                      {tag}
                      <button onClick={() => handleRemoveTag(tag)} className="ml-2 text-red-400 hover:text-red-300">
                        ×
                      </button>
                    </span>)}
                </div>
              </div>

              {/* 图片URL */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Upload className="w-4 h-4 inline mr-1" />
                  图片URL
                </label>
                <Input value={story.image} onChange={e => setStory({
                ...story,
                image: e.target.value
              })} placeholder="请输入图片URL" className="bg-gray-700/50 border-gray-600 text-white focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all" />
              </div>

              {/* 内容 */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">故事内容 *</label>
                <Textarea value={story.content} onChange={e => setStory({
                ...story,
                content: e.target.value
              })} placeholder="请输入故事内容..." rows={10} className="bg-gray-700/50 border-gray-600 text-white resize-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all" />
              </div>

              {/* 操作按钮 */}
              <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-700">
                <Button onClick={handleSave} disabled={saving} className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-blue-500/25 transition-all duration-300">
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? '保存中...' : '保存草稿'}
                </Button>
                <Button onClick={handlePublish} disabled={saving} className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-green-500/25 transition-all duration-300">
                  <Send className="w-4 h-4 mr-2" />
                  {saving ? '发布中...' : '发布故事'}
                </Button>
                <Button onClick={goBack} variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white transition-all">
                  取消
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>

      <MobileBottomNav currentPage="edit" navigateTo={navigateTo} />
    </div>;
}