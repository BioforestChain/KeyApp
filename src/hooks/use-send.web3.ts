/**
 * Web3 Transfer Implementation
 *
 * Handles transfers for EVM, Tron, and Bitcoin chains using ChainProvider.
 */

import type { AssetInfo } from '@/types/asset';
import type { ChainConfig } from '@/services/chain-config';
import { Amount } from '@/types/amount';
import { walletStorageService, WalletStorageError, WalletStorageErrorCode } from '@/services/wallet-storage';
import { getChainProvider } from '@/services/chain-adapter/providers';
import { mnemonicToSeedSync } from '@scure/bip39';
import i18n from '@/i18n';

const t = i18n.t.bind(i18n);

export interface Web3FeeResult {
  amount: Amount;
  symbol: string;
}

export async function fetchWeb3Fee(chainConfig: ChainConfig, fromAddress: string): Promise<Web3FeeResult> {
  const chainProvider = getChainProvider(chainConfig.id);

  if (!chainProvider.supportsFeeEstimate || !chainProvider.supportsBuildTransaction) {
    throw new Error(`Chain ${chainConfig.id} does not support fee estimation`);
  }

  // 新流程：先构建交易，再估算手续费
  const unsignedTx = await chainProvider.buildTransaction!({
    type: 'transfer',
    from: fromAddress,
    to: fromAddress,
    amount: Amount.fromRaw('1', chainConfig.decimals, chainConfig.symbol),
  });

  const feeEstimate = await chainProvider.estimateFee!(unsignedTx);

  return {
    amount: feeEstimate.standard.amount,
    symbol: chainConfig.symbol,
  };
}

export async function fetchWeb3Balance(chainConfig: ChainConfig, fromAddress: string): Promise<AssetInfo> {
  const chainProvider = getChainProvider(chainConfig.id);
  const balance = await chainProvider.nativeBalance.fetch({ address: fromAddress });

  return {
    assetType: balance.symbol,
    name: chainConfig.name,
    amount: balance.amount,
    decimals: balance.amount.decimals,
  };
}

export type SubmitWeb3Result =
  | { status: 'ok'; txHash: string }
  | { status: 'password' }
  | { status: 'error'; message: string };

export interface SubmitWeb3Params {
  chainConfig: ChainConfig;
  walletId: string;
  password: string;
  fromAddress: string;
  toAddress: string;
  amount: Amount;
}

export async function submitWeb3Transfer({
  chainConfig,
  walletId,
  password,
  fromAddress,
  toAddress,
  amount,
}: SubmitWeb3Params): Promise<SubmitWeb3Result> {
  // Get mnemonic from wallet storage
  let mnemonic: string;
  try {
    mnemonic = await walletStorageService.getMnemonic(walletId, password);
  } catch (error) {
    if (error instanceof WalletStorageError && error.code === WalletStorageErrorCode.DECRYPTION_FAILED) {
      return { status: 'password' };
    }
    return {
      status: 'error',
      message: error instanceof Error ? error.message : t('error:transaction.unknownError'),
    };
  }

  if (!amount.isPositive()) {
    return { status: 'error', message: t('error:validation.enterValidAmount') };
  }

  try {
    const chainProvider = getChainProvider(chainConfig.id);

    if (!chainProvider.supportsFullTransaction) {
      return { status: 'error', message: t('error:transaction.chainNotSupported', { chainId: chainConfig.id }) };
    }

    // Derive private key from mnemonic
    const seed = mnemonicToSeedSync(mnemonic);

    // Build unsigned transaction
    const unsignedTx = await chainProvider.buildTransaction!({
      type: 'transfer',
      from: fromAddress,
      to: toAddress,
      amount,
    });

    // Sign transaction
    const signedTx = await chainProvider.signTransaction!(unsignedTx, { privateKey: seed });

    // Broadcast transaction
    const txHash = await chainProvider.broadcastTransaction!(signedTx);

    return { status: 'ok', txHash };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    // Handle specific error cases
    if (errorMessage.includes('insufficient') || errorMessage.includes('balance')) {
      return { status: 'error', message: t('error:insufficientFunds') };
    }

    if (errorMessage.includes('fee') || errorMessage.includes('gas')) {
      return { status: 'error', message: t('error:transaction.insufficientGas') };
    }

    if (errorMessage.includes('not yet implemented') || errorMessage.includes('not supported')) {
      return { status: 'error', message: t('error:chain.transferNotImplemented') };
    }

    return {
      status: 'error',
      message: errorMessage || t('error:transaction.failed'),
    };
  }
}

/**
 * Validate address for Web3 chains
 */
export function validateWeb3Address(chainConfig: ChainConfig, address: string): string | null {
  const chainProvider = getChainProvider(chainConfig.id);

  if (!chainProvider.supportsAddressValidation) {
    return t('error:validation.unsupportedChainType');
  }

  if (!address || address.trim() === '') {
    return t('error:validation.enterRecipientAddress');
  }

  if (!chainProvider.isValidAddress!(address)) {
    return t('error:validation.invalidAddressFormat');
  }

  if (!address || address.trim() === '') {
    return t('error:validation.enterReceiverAddress');
  }

  if (!chainProvider.isValidAddress!(address)) {
    return t('error:validation.invalidAddress');
  }

  return null;
}
