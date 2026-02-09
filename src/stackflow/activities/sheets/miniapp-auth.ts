import { getChainProvider } from '@/services/chain-adapter/providers';
import { ChainErrorCodes, ChainServiceError } from '@/services/chain-adapter/types';
import { WalletStorageError, WalletStorageErrorCode } from '@/services/wallet-storage/types';

const PAY_SECRET_ERROR_PATTERN = /pay password|pay secret|second secret|security password/i;

export function isMiniappWalletLockError(error: unknown): boolean {
  if (error instanceof WalletStorageError) {
    return (
      error.code === WalletStorageErrorCode.DECRYPTION_FAILED || error.code === WalletStorageErrorCode.INVALID_PASSWORD
    );
  }

  if (error instanceof Error) {
    return /wrong password|decrypt mnemonic|invalid walletlock|wallet lock/i.test(error.message);
  }

  return false;
}

export function isMiniappTwoStepSecretError(error: unknown): boolean {
  if (error instanceof ChainServiceError) {
    if (error.code === ChainErrorCodes.SIGNATURE_FAILED && PAY_SECRET_ERROR_PATTERN.test(error.message)) {
      return true;
    }

  }

  if (error instanceof Error) {
    return PAY_SECRET_ERROR_PATTERN.test(error.message);
  }

  return false;
}

export async function resolveMiniappTwoStepSecretRequired(chainId: string, address: string): Promise<boolean> {
  const provider = getChainProvider(chainId);
  if (!provider.bioGetAccountInfo) {
    return false;
  }

  try {
    const accountInfo = await provider.bioGetAccountInfo(address);
    return Boolean(accountInfo.secondPublicKey);
  } catch {
    return false;
  }
}

