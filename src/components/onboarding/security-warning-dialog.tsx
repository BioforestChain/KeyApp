import * as Dialog from '@radix-ui/react-dialog';
import { IconAlertTriangle as AlertTriangle } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SecurityWarningDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  onCancel?: () => void;
  className?: string;
}

export function SecurityWarningDialog({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
  className,
}: SecurityWarningDialogProps) {
  const { t } = useTranslation(['onboarding', 'common']);
  const [acknowledged, setAcknowledged] = useState(false);

  useEffect(() => {
    if (open) setAcknowledged(false);
  }, [open]);

  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  const handleConfirm = () => {
    if (!acknowledged) return;
    onConfirm();
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
        <Dialog.Content
          className={cn(
            'bg-background fixed top-1/2 left-1/2 z-50 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl p-5 shadow-lg',
            'focus:outline-none',
            className,
          )}
        >
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-amber-500/15 p-2">
              <AlertTriangle className="size-5 text-amber-600" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <Dialog.Title className="text-base font-semibold">{t('onboarding:securityWarning.title')}</Dialog.Title>
              <Dialog.Description className="text-muted-foreground mt-1 text-sm">
                {t('onboarding:securityWarning.message')}
              </Dialog.Description>
            </div>
          </div>

          <label className="mt-4 flex cursor-pointer items-start gap-2 text-sm">
            <input
              type="checkbox"
              className="mt-1 size-4"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
            />
            <span>{t('onboarding:securityWarning.acknowledge')}</span>
          </label>

          <div className="mt-5 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleCancel}>
              {t('common:cancel')}
            </Button>
            <Button type="button" onClick={handleConfirm} disabled={!acknowledged}>
              {t('common:confirm')}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
