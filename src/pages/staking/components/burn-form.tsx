/**
 * Burn Form - Unstake internal tokens to external chain
 */

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { IconArrowDown as ArrowDown, IconChevronRight as ChevronRight } from '@tabler/icons-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { TokenIcon } from '@/components/wallet/token-icon';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { stakingService } from '@/services/staking';
import { Amount } from '@/types/amount';
import type { ExternalChain, InternalChain, RechargeConfig, BurnRequest } from '@/types/staking';
import { cn } from '@/lib/utils';

interface BurnFormProps {
  onSuccess?: (txId: string) => void;
  className?: string;
}

/** Available source (internal) chain options */
const SOURCE_CHAINS: InternalChain[] = ['BFMeta', 'BFChain', 'CCChain', 'PMChain'];

/** Chain display names */
const CHAIN_NAMES: Record<string, string> = {
  ETH: 'Ethereum',
  BSC: 'BNB Chain',
  TRON: 'Tron',
  BFMeta: 'BFMeta',
  BFChain: 'BFChain',
  CCChain: 'CCChain',
  PMChain: 'PMChain',
};

/** Mock internal chain balances for validation */
const MOCK_BALANCES: Record<string, Record<string, string>> = {
  BFMeta: { BFM: '5000.00', USDT: '2500.00' },
  BFChain: { BFC: '1000.00' },
  CCChain: {},
  PMChain: {},
};

/** Token info with target chains */
interface TokenWithTargets {
  asset: string;
  targetChains: ExternalChain[];
}

/** Get available tokens for a source (internal) chain from recharge config */
function getAvailableTokens(config: RechargeConfig | null, sourceChain: InternalChain): TokenWithTargets[] {
  if (!config) return [];

  const chainKey = sourceChain.toLowerCase();
  const chainConfig = config[chainKey];
  if (!chainConfig) return [];

  const tokens: TokenWithTargets[] = [];

  for (const [assetType, assetConfig] of Object.entries(chainConfig)) {
    const targetChains: ExternalChain[] = [];

    // Collect all supported external chains
    if (assetConfig.supportChain.ETH) targetChains.push('ETH');
    if (assetConfig.supportChain.BSC) targetChains.push('BSC');
    if (assetConfig.supportChain.TRON) targetChains.push('TRON');

    if (targetChains.length > 0) {
      tokens.push({
        asset: assetType,
        targetChains,
      });
    }
  }

  return tokens;
}

/** Burn form component */
export function BurnForm({ onSuccess, className }: BurnFormProps) {
  const { t } = useTranslation('staking');

  // Form state
  const [sourceChain, setSourceChain] = useState<InternalChain>('BFMeta');
  const [sourceAsset, setSourceAsset] = useState<string>('');
  const [targetChain, setTargetChain] = useState<ExternalChain | ''>('');
  const [amount, setAmount] = useState<string>('');

  // UI state
  const [chainSheetOpen, setChainSheetOpen] = useState(false);
  const [tokenSheetOpen, setTokenSheetOpen] = useState(false);
  const [targetChainSheetOpen, setTargetChainSheetOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Data
  const [config, setConfig] = useState<RechargeConfig | null>(null);

  // Load recharge config
  useEffect(() => {
    let mounted = true;
    stakingService.getRechargeConfig().then((data: RechargeConfig) => {
      if (mounted) {
        setConfig(data);
        setIsLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Available tokens for selected source chain
  const availableTokens = useMemo(() => getAvailableTokens(config, sourceChain), [config, sourceChain]);

  // Currently selected token's target chains
  const selectedTokenTargets = useMemo(() => {
    if (!sourceAsset) return [];
    const token = availableTokens.find((t) => t.asset === sourceAsset);
    return token?.targetChains ?? [];
  }, [availableTokens, sourceAsset]);

  // Set default token when chain changes
  useEffect(() => {
    const firstToken = availableTokens[0];
    if (firstToken && !sourceAsset) {
      setSourceAsset(firstToken.asset);
      const firstTarget = firstToken.targetChains[0];
      if (firstTarget) {
        setTargetChain(firstTarget);
      }
    }
  }, [availableTokens, sourceAsset]);

  // Reset selections when source chain changes
  const handleSourceChainChange = useCallback((chain: InternalChain) => {
    setSourceChain(chain);
    setSourceAsset('');
    setTargetChain('');
    setAmount('');
    setChainSheetOpen(false);
  }, []);

  // Handle token selection
  const handleTokenSelect = useCallback((token: TokenWithTargets) => {
    setSourceAsset(token.asset);
    const firstTarget = token.targetChains[0];
    if (firstTarget) {
      setTargetChain(firstTarget);
    }
    setTokenSheetOpen(false);
  }, []);

  // Handle target chain selection
  const handleTargetChainSelect = useCallback((chain: ExternalChain) => {
    setTargetChain(chain);
    setTargetChainSheetOpen(false);
  }, []);

  // Get balance for current selection
  const balance = useMemo(() => {
    return MOCK_BALANCES[sourceChain]?.[sourceAsset] ?? '0.00';
  }, [sourceChain, sourceAsset]);

  // Handle max button
  const handleMax = useCallback(() => {
    setAmount(balance.replace(/,/g, ''));
  }, [balance]);

  // Validation
  const validationError = useMemo(() => {
    if (!amount) return null;
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return t('invalidAmount');
    }
    const numBalance = parseFloat(balance.replace(/,/g, ''));
    if (numAmount > numBalance) {
      return t('insufficientBalance');
    }
    return null;
  }, [amount, balance, t]);

  // Can submit
  const canSubmit = useMemo(() => {
    return sourceChain && sourceAsset && targetChain && amount && !validationError && !isSubmitting;
  }, [sourceChain, sourceAsset, targetChain, amount, validationError, isSubmitting]);

  // Handle submit
  const handleSubmit = useCallback(async () => {
    if (!canSubmit || !targetChain) return;

    setIsSubmitting(true);
    try {
      const cleanAmount = amount.replace(/,/g, '');
      const request: BurnRequest = {
        sourceChain,
        sourceAsset,
        amount: Amount.fromFormatted(cleanAmount, 8, sourceAsset),
        targetChain: targetChain as ExternalChain,
        targetAsset: sourceAsset, // Same asset type for 1:1 burn
      };
      const tx = await stakingService.submitBurn(request);
      onSuccess?.(tx.id);
    } finally {
      setIsSubmitting(false);
    }
  }, [canSubmit, sourceChain, sourceAsset, amount, targetChain, onSuccess]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <LoadingSpinner size="lg" />
        <p className="text-muted-foreground mt-2 text-sm">{t('loading')}</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Source Chain/Token Selector (Internal) */}
      <div className="bg-muted/50 rounded-xl p-4">
        <div className="text-muted-foreground mb-2 text-xs">{t('sourceChain')}</div>

        {/* Chain selector */}
        <button
          type="button"
          onClick={() => setChainSheetOpen(true)}
          className="bg-background mb-3 flex w-full items-center justify-between rounded-lg px-3 py-2"
        >
          <div className="flex items-center gap-2">
            <div className="bg-primary/20 text-primary flex size-6 items-center justify-center rounded-full text-xs font-bold">
              {sourceChain.charAt(0)}
            </div>
            <span className="font-medium">{CHAIN_NAMES[sourceChain]}</span>
          </div>
          <ChevronRight className="text-muted-foreground size-4" />
        </button>

        {/* Token selector + amount input */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setTokenSheetOpen(true)}
            className="bg-background flex shrink-0 items-center gap-2 rounded-lg px-3 py-2"
          >
            <TokenIcon symbol={sourceAsset || '?'} size="sm" />
            <span className="font-medium">{sourceAsset || t('selectToken')}</span>
            <ChevronRight className="text-muted-foreground size-4" />
          </button>

          <div className="flex-1">
            <Input
              type="text"
              inputMode="decimal"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="border-0 bg-transparent text-right text-lg font-semibold"
            />
          </div>
        </div>

        {/* Balance + Max */}
        <div className="mt-2 flex items-center justify-between text-xs">
          <span className="text-muted-foreground">
            {t('availableBalance')}: {balance}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-primary h-auto px-2 py-1 text-xs"
            onClick={handleMax}
          >
            {t('max')}
          </Button>
        </div>

        {/* Validation error */}
        {validationError && <div className="text-destructive mt-2 text-xs">{validationError}</div>}
      </div>

      {/* Arrow */}
      <div className="flex justify-center">
        <div className="bg-muted rounded-full p-2">
          <ArrowDown className="text-muted-foreground size-4" />
        </div>
      </div>

      {/* Target Chain Selector (External) */}
      <div className="bg-muted/50 rounded-xl p-4">
        <div className="text-muted-foreground mb-2 text-xs">{t('targetChain')}</div>

        <button
          type="button"
          onClick={() => setTargetChainSheetOpen(true)}
          disabled={selectedTokenTargets.length === 0}
          className="bg-background flex w-full items-center justify-between rounded-lg px-3 py-2"
        >
          <div className="flex items-center gap-2">
            <div className="bg-muted flex size-6 items-center justify-center rounded-full text-xs font-bold">
              {targetChain ? targetChain.charAt(0) : '?'}
            </div>
            <span className="font-medium">{targetChain ? CHAIN_NAMES[targetChain] : t('selectChain')}</span>
          </div>
          <div className="flex items-center gap-2">
            <TokenIcon symbol={sourceAsset || '?'} size="sm" />
            <span className="font-medium">{sourceAsset || '-'}</span>
            <ChevronRight className="text-muted-foreground size-4" />
          </div>
        </button>

        {/* Receive amount (1:1 ratio) */}
        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{t('amount')}</span>
          <span className="font-semibold">
            {amount || '0.00'} {sourceAsset}
          </span>
        </div>
      </div>

      {/* Submit Button */}
      <Button type="button" size="lg" className="w-full" disabled={!canSubmit} onClick={handleSubmit}>
        {isSubmitting ? (
          <>
            <LoadingSpinner size="sm" />
            <span className="ml-2">{t('confirm')}</span>
          </>
        ) : (
          t('confirm')
        )}
      </Button>

      {/* Source Chain Selection Sheet (Internal) */}
      <Sheet open={chainSheetOpen} onOpenChange={setChainSheetOpen}>
        <SheetContent side="bottom" className="h-[50vh]">
          <SheetHeader>
            <SheetTitle>{t('selectChain')}</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-2">
            {SOURCE_CHAINS.map((chain) => (
              <button
                key={chain}
                onClick={() => handleSourceChainChange(chain)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-4 py-3 transition-colors',
                  sourceChain === chain ? 'bg-primary/10 text-primary' : 'hover:bg-muted',
                )}
              >
                <div className="bg-primary/20 text-primary flex size-8 items-center justify-center rounded-full text-sm font-bold">
                  {chain.charAt(0)}
                </div>
                <span className="font-medium">{CHAIN_NAMES[chain]}</span>
                {sourceChain === chain && <span className="text-primary ml-auto">✓</span>}
              </button>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      {/* Token Selection Sheet */}
      <Sheet open={tokenSheetOpen} onOpenChange={setTokenSheetOpen}>
        <SheetContent side="bottom" className="h-[60vh]">
          <SheetHeader>
            <SheetTitle>{t('selectToken')}</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-2">
            {availableTokens.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center">{t('noResults')}</p>
            ) : (
              availableTokens.map((token) => (
                <button
                  key={token.asset}
                  onClick={() => handleTokenSelect(token)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-4 py-3 transition-colors',
                    sourceAsset === token.asset ? 'bg-primary/10 text-primary' : 'hover:bg-muted',
                  )}
                >
                  <TokenIcon symbol={token.asset} size="md" />
                  <div className="flex-1 text-left">
                    <div className="font-medium">{token.asset}</div>
                    <div className="text-muted-foreground text-xs">→ {token.targetChains.join(', ')}</div>
                  </div>
                  <div className="text-muted-foreground text-right text-sm">
                    {MOCK_BALANCES[sourceChain]?.[token.asset] ?? '0.00'}
                  </div>
                  {sourceAsset === token.asset && <span className="text-primary">✓</span>}
                </button>
              ))
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Target Chain Selection Sheet (External) */}
      <Sheet open={targetChainSheetOpen} onOpenChange={setTargetChainSheetOpen}>
        <SheetContent side="bottom" className="h-[50vh]">
          <SheetHeader>
            <SheetTitle>{t('selectChain')}</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-2">
            {selectedTokenTargets.map((chain) => (
              <button
                key={chain}
                onClick={() => handleTargetChainSelect(chain)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-4 py-3 transition-colors',
                  targetChain === chain ? 'bg-primary/10 text-primary' : 'hover:bg-muted',
                )}
              >
                <div className="bg-muted flex size-8 items-center justify-center rounded-full text-sm font-bold">
                  {chain.charAt(0)}
                </div>
                <span className="font-medium">{CHAIN_NAMES[chain]}</span>
                {targetChain === chain && <span className="text-primary ml-auto">✓</span>}
              </button>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
