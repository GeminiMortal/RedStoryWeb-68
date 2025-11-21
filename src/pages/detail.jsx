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

  // 渲染故事内容
  const renderContent = content => {
    if (!content) return null;
    return content.split('\n').map((paragraph, index) => {
      if (paragraph.trim() === '') return <br key={index} />;

      // 处理图片标记 [img:url]
      if (paragraph.startsWith('[img:') && paragraph.endsWith(']')) {
        const imageUrl = paragraph.slice(5, -1);
        return <img key={index} src={imageUrl} alt="故事图片" className="w-full rounded-lg my-4" />;
      }

      // 处理标题标记
      if (paragraph.startsWith('# ')) {
        return <h1 key={index} className="text-2xl font-bold my-4" style={{
          fontSize: `${fontSize + 8}px`,
          lineHeight
        }}>{paragraph.slice(2)}</h1>;
      }
      if (paragraph.startsWith('## ')) {
        return <h2 key={index} className="text-xl font-semibold my-3" style={{
          fontSize: `${fontSize + 4}px`,
          lineHeight
        }}>{paragraph.slice(3)}</h2>;
      }
      return <p key={index} className="mb-4" style={{
        fontSize: `${fontSize}px`,
        lineHeight,
        textIndent: '2em'
      }}>{paragraph}</p>;
    });
  };
  return <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 阅读进度条 */}
        <div className="fixed top-0 left-0 right-0 h-1 bg-slate-700 z-50">
          <div className="h-full bg-red-500 transition-all duration-300" style={{
          width: `${readingProgress}%`
        }} />
        </div>

        {/* 返回按钮 */}
        <div className="flex items-center justify-between mb-6">
          <Button onClick={() => navigateBack()} variant="ghost" className="text-slate-400 hover:text-white">
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回
          </Button>
          
          <div className="flex items-center space-x-2">
            <Button onClick={() => setFontSize(Math.max(12, fontSize - 2))} variant="ghost" size="sm" className="text-slate-400 hover:text-white">
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-sm text-slate-400">{fontSize}px</span>
            <Button onClick={() => setFontSize(Math.min(24, fontSize + 2))} variant="ghost" size="sm" className="text-slate-400 hover:text-white">
              <ZoomIn className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* 故事内容 */}
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-8">
            <h1 className="text-3xl font-bold text-white mb-4" style={{
            fontSize: `${fontSize + 12}px`,
            lineHeight
          }}>{story.title}</h1>
            
            <div className="flex items-center space-x-4 text-sm text-slate-400 mb-6">
              <span className="flex items-center"><User className="w-4 h-4 mr-1" />{story.author}</span>
              <span className="flex items-center"><Clock className="w-4 h-4 mr-1" />{new Date(story.publishedAt).toLocaleDateString()}</span>
              <span className="flex items-center"><Eye className="w-4 h-4 mr-1" />{story.views}次阅读</span>
            </div>

            <div className="prose prose-invert max-w-none" style={{
            fontSize: `${fontSize}px`,
            lineHeight
          }}>
              {renderContent(story.content)}
            </div>
          </CardContent>
        </Card>

        {/* 底部操作栏 */}
        <div className="flex items-center justify-between mt-8">
          <Button onClick={() => navigateTo({
          pageId: 'index'
        })} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
            <Home className="w-4 h-4 mr-2" />
            返回首页
          </Button>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
              <Heart className="w-4 h-4 mr-2" />
              收藏
            </Button>
            <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
              <Share2 className="w-4 h-4 mr-2" />
              分享
            </Button>
          </div>
        </div>
      </div>
    </div>;
}