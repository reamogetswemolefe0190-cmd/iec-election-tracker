import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  indicatorColor?: string;
  variant?: 'default' | 'gradient' | 'custom';
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

const sizeStyles: Record<NonNullable<ProgressProps['size']>, string> = {
  xs: 'h-1.5',
  sm: 'h-2',
  md: 'h-2.5',
  lg: 'h-3.5',
};

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  (
    {
      className,
      value = 0,
      indicatorColor,
      variant = 'default',
      size = 'sm',
      ...props
    },
    ref
  ) => {
    const clampedValue = Math.min(100, Math.max(0, value));

    let indicatorClassName = 'bg-primary';
    if (variant === 'gradient') {
      indicatorClassName = 'bg-gradient-to-r from-emerald-500 to-teal-400';
    }

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuenow={clampedValue}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={props['aria-label'] || 'Progress indicator'}
        className={cn(
          'relative w-full overflow-hidden rounded-full bg-muted/80',
          sizeStyles[size],
          className
        )}
        {...props}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-in-out',
            indicatorClassName
          )}
          style={{
            width: `${clampedValue}%`,
            ...(indicatorColor ? { backgroundColor: indicatorColor } : {}),
          }}
        />
      </div>
    );
  }
);
Progress.displayName = 'Progress';

export { Progress };
