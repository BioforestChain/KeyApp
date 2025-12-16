import { useParams, useNavigate } from '@tanstack/react-router';
import { PageHeader } from '@/components/layout/page-header';
import { AddressDisplay } from '@/components/wallet/address-display';
import { ChainIcon } from '@/components/wallet/chain-icon';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/common/alert';
import { useBiometric, useToast, useHaptics } from '@/services';
import {
  IconCircleKey as KeyRound,
  IconTrash as Trash2,
  IconPencilMinus as Edit3,
  IconShield as Shield,
} from '@tabler/icons-react';
import { useWallets, walletActions, type ChainType } from '@/stores';

const CHAIN_NAMES: Record<ChainType, string> = {
  ethereum: 'Ethereum',
  bitcoin: 'Bitcoin',
  tron: 'Tron',
  binance: 'BSC',
  bfmeta: 'BFMeta',
  ccchain: 'CCChain',
  pmchain: 'PMChain',
  bfchainv2: 'BFChain V2',
  btgmeta: 'BTGMeta',
  biwmeta: 'BIWMeta',
  ethmeta: 'ETHMeta',
  malibu: 'Malibu',
};

export function WalletDetailPage() {
  const { walletId } = useParams({ from: '/wallet/$walletId' });
  const navigate = useNavigate();
  const biometric = useBiometric();
  const toast = useToast();
  const haptics = useHaptics();

  const wallets = useWallets();
  const wallet = wallets.find((w) => w.id === walletId);

  const handleExportMnemonic = async () => {
    const { isAvailable } = await biometric.isAvailable();

    if (isAvailable) {
      const result = await biometric.verify({ title: '验证身份以导出助记词' });
      if (!result.success) {
        toast.show({ message: '验证失败', position: 'center' });
        return;
      }
    }

    await haptics.impact('success');
    toast.show('助记词导出功能开发中');
    // TODO: 实现助记词导出
  };

  const handleDeleteWallet = async () => {
    const { isAvailable } = await biometric.isAvailable();

    if (isAvailable) {
      const result = await biometric.verify({ title: '验证身份以删除钱包' });
      if (!result.success) {
        toast.show({ message: '验证失败', position: 'center' });
        return;
      }
    }

    walletActions.deleteWallet(walletId);
    await haptics.impact('warning');
    toast.show('钱包已删除');
    navigate({ to: '/' });
  };

  if (!wallet) {
    return (
      <div className="flex min-h-screen flex-col">
        <PageHeader title="钱包详情" onBack={() => navigate({ to: '/' })} />
        <div className="flex-1 p-4">
          <Alert variant="error">钱包不存在</Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <PageHeader title={wallet.name} onBack={() => navigate({ to: '/' })} />

      <div className="flex-1 space-y-6 p-4">
        {/* 钱包信息 */}
        <div className="bg-card rounded-2xl p-4 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="bg-primary/10 flex size-12 items-center justify-center rounded-full">
              <Shield className="text-primary size-6" />
            </div>
            <div>
              <h2 className="font-semibold">{wallet.name}</h2>
              <p className="text-muted-foreground text-sm">创建于 {new Date(wallet.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* 多链地址 */}
        <div className="space-y-3">
          <h3 className="text-muted-foreground text-sm font-medium">链地址</h3>
          {wallet.chainAddresses.map((chainAddr) => (
            <div key={chainAddr.chain} className="bg-card flex items-center gap-3 rounded-xl p-4">
              <ChainIcon chain={chainAddr.chain} size="md" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{CHAIN_NAMES[chainAddr.chain] ?? chainAddr.chain}</p>
                <AddressDisplay address={chainAddr.address} copyable className="text-xs" />
              </div>
            </div>
          ))}
        </div>

        {/* 操作按钮 */}
        <div className="space-y-3 pt-4">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => {
              // TODO: 编辑钱包名称
            }}
          >
            <Edit3 className="mr-3 size-4" />
            编辑钱包名称
          </Button>

          <Button variant="outline" className="w-full justify-start" onClick={handleExportMnemonic}>
            <KeyRound className="mr-3 size-4" />
            导出助记词
          </Button>

          <Button
            variant="outline"
            className="text-destructive hover:bg-destructive/10 w-full justify-start"
            onClick={handleDeleteWallet}
          >
            <Trash2 className="mr-3 size-4" />
            删除钱包
          </Button>
        </div>

        {/* 安全提示 */}
        <Alert variant="warning">导出助记词需要验证密码，请确保在安全环境下操作</Alert>
      </div>
    </div>
  );
}
