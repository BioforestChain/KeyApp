import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigation, useFlow } from '@/stackflow';
import { useStore } from '@tanstack/react-store';
import { IconPlus as Plus, IconCheck as Check, IconChevronRight as ChevronRight } from '@tabler/icons-react';
import { PageHeader } from '@/components/layout/page-header';
import { walletStore, walletActions, type Wallet } from '@/stores';
import { cn } from '@/lib/utils';

export function WalletListPage() {
  const { t } = useTranslation('wallet');
  const { navigate, goBack } = useNavigation();
  const { push } = useFlow();
  const wallets = useStore(walletStore, (s) => s.wallets);
  const currentWalletId = useStore(walletStore, (s) => s.currentWalletId);

  // 切换当前钱包
  const handleSelectWallet = useCallback((walletId: string) => {
    walletActions.setCurrentWallet(walletId);
  }, []);

  // 进入钱包详情
  const handleWalletDetail = useCallback(
    (walletId: string) => {
      navigate({ to: `/wallet/${walletId}` });
    },
    [navigate],
  );

  // 添加钱包（打开选择 Sheet）
  const handleAddWallet = useCallback(() => {
    push("WalletAddSheetActivity", {});
  }, [push]);

  // 返回
  const handleBack = useCallback(() => {
    goBack();
  }, [goBack]);

  return (
    <div className="bg-muted/30 flex min-h-screen flex-col">
      <PageHeader
        title={t('list.title')}
        onBack={handleBack}
        rightAction={
          <button
            onClick={handleAddWallet}
            className={cn('rounded-full p-2 transition-colors', 'hover:bg-muted active:bg-muted/80')}
            aria-label={t('add')}
          >
            <Plus className="size-5" />
          </button>
        }
      />

      <div className="flex-1 p-4">
        {wallets.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-12">
            <p className="text-muted-foreground">{t('list.empty')}</p>
            <button
              onClick={handleAddWallet}
              className={cn(
                'bg-primary rounded-full px-6 py-2.5 text-sm font-medium text-white',
                'hover:bg-primary/90 active:bg-primary/80',
              )}
            >
              {t('add')}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {wallets.map((wallet) => (
              <WalletListItem
                key={wallet.id}
                wallet={wallet}
                isActive={wallet.id === currentWalletId}
                onSelect={() => handleSelectWallet(wallet.id)}
                onDetail={() => handleWalletDetail(wallet.id)}
                t={t}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface WalletListItemProps {
  wallet: Wallet;
  isActive: boolean;
  onSelect: () => void;
  onDetail: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: (key: string, options?: any) => string;
}

function WalletListItem({ wallet, isActive, onSelect, onDetail, t }: WalletListItemProps) {
  // 计算总余额
  const totalBalance = wallet.chainAddresses.reduce(
    (sum, ca) => sum + ca.tokens.reduce((s, t) => s + t.fiatValue, 0),
    0,
  );

  return (
    <div className={cn('bg-card rounded-xl p-4 shadow-sm transition-colors', isActive && 'ring-primary ring-2')}>
      <div className="flex items-center gap-3">
        {/* 头像 */}
        <button
          onClick={onSelect}
          className={cn(
            'flex size-12 items-center justify-center rounded-full text-lg font-semibold',
            isActive ? 'bg-primary text-white' : 'bg-muted',
          )}
        >
          {wallet.name.slice(0, 1)}
        </button>

        {/* 信息 */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-semibold">{wallet.name}</h3>
            {isActive && (
              <span className="text-primary flex items-center gap-1 text-xs">
                <Check className="size-3" />
                {t('list.current')}
              </span>
            )}
          </div>
          <p className="text-muted-foreground text-sm">
            {t('list.chainAddresses', { count: wallet.chainAddresses.length })}
          </p>
        </div>

        {/* 余额和详情 */}
        <div className="flex items-center gap-2">
          <div className="text-right">
            <p className="font-semibold">
              ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <button
            onClick={onDetail}
            className={cn('rounded-full p-2 transition-colors', 'hover:bg-muted active:bg-muted/80')}
            aria-label={t('list.viewDetail')}
          >
            <ChevronRight className="text-muted-foreground size-5" />
          </button>
        </div>
      </div>

      {/* 地址预览 */}
      <p className="text-muted-foreground mt-2 truncate font-mono text-xs">{wallet.address}</p>
    </div>
  );
}
