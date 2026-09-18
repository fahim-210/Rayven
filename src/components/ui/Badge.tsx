import React from 'react';
import { cn } from '../../lib/utils.ts';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'neutral' | 'success' | 'warning' | 'danger' | 'gold' | 'info' | 'outline';
  size?: 'sm' | 'md';
  withDot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'neutral',
  size = 'md',
  withDot = false,
  children,
  ...props
}) => {
  const variantStyles = {
    neutral: 'bg-neutral-800 text-neutral-300 border-neutral-700',
    success: 'bg-emerald-950/70 text-emerald-300 border-emerald-800/60',
    warning: 'bg-amber-950/70 text-amber-300 border-amber-800/60',
    danger: 'bg-red-950/70 text-red-300 border-red-800/60',
    gold: 'bg-amber-400 text-black border-amber-300 font-bold',
    info: 'bg-blue-950/70 text-blue-300 border-blue-800/60',
    outline: 'bg-transparent text-neutral-300 border-neutral-700',
  };

  const dotColors = {
    neutral: 'bg-neutral-400',
    success: 'bg-emerald-400',
    warning: 'bg-amber-400',
    danger: 'bg-red-400',
    gold: 'bg-black',
    info: 'bg-blue-400',
    outline: 'bg-neutral-400',
  };

  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5 tracking-wider',
    md: 'text-xs px-2.5 py-1 tracking-wide',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-semibold rounded-full border uppercase select-none',
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {withDot && (
        <span
          className={cn('w-1.5 h-1.5 rounded-full shrink-0 animate-pulse', dotColors[variant])}
        />
      )}
      <span>{children}</span>
    </span>
  );
};
