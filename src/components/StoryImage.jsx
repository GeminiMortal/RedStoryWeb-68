// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Button } from '@/components/ui';
// @ts-ignore;
import { Image as ImageIcon, AlertCircle } from 'lucide-react';
// @ts-ignore;
import { cn } from '@/lib/utils';

export function StoryImage({
  src,
  alt,
  className,
  onRemove,
  onUpload,
  uploading = false
}) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  if (imageError || !src) {
    return <div className={cn("flex items-center justify-center bg-slate-700/50 rounded-lg border-2 border-dashed border-slate-600", className)}>
        <div className="text-center">
          <ImageIcon className="w-8 h-8 text-slate-500 mx-auto mb-2" />
          <p className="text-slate-400 text-sm">暂无图片</p>
        </div>
      </div>;
  }
  return <div className={cn("relative overflow-hidden rounded-lg", className)}>
      {!imageLoaded && <div className="absolute inset-0 bg-slate-700/50 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-slate-500 border-t-transparent rounded-full animate-spin"></div>
        </div>}
      <img src={src} alt={alt || '故事图片'} className={cn("w-full h-full object-cover transition-opacity duration-300", imageLoaded ? "opacity-100" : "opacity-0")} onLoad={() => setImageLoaded(true)} onError={() => setImageError(true)} />
      
      {/* 操作按钮覆盖层 */}
      <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
        <div className="flex space-x-2">
          {onUpload && <Button onClick={onUpload} disabled={uploading} variant="outline" size="sm" className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30">
              <ImageIcon className="w-4 h-4 mr-1" />
              {uploading ? '上传中...' : '更换'}
            </Button>}
          {onRemove && <Button onClick={onRemove} variant="outline" size="sm" className="bg-red-500/20 backdrop-blur-sm border-red-500/30 text-red-400 hover:bg-red-500/30">
              <AlertCircle className="w-4 h-4 mr-1" />
              移除
            </Button>}
        </div>
      </div>
    </div>;
}

// 图片上传组件
export function ImageUpload({
  value,
  onChange,
  onError,
  className,
  maxSize = 5 * 1024 * 1024,
  // 5MB
  accept = "image/*"
}) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(value || '');
  const handleFileChange = async event => {
    const file = event.target.files[0];
    if (!file) return;

    // 检查文件类型
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      onError && onError('仅支持 JPG、PNG、WEBP 格式的图片');
      return;
    }

    // 检查文件大小
    if (file.size > maxSize) {
      onError && onError(`图片大小不能超过 ${Math.round(maxSize / 1024 / 1024)}MB`);
      return;
    }
    try {
      setUploading(true);

      // 创建预览
      const reader = new FileReader();
      reader.onload = e => {
        const imageUrl = e.target.result;
        setPreview(imageUrl);
        onChange && onChange(imageUrl);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('图片上传失败:', error);
      onError && onError('图片上传失败，请重试');
    } finally {
      setUploading(false);
    }
  };
  const handleRemove = () => {
    setPreview('');
    onChange && onChange('');
    // 清除文件输入
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) {
      fileInput.value = '';
    }
  };
  return <div className={cn("space-y-4", className)}>
      {preview ? <div className="space-y-2">
          <StoryImage src={preview} alt="图片预览" className="w-full h-64" onRemove={handleRemove} onUpload={() => document.querySelector('input[type="file"]')?.click()} uploading={uploading} />
        </div> : <div className="border-2 border-dashed border-slate-600 rounded-xl p-8 text-center hover:border-red-500/50 transition-colors duration-300">
          <ImageIcon className="w-12 h-12 text-slate-500 mx-auto mb-4" />
          <p className="text-slate-400 mb-4">点击或拖拽上传封面图片</p>
          <Button onClick={() => document.querySelector('input[type="file"]')?.click()} disabled={uploading} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white transition-all">
            <ImageIcon className="w-4 h-4 mr-2" />
            {uploading ? '上传中...' : '选择图片'}
          </Button>
          <p className="text-xs text-slate-500 mt-2">
            支持 JPG、PNG、WEBP 格式，大小不超过 {Math.round(maxSize / 1024 / 1024)}MB
          </p>
        </div>}
      
      {/* 隐藏的文件输入 */}
      <input type="file" accept={accept} onChange={handleFileChange} className="hidden" />
    </div>;
}