// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Button } from '@/components/ui';
// @ts-ignore;
import { Upload as UploadIcon, X, Loader2, Image } from 'lucide-react';

export function ImageUpload({
  image,
  onImageUpload,
  onRemoveImage,
  uploadingImage,
  className = ''
}) {
  return <div className={className}>
      <label className="block text-sm font-medium text-gray-300 mb-2">
        <Image className="inline w-4 h-4 mr-1" />
        配图（可选）
      </label>
      
      {/* 已上传图片预览 */}
      {image && <div className="mb-4">
          <div className="relative inline-block">
            <img src={image} alt="已上传的配图" className="w-32 h-32 object-cover rounded-lg border border-gray-600" />
            <button type="button" onClick={onRemoveImage} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>}

      {/* 上传按钮 */}
      <div className="flex items-center gap-4">
        <label className="cursor-pointer">
          <input type="file" accept="image/*" onChange={onImageUpload} className="hidden" disabled={uploadingImage} />
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {uploadingImage ? <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>上传中...</span>
              </> : <>
                <UploadIcon className="w-4 h-4" />
                <span>选择图片</span>
              </>}
          </div>
        </label>
        <span className="text-sm text-gray-400">支持 JPG、PNG、GIF 格式，最大 5MB</span>
      </div>
    </div>;
}