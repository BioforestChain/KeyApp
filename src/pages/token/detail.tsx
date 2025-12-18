import { useTranslation } from 'react-i18next';
import { useNavigation } from '@/stackflow';
import { PageHeader } from '@/components/layout/page-header';
import { BalanceDisplay } from '@/components/token/balance-display';
import { TransactionList } from '@/components/transaction/transaction-list';
import { GradientButton } from '@/components/common/gradient-button';
import { IconArrowUp as ArrowUp, IconArrowDown as ArrowDown } from '@tabler/icons-react';

// 临时模拟数据
const mockToken = {
  symbol: 'USDT',
  name: 'Tether USD',
  balance: 1234.56,
  fiatValue: '1234.56',
  change24h: 0.01,
};

const mockTransactions = [
  {
    id: '1',
    type: 'send' as const,
    status: 'confirmed' as const,
    amount: '100',
    symbol: 'USDT',
    address: '0xabcd...1234',
    timestamp: new Date(Date.now() - 3600000),
  },
  {
    id: '2',
    type: 'receive' as const,
    status: 'confirmed' as const,
    amount: '500',
    symbol: 'USDT',
    address: '0x1234...abcd',
    timestamp: new Date(Date.now() - 86400000),
  },
];

export function TokenDetailPage() {
  const { t } = useTranslation('token');
  const { navigate, goBack } = useNavigation();

  return (
    <div className="flex min-h-screen flex-col">
      <PageHeader title={mockToken.symbol} onBack={goBack} />

      <div className="flex-1 space-y-6 p-4">
        {/* 余额显示 */}
        <div className="text-center">
          <BalanceDisplay
            value={mockToken.balance}
            symbol={mockToken.symbol}
            fiatValue={mockToken.fiatValue}
            size="lg"
          />
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <GradientButton
            variant="mint"
            className="flex-1"
            onClick={() =>
              navigate({ to: '/send', search: { address: undefined, chain: undefined, amount: undefined } })
            }
          >
            <ArrowUp className="mr-2 size-4" />
            {t('detail.send')}
          </GradientButton>
          <GradientButton variant="blue" className="flex-1" onClick={() => navigate({ to: '/receive' })}>
            <ArrowDown className="mr-2 size-4" />
            {t('detail.receive')}
          </GradientButton>
        </div>

        {/* Transaction history */}
        <div>
          <h3 className="mb-3 text-lg font-semibold">{t('detail.transactionHistory')}</h3>
          <TransactionList
            transactions={mockTransactions}
            emptyTitle={t('detail.noTransactions')}
            emptyDescription={t('detail.noTransactionsDesc')}
          />
        </div>
      </div>
    </div>
  );
}
