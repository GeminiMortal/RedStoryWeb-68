// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Button } from '@/components/ui';
// @ts-ignore;
import { CheckSquare, Square, Send, Trash2, Loader2 } from 'lucide-react';
// @ts-ignore;
import { cn } from '@/lib/utils';

export function BatchOperations({
  selectedCount,
  totalCount,
  isAllSelected,
  onSelectAll,
  onBatchPublish,
  onBatchDelete,
  isProcessing = false
}) {
  if (totalCount === 0) {
    return null;
  }
  return <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl font-bold text-white flex items-center">
        草稿箱 ({totalCount})
      </h2>
      {totalCount > 0 && <div className="flex items-center space-x-2">
          <span className="text-sm text-slate-400">
            已选择 {selectedCount} 个
          </span>
          <Button onClick={onSelectAll} variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-700">
            {isAllSelected ? <CheckSquare className="w-4 h-4 mr-2" /> : <Square className="w-4 h-4 mr-2" />}
            {isAllSelected ? '取消全选' : '全选'}
          </Button>
          {selectedCount > 0 && <>
              <Button onClick={onBatchPublish} disabled={isProcessing} variant="outline" size="sm" className="border-green-600 text-green-400 hover:bg-green-600/10">
                {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                批量发布
              </Button>
              <Button onClick={onBatchDelete} disabled={isProcessing} variant="outline" size="sm" className="border-red-600 text-red-400 hover:bg-red-600/10">
                {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                批量删除
              </Button>
            </>}
        </div>}
    </div>;
}