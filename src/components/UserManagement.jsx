// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Button, Input } from '@/components/ui';
// @ts-ignore;
import { Plus } from 'lucide-react';

import { UserTable } from '@/components/UserTable';
import { DataPagination } from '@/components/Pagination';
const mockUsers = [{
  id: 1,
  name: '张三',
  username: 'zhangsan',
  email: 'zhangsan@example.com',
  status: 'active',
  createdAt: '2024-01-15'
}, {
  id: 2,
  name: '李四',
  username: 'lisi',
  email: 'lisi@example.com',
  status: 'active',
  createdAt: '2024-01-14'
}, {
  id: 3,
  name: '王五',
  username: 'wangwu',
  email: 'wangwu@example.com',
  status: 'inactive',
  createdAt: '2024-01-13'
}
// 更多用户...
];
export function UserManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;
  const filteredUsers = mockUsers.filter(user => user.name.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase()));
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const startIndex = (currentPage - 1) * usersPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + usersPerPage);
  const handleEdit = user => {
    console.log('编辑用户:', user);
  };
  const handleDelete = user => {
    console.log('删除用户:', user);
  };
  return <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">用户管理</h1>
          <p className="text-gray-500">管理系统中的所有用户</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          添加用户
        </Button>
      </div>

      <div className="flex justify-between items-center">
        <Input placeholder="搜索用户..." className="max-w-sm" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
      </div>

      <UserTable users={paginatedUsers} onEdit={handleEdit} onDelete={handleDelete} />

      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">
          显示 {startIndex + 1} 到 {Math.min(startIndex + usersPerPage, filteredUsers.length)} 条，
          共 {filteredUsers.length} 条记录
        </p>
        <DataPagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>
    </div>;
}