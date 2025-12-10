import { useNavigate } from '@tanstack/react-router'
import { Check } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import {
  useCurrency,
  preferencesActions,
  currencies,
  type CurrencyCode,
} from '@/stores'
import { cn } from '@/lib/utils'

/** 货币显示名称映射 */
const CURRENCY_DISPLAY: Record<CurrencyCode, string> = {
  USD: 'US Dollar',
  CNY: '人民币',
  EUR: 'Euro',
  JPY: '日本円',
  KRW: '한국 원',
}

export function CurrencyPage() {
  const navigate = useNavigate()
  const currentCurrency = useCurrency()

  const handleSelect = (currency: CurrencyCode) => {
    preferencesActions.setCurrency(currency)
    // 返回设置页
    navigate({ to: '/settings' })
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <PageHeader title="计价货币" showBack onBack={() => navigate({ to: '/settings' })} />

      <div className="flex-1 p-4">
        <div className="overflow-hidden rounded-xl bg-card shadow-sm">
          {(Object.keys(currencies) as CurrencyCode[]).map((code, index) => (
            <div key={code}>
              {index > 0 && <div className="mx-4 h-px bg-border" />}
              <button
                onClick={() => handleSelect(code)}
                className={cn(
                  'flex w-full items-center justify-between px-4 py-3.5',
                  'transition-colors hover:bg-muted/50 active:bg-muted',
                  code === currentCurrency && 'bg-primary/5'
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="text-base font-semibold text-muted-foreground">
                    {currencies[code].symbol}
                  </span>
                  <span className="text-sm font-medium">
                    {CURRENCY_DISPLAY[code]}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({code})
                  </span>
                </div>
                {code === currentCurrency && (
                  <Check className="size-5 text-primary" />
                )}
              </button>
            </div>
          ))}
        </div>

        <p className="mt-4 px-1 text-xs text-muted-foreground">
          选择计价货币后，资产价值将以所选货币显示。
        </p>
      </div>
    </div>
  )
}
