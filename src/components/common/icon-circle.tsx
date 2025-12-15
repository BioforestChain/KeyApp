import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

type IconCircleVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error';
type IconCircleSize = 'sm' | 'md' | 'lg';

interface IconCircleProps {
  icon: LucideIcon;
  variant?: IconCircleVariant;
  size?: IconCircleSize;
  className?: string;
}

const variantStyles: Record<IconCircleVariant, string> = {
  primary: 'bg-primary/10 text-primary',
  secondary: 'bg-secondary/10 text-secondary',
  success: 'bg-green-500/10 text-green-500',
  warning: 'bg-yellow-500/10 text-yellow-500',
  error: 'bg-destructive/10 text-destructive',
};

const sizeStyles: Record<IconCircleSize, { container: string; icon: string }> = {
  sm: { container: 'size-10', icon: 'size-5' },
  md: { container: 'size-14', icon: 'size-7' },
  lg: { container: 'size-16', icon: 'size-8' },
};

export function IconCircle({ icon: Icon, variant = 'primary', size = 'lg', className }: IconCircleProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full',
        variantStyles[variant],
        sizeStyles[size].container,
        className,
      )}
    >
      <Icon className={sizeStyles[size].icon} />
    </div>
  );
}
