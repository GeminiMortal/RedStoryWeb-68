// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { cn } from '@/lib/utils';

export function ContentRenderer({
  content = '',
  fontSettings = {}
}) {
  if (!content || typeof content !== 'string') {
    return <div className="text-slate-400 text-center py-8">
        <p>暂无内容</p>
      </div>;
  }
  const {
    size = 'medium',
    lineHeight = 'relaxed',
    paragraphSpacing = '6'
  } = fontSettings || {};
  const sizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg',
    xl: 'text-xl'
  };
  const lineHeightClasses = {
    tight: 'leading-tight',
    normal: 'leading-normal',
    relaxed: 'leading-relaxed',
    loose: 'leading-loose'
  };
  const spacingClasses = {
    4: 'space-y-4',
    6: 'space-y-6',
    8: 'space-y-8',
    10: 'space-y-10'
  };

  // 简单的Markdown解析
  const renderContent = text => {
    if (!text) return [];
    const lines = text.split('\n').filter(line => line.trim());
    const elements = [];
    let inList = false;
    let listItems = [];
    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('# ')) {
        if (inList) {
          elements.push(<ul key={`list-${index}`} className="list-disc list-inside space-y-2 mb-4">
              {listItems}
            </ul>);
          listItems = [];
          inList = false;
        }
        elements.push(<h1 key={`h1-${index}`} className="text-3xl font-bold text-white mb-4">
            {trimmedLine.substring(2)}
          </h1>);
      } else if (trimmedLine.startsWith('## ')) {
        if (inList) {
          elements.push(<ul key={`list-${index}`} className="list-disc list-inside space-y-2 mb-4">
              {listItems}
            </ul>);
          listItems = [];
          inList = false;
        }
        elements.push(<h2 key={`h2-${index}`} className="text-2xl font-bold text-white mb-3">
            {trimmedLine.substring(3)}
          </h2>);
      } else if (trimmedLine.startsWith('### ')) {
        if (inList) {
          elements.push(<ul key={`list-${index}`} className="list-disc list-inside space-y-2 mb-4">
              {listItems}
            </ul>);
          listItems = [];
          inList = false;
        }
        elements.push(<h3 key={`h3-${index}`} className="text-xl font-bold text-white mb-2">
            {trimmedLine.substring(4)}
          </h3>);
      } else if (trimmedLine.startsWith('- ')) {
        inList = true;
        listItems.push(<li key={`li-${index}`} className="text-slate-300">
            {trimmedLine.substring(2)}
          </li>);
      } else if (trimmedLine.startsWith('> ')) {
        if (inList) {
          elements.push(<ul key={`list-${index}`} className="list-disc list-inside space-y-2 mb-4">
              {listItems}
            </ul>);
          listItems = [];
          inList = false;
        }
        elements.push(<blockquote key={`quote-${index}`} className="border-l-4 border-red-500 pl-4 italic text-slate-300 mb-4">
            {trimmedLine.substring(2)}
          </blockquote>);
      } else if (trimmedLine) {
        if (inList) {
          elements.push(<ul key={`list-${index}`} className="list-disc list-inside space-y-2 mb-4">
              {listItems}
            </ul>);
          listItems = [];
          inList = false;
        }
        elements.push(<p key={`p-${index}`} className="text-slate-300 mb-4">
            {trimmedLine}
          </p>);
      }
    });
    if (inList && listItems.length > 0) {
      elements.push(<ul key="final-list" className="list-disc list-inside space-y-2 mb-4">
          {listItems}
        </ul>);
    }
    return elements;
  };
  return <div className={cn("prose prose-invert max-w-none", sizeClasses[size] || sizeClasses.medium, lineHeightClasses[lineHeight] || lineHeightClasses.relaxed, spacingClasses[paragraphSpacing] || spacingClasses[6])}>
      {renderContent(content)}
    </div>;
}