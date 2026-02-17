import type { TFunction } from 'i18next';
import { ChainErrorCodes, ChainServiceError } from '@/services/chain-adapter/types';

const MINIAPP_TRANSFER_UNSUPPORTED_PIPELINE = 'MINIAPP_TRANSFER_UNSUPPORTED_PIPELINE';

function isTimeoutMessage(message: string): boolean {
  return /timeout|timed out|etimedout|aborterror|aborted/i.test(message);
}

function isBroadcastFailedMessage(message: string): boolean {
  return /failed to broadcast transaction|broadcast failed|tx_broadcast_failed/i.test(message);
}

function isSelfTransferMessage(message: string): boolean {
  return /cannot transfer(?:\s+\w+)*\s+to yourself|不能转账给自己|不能给自己转账/i.test(message);
}

function isGenericBroadcastFailureMessage(message: string): boolean {
  return /^broadcast failed:?$/i.test(message.trim())
    || /^failed to broadcast transaction:?$/i.test(message.trim());
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
    if (!isGenericBroadcastFailureMessage(normalized) && !isBroadcastFailedMessage(normalized)) {
      continue;
    }
    if (!isGenericBroadcastFailureMessage(normalized)) {
      return normalized;
    }
  }

  return null;
}

function withBroadcastReason(baseMessage: string, reason: string | null): string {
  if (!reason) return baseMessage;
  return `${baseMessage}: ${reason}`;
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
      return withBroadcastReason(t('transaction:broadcast.failed'), extractBroadcastFailureReason(error));
    }

    if (error.code === ChainErrorCodes.TX_BUILD_FAILED) {
      const reason = typeof error.details?.reason === 'string' ? error.details.reason.trim() : '';
      const displayMessage = reason || error.message;
      if (isSelfTransferMessage(displayMessage)) {
        return t('error:validation.cannotTransferToSelf');
      }
      if (displayMessage) {
        return displayMessage;
      }
    }

    if (error.code === ChainErrorCodes.NETWORK_ERROR) {
      if (hasTimeoutMessageInError(error)) {
        return t('transaction:broadcast.timeout');
      }
      if (hasBroadcastFailedMessageInError(error)) {
        return withBroadcastReason(t('transaction:broadcast.failed'), extractBroadcastFailureReason(error));
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
      return withBroadcastReason(t('transaction:broadcast.failed'), extractBroadcastFailureReason(error));
    }

    if (isSelfTransferMessage(error.message)) {
      return t('error:validation.cannotTransferToSelf');
    }

    const [firstMessage] = collectErrorMessages(error);
    if (firstMessage) {
      return firstMessage;
    }
  }

  return t('transaction:broadcast.unknown');
}
