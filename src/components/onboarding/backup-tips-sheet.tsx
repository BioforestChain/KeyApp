import { useTranslation } from 'react-i18next';
import { IconShield as Shield, IconAlertTriangle as AlertTriangle, IconEye as Eye, IconBan as Ban } from '@tabler/icons-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BackupTipsSheetProps {
  /** Whether the sheet is open */
  open: boolean;
  /** Callback when sheet is closed */
  onClose: () => void;
  /** Callback when user confirms to proceed with backup */
  onProceed: () => void;
  /** Callback when user skips backup */
  onSkip: () => void;
  /** Additional class name */
  className?: string;
}

const TIPS = [
  { key: 'privacy', icon: Eye },
  { key: 'noScreenshot', icon: Ban },
  { key: 'safekeeping', icon: AlertTriangle },
] as const;

/**
 * Sheet showing backup tips before mnemonic display
 */
export function BackupTipsSheet({ open, onClose, onProceed, onSkip, className }: BackupTipsSheetProps) {
  const { t } = useTranslation('security');

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent side="bottom" className={cn('max-h-[85vh] overflow-y-auto rounded-t-3xl', className)}>
        <SheetHeader className="text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30">
            <Shield className="size-8 text-yellow-600 dark:text-yellow-400" />
          </div>
          <SheetTitle className="text-xl">{t('backupTips.title')}</SheetTitle>
          <SheetDescription>{t('backupTips.description')}</SheetDescription>
        </SheetHeader>

        <div className="my-6 space-y-4">
          {TIPS.map(({ key, icon: Icon }) => (
            <div key={key} className="bg-muted/50 flex items-start gap-3 rounded-xl p-4">
              <div className="bg-background flex size-10 shrink-0 items-center justify-center rounded-full">
                <Icon className="text-muted-foreground size-5" />
              </div>
              <div>
                <p className="font-medium">{t(`backupTips.tips.${key}.title`)}</p>
                <p className="text-muted-foreground mt-0.5 text-sm">{t(`backupTips.tips.${key}.description`)}</p>
              </div>
            </div>
          ))}
        </div>

        <SheetFooter className="flex-col gap-2 sm:flex-col">
          <Button onClick={onProceed} className="w-full" size="lg">
            {t('backupTips.proceed')}
          </Button>
          <Button onClick={onSkip} variant="ghost" className="text-muted-foreground w-full">
            {t('backupTips.skip')}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
