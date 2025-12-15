import { useNavigate } from '@tanstack/react-router';
import { Check } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { useCurrency, preferencesActions, currencies, type CurrencyCode } from '@/stores';
import { cn } from '@/lib/utils';

/** 货币显示名称映射 */
const CURRENCY_DISPLAY: Record<CurrencyCode, string> = {
  USD: 'US Dollar',
  CNY: '人民币',
  EUR: 'Euro',
  JPY: '日本円',
  KRW: '한국 원',
};

export function CurrencyPage() {
  const navigate = useNavigate();
  const currentCurrency = useCurrency();

  const handleSelect = (currency: CurrencyCode) => {
    preferencesActions.setCurrency(currency);
    // 返回设置页
    navigate({ to: '/settings' });
  };

  return (
    <div className="bg-muted/30 flex min-h-screen flex-col">
      <PageHeader title="计价货币" onBack={() => navigate({ to: '/settings' })} />

      <div className="flex-1 p-4">
        <div className="bg-card overflow-hidden rounded-xl shadow-sm">
          {(Object.keys(currencies) as CurrencyCode[]).map((code, index) => (
            <div key={code}>
              {index > 0 && <div className="bg-border mx-4 h-px" />}
              <button
                onClick={() => handleSelect(code)}
                className={cn(
                  'flex w-full items-center justify-between px-4 py-3.5',
                  'hover:bg-muted/50 active:bg-muted transition-colors',
                  code === currentCurrency && 'bg-primary/5',
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground text-base font-semibold">{currencies[code].symbol}</span>
                  <span className="text-sm font-medium">{CURRENCY_DISPLAY[code]}</span>
                  <span className="text-muted-foreground text-xs">({code})</span>
                </div>
                {code === currentCurrency && <Check className="text-primary size-5" />}
              </button>
            </div>
          ))}
        </div>

        <p className="text-muted-foreground mt-4 px-1 text-xs">选择计价货币后，资产价值将以所选货币显示。</p>
      </div>
    </div>
  );
}
