// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { cn } from '@/lib/utils';

// 动画卡片组件 - 修复重复定义问题
export const AnimatedCard = ({
  children,
  delay = 0,
  className,
  ...props
}) => {
  const [isVisible, setIsVisible] = React.useState(false);
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);
  return <div className={cn("transition-all duration-700 ease-out", isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4", className)} {...props}>
      {children}
    </div>;
};

// 确保只导出一次
export default AnimatedCard;