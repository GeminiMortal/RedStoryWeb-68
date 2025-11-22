// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Button } from '@/components/ui';
// @ts-ignore;
import { Edit, Trash2, Eye, Share2, Heart, Download, Copy, ExternalLink, MoreVertical, CheckCircle, Clock, Archive } from 'lucide-react';
// @ts-ignore;
import { cn } from '@/lib/utils';

export function StoryActions({
  story,
  onEdit,
  onDelete,
  onView,
  onShare,
  onLike,
  onDownload,
  isLiked = false,
  likeCount = 0,
  className,
  showLabels = true,
  variant = 'default' // 'default', 'compact', 'minimal'
}) {
  const [showMenu, setShowMenu] = useState(false);
  const [actionLoading, setActionLoading] = useState('');

  // 处理操作
  const handleAction = async (action, handler) => {
    if (actionLoading) return;
    try {
      setActionLoading(action);
      await handler();
    } catch (error) {
      console.error('操作失败:', error);
    } finally {
      setActionLoading('');
      setShowMenu(false);
    }
  };

  // 复制链接
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      // 可以添加 toast 提示
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  // 获取状态显示
  const getStatusDisplay = () => {
    if (!story) return null;
    switch (story.status) {
      case 'published':
        return <span className="flex items-center text-green-400 text-xs">
          <CheckCircle className="w-3 h-3 mr-1" />
          已发布
        </span>;
      case 'draft':
        return <span className="flex items-center text-yellow-400 text-xs">
          <Clock className="w-3 h-3 mr-1" />
          草稿
        </span>;
      case 'archived':
        return <span className="flex items-center text-slate-400 text-xs">
          <Archive className="w-3 h-3 mr-1" />
          已归档
        </span>;
      default:
        return null;
    }
  };

  // 紧凑模式
  if (variant === 'compact') {
    return <div className={cn("flex items-center space-x-2", className)}>
        <Button size="sm" variant="ghost" onClick={() => onView(story._id)} className="text-slate-400 hover:text-white p-2">
          <Eye className="w-4 h-4" />
        </Button>
        <Button size="sm" variant="ghost" onClick={() => onEdit(story._id)} className="text-slate-400 hover:text-white p-2">
          <Edit className="w-4 h-4" />
        </Button>
        <Button size="sm" variant="ghost" onClick={() => handleAction('delete', () => onDelete(story._id))} className="text-slate-400 hover:text-red-400 p-2">
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>;
  }

  // 最小模式
  if (variant === 'minimal') {
    return <div className={cn("flex items-center space-x-1", className)}>
        <Button size="sm" variant="ghost" onClick={() => onView(story._id)} className="text-slate-400 hover:text-white p-1">
          <ExternalLink className="w-3 h-3" />
        </Button>
      </div>;
  }

  // 默认模式
  return <div className={cn("space-y-4", className)}>
      {/* 主要操作按钮 */}
      <div className="flex flex-wrap gap-2">
        {story.status === 'published' && <Button onClick={() => onView(story._id)} variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white transition-all duration-200">
            <Eye className="w-4 h-4 mr-2" />
            {showLabels && '查看'}
          </Button>}
        <Button onClick={() => onEdit(story._id)} variant="outline" size="sm" className="border-blue-600 text-blue-400 hover:bg-blue-600/10 transition-all duration-200">
          <Edit className="w-4 h-4 mr-2" />
          {showLabels && '编辑'}
        </Button>
        <Button onClick={() => handleAction('delete', () => onDelete(story._id))} variant="outline" size="sm" className="border-red-600 text-red-400 hover:bg-red-600/10 transition-all duration-200">
          <Trash2 className="w-4 h-4 mr-2" />
          {showLabels && '删除'}
        </Button>
      </div>

      {/* 次要操作按钮 */}
      <div className="flex flex-wrap gap-2">
        {story.status === 'published' && <>
            <Button onClick={() => onLike(story._id)} variant="ghost" size="sm" className={cn("transition-all duration-200", isLiked ? "text-red-400 hover:text-red-300" : "text-slate-400 hover:text-red-400")}>
              <Heart className={cn("w-4 h-4 mr-2", isLiked && "fill-current")} />
              {likeCount}
            </Button>
            <Button onClick={() => onShare(story._id)} variant="ghost" size="sm" className="text-slate-400 hover:text-white transition-all duration-200">
              <Share2 className="w-4 h-4 mr-2" />
              {showLabels && '分享'}
            </Button>
          </>}
        <Button onClick={handleCopyLink} variant="ghost" size="sm" className="text-slate-400 hover:text-white transition-all duration-200">
          <Copy className="w-4 h-4 mr-2" />
          {showLabels && '复制链接'}
        </Button>
        {onDownload && <Button onClick={() => onDownload(story._id)} variant="ghost" size="sm" className="text-slate-400 hover:text-white transition-all duration-200">
            <Download className="w-4 h-4 mr-2" />
            {showLabels && '下载'}
          </Button>}
      </div>

      {/* 状态显示 */}
      {getStatusDisplay() && <div className="pt-2 border-t border-slate-700/50">
          {getStatusDisplay()}
        </div>}
    </div>;
}

// 浮动操作按钮组
export function FloatingActionButtons({
  onEdit,
  onDelete,
  onView,
  onShare,
  className
}) {
  const [showMenu, setShowMenu] = useState(false);
  return <div className={cn("relative", className)}>
      {/* 主按钮 */}
      <Button onClick={() => setShowMenu(!showMenu)} className="w-12 h-12 rounded-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 shadow-lg hover:shadow-red-500/25 transition-all duration-300 transform hover:scale-110">
        <MoreVertical className="w-5 h-5" />
      </Button>

      {/* 菜单 */}
      {showMenu && <div className="absolute bottom-16 right-0 bg-slate-800/95 backdrop-blur-sm border border-slate-700 rounded-xl shadow-2xl p-2 min-w-[160px] animate-scale-in">
          <div className="space-y-1">
            <button onClick={() => {
          onView();
          setShowMenu(false);
        }} className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white rounded-lg transition-all duration-200">
              <Eye className="w-4 h-4" />
              <span>查看</span>
            </button>
            <button onClick={() => {
          onEdit();
          setShowMenu(false);
        }} className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white rounded-lg transition-all duration-200">
              <Edit className="w-4 h-4" />
              <span>编辑</span>
            </button>
            <button onClick={() => {
          onShare();
          setShowMenu(false);
        }} className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white rounded-lg transition-all duration-200">
              <Share2 className="w-4 h-4" />
              <span>分享</span>
            </button>
            <hr className="border-slate-700 my-1" />
            <button onClick={() => {
          onDelete();
          setShowMenu(false);
        }} className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-red-400 hover:bg-red-600/10 hover:text-red-300 rounded-lg transition-all duration-200">
              <Trash2 className="w-4 h-4" />
              <span>删除</span>
            </button>
          </div>
        </div>}

      {/* 遮罩层 */}
      {showMenu && <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />}
    </div>;
}

// 批量操作工具栏
export function BatchActionToolbar({
  selectedCount,
  onBatchDelete,
  onBatchEdit,
  onBatchPublish,
  onClearSelection,
  className
}) {
  if (selectedCount === 0) return null;
  return <div className={cn("fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50", "bg-slate-800/95 backdrop-blur-sm border border-slate-700 rounded-xl shadow-2xl p-4", "animate-slide-up", className)}>
      <div className="flex items-center space-x-4">
        <span className="text-sm text-slate-300">
          已选择 {selectedCount} 项
        </span>
        <div className="flex items-center space-x-2">
          <Button onClick={onBatchEdit} size="sm" variant="outline" className="border-blue-600 text-blue-400 hover:bg-blue-600/10">
            <Edit className="w-4 h-4 mr-1" />
            批量编辑
          </Button>
          <Button onClick={onBatchPublish} size="sm" variant="outline" className="border-green-600 text-green-400 hover:bg-green-600/10">
            <CheckCircle className="w-4 h-4 mr-1" />
            批量发布
          </Button>
          <Button onClick={onBatchDelete} size="sm" variant="outline" className="border-red-600 text-red-400 hover:bg-red-600/10">
            <Trash2 className="w-4 h-4 mr-1" />
            批量删除
          </Button>
          <Button onClick={onClearSelection} size="sm" variant="ghost" className="text-slate-400 hover:text-white">
            取消选择
          </Button>
        </div>
      </div>
    </div>;
}