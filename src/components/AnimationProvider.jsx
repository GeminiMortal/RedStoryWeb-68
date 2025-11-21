// @ts-ignore;
import React, { createContext, useContext, useState, useEffect } from 'react';
// @ts-ignore;
import { cn } from '@/lib/utils';

// 动画上下文
const AnimationContext = createContext();

// 动画配置
const animationConfig = {
  duration: 300,
  easing: 'ease-out',
  delays: {
    fast: 150,
    normal: 300,
    slow: 500
  }
};

// 动画提供者
export function AnimationProvider({
  children
}) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationType, setAnimationType] = useState('fadeIn');
  const value = {
    isAnimating,
    setIsAnimating,
    animationType,
    setAnimationType,
    config: animationConfig
  };
  return <AnimationContext.Provider value={value}>{children}</AnimationContext.Provider>;
}

// 自定义hook
export function useAnimation() {
  const context = useContext(AnimationContext);
  if (!context) {
    throw new Error('useAnimation must be used within AnimationProvider');
  }
  return context;
}

// 页面切换动画包装器
export function PageTransition({
  children,
  type = 'fadeIn',
  duration = 300
}) {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    setIsVisible(true);
    return () => setIsVisible(false);
  }, []);
  return <div className={cn("transition-all", {
    'opacity-0 translate-y-4': !isVisible,
    'opacity-100 translate-y-0': isVisible
  })} style={{
    transitionDuration: `${duration}ms`,
    transitionTimingFunction: 'ease-out'
  }}>
      {children}
    </div>;
}

// 卡片悬停动画
export function AnimatedCard({
  children,
  delay = 0
}) {
  const [isHovered, setIsHovered] = useState(false);
  return <div className={cn("transition-all duration-300 ease-out", {
    'transform hover:-translate-y-2 hover:scale-[1.02]': true,
    'shadow-lg hover:shadow-2xl': true
  })} style={{
    transitionDelay: `${delay}ms`
  }} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      {children}
    </div>;
}

// 按钮点击动画
export function AnimatedButton({
  children,
  onClick,
  ...props
}) {
  const [isPressed, setIsPressed] = useState(false);
  const handleClick = e => {
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 150);
    if (onClick) onClick(e);
  };
  return <button className={cn("transition-all duration-150 ease-out", {
    'transform scale-95': isPressed,
    'transform scale-100': !isPressed
  }, props.className)} onClick={handleClick} {...props}>
      {children}
    </button>;
}

// 加载动画
export function LoadingSpinner({
  size = 'md'
}) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };
  return <div className={cn("animate-spin rounded-full border-2 border-red-500 border-t-transparent", sizeClasses[size])} />;
}

// 渐入动画
export function FadeIn({
  children,
  delay = 0,
  duration = 300
}) {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);
  return <div className={cn("transition-all", {
    'opacity-0 translate-y-4': !isVisible,
    'opacity-100 translate-y-0': isVisible
  })} style={{
    transitionDuration: `${duration}ms`,
    transitionTimingFunction: 'ease-out'
  }}>
      {children}
    </div>;
}

// 滑动动画
export function SlideIn({
  children,
  direction = 'left',
  delay = 0,
  duration = 300
}) {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);
  const directionClasses = {
    left: {
      initial: 'opacity-0 -translate-x-full',
      visible: 'opacity-100 translate-x-0'
    },
    right: {
      initial: 'opacity-0 translate-x-full',
      visible: 'opacity-100 translate-x-0'
    },
    up: {
      initial: 'opacity-0 translate-y-full',
      visible: 'opacity-100 translate-y-0'
    },
    down: {
      initial: 'opacity-0 -translate-y-full',
      visible: 'opacity-100 translate-y-0'
    }
  };
  const classes = directionClasses[direction];
  return <div className={cn("transition-all", {
    [classes.initial]: !isVisible,
    [classes.visible]: isVisible
  })} style={{
    transitionDuration: `${duration}ms`,
    transitionTimingFunction: 'ease-out'
  }}>
      {children}
    </div>;
}