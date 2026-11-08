import * as React from 'react';
import { cn } from '@/lib/utils';

export type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      role="status"
      aria-label="Loading content"
      className={cn('animate-pulse rounded-xl bg-muted/60 border border-border/40', className)}
      {...props}
    />
  );
}

export { Skeleton };
