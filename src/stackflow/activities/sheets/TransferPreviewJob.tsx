/**
 * 转账预览确认组件
 * 
 * 显示完整的交易详情预览，替代简单的 TransferConfirmJob
 * 流程: Send页面(填写) → TransferPreviewJob(交易详情预览) → TransferWalletLockJob(签名+广播+状态)
 */
import { useState, useCallback, useRef, useEffect } from 'react';
import type { ActivityComponentType } from '@stackflow/react';
import { BottomSheet, SheetContent } from '@/components/layout/bottom-sheet';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { FeeDisplay } from '@/components/transaction/fee-display';
import { AddressDisplay } from '@/components/wallet/address-display';
import { ChainIcon } from '@/components/wallet/chain-icon';
import { AmountDisplay } from '@/components/common';
import type { ChainType } from '@/stores';
import {
  IconArrowUp as ArrowUp,
  IconArrowDown as ArrowDown,
} from '@tabler/icons-react';
import { useFlow } from '../../stackflow';
import { ActivityParamsProvider, useActivityParams } from '../../hooks';
import { setFeeEditCallback } from './FeeEditJob';

interface TransferPreviewConfig {
  onConfirm: () => Promise<void>;
  minFee?: string | undefined;
  onFeeChange?: ((newFee: string) => void) | undefined;
}

let pendingConfig: TransferPreviewConfig | null = null;

export function setTransferPreviewCallback(
  onConfirm: () => Promise<void>,
  options?: { minFee?: string; onFeeChange?: (newFee: string) => void }
) {
  pendingConfig = {
    onConfirm,
    minFee: options?.minFee,
    onFeeChange: options?.onFeeChange,
  };
}

function clearTransferPreviewCallback() {
  pendingConfig = null;
}

type TransferPreviewJobParams = {
  /** 转账金额 */
  amount: string;
  /** 资产符号 */
  symbol: string;
  /** 资产小数位 */
  decimals?: string;
  /** 法币价值 */
  fiatValue?: string;
  /** 发送地址 */
  fromAddress: string;
  /** 接收地址 */
  toAddress: string;
  /** 手续费金额 */
  feeAmount: string;
  /** 手续费符号 */
  feeSymbol: string;
  /** 手续费法币价值 */
  feeFiatValue?: string;
  /** 手续费加载中 */
  feeLoading?: string;
  /** 链ID */
  chainId: string;
  /** 链名称 */
  chainName?: string;
};

function TransferPreviewJobContent() {
  const { t } = useTranslation(['transaction', 'common']);
  const { pop, push } = useFlow();
  const params = useActivityParams<TransferPreviewJobParams>();

  const [isConfirming, setIsConfirming] = useState(false);
  const [customFee, setCustomFee] = useState<string | null>(null);

  // 捕获配置
  const configRef = useRef(pendingConfig);
  const initialized = useRef(false);

  if (!initialized.current && pendingConfig) {
    configRef.current = pendingConfig;
    clearTransferPreviewCallback();
    initialized.current = true;
  }

  useEffect(() => {
    return () => {
      clearTransferPreviewCallback();
    };
  }, []);

  const feeLoading = params.feeLoading === 'true';
  const displayFee = customFee ?? params.feeAmount;
  const canEditFee = !!configRef.current?.onFeeChange;
  const decimals = params.decimals ? parseInt(params.decimals, 10) : 8;
  const amountNum = parseFloat(params.amount) || 0;

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

    if (!config?.onConfirm || isConfirming) return;

    setIsConfirming(true);
    try {
      pop();
      await config.onConfirm();
    } finally {
      setIsConfirming(false);
    }
  }, [isConfirming, pop]);

  const handleClose = useCallback(() => {
    pop();
  }, [pop]);

  return (
    <BottomSheet data-testid="transfer-preview-sheet">
      <SheetContent title={t('sendPage.previewTitle', '交易预览')}>
        <div className="space-y-4 p-4">
          {/* 金额头部 */}
          <div className="bg-card flex flex-col items-center gap-3 rounded-xl p-6 shadow-sm">
            <div className="flex size-16 items-center justify-center rounded-full bg-red-500/10">
              <ArrowUp className="size-8 text-red-500" />
            </div>

            <div className="text-center">
              <p className="text-muted-foreground text-sm">{t('type.send')}</p>
              <AmountDisplay
                value={-Math.abs(amountNum)}
                symbol={params.symbol}
                decimals={decimals}
                sign="always"
                color="default"
                weight="normal"
                size="xl"
                className="text-red-500"
              />
              {params.fiatValue && (
                <p className="text-muted-foreground mt-1 text-sm">≈ ${params.fiatValue}</p>
              )}
            </div>
          </div>

          {/* 交易详情 */}
          <div className="bg-card space-y-3 rounded-xl p-4 shadow-sm">
            <h3 className="text-muted-foreground text-sm font-medium">{t('detail.info')}</h3>

            {/* 发送地址 */}
            <div className="flex items-center justify-between py-2">
              <span className="text-muted-foreground text-sm">{t('detail.fromAddress')}</span>
              <AddressDisplay address={params.fromAddress} copyable className="text-sm max-w-[180px]" />
            </div>

            <div className="bg-border h-px" />

            {/* 接收地址 */}
            <div className="flex items-center justify-between py-2">
              <span className="text-muted-foreground text-sm">{t('detail.toAddress')}</span>
              <AddressDisplay address={params.toAddress} copyable className="text-sm max-w-[180px]" />
            </div>

            <div className="bg-border h-px" />

            {/* 网络 */}
            <div className="flex items-center justify-between py-2">
              <span className="text-muted-foreground text-sm">{t('detail.network')}</span>
              <div className="flex items-center gap-2">
                <ChainIcon chain={params.chainId as ChainType} size="sm" />
                <span className="text-sm font-medium">{params.chainName ?? params.chainId}</span>
              </div>
            </div>

            <div className="bg-border h-px" />

            {/* 手续费 */}
            <div className="flex items-start justify-between py-2">
              <span className="text-muted-foreground text-sm">{t('detail.fee')}</span>
              <FeeDisplay
                amount={displayFee}
                symbol={params.feeSymbol}
                isLoading={feeLoading}
                editable={canEditFee}
                onEdit={handleEditFee}
              />
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              data-testid="cancel-preview-button"
              onClick={handleClose}
              className="border-border hover:bg-muted flex-1 rounded-full border py-3 font-medium transition-colors"
              disabled={isConfirming}
            >
              {t('confirmSheet.cancel')}
            </button>
            <button
              type="button"
              data-testid="confirm-preview-button"
              onClick={handleConfirm}
              disabled={isConfirming || feeLoading}
              className={cn(
                'flex-1 rounded-full py-3 font-medium text-primary-foreground transition-colors',
                'bg-primary hover:bg-primary/90',
                'disabled:cursor-not-allowed disabled:opacity-50'
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

export const TransferPreviewJob: ActivityComponentType<TransferPreviewJobParams> = ({ params }) => {
  return (
    <ActivityParamsProvider params={params}>
      <TransferPreviewJobContent />
    </ActivityParamsProvider>
  );
};
