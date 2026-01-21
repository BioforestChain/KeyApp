import { useState, useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { BioAccount, BioSignedTransaction } from '@biochain/bio-sdk';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { AuroraBackground } from './components/AuroraBackground';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  ChevronLeft,
  Zap,
  ArrowDown,
  Check,
  Coins,
  Leaf,
  DollarSign,
  Wallet,
  Loader2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import './i18n';
import {
  useTransmitAssetTypeList,
  useTransmit,
  useTransmitRecordDetail,
  type DisplayAsset,
  type FromTrJson,
  type ToTrInfo,
  type InternalChainName,
  type TransferAssetTransaction,
  SWAP_ORDER_STATE_ID,
} from './api';

type Step =
  | 'connect'
  | 'select-asset'
  | 'input-amount'
  | 'select-target'
  | 'confirm'
  | 'processing'
  | 'success'
  | 'error';

const CHAIN_COLORS: Record<string, string> = {
  ETH: 'bg-indigo-600',
  BSC: 'bg-amber-600',
  TRON: 'bg-red-600',
  BFMCHAIN: 'bg-emerald-600',
  ETHMETA: 'bg-purple-600',
  PMCHAIN: 'bg-cyan-600',
};

export default function App() {
  const { t } = useTranslation();
  const [step, setStep] = useState<Step>('connect');
  const [sourceAccount, setSourceAccount] = useState<BioAccount | null>(null);
  const [targetAccount, setTargetAccount] = useState<BioAccount | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<DisplayAsset | null>(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  // API Hooks
  const { data: assets, isLoading: assetsLoading, error: assetsError } = useTransmitAssetTypeList();
  const transmitMutation = useTransmit();
  const { data: recordDetail } = useTransmitRecordDetail(orderId || '', { enabled: !!orderId });

  // 监听订单状态变化
  useEffect(() => {
    if (!recordDetail) return;

    if (recordDetail.orderState === SWAP_ORDER_STATE_ID.SUCCESS) {
      setStep('success');
    } else if (
      recordDetail.orderState === SWAP_ORDER_STATE_ID.FROM_TX_ON_CHAIN_FAIL ||
      recordDetail.orderState === SWAP_ORDER_STATE_ID.TO_TX_ON_CHAIN_FAIL
    ) {
      setError(recordDetail.orderFailReason || '交易失败');
      setStep('error');
    }
  }, [recordDetail]);

  // 关闭启动屏
  useEffect(() => {
    window.bio?.request({ method: 'bio_closeSplashScreen' });
  }, []);

  // 过滤可用资产（根据源账户的链）
  const availableAssets = useMemo(() => {
    if (!assets || !sourceAccount) return [];
    return assets.filter((asset) => {
      // 匹配链名（大小写不敏感）
      return asset.chain.toLowerCase() === sourceAccount.chain.toLowerCase();
    });
  }, [assets, sourceAccount]);

  const handleConnect = useCallback(async () => {
    if (!window.bio) {
      setError('Bio SDK 未初始化');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const account = await window.bio.request<BioAccount>({
        method: 'bio_selectAccount',
        params: [{}],
      });
      setSourceAccount(account);
      setStep('select-asset');
    } catch (err) {
      setError(err instanceof Error ? err.message : '连接失败');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSelectAsset = async (asset: DisplayAsset) => {
    setSelectedAsset(asset);

    // 获取该资产的余额
    if (window.bio && sourceAccount) {
      try {
        const balance = await window.bio.request<string>({
          method: 'bio_getBalance',
          params: [{ address: sourceAccount.address, chain: sourceAccount.chain }],
        });
        setSelectedAsset({ ...asset, balance });
      } catch {
        // 如果获取余额失败，使用默认值
      }
    }

    setStep('input-amount');
  };

  const handleAmountNext = () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('请输入有效金额');
      return;
    }
    setError(null);
    setStep('select-target');
  };

  const handleSelectTarget = useCallback(async () => {
    if (!window.bio || !sourceAccount) return;
    setLoading(true);
    setError(null);
    try {
      const account = await window.bio.request<BioAccount>({
        method: 'bio_pickWallet',
        params: [
          {
            chain: selectedAsset?.targetChain,
            exclude: sourceAccount.address,
          },
        ],
      });
      setTargetAccount(account);
      setStep('confirm');
    } catch (err) {
      setError(err instanceof Error ? err.message : '选择失败');
    } finally {
      setLoading(false);
    }
  }, [sourceAccount, selectedAsset]);

  const handleConfirm = useCallback(async () => {
    if (!window.bio || !sourceAccount || !selectedAsset || !targetAccount) return;
    setLoading(true);
    setError(null);

    try {
      // 1. 创建未签名交易（转账到 recipientAddress）
      const unsignedTx = await window.bio.request({
        method: 'bio_createTransaction',
        params: [
          {
            from: sourceAccount.address,
            to: selectedAsset.recipientAddress,
            amount: amount,
            chain: sourceAccount.chain,
            asset: selectedAsset.assetType,
          },
        ],
      });

      // 2. 签名交易
      const signedTx = await window.bio.request<BioSignedTransaction>({
        method: 'bio_signTransaction',
        params: [
          {
            from: sourceAccount.address,
            chain: sourceAccount.chain,
            unsignedTx,
          },
        ],
      });

      // 3. 构造 fromTrJson（根据链类型）
      // 注意：signTransData 需要使用 signedTx.data（RLP/Protobuf encoded raw signed tx），
      // 而非 signedTx.signature（仅包含签名数据，不是可广播的 rawTx）
      const fromTrJson: FromTrJson = {};
      const chainLower = sourceAccount.chain.toLowerCase();
      const signTransData = typeof signedTx.data === 'string' ? signedTx.data : JSON.stringify(signedTx.data);

      if (chainLower === 'eth') {
        fromTrJson.eth = { signTransData };
      } else if (chainLower === 'bsc') {
        fromTrJson.bsc = { signTransData };
      } else if (chainLower === 'tron') {
        // TRON 原生 TRX 转账
        fromTrJson.tron = { signTransData };
      } else if (chainLower === 'trc20') {
        // TRON TRC20 代币转账
        fromTrJson.trc20 = { signTransData };
      } else {
        // 内链交易（BioForest 链）
        fromTrJson.bcf = {
          chainName: sourceAccount.chain as InternalChainName,
          trJson: signedTx.data as TransferAssetTransaction,
        };
      }

      // 4. 构造 toTrInfo
      const toTrInfo: ToTrInfo = {
        chainName: selectedAsset.targetChain,
        address: targetAccount.address,
        assetType: selectedAsset.targetAsset,
      };

      // 5. 发起传送请求
      setStep('processing');
      const result = await transmitMutation.mutateAsync({
        fromTrJson,
        toTrInfo,
      });

      setOrderId(result.orderId);
      // 状态变化由 useEffect 监听 recordDetail 来处理
    } catch (err) {
      setError(err instanceof Error ? err.message : '传送失败');
      setStep('error');
    } finally {
      setLoading(false);
    }
  }, [sourceAccount, targetAccount, selectedAsset, amount, transmitMutation]);

  const handleReset = useCallback(() => {
    setStep('connect');
    setSourceAccount(null);
    setTargetAccount(null);
    setSelectedAsset(null);
    setAmount('');
    setError(null);
    setOrderId(null);
  }, []);

  const handleBack = () => {
    const backMap: Record<Step, Step> = {
      'select-asset': 'connect',
      'input-amount': 'select-asset',
      'select-target': 'input-amount',
      confirm: 'select-target',
      connect: 'connect',
      processing: 'processing',
      success: 'success',
      error: 'confirm',
    };
    setStep(backMap[step]);
    setError(null);
  };

  // 计算预期接收金额
  const expectedReceive = useMemo(() => {
    if (!selectedAsset || !amount) return '0';
    const { numerator, denominator } = selectedAsset.ratio;
    const amountNum = parseFloat(amount);
    const ratioNum = Number(numerator) / Number(denominator);
    return (amountNum * ratioNum).toFixed(8).replace(/\.?0+$/, '');
  }, [selectedAsset, amount]);

  return (
    <AuroraBackground className="min-h-full">
      <div className="relative z-10 mx-auto flex min-h-full w-full max-w-md flex-col">
        {/* Header */}
        <header className="bg-background/80 border-border sticky top-0 z-20 border-b backdrop-blur-md">
          <div className="flex h-14 items-center px-4">
            {!['connect', 'success', 'processing'].includes(step) ? (
              <Button variant="ghost" size="icon-sm" onClick={handleBack}>
                <ChevronLeft className="size-5" />
              </Button>
            ) : (
              <div className="w-7" />
            )}
            <h1 className="flex-1 text-center font-bold">{t('app.title')}</h1>
            <div className="w-7" />
          </div>
        </header>

        {/* Content */}
        <main className="flex flex-1 flex-col p-4">
          {error && step !== 'error' && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="border-destructive/50 bg-destructive/10 mb-4">
                <CardContent className="text-destructive flex items-center gap-2 py-3 text-sm">
                  <AlertCircle className="size-4" />
                  {error}
                </CardContent>
              </Card>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {/* Connect */}
            {step === 'connect' && (
              <motion.div
                key="connect"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-1 flex-col items-center justify-center gap-8 pb-20"
              >
                <div className="relative">
                  <div className="bg-primary/30 absolute inset-0 rounded-full blur-3xl" />
                  <Avatar className="relative size-24 rounded-2xl border border-white/20">
                    <AvatarFallback className="rounded-2xl bg-white/10 backdrop-blur">
                      <Zap className="size-12 text-white" strokeWidth={1.5} />
                    </AvatarFallback>
                  </Avatar>
                </div>

                <div className="space-y-2 text-center">
                  <h2 className="text-2xl font-bold">{t('app.subtitle')}</h2>
                  <p className="text-muted-foreground text-sm">{t('app.description')}</p>
                </div>

                <Button
                  data-testid="connect-button"
                  size="lg"
                  className="h-12 w-full max-w-xs"
                  onClick={handleConnect}
                  disabled={loading || assetsLoading}
                >
                  {(loading || assetsLoading) && <Loader2 className="mr-2 size-4 animate-spin" />}
                  {assetsLoading ? t('connect.loadingConfig') : loading ? t('connect.loading') : t('connect.button')}
                </Button>

                {assetsError && <p className="text-destructive text-sm">{t('connect.configError')}</p>}
              </motion.div>
            )}

            {/* Select Asset */}
            {step === 'select-asset' && (
              <motion.div
                key="select-asset"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-1 flex-col gap-4"
              >
                <WalletCard
                  label={t('wallet.source')}
                  address={sourceAccount?.address}
                  name={sourceAccount?.name}
                  chain={sourceAccount?.chain}
                />

                <div className="space-y-3">
                  <div className="px-1">
                    <CardDescription>{t('asset.select')}</CardDescription>
                    <CardDescription className="text-muted-foreground/70 text-xs">
                      {t('asset.selectDesc')}
                    </CardDescription>
                  </div>
                  {availableAssets.length === 0 ? (
                    <Card>
                      <CardContent className="text-muted-foreground py-8 text-center">
                        {t('asset.noAssets')}
                      </CardContent>
                    </Card>
                  ) : (
                    availableAssets.map((asset, i) => {
                      const rate = (Number(asset.ratio.numerator) / Number(asset.ratio.denominator))
                        .toFixed(4)
                        .replace(/\.?0+$/, '');
                      return (
                        <motion.div
                          key={asset.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                        >
                          <Card
                            data-testid={`asset-card-${asset.symbol}`}
                            className="hover:bg-accent cursor-pointer transition-colors"
                            onClick={() => handleSelectAsset(asset)}
                          >
                            <CardContent className="flex items-center gap-3 py-3">
                              <AssetAvatar symbol={asset.symbol} chain={asset.chain} />
                              <div className="min-w-0 flex-1">
                                <CardTitle className="text-base">
                                  {asset.symbol} {t('common.arrow')} {asset.targetAsset}
                                </CardTitle>
                                <CardDescription>
                                  {t('asset.ratio', { from: asset.symbol, rate, to: asset.targetAsset })}
                                </CardDescription>
                              </div>
                              <div className="text-right">
                                <div className="font-semibold">{asset.balance || '-'}</div>
                                <CardDescription>{t('asset.balance')}</CardDescription>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })
                  )}
                </div>
              </motion.div>
            )}

            {/* Input Amount */}
            {step === 'input-amount' && selectedAsset && (
              <motion.div
                key="input-amount"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-1 flex-col gap-4"
              >
                <WalletCard
                  label={t('wallet.source')}
                  address={sourceAccount?.address}
                  name={sourceAccount?.name}
                  chain={sourceAccount?.chain}
                />

                <Card className="flex-1">
                  <CardContent className="flex h-full flex-col items-center justify-center gap-4 py-8">
                    <AssetAvatar symbol={selectedAsset.symbol} chain={selectedAsset.chain} size="lg" />
                    <div className="text-center">
                      <CardTitle>{selectedAsset.symbol}</CardTitle>
                      <CardDescription>
                        {t('common.labelValue', { label: t('asset.balance'), value: selectedAsset.balance || '-' })}
                      </CardDescription>
                    </div>
                    <div className="relative w-full max-w-xs">
                      <Input
                        data-testid="amount-input"
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        className="border-primary/50 focus-visible:border-primary h-14 rounded-none border-0 border-b-2 text-center text-3xl font-bold focus-visible:ring-0"
                      />
                      {selectedAsset.balance && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute top-1/2 right-0 h-7 -translate-y-1/2 text-xs"
                          onClick={() => setAmount(selectedAsset.balance.replace(/,/g, ''))}
                        >
                          MAX
                        </Button>
                      )}
                    </div>
                    {amount && (
                      <p className="text-muted-foreground text-sm">
                        {t('common.labelValue', { label: t('amount.expected'), value: '' })}
                        <span className="text-foreground font-medium">
                          {expectedReceive} {selectedAsset.targetAsset}
                        </span>
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Button
                  data-testid="next-button"
                  className="h-12 w-full"
                  onClick={handleAmountNext}
                  disabled={!amount || parseFloat(amount) <= 0}
                >
                  {t('amount.next')}
                </Button>
              </motion.div>
            )}

            {/* Select Target */}
            {step === 'select-target' && (
              <motion.div
                key="select-target"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-1 flex-col items-center justify-center gap-8 pb-20"
              >
                <Card className="w-full">
                  <CardContent className="py-4 text-center">
                    <CardDescription className="mb-1">{t('target.willTransfer')}</CardDescription>
                    <div className="flex items-center justify-center gap-2 text-2xl font-bold">
                      <AssetAvatar
                        symbol={selectedAsset?.symbol ?? ''}
                        chain={selectedAsset?.chain ?? 'ETH'}
                        size="sm"
                      />
                      {amount} <span className="text-muted-foreground">{selectedAsset?.symbol}</span>
                    </div>
                    <p className="text-muted-foreground mt-2 text-sm">
                      {t('common.arrow')} {expectedReceive} {selectedAsset?.targetAsset}
                    </p>
                  </CardContent>
                </Card>

                <div className="relative">
                  <div className="bg-primary/30 absolute inset-0 animate-pulse rounded-full blur-2xl" />
                  <Avatar className="bg-primary relative size-16">
                    <AvatarFallback className="bg-transparent">
                      <ArrowDown className="text-primary-foreground size-8" />
                    </AvatarFallback>
                  </Avatar>
                </div>

                <div className="space-y-2 text-center">
                  <p className="text-muted-foreground">
                    {t('target.selectOn')} <Badge variant="outline">{selectedAsset?.targetChain}</Badge>{' '}
                    {t('target.chainTarget')}
                  </p>
                  <p className="font-semibold">{t('wallet.target')}</p>
                </div>

                <Button
                  data-testid="target-button"
                  size="lg"
                  className="h-12 w-full max-w-xs"
                  onClick={handleSelectTarget}
                  disabled={loading}
                >
                  {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
                  {loading ? t('target.loading') : t('target.button')}
                </Button>
              </motion.div>
            )}

            {/* Confirm */}
            {step === 'confirm' && (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-1 flex-col gap-4"
              >
                <Card>
                  <CardContent className="space-y-4 py-6 text-center">
                    <div>
                      <CardDescription className="mb-1">{t('confirm.send')}</CardDescription>
                      <div className="flex items-center justify-center gap-2 text-3xl font-bold">
                        <AssetAvatar
                          symbol={selectedAsset?.symbol ?? ''}
                          chain={selectedAsset?.chain ?? 'ETH'}
                          size="sm"
                        />
                        {amount} <span className="text-muted-foreground text-lg">{selectedAsset?.symbol}</span>
                      </div>
                    </div>
                    <div className="flex justify-center">
                      <Avatar className="border-primary/30 bg-primary/10 size-10 border">
                        <AvatarFallback className="bg-transparent">
                          <ArrowDown className="text-primary size-5" />
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div>
                      <CardDescription className="mb-1">{t('confirm.receive')}</CardDescription>
                      <div className="text-2xl font-bold text-emerald-400">
                        {expectedReceive}{' '}
                        <span className="text-muted-foreground text-lg">{selectedAsset?.targetAsset}</span>
                      </div>
                    </div>
                    <div className="space-y-2 pt-2">
                      <WalletCard
                        label={t('wallet.sender')}
                        address={sourceAccount?.address}
                        name={sourceAccount?.name}
                        chain={sourceAccount?.chain}
                        compact
                      />
                      <WalletCard
                        label={t('wallet.receiver')}
                        address={targetAccount?.address}
                        name={targetAccount?.name}
                        chain={selectedAsset?.targetChain}
                        compact
                        highlight
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="space-y-3 py-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('confirm.sourceChain')}</span>
                      <Badge variant="outline">{selectedAsset?.chain}</Badge>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('confirm.targetChain')}</span>
                      <Badge variant="outline">{selectedAsset?.targetChain}</Badge>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('confirm.ratio')}</span>
                      <span>{`${selectedAsset?.ratio.numerator}:${selectedAsset?.ratio.denominator}`}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t('confirm.fee')}</span>
                      <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20">
                        {t('confirm.free')}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <div className="mt-auto pt-4">
                  <Button
                    data-testid="confirm-button"
                    className="h-12 w-full"
                    onClick={handleConfirm}
                    disabled={loading}
                  >
                    {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
                    {loading ? t('confirm.loading') : t('confirm.button')}
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Processing */}
            {step === 'processing' && (
              <motion.div
                key="processing"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-1 flex-col items-center justify-center gap-6 pb-20"
              >
                <div className="relative">
                  <div className="bg-primary/30 absolute inset-0 animate-pulse rounded-full blur-3xl" />
                  <Avatar className="bg-primary/20 relative size-20">
                    <AvatarFallback className="bg-transparent">
                      <RefreshCw className="text-primary size-10 animate-spin" />
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="space-y-2 text-center">
                  <h2 className="text-xl font-bold">{t('processing.title')}</h2>
                  <p className="text-muted-foreground text-sm">
                    {recordDetail?.orderState === SWAP_ORDER_STATE_ID.FROM_TX_WAIT_ON_CHAIN &&
                      t('processing.waitingFrom')}
                    {recordDetail?.orderState === SWAP_ORDER_STATE_ID.TO_TX_WAIT_ON_CHAIN && t('processing.waitingTo')}
                    {!recordDetail && t('processing.processing')}
                  </p>
                </div>
                {orderId && (
                  <p className="text-muted-foreground text-xs">
                    {t('common.labelValue', { label: t('processing.orderId'), value: orderId })}
                  </p>
                )}
              </motion.div>
            )}

            {/* Success */}
            {step === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-1 flex-col items-center justify-center gap-6 pb-20"
              >
                <Avatar className="size-20 border border-emerald-500/30 bg-emerald-500/10">
                  <AvatarFallback className="bg-transparent">
                    <Check className="size-10 text-emerald-500" />
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2 text-center">
                  <h2 className="text-xl font-bold">{t('success.title')}</h2>
                  <p className="text-2xl font-bold text-emerald-400">
                    {expectedReceive} {selectedAsset?.targetAsset}
                  </p>
                  <p className="text-muted-foreground text-sm">{t('success.sentTo')}</p>
                </div>
                <Button variant="outline" className="w-full max-w-xs" onClick={handleReset}>
                  {t('success.newTransfer')}
                </Button>
              </motion.div>
            )}

            {/* Error */}
            {step === 'error' && (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-1 flex-col items-center justify-center gap-6 pb-20"
              >
                <Avatar className="border-destructive/30 bg-destructive/10 size-20 border">
                  <AvatarFallback className="bg-transparent">
                    <AlertCircle className="text-destructive size-10" />
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2 text-center">
                  <h2 className="text-xl font-bold">{t('error.title')}</h2>
                  <p className="text-muted-foreground max-w-xs text-sm">{error || t('error.unknown')}</p>
                </div>
                <div className="flex w-full max-w-xs gap-3">
                  <Button variant="outline" className="flex-1" onClick={handleReset}>
                    {t('error.restart')}
                  </Button>
                  <Button className="flex-1" onClick={() => setStep('confirm')}>
                    {t('error.retry')}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </AuroraBackground>
  );
}

function WalletCard({
  label,
  address,
  name,
  chain,
  compact,
  highlight,
}: {
  label: string;
  address?: string;
  name?: string;
  chain?: string;
  compact?: boolean;
  highlight?: boolean;
}) {
  const { t } = useTranslation();
  if (compact) {
    return (
      <Card className={cn('border-0', highlight ? 'bg-primary/10' : 'bg-muted/50')}>
        <CardContent className="flex items-center gap-3 py-2">
          <Avatar
            className={cn(
              'size-8',
              highlight ? 'bg-primary/20 text-primary-foreground' : 'bg-muted text-muted-foreground',
            )}
          >
            <AvatarFallback className="bg-transparent">
              <Wallet className="size-4" />
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1 text-left">
            <CardDescription className="text-xs">
              {label}{' '}
              {chain && (
                <Badge variant="outline" className="ml-1 text-xs">
                  {chain}
                </Badge>
              )}
            </CardDescription>
            <div className="truncate text-sm font-medium">{name || truncateAddress(address)}</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="flex items-center gap-3 py-3">
        <Avatar className="bg-primary/20 size-10">
          <AvatarFallback className="bg-transparent">
            <Wallet className="text-primary size-5" />
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <CardDescription>
            {label}{' '}
            {chain && (
              <Badge variant="outline" className="ml-1">
                {chain}
              </Badge>
            )}
          </CardDescription>
          <CardTitle className="truncate text-base">{name || t('common.unknown')}</CardTitle>
          <CardDescription className="truncate">{address}</CardDescription>
        </div>
      </CardContent>
    </Card>
  );
}

function AssetAvatar({ symbol, chain, size = 'md' }: { symbol: string; chain: string; size?: 'sm' | 'md' | 'lg' }) {
  const icons: Record<string, React.ReactNode> = {
    BFM: <Leaf />,
    ETH: <Coins />,
    USDT: <DollarSign />,
  };
  const sizeClass =
    size === 'lg' ? 'size-16 [&_svg]:size-8' : size === 'md' ? 'size-10 [&_svg]:size-5' : 'size-6 [&_svg]:size-3';

  return (
    <Avatar className={cn(sizeClass, CHAIN_COLORS[chain] || 'bg-muted')}>
      <AvatarFallback className="bg-transparent text-white">{icons[symbol] || <Coins />}</AvatarFallback>
    </Avatar>
  );
}

function truncateAddress(address?: string): string {
  if (!address) return '';
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
