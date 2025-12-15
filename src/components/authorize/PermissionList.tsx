import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { IconCheck as Check } from '@tabler/icons-react';
import { cn } from '@/lib/utils';

export interface PermissionListProps {
  permissions: string[];
  className?: string;
}

function toAuthorizePermissionKey(permission: string): string {
  if (permission.includes('.')) return permission;
  return `address.permissions.${permission}`;
}

export function PermissionList({ permissions, className }: PermissionListProps) {
  const { t } = useTranslation('authorize');

  const items = useMemo(() => {
    return permissions.map((p) => ({
      id: p,
      label: t(toAuthorizePermissionKey(p), { defaultValue: p }),
    }));
  }, [permissions, t]);

  if (items.length === 0) {
    return null;
  }

  return (
    <section className={cn('bg-card rounded-xl p-4 shadow-sm', className)} aria-label="Permissions">
      <ul className="space-y-2">
        {items.map((it) => (
          <li key={it.id} className="flex items-start gap-2">
            <span className="bg-primary/10 text-primary mt-0.5 inline-flex size-5 items-center justify-center rounded-full">
              <Check className="size-3.5" aria-hidden="true" />
            </span>
            <span className="text-sm leading-6">{it.label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
