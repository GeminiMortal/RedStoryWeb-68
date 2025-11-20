// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Input } from '@/components/ui';
// @ts-ignore;
import { Upload } from 'lucide-react';

export function ImagePreview({
  image,
  onImageChange
}) {
  return <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">故事图片URL</label>
      <Input value={image} onChange={e => onImageChange(e.target.value)} placeholder="请输入图片URL" className="bg-gray-800 border-gray-700 text-white placeholder-gray-500" />
      {image && <img src={image} alt="预览" className="mt-2 rounded-lg max-h-48 object-cover" />}
    </div>;
}