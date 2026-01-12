/**
 * ModeTabs Component
 * 充值/赎回模式切换
 */

import { cn } from '@/lib/utils'
import type { BridgeMode } from '@/api/types'

interface ModeTabsProps {
  mode: BridgeMode
  onChange: (mode: BridgeMode) => void
  rechargeLabel?: string
  redemptionLabel?: string
}

export function ModeTabs({
  mode,
  onChange,
  rechargeLabel = 'Recharge',
  redemptionLabel = 'Redemption',
}: ModeTabsProps) {
  return (
    <div className="flex rounded-lg bg-muted p-1">
      <button
        type="button"
        onClick={() => onChange('recharge')}
        className={cn(
          'flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors',
          mode === 'recharge'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        {rechargeLabel}
      </button>
      <button
        type="button"
        onClick={() => onChange('redemption')}
        className={cn(
          'flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors',
          mode === 'redemption'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        {redemptionLabel}
      </button>
    </div>
  )
}
