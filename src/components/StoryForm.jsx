// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Button, Input } from '@/components/ui';
// @ts-ignore;
import { Tag, X } from 'lucide-react';
// @ts-ignore;
import { cn } from '@/lib/utils';

// @ts-ignore;
import { ValidatedInput, ValidatedTextarea, ValidatedTagInput } from '@/components/FieldValidation';
export function StoryForm({
  storyData,
  validationErrors,
  touchedFields,
  onFieldChange,
  onFieldBlur,
  onTagsChange,
  onImageChange,
  onImageError,
  className
}) {
  return <div className={cn("space-y-6", className)}>
      {/* 基本信息 */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
          基本信息
        </h3>
        <div className="space-y-4">
          <ValidatedInput label="故事标题" required fieldName="title" value={storyData.title} onChange={e => onFieldChange('title', e.target.value)} onBlur={() => onFieldBlur('title')} error={validationErrors.title} touched={touchedFields.title} placeholder="请输入故事标题" />
          
          <ValidatedInput label="作者" required fieldName="author" value={storyData.author} onChange={e => onFieldChange('author', e.target.value)} onBlur={() => onFieldBlur('author')} error={validationErrors.author} touched={touchedFields.author} placeholder="请输入作者名称" />
          
          <ValidatedInput label="发生地点" required fieldName="location" value={storyData.location} onChange={e => onFieldChange('location', e.target.value)} onBlur={() => onFieldBlur('location')} error={validationErrors.location} touched={touchedFields.location} placeholder="请输入故事发生地点" />
          
          <ValidatedInput label="时间时期" required fieldName="date" value={storyData.date} onChange={e => onFieldChange('date', e.target.value)} onBlur={() => onFieldBlur('date')} error={validationErrors.date} touched={touchedFields.date} placeholder="例如：抗日战争时期" />
          
          <ValidatedInput label="阅读时间" fieldName="read_time" value={storyData.read_time} onChange={e => onFieldChange('read_time', e.target.value)} onBlur={() => onFieldBlur('read_time')} error={validationErrors.read_time} touched={touchedFields.read_time} placeholder="例如：5分钟阅读" />
        </div>
      </div>

      {/* 故事内容 */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
          故事内容 <span className="text-red-500 ml-1">*</span>
        </h3>
        <ValidatedTextarea label="故事内容" required fieldName="content" value={storyData.content} onChange={e => onFieldChange('content', e.target.value)} onBlur={() => onFieldBlur('content')} error={validationErrors.content} touched={touchedFields.content} placeholder="请输入故事内容，支持换行..." rows={12} showCharCount maxLength={5000} />
      </div>

      {/* 封面图片 */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
          封面图片
        </h3>
        
        {/* 图片上传组件 */}
        <div className="space-y-4">
          {storyData.image ? <div className="space-y-2">
              <div className="relative w-full h-64 bg-slate-700/50 rounded-xl overflow-hidden">
                <img src={storyData.image} alt="封面预览" className="w-full h-full object-cover" onError={() => onImageError && onImageError('图片加载失败')} />
                <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <Button onClick={() => document.querySelector('input[type="file"]')?.click()} variant="outline" size="sm" className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30">
                    更换图片
                  </Button>
                </div>
                <button onClick={() => onFieldChange('image', '')} className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-600 text-white p-2 rounded-full transition-colors duration-200">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div> : <div className="border-2 border-dashed border-slate-600 rounded-xl p-8 text-center hover:border-red-500/50 transition-colors duration-300">
              <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Tag className="w-6 h-6 text-slate-500" />
              </div>
              <p className="text-slate-400 mb-4">点击或拖拽上传封面图片</p>
              <Button onClick={() => document.querySelector('input[type="file"]')?.click()} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white transition-all">
                选择图片
              </Button>
              <p className="text-xs text-slate-500 mt-2">支持 JPG、PNG、WEBP 格式，大小不超过 5MB</p>
            </div>}
          
          {/* URL输入作为备选方案 */}
          <div>
            <label className="block text-xs text-slate-400 mb-2">或输入图片URL</label>
            <Input value={storyData.image && !storyData.image.startsWith('data:') ? storyData.image : ''} onChange={e => onFieldChange('image', e.target.value)} onBlur={() => onFieldBlur('image')} placeholder="请输入图片URL" className="bg-slate-700/50 border-slate-600 text-white focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all" />
          </div>
          
          {/* 隐藏的文件输入 */}
          <input type="file" accept="image/*" onChange={e => {
          const file = e.target.files[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = event => {
              onFieldChange('image', event.target.result);
            };
            reader.readAsDataURL(file);
          }
        }} className="hidden" />
        </div>
      </div>

      {/* 标签 */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
          标签
        </h3>
        <ValidatedTagInput label="标签" required fieldName="tags" value={storyData.tags} onChange={onTagsChange} onBlur={() => onFieldBlur('tags')} error={validationErrors.tags} touched={touchedFields.tags} placeholder="输入标签后按回车添加" maxTags={10} />
      </div>
    </div>;
}