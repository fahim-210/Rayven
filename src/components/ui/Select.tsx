import React from 'react';
import { cn } from '../../lib/utils.ts';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
  helperText?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, options, error, helperText, id, ...props }, ref) => {
    const selectId = id || `sel-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="w-full flex flex-col gap-1.5 text-left">
        {label && (
          <label
            htmlFor={selectId}
            className="text-xs font-semibold uppercase tracking-wider text-neutral-300"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              'w-full h-10 pl-3.5 pr-9 bg-neutral-900/90 text-neutral-100 text-sm rounded-lg border border-neutral-700/80 transition-all appearance-none cursor-pointer',
              'focus:outline-none focus:border-amber-400/90 focus:ring-1 focus:ring-amber-400/90',
              'disabled:opacity-50 disabled:bg-neutral-950 disabled:cursor-not-allowed',
              error && 'border-red-500/80 focus:border-red-500 focus:ring-red-500',
              className
            )}
            {...props}
          >
            {options.map((opt) => (
              <option
                key={opt.value}
                value={opt.value}
                disabled={opt.disabled}
                className="bg-neutral-900 text-neutral-100 py-1"
              >
                {opt.label}
              </option>
            ))}
          </select>
          <div className="absolute right-3 pointer-events-none text-neutral-400 flex items-center">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>

        {error && <p className="text-xs text-red-400 font-medium">{error}</p>}
        {helperText && !error && (
          <p className="text-xs text-neutral-400">{helperText}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
