// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { cn } from '@/lib/utils';

export function AnimatedCard({
  children,
  className,
  hover = true,
  delay = 0,
  ...props
}) {
  return <div className={cn("bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden shadow-xl transition-all duration-300", hover && "card-hover hover:border-red-500/50 hover:shadow-2xl hover:shadow-red-500/10", "animate-fade-in", className)} style={{
    animationDelay: `${delay}ms`
  }} {...props}>
      {children}
    </div>;
}

// 统计卡片组件
export function StatCard({
  title,
  value,
  icon: Icon,
  color = 'blue',
  className,
  delay = 0
}) {
  const colorClasses = {
    blue: 'bg-blue-500/20 text-blue-400',
    red: 'bg-red-500/20 text-red-400',
    green: 'bg-green-500/20 text-green-400',
    yellow: 'bg-yellow-500/20 text-yellow-400',
    purple: 'bg-purple-500/20 text-purple-400'
  };
  return <AnimatedCard className={cn("p-6", className)} delay={delay}>
      <div className="flex items-center space-x-4">
        <div className={cn("p-3 rounded-xl", colorClasses[color] || colorClasses.blue)}>
          {Icon && <Icon className="w-6 h-6" />}
        </div>
        <div>
          <p className="text-slate-400 text-sm font-medium">{title}</p>
          <p className="text-white text-2xl font-bold">{value}</p>
        </div>
      </div>
    </AnimatedCard>;
}

// 信息卡片组件
export function InfoCard({
  title,
  description,
  icon: Icon,
  action,
  className,
  delay = 0
}) {
  return <AnimatedCard className={cn("p-6", className)} delay={delay}>
      <div className="flex items-start space-x-4">
        {Icon && <div className="p-2 bg-red-500/20 text-red-400 rounded-lg flex-shrink-0">
            <Icon className="w-5 h-5" />
          </div>}
        <div className="flex-1">
          <h3 className="text-white font-semibold mb-2">{title}</h3>
          <p className="text-slate-400 text-sm mb-4">{description}</p>
          {action}
        </div>
      </div>
    </AnimatedCard>;
}