import React, { useState } from 'react';
import { cn } from '../../lib/utils.ts';
import { Button } from './Button.tsx';
import { AlertOctagon, RotateCw, ChevronDown, ChevronUp } from 'lucide-react';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  errorCode?: string;
  details?: unknown;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'We encountered an error processing your request. Please try again.',
  errorCode = 'ERR_SYSTEM_FAILURE',
  details,
  onRetry,
  className,
}) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-red-900/40 bg-red-950/20 max-w-lg mx-auto my-6',
        className
      )}
    >
      <div className="w-12 h-12 rounded-xl bg-red-900/30 border border-red-800/50 flex items-center justify-center text-red-400 mb-4 shadow-lg shadow-red-950/30">
        <AlertOctagon className="w-6 h-6" />
      </div>

      <div className="inline-block px-2.5 py-0.5 rounded-full bg-red-950/60 border border-red-800/60 text-[10px] font-mono text-red-400 uppercase tracking-wider mb-2">
        {errorCode}
      </div>

      <h4 className="text-base font-bold text-white font-heading tracking-wide mb-1.5">{title}</h4>
      <p className="text-xs text-neutral-300 max-w-sm leading-relaxed mb-5">{message}</p>

      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          leftIcon={<RotateCw className="w-3.5 h-3.5" />}
          className="border-red-800/80 text-red-200 hover:bg-red-900/30 hover:text-white"
        >
          Retry Action
        </Button>
      )}

      {details && (
        <div className="w-full mt-5 pt-4 border-t border-red-900/30 text-left">
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center justify-between w-full text-[11px] text-neutral-400 hover:text-neutral-200"
          >
            <span>Technical diagnostics</span>
            {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          {showDetails && (
            <pre className="mt-2 p-3 bg-black/60 rounded-lg text-[10px] font-mono text-red-300/90 overflow-x-auto border border-neutral-800">
              {typeof details === 'string' ? details : JSON.stringify(details, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
};
