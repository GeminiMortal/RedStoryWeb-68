
// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button, Card, CardContent, CardHeader, CardTitle, useToast } from '@/components/ui';
// @ts-ignore;
import { ArrowLeft, Save, Eye, FileText, Image as ImageIcon, Tag, User, Calendar, Clock, Send, BookOpen, AlertCircle } from 'lucide-react';
// @ts-ignore;
import { cn } from '@/lib/utils';

// @ts-ignore;
import { Sidebar } from '@/components/Sidebar';
// @ts-ignore;
import { MobileBottomNav } from '@/components/MobileBottomNav';

// 图片组件
const StoryImage = ({
  src,
  alt,
  className,
  onRemove
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  if (imageError || !src) {
    return <div className={cn("flex items-center justify-center bg-slate-700/50 rounded-lg border-2 border-dashed border-slate-600", className)}>
        <ImageIcon className="w-8 h-8 text-slate-500" />
      </div>;
  }
  return <div className={cn("relative overflow-hidden rounded-lg", className)}>
      {!imageLoaded && <div className="absolute inset-0 bg-slate-700/50 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-slate-500 border-t-transparent rounded-full animate-spin"></div>
        </div>}
      <img src={src} alt={alt || '故事图片'} className={cn("w-full h-full object-cover transition-opacity duration-300", imageLoaded ? "opacity-100" : "opacity-0")} onLoad={() => setImageLoaded(true)} onError={() => setImageError(true)} />
      {onRemove && <button onClick={onRemove} className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-600 text-white p-1.5 rounded-full transition-colors duration-200 button-press">
          <AlertCircle className="w-4 h-4" />
        </button>}
    </div>;
};
export default function EditPage(props) {
  const {
    $w
  } = props;
  const [storyData, setStoryData] = useState({
    title: '',
    content: '',
    author: '',
    image: '',
    tags: [],
    read_time: '5分钟阅读'
  });
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [isDraft, setIsDraft] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const {
    toast
  } = useToast();
  const navigateTo = $w.utils.navigateTo;
  const navigateBack = $w.utils.navigateBack;

  // 从URL参数获取编辑模式和草稿ID
  const urlParams = new URLSearchParams(window.location.search);
  const editMode = urlParams.get('edit') === 'true';
  const draftId = urlParams.get('draftId');
  const storyId = urlParams.get('storyId');
  useEffect(() => {
    // 如果是编辑模式，加载数据
    if (editMode && (draftId || storyId)) {
      loadStoryData();
    }
  }, [editMode, draftId, storyId]);
  const loadStoryData = async () => {
    try {
      setLoading(true);
      const tcb = await $w.cloud.getCloudInstance();
      const db = tcb.database();
      let result;
      if (draftId) {
        // 加载草稿数据
        result = await db.collection('red_story_draft').doc(draftId).get();
        setIsDraft(true);
      } else if (storyId) {
        // 加载已发布故事数据
        result = await db.collection('red_story').doc(storyId).get();
        setIsDraft(false);
      }
      if (result && result.data) {
        const data = result.data;
        setStoryData({
          title: data.title || '',
          content: data.content || '',
          author: data.author || data.draftOwner || '',
          image: data.image || '',
          tags: data.tags || [],
          read_time: data.read_time || '5分钟阅读'
        });
        if (data.image) {
          setImagePreview(data.image);
        }
      }
    } catch (error) {
      console.error('加载数据失败:', error);
      toast({
        title: '加载失败',
        description: '无法加载故事数据，请重试',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  const handleInputChange = (field, value) => {
    setStoryData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  const handleImageUpload = e => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: '文件过大',
          description: '图片大小不能超过5MB',
          variant: