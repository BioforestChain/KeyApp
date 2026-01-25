import type { AssetInfo } from '@/types/asset';
import type { ChainConfig } from '@/services/chain-config';
import { chainConfigService } from '@/services/chain-config';
import { Amount } from '@/types/amount';
import { walletStorageService, WalletStorageError, WalletStorageErrorCode } from '@/services/wallet-storage';
import { getChainProvider } from '@/services/chain-adapter/providers';
import { pendingTxService, getPendingTxWalletKey } from '@/services/transaction';
import { getTransferMinFee } from '@/services/bioforest-sdk';
import i18n from '@/i18n';

const t = i18n.t.bind(i18n);

export interface BioforestFeeResult {
  amount: Amount;
  symbol: string;
}

export async function fetchBioforestFee(chainConfig: ChainConfig, fromAddress: string): Promise<BioforestFeeResult> {
  const provider = getChainProvider(chainConfig.id);
  if (!provider.estimateFee || !provider.buildTransaction) {
    const apiUrl = chainConfigService.getBiowalletApi(chainConfig.id);
    if (!apiUrl) {
      throw new Error(t('error:transaction.feeEstimateFailed'));
    }
    const minFeeRaw = await getTransferMinFee(apiUrl, chainConfig.id, fromAddress, '1');
    return {
      amount: Amount.fromRaw(minFeeRaw, chainConfig.decimals, chainConfig.symbol),
      symbol: chainConfig.symbol,
    };
  }

  // 新流程：先构建交易，再估算手续费
  const unsignedTx = await provider.buildTransaction({
    type: 'transfer',
    from: fromAddress,
    to: fromAddress,
    // SDK requires amount > 0 for fee calculation, use 1 unit as placeholder
    amount: Amount.fromRaw('1', chainConfig.decimals, chainConfig.symbol),
  });

  try {
    const feeEstimate = await provider.estimateFee(unsignedTx);
    return {
      amount: feeEstimate.standard.amount,
      symbol: chainConfig.symbol,
    };
  } catch {
    const apiUrl = chainConfigService.getBiowalletApi(chainConfig.id);
    if (!apiUrl) {
      throw new Error(t('error:transaction.feeEstimateFailed'));
    }
    const minFeeRaw = await getTransferMinFee(apiUrl, chainConfig.id, fromAddress, '1');
    return {
      amount: Amount.fromRaw(minFeeRaw, chainConfig.decimals, chainConfig.symbol),
      symbol: chainConfig.symbol,
    };
  }
}

export async function fetchBioforestBalance(chainConfig: ChainConfig, fromAddress: string): Promise<AssetInfo> {
  const provider = getChainProvider(chainConfig.id);
  const balance = await provider.nativeBalance.fetch({ address: fromAddress });

  return {
    assetType: balance.symbol,
    name: chainConfig.name,
    amount: balance.amount,
    decimals: balance.amount.decimals,
  };
}

export type SubmitBioforestResult =
  | { status: 'ok'; txHash: string; pendingTxId: string }
  | { status: 'password' }
  | { status: 'password_required'; secondPublicKey: string }
  | { status: 'error'; message: string; pendingTxId?: string };

export interface SubmitBioforestParams {
  chainConfig: ChainConfig;
  walletId: string;
  password: string;
  fromAddress: string;
  toAddress: string;
  amount: Amount;
  assetType: string;
  fee?: Amount;
  twoStepSecret?: string;
}

/**
 * Check if address has pay password set
 */
export async function checkTwoStepSecretRequired(
  chainConfig: ChainConfig,
  address: string,
): Promise<{ required: boolean; secondPublicKey?: string }> {
  const provider = getChainProvider(chainConfig.id);
  if (!provider.bioGetAccountInfo) {
    return { required: false };
  }

  try {
    const info = await provider.bioGetAccountInfo(address);
    if (info.secondPublicKey) {
      return { required: true, secondPublicKey: info.secondPublicKey };
    }
  } catch {
    // If we can't check, assume not required
  }

  return { required: false };
}

/**
 * Verify pay password for an address
 */
export async function verifyBioforestTwoStepSecret(
  chainConfig: ChainConfig,
  walletId: string,
  password: string,
  twoStepSecret: string,
  secondPublicKey: string,
): Promise<boolean> {
  const provider = getChainProvider(chainConfig.id);
  if (!provider.bioVerifyPayPassword) {
    return false;
  }

  try {
    const mainSecret = await walletStorageService.getMnemonic(walletId, password);
    return await provider.bioVerifyPayPassword({
      mainSecret,
      paySecret: twoStepSecret,
      publicKey: secondPublicKey,
    });
  } catch {
    return false;
  }
}

export async function submitBioforestTransfer({
  chainConfig,
  walletId,
  password,
  fromAddress,
  toAddress,
  amount,
  assetType,
  fee,
  twoStepSecret,
}: SubmitBioforestParams): Promise<SubmitBioforestResult> {
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
      type: 'transfer',
      from: fromAddress,
      to: toAddress,
      amount,
      fee, // Pass fee to avoid re-estimation in signTransaction
      // BioChain 特有字段
      bioAssetType: assetType,
    });

    // Sign transaction
    const signedTx = await provider.signTransaction!(unsignedTx, {
      privateKey: new TextEncoder().encode(secret), // 助记词作为私钥
      bioSecret: secret,
      bioPaySecret: twoStepSecret,
    });

    // 存储到 pendingTxService（使用 ChainProvider 标准格式）
    const pendingTx = await pendingTxService.create({
      walletId: getPendingTxWalletKey(chainConfig.id, fromAddress),
      chainId: chainConfig.id,
      fromAddress,
      rawTx: signedTx,
      meta: {
        type: 'send',
        displayAmount: amount.toFormatted(),
        displaySymbol: assetType,
        displayToAddress: toAddress,
      },
    });

    // 广播交易
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
      message: errorMessage || t('error:transaction.failed'),
    };
  }
}

export type SetTwoStepSecretResult =
  | { status: 'ok'; txHash: string }
  | { status: 'password' }
  | { status: 'already_set' }
  | { status: 'error'; message: string };

export interface SetTwoStepSecretParams {
  chainConfig: ChainConfig;
  walletId: string;
  password: string;
  fromAddress: string;
  newTwoStepSecret: string;
}

/**
 * Set pay password (二次签名) for an account
 */
export async function submitSetTwoStepSecret({
  chainConfig,
  walletId,
  password,
  fromAddress,
  newTwoStepSecret,
}: SetTwoStepSecretParams): Promise<SetTwoStepSecretResult> {
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

  const provider = getChainProvider(chainConfig.id);

  // 检查 provider 是否支持完整交易流程 // i18n-ignore
  if (!provider.supportsFullTransaction) {
    return { status: 'error', message: t('error:transaction.chainNotSupported') };
  }

  try {
    // Check if already has pay password
    if (provider.bioGetAccountInfo) {
      const accountInfo = await provider.bioGetAccountInfo(fromAddress);
      if (accountInfo.secondPublicKey) {
        return { status: 'already_set' };
      }
    }

    // Build and sign setPayPassword transaction using ChainProvider
    const unsignedTx = await provider.buildTransaction!({
      type: 'setPayPassword',
      from: fromAddress,
    });

    const signedTx = await provider.signTransaction!(unsignedTx, {
      privateKey: new TextEncoder().encode(secret),
      bioSecret: secret,
      bioNewPaySecret: newTwoStepSecret,
    });

    // Broadcast transaction
    const txHash = await provider.broadcastTransaction!(signedTx);

    return { status: 'ok', txHash };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (errorMessage.includes('fee') || errorMessage.includes('\u624b\u7eed\u8d39')) {
      // i18n-ignore
      return { status: 'error', message: t('error:insufficientFunds') };
    }

    return {
      status: 'error',
      message: errorMessage || t('error:transaction.failed'),
    };
  }
}

/**
 * Get the minimum fee for setting pay password
 */
export async function getSetTwoStepSecretFee(
  chainConfig: ChainConfig,
): Promise<{ amount: Amount; symbol: string } | null> {
  const provider = getChainProvider(chainConfig.id);

  if (!provider.buildTransaction || !provider.estimateFee) {
    return null;
  }

  try {
    // 使用一个伪地址构建交易估算费用
    const unsignedTx = await provider.buildTransaction({
      type: 'setPayPassword',
      from: '0x0000000000000000000000000000000000000000',
    });
    const feeEstimate = await provider.estimateFee(unsignedTx);

    return {
      amount: feeEstimate.standard.amount,
      symbol: chainConfig.symbol,
    };
  } catch {
    return null;
  }
}

/**
 * Check if address has pay password set
 */
export async function hasTwoStepSecretSet(chainConfig: ChainConfig, address: string): Promise<boolean> {
  const provider = getChainProvider(chainConfig.id);

  if (!provider.bioGetAccountInfo) {
    return false;
  }

  try {
    const info = await provider.bioGetAccountInfo(address);
    return !!info.secondPublicKey;
  } catch {
    return false;
  }
}
