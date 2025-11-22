// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { AlertCircle, CheckCircle } from 'lucide-react';
// @ts-ignore;
import { cn } from '@/lib/utils';

export function FieldValidation({
  fieldName,
  value,
  error,
  touched,
  showSuccess = true,
  className
}) {
  // 如果字段未被触摸或不显示成功状态，则不显示任何内容
  if (!touched || !error && !showSuccess) {
    return null;
  }
  const hasError = !!error;
  const hasSuccess = !hasError && showSuccess && touched;
  return <div className={cn("flex items-center space-x-1 text-xs mt-1", className)}>
      {hasError && <>
          <AlertCircle className="w-3 h-3 text-red-400" />
          <span className="text-red-400">{error}</span>
        </>}
      {hasSuccess && <>
          <CheckCircle className="w-3 h-3 text-green-400" />
          <span className="text-green-400">格式正确</span>
        </>}
    </div>;
}

// 输入框包装器，集成验证显示
export function ValidatedInput({
  label,
  required = false,
  fieldName,
  value,
  onChange,
  onBlur,
  error,
  touched,
  placeholder,
  type = 'text',
  className,
  children,
  ...props
}) {
  const hasError = touched && error;
  const hasSuccess = touched && !error && value;
  return <div className={cn("space-y-1", className)}>
      {label && <label className="block text-sm font-medium text-slate-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>}
      
      <div className="relative">
        {children || <input type={type} value={value} onChange={onChange} onBlur={onBlur} placeholder={placeholder} className={cn("w-full px-4 py-3 bg-slate-700/50 border rounded-xl text-white placeholder-slate-400 transition-all duration-300 touch-target", "focus:outline-none focus:ring-2 focus:ring-red-500/20", hasError ? "border-red-500 focus:border-red-500 shadow-red-500/20 shadow-lg" : hasSuccess ? "border-green-500 focus:border-green-500 shadow-green-500/20 shadow-lg" : "border-slate-600 focus:border-red-500 hover:border-slate-500")} {...props} />}
      </div>
      
      <FieldValidation fieldName={fieldName} value={value} error={error} touched={touched} />
    </div>;
}

// 文本域包装器
export function ValidatedTextarea({
  label,
  required = false,
  fieldName,
  value,
  onChange,
  onBlur,
  error,
  touched,
  placeholder,
  rows = 4,
  className,
  showCharCount = false,
  maxLength = 5000,
  ...props
}) {
  const hasError = touched && error;
  const hasSuccess = touched && !error && value;
  const charCount = value ? value.length : 0;
  const isNearLimit = charCount > maxLength * 0.9;
  return <div className={cn("space-y-1", className)}>
      {label && <label className="block text-sm font-medium text-slate-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>}
      
      <div className="relative">
        <textarea value={value} onChange={onChange} onBlur={onBlur} placeholder={placeholder} rows={rows} maxLength={maxLength} className={cn("w-full px-4 py-3 bg-slate-700/50 border rounded-xl text-white placeholder-slate-400 transition-all duration-300 resize-none touch-target", "focus:outline-none focus:ring-2 focus:ring-red-500/20", hasError ? "border-red-500 focus:border-red-500 shadow-red-500/20 shadow-lg" : hasSuccess ? "border-green-500 focus:border-green-500 shadow-green-500/20 shadow-lg" : "border-slate-600 focus:border-red-500 hover:border-slate-500")} {...props} />
        
        {showCharCount && <div className={cn("absolute bottom-2 right-2 text-xs px-2 py-1 rounded-md", isNearLimit ? "text-red-400 bg-red-500/10" : "text-slate-400 bg-slate-700/50")}>
            {charCount}/{maxLength}
          </div>}
      </div>
      
      <FieldValidation fieldName={fieldName} value={value} error={error} touched={touched} />
    </div>;
}

// 标签输入组件
export function ValidatedTagInput({
  label,
  required = false,
  fieldName,
  value = [],
  onChange,
  onBlur,
  error,
  touched,
  placeholder = "输入标签后按回车添加",
  maxTags = 10,
  className
}) {
  const hasError = touched && error;
  const hasSuccess = touched && !error && value.length > 0;
  return <div className={cn("space-y-2", className)}>
      {label && <label className="block text-sm font-medium text-slate-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>}
      
      {/* 标签显示 */}
      {value.length > 0 && <div className="flex flex-wrap gap-2">
          {value.map((tag, index) => <span key={index} className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm flex items-center gap-1 hover:bg-red-500/30 transition-colors">
              {tag}
              <button type="button" onClick={() => {
          const newTags = value.filter((_, i) => i !== index);
          onChange({
            target: {
              value: newTags
            }
          });
        }} className="hover:text-red-300 transition-colors touch-target">
                ×
              </button>
            </span>)}
        </div>}
      
      {/* 输入框 */}
      <input type="text" value={Array.isArray(value) ? '' : value} onChange={e => {
      if (e.target.value === '' && Array.isArray(value)) return;
      if (e.target.value.includes(',')) {
        const newTags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag && !value.includes(tag)).slice(0, maxTags - value.length);
        if (newTags.length > 0) {
          onChange({
            target: {
              value: [...value, ...newTags]
            }
          });
        }
      }
    }} onKeyPress={e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const tag = e.target.value.trim();
        if (tag && !value.includes(tag) && value.length < maxTags) {
          onChange({
            target: {
              value: [...value, tag]
            }
          });
          e.target.value = '';
        }
      }
    }} onBlur={onBlur} placeholder={placeholder} disabled={value.length >= maxTags} className={cn("w-full px-4 py-2 bg-slate-700/50 border rounded-lg text-white placeholder-slate-400 transition-all duration-300 touch-target", "focus:outline-none focus:ring-2 focus:ring-red-500/20", hasError ? "border-red-500 focus:border-red-500 shadow-red-500/20 shadow-lg" : hasSuccess ? "border-green-500 focus:border-green-500 shadow-green-500/20 shadow-lg" : "border-slate-600 focus:border-red-500 hover:border-slate-500", value.length >= maxTags && "opacity-50 cursor-not-allowed")} />
      
      <FieldValidation fieldName={fieldName} value={value} error={error} touched={touched} />
      
      {value.length >= maxTags && <p className="text-xs text-yellow-400 bg-yellow-500/10 px-2 py-1 rounded-md">
          标签数量已达上限 ({maxTags}个)
        </p>}
    </div>;
}