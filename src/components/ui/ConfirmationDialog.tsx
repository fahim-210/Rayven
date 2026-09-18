import React from 'react';
import { Dialog } from './Dialog.tsx';
import { Button } from './Button.tsx';
import { AlertTriangle } from 'lucide-react';

export interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: React.ReactNode;
  confirmLabel?: string;
  confirmText?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  variant?: 'danger' | 'warning' | string;
  isLoading?: boolean;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel,
  confirmText = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive,
  variant,
  isLoading = false,
}) => {
  const isActuallyDestructive = isDestructive ?? (variant === 'danger');
  const actualConfirmLabel = confirmLabel || confirmText;
  return (
    <Dialog isOpen={isOpen} onClose={onClose} maxWidth="sm" showCloseButton={!isLoading}>
      <div className="flex flex-col items-center text-center p-2">
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${
            isActuallyDestructive
              ? 'bg-red-950/60 text-red-400 border border-red-800/60 shadow-lg shadow-red-950/30'
              : 'bg-amber-950/60 text-amber-400 border border-amber-800/60 shadow-lg shadow-amber-950/30'
          }`}
        >
          <AlertTriangle className="w-6 h-6" />
        </div>

        <h4 className="text-base font-bold text-white font-heading tracking-wide mb-2">
          {title}
        </h4>

        <div className="text-xs text-neutral-300 leading-relaxed mb-6 max-w-xs">
          {message}
        </div>

        <div className="flex items-center gap-3 w-full">
          <Button
            variant="outline"
            size="md"
            className="flex-1"
            disabled={isLoading}
            onClick={onClose}
          >
            {cancelLabel}
          </Button>

          <Button
            variant={isActuallyDestructive ? 'danger' : 'primary'}
            size="md"
            className="flex-1"
            isLoading={isLoading}
            onClick={onConfirm}
          >
            {actualConfirmLabel}
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
