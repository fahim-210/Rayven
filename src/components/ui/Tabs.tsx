import React, { createContext, useContext } from 'react';
import { cn } from '../../lib/utils.ts';

interface TabsContextValue {
  value: string;
  onChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextValue | undefined>(undefined);

export interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  value,
  onValueChange,
  children,
  className,
}) => {
  return (
    <TabsContext.Provider value={{ value, onChange: onValueChange }}>
      <div className={cn('flex flex-col gap-4', className)}>{children}</div>
    </TabsContext.Provider>
  );
};

export interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'pill' | 'underline';
}

export const TabsList: React.FC<TabsListProps> = ({
  className,
  variant = 'pill',
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        'inline-flex items-center',
        variant === 'pill'
          ? 'p-1 bg-neutral-950/80 rounded-xl border border-neutral-800'
          : 'border-b border-neutral-800 gap-6',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

export const TabsTrigger: React.FC<TabsTriggerProps> = ({
  value,
  className,
  children,
  ...props
}) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabsTrigger must be used within Tabs');

  const isSelected = context.value === value;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isSelected}
      onClick={() => context.onChange(value)}
      className={cn(
        'px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all select-none whitespace-nowrap',
        isSelected
          ? 'bg-neutral-800 text-white shadow-sm border border-neutral-700'
          : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900/50',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

export const TabsContent: React.FC<TabsContentProps> = ({
  value,
  className,
  children,
  ...props
}) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabsContent must be used within Tabs');

  if (context.value !== value) return null;

  return (
    <div
      role="tabpanel"
      className={cn('animate-in fade-in duration-200 focus-visible:outline-none', className)}
      {...props}
    >
      {children}
    </div>
  );
};
