// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { cn } from '@/lib/utils';

// 淡入动画组件
export const FadeIn = ({
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
  return <div className={cn("transition-opacity duration-700 ease-out", isVisible ? "opacity-100" : "opacity-0", className)} {...props}>
      {children}
    </div>;
};

// 滑动动画组件
export const SlideIn = ({
  children,
  direction = 'up',
  delay = 0,
  className,
  ...props
}) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const translateClasses = {
    up: 'translate-y-4',
    down: '-translate-y-4',
    left: 'translate-x-4',
    right: '-translate-x-4'
  };
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);
  return <div className={cn("transition-all duration-700 ease-out", isVisible ? "opacity-100 translate-y-0 translate-x-0" : `opacity-0 ${translateClasses[direction]}`, className)} {...props}>
      {children}
    </div>;
};

// 缩放动画组件
export const ScaleIn = ({
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
  return <div className={cn("transition-all duration-700 ease-out", isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95", className)} {...props}>
      {children}
    </div>;
};