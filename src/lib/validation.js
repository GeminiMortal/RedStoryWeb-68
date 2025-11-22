
// 数据验证工具函数
// 与后端 red_story schema 保持一致

/**
 * 验证故事数据（简化版 - 移除必填字段检查）
 * @param {Object} data - 故事数据
 * @param {boolean} isUpdate - 是否为更新操作
 * @returns {Object} 验证结果 { isValid, errors }
 */
export function validateStoryData(data, isUpdate = false) {
  const errors = {};
  
  // 故事ID验证（仅创建时需要）
  if (!isUpdate) {
    if (!data.story_id) {
      errors.story_id = '故事ID不能为空';
    } else if (typeof data.story_id !== 'string') {
      errors.story_id = '故事ID必须是字符串';
    } else if (data.story_id.length < 3) {
      errors.story_id = '故事ID长度不能少于3个字符';
    } else if (data.story_id.length > 50) {
      errors.story_id = '故事ID长度不能超过50个字符';
    } else if (!/^[a-zA-Z0-9_]+$/.test(data.story_id)) {
      errors.story_id = '故事ID只能包含字母、数字和下划线';
    }
  }

  // 标题验证（改为可选）
  if (!isUpdate || data.title !== undefined) {
    if (data.title && typeof data.title !== 'string') {
      errors.title = '标题必须是字符串';
    } else if (data.title && data.title.length > 100) {
      errors.title = '标题长度不能超过100个字符';
    }
  }

  // 内容验证（改为可选）
  if (!isUpdate || data.content !== undefined) {
    if (data.content && typeof data.content !== 'string') {
      errors.content = '内容必须是字符串';
    } else if (data.content && data.content.length > 5000) {
      errors.content = '故事内容长度不能超过5000个字符';
    }
  }

  // 上传者验证（改为可选）
  if (!isUpdate || data.author !== undefined) {
    if (data.author && typeof data.author !== 'string') {
      errors.author = '上传者必须是字符串';
    } else if (data.author && data.author.length > 50) {
      errors.author = '上传者名称长度不能超过50个字符';
    }
  }

  // 地点验证（可选）
  if (!isUpdate || data.location !== undefined) {
    if (data.location && typeof data.location !== 'string') {
      errors.location = '地点必须是字符串';
    } else if (data.location && data.location.length > 100) {
      errors.location = '地点长度不能超过100个字符';
    }
  }

  // 时间时期验证（可选）
  if (!isUpdate || data.date !== undefined) {
    if (data.date && typeof data.date !== 'string') {
      errors.date = '时间时期必须是字符串';
    } else if (data.date && data.date.length > 50) {
      errors.date = '时间时期长度不能超过50个字符';
    }
  }

  // 阅读时间验证（改为可选）
  if (!isUpdate || data.read_time !== undefined) {
    if (data.read_time && typeof data.read_time !== 'string') {
      errors.read_time = '阅读时间必须是字符串';
    } else if (data.read_time && !/^\d+分钟$/.test(data.read_time)) {
      errors.read_time = '阅读时间格式不正确，应为"X分钟"';
    }
  }

  // 标签验证（可选）
  if (!isUpdate || data.tags !== undefined) {
    if (data.tags && !Array.isArray(data.tags)) {
      errors.tags = '标签必须是数组';
    } else if (data.tags && data.tags.length > 10) {
      errors.tags = '标签数量不能超过10个';
    } else if (data.tags) {
      data.tags.forEach((tag, index) => {
        if (tag && typeof tag !== 'string') {
          errors[`tags[${index}]`] = '标签必须是字符串';
        } else if (tag && tag.length > 20) {
          errors[`tags[${index}]`] = '标签长度不能超过20个字符';
        }
      });
    }
  }

  // 状态验证
  if (!isUpdate || data.status !== undefined) {
    const validStatuses = ['draft', 'published', 'archived', 'deleted'];
    if (!data.status || !validStatuses.includes(data.status)) {
      errors.status = `状态必须是以下值之一: ${validStatuses.join(', ')}`;
    }
  }

  // 图片验证
  if (!isUpdate || data.image !== undefined) {
    if (data.image && typeof data.image === 'string') {
      // 检查是否为有效的图片URL或base64
      const isValidImage = data.image.startsWith('data:image/') || 
                          data.image.startsWith('http://') || 
                          data.image.startsWith('https://');
      if (!isValidImage) {
        errors.image = '图片格式不正确';
      }
    }
  }

  // 数值字段验证
  const numberFields = ['view_count', 'like_count', 'share_count'];
  numberFields.forEach(field => {
    if (!isUpdate || data[field] !== undefined) {
      if (data[field] !== undefined && data[field] !== null) {
        if (typeof data[field] !== 'number' || data[field] < 0) {
          errors[field] = `${field}必须是非负数`;
        }
      }
    }
  });

  // SEO关键词验证
  if (!isUpdate || data.seo_keywords !== undefined) {
    if (data.seo_keywords && Array.isArray(data.seo_keywords)) {
      if (data.seo_keywords.length > 5) {
        errors.seo_keywords = 'SEO关键词数量不能超过5个';
      } else {
        data.seo_keywords.forEach((keyword, index) => {
          if (keyword && typeof keyword === 'string' && keyword.length > 30) {
            errors[`seo_keywords[${index}]`] = 'SEO关键词长度不能超过30个字符';
          }
        });
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * 检查故事是否可以发布（移除所有条件检查）
 * 始终返回可以发布
 * @param {Object} data - 故事数据
 * @returns {Object} 检查结果 { canPublish: true, missingFields: [], errors: {} }
 */
export function checkStoryPublishability(data) {
  return {
    canPublish: true,
    missingFields: [],
    errors: {}
  };
}

/**
 * 获取故事完整性状态（移除完整性检查）
 * 始终返回100%完成
 * @param {Object} data - 故事数据
 * @returns {Object} 完整性状态 { completeness: 100, percentage: 100, missingFields: [], canPublish: true }
 */
export function getStoryCompleteness(data) {
  return {
    completeness: 100,
    percentage: 100,
    completedFields: 4,
    totalFields: 4,
    missingFields: [],
    canPublish: true
  };
}

/**
 * 实时验证单个字段（简化版）
 * @param {string} fieldName - 字段名
 * @param {any} value - 字段值
 * @returns {string|null} 错误信息，如果没有错误则返回null
 */
export function validateField(fieldName, value) {
  switch (fieldName) {
    case 'title':
      if (value && value.length > 100) return '标题长度不能超过100个字符';
      return null;
      
    case 'content':
      if (value && value.length > 5000) return '内容长度不能超过5000个字符';
      return null;
      
    case 'author':
      if (value && value.length > 50) return '上传者名称长度不能超过50个字符';
      return null;
      
    case 'location':
      if (value && typeof value !== 'string') return '地点必须是字符串';
      if (value && value.length > 100) return '地点长度不能超过100个字符';
      return null;
      
    case 'date':
      if (value && typeof value !== 'string') return '时间时期必须是字符串';
      if (value && value.length > 50) return '时间时期长度不能超过50个字符';
      return null;
      
    case 'read_time':
      if (value && !/^\d+分钟$/.test(value)) return '阅读时间格式不正确，应为"X分钟"';
      return null;
      
    case 'tags':
      if (value && !Array.isArray(value)) return '标签必须是数组';
      if (value && value.length > 10) return '标签数量不能超过10个';
      return null;
      
    case 'image':
      if (value && typeof value === 'string') {
        const isValidImage = value.startsWith('data:image/') || 
                            value.startsWith('http://') || 
                            value.startsWith('https://');
        if (!isValidImage) return '图片格式不正确';
      }
      return null;
      
    default:
      return null;
  }
}

/**
 * 验证图片文件
 * @param {File} file - 图片文件
 * @returns {Object} 验证结果 { isValid, error }
 */
export function validateImageFile(file) {
  if (!file) {
    return { isValid: false, error: '请选择图片文件' };
  }
  
  // 检查文件类型
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return { 
      isValid: false, 
      error: '仅支持 JPG、PNG、WEBP 格式的图片' 
    };
  }
  
  // 检查文件大小 (5MB)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return { 
      isValid: false, 
      error: '图片大小不能超过5MB' 
    };
  }
  
  return { isValid: true, error: null };
}

/**
 * 计算阅读时间
 * @param {string} content - 内容
 * @returns {string} 阅读时间
 */
export function calculateReadTime(content) {
  if (!content) return '5分钟阅读';
  
  const chineseChars = (content.match(/[\u4e00-\u9fa5]/g) || []).length;
  const englishWords = (content.match(/[a-zA-Z]+/g) || []).length;
  const readTime = Math.max(1, Math.ceil(chineseChars / 500 + englishWords / 200));
  
  return `${readTime}分钟阅读`;
}

/**
 * 清理和格式化数据
 * @param {Object} data - 原始数据
 * @returns {Object} 清理后的数据
 */
export function sanitizeStoryData(data) {
  const sanitized = { ...data };
  
  // 清理字符串字段
  const stringFields = ['title', 'content', 'author', 'location', 'date', 'read_time'];
  stringFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = sanitized[field].trim();
    }
  });
  
  // 清理标签
  if (sanitized.tags && Array.isArray(sanitized.tags)) {
    sanitized.tags = sanitized.tags
      .filter(tag => tag && tag.trim())
      .map(tag => tag.trim())
      .slice(0, 10); // 最多10个标签
  }
  
  // 清理SEO关键词
  if (sanitized.seo_keywords && Array.isArray(sanitized.seo_keywords)) {
    sanitized.seo_keywords = sanitized.seo_keywords
      .filter(keyword => keyword && keyword.trim())
      .map(keyword => keyword.trim())
      .slice(0, 5); // 最多5个关键词
  }
  
  return sanitized;
}
