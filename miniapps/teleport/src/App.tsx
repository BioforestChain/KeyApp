import { useState, useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { BioAccount, BioSignedTransaction, BioUnsignedTransaction } from '@biochain/bio-sdk';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { AuroraBackground } from './components/AuroraBackground';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { superjson } from '@biochain/chain-effect';
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
  type TronTransaction,
  type Trc20Transaction,
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isTronPayload(value: unknown): value is TronTransaction {
  if (!isRecord(value)) return false
  if (typeof value.txID !== 'string') return false
  if (typeof value.raw_data_hex !== 'string') return false
  if (!('raw_data' in value)) return false
  const rawData = value.raw_data
  if (!isRecord(rawData)) return false
  if (!Array.isArray(rawData.contract)) return false
  const contract = rawData.contract[0]
  if (!isRecord(contract)) return false
  const parameter = contract.parameter
  if (!isRecord(parameter)) return false
  const paramValue = parameter.value
  if (!isRecord(paramValue)) return false
  return (
    typeof paramValue.owner_address === 'string' &&
    typeof paramValue.to_address === 'string' &&
    typeof paramValue.amount === 'number'
  )
}

function isTrc20Payload(value: unknown): value is Trc20Transaction {
  if (!isRecord(value)) return false
  if (typeof value.txID !== 'string') return false
  if (typeof value.raw_data_hex !== 'string') return false
  if (!('raw_data' in value)) return false
  const rawData = value.raw_data
  if (!isRecord(rawData)) return false
  if (!Array.isArray(rawData.contract)) return false
  const contract = rawData.contract[0]
  if (!isRecord(contract)) return false
  const parameter = contract.parameter
  if (!isRecord(parameter)) return false
  const paramValue = parameter.value
  if (!isRecord(paramValue)) return false
  return (
    typeof paramValue.owner_address === 'string' &&
    typeof paramValue.contract_address === 'string'
  )
}

function getTronSignedPayload(data: unknown, label: 'TRON'): TronTransaction
function getTronSignedPayload(data: unknown, label: 'TRC20'): Trc20Transaction
function getTronSignedPayload(
  data: unknown,
  label: 'TRON' | 'TRC20',
): TronTransaction | Trc20Transaction {
  if (isRecord(data) && 'signedTx' in data) {
    const maybeSigned = (data as { signedTx?: unknown }).signedTx
    if (label === 'TRC20' && isTrc20Payload(maybeSigned)) {
      return maybeSigned
    }
    if (label === 'TRON' && isTronPayload(maybeSigned)) {
      return maybeSigned
    }
  }
  if (label === 'TRC20' && isTrc20Payload(data)) {
    return data
  }
  if (label === 'TRON' && isTronPayload(data)) {
    return data
  }
  throw new Error(`Invalid ${label} transaction payload`)
}

function isTransferAssetTransaction(value: unknown): value is TransferAssetTransaction {
  if (!isRecord(value)) return false
  if (typeof value.senderId !== 'string') return false
  if (typeof value.recipientId !== 'string') return false
  if (typeof value.amount !== 'string') return false
  if (typeof value.fee !== 'string') return false
  if (typeof value.timestamp !== 'number') return false
  if (typeof value.signature !== 'string') return false
  const asset = value.asset
  if (!isRecord(asset) || !isRecord(asset.transferAsset)) return false
  const transferAsset = asset.transferAsset as Record<string, unknown>
  return typeof transferAsset.amount === 'string' && typeof transferAsset.assetType === 'string'
}

function getInternalTrJson(signedTx: BioSignedTransaction): TransferAssetTransaction | undefined {
  if (isRecord(signedTx) && 'trJson' in signedTx) {
    const trJson = signedTx.trJson
    return isTransferAssetTransaction(trJson) ? trJson : undefined
  }
  if (isRecord(signedTx.data)) {
    return isTransferAssetTransaction(signedTx.data) ? signedTx.data : undefined
  }
  return undefined
}

function toJsonSafe(value: unknown): unknown {
  return superjson.serialize(value).json;
}

const CHAIN_COLORS: Record<string, string> = {
  ETH: 'bg-indigo-600',
  BSC: 'bg-amber-600',
  TRON: 'bg-red-600',
  BFMCHAIN: 'bg-emerald-600',
  ETHMETA: 'bg-purple-600',
  PMCHAIN: 'bg-cyan-600',
};

const normalizeInternalChainName = (value: string): InternalChainName =>
  value.toUpperCase() as InternalChainName;

const normalizeInputAmount = (value: string) =>
  value.includes('.') ? value : `${value}.0`;

const formatMinAmount = (decimals: number) => {
  if (decimals <= 0) return '1';
  return `0.${'0'.repeat(decimals - 1)}1`;
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
  const {
    data: assets,
    isLoading: assetsLoading,
    isFetching: assetsFetching,
    error: assetsError,
    refetch: refetchAssets,
  } = useTransmitAssetTypeList();
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

  useEffect(() => {
    if (step !== 'processing') return;
    if (!transmitMutation.isError) return;
    const err = transmitMutation.error;
    setError(err instanceof Error ? err.message : String(err));
    setStep('error');
    setLoading(false);
  }, [step, transmitMutation.isError, transmitMutation.error]);

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
      // 1. 构造 toTrInfo
      const toTrInfo: ToTrInfo = {
        chainName: normalizeInternalChainName(selectedAsset.targetChain),
        address: targetAccount.address,
        assetType: selectedAsset.targetAsset,
      };

      const chainLower = sourceAccount.chain.toLowerCase();
      const isInternalChain =
        chainLower !== 'eth' &&
        chainLower !== 'bsc' &&
        chainLower !== 'tron' &&
        chainLower !== 'trc20';

      const remark = isInternalChain
        ? {
            chainName: toTrInfo.chainName,
            address: toTrInfo.address,
            assetType: toTrInfo.assetType,
          }
        : undefined;

      // 2. 创建未签名交易（转账到 recipientAddress）
      const unsignedTx = await window.bio.request<BioUnsignedTransaction>({
        method: 'bio_createTransaction',
        params: [
          {
            from: sourceAccount.address,
            to: selectedAsset.recipientAddress,
            amount: normalizeInputAmount(amount),
            chain: sourceAccount.chain,
            asset: selectedAsset.assetType,
            ...(remark ? { remark } : {}),
          },
        ],
      });

      // 2. 签名交易
      const unsignedTxSafe = toJsonSafe(unsignedTx);
      const signedTx = await window.bio.request<BioSignedTransaction>({
        method: 'bio_signTransaction',
        params: [
          {
            from: sourceAccount.address,
            chain: sourceAccount.chain,
            unsignedTx: unsignedTxSafe,
          },
        ],
      });

      // 4. 构造 fromTrJson（根据链类型）
      // 注意：EVM 需要 raw signed tx 的 hex；TRON/内链需要结构化交易体
      const fromTrJson: FromTrJson = {};
      const signTransData = typeof signedTx.data === 'string'
        ? signedTx.data
        : superjson.stringify(signedTx.data);
      const isTronChain = chainLower === 'tron' || chainLower === 'trc20';
      const isTrc20 = chainLower === 'trc20' || (chainLower === 'tron' && !!selectedAsset.contractAddress);

      if (chainLower === 'eth') {
        fromTrJson.eth = { signTransData };
      } else if (chainLower === 'bsc') {
        fromTrJson.bsc = { signTransData };
      } else if (isTronChain) {
        if (isTrc20) {
          const tronPayload = getTronSignedPayload(signedTx.data, 'TRC20');
          fromTrJson.trc20 = tronPayload;
        } else {
          const tronPayload = getTronSignedPayload(signedTx.data, 'TRON');
          fromTrJson.tron = tronPayload;
        }
      } else {
        // 内链交易（BioForest 链）
        const internalTrJson = getInternalTrJson(signedTx);
        if (!internalTrJson) {
          throw new Error('Invalid internal signed transaction payload');
        }
        fromTrJson.bcf = {
          chainName: normalizeInternalChainName(sourceAccount.chain),
          trJson: internalTrJson,
        };
      }

      // 6. 发起传送请求
      if (typeof navigator !== 'undefined' && navigator.onLine === false) {
        throw new Error('网络不可用')
      }
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
                  disabled={loading || assetsLoading || assetsFetching || !!assetsError}
                >
                  {(loading || assetsLoading || assetsFetching) && <Loader2 className="mr-2 size-4 animate-spin" />}
                  {assetsLoading || assetsFetching
                    ? t('connect.loadingConfig')
                    : loading
                      ? t('connect.loading')
                      : t('connect.button')}
                </Button>

                {assetsError && (
                  <div className="flex flex-col items-center gap-2 text-center">
                    <p className="text-destructive text-sm">{t('connect.configError')}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => refetchAssets()}
                      disabled={assetsFetching}
                    >
                      <RefreshCw className={cn('size-4', assetsFetching && 'animate-spin')} />
                      {t('error.retry')}
                    </Button>
                    <p className="text-muted-foreground text-xs">
                      {assetsError instanceof Error ? assetsError.message : String(assetsError)}
                    </p>
                  </div>
                )}
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
                    <p className="text-muted-foreground text-xs">
                      {t('amount.precisionHint', {
                        decimals: selectedAsset.decimals,
                        min: formatMinAmount(selectedAsset.decimals),
                      })}
                    </p>
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
                      <span className="text-muted-foreground">{t('amount.precision')}</span>
                      <span>
                        {t('amount.precisionValue', {
                          decimals: selectedAsset?.decimals ?? 0,
                          min: formatMinAmount(selectedAsset?.decimals ?? 0),
                        })}
                      </span>
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
