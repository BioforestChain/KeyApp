import { useTranslation } from 'react-i18next';
import { useNavigation } from '@/stackflow';
import { IconCheck as Check } from '@tabler/icons-react';
import { PageHeader } from '@/components/layout/page-header';
import { useCurrency, preferencesActions, currencies, type CurrencyCode } from '@/stores';
import { cn } from '@/lib/utils';

export function CurrencyPage() {
  const { t } = useTranslation('settings');
  const { goBack } = useNavigation();
  const currentCurrency = useCurrency();

  const handleSelect = (currency: CurrencyCode) => {
    preferencesActions.setCurrency(currency);
    goBack();
  };

  return (
    <div className="bg-muted/30 flex min-h-screen flex-col">
      <PageHeader title={t('currency.title')} onBack={goBack} />

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
                  <span className="text-sm font-medium">{t(`currency.names.${code}`)}</span>
                </div>
                {code === currentCurrency && <Check className="text-primary size-5" />}
              </button>
            </div>
          ))}
        </div>

        <p className="text-muted-foreground mt-4 px-1 text-xs">{t('currency.hint')}</p>
      </div>
    </div>
  );
}
