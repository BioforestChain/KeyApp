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

const benefits = [
  {
    icon: BellRing,
    title: '交易状态',
    description: '实时收到转账和交易确认的通知',
  },
  {
    icon: Zap,
    title: '即时提醒',
    description: '收款到账、交易完成时第一时间知晓',
  },
  {
    icon: Shield,
    title: '安全提醒',
    description: '账户安全相关的重要通知不会错过',
  },
];

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
  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent side="bottom" className={cn('max-h-[85vh] overflow-y-auto rounded-t-3xl', className)}>
        <SheetHeader className="text-center">
          <div className="bg-primary/10 mx-auto mb-4 flex size-16 items-center justify-center rounded-full">
            <Bell className="text-primary size-8" />
          </div>
          <SheetTitle className="text-xl">开启通知</SheetTitle>
          <SheetDescription>接收交易状态更新和重要安全提醒</SheetDescription>
        </SheetHeader>

        <div className="my-6 space-y-4">
          {benefits.map((benefit, index) => (
            <div key={index} className="bg-muted/50 flex items-start gap-3 rounded-xl p-4">
              <div className="bg-background flex size-10 shrink-0 items-center justify-center rounded-full">
                <benefit.icon className="text-muted-foreground size-5" />
              </div>
              <div>
                <p className="font-medium">{benefit.title}</p>
                <p className="text-muted-foreground mt-0.5 text-sm">{benefit.description}</p>
              </div>
            </div>
          ))}
        </div>

        <SheetFooter className="flex-col gap-2 sm:flex-col">
          <Button onClick={onEnable} className="w-full" size="lg">
            开启通知
          </Button>
          <Button onClick={onSkip} variant="ghost" className="text-muted-foreground w-full">
            暂不开启
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
