import React from 'react';
import { cn } from '../../lib/utils.ts';

export interface RadioOption {
  value: string;
  label: React.ReactNode;
  description?: string;
  disabled?: boolean;
}

export interface RadioGroupProps {
  name: string;
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
  className?: string;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  name,
  options,
  value,
  onChange,
  label,
  error,
  className,
}) => {
  return (
    <div className={cn('flex flex-col gap-2 text-left', className)}>
      {label && (
        <span className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
          {label}
        </span>
      )}
      <div className="flex flex-col gap-2">
        {options.map((opt) => {
          const isSelected = value === opt.value;
          const optId = `${name}-${opt.value}`;

          return (
            <label
              key={opt.value}
              htmlFor={optId}
              className={cn(
                'flex items-start gap-3 p-3 rounded-lg border border-neutral-800 bg-neutral-900/60 cursor-pointer transition-all duration-150',
                isSelected && 'border-amber-400/80 bg-neutral-900 ring-1 ring-amber-400/50',
                opt.disabled && 'opacity-40 cursor-not-allowed'
              )}
            >
              <div className="relative flex items-center justify-center mt-0.5">
                <input
                  id={optId}
                  type="radio"
                  name={name}
                  value={opt.value}
                  checked={isSelected}
                  disabled={opt.disabled}
                  onChange={() => onChange(opt.value)}
                  className="peer sr-only"
                />
                <div
                  className={cn(
                    'w-4 h-4 rounded-full border border-neutral-600 bg-neutral-950 flex items-center justify-center transition-all',
                    isSelected && 'border-amber-400'
                  )}
                >
                  {isSelected && <div className="w-2 h-2 rounded-full bg-amber-400" />}
                </div>
              </div>

              <div className="flex-1">
                <span className="text-sm font-medium text-neutral-200">{opt.label}</span>
                {opt.description && (
                  <p className="text-xs text-neutral-400 mt-0.5">{opt.description}</p>
                )}
              </div>
            </label>
          );
        })}
      </div>
      {error && <p className="text-xs text-red-400 font-medium">{error}</p>}
    </div>
  );
};
