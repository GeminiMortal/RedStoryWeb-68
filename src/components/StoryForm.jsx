
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
          
          <ValidatedInput label="发生地点" fieldName="location" value={storyData.location} onChange={e => onFieldChange('location', e