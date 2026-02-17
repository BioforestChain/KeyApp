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
import { ChainErrorCodes, ChainServiceError } from '@/services/chain-adapter/types';
import { deriveKey } from '@/lib/crypto/derivation';
import { hexToBytes } from '@noble/hashes/utils.js';
import i18n from '@/i18n';

const t = i18n.t.bind(i18n);

function collectErrorMessages(error: unknown): string[] {
  const messages: string[] = [];
  const visited = new Set<unknown>();
  let current: unknown = error;

  while (current instanceof Error && !visited.has(current)) {
    visited.add(current);
    if (current.message) {
      messages.push(current.message);
    }
    current = (current as Error & { cause?: unknown }).cause;
  }

  return messages;
}

function isTimeoutMessage(message: string): boolean {
  return /timeout|timed out|etimedout|aborterror|aborted/i.test(message);
}

function isBroadcastFailureMessage(message: string): boolean {
  return /failed to broadcast transaction|broadcast failed|tx_broadcast_failed/i.test(message);
}

function isSelfTransferMessage(message: string): boolean {
  return /cannot transfer(?:\s+\w+)*\s+to yourself|不能转账给自己|不能给自己转账/i.test(message);
}

function isGenericBroadcastFailureMessage(message: string): boolean {
  return /^broadcast failed:?$/i.test(message.trim())
    || /^failed to broadcast transaction:?$/i.test(message.trim());
}

function extractBuildFailureReason(error: unknown): string | null {
  if (error instanceof ChainServiceError && typeof error.details?.reason === 'string') {
    return error.details.reason.trim() || null;
  }

  for (const message of collectErrorMessages(error)) {
    const normalized = message.trim();
    const match = normalized.match(/^(?:failed to create tron transaction|trc20 transaction build failed)\s*:\s*(.+)$/i);
    if (match?.[1]) {
      return match[1].trim();
    }
  }

  return null;
}

function extractBroadcastFailureReason(error: unknown): string | null {
  if (error instanceof ChainServiceError && typeof error.details?.reason === 'string') {
    return error.details.reason.trim() || null;
  }

  for (const message of collectErrorMessages(error)) {
    const normalized = message.trim();
    const match = normalized.match(/^broadcast failed:\s*(.+)$/i);
    if (match?.[1]) {
      return match[1].trim();
    }
    if (isBroadcastFailureMessage(normalized) && !isGenericBroadcastFailureMessage(normalized)) {
      return normalized;
    }
  }

  return null;
}

function hasTimeoutInError(error: unknown): boolean {
  return collectErrorMessages(error).some((message) => isTimeoutMessage(message));
}

function parseHexPrivateKey(secret: string): Uint8Array | null {
  const normalized = secret.trim().replace(/^0x/i, '');
  if (!/^[0-9a-fA-F]{64}$/.test(normalized)) {
    return null;
  }
  try {
    return hexToBytes(normalized);
  } catch {
    return null;
  }
}

function deriveWeb3PrivateKey(secret: string, chainConfig: ChainConfig): Uint8Array {
  const fallbackPrivateKey = parseHexPrivateKey(secret);
  try {
    if (chainConfig.chainKind === 'evm') {
      return hexToBytes(deriveKey(secret, 'ethereum', 0, 0).privateKey);
    }
    if (chainConfig.chainKind === 'tron') {
      return hexToBytes(deriveKey(secret, 'tron', 0, 0).privateKey);
    }
    if (chainConfig.chainKind === 'bitcoin') {
      return hexToBytes(deriveKey(secret, 'bitcoin', 0, 0).privateKey);
    }
  } catch {
    if (fallbackPrivateKey) return fallbackPrivateKey;
    throw new Error(t('error:crypto.keyDerivationFailed'));
  }

  if (fallbackPrivateKey) return fallbackPrivateKey;
  throw new Error(t('error:chain.transferNotImplemented'));
}

export interface Web3FeeResult {
  amount: Amount;
  symbol: string;
}

export interface FetchWeb3FeeParams {
  chainConfig: ChainConfig;
  fromAddress: string;
  toAddress: string;
  amount?: Amount | undefined;
}

export async function fetchWeb3Fee({ chainConfig, fromAddress, toAddress, amount }: FetchWeb3FeeParams): Promise<Web3FeeResult> {
  const chainProvider = getChainProvider(chainConfig.id);

  if (!chainProvider.supportsFeeEstimate || !chainProvider.supportsBuildTransaction) {
    throw new Error(`Chain ${chainConfig.id} does not support fee estimation`);
  }

  const estimateAmount =
    amount && amount.isPositive()
      ? amount
      : Amount.fromRaw('1', chainConfig.decimals, chainConfig.symbol);

  // 新流程：先构建交易，再估算手续费
  const unsignedTx = await chainProvider.buildTransaction!({
    type: 'transfer',
    from: fromAddress,
    to: toAddress,
    amount: estimateAmount,
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
  let secret: string;
  try {
    secret = await walletStorageService.getMnemonic(walletId, password);
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

    const privateKey = deriveWeb3PrivateKey(secret, chainConfig);

    // Build unsigned transaction
    const unsignedTx = await chainProvider.buildTransaction!({
      type: 'transfer',
      from: fromAddress,
      to: toAddress,
      amount,
    });

    // Sign transaction
    const signedTx = await chainProvider.signTransaction!(unsignedTx, { privateKey });

    // Broadcast transaction
    const txHash = await chainProvider.broadcastTransaction!(signedTx);

    return { status: 'ok', txHash };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (error instanceof ChainServiceError) {
      if (error.code === ChainErrorCodes.TX_BUILD_FAILED) {
        const reason = extractBuildFailureReason(error);
        if (reason && isSelfTransferMessage(reason)) {
          return { status: 'error', message: t('error:validation.cannotTransferToSelf') };
        }
        return { status: 'error', message: reason ?? errorMessage };
      }

      if (error.code === ChainErrorCodes.TRANSACTION_TIMEOUT || hasTimeoutInError(error)) {
        return { status: 'error', message: t('transaction:broadcast.timeout') };
      }

      if (error.code === ChainErrorCodes.TX_BROADCAST_FAILED) {
        const reason = extractBroadcastFailureReason(error);
        return {
          status: 'error',
          message: reason ? `${t('transaction:broadcast.failed')}: ${reason}` : t('transaction:broadcast.failed'),
        };
      }
    }

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

    if (isSelfTransferMessage(errorMessage)) {
      return { status: 'error', message: t('error:validation.cannotTransferToSelf') };
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
