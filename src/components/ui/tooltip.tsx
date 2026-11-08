'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface TooltipContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
  id: string;
}

const TooltipContext = React.createContext<TooltipContextType | null>(null);

function TooltipProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

function Tooltip({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const id = React.useId();

  return (
    <TooltipContext.Provider value={{ open, setOpen, id }}>
      <div className="relative inline-flex">{children}</div>
    </TooltipContext.Provider>
  );
}

const TooltipTrigger = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement> & { asChild?: boolean }
>(({ className, children, onMouseEnter, onMouseLeave, onFocus, onBlur, ...props }, ref) => {
  const context = React.useContext(TooltipContext);

  const handleMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
    context?.setOpen(true);
    onMouseEnter?.(e);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
    context?.setOpen(false);
    onMouseLeave?.(e);
  };

  const handleFocus = (e: React.FocusEvent<HTMLElement>) => {
    context?.setOpen(true);
    onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLElement>) => {
    context?.setOpen(false);
    onBlur?.(e);
  };

  return (
    <div
      ref={ref as React.Ref<HTMLDivElement>}
      aria-describedby={context?.open ? context.id : undefined}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      className={cn('inline-flex', className)}
      tabIndex={0}
      {...props}
    >
      {children}
    </div>
  );
});
TooltipTrigger.displayName = 'TooltipTrigger';

const TooltipContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { side?: 'top' | 'bottom' }
>(({ className, side = 'top', children, ...props }, ref) => {
  const context = React.useContext(TooltipContext);
  if (!context?.open) return null;

  const sideStyles =
    side === 'bottom'
      ? 'top-full mt-2 -translate-x-1/2 left-1/2'
      : 'bottom-full mb-2 -translate-x-1/2 left-1/2';

  return (
    <div
      ref={ref}
      id={context.id}
      role="tooltip"
      className={cn(
        'absolute z-50 overflow-hidden rounded-xl border border-border bg-popover/95 px-3 py-1.5 text-xs text-popover-foreground shadow-xl backdrop-blur-md animate-in fade-in-0 zoom-in-95 pointer-events-none whitespace-nowrap',
        sideStyles,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
TooltipContent.displayName = 'TooltipContent';

export { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent };
