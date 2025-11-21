// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Button } from '@/components/ui';
// @ts-ignore;
import { Settings, Type, LineHeight, Spacing } from 'lucide-react';
// @ts-ignore;
import { cn } from '@/lib/utils';

export function FontSettings({
  fontSettings = {},
  onSettingsChange
}) {
  const [isOpen, setIsOpen] = useState(false);
  const {
    size = 'medium',
    lineHeight = 'relaxed',
    paragraphSpacing = '6'
  } = fontSettings || {};
  const handleSettingChange = (key, value) => {
    if (typeof onSettingsChange === 'function') {
      onSettingsChange({
        ...fontSettings,
        [key]: value
      });
    }
  };
  const sizeOptions = [{
    value: 'small',
    label: '小'
  }, {
    value: 'medium',
    label: '中'
  }, {
    value: 'large',
    label: '大'
  }, {
    value: 'xl',
    label: '特大'
  }];
  const lineHeightOptions = [{
    value: 'tight',
    label: '紧凑'
  }, {
    value: 'normal',
    label: '正常'
  }, {
    value: 'relaxed',
    label: '宽松'
  }, {
    value: 'loose',
    label: '很宽'
  }];
  const spacingOptions = [{
    value: '4',
    label: '紧凑'
  }, {
    value: '6',
    label: '正常'
  }, {
    value: '8',
    label: '宽松'
  }, {
    value: '10',
    label: '很宽'
  }];
  return <div className="relative">
      <Button variant="ghost" size="sm" onClick={() => setIsOpen(!isOpen)} className="text-slate-400 hover:text-white">
        <Settings className="w-4 h-4" />
      </Button>

      {isOpen && <div className="absolute right-0 top-full mt-2 w-64 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-50">
          <div className="p-4 space-y-4">
            <div>
              <div className="flex items-center mb-2">
                <Type className="w-4 h-4 mr-2 text-slate-400" />
                <span className="text-sm text-slate-300">字体大小</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {sizeOptions.map(option => <Button key={option.value} size="sm" variant={size === option.value ? "secondary" : "ghost"} onClick={() => handleSettingChange('size', option.value)} className="text-xs">
                    {option.label}
                  </Button>)}
              </div>
            </div>

            <div>
              <div className="flex items-center mb-2">
                <LineHeight className="w-4 h-4 mr-2 text-slate-400" />
                <span className="text-sm text-slate-300">行高</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {lineHeightOptions.map(option => <Button key={option.value} size="sm" variant={lineHeight === option.value ? "secondary" : "ghost"} onClick={() => handleSettingChange('lineHeight', option.value)} className="text-xs">
                    {option.label}
                  </Button>)}
              </div>
            </div>

            <div>
              <div className="flex items-center mb-2">
                <Spacing className="w-4 h-4 mr-2 text-slate-400" />
                <span className="text-sm text-slate-300">段落间距</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {spacingOptions.map(option => <Button key={option.value} size="sm" variant={paragraphSpacing === option.value ? "secondary" : "ghost"} onClick={() => handleSettingChange('paragraphSpacing', option.value)} className="text-xs">
                    {option.label}
                  </Button>)}
              </div>
            </div>
          </div>
        </div>}
    </div>;
}