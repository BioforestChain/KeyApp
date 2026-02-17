import { describe, expect, it } from 'vitest';
import { ChainErrorCodes, ChainServiceError } from '@/services/chain-adapter/types';
import {
  createMiniappUnsupportedPipelineError,
  mapMiniappTransferErrorToMessage,
} from '../miniapp-transfer-error';

function createTestT() {
  return ((key: string, options?: Record<string, unknown>) => {
    if (options?.chainId) {
      return `${key}:${String(options.chainId)}`;
    }
    return key;
  }) as unknown as (key: string, options?: Record<string, unknown>) => string;
}

describe('miniapp-transfer-error mapper', () => {
  const t = createTestT();
  const chainId = 'bfmetav2';

  it('maps unsupported pipeline error to localized key', () => {
    const error = createMiniappUnsupportedPipelineError(chainId);
    expect(mapMiniappTransferErrorToMessage(t, error, chainId)).toBe(
      `common:miniappTransferUnsupportedPipeline:${chainId}`,
    );
  });

  it('maps timeout errors by chain error code', () => {
    const error = new ChainServiceError(ChainErrorCodes.TRANSACTION_TIMEOUT, 'timed out');
    expect(mapMiniappTransferErrorToMessage(t, error, chainId)).toBe('transaction:broadcast.timeout');
  });

  it('maps broadcast failure errors by message', () => {
    const error = new Error('Failed to broadcast transaction');
    expect(mapMiniappTransferErrorToMessage(t, error, chainId)).toBe('transaction:broadcast.failed');
  });

  it('maps timeout errors by message pattern', () => {
    const error = new Error('Request timeout while broadcasting');
    expect(mapMiniappTransferErrorToMessage(t, error, chainId)).toBe('transaction:broadcast.timeout');
  });


  it('maps broadcast timeout from error cause chain', () => {
    const error = new ChainServiceError(
      ChainErrorCodes.TX_BROADCAST_FAILED,
      'Failed to broadcast transaction',
      undefined,
      new Error('Request timeout'),
    );
    expect(mapMiniappTransferErrorToMessage(t, error, chainId)).toBe('transaction:broadcast.timeout');
  });

  it('maps broadcast failure with detailed reason', () => {
    const error = new ChainServiceError(
      ChainErrorCodes.TX_BROADCAST_FAILED,
      'Broadcast failed: SIGERROR',
      { reason: 'SIGERROR' },
    );
    expect(mapMiniappTransferErrorToMessage(t, error, chainId)).toBe('transaction:broadcast.failed: SIGERROR');
  });

  it('maps tx build self-transfer failure', () => {
    const error = new ChainServiceError(
      ChainErrorCodes.TX_BUILD_FAILED,
      'Failed to create Tron transaction: Cannot transfer TRX to yourself.',
      { reason: 'Cannot transfer TRX to yourself.' },
    );
    expect(mapMiniappTransferErrorToMessage(t, error, chainId)).toBe('error:validation.cannotTransferToSelf');
  });

  it('maps tx build failure reason directly', () => {
    const error = new ChainServiceError(
      ChainErrorCodes.TX_BUILD_FAILED,
      'Failed to create Tron transaction: account does not exist',
      { reason: 'account does not exist' },
    );
    expect(mapMiniappTransferErrorToMessage(t, error, chainId)).toBe('account does not exist');
  });

  it('falls back to original error message for unknown error', () => {
    const error = new Error('some-random-error');
    expect(mapMiniappTransferErrorToMessage(t, error, chainId)).toBe('some-random-error');
  });
});
