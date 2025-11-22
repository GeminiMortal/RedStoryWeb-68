// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
// @ts-ignore;
import { cn } from '@/lib/utils';

export function FieldValidation({
  fieldName,
  value,
  error,
  touched,
  showSuccess = true,
  isValidating = false,
  className
}) {
  // 如果字段未被触摸或不显示成功状态，则不显示任何内容
  if (!touched || !error && !showSuccess && !isValidating) {
    return null;
  }
  const hasError = !!error;
  const hasSuccess = !hasError && showSuccess && touched && !isValidating;
  const isValidatingState = isValidating;
  return <div className={cn("flex items-center space-x-1 text-xs mt-2 animate-fade-in", className)}>
      {isValidatingState && <>
          <Loader2 className="w-3 h-3 text-blue-400 animate-spin" />
          <span className="text-blue-400">验证中...</span>
        </>}
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
  onFocus,
  error,
  touched,
  placeholder,
  type = 'text',
  className,
  children,
  isValidating = false,
  showCharCount = false,
  maxLength,
  ...props
}) {
  const hasError = touched && error;
  const hasSuccess = touched && !error && value && !isValidating;
  const charCount = value ? value.length : 0;
  const isNearLimit = maxLength && charCount > maxLength * 0.9;
  return <div className={cn("space-y-2", className)}>
      {label && <label className="block text-sm font-medium text-slate-300 animate-fade-in">
          {label}
          {required && <span className="text-red-500 ml-1 animate-pulse">*</span>}
        </label>}
      
      <div className="relative">
        {children || <input type={type} value={value} onChange={onChange} onBlur={onBlur} onFocus={onFocus} placeholder={placeholder} maxLength={maxLength} className={cn("w-full px-4 py-3 bg-slate-700/50 border rounded-xl text-white placeholder-slate-400", "transition-all duration-300 mobile-input", "focus:outline-none focus:ring-2 focus:ring-red-500/20", "hover:bg-slate-700/70 hover:border-slate-500", hasError ? "border-red-500 focus:border-red-500 shadow-glow-red" : hasSuccess ? "border-green-500 focus:border-green-500 shadow-glow-green" : "border-slate-600 focus:border-red-500", isValidating && "border-blue-500 focus:border-blue-500")} {...props} />}
        
        {/* 字符计数 */}
        {showCharCount && maxLength && <div className={cn("absolute bottom-2 right-2 text-xs transition-colors duration-200", isNearLimit ? "text-red-400" : "text-slate-400")}>
            {charCount}/{maxLength}
          </div>}
        
        {/* 验证状态指示器 */}
        {isValidating && <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
          </div>}
      </div>
      
      <FieldValidation fieldName={fieldName} value={value} error={error} touched={touched} isValidating={isValidating} />
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
  onFocus,
  error,
  touched,
  placeholder,
  rows = 4,
  className,
  showCharCount = false,
  maxLength = 5000,
  isValidating = false,
  ...props
}) {
  const hasError = touched && error;
  const hasSuccess = touched && !error && value && !isValidating;
  const charCount = value ? value.length : 0;
  const isNearLimit = charCount > maxLength * 0.9;
  return <div className={cn("space-y-2", className)}>
      {label && <label className="block text-sm font-medium text-slate-300 animate-fade-in">
          {label}
          {required && <span className="text-red-500 ml-1 animate-pulse">*</span>}
        </label>}
      
      <div className="relative">
        <textarea value={value} onChange={onChange} onBlur={onBlur} onFocus={onFocus} placeholder={placeholder} rows={rows} maxLength={maxLength} className={cn("w-full px-4 py-3 bg-slate-700/50 border rounded-xl text-white placeholder-slate-400", "transition-all duration-300 resize-none mobile-input", "focus:outline-none focus:ring-2 focus:ring-red-500/20", "hover:bg-slate-700/70 hover:border-slate-500", hasError ? "border-red-500 focus:border-red-500 shadow-glow-red" : hasSuccess ? "border-green-500 focus:border-green-500 shadow-glow-green" : "border-slate-600 focus:border-red-500", isValidating && "border-blue-500 focus:border-blue-500")} {...props} />
        
        {/* 字符计数 */}
        {showCharCount && <div className={cn("absolute bottom-3 right-3 text-xs transition-colors duration-200", isNearLimit ? "text-red-400" : "text-slate-400")}>
            {charCount}/{maxLength}
          </div>}
        
        {/* 验证状态指示器 */}
        {isValidating && <div className="absolute right-3 top-3">
            <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
          </div>}
      </div>
      
      <FieldValidation fieldName={fieldName} value={value} error={error} touched={touched} isValidating={isValidating} />
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
  onFocus,
  error,
  touched,
  placeholder = "输入标签后按回车添加",
  maxTags = 10,
  className,
  isValidating = false
}) {
  const hasError = touched && error;
  const hasSuccess = touched && !error && value.length > 0 && !isValidating;
  return <div className={cn("space-y-3", className)}>
      {label && <label className="block text-sm font-medium text-slate-300 animate-fade-in">
          {label}
          {required && <span className="text-red-500 ml-1 animate-pulse">*</span>}
        </label>}
      
      {/* 标签显示 */}
      {value.length > 0 && <div className="flex flex-wrap gap-2 animate-fade-in">
          {value.map((tag, index) => <span key={index} className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm flex items-center gap-2 border border-red-500/20 hover:bg-red-500/30 transition-all duration-200 hover:scale-105">
              {tag}
              <button type="button" onClick={() => {
          const newTags = value.filter((_, i) => i !== index);
          onChange({
            target: {
              value: newTags
            }
          });
        }} className="hover:text-red-300 transition-colors duration-200 button-press">
                ×
              </button>
            </span>)}
        </div>}
      
      {/* 输入框 */}
      <div className="relative">
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
      }} onBlur={onBlur} onFocus={onFocus} placeholder={placeholder} disabled={value.length >= maxTags} className={cn("w-full px-4 py-3 bg-slate-700/50 border rounded-xl text-white placeholder-slate-400", "transition-all duration-300 mobile-input", "focus:outline-none focus:ring-2 focus:ring-red-500/20", "hover:bg-slate-700/70 hover:border-slate-500", hasError ? "border-red-500 focus:border-red-500 shadow-glow-red" : hasSuccess ? "border-green-500 focus:border-green-500 shadow-glow-green" : "border-slate-600 focus:border-red-500", value.length >= maxTags && "opacity-50 cursor-not-allowed", isValidating && "border-blue-500 focus:border-blue-500")} />
        
        {/* 验证状态指示器 */}
        {isValidating && <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
          </div>}
      </div>
      
      <FieldValidation fieldName={fieldName} value={value} error={error} touched={touched} isValidating={isValidating} />
      
      {value.length >= maxTags && <p className="text-xs text-yellow-400 animate-fade-in">
          标签数量已达上限 ({maxTags}个)
        </p>}
    </div>;
}