import * as React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: React.ReactNode;
  secondaryMetric?: React.ReactNode;
  progressPercent?: number;
  icon: React.ReactNode;
  statusBadge?: React.ReactNode;
  iconVariant?: 'emerald' | 'blue' | 'amber' | 'yellow' | 'purple';
  footer?: React.ReactNode;
  className?: string;
}

const iconVariantStyles: Record<NonNullable<StatCardProps['iconVariant']>, string> = {
  emerald: 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border-emerald-500/20',
  blue: 'bg-blue-500/10 text-blue-500 dark:text-blue-400 border-blue-500/20',
  amber: 'bg-amber-500/10 text-amber-500 dark:text-amber-400 border-amber-500/20',
  yellow: 'bg-yellow-500/10 text-yellow-500 dark:text-yellow-400 border-yellow-500/20',
  purple: 'bg-purple-500/10 text-purple-500 dark:text-purple-400 border-purple-500/20',
};

export function StatCard({
  title,
  value,
  subtitle,
  secondaryMetric,
  progressPercent,
  icon,
  statusBadge,
  iconVariant = 'emerald',
  footer,
  className,
}: StatCardProps) {
  return (
    <Card className={cn('relative overflow-hidden group hover:border-border/90 transition-all p-4 sm:p-5 min-w-0', className)}>
      <CardContent className="p-0 min-w-0">
        <div className="flex items-center justify-between mb-2.5 gap-2 min-w-0">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground truncate min-w-0">
            {title}
          </span>
          <div
            className={cn(
              'w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center border shrink-0',
              iconVariantStyles[iconVariant]
            )}
          >
            {icon}
          </div>
        </div>

        <div className="flex flex-wrap items-baseline gap-2 mb-1 min-w-0">
          <span className="text-xl sm:text-2xl xl:text-3xl font-extrabold font-mono tracking-tight text-foreground tabular-nums shrink-0 whitespace-nowrap">
            {value}
          </span>
          {statusBadge && <div className="min-w-0 max-w-full shrink">{statusBadge}</div>}
        </div>

        {subtitle && (
          <div className="text-xs text-muted-foreground font-mono mb-2 min-w-0">
            {subtitle}
          </div>
        )}

        {secondaryMetric && (
          <div className="text-[11px] text-muted-foreground font-mono mb-2 min-w-0">
            {secondaryMetric}
          </div>
        )}

        {progressPercent !== undefined && (
          <div className="mt-2.5">
            <Progress value={progressPercent} variant="gradient" size="xs" />
          </div>
        )}

        {footer && (
          <div className="mt-2.5 pt-2 border-t border-border/50 text-[11px] text-muted-foreground font-mono min-w-0">
            {footer}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
