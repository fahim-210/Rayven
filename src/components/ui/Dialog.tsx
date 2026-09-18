import React, { useEffect } from 'react';
import { cn } from '../../lib/utils.ts';
import { X } from 'lucide-react';

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showCloseButton?: boolean;
}

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth,
  size = 'md',
  showCloseButton = true,
}) => {
  const actualMaxWidth = maxWidth || size;
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={cn(
          'w-full bg-neutral-900 border border-neutral-700/80 rounded-xl shadow-2xl overflow-hidden flex flex-col text-left transition-all duration-200 scale-100',
          maxWidthClasses[actualMaxWidth]
        )}
      >
        {(title || showCloseButton) && (
          <div className="flex items-start justify-between p-5 border-b border-neutral-800">
            <div>
              {title && (
                <h3 className="text-lg font-bold text-white font-heading tracking-wide">
                  {title}
                </h3>
              )}
              {description && (
                <p className="text-xs text-neutral-400 mt-1">{description}</p>
              )}
            </div>
            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        <div className="p-5 overflow-y-auto max-h-[80vh]">{children}</div>
      </div>
    </div>
  );
};

// Modal alias for convenience
export const Modal = Dialog;
