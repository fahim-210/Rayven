import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../lib/utils.ts';

export interface DropdownItem {
  id?: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  danger?: boolean;
  separator?: boolean;
}

export interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: 'left' | 'right';
  className?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  items,
  align = 'right',
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={cn('relative inline-block text-left', className)} ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <div
          className={cn(
            'absolute z-50 mt-2 min-w-[200px] rounded-lg bg-neutral-900 border border-neutral-700/80 shadow-2xl py-1 text-left animate-in fade-in zoom-in-95 duration-100',
            align === 'right' ? 'right-0' : 'left-0'
          )}
        >
          {items.map((item, index) => {
            if (item.separator) {
              return <div key={`sep-${index}`} className="my-1 border-t border-neutral-800" />;
            }

            return (
              <button
                key={item.id || `drop-item-${index}`}
                disabled={item.disabled}
                onClick={() => {
                  if (item.onClick) item.onClick();
                  setIsOpen(false);
                }}
                className={cn(
                  'w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium transition-colors text-left',
                  item.danger
                    ? 'text-red-400 hover:bg-red-500/10 hover:text-red-300'
                    : 'text-neutral-200 hover:bg-neutral-800 hover:text-white',
                  item.disabled && 'opacity-40 cursor-not-allowed'
                )}
              >
                {item.icon && <span className="w-4 h-4 flex items-center">{item.icon}</span>}
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
