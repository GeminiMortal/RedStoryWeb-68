// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Card, CardContent } from '@/components/ui';
// @ts-ignore;
import { BookOpen, FileText, Calendar } from 'lucide-react';

export function AdminStats({
  publishedCount,
  draftCount,
  totalCount
}) {
  return <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">已发布故事</p>
              <p className="text-2xl font-bold text-white">{publishedCount}</p>
            </div>
            <BookOpen className="w-8 h-8 text-green-500" />
          </div>
        </CardContent>
      </Card>
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">草稿箱</p>
              <p className="text-2xl font-bold text-white">{draftCount}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-500" />
          </div>
        </CardContent>
      </Card>
      <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">总计</p>
              <p className="text-2xl font-bold text-white">{totalCount}</p>
            </div>
            <Calendar className="w-8 h-8 text-orange-500" />
          </div>
        </CardContent>
      </Card>
    </div>;
}