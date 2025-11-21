// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
// @ts-ignore;
import { TrendingUp, TrendingDown } from 'lucide-react';

export function StatCard({
  title,
  value,
  change,
  changeType,
  icon: Icon
}) {
  return <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="w-4 h-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
          {changeType === 'up' ? <TrendingUp className="w-3 h-3 text-green-500" /> : <TrendingDown className="w-3 h-3 text-red-500" />}
          <span className={changeType === 'up' ? 'text-green-500' : 'text-red-500'}>
            {change}%
          </span>
          <span>较上月</span>
        </div>
      </CardContent>
    </Card>;
}