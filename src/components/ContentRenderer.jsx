// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { cn } from '@/lib/utils';

export const ContentRenderer = ({
  content,
  fontSettings
}) => {
  // 处理内容格式
  const processContent = text => {
    if (!text) return [];

    // 处理换行和段落
    const paragraphs = text.split(/\n\n+/).map(p => p.trim()).filter(p => p.length > 0);
    return paragraphs.map(paragraph => {
      let processed = paragraph;

      // 处理标题标记
      processed = processed.replace(/^### (.*$)/gm, '<h3 class="text-xl font-bold mb-3 text-red-400">$1</h3>');
      processed = processed.replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold mb-4 text-red-400">$1</h2>');
      processed = processed.replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold mb-6 text-red-400">$1</h1>');

      // 处理粗体
      processed = processed.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-white">$1</strong>');

      // 处理斜体
      processed = processed.replace(/\*(.*?)\*/g, '<em class="italic text-slate-300">$1</em>');

      // 处理引用
      processed = processed.replace(/^> (.*$)/gm, '<blockquote class="border-l-4 border-red-500 pl-4 italic text-slate-400 my-4">$1</blockquote>');

      // 处理列表
      processed = processed.replace(/^\* (.*$)/gm, '<li class="ml-4 mb-1 text-slate-300">• $1</li>');
      processed = processed.replace(/^- (.*$)/gm, '<li class="ml-4 mb-1 text-slate-300">• $1</li>');
      processed = processed.replace(/^(\d+)\. (.*$)/gm, '<li class="ml-4 mb-1 text-slate-300">$1. $2</li>');

      // 处理代码块
      processed = processed.replace(/```([\s\S]*?)```/g, '<pre class="bg-slate-800 p-4 rounded-lg my-4 overflow-x-auto"><code class="text-sm font-mono text-green-400">$1</code></pre>');

      // 处理行内代码
      processed = processed.replace(/`([^`]+)`/g, '<code class="bg-slate-700 px-2 py-1 rounded text-sm font-mono text-green-400">$1</code>');

      // 处理链接
      processed = processed.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-red-400 hover:text-red-300 underline" target="_blank" rel="noopener noreferrer">$1</a>');

      // 处理换行
      processed = processed.replace(/\n/g, '<br>');
      return processed;
    });
  };
  const paragraphs = processContent(content);
  return <div className={cn("prose prose-invert max-w-none font-serif", fontSettings.size === 'small' && 'text-sm leading-relaxed', fontSettings.size === 'medium' && 'text-base leading-relaxed', fontSettings.size === 'large' && 'text-lg leading-loose')}>
      {paragraphs.map((paragraph, index) => <div key={index} className={cn("transition-opacity duration-300", fontSettings.size === 'small' && 'mb-4', fontSettings.size === 'medium' && 'mb-5', fontSettings.size === 'large' && 'mb-6')} style={{
      animationDelay: `${index * 50}ms`
    }} dangerouslySetInnerHTML={{
      __html: paragraph
    }} />)}
    </div>;
};