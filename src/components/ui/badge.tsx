import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | 'default'
    | 'secondary'
    | 'outline'
    | 'destructive'
    | 'live'
    | 'completed'
    | 'inProgress'
    | 'verified'
    | 'majority'
    | 'hung';
  size?: 'sm' | 'md';
  pulse?: boolean;
}

const variantStyles: Record<NonNullable<BadgeProps['variant']>, string> = {
  default: 'border-transparent bg-primary text-primary-foreground shadow',
  secondary: 'border-transparent bg-secondary text-secondary-foreground',
  outline: 'text-foreground border-border bg-card/60',
  destructive: 'border-transparent bg-destructive text-destructive-foreground',
  live: 'border-status-live/30 bg-status-live-bg text-status-live font-bold shadow-sm',
  completed: 'border-status-completed/30 bg-status-completed/10 text-status-completed font-semibold',
  inProgress: 'border-status-in-progress/30 bg-status-in-progress/10 text-status-in-progress font-semibold',
  verified: 'border-status-verified/30 bg-status-verified/10 text-status-verified font-semibold',
  majority: 'border-status-majority/30 bg-status-majority/10 text-status-majority font-bold',
  hung: 'border-status-hung/30 bg-status-hung/10 text-status-hung font-bold',
};

const sizeStyles: Record<NonNullable<BadgeProps['size']>, string> = {
  sm: 'px-2 py-0.5 text-[10px] sm:text-[11px]',
  md: 'px-2.5 py-1 text-xs',
};

function Badge({
  className,
  variant = 'default',
  size = 'sm',
  pulse = false,
  children,
  ...props
}: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-medium transition-colors max-w-full min-w-0 overflow-hidden focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {pulse && (
        <span className="relative flex h-2 w-2 flex-shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-live opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-status-live" />
        </span>
      )}
      <span className="truncate min-w-0 max-w-full select-none">{children}</span>
    </div>
  );
}

export { Badge };
