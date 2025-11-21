// @ts-ignore;
import React, { useState, useCallback } from 'react';
// @ts-ignore;
import { Button, Card, CardContent, CardHeader, CardTitle, Textarea, Input, useToast } from '@/components/ui';
// @ts-ignore;
import { Upload, Save, Send, Image, Tag, User, ArrowLeft } from 'lucide-react';

// @ts-ignore;
import { useGlobalState } from '@/components/GlobalStateProvider';
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

  // ... 其余代码保持不变
}