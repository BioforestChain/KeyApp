/**
 * BioForest chain-specific burn (destroy asset) logic
 *
 * 已完全迁移到 ChainProvider，不再直接依赖 bioforest-sdk // i18n-ignore
 */

import type { ChainConfig } from '@/services/chain-config';
import { Amount } from '@/types/amount';
import { walletStorageService, WalletStorageError, WalletStorageErrorCode } from '@/services/wallet-storage';
import { getChainProvider } from '@/services/chain-adapter/providers';
import { pendingTxService } from '@/services/transaction';
import i18n from '@/i18n';

const t = i18n.t.bind(i18n);

export interface BioforestBurnFeeResult {
  amount: Amount;
  symbol: string;
}

/**
 * Fetch the asset's applyAddress (issuer address) for destroy transaction
 */
export async function fetchAssetApplyAddress(
  chainConfig: ChainConfig,
  assetType: string,
  fromAddress: string,
): Promise<string | null> {
  const provider = getChainProvider(chainConfig.id);

  if (!provider.bioGetAssetDetail) {
    return null;
  }

  const detail = await provider.bioGetAssetDetail(assetType, fromAddress);
  return detail?.applyAddress ?? null;
}

/**
 * Fetch minimum fee for destroy transaction
 */
export async function fetchBioforestBurnFee(
  chainConfig: ChainConfig,
  assetType: string,
  amount: string,
): Promise<BioforestBurnFeeResult> {
  const provider = getChainProvider(chainConfig.id);

  if (!provider.buildTransaction || !provider.estimateFee) {
    // Fallback fee
    return {
      amount: Amount.fromRaw('1000', chainConfig.decimals, chainConfig.symbol),
      symbol: chainConfig.symbol,
    };
  }

  try {
    // 使用伪地址构建交易估算费用
    const unsignedTx = await provider.buildTransaction({
      type: 'destroy',
      from: '0x0000000000000000000000000000000000000000',
      recipientId: '0x0000000000000000000000000000000000000000',
      bioAssetType: assetType,
      amount: Amount.fromRaw(amount, chainConfig.decimals, chainConfig.symbol),
    });
    const feeEstimate = await provider.estimateFee(unsignedTx);

    return {
      amount: feeEstimate.standard.amount,
      symbol: chainConfig.symbol,
    };
  } catch {
    return {
      amount: Amount.fromRaw('1000', chainConfig.decimals, chainConfig.symbol),
      symbol: chainConfig.symbol,
    };
  }
}

export type SubmitBioforestBurnResult =
  | { status: 'ok'; txHash: string; pendingTxId: string }
  | { status: 'password' }
  | { status: 'password_required'; secondPublicKey: string }
  | { status: 'error'; message: string; pendingTxId?: string };

export interface SubmitBioforestBurnParams {
  chainConfig: ChainConfig;
  walletId: string;
  password: string;
  fromAddress: string;
  recipientAddress: string;
  assetType: string;
  amount: Amount;
  fee?: Amount;
  twoStepSecret?: string;
}

/**
 * Submit a destroy asset transaction
 */
export async function submitBioforestBurn({
  chainConfig,
  walletId,
  password,
  fromAddress,
  recipientAddress,
  assetType,
  amount,
  fee: _fee,
  twoStepSecret,
}: SubmitBioforestBurnParams): Promise<SubmitBioforestBurnResult> {
  // Get mnemonic from wallet storage
  let secret: string;
  try {
    secret = await walletStorageService.getMnemonic(walletId, password);
  } catch (error) {
    if (error instanceof WalletStorageError && error.code === WalletStorageErrorCode.DECRYPTION_FAILED) {
      return { status: 'password' };
    }
    return {
      status: 'error',
      message: error instanceof Error ? error.message : t('error:unknown'),
    };
  }

  if (!amount.isPositive()) {
    return { status: 'error', message: t('error:validation.enterValidAmount') };
  }

  const provider = getChainProvider(chainConfig.id);

  // 检查 provider 是否支持完整交易流程 // i18n-ignore
  if (!provider.supportsFullTransaction) {
    return { status: 'error', message: t('error:transaction.chainNotSupported') };
  }

  try {
    // Check if pay password is required but not provided
    let secondPublicKey: string | null = null;
    if (provider.bioGetAccountInfo) {
      const accountInfo = await provider.bioGetAccountInfo(fromAddress);
      secondPublicKey = accountInfo.secondPublicKey;

      if (secondPublicKey && !twoStepSecret) {
        return {
          status: 'password_required',
          secondPublicKey,
        };
      }

      // Verify pay password if provided
      if (twoStepSecret && secondPublicKey && provider.bioVerifyPayPassword) {
        const isValid = await provider.bioVerifyPayPassword({
          mainSecret: secret,
          paySecret: twoStepSecret,
          publicKey: secondPublicKey,
        });

        if (!isValid) {
          return { status: 'error', message: t('error:transaction.securityPasswordFailed') };
        }
      }
    }

    // Build unsigned transaction using ChainProvider
    const unsignedTx = await provider.buildTransaction!({
      type: 'destroy',
      from: fromAddress,
      recipientId: recipientAddress,
      amount,
      bioAssetType: assetType,
    });

    // Sign transaction
    const signedTx = await provider.signTransaction!(unsignedTx, {
      privateKey: new TextEncoder().encode(secret),
      bioSecret: secret,
      bioPaySecret: twoStepSecret,
    });

    // 存储到 pendingTxService（使用 ChainProvider 标准格式）
    const pendingTx = await pendingTxService.create({
      walletId,
      chainId: chainConfig.id,
      fromAddress,
      rawTx: signedTx,
      meta: {
        type: 'destroy',
        displayAmount: amount.toFormatted(),
        displaySymbol: assetType,
        displayToAddress: recipientAddress,
      },
    });

    // Broadcast transaction
    await pendingTxService.updateStatus({ id: pendingTx.id, status: 'broadcasting' });

    try {
      const broadcastTxHash = await provider.broadcastTransaction!(signedTx);

      await pendingTxService.updateStatus({
        id: pendingTx.id,
        status: 'broadcasted',
        txHash: broadcastTxHash,
      });
      return { status: 'ok', txHash: broadcastTxHash, pendingTxId: pendingTx.id };
    } catch (err) {
      const error = err as Error;
      await pendingTxService.updateStatus({
        id: pendingTx.id,
        status: 'failed',
        errorCode: 'BROADCAST_FAILED',
        errorMessage: error.message,
      });
      return { status: 'error', message: error.message, pendingTxId: pendingTx.id };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    return {
      status: 'error',
      message: errorMessage || t('error:transaction.burnFailed'),
    };
  }
}
