import * as React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'pill';
  size?: 'xs' | 'sm' | 'default' | 'icon';
  isLoading?: boolean;
}

const variantStyles: Record<NonNullable<ButtonProps['variant']>, string> = {
  default:
    'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm shadow-emerald-950/30 font-semibold',
  secondary:
    'bg-secondary text-secondary-foreground hover:bg-secondary/80 font-medium',
  outline:
    'border border-border bg-card/60 text-foreground hover:bg-muted hover:text-foreground font-medium',
  ghost:
    'text-muted-foreground hover:bg-muted hover:text-foreground font-medium',
  destructive:
    'bg-destructive text-destructive-foreground hover:bg-destructive/90 font-semibold shadow-sm',
  pill:
    'rounded-full border border-border bg-card/60 text-muted-foreground hover:border-zinc-700 hover:text-foreground font-medium',
};

const sizeStyles: Record<NonNullable<ButtonProps['size']>, string> = {
  xs: 'h-7 px-2.5 text-xs rounded-lg gap-1.5',
  sm: 'h-8 px-3 text-xs rounded-xl gap-2',
  default: 'h-9 px-4 py-2 text-xs sm:text-sm rounded-xl gap-2',
  icon: 'h-8 w-8 rounded-xl p-0 justify-center items-center',
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', isLoading = false, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center whitespace-nowrap transition-all duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin flex-shrink-0" />}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

export { Button };
