// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Button } from '@/components/ui';
// @ts-ignore;
import { Plus, X, Tag } from 'lucide-react';

export function TagManager({
  tags,
  newTag,
  onNewTagChange,
  onAddTag,
  onRemoveTag,
  onKeyPress,
  className = ''
}) {
  return <div className={className}>
      <label className="block text-sm font-medium text-gray-300 mb-2">
        <Tag className="inline w-4 h-4 mr-1" />
        标签
      </label>
      <div className="flex gap-2 mb-3">
        <input type="text" value={newTag} onChange={onNewTagChange} onKeyPress={onKeyPress} className="flex-1 px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent" placeholder="输入标签后按回车添加" />
        <Button type="button" onClick={onAddTag} variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, index) => <span key={index} className="inline-flex items-center gap-1 px-3 py-1 bg-red-900/30 text-red-300 rounded-full text-sm">
            {tag}
            <button type="button" onClick={() => onRemoveTag(tag)} className="hover:text-red-100">
              <X className="w-3 h-3" />
            </button>
          </span>)}
      </div>
    </div>;
}