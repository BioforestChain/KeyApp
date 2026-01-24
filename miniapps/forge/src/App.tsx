/**
 * BioBridge App - 跨链通
 * 支持充值 (Recharge) 和赎回 (Redemption) 双模式
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { BioAccount } from '@biochain/bio-sdk';
import { normalizeChainId } from '@biochain/bio-sdk';
import { getChainType, getEvmChainIdFromApi } from '@/lib/chain';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

import { BackgroundBeams } from './components/BackgroundBeams';
import { ModeTabs } from './components/ModeTabs';
import { RedemptionForm } from './components/RedemptionForm';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Coins,
  Leaf,
  DollarSign,
  X,
  ChevronLeft,
  ArrowDown,
  Check,
  Loader2,
  AlertCircle,
  ArrowLeftRight,
} from 'lucide-react';

import { useRechargeConfig, useForge, type ForgeOption } from '@/hooks';
import type { BridgeMode } from '@/api/types';

type RechargeStep = 'connect' | 'swap' | 'confirm' | 'processing' | 'success';

const TOKEN_COLORS: Record<string, string> = {
  ETH: 'bg-indigo-600',
  BSC: 'bg-yellow-600',
  TRON: 'bg-red-600',
  BFM: 'bg-emerald-600',
  USDT: 'bg-teal-600',
  BFC: 'bg-blue-600',
};

function TokenAvatar({ symbol, size = 'sm' }: { symbol: string; size?: 'sm' | 'md' }) {
  const iconSize = size === 'md' ? 'size-5' : 'size-4';
  const icons: Record<string, React.ReactNode> = {
    ETH: <Coins className={iconSize} />,
    BSC: <Coins className={iconSize} />,
    TRON: <Coins className={iconSize} />,
    BFM: <Leaf className={iconSize} />,
    BFC: <Leaf className={iconSize} />,
    USDT: <DollarSign className={iconSize} />,
  };
  return (
    <Avatar className={cn(size === 'md' ? 'size-10' : 'size-6', TOKEN_COLORS[symbol] || 'bg-muted')}>
      <AvatarFallback className="bg-transparent text-white">
        {icons[symbol] || <Coins className={iconSize} />}
      </AvatarFallback>
    </Avatar>
  );
}

export default function App() {
  const { t } = useTranslation();

  // Bridge mode: recharge or redemption
  const [mode, setMode] = useState<BridgeMode>('recharge');

  // Recharge state
  const [rechargeStep, setRechargeStep] = useState<RechargeStep>('connect');
  const [externalAccount, setExternalAccount] = useState<BioAccount | null>(null);
  const [internalAccount, setInternalAccount] = useState<BioAccount | null>(null);
  const [selectedOption, setSelectedOption] = useState<ForgeOption | null>(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  // Fetch recharge config from backend
  const { config, forgeOptions, isLoading: configLoading, error: configError } = useRechargeConfig();

  // Forge hook for recharge
  const forgeHook = useForge();

  // Helper to get chain name from translations
  const getChainName = useCallback(
    (chain: string) => {
      return t(`chain.${chain}`, { defaultValue: chain });
    },
    [t],
  );

  // Close splash screen
  useEffect(() => {
    window.bio?.request({ method: 'bio_closeSplashScreen' });
  }, []);

  // Auto-select first option when config loads
  useEffect(() => {
    if (forgeOptions.length > 0 && !selectedOption) {
      setSelectedOption(forgeOptions[0]);
    }
  }, [forgeOptions, selectedOption]);

  // Watch forge status
  useEffect(() => {
    if (forgeHook.step === 'success') {
      setRechargeStep('success');
    } else if (forgeHook.step === 'error') {
      setError(forgeHook.error);
      setRechargeStep('confirm');
    } else if (forgeHook.step !== 'idle') {
      setRechargeStep('processing');
    }
  }, [forgeHook.step, forgeHook.error]);

  // Reset state when mode changes
  const handleModeChange = useCallback(
    (newMode: BridgeMode) => {
      setMode(newMode);
      setError(null);
      if (newMode === 'recharge') {
        setRechargeStep('connect');
        setAmount('');
        forgeHook.reset();
      }
    },
    [forgeHook],
  );

  const handleConnect = useCallback(async () => {
    if (!window.bio) {
      setError('Bio SDK not initialized');
      return;
    }
    if (!selectedOption) {
      setError('Please select an option');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const externalChain = selectedOption.externalChain;
      const chainType = getChainType(externalChain);

      let extAcc: BioAccount;

      if (chainType === 'evm') {
        if (!window.ethereum) {
          throw new Error('Ethereum provider not available');
        }
        const evmChainId = getEvmChainIdFromApi(externalChain);
        if (evmChainId) {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: evmChainId }],
          });
        }
        const accounts = await window.ethereum.request<string[]>({
          method: 'eth_requestAccounts',
        });
        if (!accounts || accounts.length === 0) {
          throw new Error('No accounts returned');
        }
        extAcc = {
          address: accounts[0],
          chain: normalizeChainId(externalChain),
          publicKey: '',
        };
      } else if (chainType === 'tron') {
        if (!window.tronLink) {
          throw new Error('TronLink provider not available');
        }
        const result = await window.tronLink.request<{ code: number; message: string; data: { base58: string } }>({
          method: 'tron_requestAccounts',
        });
        if (!result || result.code !== 200) {
          throw new Error('TRON connection failed');
        }
        extAcc = {
          address: result.data.base58,
          chain: 'tron',
          publicKey: '',
        };
      } else {
        extAcc = await window.bio.request<BioAccount>({
          method: 'bio_selectAccount',
          params: [{ chain: normalizeChainId(externalChain) }],
        });
      }
      setExternalAccount(extAcc);

      const intAcc = await window.bio.request<BioAccount>({
        method: 'bio_selectAccount',
        params: [{ chain: selectedOption.internalChain }],
      });
      setInternalAccount(intAcc);

      setRechargeStep('swap');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed');
    } finally {
      setLoading(false);
    }
  }, [selectedOption]);

  const handlePreview = () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError(t('error.invalidAmount'));
      return;
    }
    setError(null);
    setRechargeStep('confirm');
  };

  const handleConfirm = useCallback(async () => {
    if (!externalAccount || !internalAccount || !selectedOption) return;

    setError(null);
    setRechargeStep('processing');

    await forgeHook.forge({
      externalChain: selectedOption.externalChain,
      externalAsset: selectedOption.externalAsset,
      externalDecimals: selectedOption.externalInfo.decimals,
      depositAddress: selectedOption.externalInfo.depositAddress,
      externalContract: selectedOption.externalInfo.contract,
      amount,
      externalAccount,
      internalChain: selectedOption.internalChain,
      internalAsset: selectedOption.internalAsset,
      internalAccount,
    });
  }, [externalAccount, internalAccount, selectedOption, amount, forgeHook]);

  const handleReset = useCallback(() => {
    setRechargeStep('swap');
    setAmount('');
    setError(null);
    forgeHook.reset();
  }, [forgeHook]);

  // Group options by external chain for picker
  const groupedOptions = useMemo(() => {
    const groups: Record<string, ForgeOption[]> = {};
    for (const opt of forgeOptions) {
      const key = opt.externalChain;
      if (!groups[key]) groups[key] = [];
      groups[key].push(opt);
    }
    return groups;
  }, [forgeOptions]);

  const handleSelectOption = (option: ForgeOption) => {
    setSelectedOption(option);
    setPickerOpen(false);
  };

  const handleSelectExternalChain = useCallback(
    (externalChain: string) => {
      const options = groupedOptions[externalChain];
      const first = options?.[0];
      if (first) {
        setSelectedOption(first);
      }
    },
    [groupedOptions],
  );

  // Check if redemption is available
  const hasRedemptionOptions = useMemo(() => {
    if (!config) return false;
    for (const chain of Object.values(config)) {
      for (const item of Object.values(chain)) {
        if (item.enable && item.redemption?.enable) {
          return true;
        }
      }
    }
    return false;
  }, [config]);

  return (
    <div className="bg-background text-foreground relative min-h-full w-full">
      <BackgroundBeams className="opacity-30" />

      <div className="relative z-10 mx-auto flex min-h-full w-full max-w-md flex-col">
        {/* Header */}
        <header className="bg-background/80 border-border sticky top-0 z-20 border-b backdrop-blur-md">
          <div className="flex h-14 items-center px-4">
            {rechargeStep === 'confirm' && mode === 'recharge' && (
              <Button variant="ghost" size="icon-sm" onClick={() => setRechargeStep('swap')}>
                <ChevronLeft className="size-5" />
              </Button>
            )}
            <h1 className="flex-1 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-center font-bold text-transparent">
              {t('app.title')}
            </h1>
            <div className="w-7" />
          </div>

          {/* Mode Tabs - Only show if redemption is available */}
          {hasRedemptionOptions && !configLoading && (
            <div className="px-4 pb-3">
              <ModeTabs
                mode={mode}
                onChange={handleModeChange}
                rechargeLabel={t('mode.recharge')}
                redemptionLabel={t('mode.redemption')}
              />
            </div>
          )}
        </header>

        {/* Content */}
        <main className="flex flex-1 flex-col p-4">
          {/* Loading config */}
          {configLoading && (
            <div className="flex flex-1 items-center justify-center">
              <Loader2 className="text-muted-foreground size-8 animate-spin" />
            </div>
          )}

          {/* Config error */}
          {configError && (
            <Card className="border-destructive/50 bg-destructive/10 mb-4">
              <CardContent className="text-destructive flex items-center gap-2 py-3 text-sm">
                <AlertCircle className="size-4" />
                {configError}
              </CardContent>
            </Card>
          )}

          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="border-destructive/50 bg-destructive/10 mb-4">
                <CardContent className="text-destructive py-3 text-sm">{error}</CardContent>
              </Card>
            </motion.div>
          )}

          {/* Redemption Mode */}
          {mode === 'redemption' && config && !configLoading && (
            <RedemptionForm config={config} onSuccess={(orderId) => {}} />
          )}

          {/* Recharge Mode */}
          {mode === 'recharge' && (
            <AnimatePresence mode="wait">
              {/* Connect */}
              {rechargeStep === 'connect' && !configLoading && (
                <motion.div
                  key="connect"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-1 flex-col items-center justify-center gap-8 pb-20"
                >
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-3xl" />
                    <Avatar className="relative size-28 border-2 border-blue-500/30">
                      <AvatarFallback className="from-muted to-muted/50 bg-gradient-to-b">
                        <ArrowLeftRight className="size-14 text-blue-500" strokeWidth={1.5} />
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  <div className="space-y-2 text-center">
                    <h2 className="text-2xl font-bold">{t('app.subtitle')}</h2>
                    <p className="text-muted-foreground text-sm">{t('app.description')}</p>
                  </div>

                  {/* Available chains preview */}
                  {forgeOptions.length > 0 && (
                    <div className="flex gap-2">
                      {Object.keys(groupedOptions).map((chain) => (
                        <Badge
                          key={chain}
                          asChild
                          variant={selectedOption?.externalChain === chain ? 'secondary' : 'outline'}
                          className={cn(
                            'cursor-pointer select-none',
                            selectedOption?.externalChain === chain && 'ring-primary/40 ring-2',
                          )}
                        >
                          <button type="button" onClick={() => handleSelectExternalChain(chain)}>
                            {getChainName(chain)}
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}

                  <Button
                    data-testid="connect-button"
                    size="lg"
                    className="h-12 w-full max-w-xs"
                    onClick={handleConnect}
                    disabled={loading || forgeOptions.length === 0 || !selectedOption}
                  >
                    {loading && <Loader2 className="mr-2 size-4 animate-spin" />}
                    {loading ? t('connect.loading') : t('connect.button')}
                  </Button>
                </motion.div>
              )}

              {/* Swap */}
              {rechargeStep === 'swap' && selectedOption && (
                <motion.div
                  key="swap"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex flex-1 flex-col gap-3"
                >
                  {/* From Card (External Chain) */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>
                        {t('forge.pay')} ({getChainName(selectedOption.externalChain)})
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="bg-muted/50 flex h-10 shrink-0 items-center gap-2 rounded-md border px-3">
                          <TokenAvatar symbol={selectedOption.externalAsset} size="sm" />
                          <span className="font-semibold">{selectedOption.externalAsset}</span>
                        </div>
                        <Input
                          data-testid="amount-input"
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          placeholder="0.00"
                          className="h-10 border-0 text-right text-2xl font-bold focus-visible:ring-0"
                        />
                      </div>
                      <div className="text-muted-foreground font-mono text-xs break-all">
                        {externalAccount?.address}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Arrow */}
                  <div className="relative z-10 -my-1.5 flex justify-center">
                    <Avatar className="bg-background size-10 border border-blue-500/30">
                      <AvatarFallback className="bg-blue-500/10">
                        <ArrowDown className="size-4 text-blue-500" />
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  {/* To Card (Internal Chain) */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>
                        {t('forge.receive')} ({getChainName(selectedOption.internalChain)})
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="bg-muted/50 flex h-10 shrink-0 items-center gap-2 rounded-md border px-3">
                          <TokenAvatar symbol={selectedOption.internalAsset} size="sm" />
                          <span className="font-semibold">{selectedOption.internalAsset}</span>
                        </div>
                        <div className="text-muted-foreground flex-1 text-right text-2xl font-bold">
                          {amount || '0.00'}
                        </div>
                      </div>
                      <div className="text-muted-foreground font-mono text-xs break-all">
                        {internalAccount?.address}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Rate Info - 1:1 for recharge */}
                  {amount && parseFloat(amount) > 0 && (
                    <Card className="border-blue-500/20 bg-blue-500/5">
                      <CardContent className="space-y-2 py-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t('forge.ratio')}</span>
                          <span>1:1</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t('forge.depositAddress')}</span>
                          <span className="max-w-40 truncate font-mono text-xs">
                            {selectedOption.externalInfo.depositAddress.slice(0, 10)}...
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <div className="mt-auto pt-4">
                    <Button
                      data-testid="preview-button"
                      className="h-12 w-full"
                      onClick={handlePreview}
                      disabled={!amount || parseFloat(amount) <= 0}
                    >
                      {t('forge.preview')}
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Confirm */}
              {rechargeStep === 'confirm' && selectedOption && (
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
                        <CardDescription className="mb-1">
                          {t('forge.pay')} ({getChainName(selectedOption.externalChain)})
                        </CardDescription>
                        <div className="flex items-center justify-center gap-2 text-3xl font-bold">
                          <TokenAvatar symbol={selectedOption.externalAsset} size="sm" />
                          {amount} <span className="text-muted-foreground text-lg">{selectedOption.externalAsset}</span>
                        </div>
                      </div>
                      <div className="flex justify-center">
                        <Avatar className="size-10 border border-blue-500/30 bg-blue-500/10">
                          <AvatarFallback className="bg-transparent">
                            <ArrowDown className="size-5 text-blue-500" />
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div>
                        <CardDescription className="mb-1">
                          {t('forge.receive')} ({getChainName(selectedOption.internalChain)})
                        </CardDescription>
                        <div className="flex items-center justify-center gap-2 text-3xl font-bold text-blue-500">
                          <TokenAvatar symbol={selectedOption.internalAsset} size="sm" />
                          {amount} <span className="text-lg text-blue-500/60">{selectedOption.internalAsset}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="space-y-3 py-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t('forge.ratio')}</span>
                        <span>1:1</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t('forge.network')}</span>
                        <div className="flex gap-2">
                          <Badge variant="outline">{getChainName(selectedOption.externalChain)}</Badge>
                          <span>→</span>
                          <Badge variant="outline">{getChainName(selectedOption.internalChain)}</Badge>
                        </div>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t('forge.depositAddress')}</span>
                        <span className="max-w-32 truncate font-mono text-xs">
                          {selectedOption.externalInfo.depositAddress.slice(0, 10)}...
                        </span>
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
                      {t('forge.confirm')}
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Processing */}
              {rechargeStep === 'processing' && (
                <motion.div
                  key="processing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-1 flex-col items-center justify-center gap-6 pb-20"
                >
                  <div className="relative size-24">
                    <div className="border-muted absolute inset-0 rounded-full border-4" />
                    <div className="absolute inset-0 animate-spin rounded-full border-4 border-t-blue-500" />
                  </div>
                  <div className="space-y-2 text-center">
                    <h2 className="text-xl font-bold">
                      {forgeHook.step === 'signing_external' && t('processing.signingExternal')}
                      {forgeHook.step === 'signing_internal' && t('processing.signingInternal')}
                      {forgeHook.step === 'submitting' && t('processing.submitting')}
                      {forgeHook.step === 'idle' && t('processing.default')}
                    </h2>
                    <p className="text-muted-foreground text-sm">{t('processing.hint')}</p>
                  </div>
                </motion.div>
              )}

              {/* Success */}
              {rechargeStep === 'success' && selectedOption && (
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
                      {amount} {selectedOption.internalAsset}
                    </p>
                    {forgeHook.orderId && (
                      <p className="text-muted-foreground font-mono text-xs">
                        {t('success.orderId')}: {forgeHook.orderId.slice(0, 16)}...
                      </p>
                    )}
                  </div>
                  <Button variant="outline" className="w-full max-w-xs" onClick={handleReset}>
                    {t('forge.continue')}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          )}

          {/* Token Picker Modal */}
          {pickerOpen && (
            <div className="fixed inset-0 z-50">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setPickerOpen(false)} />
              <div className="bg-card border-border animate-in slide-in-from-bottom absolute right-0 bottom-0 left-0 rounded-t-2xl border-t">
                <div className="border-border flex items-center justify-between border-b p-4">
                  <CardTitle>{t('picker.title')}</CardTitle>
                  <Button variant="ghost" size="icon-sm" onClick={() => setPickerOpen(false)}>
                    <X className="size-5" />
                  </Button>
                </div>
                <div className="max-h-96 space-y-4 overflow-y-auto p-4">
                  {Object.entries(groupedOptions).map(([chain, options]) => (
                    <div key={chain}>
                      <h3 className="text-muted-foreground mb-2 text-sm font-medium">{getChainName(chain)}</h3>
                      <div className="space-y-2">
                        {options.map((option) => (
                          <Card
                            key={`${option.externalChain}-${option.externalAsset}-${option.internalAsset}`}
                            className={cn(
                              'hover:bg-accent cursor-pointer transition-colors',
                              selectedOption?.externalAsset === option.externalAsset &&
                                selectedOption?.externalChain === option.externalChain &&
                                'ring-primary ring-2',
                            )}
                            onClick={() => handleSelectOption(option)}
                          >
                            <CardContent className="flex items-center gap-3 py-3">
                              <TokenAvatar symbol={option.externalAsset} size="md" />
                              <div className="flex-1">
                                <CardTitle className="text-base">
                                  {option.externalAsset} → {option.internalAsset}
                                </CardTitle>
                                <CardDescription>
                                  {getChainName(option.externalChain)} → {getChainName(option.internalChain)}
                                </CardDescription>
                              </div>
                              {selectedOption?.externalAsset === option.externalAsset &&
                                selectedOption?.externalChain === option.externalChain && (
                                  <Badge>{t('picker.selected')}</Badge>
                                )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
