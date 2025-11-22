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
  className,
  isValidating = false
}) {
  // 如果字段未被触摸或不显示成功状态，则不显示任何内容
  if (!touched && !isValidating) {
    return null;
  }
  const hasError = !!error;
  const hasSuccess = !hasError && showSuccess && touched && value && !isValidating;
  const isValidatingState = isValidating;
  return <div className={cn("flex items-center space-x-1 text-xs mt-2 min-h-[20px]", className)}>
      {isValidatingState && <div className="flex items-center space-x-1 text-blue-400">
          <Loader2 className="w-3 h-3 animate-spin" />
          <span>验证中...</span>
        </div>}
      {hasError && <div className="flex items-center space-x-1 text-red-400">
          <AlertCircle className="w-3 h-3" />
          <span>{error}</span>
        </div>}
      {hasSuccess && <div className="flex items-center space-x-1 text-green-400">
          <CheckCircle className="w-3 h-3" />
          <span>格式正确</span>
        </div>}
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
  disabled = false,
  ...props
}) {
  const hasError = touched && error;
  const hasSuccess = touched && !error && value && !isValidating;
  const isValidatingState = isValidating;
  return <div className={cn("space-y-2", className)}>
      {label && <label className="block text-sm font-medium text-slate-300 mobile-text">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>}
      
      <div className="relative">
        {children || <input type={type} value={value} onChange={onChange} onBlur={onBlur} onFocus={onFocus} placeholder={placeholder} disabled={disabled} className={cn("w-full px-4 py-3 bg-slate-700/50 border rounded-xl text-white placeholder-slate-400 transition-all duration-300 mobile-input", "focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500", "hover:border-slate-500", "disabled:opacity-50 disabled:cursor-not-allowed", "active:scale-[0.98]", hasError ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : hasSuccess ? "border-green-500 focus:border-green-500 focus:ring-green-500/20" : "border-slate-600 focus:border-red-500", isValidatingState && "border-blue-500 focus:border-blue-500 focus:ring-blue-500/20")} {...props} />}
        
        {/* 验证状态指示器 */}
        {isValidatingState && <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
          </div>}
        {hasSuccess && !isValidatingState && <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <CheckCircle className="w-4 h-4 text-green-400" />
          </div>}
        {hasError && !isValidatingState && <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <AlertCircle className="w-4 h-4 text-red-400" />
          </div>}
      </div>
      
      <FieldValidation fieldName={fieldName} value={value} error={error} touched={touched} isValidating={isValidatingState} />
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
  disabled = false,
  ...props
}) {
  const hasError = touched && error;
  const hasSuccess = touched && !error && value && !isValidating;
  const isValidatingState = isValidating;
  const charCount = value ? value.length : 0;
  const isNearLimit = charCount > maxLength * 0.9;
  const isAtLimit = charCount >= maxLength;
  return <div className={cn("space-y-2", className)}>
      {label && <label className="block text-sm font-medium text-slate-300 mobile-text">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>}
      
      <div className="relative">
        <textarea value={value} onChange={onChange} onBlur={onBlur} onFocus={onFocus} placeholder={placeholder} rows={rows} maxLength={maxLength} disabled={disabled} className={cn("w-full px-4 py-3 bg-slate-700/50 border rounded-xl text-white placeholder-slate-400 transition-all duration-300 resize-none mobile-input", "focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500", "hover:border-slate-500", "disabled:opacity-50 disabled:cursor-not-allowed", "active:scale-[0.98]", hasError ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : hasSuccess ? "border-green-500 focus:border-green-500 focus:ring-green-500/20" : "border-slate-600 focus:border-red-500", isValidatingState && "border-blue-500 focus:border-blue-500 focus:ring-blue-500/20", isAtLimit && "border-orange-500")} {...props} />
        
        {/* 验证状态指示器 */}
        {isValidatingState && <div className="absolute right-3 top-3">
            <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
          </div>}
        {hasSuccess && !isValidatingState && <div className="absolute right-3 top-3">
            <CheckCircle className="w-4 h-4 text-green-400" />
          </div>}
        {hasError && !isValidatingState && <div className="absolute right-3 top-3">
            <AlertCircle className="w-4 h-4 text-red-400" />
          </div>}
        
        {/* 字符计数 */}
        {showCharCount && <div className={cn("absolute bottom-3 right-3 text-xs px-2 py-1 rounded-md", isAtLimit ? "text-red-400 bg-red-500/10" : isNearLimit ? "text-orange-400 bg-orange-500/10" : "text-slate-400 bg-slate-500/10")}>
            {charCount}/{maxLength}
          </div>}
      </div>
      
      <FieldValidation fieldName={fieldName} value={value} error={error} touched={touched} isValidating={isValidatingState} />
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
  isValidating = false,
  disabled = false
}) {
  const hasError = touched && error;
  const hasSuccess = touched && !error && value.length > 0 && !isValidating;
  const isValidatingState = isValidating;
  return <div className={cn("space-y-3", className)}>
      {label && <label className="block text-sm font-medium text-slate-300 mobile-text">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>}
      
      {/* 标签显示 */}
      {value.length > 0 && <div className="flex flex-wrap gap-2">
          {value.map((tag, index) => <span key={index} className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-full text-sm flex items-center gap-2 border border-red-500/30 hover:bg-red-500/30 transition-colors duration-200">
              {tag}
              <button type="button" onClick={() => {
          const newTags = value.filter((_, i) => i !== index);
          onChange({
            target: {
              value: newTags
            }
          });
        }} className="hover:text-red-300 transition-colors duration-200 font-medium">
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
      }} onBlur={onBlur} onFocus={onFocus} placeholder={placeholder} disabled={disabled || value.length >= maxTags} className={cn("w-full px-4 py-3 bg-slate-700/50 border rounded-xl text-white placeholder-slate-400 transition-all duration-300 mobile-input", "focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500", "hover:border-slate-500", "disabled:opacity-50 disabled:cursor-not-allowed", "active:scale-[0.98]", hasError ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : hasSuccess ? "border-green-500 focus:border-green-500 focus:ring-green-500/20" : "border-slate-600 focus:border-red-500", isValidatingState && "border-blue-500 focus:border-blue-500 focus:ring-blue-500/20", value.length >= maxTags && "opacity-50 cursor-not-allowed")} />
        
        {/* 验证状态指示器 */}
        {isValidatingState && <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
          </div>}
        {hasSuccess && !isValidatingState && <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <CheckCircle className="w-4 h-4 text-green-400" />
          </div>}
        {hasError && !isValidatingState && <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <AlertCircle className="w-4 h-4 text-red-400" />
          </div>}
      </div>
      
      <FieldValidation fieldName={fieldName} value={value} error={error} touched={touched} isValidating={isValidatingState} />
      
      {value.length >= maxTags && <p className="text-xs text-orange-400 bg-orange-500/10 px-3 py-2 rounded-lg border border-orange-500/30">
          标签数量已达上限 ({maxTags}个)
        </p>}
    </div>;
}

// 选择框包装器
export function ValidatedSelect({
  label,
  required = false,
  fieldName,
  value,
  onChange,
  onBlur,
  onFocus,
  error,
  touched,
  placeholder = "请选择",
  className,
  children,
  isValidating = false,
  disabled = false,
  ...props
}) {
  const hasError = touched && error;
  const hasSuccess = touched && !error && value && !isValidating;
  const isValidatingState = isValidating;
  return <div className={cn("space-y-2", className)}>
      {label && <label className="block text-sm font-medium text-slate-300 mobile-text">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>}
      
      <div className="relative">
        <select value={value} onChange={onChange} onBlur={onBlur} onFocus={onFocus} disabled={disabled} className={cn("w-full px-4 py-3 bg-slate-700/50 border rounded-xl text-white transition-all duration-300 mobile-input appearance-none", "focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500", "hover:border-slate-500", "disabled:opacity-50 disabled:cursor-not-allowed", "active:scale-[0.98]", hasError ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : hasSuccess ? "border-green-500 focus:border-green-500 focus:ring-green-500/20" : "border-slate-600 focus:border-red-500", isValidatingState && "border-blue-500 focus:border-blue-500 focus:ring-blue-500/20")} {...props}>
          {placeholder && <option value="" disabled>
              {placeholder}
            </option>}
          {children}
        </select>
        
        {/* 自定义下拉箭头 */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        
        {/* 验证状态指示器 */}
        {isValidatingState && <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
            <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
          </div>}
        {hasSuccess && !isValidatingState && <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
            <CheckCircle className="w-4 h-4 text-green-400" />
          </div>}
        {hasError && !isValidatingState && <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
            <AlertCircle className="w-4 h-4 text-red-400" />
          </div>}
      </div>
      
      <FieldValidation fieldName={fieldName} value={value} error={error} touched={touched} isValidating={isValidatingState} />
    </div>;
}