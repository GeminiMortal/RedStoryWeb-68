// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Button, Input, Textarea } from '@/components/ui';
// @ts-ignore;
import { MapPin, Clock, User, BookOpen, Tag, Image as ImageIcon, X, Upload, FileImage } from 'lucide-react';

// @ts-ignore;
import { ValidatedInput, ValidatedTextarea, ValidatedTagInput } from '@/components/FieldValidation';
export function StoryForm({
  storyData,
  onFieldChange,
  onFieldBlur,
  onTagsChange,
  onImageUpload,
  onRemoveImage,
  onSaveDraft,
  onPublish,
  onPreview,
  onCancel,
  validationErrors,
  touchedFields,
  isLoading = false,
  isSaving = false,
  isPublishing = false,
  isPreviewing = false,
  imagePreview = '',
  uploadingImage = false,
  tagInput = '',
  onTagInputChange,
  onAddTag,
  onRemoveTag,
  fileInputRef,
  triggerFileSelect
}) {
  return <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6 shadow-2xl animate-fade-in">
      <div className="space-y-6">
        {/* 标题 */}
        <ValidatedInput label="故事标题" fieldName="title" value={storyData.title} onChange={e => onFieldChange('title', e.target.value)} onBlur={() => onFieldBlur('title')} error={validationErrors.title} touched={touchedFields.title} placeholder="请输入故事标题（可选）" />

        {/* 上传者 */}
        <ValidatedInput label="上传者" fieldName="author" value={storyData.author} onChange={e => onFieldChange('author', e.target.value)} onBlur={() => onFieldBlur('author')} error={validationErrors.author} touched={touchedFields.author} placeholder="请输入上传者名称（可选）" />

        {/* 地点 */}
        <ValidatedInput label="发生地点" fieldName="location" value={storyData.location} onChange={e => onFieldChange('location', e.target.value)} onBlur={() => onFieldBlur('location')} error={validationErrors.location} touched={touchedFields.location} placeholder="请输入故事发生地点（可选）" />

        {/* 时间时期 */}
        <ValidatedInput label="时间时期" fieldName="date" value={storyData.date} onChange={e => onFieldChange('date', e.target.value)} onBlur={() => onFieldBlur('date')} error={validationErrors.date} touched={touchedFields.date} placeholder="例如：抗日战争时期（可选）" />

        {/* 阅读时间 */}
        <ValidatedInput label="阅读时间" fieldName="read_time" value={storyData.read_time} onChange={e => onFieldChange('read_time', e.target.value)} onBlur={() => onFieldBlur('read_time')} error={validationErrors.read_time} touched={touchedFields.read_time} placeholder="例如：5分钟阅读（可选）" />

        {/* 标签 */}
        <ValidatedTagInput label="标签" fieldName="tags" value={storyData.tags} onChange={onTagsChange} onBlur={() => onFieldBlur('tags')} error={validationErrors.tags} touched={touchedFields.tags} placeholder="输入标签后按回车添加（可选）" maxTags={10} />

        {/* 图片上传 */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            <ImageIcon className="w-4 h-4 inline mr-1" />
            封面图片
          </label>
          
          {/* 图片预览区域 */}
          {imagePreview ? <div className="relative mb-4">
              <div className="relative w-full h-64 bg-slate-700/50 rounded-xl overflow-hidden border-2 border-dashed border-slate-600">
                <img src={imagePreview} alt="图片预览" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                  <Button onClick={triggerFileSelect} variant="outline" size="sm" className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30">
                    <Upload className="w-4 h-4 mr-2" />
                    更换图片
                  </Button>
                </div>
                <button onClick={onRemoveImage} className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-600 text-white p-2 rounded-full transition-colors duration-200">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div> : <div className="border-2 border-dashed border-slate-600 rounded-xl p-8 text-center hover:border-red-500/50 transition-colors duration-300 mb-4">
              <FileImage className="w-12 h-12 text-slate-500 mx-auto mb-4" />
              <p className="text-slate-400 mb-4">点击或拖拽上传封面图片</p>
              <Button onClick={triggerFileSelect} disabled={uploadingImage} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white transition-all">
                <Upload className="w-4 h-4 mr-2" />
                {uploadingImage ? '上传中...' : '选择图片'}
              </Button>
              <p className="text-xs text-slate-500 mt-2">支持 JPG、PNG、WEBP 格式，大小不超过 5MB</p>
            </div>}

          {/* 隐藏的文件输入 */}
          <input ref={fileInputRef} type="file" accept="image/*" onChange={onImageUpload} className="hidden" />

          {/* URL输入作为备选方案 */}
          <div className="mt-4">
            <label className="block text-xs text-slate-400 mb-2">或输入图片URL</label>
            <Input value={storyData.image && !imagePreview ? storyData.image : ''} onChange={e => onFieldChange('image', e.target.value)} onBlur={() => onFieldBlur('image')} placeholder="请输入图片URL" className="bg-slate-700/50 border-slate-600 text-white focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all" />
          </div>
        </div>

        {/* 内容 */}
        <ValidatedTextarea label="故事内容" fieldName="content" value={storyData.content} onChange={e => onFieldChange('content', e.target.value)} onBlur={() => onFieldBlur('content')} error={validationErrors.content} touched={touchedFields.content} placeholder="请输入故事内容（可选）..." rows={10} showCharCount maxLength={5000} />

        {/* 操作按钮 */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-700">
          <Button onClick={onSaveDraft} disabled={isSaving} variant="outline" className="border-blue-600 text-blue-400 hover:bg-blue-600/10 transition-all">
            <BookOpen className="w-4 h-4 mr-2" />
            {isSaving ? '保存中...' : '保存草稿'}
          </Button>
          <Button onClick={onPublish} disabled={isPublishing} className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 shadow-lg hover:shadow-red-500/25 transition-all duration-300 transform hover:scale-105">
            <Upload className="w-4 h-4 mr-2" />
            {isPublishing ? '发布中...' : '发布'}
          </Button>
          <Button onClick={onPreview} disabled={isPreviewing} variant="outline" className="border-green-600 text-green-400 hover:bg-green-600/10 transition-all">
            <Tag className="w-4 h-4 mr-2" />
            {isPreviewing ? '预览中...' : '预览'}
          </Button>
          <Button onClick={onCancel} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white transition-all">
            取消
          </Button>
        </div>

        {/* 状态信息 */}
        <div className="flex flex-wrap gap-4 text-sm text-slate-400 pt-4 border-t border-slate-700">
          {storyData.read_time && <span className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              预计阅读时间：{storyData.read_time}
            </span>}
          {storyData.tags && storyData.tags.length > 0 && <span className="flex items-center">
              <Tag className="w-4 h-4 mr-1" />
              已添加 {storyData.tags.length} 个标签
            </span>}
          {storyData.location && <span className="flex items-center">
              <MapPin className="w-4 h-4 mr-1" />
              发生地点：{storyData.location}
            </span>}
          {storyData.date && <span className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              时间时期：{storyData.date}
            </span>}
        </div>
      </div>
    </div>;
}