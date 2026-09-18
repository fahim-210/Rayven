import React from 'react';
import { cn } from '../../lib/utils.ts';
import { Loader2 } from 'lucide-react';

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  label,
  className,
  ...props
}) => {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-10 h-10 border-3',
  };

  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 p-4', className)} {...props}>
      <Loader2 className={cn('animate-spin text-amber-400', sizes[size])} />
      {label && <p className="text-xs text-neutral-400 font-medium tracking-wider uppercase">{label}</p>}
    </div>
  );
};

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'rect' | 'circle';
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'rect',
  width,
  height,
  className,
  style,
  ...props
}) => {
  const variants = {
    text: 'h-4 rounded-md',
    rect: 'rounded-lg',
    circle: 'rounded-full',
  };

  return (
    <div
      className={cn('animate-pulse bg-neutral-800/80', variants[variant], className)}
      style={{ width, height, ...style }}
      {...props}
    />
  );
};

export const PageLoadingState: React.FC<{ message?: string }> = ({
  message = 'Loading RAYVEN platform...',
}) => {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4 text-center px-4">
      <div className="relative flex items-center justify-center">
        <div className="w-16 h-16 rounded-full border-2 border-neutral-800 border-t-amber-400 animate-spin" />
        <span className="absolute font-heading font-black text-xs tracking-widest text-amber-400">
          RYV
        </span>
      </div>
      <p className="text-sm font-medium text-neutral-300 tracking-wide">{message}</p>
    </div>
  );
};

export const Loading = PageLoadingState;
