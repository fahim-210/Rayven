import React, { useState } from 'react';
import { cn } from '../../lib/utils.ts';
import { Eye, EyeOff, Search, X } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  isSearch?: boolean;
  onClear?: () => void;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = 'text',
      label,
      error,
      helperText,
      isSearch = false,
      onClear,
      leftElement,
      rightElement,
      id,
      value,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputId = id || `inp-${Math.random().toString(36).substr(2, 9)}`;
    const isPassword = type === 'password';
    const computedType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className="w-full flex flex-col gap-1.5 text-left">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-semibold uppercase tracking-wider text-neutral-300"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {isSearch && (
            <div className="absolute left-3 text-neutral-400 pointer-events-none flex items-center justify-center">
              <Search className="w-4 h-4" />
            </div>
          )}

          {leftElement && !isSearch && (
            <div className="absolute left-3 text-neutral-400 flex items-center">
              {leftElement}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            type={computedType}
            value={value}
            className={cn(
              'w-full h-10 px-3.5 bg-neutral-900/90 text-neutral-100 placeholder:text-neutral-500 text-sm rounded-lg border border-neutral-700/80 transition-all duration-150',
              'focus:outline-none focus:border-amber-400/90 focus:ring-1 focus:ring-amber-400/90',
              'disabled:opacity-50 disabled:bg-neutral-950 disabled:cursor-not-allowed',
              isSearch && 'pl-9',
              leftElement && 'pl-9',
              (isPassword || rightElement || onClear) && 'pr-10',
              error && 'border-red-500/80 focus:border-red-500 focus:ring-red-500',
              className
            )}
            {...props}
          />

          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              className="absolute right-3 text-neutral-400 hover:text-neutral-200 focus:outline-none"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          )}

          {onClear && value && !isPassword && (
            <button
              type="button"
              onClick={onClear}
              tabIndex={-1}
              className="absolute right-3 text-neutral-400 hover:text-neutral-200 focus:outline-none"
              aria-label="Clear input"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {rightElement && !isPassword && !onClear && (
            <div className="absolute right-3 text-neutral-400 flex items-center">
              {rightElement}
            </div>
          )}
        </div>

        {error && <p className="text-xs text-red-400 font-medium">{error}</p>}
        {helperText && !error && (
          <p className="text-xs text-neutral-400">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
