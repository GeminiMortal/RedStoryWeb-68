// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Input, Button } from '@/components/ui';
// @ts-ignore;
import { Plus, X } from 'lucide-react';

export function TagManager({
  tags,
  onTagsChange
}) {
  const [newTag, setNewTag] = useState('');
  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      onTagsChange([...tags, newTag.trim()]);
      setNewTag('');
    }
  };
  const removeTag = tagToRemove => {
    onTagsChange(tags.filter(tag => tag !== tagToRemove));
  };
  return <div>
      <div className="flex gap-2 mb-2">
        <Input value={newTag} onChange={e => setNewTag(e.target.value)} placeholder="添加标签" className="bg-gray-800 border-gray-700 text-white placeholder-gray-500" onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addTag())} />
        <Button type="button" onClick={addTag} variant="outline" className="border-gray-600 text-gray-300">
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, index) => <span key={index} className="inline-flex items-center gap-1 px-3 py-1 bg-red-900/30 text-red-300 text-sm rounded-full border border-red-800/50">
            {tag}
            <button type="button" onClick={() => removeTag(tag)} className="text-red-400 hover:text-red-300">
              <X className="w-3 h-3" />
            </button>
          </span>)}
      </div>
    </div>;
}