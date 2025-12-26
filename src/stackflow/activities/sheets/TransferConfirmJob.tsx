import { useState, useCallback, useRef, useEffect } from 'react';
import type { ActivityComponentType } from '@stackflow/react';
import { BottomSheet, SheetContent } from '@/components/layout/bottom-sheet';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { FeeDisplay } from '@/components/transaction/fee-display';
import { clipboardService } from '@/services/clipboard';
import { IconChevronDown as ChevronDown, IconChevronUp as ChevronUp, IconCopy as Copy, IconCheck as Check } from '@tabler/icons-react';
import { useFlow } from '../../stackflow';
import { ActivityParamsProvider, useActivityParams } from '../../hooks';
import { setFeeEditCallback } from './FeeEditJob';

interface TransferConfirmConfig {
  onConfirm: () => Promise<void>;
  minFee?: string | undefined;
  onFeeChange?: ((newFee: string) => void) | undefined;
}

let pendingConfig: TransferConfirmConfig | null = null;

export function setTransferConfirmCallback(
  onConfirm: () => Promise<void>,
  options?: { minFee?: string; onFeeChange?: (newFee: string) => void }
) {
  pendingConfig = {
    onConfirm,
    minFee: options?.minFee,
    onFeeChange: options?.onFeeChange,
  };
}

function clearTransferConfirmCallback() {
  pendingConfig = null;
}

type TransferConfirmJobParams = {
  amount: string;
  symbol: string;
  fiatValue?: string;
  toAddress: string;
  feeAmount: string;
  feeSymbol: string;
  feeFiatValue?: string;
  feeLoading?: string;
};

function truncateAddress(address: string): string {
  if (address.length <= 16) return address;
  return `${address.slice(0, 10)}...${address.slice(-6)}`;
}

function TransferConfirmJobContent() {
  const { t } = useTranslation('transaction');
  const { pop, push } = useFlow();
  const params = useActivityParams<TransferConfirmJobParams>();

  const [showFullAddress, setShowFullAddress] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [customFee, setCustomFee] = useState<string | null>(null);

  // 捕获配置
  const configRef = useRef(pendingConfig);
  const initialized = useRef(false);
  
  if (!initialized.current && pendingConfig) {
    configRef.current = pendingConfig;
    clearTransferConfirmCallback();
    initialized.current = true;
  }

  useEffect(() => {
    return () => {
      clearTransferConfirmCallback();
    };
  }, []);

  const feeLoading = params.feeLoading === 'true';
  const feeFiatValue = params.feeFiatValue ? parseFloat(params.feeFiatValue) : undefined;
  const displayFee = customFee ?? params.feeAmount;
  const canEditFee = !!configRef.current?.onFeeChange;

  const handleCopyAddress = useCallback(async () => {
    try {
      await clipboardService.write({ text: params.toAddress });
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.error('Failed to copy address');
    }
  }, [params.toAddress]);

  const toggleAddress = useCallback(() => {
    setShowFullAddress((prev) => !prev);
  }, []);

  const handleEditFee = useCallback(() => {
    const config = configRef.current;
    if (!config?.onFeeChange) return;
    
    setFeeEditCallback(
      {
        currentFee: displayFee,
        minFee: config.minFee ?? params.feeAmount,
        symbol: params.feeSymbol,
      },
      (result) => {
        setCustomFee(result.fee);
        config.onFeeChange?.(result.fee);
      }
    );
    push('FeeEditJob', {});
  }, [displayFee, params.feeAmount, params.feeSymbol, push]);

  const handleConfirm = useCallback(async () => {
    const config = configRef.current;
    console.log('[TransferConfirmJob] handleConfirm called, hasCallback:', !!config?.onConfirm);
    if (!config?.onConfirm || isConfirming) return;

    setIsConfirming(true);
    try {
      pop();
      console.log('[TransferConfirmJob] Executing callback...');
      await config.onConfirm();
      console.log('[TransferConfirmJob] Callback executed');
    } finally {
      setIsConfirming(false);
    }
  }, [isConfirming, pop]);

  const handleClose = useCallback(() => {
    pop();
  }, [pop]);

  return (
    <BottomSheet data-testid="transfer-confirm-sheet">
      <SheetContent title={t('confirmSheet.title')}>
        <div className="space-y-6 p-4">
          {/* Amount */}
          <div className="text-center">
            <p className="text-3xl font-bold">
              {params.amount} {params.symbol}
            </p>
            {params.fiatValue && <p className="text-muted-foreground mt-1">≈ ${params.fiatValue}</p>}
          </div>

          {/* Details */}
          <div className="bg-muted/30 space-y-4 rounded-xl p-4">
            {/* Recipient */}
            <div className="space-y-1">
              <p className="text-muted-foreground text-sm">{t('confirmSheet.toAddress')}</p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleAddress}
                  className="hover:text-primary flex min-w-0 flex-1 items-center gap-1 text-left font-mono text-sm"
                >
                  <span className={cn('min-w-0', showFullAddress ? 'break-all' : 'truncate')}>
                    {showFullAddress ? params.toAddress : truncateAddress(params.toAddress)}
                  </span>
                  {showFullAddress ? (
                    <ChevronUp className="size-4 shrink-0" />
                  ) : (
                    <ChevronDown className="size-4 shrink-0" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleCopyAddress}
                  className="text-muted-foreground hover:text-foreground shrink-0 p-1"
                  aria-label={copied ? t('confirmSheet.copied') : t('confirmSheet.copyAddress')}
                >
                  {copied ? <Check className="size-4 text-green-500" /> : <Copy className="size-4" />}
                </button>
              </div>
            </div>

            {/* Fee */}
            <div className="flex items-start justify-between">
              <p className="text-muted-foreground text-sm">{t('confirmSheet.networkFee')}</p>
              <FeeDisplay
                amount={displayFee}
                symbol={params.feeSymbol}
                {...(feeFiatValue !== undefined && { fiatValue: feeFiatValue })}
                isLoading={feeLoading}
                editable={canEditFee}
                onEdit={handleEditFee}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              data-testid="cancel-transfer-button"
              onClick={handleClose}
              className="border-border hover:bg-muted flex-1 rounded-full border py-3 font-medium transition-colors"
              disabled={isConfirming}
            >
              {t('confirmSheet.cancel')}
            </button>
            <button
              type="button"
              data-testid="confirm-transfer-button"
              onClick={handleConfirm}
              disabled={isConfirming || feeLoading}
              className={cn(
                'flex-1 rounded-full py-3 font-medium text-primary-foreground transition-colors',
                'bg-primary hover:bg-primary/90',
                'disabled:cursor-not-allowed disabled:opacity-50',
              )}
            >
              {isConfirming ? t('confirmSheet.confirming') : t('confirmSheet.confirm')}
            </button>
          </div>
        </div>
      </SheetContent>
    </BottomSheet>
  );
}

export const TransferConfirmJob: ActivityComponentType<TransferConfirmJobParams> = ({ params }) => {
  return (
    <ActivityParamsProvider params={params}>
      <TransferConfirmJobContent />
    </ActivityParamsProvider>
  );
};
