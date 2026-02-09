import type { TFunction } from 'i18next';
import { ChainErrorCodes, ChainServiceError } from '@/services/chain-adapter/types';

const MINIAPP_TRANSFER_UNSUPPORTED_PIPELINE = 'MINIAPP_TRANSFER_UNSUPPORTED_PIPELINE';

function isTimeoutMessage(message: string): boolean {
  return /timeout|timed out|etimedout|aborterror|aborted/i.test(message);
}

function isBroadcastFailedMessage(message: string): boolean {
  return /failed to broadcast transaction|broadcast failed|tx_broadcast_failed/i.test(message);
}


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

function hasTimeoutMessageInError(error: unknown): boolean {
  return collectErrorMessages(error).some((message) => isTimeoutMessage(message));
}

function hasBroadcastFailedMessageInError(error: unknown): boolean {
  return collectErrorMessages(error).some((message) => isBroadcastFailedMessage(message));
}

export function createMiniappUnsupportedPipelineError(chainId: string): ChainServiceError {
  return new ChainServiceError(ChainErrorCodes.NOT_SUPPORTED, MINIAPP_TRANSFER_UNSUPPORTED_PIPELINE, {
    scope: 'miniapp-transfer',
    chainId,
  });
}

export function mapMiniappTransferErrorToMessage(t: TFunction, error: unknown, chainId: string): string {
  if (error instanceof ChainServiceError) {
    if (error.code === ChainErrorCodes.NOT_SUPPORTED && error.message === MINIAPP_TRANSFER_UNSUPPORTED_PIPELINE) {
      return t('common:miniappTransferUnsupportedPipeline', { chainId });
    }

    if (error.code === ChainErrorCodes.TRANSACTION_TIMEOUT) {
      return t('transaction:broadcast.timeout');
    }

    if (error.code === ChainErrorCodes.TX_BROADCAST_FAILED) {
      if (hasTimeoutMessageInError(error)) {
        return t('transaction:broadcast.timeout');
      }
      return t('transaction:broadcast.failed');
    }

    if (error.code === ChainErrorCodes.NETWORK_ERROR) {
      if (hasTimeoutMessageInError(error)) {
        return t('transaction:broadcast.timeout');
      }
      if (hasBroadcastFailedMessageInError(error)) {
        return t('transaction:broadcast.failed');
      }
    }
  }

  if (error instanceof Error) {
    if (error.message === MINIAPP_TRANSFER_UNSUPPORTED_PIPELINE) {
      return t('common:miniappTransferUnsupportedPipeline', { chainId });
    }

    if (hasTimeoutMessageInError(error)) {
      return t('transaction:broadcast.timeout');
    }

    if (hasBroadcastFailedMessageInError(error)) {
      return t('transaction:broadcast.failed');
    }
  }

  return t('transaction:broadcast.unknown');
}
