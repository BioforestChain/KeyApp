import { Bell, BellRing, Zap, Shield } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface NotificationPermissionSheetProps {
  /** Whether the sheet is open */
  open: boolean
  /** Callback when sheet is closed */
  onClose: () => void
  /** Callback when user enables notifications */
  onEnable: () => void
  /** Callback when user skips/declines */
  onSkip: () => void
  /** Additional class name */
  className?: string
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
]

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
      <SheetContent
        side="bottom"
        className={cn('max-h-[85vh] overflow-y-auto rounded-t-3xl', className)}
      >
        <SheetHeader className="text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10">
            <Bell className="size-8 text-primary" />
          </div>
          <SheetTitle className="text-xl">开启通知</SheetTitle>
          <SheetDescription>
            接收交易状态更新和重要安全提醒
          </SheetDescription>
        </SheetHeader>

        <div className="my-6 space-y-4">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="flex items-start gap-3 rounded-xl bg-muted/50 p-4"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-background">
                <benefit.icon className="size-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">{benefit.title}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {benefit.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <SheetFooter className="flex-col gap-2 sm:flex-col">
          <Button onClick={onEnable} className="w-full" size="lg">
            开启通知
          </Button>
          <Button
            onClick={onSkip}
            variant="ghost"
            className="w-full text-muted-foreground"
          >
            暂不开启
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
