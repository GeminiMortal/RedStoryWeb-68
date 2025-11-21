// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Search, Bell, Settings } from 'lucide-react';
// @ts-ignore;
import { Avatar, AvatarFallback, AvatarImage, Input, Button } from '@/components/ui';

export function Header({
  onSearch
}) {
  return <header className="bg-white border-b px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input type="text" placeholder="搜索..." className="pl-10" onChange={e => onSearch(e.target.value)} />
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon">
            <Bell className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Settings className="w-5 h-5" />
          </Button>
          <Avatar>
            <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face" />
            <AvatarFallback>AD</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>;
}