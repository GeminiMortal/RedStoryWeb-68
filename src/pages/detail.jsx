// @ts-ignore;
import React, { useState, useEffect, useCallback, useRef } from 'react';
// @ts-ignore;
import { Button, Card, CardContent, useToast } from '@/components/ui';
// @ts-ignore;
import { ArrowLeft, Share2, Heart, Eye, Clock, User, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Settings, Home } from 'lucide-react';
// @ts-ignore;
import { cn } from '@/lib/utils';

// @ts-ignore;
import { StoryCarousel } from '@/components/StoryCarousel';
// @ts-ignore;
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
// @ts-ignore;
import { useGlobalState } from '@/components/GlobalStateProvider';
export default function DetailPage(props) {
  const {
    $w
  } = props;
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fontSize, setFontSize] = useState(16);
  const [lineHeight, setLineHeight] = useState(1.6);
  const [showControls, setShowControls] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [showBackConfirm, setShowBackConfirm] = useState(false);
  const contentRef = useRef(null);
  const {
    toast
  } = useToast();
  const storyId = props.$w.page.dataset.params?.id;
  const navigateTo = $w.utils.navigateTo;
  const navigateBack = $w.utils.navigateBack;

  // 统一的数据模型调用
  const loadStory = useCallback(async () => {
    if (!storyId) {
      toast({
        title: '错误',
        description: '故事ID无效',
        variant: 'destructive'
      });
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();
      const result = await db.collection('red_story').doc(storyId).get();
      const storyData = result.data;
      if (!storyData) {
        toast({
          title: '故事不存在',
          description: '该故事可能已被删除',
          variant: 'destructive'
        });
        navigateTo({
          pageId: 'index'
        });
        return;
      }

      // 标准化字段
      const normalizedStory = {
        ...storyData,
        id: storyId,
        title: storyData.title || '无标题',
        content: storyData.content || '',
        author: storyData.author || '佚名',
        publishedAt: storyData.publishedAt || storyData.createdAt || new Date(),
        views: (storyData.views || 0) + 1,
        imageUrl: storyData.imageUrl || '',
        tags: storyData.tags || []
      };
      setStory(normalizedStory);

      // 更新浏览量
      await db.collection('red_story').doc(storyId).update({
        views: normalizedStory.views
      });
    } catch (error) {
      console.error('加载故事失败:', error);
      toast({
        title: '加载失败',
        description: error.message || '无法加载故事内容',
        variant: 'destructive',
        action: {
          label: '返回首页',
          onClick: () => navigateTo({
            pageId: 'index'
          })
        }
      });
    } finally {
      setLoading(false);
    }
  }, [storyId, toast, navigateTo]);
  useEffect(() => {
    loadStory();
  }, [loadStory]);

  // 字体大小同步调整
  useEffect(() => {
    setLineHeight(Math.max(1.4, fontSize / 10));
  }, [fontSize]);
  if (loading) {
    return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <LoadingSkeleton type="detail" />
        </div>
      </div>;
  }
  if (!story) {
    return null;
  }

  // ... 其余代码保持不变
}