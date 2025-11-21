// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from '@/components/ui';
// @ts-ignore;
import { Eye, Edit, Trash2 } from 'lucide-react';

const mockContent = [{
  id: 1,
  title: '如何构建现代化Web应用',
  author: '张三',
  status: 'published',
  views: 1234,
  createdAt: '2024-01-15'
}, {
  id: 2,
  title: 'React最佳实践指南',
  author: '李四',
  status: 'draft',
  views: 0,
  createdAt: '2024-01-14'
}, {
  id: 3,
  title: 'Tailwind CSS入门教程',
  author: '王五',
  status: 'review',
  views: 567,
  createdAt: '2024-01-13'
}];
export function ContentManagement() {
  return <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">内容管理</h1>
        <p className="text-gray-500">管理系统中的所有内容</p>
      </div>

      <div className="grid gap-4">
        {mockContent.map(content => <Card key={content.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{content.title}</CardTitle>
                  <p className="text-sm text-gray-500">作者: {content.author}</p>
                </div>
                <Badge variant={content.status === 'published' ? 'default' : content.status === 'draft' ? 'secondary' : 'outline'}>
                  {content.status === 'published' ? '已发布' : content.status === 'draft' ? '草稿' : '审核中'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  浏览量: {content.views} | 创建时间: {content.createdAt}
                </div>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm">
                    <Eye className="w-4 h-4 mr-2" />
                    查看
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Edit className="w-4 h-4 mr-2" />
                    编辑
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-600">
                    <Trash2 className="w-4 h-4 mr-2" />
                    删除
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>)}
      </div>
    </div>;
}