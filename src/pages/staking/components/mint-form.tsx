/**
 * Mint Form - Stake external tokens to mint internal tokens
 */

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { IconArrowDown as ArrowDown, IconChevronRight as ChevronRight } from '@tabler/icons-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { TokenIcon } from '@/components/token/token-icon';
import { LoadingSpinner } from '@/components/common/loading-spinner';
import { stakingService } from '@/services/staking';
import { Amount } from '@/types/amount';
import type { ExternalChain, InternalChain, RechargeConfig, MintRequest } from '@/types/staking';
import { cn } from '@/lib/utils';

interface MintFormProps {
  onSuccess?: (txId: string) => void;
  className?: string;
}

/** Available source chain options */
const SOURCE_CHAINS: ExternalChain[] = ['ETH', 'BSC', 'TRON'];

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

/** Mock balances for validation */
const MOCK_BALANCES: Record<string, Record<string, string>> = {
  ETH: { BFM: '1000.00', USDT: '5000.00' },
  BSC: { BFM: '2500.00', USDT: '10000.00', BFC: '500.00' },
  TRON: { USDT: '8000.00' },
};

/** Get available tokens for a source chain from recharge config */
function getAvailableTokens(
  config: RechargeConfig | null,
  sourceChain: ExternalChain,
): { asset: string; targetChain: string; targetAsset: string }[] {
  if (!config) return [];

  const tokens: { asset: string; targetChain: string; targetAsset: string }[] = [];

  // Iterate through internal chains
  for (const [internalChain, assets] of Object.entries(config)) {
    for (const [assetType, assetConfig] of Object.entries(assets)) {
      // Check if this token supports the selected external chain
      const chainConfig = assetConfig.supportChain[sourceChain];
      if (chainConfig) {
        tokens.push({
          asset: chainConfig.assetType,
          targetChain: internalChain,
          targetAsset: assetType,
        });
      }
    }
  }

  return tokens;
}

/** Mint form component */
export function MintForm({ onSuccess, className }: MintFormProps) {
  const { t } = useTranslation('staking');

  // Form state
  const [sourceChain, setSourceChain] = useState<ExternalChain>('BSC');
  const [sourceAsset, setSourceAsset] = useState<string>('');
  const [targetChain, setTargetChain] = useState<string>('');
  const [targetAsset, setTargetAsset] = useState<string>('');
  const [amount, setAmount] = useState<string>('');

  // UI state
  const [chainSheetOpen, setChainSheetOpen] = useState(false);
  const [tokenSheetOpen, setTokenSheetOpen] = useState(false);
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

  // Set default token when chain changes
  useEffect(() => {
    const firstToken = availableTokens[0];
    if (firstToken && !sourceAsset) {
      setSourceAsset(firstToken.asset);
      setTargetChain(firstToken.targetChain);
      setTargetAsset(firstToken.targetAsset);
    }
  }, [availableTokens, sourceAsset]);

  // Reset token selection when source chain changes
  const handleSourceChainChange = useCallback((chain: ExternalChain) => {
    setSourceChain(chain);
    setSourceAsset('');
    setTargetChain('');
    setTargetAsset('');
    setAmount('');
    setChainSheetOpen(false);
  }, []);

  // Handle token selection
  const handleTokenSelect = useCallback((token: { asset: string; targetChain: string; targetAsset: string }) => {
    setSourceAsset(token.asset);
    setTargetChain(token.targetChain);
    setTargetAsset(token.targetAsset);
    setTokenSheetOpen(false);
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
    return sourceChain && sourceAsset && targetChain && targetAsset && amount && !validationError && !isSubmitting;
  }, [sourceChain, sourceAsset, targetChain, targetAsset, amount, validationError, isSubmitting]);

  // Handle submit
  const handleSubmit = useCallback(async () => {
    if (!canSubmit) return;

    setIsSubmitting(true);
    try {
      const cleanAmount = amount.replace(/,/g, '');
      const request: MintRequest = {
        sourceChain,
        sourceAsset,
        amount: Amount.fromFormatted(cleanAmount, 18, sourceAsset),
        targetChain: targetChain as InternalChain,
        targetAsset,
      };
      const tx = await stakingService.submitMint(request);
      onSuccess?.(tx.id);
    } finally {
      setIsSubmitting(false);
    }
  }, [canSubmit, sourceChain, sourceAsset, amount, targetChain, targetAsset, onSuccess]);

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
      {/* Source Chain/Token Selector */}
      <div className="bg-muted/50 rounded-xl p-4">
        <div className="text-muted-foreground mb-2 text-xs">{t('sourceChain')}</div>

        {/* Chain selector */}
        <button
          type="button"
          onClick={() => setChainSheetOpen(true)}
          className="bg-background mb-3 flex w-full items-center justify-between rounded-lg px-3 py-2"
        >
          <div className="flex items-center gap-2">
            <div className="bg-muted flex size-6 items-center justify-center rounded-full text-xs font-bold">
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

      {/* Target Chain/Token Display */}
      <div className="bg-muted/50 rounded-xl p-4">
        <div className="text-muted-foreground mb-2 text-xs">{t('targetChain')}</div>

        <div className="bg-background flex items-center justify-between rounded-lg px-3 py-2">
          <div className="flex items-center gap-2">
            <div className="bg-primary/20 text-primary flex size-6 items-center justify-center rounded-full text-xs font-bold">
              {targetChain.charAt(0) || '?'}
            </div>
            <span className="font-medium">{CHAIN_NAMES[targetChain] || t('selectToken')}</span>
          </div>
          <div className="flex items-center gap-2">
            <TokenIcon symbol={targetAsset || '?'} size="sm" />
            <span className="font-medium">{targetAsset || '-'}</span>
          </div>
        </div>

        {/* Receive amount (1:1 ratio) */}
        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{t('amount')}</span>
          <span className="font-semibold">
            {amount || '0.00'} {targetAsset}
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

      {/* Source Chain Selection Sheet */}
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
                <div className="bg-muted flex size-8 items-center justify-center rounded-full text-sm font-bold">
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
                  key={`${token.targetChain}-${token.asset}`}
                  onClick={() => handleTokenSelect(token)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-4 py-3 transition-colors',
                    sourceAsset === token.asset ? 'bg-primary/10 text-primary' : 'hover:bg-muted',
                  )}
                >
                  <TokenIcon symbol={token.asset} size="md" />
                  <div className="flex-1 text-left">
                    <div className="font-medium">{token.asset}</div>
                    <div className="text-muted-foreground text-xs">
                      → {CHAIN_NAMES[token.targetChain]} ({token.targetAsset})
                    </div>
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
    </div>
  );
}
