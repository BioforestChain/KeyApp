import { Shield, AlertTriangle, Eye, Ban } from 'lucide-react'
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

interface BackupTipsSheetProps {
  /** Whether the sheet is open */
  open: boolean
  /** Callback when sheet is closed */
  onClose: () => void
  /** Callback when user confirms to proceed with backup */
  onProceed: () => void
  /** Callback when user skips backup */
  onSkip: () => void
  /** Additional class name */
  className?: string
}

const tips = [
  {
    icon: Eye,
    title: '确保周围无人',
    description: '请在私密环境下查看助记词，防止他人窥视',
  },
  {
    icon: Ban,
    title: '禁止截图或拍照',
    description: '不要以任何电子形式保存助记词，建议手写记录',
  },
  {
    icon: AlertTriangle,
    title: '妥善保管',
    description: '将助记词保存在安全的地方，丢失将无法找回资产',
  },
]

/**
 * Sheet showing backup tips before mnemonic display
 */
export function BackupTipsSheet({
  open,
  onClose,
  onProceed,
  onSkip,
  className,
}: BackupTipsSheetProps) {
  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent
        side="bottom"
        className={cn('max-h-[85vh] overflow-y-auto rounded-t-3xl', className)}
      >
        <SheetHeader className="text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30">
            <Shield className="size-8 text-yellow-600 dark:text-yellow-400" />
          </div>
          <SheetTitle className="text-xl">备份助记词</SheetTitle>
          <SheetDescription>
            助记词是恢复钱包的唯一方式，请务必妥善保管
          </SheetDescription>
        </SheetHeader>

        <div className="my-6 space-y-4">
          {tips.map((tip, index) => (
            <div
              key={index}
              className="flex items-start gap-3 rounded-xl bg-muted/50 p-4"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-background">
                <tip.icon className="size-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">{tip.title}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {tip.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <SheetFooter className="flex-col gap-2 sm:flex-col">
          <Button onClick={onProceed} className="w-full" size="lg">
            我已了解，开始备份
          </Button>
          <Button
            onClick={onSkip}
            variant="ghost"
            className="w-full text-muted-foreground"
          >
            稍后备份
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
