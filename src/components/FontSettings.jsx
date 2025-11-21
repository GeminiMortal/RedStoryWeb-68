// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Button } from '@/components/ui';
// @ts-ignore;
import { Text } from 'lucide-react';
// @ts-ignore;
import { cn } from '@/lib/utils';

export const FontSettings = ({
  fontSettings,
  onSettingsChange
}) => {
  const fontSizes = [{
    key: 'small',
    label: '小',
    icon: 'A'
  }, {
    key: 'medium',
    label: '中',
    icon: 'A'
  }, {
    key: 'large',
    label: '大',
    icon: 'A'
  }];
  return <div className="flex items-center space-x-2">
      <Text className="w-4 h-4 text-slate-400" />
      {fontSizes.map(size => <Button key={size.key} variant={fontSettings.size === size.key ? "default" : "ghost"} size="sm" onClick={() => onSettingsChange({
      ...fontSettings,
      size: size.key
    })} className={cn("px-3 py-1", fontSettings.size === size.key && "bg-red-500 hover:bg-red-600")}>
          <span className={cn("font-bold", size.key === 'small' && "text-xs", size.key === 'medium' && "text-sm", size.key === 'large' && "text-base")}>
            {size.icon}
          </span>
        </Button>)}
    </div>;
};