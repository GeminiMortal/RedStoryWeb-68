// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Card, CardContent, Button } from '@/components/ui';
// @ts-ignore;
import { User, Calendar, CheckSquare, Square, Send, Trash2, Edit3, FileText } from 'lucide-react';

export function DraftList({
  drafts,
  selectedDrafts,
  batchProcessing,
  onSelectDraft,
  onEditDraft,
  onPublishDraft,
  onDeleteDraft,
  onBatchPublish,
  onBatchDelete
}) {
  const formatDate = timestamp => {
    if (!timestamp) return '未知时间';
    try {
      return new Date(timestamp).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return '日期格式错误';
    }
  };
  const handleSelectAll = () => {
    const filteredDrafts = drafts;
    if (selectedDrafts.size === filteredDrafts.length) {
      onSelectDraft(new Set());
    } else {
      onSelectDraft(new Set(filteredDrafts.map(draft => draft._id)));
    }
  };
  const handleSelectDraft = draftId => {
    const newSelected = new Set(selectedDrafts);
    if (newSelected.has(draftId)) {
      newSelected.delete(draftId);
    } else {
      newSelected.add(draftId);
    }
    onSelectDraft(newSelected);
  };
  if (drafts.length === 0) {
    return <div>
        <h2 className="text-xl font-bold text-white mb-4 flex items-center">
          <FileText className="w-5 h-5 mr-2 text-blue-500" />
          草稿箱 (0)
        </h2>
        <div className="text-center py-8 bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/30">
          <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">暂无草稿</p>
        </div>
      </div>;
  }
  const selectedDraftList = drafts.filter(draft => selectedDrafts.has(draft._id));
  return <div>
      {/* 批量操作栏 */}
      {drafts.length > 0 && <div className="mb-4 p-4 bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center">
              <FileText className="w-5 h-5 mr-2 text-blue-500" />
              草稿箱 ({drafts.length})
            </h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-slate-400">
                已选择 {selectedDrafts.size} 个
              </span>
              <Button onClick={handleSelectAll} variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                {selectedDrafts.size === drafts.length ? <CheckSquare className="w-4 h-4 mr-2" /> : <Square className="w-4 h-4 mr-2" />}
                {selectedDrafts.size === drafts.length ? '取消全选' : '全选'}
              </Button>
              {selectedDrafts.size > 0 && <>
                  <Button onClick={() => onBatchPublish(selectedDraftList.map(d => d._id))} disabled={batchProcessing} variant="outline" size="sm" className="border-green-600 text-green-400 hover:bg-green-600/10">
                    <Send className="w-4 h-4 mr-2" />
                    批量发布
                  </Button>
                  <Button onClick={() => onBatchDelete(selectedDraftList.map(d => d._id))} disabled={batchProcessing} variant="outline" size="sm" className="border-red-600 text-red-400 hover:bg-red-600/10">
                    <Trash2 className="w-4 h-4 mr-2" />
                    批量删除
                  </Button>
                </>}
            </div>
          </div>
        </div>}

      <div className="space-y-4">
        {drafts.map(draft => <Card key={draft._id} className={`bg-slate-800/50 backdrop-blur-sm border transition-all duration-300 ${selectedDrafts.has(draft._id) ? "border-blue-500/50 bg-blue-500/5" : "border-slate-700/50 hover:border-blue-500/50"}`}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <Button onClick={() => handleSelectDraft(draft._id)} variant="ghost" size="sm" className="mt-1 p-1">
                    {selectedDrafts.has(draft._id) ? <CheckSquare className="w-4 h-4 text-blue-400" /> : <Square className="w-4 h-4 text-slate-400" />}
                  </Button>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {draft.title || '无标题'}
                    </h3>
                    <p className="text-slate-400 text-sm mb-3 line-clamp-2">
                      {draft.content || '暂无内容'}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-slate-500">
                      <span className="flex items-center">
                        <User className="w-3 h-3 mr-1" />
                        {draft.author || '佚名'}
                      </span>
                      <span className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {formatDate(draft.updatedAt)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <Button onClick={e => onEditDraft(draft._id, e)} variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                    <Edit3 className="w-4 h-4" />
                  </Button>
                  <Button onClick={e => onPublishDraft(draft._id, e)} variant="ghost" size="sm" className="text-slate-400 hover:text-green-400">
                    <Send className="w-4 h-4" />
                  </Button>
                  <Button onClick={e => onDeleteDraft(draft._id, e)} variant="ghost" size="sm" className="text-slate-400 hover:text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>)}
      </div>
    </div>;
}