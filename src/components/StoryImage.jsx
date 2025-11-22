// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Button } from '@/components/ui';
// @ts-ignore;
import { Image as ImageIcon, AlertCircle, Upload, X, Loader2, ZoomIn } from 'lucide-react';
// @ts-ignore;
import { cn } from '@/lib/utils';

export function StoryImage({
  src,
  alt,
  className,
  onRemove,
  onUpload,
  uploading = false,
  showActions = true,
  size = 'md',
  rounded = 'lg'
}) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-32 h-32',
    lg: 'w-48 h-48',
    xl: 'w-64 h-64',
    full: 'w-full h-full',
    aspect: 'w-full aspect-video'
  };
  const roundedClasses = {
    none: '',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    full: 'rounded-full'
  };
  if (imageError || !src) {
    return <div className={cn("flex items-center justify-center bg-slate-700/50 border-2 border-dashed border-slate-600", sizeClasses[size], roundedClasses[rounded], className)}>
        <div className="text-center">
          <ImageIcon className="w-8 h-8 text-slate-500 mx-auto mb-2" />
          <p className="text-slate-400 text-sm">暂无图片</p>
        </div>
      </div>;
  }
  return <>
    <div className={cn("relative overflow-hidden", sizeClasses[size], roundedClasses[rounded], className)}>
      {!imageLoaded && <div className="absolute inset-0 bg-slate-700/50 animate-pulse flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-slate-500 animate-spin" />
        </div>}
      <img src={src} alt={alt || '故事图片'} className={cn("w-full h-full object-cover transition-all duration-300", imageLoaded ? "opacity-100" : "opacity-0", "cursor-pointer hover:scale-105")} onLoad={() => setImageLoaded(true)} onError={() => setImageError(true)} onClick={() => setIsZoomed(true)} />
      
      {/* 悬停覆盖层 */}
      {showActions && imageLoaded && <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="flex space-x-2">
            <Button onClick={() => setIsZoomed(true)} variant="outline" size="sm" className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30">
              <ZoomIn className="w-4 h-4" />
            </Button>
            {onUpload && <Button onClick={onUpload} disabled={uploading} variant="outline" size="sm" className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30">
                <Upload className="w-4 h-4 mr-1" />
                {uploading ? '上传中...' : '更换'}
              </Button>}
            {onRemove && <Button onClick={onRemove} variant="outline" size="sm" className="bg-red-500/20 backdrop-blur-sm border-red-500/30 text-red-400 hover:bg-red-500/30">
                <X className="w-4 h-4" />
              </Button>}
          </div>
        </div>}
      
      {/* 加载状态指示器 */}
      {uploading && <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="text-center text-white">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
            <p className="text-sm">上传中...</p>
          </div>
        </div>}
    </div>
    
    {/* 放大查看模态框 */}
    {isZoomed && <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setIsZoomed(false)}>
        <div className="relative max-w-4xl max-h-full">
          <img src={src} alt={alt || '故事图片'} className="max-w-full max-h-full object-contain rounded-lg" />
          <Button onClick={() => setIsZoomed(false)} variant="ghost" size="sm" className="absolute top-4 right-4 bg-black/50 text-white hover:bg-black/70">
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>}
  </>;
}

// 图片上传组件
export function ImageUpload({
  value,
  onChange,
  onError,
  className,
  maxSize = 5 * 1024 * 1024,
  // 5MB
  accept = "image/*",
  showPreview = true,
  multiple = false
}) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(value || '');
  const [dragOver, setDragOver] = useState(false);
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
  const handleDragOver = e => {
    e.preventDefault();
    setDragOver(true);
  };
  const handleDragLeave = e => {
    e.preventDefault();
    setDragOver(false);
  };
  const handleDrop = e => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      const fakeEvent = {
        target: {
          files: [file]
        }
      };
      handleFileChange(fakeEvent);
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
      {preview && showPreview ? <div className="space-y-2">
          <StoryImage src={preview} alt="图片预览" className="w-full h-64" onRemove={handleRemove} onUpload={() => document.querySelector('input[type="file"]')?.click()} uploading={uploading} />
        </div> : <div className={cn("border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300", dragOver ? "border-red-500 bg-red-500/5" : "border-slate-600 hover:border-red-500/50")} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
          <ImageIcon className="w-12 h-12 text-slate-500 mx-auto mb-4" />
          <p className="text-slate-400 mb-4">
            {dragOver ? '释放以上传图片' : '点击或拖拽上传封面图片'}
          </p>
          <Button onClick={() => document.querySelector('input[type="file"]')?.click()} disabled={uploading} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white transition-all duration-300 transform hover:scale-105 button-press">
            <Upload className="w-4 h-4 mr-2" />
            {uploading ? '上传中...' : '选择图片'}
          </Button>
          <p className="text-xs text-slate-500 mt-2">
            支持 JPG、PNG、WEBP 格式，大小不超过 {Math.round(maxSize / 1024 / 1024)}MB
          </p>
        </div>}
      
      {/* 隐藏的文件输入 */}
      <input type="file" accept={accept} onChange={handleFileChange} multiple={multiple} className="hidden" />
    </div>;
}

// 图片画廊组件
export function ImageGallery({
  images = [],
  onImageSelect,
  selectedImage,
  className
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleImageClick = (image, index) => {
    setCurrentIndex(index);
    setIsModalOpen(true);
    if (onImageSelect) {
      onImageSelect(image);
    }
  };
  const nextImage = () => {
    setCurrentIndex(prev => (prev + 1) % images.length);
  };
  const prevImage = () => {
    setCurrentIndex(prev => (prev - 1 + images.length) % images.length);
  };
  return <>
    <div className={cn("grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4", className)}>
      {images.map((image, index) => <div key={index} className={cn("relative aspect-square overflow-hidden rounded-lg cursor-pointer transition-all duration-300 hover:scale-105", selectedImage === image && "ring-2 ring-red-500")} onClick={() => handleImageClick(image, index)}>
          <img src={image} alt={`图片 ${index + 1}`} className="w-full h-full object-cover" />
          {selectedImage === image && <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
              <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>}
        </div>)}
    </div>
    
    {/* 图片查看模态框 */}
    {isModalOpen && images.length > 0 && <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setIsModalOpen(false)}>
        <div className="relative max-w-4xl max-h-full">
          <img src={images[currentIndex]} alt={`图片 ${currentIndex + 1}`} className="max-w-full max-h-full object-contain rounded-lg" />
          
          {/* 导航按钮 */}
          {images.length > 1 && <>
            <Button onClick={e => {
            e.stopPropagation();
            prevImage();
          }} variant="ghost" size="sm" className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white hover:bg-black/70">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Button>
            <Button onClick={e => {
            e.stopPropagation();
            nextImage();
          }} variant="ghost" size="sm" className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white hover:bg-black/70">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          </>}
          
          {/* 关闭按钮 */}
          <Button onClick={() => setIsModalOpen(false)} variant="ghost" size="sm" className="absolute top-4 right-4 bg-black/50 text-white hover:bg-black/70">
            <X className="w-5 h-5" />
          </Button>
          
          {/* 图片指示器 */}
          {images.length > 1 && <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {images.map((_, index) => <button key={index} onClick={e => {
            e.stopPropagation();
            setCurrentIndex(index);
          }} className={cn("w-2 h-2 rounded-full transition-all duration-200", index === currentIndex ? "bg-white" : "bg-white/50")}></button>)}
            </div>}
        </div>
      </div>}
  </>;
}