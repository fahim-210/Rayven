import React from 'react';
import { cn } from '../../lib/utils.ts';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'gold';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      id,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-amber-400 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none select-none tracking-wide';

    const sizeStyles = {
      sm: 'text-xs h-8 px-3 rounded-md gap-1.5',
      md: 'text-sm h-10 px-4 rounded-lg gap-2',
      lg: 'text-base h-12 px-6 rounded-lg gap-2.5 font-semibold',
    };

    const variantStyles = {
      primary:
        'bg-white text-black hover:bg-neutral-200 border border-white shadow-sm font-semibold',
      secondary:
        'bg-neutral-800 text-neutral-100 hover:bg-neutral-700 border border-neutral-700',
      outline:
        'bg-transparent text-neutral-200 border border-neutral-700 hover:bg-neutral-800/80 hover:text-white',
      ghost:
        'bg-transparent text-neutral-300 hover:bg-neutral-800/60 hover:text-white',
      danger:
        'bg-red-600/90 text-white hover:bg-red-600 border border-red-500/50 shadow-sm',
      gold:
        'bg-amber-400 text-black hover:bg-amber-300 font-bold border border-amber-300 shadow-sm',
    };

    const generatedId = id || `btn-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <button
        ref={ref}
        id={generatedId}
        disabled={disabled || isLoading}
        className={cn(
          baseStyles,
          sizeStyles[size],
          variantStyles[variant],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-current" />
        ) : (
          leftIcon
        )}
        <span>{children}</span>
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';
