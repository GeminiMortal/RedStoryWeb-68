// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Input, Textarea } from '@/components/ui';
// @ts-ignore;
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';
// @ts-ignore;
import { cn } from '@/lib/utils';

// @ts-ignore;
import { FieldValidation, FieldSuccess } from './DataValidation';

// 通用表单字段组件
export const FormField = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder,
  required = false,
  disabled = false,
  validation,
  touched,
  error,
  success,
  icon: Icon,
  className,
  ...props
}) => {
  const hasError = touched && error;
  const hasSuccess = touched && success && !error;
  const showValidation = touched && (error || success);
  const inputClasses = cn("transition-all duration-300", hasError && "border-red-500 focus:border-red-500 focus:ring-red-500/20", hasSuccess && "border-green-500 focus:border-green-500 focus:ring-green-500/20", !hasError && !hasSuccess && "border-slate-600 focus:border-red-500 focus:ring-red-500/20", disabled && "opacity-50 cursor-not-allowed", className);
  const renderInput = () => {
    const commonProps = {
      name,
      value,
      onChange: e => onChange(e.target.value),
      onBlur,
      placeholder,
      disabled,
      className: inputClasses,
      ...props
    };
    if (type === 'textarea') {
      return <Textarea {...commonProps} />;
    }
    return <Input type={type} {...commonProps} />;
  };
  return <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-300">
        {Icon && <Icon className="w-4 h-4 inline mr-1" />}
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      {renderInput()}
      
      {showValidation && <div className="flex items-center">
          {hasError && <FieldValidation fieldName={name} validation={{
        isValid: false,
        message: error
      }} touched={touched} />}
          {hasSuccess && <FieldSuccess fieldName={name} validation={{
        isValid: true,
        message: success
      }} touched={touched} />}
        </div>}
    </div>;
};

// 标签输入组件
export const TagInput = ({
  label,
  name,
  value = [],
  onChange,
  onBlur,
  placeholder = "输入标签后按回车添加",
  required = false,
  disabled = false,
  validation,
  touched,
  maxTags = 10,
  className,
  ...props
}) => {
  const [inputValue, setInputValue] = React.useState('');
  const [inputTouched, setInputTouched] = React.useState(false);
  const handleInputChange = e => {
    setInputValue(e.target.value);
  };
  const handleInputKeyPress = e => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      addTag(inputValue.trim());
    }
  };
  const addTag = tag => {
    if (tag && !value.includes(tag) && value.length < maxTags) {
      onChange([...value, tag]);
      setInputValue('');
    }
  };
  const removeTag = tagToRemove => {
    onChange(value.filter(tag => tag !== tagToRemove));
  };
  const handleBlur = () => {
    setInputTouched(true);
    onBlur();
    if (inputValue.trim()) {
      addTag(inputValue.trim());
    }
  };
  const hasError = touched && validation && !validation.isValid;
  const hasSuccess = touched && validation && validation.isValid && value.length > 0;
  const showValidation = touched && (hasError || hasSuccess);
  return <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-300">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="space-y-3">
        {/* 标签显示 */}
        {value.length > 0 && <div className="flex flex-wrap gap-2">
            {value.map((tag, index) => <span key={index} className="inline-flex items-center px-3 py-1 bg-red-500/20 text-red-400 text-sm rounded-full border border-red-500/30">
                {tag}
                <button type="button" onClick={() => removeTag(tag)} className="ml-2 text-red-400 hover:text-red-300 transition-colors" disabled={disabled}>
                  ×
                </button>
              </span>)}
          </div>}
        
        {/* 输入框 */}
        <Input value={inputValue} onChange={handleInputChange} onKeyPress={handleInputKeyPress} onBlur={handleBlur} placeholder={placeholder} disabled={disabled || value.length >= maxTags} className={cn("transition-all duration-300", hasError && "border-red-500 focus:border-red-500 focus:ring-red-500/20", hasSuccess && "border-green-500 focus:border-green-500 focus:ring-green-500/20", !hasError && !hasSuccess && "border-slate-600 focus:border-red-500 focus:ring-red-500/20", disabled && "opacity-50 cursor-not-allowed")} {...props} />
        
        {/* 验证信息 */}
        {showValidation && <div className="flex items-center">
            {hasError && <FieldValidation fieldName={name} validation={validation} touched={touched} />}
            {hasSuccess && <FieldSuccess fieldName={name} validation={validation} touched={touched} />}
          </div>}
        
        {/* 提示信息 */}
        <div className="text-xs text-slate-500">
          已添加 {value.length}/{maxTags} 个标签
        </div>
      </div>
    </div>;
};

// 图片上传组件
export const ImageUpload = ({
  label,
  name,
  value,
  onChange,
  onBlur,
  required = false,
  disabled = false,
  validation,
  touched,
  maxSize = 5 * 1024 * 1024,
  // 5MB
  allowedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  className,
  ...props
}) => {
  const [dragOver, setDragOver] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const fileInputRef = React.useRef(null);
  const handleFileSelect = file => {
    if (!file) return;

    // 验证文件类型
    if (!allowedFormats.includes(file.type)) {
      onChange(null, {
        error: '不支持的文件格式'
      });
      return;
    }

    // 验证文件大小
    if (file.size > maxSize) {
      onChange(null, {
        error: `文件大小不能超过 ${Math.round(maxSize / 1024 / 1024)}MB`
      });
      return;
    }
    setUploading(true);

    // 模拟上传过程
    const reader = new FileReader();
    reader.onload = e => {
      const result = e.target.result;
      onChange(result, {
        fileName: file.name,
        fileSize: file.size
      });
      setUploading(false);
    };
    reader.onerror = () => {
      onChange(null, {
        error: '文件读取失败'
      });
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };
  const handleFileInputChange = e => {
    const file = e.target.files[0];
    handleFileSelect(file);
  };
  const handleDrop = e => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };
  const handleDragOver = e => {
    e.preventDefault();
    setDragOver(true);
  };
  const handleDragLeave = e => {
    e.preventDefault();
    setDragOver(false);
  };
  const removeImage = () => {
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  const hasError = touched && validation && !validation.isValid;
  const hasSuccess = touched && validation && validation.isValid && value;
  const showValidation = touched && (hasError || hasSuccess);
  return <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-300">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="space-y-3">
        {/* 图片预览 */}
        {value && <div className="relative">
            <img src={value} alt="预览" className="w-full h-48 object-cover rounded-lg border border-slate-600" />
            <button type="button" onClick={removeImage} className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-600 text-white p-1 rounded-full transition-colors" disabled={disabled}>
              ×
            </button>
          </div>}
        
        {/* 上传区域 */}
        {!value && <div className={cn("border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300", dragOver && "border-red-500 bg-red-500/5", !dragOver && "border-slate-600 hover:border-red-500/50", disabled && "opacity-50 cursor-not-allowed")} onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave}>
            {uploading ? <div className="space-y-2">
                <div className="w-8 h-8 border-2 border-slate-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-slate-400">上传中...</p>
              </div> : <>
                <div className="space-y-2">
                  <div className="w-12 h-12 text-slate-500 mx-auto">
                    <svg fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-slate-400">点击或拖拽上传图片</p>
                  <p className="text-xs text-slate-500">
                    支持 {allowedFormats.map(f => f.split('/')[1].toUpperCase()).join(', ')} 格式，大小不超过 {Math.round(maxSize / 1024 / 1024)}MB
                  </p>
                </div>
                <button type="button" onClick={() => fileInputRef.current?.click()} disabled={disabled} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors disabled:opacity-50">
                  选择文件
                </button>
              </>}
          </div>}
        
        {/* 隐藏的文件输入 */}
        <input ref={fileInputRef} type="file" accept={allowedFormats.join(',')} onChange={handleFileInputChange} className="hidden" disabled={disabled} {...props} />
        
        {/* 验证信息 */}
        {showValidation && <div className="flex items-center">
            {hasError && <FieldValidation fieldName={name} validation={validation} touched={touched} />}
            {hasSuccess && <FieldSuccess fieldName={name} validation={validation} touched={touched} />}
          </div>}
      </div>
    </div>;
};