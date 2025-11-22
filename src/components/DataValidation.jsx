// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Alert, AlertDescription, AlertTitle } from '@/components/ui';
// @ts-ignore;
import { CheckCircle, AlertCircle, XCircle, Info } from 'lucide-react';
// @ts-ignore;
import { cn } from '@/lib/utils';

// 验证规则配置
const VALIDATION_RULES = {
  story_id: {
    required: true,
    minLength: 3,
    maxLength: 50,
    pattern: /^[a-zA-Z0-9_]+$/,
    message: {
      required: '故事ID不能为空',
      minLength: '故事ID至少需要3个字符',
      maxLength: '故事ID不能超过50个字符',
      pattern: '故事ID只能包含字母、数字和下划线'
    }
  },
  title: {
    required: true,
    minLength: 1,
    maxLength: 100,
    message: {
      required: '标题不能为空',
      minLength: '标题至少需要1个字符',
      maxLength: '标题不能超过100个字符'
    }
  },
  content: {
    required: true,
    minLength: 10,
    maxLength: 5000,
    message: {
      required: '内容不能为空',
      minLength: '内容至少需要10个字符',
      maxLength: '内容不能超过5000个字符'
    }
  },
  author: {
    required: true,
    minLength: 1,
    maxLength: 50,
    message: {
      required: '作者不能为空',
      minLength: '作者名称至少需要1个字符',
      maxLength: '作者名称不能超过50个字符'
    }
  },
  location: {
    required: true,
    minLength: 1,
    maxLength: 100,
    message: {
      required: '地点不能为空',
      minLength: '地点至少需要1个字符',
      maxLength: '地点不能超过100个字符'
    }
  },
  read_time: {
    required: true,
    pattern: /^\d+分钟$/,
    message: {
      required: '阅读时间不能为空',
      pattern: '阅读时间格式应为：X分钟'
    }
  },
  tags: {
    required: true,
    minItems: 1,
    maxItems: 10,
    itemRules: {
      minLength: 1,
      maxLength: 20
    },
    message: {
      required: '至少需要一个标签',
      minItems: '至少需要一个标签',
      maxItems: '标签数量不能超过10个',
      itemMinLength: '标签至少需要1个字符',
      itemMaxLength: '标签不能超过20个字符'
    }
  },
  image: {
    required: false,
    maxSize: 5 * 1024 * 1024,
    // 5MB
    allowedFormats: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    message: {
      maxSize: '图片大小不能超过5MB',
      format: '图片格式不支持，请使用JPG、PNG或WebP格式'
    }
  }
};

// 验证单个字段
export const validateField = (fieldName, value, rules = VALIDATION_RULES[fieldName]) => {
  if (!rules) return {
    isValid: true,
    message: ''
  };
  const errors = [];

  // 必填验证
  if (rules.required && (!value || typeof value === 'string' && value.trim() === '' || Array.isArray(value) && value.length === 0)) {
    errors.push(rules.message.required);
    return {
      isValid: false,
      message: rules.message.required
    };
  }

  // 如果值为空且不是必填，则跳过其他验证
  if (!value || typeof value === 'string' && value.trim() === '') {
    return {
      isValid: true,
      message: ''
    };
  }

  // 字符串长度验证
  if (typeof value === 'string') {
    if (rules.minLength && value.length < rules.minLength) {
      errors.push(rules.message.minLength);
    }
    if (rules.maxLength && value.length > rules.maxLength) {
      errors.push(rules.message.maxLength);
    }
    if (rules.pattern && !rules.pattern.test(value)) {
      errors.push(rules.message.pattern);
    }
  }

  // 数组验证
  if (Array.isArray(value)) {
    if (rules.minItems && value.length < rules.minItems) {
      errors.push(rules.message.minItems);
    }
    if (rules.maxItems && value.length > rules.maxItems) {
      errors.push(rules.message.maxItems);
    }
    if (rules.itemRules) {
      value.forEach((item, index) => {
        if (typeof item === 'string') {
          if (rules.itemRules.minLength && item.length < rules.itemRules.minLength) {
            errors.push(`标签${index + 1}：${rules.message.itemMinLength}`);
          }
          if (rules.itemRules.maxLength && item.length > rules.itemRules.maxLength) {
            errors.push(`标签${index + 1}：${rules.message.itemMaxLength}`);
          }
        }
      });
    }
  }
  return {
    isValid: errors.length === 0,
    message: errors[0] || ''
  };
};

// 验证整个表单数据
export const validateFormData = (formData, rules = VALIDATION_RULES) => {
  const errors = {};
  let isValid = true;
  Object.keys(rules).forEach(fieldName => {
    const fieldRules = rules[fieldName];
    const fieldValue = formData[fieldName];
    const validation = validateField(fieldName, fieldValue, fieldRules);
    if (!validation.isValid) {
      errors[fieldName] = validation.message;
      isValid = false;
    }
  });
  return {
    isValid,
    errors
  };
};

// 实时验证Hook
export const useFieldValidation = (fieldName, initialValue, rules = VALIDATION_RULES[fieldName]) => {
  const [value, setValue] = useState(initialValue || '');
  const [validation, setValidation] = useState({
    isValid: true,
    message: ''
  });
  const [touched, setTouched] = useState(false);
  useEffect(() => {
    if (touched) {
      const newValidation = validateField(fieldName, value, rules);
      setValidation(newValidation);
    }
  }, [value, touched, fieldName, rules]);
  const handleChange = newValue => {
    setValue(newValue);
    if (touched) {
      const newValidation = validateField(fieldName, newValue, rules);
      setValidation(newValidation);
    }
  };
  const handleBlur = () => {
    setTouched(true);
    const newValidation = validateField(fieldName, value, rules);
    setValidation(newValidation);
  };
  const reset = () => {
    setValue(initialValue || '');
    setValidation({
      isValid: true,
      message: ''
    });
    setTouched(false);
  };
  return {
    value,
    validation,
    touched,
    handleChange,
    handleBlur,
    reset,
    setValue
  };
};

// 字段验证状态组件
export const FieldValidation = ({
  fieldName,
  validation,
  touched,
  className
}) => {
  if (!touched || validation.isValid) {
    return null;
  }
  return <div className={cn("flex items-center mt-1 text-sm", className)}>
      <XCircle className="w-4 h-4 text-red-500 mr-1" />
      <span className="text-red-400">{validation.message}</span>
    </div>;
};

// 字段成功状态组件
export const FieldSuccess = ({
  fieldName,
  validation,
  touched,
  className
}) => {
  if (!touched || !validation.isValid || !validation.message) {
    return null;
  }
  return <div className={cn("flex items-center mt-1 text-sm", className)}>
      <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
      <span className="text-green-400">验证通过</span>
    </div>;
};

// 表单验证状态组件
export const FormValidationStatus = ({
  validation,
  className
}) => {
  if (!validation) return null;
  const {
    isValid,
    errors
  } = validation;
  if (isValid) {
    return <div className={cn("flex items-center p-3 bg-green-500/10 border border-green-500/20 rounded-lg", className)}>
        <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
        <span className="text-green-400">表单验证通过</span>
      </div>;
  }
  return <div className={cn("p-3 bg-red-500/10 border border-red-500/20 rounded-lg", className)}>
      <div className="flex items-center mb-2">
        <XCircle className="w-5 h-5 text-red-500 mr-2" />
        <span className="text-red-400 font-medium">表单验证失败</span>
      </div>
      <div className="space-y-1">
        {Object.entries(errors).map(([field, message]) => <div key={field} className="text-sm text-red-300">
            • {message}
          </div>)}
      </div>
    </div>;
};

// 验证进度组件
export const ValidationProgress = ({
  totalFields,
  validatedFields,
  className
}) => {
  const progress = totalFields > 0 ? validatedFields / totalFields * 100 : 0;
  return <div className={cn("space-y-2", className)}>
      <div className="flex justify-between text-sm">
        <span className="text-slate-400">验证进度</span>
        <span className="text-slate-300">{validatedFields}/{totalFields}</span>
      </div>
      <div className="w-full bg-slate-700 rounded-full h-2">
        <div className="bg-gradient-to-r from-red-500 to-orange-500 h-2 rounded-full transition-all duration-300" style={{
        width: `${progress}%`
      }} />
      </div>
    </div>;
};