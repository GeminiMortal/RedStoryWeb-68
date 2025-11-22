// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button, Input, Textarea } from '@/components/ui';
// @ts-ignore;
import { Save, Send, Eye, ArrowLeft, Plus, X, Tag, MapPin, Calendar, User, Clock, Image as ImageIcon } from 'lucide-react';
// @ts-ignore;
import { cn } from '@/lib/utils';

// @ts-ignore;
import { StoryImage } from '@/components/StoryImage';
// @ts-ignore;
import { ValidatedInput, ValidatedTextarea, ValidatedTagInput } from '@/components/FieldValidation';
// @ts-ignore;
import { validateStoryData, validateField, calculateReadTime, sanitizeStoryData } from '@/lib/validation';
export function StoryForm({
  initialData = {},
  onSave,
  onPublish,
  onCancel,
  loading = false,
  saving = false,
  publishing = false,
  className
}) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    author: '',
    location: '',
    date: '',
    read_time: '5分钟阅读',
    tags: [],
    image: '',
    ...initialData
  });

  // 验证状态
  const [validationErrors, setValidationErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const [isValidating, setIsValidating] = useState(false);

  // 实时验证单个字段
  const validateFieldRealTime = (fieldName, value) => {
    const error = validateField(fieldName, value);
    setValidationErrors(prev => ({
      ...prev,
      [fieldName]: error
    }));
    return !error;
  };

  // 处理字段变化
  const handleFieldChange = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));

    // 实时验证
    if (touchedFields[fieldName]) {
      validateFieldRealTime(fieldName, value);
    }

    // 自动计算阅读时间
    if (fieldName === 'content') {
      const readTime = calculateReadTime(value);
      setFormData(prev => ({
        ...prev,
        read_time: readTime
      }));
    }
  };

  // 处理字段失焦
  const handleFieldBlur = fieldName => {
    setTouchedFields(prev => ({
      ...prev,
      [fieldName]: true
    }));
    validateFieldRealTime(fieldName, formData[fieldName]);
  };

  // 处理标签变化
  const handleTagsChange = e => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      tags: value
    }));
    if (touchedFields.tags) {
      validateFieldRealTime('tags', value);
    }
  };

  // 处理图片变化
  const handleImageChange = async file => {
    try {
      // 转换为 base64
      const base64 = await new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.readAsDataURL(file);
      });
      setFormData(prev => ({
        ...prev,
        image: base64
      }));
    } catch (error) {
      console.error('图片处理失败:', error);
    }
  };

  // 移除图片
  const handleImageRemove = () => {
    setFormData(prev => ({
      ...prev,
      image: ''
    }));
  };

  // 预验证数据
  const preValidateData = data => {
    const sanitizedData = sanitizeStoryData(data);
    const validation = validateStoryData(sanitizedData, false);
    return validation;
  };

  // 保存草稿
  const handleSaveDraft = async () => {
    // 标记所有字段为已触摸
    const allFieldsTouched = Object.keys(formData).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouchedFields(allFieldsTouched);

    // 预验证
    const validation = preValidateData(formData);
    setValidationErrors(validation.errors);
    if (!validation.isValid) {
      return;
    }
    if (onSave) {
      await onSave(sanitizeStoryData(formData));
    }
  };

  // 发布故事
  const handlePublish = async () => {
    // 标记所有字段为已触摸
    const allFieldsTouched = Object.keys(formData).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouchedFields(allFieldsTouched);

    // 预验证
    const validation = preValidateData(formData);
    setValidationErrors(validation.errors);
    if (!validation.isValid) {
      return;
    }
    if (onPublish) {
      await onPublish(sanitizeStoryData(formData));
    }
  };

  // 预览功能
  const handlePreview = () => {
    if (!formData.title || !formData.content) {
      return;
    }
    // 可以实现预览功能
    console.log('预览功能:', formData);
  };

  // 格式化日期
  const formatDate = timestamp => {
    if (!timestamp) return '未知时间';
    return new Date(timestamp).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  return <div className={cn("space-y-6", className)}>
      {/* 基本信息区域 */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6 shadow-2xl">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <User className="w-5 h-5 mr-2 text-red-500" />
          基本信息
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 标题 */}
          <div className="md:col-span-2">
            <ValidatedInput label="故事标题" required fieldName="title" value={formData.title} onChange={e => handleFieldChange('title', e.target.value)} onBlur={() => handleFieldBlur('title')} error={validationErrors.title} touched={touchedFields.title} placeholder="请输入故事标题" />
          </div>

          {/* 作者 */}
          <ValidatedInput label="作者" required fieldName="author" value={formData.author} onChange={e => handleFieldChange('author', e.target.value)} onBlur={() => handleFieldBlur('author')} error={validationErrors.author} touched={touchedFields.author} placeholder="请输入作者姓名" />

          {/* 地点 */}
          <ValidatedInput label="发生地点" required fieldName="location" value={formData.location} onChange={e => handleFieldChange('location', e.target.value)} onBlur={() => handleFieldBlur('location')} error={validationErrors.location} touched={touchedFields.location} placeholder="请输入故事发生地点" />

          {/* 时间时期 */}
          <ValidatedInput label="时间时期" required fieldName="date" value={formData.date} onChange={e => handleFieldChange('date', e.target.value)} onBlur={() => handleFieldBlur('date')} error={validationErrors.date} touched={touchedFields.date} placeholder="例如：抗日战争时期" />

          {/* 阅读时间 */}
          <ValidatedInput label="阅读时间" fieldName="read_time" value={formData.read_time} onChange={e => handleFieldChange('read_time', e.target.value)} onBlur={() => handleFieldBlur('read_time')} error={validationErrors.read_time} touched={touchedFields.read_time} placeholder="例如：5分钟阅读" />
        </div>
      </div>

      {/* 标签和图片区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 标签 */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6 shadow-2xl">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Tag className="w-5 h-5 mr-2 text-orange-500" />
            标签管理
          </h3>
          <ValidatedTagInput label="故事标签" required fieldName="tags" value={formData.tags} onChange={handleTagsChange} onBlur={() => handleFieldBlur('tags')} error={validationErrors.tags} touched={touchedFields.tags} placeholder="输入标签后按回车添加" maxTags={10} />
        </div>

        {/* 图片 */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6 shadow-2xl">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <ImageIcon className="w-5 h-5 mr-2 text-blue-500" />
            封面图片
          </h3>
          <StoryImage src={formData.image} alt="故事封面" editable onChange={handleImageChange} onRemove={handleImageRemove} aspectRatio="video" />
        </div>
      </div>

      {/* 内容区域 */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6 shadow-2xl">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-green-500" />
          故事内容
        </h3>
        <ValidatedTextarea label="故事内容" required fieldName="content" value={formData.content} onChange={e => handleFieldChange('content', e.target.value)} onBlur={() => handleFieldBlur('content')} error={validationErrors.content} touched={touchedFields.content} placeholder="请输入故事内容..." rows={12} showCharCount maxLength={5000} />
      </div>

      {/* 操作按钮区域 */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          {/* 左侧操作 */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={handleSaveDraft} disabled={saving || publishing} variant="outline" className="border-blue-600 text-blue-400 hover:bg-blue-600/10 transition-all duration-300">
              <Save className="w-4 h-4 mr-2" />
              {saving ? '保存中...' : '保存草稿'}
            </Button>
            <Button onClick={handlePublish} disabled={saving || publishing} className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 shadow-lg hover:shadow-red-500/25 transition-all duration-300 transform hover:scale-105">
              <Send className="w-4 h-4 mr-2" />
              {publishing ? '发布中...' : '发布'}
            </Button>
            <Button onClick={handlePreview} disabled={!formData.title || !formData.content} variant="outline" className="border-green-600 text-green-400 hover:bg-green-600/10 transition-all duration-300">
              <Eye className="w-4 h-4 mr-2" />
              预览
            </Button>
          </div>

          {/* 右侧操作 */}
          <div className="flex gap-3">
            {onCancel && <Button onClick={onCancel} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white transition-all duration-300">
                <ArrowLeft className="w-4 h-4 mr-2" />
                取消
              </Button>}
          </div>
        </div>

        {/* 状态信息 */}
        <div className="flex flex-wrap gap-4 text-sm text-slate-400 mt-4 pt-4 border-t border-slate-700">
          {formData.read_time && <span className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            预计阅读时间：{formData.read_time}
          </span>}
          {formData.tags && formData.tags.length > 0 && <span className="flex items-center">
            <Tag className="w-4 h-4 mr-1" />
            已添加 {formData.tags.length} 个标签
          </span>}
          {formData.content && <span className="flex items-center">
            <Calendar className="w-4 h-4 mr-1" />
            内容长度：{formData.content.length} 字符
          </span>}
        </div>
      </div>
    </div>;
}