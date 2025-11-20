// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { FileText } from 'lucide-react';

export function StatusIndicator({
  dataSource
}) {
  return <div className={`mb-4 p-3 rounded-lg text-sm ${dataSource === 'draft' ? 'bg-blue-900/20 border border-blue-600/50' : 'bg-green-900/20 border border-green-600/50'}`}>
      <div className="flex items-center gap-2">
        <FileText className="w-4 h-4" />
        <span>
          {dataSource === 'draft' ? '正在编辑草稿版本' : '正在编辑已发布版本'}
        </span>
      </div>
    </div>;
}