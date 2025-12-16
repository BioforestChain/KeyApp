import { cn } from '@/lib/utils';
import {
  IconAlertCircle as AlertCircle,
  IconCircleCheck as CheckCircle,
  IconInfoCircle as Info,
  IconAlertTriangle as AlertTriangle,
} from '@tabler/icons-react';
import type { ReactNode } from 'react';

type AlertVariant = 'info' | 'success' | 'warning' | 'error';

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: ReactNode;
  className?: string;
}

const variantConfig = {
  info: {
    icon: Info,
    styles: 'bg-info/10 text-info',
  },
  success: {
    icon: CheckCircle,
    styles: 'bg-success/10 text-success',
  },
  warning: {
    icon: AlertTriangle,
    styles: 'bg-warning/10 text-warning',
  },
  error: {
    icon: AlertCircle,
    styles: 'bg-destructive/10 text-destructive',
  },
};

export function Alert({ variant = 'info', title, children, className }: AlertProps) {
  const { icon: Icon, styles } = variantConfig[variant];

  return (
    <div role="alert" className={cn('flex gap-3 rounded-lg p-3 text-sm', styles, className)}>
      <Icon className="mt-0.5 size-4 shrink-0" />
      <div className="flex-1">
        {title && <p className="font-medium">{title}</p>}
        <div className={title ? 'mt-1' : ''}>{children}</div>
      </div>
    </div>
  );
}
