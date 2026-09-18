import React from 'react';
import { cn } from '../../lib/utils.ts';
import { Check } from 'lucide-react';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
  description?: string;
  error?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, error, id, checked, disabled, ...props }, ref) => {
    const inputId = id || `chk-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="flex flex-col gap-1">
        <label
          htmlFor={inputId}
          className={cn(
            'flex items-start gap-2.5 cursor-pointer select-none group',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <div className="relative flex items-center justify-center mt-0.5">
            <input
              ref={ref}
              id={inputId}
              type="checkbox"
              checked={checked}
              disabled={disabled}
              className="peer sr-only"
              {...props}
            />
            <div
              className={cn(
                'w-4 h-4 rounded border border-neutral-600 bg-neutral-900 transition-all flex items-center justify-center',
                'peer-checked:bg-amber-400 peer-checked:border-amber-400 peer-focus-visible:ring-2 peer-focus-visible:ring-amber-400 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-neutral-900',
                error && 'border-red-500',
                className
              )}
            >
              <Check className="w-3 h-3 text-black opacity-0 peer-checked:opacity-100 stroke-[3] transition-opacity" />
            </div>
          </div>

          {(label || description) && (
            <div className="text-left">
              {label && (
                <span className="text-sm font-medium text-neutral-200 group-hover:text-white transition-colors">
                  {label}
                </span>
              )}
              {description && (
                <p className="text-xs text-neutral-400 mt-0.5 leading-relaxed">{description}</p>
              )}
            </div>
          )}
        </label>
        {error && <p className="text-xs text-red-400 font-medium ml-6">{error}</p>}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
