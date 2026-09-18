import React from 'react';
import { cn } from '../../lib/utils.ts';
import { Button } from './Button.tsx';
import { PackageOpen } from 'lucide-react';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-neutral-800 bg-neutral-950/40 max-w-md mx-auto my-6',
        className
      )}
    >
      <div className="w-14 h-14 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-amber-400 mb-4 shadow-inner">
        {icon || <PackageOpen className="w-7 h-7" />}
      </div>
      <h4 className="text-base font-bold text-white font-heading tracking-wide mb-1.5">{title}</h4>
      <p className="text-xs text-neutral-400 max-w-xs leading-relaxed mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
