// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button } from '@/components/ui';
// @ts-ignore;
import { AlertCircle, CheckCircle, X, Eye, EyeOff } from 'lucide-react';
// @ts-ignore;
import { cn } from '@/lib/utils';

// @ts-ignore;
import { validateField } from '@/lib/validation';

// 移动端优化的输入组件
export function MobileValidatedInput({
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
  showPasswordToggle = false,
  autoComplete = 'off',
  inputMode = 'text',
  ...props
}) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState(null);

  // 实时验证
  useEffect(() => {
    if (touched && value !== undefined) {
      const validationError = validateField(fieldName, value);
      setLocalError(validationError);
    }
  }, [value, touched, fieldName]);
  const hasError = (error || localError) && touched;
  const hasSuccess = !hasError && touched && value;
  const displayError = error || localError;
  const handleFocus = () => {
    setIsFocused(true);
  };
  const handleBlur = e => {
    setIsFocused(false);
    onBlur && onBlur(e);
  };
  const handleChange = e => {
    onChange && onChange(e);
  };
  return <div className={cn("space-y-2", className)}>
      {/* 标签 */}
      {label && <label className="block text-sm font-medium text-slate-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>}
      
      {/* 输入框容器 */}
      <div className="relative">
        <input type={showPasswordToggle ? showPassword ? 'text' : 'password' : type} value={value || ''} onChange={handleChange} onFocus={handleFocus} onBlur={handleBlur} placeholder={placeholder} autoComplete={autoComplete} inputMode={inputMode} className={cn("w-full px-4 py-4 bg-slate-700/50 border rounded-xl text-white placeholder-slate-400 transition-all duration-300 text-base", "focus:outline-none focus:ring-4 focus:ring-red-500/20", "active:scale-[0.98]",
      // 移动端点击反馈
      hasError ? "border-red-500 focus:border-red-500" : hasSuccess ? "border-green-500 focus:border-green-500" : isFocused ? "border-red-500 focus:border-red-500" : "border-slate-600 focus:border-red-500")} {...props} />
        
        {/* 密码显示切换 */}
        {showPasswordToggle && <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors">
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>}
        
        {/* 验证状态图标 */}
        {touched && <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {hasError ? <AlertCircle className="w-5 h-5 text-red-400" /> : hasSuccess ? <CheckCircle className="w-5 h-5 text-green-400" /> : null}
          </div>}
      </div>
      
      {/* 错误信息 */}
      {hasError && <div className="flex items-center space-x-1 text-red-400 text-sm animate-fade-in">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{displayError}</span>
        </div>}
      
      {/* 成功信息 */}
      {hasSuccess && <div className="flex items-center space-x-1 text-green-400 text-sm animate-fade-in">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          <span>格式正确</span>
        </div>}
    </div>;
}

// 移动端优化的文本域组件
export function MobileValidatedTextarea({
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
  const [isFocused, setIsFocused] = useState(false);
  const [localError, setLocalError] = useState(null);

  // 实时验证
  useEffect(() => {
    if (touched && value !== undefined) {
      const validationError = validateField(fieldName, value);
      setLocalError(validationError);
    }
  }, [value, touched, fieldName]);
  const hasError = (error || localError) && touched;
  const hasSuccess = !hasError && touched && value;
  const displayError = error || localError;
  const charCount = value ? value.length : 0;
  const isNearLimit = charCount > maxLength * 0.9;
  const handleFocus = () => {
    setIsFocused(true);
  };
  const handleBlur = e => {
    setIsFocused(false);
    onBlur && onBlur(e);
  };
  return <div className={cn("space-y-2", className)}>
      {/* 标签 */}
      {label && <label className="block text-sm font-medium text-slate-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>}
      
      {/* 文本域容器 */}
      <div className="relative">
        <textarea value={value || ''} onChange={onChange} onFocus={handleFocus} onBlur={handleBlur} placeholder={placeholder} rows={rows} maxLength={maxLength} className={cn("w-full px-4 py-4 bg-slate-700/50 border rounded-xl text-white placeholder-slate-400 transition-all duration-300 resize-none text-base", "focus:outline-none focus:ring-4 focus:ring-red-500/20", "active:scale-[0.98]",
      // 移动端点击反馈
      hasError ? "border-red-500 focus:border-red-500" : hasSuccess ? "border-green-500 focus:border-green-500" : isFocused ? "border-red-500 focus:border-red-500" : "border-slate-600 focus:border-red-500")} {...props} />
        
        {/* 字符计数 */}
        {showCharCount && <div className={cn("absolute bottom-3 right-3 text-xs px-2 py-1 rounded", isNearLimit ? "bg-red-500/20 text-red-400" : "bg-slate-600/50 text-slate-400")}>
            {charCount}/{maxLength}
          </div>}
        
        {/* 验证状态图标 */}
        {touched && <div className="absolute right-3 top-3">
            {hasError ? <AlertCircle className="w-5 h-5 text-red-400" /> : hasSuccess ? <CheckCircle className="w-5 h-5 text-green-400" /> : null}
          </div>}
      </div>
      
      {/* 错误信息 */}
      {hasError && <div className="flex items-center space-x-1 text-red-400 text-sm animate-fade-in">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{displayError}</span>
        </div>}
      
      {/* 成功信息 */}
      {hasSuccess && <div className="flex items-center space-x-1 text-green-400 text-sm animate-fade-in">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          <span>格式正确</span>
        </div>}
    </div>;
}

// 移动端优化的标签输入组件
export function MobileValidatedTagInput({
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
  const [isFocused, setIsFocused] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [inputValue, setInputValue] = useState('');

  // 实时验证
  useEffect(() => {
    if (touched && value !== undefined) {
      const validationError = validateField(fieldName, value);
      setLocalError(validationError);
    }
  }, [value, touched, fieldName]);
  const hasError = (error || localError) && touched;
  const hasSuccess = !hasError && touched && value.length > 0;
  const displayError = error || localError;
  const handleFocus = () => {
    setIsFocused(true);
  };
  const handleBlur = e => {
    setIsFocused(false);
    onBlur && onBlur(e);
  };
  const handleInputChange = e => {
    const newValue = e.target.value;
    setInputValue(newValue);

    // 处理逗号分隔的标签
    if (newValue.includes(',')) {
      const tags = newValue.split(',').map(tag => tag.trim()).filter(tag => tag && !value.includes(tag));
      if (tags.length > 0) {
        const newTags = [...value, ...tags].slice(0, maxTags);
        onChange && onChange({
          target: {
            value: newTags
          }
        });
      }
      setInputValue('');
    }
  };
  const handleKeyPress = e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const tag = inputValue.trim();
      if (tag && !value.includes(tag) && value.length < maxTags) {
        const newTags = [...value, tag];
        onChange && onChange({
          target: {
            value: newTags
          }
        });
        setInputValue('');
      }
    }
  };
  const handleRemoveTag = tagToRemove => {
    const newTags = value.filter(tag => tag !== tagToRemove);
    onChange && onChange({
      target: {
        value: newTags
      }
    });
  };
  return <div className={cn("space-y-3", className)}>
      {/* 标签 */}
      {label && <label className="block text-sm font-medium text-slate-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>}
      
      {/* 标签显示 */}
      {value.length > 0 && <div className="flex flex-wrap gap-2">
          {value.map((tag, index) => <span key={index} className="inline-flex items-center px-3 py-2 bg-red-500/20 text-red-400 rounded-full text-sm group hover:bg-red-500/30 transition-colors">
              {tag}
              <button type="button" onClick={() => handleRemoveTag(tag)} className="ml-2 text-red-400 hover:text-red-300 transition-colors">
                <X className="w-3 h-3" />
              </button>
            </span>)}
        </div>}
      
      {/* 输入框 */}
      <div className="relative">
        <input type="text" value={inputValue} onChange={handleInputChange} onKeyPress={handleKeyPress} onFocus={handleFocus} onBlur={handleBlur} placeholder={placeholder} disabled={value.length >= maxTags} className={cn("w-full px-4 py-4 bg-slate-700/50 border rounded-xl text-white placeholder-slate-400 transition-all duration-300 text-base", "focus:outline-none focus:ring-4 focus:ring-red-500/20", "active:scale-[0.98]", hasError ? "border-red-500 focus:border-red-500" : hasSuccess ? "border-green-500 focus:border-green-500" : isFocused ? "border-red-500 focus:border-red-500" : "border-slate-600 focus:border-red-500", value.length >= maxTags && "opacity-50 cursor-not-allowed")} />
        
        {/* 验证状态图标 */}
        {touched && <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {hasError ? <AlertCircle className="w-5 h-5 text-red-400" /> : hasSuccess ? <CheckCircle className="w-5 h-5 text-green-400" /> : null}
          </div>}
      </div>
      
      {/* 错误信息 */}
      {hasError && <div className="flex items-center space-x-1 text-red-400 text-sm animate-fade-in">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{displayError}</span>
        </div>}
      
      {/* 成功信息 */}
      {hasSuccess && <div className="flex items-center space-x-1 text-green-400 text-sm animate-fade-in">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          <span>格式正确</span>
        </div>}
      
      {/* 标签数量提示 */}
      {value.length >= maxTags && <p className="text-xs text-yellow-400">
          标签数量已达上限 ({maxTags}个)
        </p>}
    </div>;
}

// 移动端表单验证状态组件
export function MobileValidationSummary({
  errors,
  touched,
  className
}) {
  const errorCount = Object.keys(errors).filter(key => errors[key] && touched[key]).length;
  if (errorCount === 0) {
    return null;
  }
  return <div className={cn("bg-red-500/10 border border-red-500/20 rounded-xl p-4", className)}>
      <div className="flex items-center space-x-2 text-red-400 mb-3">
        <AlertCircle className="w-5 h-5" />
        <span className="font-medium">请修正以下错误 ({errorCount}项)</span>
      </div>
      <div className="space-y-1">
        {Object.entries(errors).map(([field, error]) => {
        if (!error || !touched[field]) return null;
        return <div key={field} className="text-sm text-red-300 flex items-center space-x-2">
              <span className="w-1 h-1 bg-red-400 rounded-full flex-shrink-0"></span>
              <span>{error}</span>
            </div>;
      })}
      </div>
    </div>;
}

// 移动端优化的提交按钮
export function MobileSubmitButton({
  children,
  disabled = false,
  loading = false,
  errors,
  touched,
  className,
  ...props
}) {
  const errorCount = Object.keys(errors).filter(key => errors[key] && touched[key]).length;
  const hasErrors = errorCount > 0;
  return <Button {...props} disabled={disabled || loading || hasErrors} className={cn("w-full py-4 text-base font-medium transition-all duration-300", "active:scale-[0.98]", hasErrors ? "bg-slate-600 text-slate-400 cursor-not-allowed" : "bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 shadow-lg hover:shadow-red-500/25", className)}>
    {loading ? <div className="flex items-center justify-center space-x-2">
        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
        <span>处理中...</span>
      </div> : hasErrors ? <div className="flex items-center justify-center space-x-2">
        <AlertCircle className="w-4 h-4" />
        <span>请修正错误后提交 ({errorCount})</span>
      </div> : children}
  </Button>;
}