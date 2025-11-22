// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Button, Input, Textarea, useToast } from '@/components/ui';
// @ts-ignore;
import { ArrowLeft, Save, Upload, Tag, MapPin, Clock, User, BookOpen, Send } from 'lucide-react';

// @ts-ignore;
import { Sidebar } from '@/components/Sidebar';
// @ts-ignore;
import { MobileBottomNav } from '@/components/MobileBottomNav';
export default function UploadPage(props) {
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
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const {
    toast
  } = useToast();
  const navigateTo = $w.utils.navigateTo;

  // 计算阅读时间
  const calculateReadTime = content => {
    if (!content) return '5分钟阅读';
    const chineseChars = (content.match(/[\u4e00-\u9fa5]/g) || []).length;
    const englishWords = (content.match(/[a-zA-Z]+/g) || []).length;
    const readTime = Math.max(1, Math.ceil(chineseChars / 500 + englishWords / 200));
    return `${readTime}分钟阅读`;
  };

  // 保存草稿（只存储草稿数据库）
  const handleSaveDraft = async () => {
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
      const storyId = `story_${Date.now()}`;
      const draftData = {
        ...story,
        read_time: calculateReadTime(story.content),
        draftOwner: $w.auth.currentUser?.name || '匿名用户',
        lastSavedAt: Date.now(),
        createdAt: Date.now(),
        status: 'draft'
      };
      await db.collection('red_story_draft').doc(storyId).set(draftData);
      toast({
        title: '保存成功',
        description: '已保存到草稿箱'
      });
      navigateTo({
        pageId: 'edit',
        params: {
          id: storyId
        }
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

  // 发布故事（同时存储发布和草稿数据库）
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
      setPublishing(true);
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();
      const now = new Date();
      const storyId = `story_${Date.now()}`;

      // 准备发布数据
      const publishedData = {
        ...story,
        read_time: calculateReadTime(story.content),
        createdAt: now,
        updatedAt: now,
        status: 'published',
        views: 0
      };

      // 准备草稿数据
      const draftData = {
        ...story,
        read_time: calculateReadTime(story.content),
        draftOwner: $w.auth.currentUser?.name || '匿名用户',
        lastSavedAt: now,
        createdAt: now,
        status: 'draft'
      };

      // 同时存储到发布和草稿数据库
      const [publishedResult, draftResult] = await Promise.all([db.collection('red_story').doc(storyId).set(publishedData), db.collection('red_story_draft').doc(storyId).set(draftData)]);
      toast({
        title: '发布成功',
        description: '故事已发布并保存到草稿箱'
      });

      // 跳转到首页，让用户可以看到刚刚发布的故事
      navigateTo({
        pageId: 'index',
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
  return <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <Sidebar currentPage="upload" navigateTo={navigateTo} />
      
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
              <h1 className="text-2xl font-bold text-white">创建新故事</h1>
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

              {/* 上传者 */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <User className="w-4 h-4 inline mr-1" />
                  上传者
                </label>
                <Input value={story.author} onChange={e => setStory({
                ...story,
                author: e.target.value
              })} placeholder="请输入上传者姓名" className="bg-gray-700/50 border-gray-600 text-white focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all" />
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
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-700">
                <Button onClick={handleSaveDraft} disabled={saving} variant="outline" className="border-blue-600 text-blue-400 hover:bg-blue-600/10 transition-all">
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? '保存中...' : '保存草稿'}
                </Button>
                <Button onClick={handlePublish} disabled={publishing} className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 shadow-lg hover:shadow-red-500/25 transition-all duration-300 transform hover:scale-105">
                  <Send className="w-4 h-4 mr-2" />
                  {publishing ? '发布中...' : '发布'}
                </Button>
                <Button onClick={goBack} variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white transition-all">
                  取消
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>

      <MobileBottomNav currentPage="upload" navigateTo={navigateTo} />
    </div>;
}