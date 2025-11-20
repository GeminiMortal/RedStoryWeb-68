// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Button } from '@/components/ui';
// @ts-ignore;
import { Save, AlertCircle } from 'lucide-react';

export function DraftIndicator({
  hasDraft,
  lastSaved,
  onClearDraft,
  className = ''
}) {
  const formatLastSaved = dateString => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (minutes < 1) return '刚刚保存';
    if (minutes < 60) return `${minutes}分钟前保存`;
    if (hours < 24) return `${hours}小时前保存`;
    return `${days}天前保存`;
  };
  if (!hasDraft) return null;
  return <div className={`bg-blue-900/30 border border-blue-600 text-blue-200 px-4 py-3 rounded-lg flex items-center justify-between ${className}`}>
      <div className="flex items-center gap-2">
        <AlertCircle className="w-4 h-4" />
        <span>已恢复暂存的草稿内容</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-blue-300">
          {formatLastSaved(lastSaved)}
        </span>
        <Button onClick={onClearDraft} variant="ghost" size="sm" className="text-blue-300 hover:text-blue-100">
          清除草稿
        </Button>
      </div>
    </div>;
}