// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Button } from '@/components/ui';
// @ts-ignore;
import { Save, Send, Eye, ArrowLeft, Loader2 } from 'lucide-react';
// @ts-ignore;
import { cn } from '@/lib/utils';

export function StoryActions({
  isDraft,
  saving,
  publishing,
  previewing,
  lastSaved,
  onSaveDraft,
  onPublish,
  onPreview,
  onGoBack,
  className
}) {
  return <div className={cn("flex flex-col sm:flex-row gap-3 pt-6 border-t border-slate-700", className)}>
      {/* 主要操作按钮 */}
      <div className="flex-1 flex flex-col sm:flex-row gap-3">
        <Button onClick={onSaveDraft} disabled={saving || publishing} variant="outline" className="border-blue-600 text-blue-400 hover:bg-blue-600/10 transition-all duration-300 transform hover:scale-105 button-press mobile-button">
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          {saving ? '保存中...' : '保存草稿'}
        </Button>
        
        <Button onClick={onPublish} disabled={saving || publishing} className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 shadow-lg hover:shadow-red-500/25 transition-all duration-300 transform hover:scale-105 button-press mobile-button">
          {publishing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
          {publishing ? '发布中...' : '发布'}
        </Button>
      </div>
      
      {/* 次要操作按钮 */}
      <div className="flex gap-3">
        <Button onClick={onPreview} disabled={previewing} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white transition-all duration-300 transform hover:scale-105 button-press mobile-button">
          {previewing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Eye className="w-4 h-4 mr-2" />}
          {previewing ? '预览中...' : '预览'}
        </Button>
        
        <Button onClick={onGoBack} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white transition-all duration-300 transform hover:scale-105 button-press mobile-button">
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回
        </Button>
      </div>
      
      {/* 保存状态显示 */}
      {lastSaved && <div className="text-xs text-slate-400 text-center sm:text-right bg-slate-700/30 px-3 py-2 rounded-lg">
          最后保存: {lastSaved.toLocaleTimeString()}
        </div>}
    </div>;
}

// 移动端优化的故事操作按钮
export function MobileStoryActions({
  isDraft,
  saving,
  publishing,
  previewing,
  lastSaved,
  onSaveDraft,
  onPublish,
  onPreview,
  onGoBack,
  className
}) {
  return <div className={cn("space-y-3 pt-4 border-t border-slate-700", className)}>
      {/* 主要操作按钮 - 移动端优化 */}
      <div className="grid grid-cols-1 gap-3">
        <Button onClick={onPublish} disabled={saving || publishing} className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 shadow-lg hover:shadow-red-500/25 transition-all duration-300 transform hover:scale-105 button-press mobile-button">
          {publishing ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Send className="w-5 h-5 mr-2" />}
          {publishing ? '发布中...' : '发布故事'}
        </Button>
        
        <Button onClick={onSaveDraft} disabled={saving || publishing} variant="outline" className="w-full border-blue-600 text-blue-400 hover:bg-blue-600/10 transition-all duration-300 transform hover:scale-105 button-press mobile-button">
          {saving ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
          {saving ? '保存中...' : '保存草稿'}
        </Button>
      </div>
      
      {/* 次要操作按钮 */}
      <div className="grid grid-cols-2 gap-3">
        <Button onClick={onPreview} disabled={previewing} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white transition-all duration-300 transform hover:scale-105 button-press mobile-button">
          {previewing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Eye className="w-4 h-4 mr-2" />}
          {previewing ? '预览中...' : '预览'}
        </Button>
        
        <Button onClick={onGoBack} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white transition-all duration-300 transform hover:scale-105 button-press mobile-button">
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回
        </Button>
      </div>
      
      {/* 保存状态显示 */}
      {lastSaved && <div className="text-xs text-slate-400 text-center bg-slate-700/30 px-3 py-2 rounded-lg">
          最后保存: {lastSaved.toLocaleTimeString()}
        </div>}
    </div>;
}

// 桌面端优化的故事操作按钮
export function DesktopStoryActions({
  isDraft,
  saving,
  publishing,
  previewing,
  lastSaved,
  onSaveDraft,
  onPublish,
  onPreview,
  onGoBack,
  className
}) {
  return <div className={cn("flex items-center justify-between pt-6 border-t border-slate-700", className)}>
      {/* 左侧操作按钮 */}
      <div className="flex items-center space-x-4">
        <Button onClick={onSaveDraft} disabled={saving || publishing} variant="outline" className="border-blue-600 text-blue-400 hover:bg-blue-600/10 transition-all duration-300 transform hover:scale-105 button-press">
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          {saving ? '保存中...' : '保存草稿'}
        </Button>
        
        <Button onClick={onPreview} disabled={previewing} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white transition-all duration-300 transform hover:scale-105 button-press">
          {previewing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Eye className="w-4 h-4 mr-2" />}
          {previewing ? '预览中...' : '预览'}
        </Button>
      </div>
      
      {/* 右侧操作按钮 */}
      <div className="flex items-center space-x-4">
        {/* 保存状态显示 */}
        {lastSaved && <div className="text-sm text-slate-400 bg-slate-700/30 px-3 py-2 rounded-lg">
            最后保存: {lastSaved.toLocaleTimeString()}
          </div>}
        
        <Button onClick={onGoBack} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white transition-all duration-300 transform hover:scale-105 button-press">
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回
        </Button>
        
        <Button onClick={onPublish} disabled={saving || publishing} className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 shadow-lg hover:shadow-red-500/25 transition-all duration-300 transform hover:scale-105 button-press">
          {publishing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
          {publishing ? '发布中...' : '发布'}
        </Button>
      </div>
    </div>;
}