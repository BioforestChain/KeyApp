import { describe, expect, it } from 'vitest';
import { ChainErrorCodes, ChainServiceError } from '@/services/chain-adapter/types';
import { WalletStorageError, WalletStorageErrorCode } from '@/services/wallet-storage/types';
import { isMiniappTwoStepSecretError, isMiniappWalletLockError } from '../miniapp-auth';

describe('miniapp-auth', () => {
  it('detects wallet lock errors from wallet storage', () => {
    const error = new WalletStorageError(WalletStorageErrorCode.DECRYPTION_FAILED, 'decrypt failed');
    expect(isMiniappWalletLockError(error)).toBe(true);
  });

  it('detects wallet lock errors from plain error message', () => {
    expect(isMiniappWalletLockError(new Error('invalid wallet lock password'))).toBe(true);
  });

  it('detects two-step secret errors from chain service error', () => {
    const error = new ChainServiceError(ChainErrorCodes.SIGNATURE_FAILED, 'pay password verify failed');
    expect(isMiniappTwoStepSecretError(error)).toBe(true);
  });

  it('detects two-step secret errors from plain error message', () => {
    expect(isMiniappTwoStepSecretError(new Error('security password invalid'))).toBe(true);
  });
});

