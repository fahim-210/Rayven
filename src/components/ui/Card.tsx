import React from 'react';
import { cn } from '../../lib/utils.ts';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'glass' | 'interactive';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', children, id, ...props }, ref) => {
    const cardId = id || `card-${Math.random().toString(36).substr(2, 9)}`;

    const variants = {
      default: 'bg-neutral-900/90 border border-neutral-800 text-neutral-100',
      elevated: 'bg-neutral-900 border border-neutral-700/60 shadow-xl shadow-black/40 text-neutral-100',
      glass: 'bg-neutral-900/60 backdrop-blur-md border border-neutral-800/80 text-neutral-100',
      interactive: 'bg-neutral-900/80 border border-neutral-800 hover:border-neutral-700 hover:bg-neutral-800/60 transition-all cursor-pointer text-neutral-100',
    };

    return (
      <div
        ref={ref}
        id={cardId}
        className={cn('rounded-xl overflow-hidden', variants[variant], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = 'Card';

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => (
  <div className={cn('p-5 border-b border-neutral-800/80 flex flex-col gap-1', className)} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  className,
  children,
  ...props
}) => (
  <h3 className={cn('text-base font-bold text-white font-heading tracking-wide', className)} {...props}>
    {children}
  </h3>
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  className,
  children,
  ...props
}) => (
  <p className={cn('text-xs text-neutral-400 leading-relaxed', className)} {...props}>
    {children}
  </p>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => (
  <div className={cn('p-5', className)} {...props}>
    {children}
  </div>
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => (
  <div className={cn('p-4 px-5 border-t border-neutral-800/80 bg-neutral-950/40 flex items-center justify-between', className)} {...props}>
    {children}
  </div>
);
