import { useTranslation } from 'react-i18next';
import {
  IconBell as Bell,
  IconBellRinging as BellRing,
  IconBolt as Zap,
  IconShield as Shield,
} from '@tabler/icons-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface NotificationPermissionSheetProps {
  /** Whether the sheet is open */
  open: boolean;
  /** Callback when sheet is closed */
  onClose: () => void;
  /** Callback when user enables notifications */
  onEnable: () => void;
  /** Callback when user skips/declines */
  onSkip: () => void;
  /** Additional class name */
  className?: string;
}

const BENEFITS = [
  { key: 'transaction', icon: BellRing },
  { key: 'instant', icon: Zap },
  { key: 'security', icon: Shield },
] as const;

/**
 * Sheet for requesting notification permission
 * Explains benefits and allows user to enable or skip
 */
export function NotificationPermissionSheet({
  open,
  onClose,
  onEnable,
  onSkip,
  className,
}: NotificationPermissionSheetProps) {
  const { t } = useTranslation('notification');

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent side="bottom" className={cn('max-h-[85vh] overflow-y-auto rounded-t-3xl', className)}>
        <SheetHeader className="text-center">
          <div className="bg-primary/10 mx-auto mb-4 flex size-16 items-center justify-center rounded-full">
            <Bell className="text-primary size-8" />
          </div>
          <SheetTitle className="text-xl">{t('permission.title')}</SheetTitle>
          <SheetDescription>{t('permission.description')}</SheetDescription>
        </SheetHeader>

        <div className="my-6 space-y-4">
          {BENEFITS.map(({ key, icon: Icon }) => (
            <div key={key} className="bg-muted/50 flex items-start gap-3 rounded-xl p-4">
              <div className="bg-background flex size-10 shrink-0 items-center justify-center rounded-full">
                <Icon className="text-muted-foreground size-5" />
              </div>
              <div>
                <p className="font-medium">{t(`permission.benefits.${key}.title`)}</p>
                <p className="text-muted-foreground mt-0.5 text-sm">{t(`permission.benefits.${key}.description`)}</p>
              </div>
            </div>
          ))}
        </div>

        <SheetFooter className="flex-col gap-2 sm:flex-col">
          <Button onClick={onEnable} className="w-full" size="lg">
            {t('permission.enable')}
          </Button>
          <Button onClick={onSkip} variant="ghost" className="text-muted-foreground w-full">
            {t('permission.skip')}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
