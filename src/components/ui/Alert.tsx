import React from 'react';
import { cn } from '../../lib/utils.ts';
import { Info, CheckCircle2, AlertTriangle, AlertCircle, X } from 'lucide-react';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'info' | 'success' | 'warning' | 'danger';
  title?: string;
  message?: string;
  onDismiss?: () => void;
}

export const Alert: React.FC<AlertProps> = ({
  className,
  variant = 'info',
  title,
  message,
  children,
  onDismiss,
  ...props
}) => {
  const icons = {
    info: <Info className="w-5 h-5 text-blue-400 shrink-0" />,
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
    danger: <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />,
  };

  const styles = {
    info: 'bg-blue-950/40 border-blue-900/60 text-blue-200',
    success: 'bg-emerald-950/40 border-emerald-900/60 text-emerald-200',
    warning: 'bg-amber-950/40 border-amber-900/60 text-amber-200',
    danger: 'bg-red-950/40 border-red-900/60 text-red-200',
  };

  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-3 p-4 rounded-xl border text-sm text-left transition-all',
        styles[variant],
        className
      )}
      {...props}
    >
      {icons[variant]}
      <div className="flex-1">
        {title && <h5 className="font-semibold text-white mb-0.5 tracking-wide">{title}</h5>}
        <div className="text-xs leading-relaxed opacity-90">{children || message}</div>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="text-current opacity-70 hover:opacity-100 p-0.5 rounded transition-opacity"
          aria-label="Dismiss alert"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
