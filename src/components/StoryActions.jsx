// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Button } from '@/components/ui';
// @ts-ignore;
import { Save, Send, Eye, ArrowLeft } from 'lucide-react';
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
        <Button onClick={onSaveDraft} disabled={saving || publishing} variant="outline" className="border-blue-600 text-blue-400 hover:bg-blue-600/10 transition-all flex-1">
          <Save className="w-4 h-4 mr-2" />
          {saving ? '保存中...' : '保存草稿'}
        </Button>
        
        <Button onClick={onPublish} disabled={saving || publishing} className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 shadow-lg hover:shadow-red-500/25 transition-all duration-300 transform hover:scale-105 flex-1">
          <Send className="w-4 h-4 mr-2" />
          {publishing ? '发布中...' : '发布'}
        </Button>
      </div>
      
      {/* 次要操作按钮 */}
      <div className="flex gap-3">
        <Button onClick={onPreview} disabled={previewing} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white transition-all">
          <Eye className="w-4 h-4 mr-2" />
          {previewing ? '预览中...' : '预览'}
        </Button>
        
        <Button onClick={onGoBack} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white transition-all">
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回
        </Button>
      </div>
      
      {/* 保存状态显示 */}
      {lastSaved && <div className="text-xs text-slate-400 text-center sm:text-right">
          最后保存: {lastSaved.toLocaleTimeString()}
        </div>}
    </div>;
}