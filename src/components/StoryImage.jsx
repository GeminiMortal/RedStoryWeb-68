// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Button } from '@/components/ui';
// @ts-ignore;
import { Image as ImageIcon, Upload, X, ZoomIn, ZoomOut, RotateCw, Download, Eye, Loader2 } from 'lucide-react';
// @ts-ignore;
import { cn } from '@/lib/utils';

export function StoryImage({
  src,
  alt = '',
  className,
  onChange,
  onRemove,
  editable = false,
  showControls = true,
  aspectRatio = 'video',
  // 'video', 'square', 'auto'
  maxSize = 5 * 1024 * 1024,
  // 5MB
  accept = 'image/*'
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(src);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  // 处理图片上传
  const handleImageUpload = async event => {
    const file = event.target.files[0];
    if (!file) return;

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      setError('请选择图片文件');
      return;
    }

    // 验证文件大小
    if (file.size > maxSize) {
      setError(`图片大小不能超过 ${Math.round(maxSize / 1024 / 1024)}MB`);
      return;
    }
    try {
      setLoading(true);
      setError('');

      // 创建预览
      const reader = new FileReader();
      reader.onload = e => {
        setPreview(e.target.result);
      };
      reader.readAsDataURL(file);

      // 如果有 onChange 回调，传递文件
      if (onChange) {
        await onChange(file);
      }
    } catch (error) {
      console.error('图片上传失败:', error);
      setError('图片上传失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 移除图片
  const handleRemove = () => {
    setPreview('');
    setError('');
    setZoom(1);
    setRotation(0);
    if (onRemove) {
      onRemove();
    }
  };

  // 缩放控制
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3));
  };
  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.5));
  };

  // 旋转控制
  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  // 下载图片
  const handleDownload = () => {
    if (!preview) return;
    const link = document.createElement('a');
    link.href = preview;
    link.download = `story-image-${Date.now()}.jpg`;
    link.click();
  };

  // 获取宽高比样式
  const getAspectRatioStyle = () => {
    switch (aspectRatio) {
      case 'video':
        return 'aspect-video';
      case 'square':
        return 'aspect-square';
      case 'auto':
      default:
        return '';
    }
  };

  // 如果没有图片且不可编辑，显示占位符
  if (!preview && !editable) {
    return <div className={cn("bg-slate-700/50 border-2 border-dashed border-slate-600 rounded-xl flex items-center justify-center", getAspectRatioStyle(), className)}>
        <div className="text-center p-8">
          <ImageIcon className="w-12 h-12 text-slate-500 mx-auto mb-4" />
          <p className="text-slate-400 text-sm">暂无图片</p>
        </div>
      </div>;
  }

  // 如果没有图片但可编辑，显示上传区域
  if (!preview && editable) {
    return <div className={cn("bg-slate-700/50 border-2 border-dashed border-slate-600 rounded-xl flex items-center justify-center hover:border-red-500/50 transition-colors duration-300", getAspectRatioStyle(), className)}>
        <div className="text-center p-8">
          <input type="file" accept={accept} onChange={handleImageUpload} className="hidden" id="image-upload" disabled={loading} />
          <label htmlFor="image-upload" className="cursor-pointer">
            {loading ? <Loader2 className="w-12 h-12 text-slate-500 mx-auto mb-4 animate-spin" /> : <Upload className="w-12 h-12 text-slate-500 mx-auto mb-4" />}
            <p className="text-slate-400 text-sm mb-2">
              {loading ? '上传中...' : '点击上传图片'}
            </p>
            <p className="text-slate-500 text-xs">
              支持 JPG、PNG、WEBP 格式，最大 {Math.round(maxSize / 1024 / 1024)}MB
            </p>
          </label>
        </div>
      </div>;
  }

  // 显示图片
  return <div className={cn("relative overflow-hidden rounded-xl bg-slate-800", getAspectRatioStyle(), className)}>
      {/* 图片容器 */}
      <div className="relative w-full h-full">
        <img src={preview} alt={alt} className="w-full h-full object-cover transition-transform duration-300" style={{
        transform: `scale(${zoom}) rotate(${rotation}deg)`
      }} onError={() => setError('图片加载失败')} />
        
        {/* 加载遮罩 */}
        {loading && <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>}
      </div>

      {/* 错误提示 */}
      {error && <div className="absolute inset-0 bg-red-900/50 flex items-center justify-center">
          <div className="text-center text-white">
            <X className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm">{error}</p>
          </div>
        </div>}

      {/* 控制按钮 */}
      {showControls && <div className="absolute top-2 right-2 flex space-x-1">
          <Button onClick={handleZoomIn} size="sm" variant="ghost" className="bg-black/50 hover:bg-black/70 text-white p-1">
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button onClick={handleZoomOut} size="sm" variant="ghost" className="bg-black/50 hover:bg-black/70 text-white p-1">
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button onClick={handleRotate} size="sm" variant="ghost" className="bg-black/50 hover:bg-black/70 text-white p-1">
            <RotateCw className="w-4 h-4" />
          </Button>
          <Button onClick={handleDownload} size="sm" variant="ghost" className="bg-black/50 hover:bg-black/70 text-white p-1">
            <Download className="w-4 h-4" />
          </Button>
          {editable && <Button onClick={handleRemove} size="sm" variant="ghost" className="bg-red-500/50 hover:bg-red-600/70 text-white p-1">
              <X className="w-4 h-4" />
            </Button>}
        </div>}

      {/* 缩放指示器 */}
      {zoom !== 1 && <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
          {Math.round(zoom * 100)}%
        </div>}

      {/* 全屏查看按钮 */}
      {showControls && <Button onClick={() => {
      // 可以实现全屏查看功能
      const modal = document.createElement('div');
      modal.className = 'fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4';
      modal.innerHTML = `
          <div class="relative max-w-full max-h-full">
            <img src="${preview}" alt="${alt}" class="max-w-full max-h-full object-contain" />
            <button class="absolute top-4 right-4 text-white hover:text-red-400 text-2xl">&times;</button>
          </div>
        `;
      modal.addEventListener('click', e => {
        if (e.target === modal || e.target.tagName === 'BUTTON') {
          document.body.removeChild(modal);
        }
      });
      document.body.appendChild(modal);
    }} size="sm" variant="ghost" className="absolute bottom-2 right-2 bg-black/50 hover:bg-black/70 text-white p-1">
          <Eye className="w-4 h-4" />
        </Button>}
    </div>;
}

// 图片网格组件
export function ImageGrid({
  images,
  onImageClick,
  onImageRemove,
  editable = false,
  maxImages = 9,
  className
}) {
  const displayImages = images.slice(0, maxImages);
  const remainingCount = images.length - maxImages;
  return <div className={cn("grid grid-cols-3 gap-2", className)}>
      {displayImages.map((image, index) => <div key={index} className="relative aspect-square">
          <StoryImage src={image} alt={`图片 ${index + 1}`} showControls={false} className="w-full h-full rounded-lg" />
          {editable && <Button onClick={() => onImageRemove(index)} size="sm" variant="ghost" className="absolute top-1 right-1 bg-red-500/80 hover:bg-red-600 text-white p-1 rounded-full">
              <X className="w-3 h-3" />
            </Button>}
          <button onClick={() => onImageClick(index)} className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors duration-200 rounded-lg" />
        </div>)}
      
      {/* 更多图片指示器 */}
      {remainingCount > 0 && <div className="relative aspect-square">
          <div className="w-full h-full bg-slate-700 rounded-lg flex items-center justify-center">
            <span className="text-white text-lg font-bold">+{remainingCount}</span>
          </div>
        </div>}
    </div>;
}