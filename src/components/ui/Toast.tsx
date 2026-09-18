import React, { createContext, useContext, useState, useCallback } from 'react';
import { cn } from '../../lib/utils.ts';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

export interface AddToastOptions {
  type: ToastType;
  title: string;
  message?: string;
  description?: string;
  duration?: number;
}

interface ToastContextValue {
  showToast: (props: Omit<ToastItem, 'id'>) => void;
  toast: (props: Omit<ToastItem, 'id'>) => void;
  addToast: (optionsOrType: AddToastOptions | ToastType, message?: string, title?: string) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    ({ type, title, message, duration = 4000 }: Omit<ToastItem, 'id'>) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
      const newToast: ToastItem = { id, type, title, message, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const success = useCallback((title: string, message?: string) => showToast({ type: 'success', title, message }), [showToast]);
  const error = useCallback((title: string, message?: string) => showToast({ type: 'error', title, message }), [showToast]);
  const warning = useCallback((title: string, message?: string) => showToast({ type: 'warning', title, message }), [showToast]);
  const info = useCallback((title: string, message?: string) => showToast({ type: 'info', title, message }), [showToast]);
  const addToast = useCallback(
    (optionsOrType: AddToastOptions | ToastType, message?: string, title?: string) => {
      if (typeof optionsOrType === 'object') {
        showToast({
          type: optionsOrType.type,
          title: optionsOrType.title,
          message: optionsOrType.message || optionsOrType.description,
          duration: optionsOrType.duration,
        });
      } else {
        showToast({
          type: optionsOrType,
          title: title || (optionsOrType === 'error' ? 'Error' : optionsOrType === 'success' ? 'Success' : 'Notice'),
          message,
        });
      }
    },
    [showToast]
  );

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-400 shrink-0" />,
  };

  const borders = {
    success: 'border-emerald-800/80 bg-neutral-900/95 shadow-emerald-950/20',
    error: 'border-red-800/80 bg-neutral-900/95 shadow-red-950/20',
    warning: 'border-amber-800/80 bg-neutral-900/95 shadow-amber-950/20',
    info: 'border-blue-800/80 bg-neutral-900/95 shadow-blue-950/20',
  };

  return (
    <ToastContext.Provider value={{ showToast, toast: showToast, addToast, success, error, warning, info }}>
      {children}
      <div
        aria-live="polite"
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              'pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-xl backdrop-blur-md transition-all animate-in slide-in-from-bottom-3 duration-200 text-left',
              borders[toast.type]
            )}
          >
            {icons[toast.type]}
            <div className="flex-1">
              <h5 className="text-sm font-semibold text-white tracking-wide">{toast.title}</h5>
              {toast.message && (
                <p className="text-xs text-neutral-300 mt-1 leading-relaxed">{toast.message}</p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-neutral-400 hover:text-white p-0.5 rounded transition-colors"
              aria-label="Dismiss toast"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
