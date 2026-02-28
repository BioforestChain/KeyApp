import type { TFunction } from 'i18next';
import { ChainErrorCodes, ChainServiceError } from '@/services/chain-adapter/types';

const MINIAPP_TRANSFER_UNSUPPORTED_PIPELINE = 'MINIAPP_TRANSFER_UNSUPPORTED_PIPELINE';

export type MiniappTransferErrorFeedback = {
  message: string;
  detail: string | null;
};

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

function extractRawErrorDetail(error: unknown): string | null {
  const [firstMessage] = collectErrorMessages(error);
  if (!firstMessage) {
    return null;
  }
  const trimmed = firstMessage.trim();
  if (!trimmed) {
    return null;
  }
  return trimmed;
}

function extractParsedErrorDetail(error: unknown): string | null {
  const broadcastReason = extractBroadcastFailureReason(error);
  if (broadcastReason) {
    return broadcastReason;
  }

  const messages = collectErrorMessages(error)
    .map((message) => message.trim())
    .filter((message) => message.length > 0);
  if (messages.length === 0) {
    return null;
  }

  const [firstMeaningfulMessage] = messages.filter(
    (message) => !isGenericBroadcastFailureMessage(message) && !isBroadcastFailedMessage(message),
  );
  return firstMeaningfulMessage ?? messages[0] ?? null;
}

export function createMiniappUnsupportedPipelineError(chainId: string): ChainServiceError {
  return new ChainServiceError(ChainErrorCodes.NOT_SUPPORTED, MINIAPP_TRANSFER_UNSUPPORTED_PIPELINE, {
    scope: 'miniapp-transfer',
    chainId,
  });
}

export function resolveMiniappTransferErrorFeedback(
  t: TFunction,
  error: unknown,
  chainId: string,
): MiniappTransferErrorFeedback {
  let message: string | null = null;
  if (error instanceof ChainServiceError) {
    if (error.code === ChainErrorCodes.NOT_SUPPORTED && error.message === MINIAPP_TRANSFER_UNSUPPORTED_PIPELINE) {
      message = t('common:miniappTransferUnsupportedPipeline', { chainId });
      return {
        message,
        detail: extractRawErrorDetail(error),
      };
    }

    if (error.code === ChainErrorCodes.TRANSACTION_TIMEOUT) {
      message = t('transaction:broadcast.timeout');
      return {
        message,
        detail: extractParsedErrorDetail(error) ?? extractRawErrorDetail(error),
      };
    }

    if (error.code === ChainErrorCodes.TX_BROADCAST_FAILED) {
      if (hasTimeoutMessageInError(error)) {
        message = t('transaction:broadcast.timeout');
        return {
          message,
          detail: extractParsedErrorDetail(error) ?? extractRawErrorDetail(error),
        };
      }
      message = withBroadcastReason(t('transaction:broadcast.failed'), extractBroadcastFailureReason(error));
      return {
        message,
        detail: extractParsedErrorDetail(error) ?? extractRawErrorDetail(error),
      };
    }

    if (error.code === ChainErrorCodes.TX_BUILD_FAILED) {
      const reason = typeof error.details?.reason === 'string' ? error.details.reason.trim() : '';
      const displayMessage = reason || error.message;
      if (isSelfTransferMessage(displayMessage)) {
        message = t('error:validation.cannotTransferToSelf');
        return {
          message,
          detail: extractParsedErrorDetail(error) ?? extractRawErrorDetail(error),
        };
      }
      if (displayMessage) {
        message = displayMessage;
        return {
          message,
          detail: extractParsedErrorDetail(error) ?? extractRawErrorDetail(error),
        };
      }
    }

    if (error.code === ChainErrorCodes.NETWORK_ERROR) {
      if (hasTimeoutMessageInError(error)) {
        message = t('transaction:broadcast.timeout');
        return {
          message,
          detail: extractParsedErrorDetail(error) ?? extractRawErrorDetail(error),
        };
      }
      if (hasBroadcastFailedMessageInError(error)) {
        message = withBroadcastReason(t('transaction:broadcast.failed'), extractBroadcastFailureReason(error));
        return {
          message,
          detail: extractParsedErrorDetail(error) ?? extractRawErrorDetail(error),
        };
      }
    }
  }

  if (error instanceof Error) {
    if (error.message === MINIAPP_TRANSFER_UNSUPPORTED_PIPELINE) {
      message = t('common:miniappTransferUnsupportedPipeline', { chainId });
      return {
        message,
        detail: extractRawErrorDetail(error),
      };
    }

    if (hasTimeoutMessageInError(error)) {
      message = t('transaction:broadcast.timeout');
      return {
        message,
        detail: extractParsedErrorDetail(error) ?? extractRawErrorDetail(error),
      };
    }

    if (hasBroadcastFailedMessageInError(error)) {
      message = withBroadcastReason(t('transaction:broadcast.failed'), extractBroadcastFailureReason(error));
      return {
        message,
        detail: extractParsedErrorDetail(error) ?? extractRawErrorDetail(error),
      };
    }

    if (isSelfTransferMessage(error.message)) {
      message = t('error:validation.cannotTransferToSelf');
      return {
        message,
        detail: extractParsedErrorDetail(error) ?? extractRawErrorDetail(error),
      };
    }

    const [firstMessage] = collectErrorMessages(error);
    if (firstMessage) {
      message = firstMessage;
      return {
        message,
        detail: extractParsedErrorDetail(error) ?? extractRawErrorDetail(error),
      };
    }
  }

  message = t('transaction:broadcast.unknown');
  return {
    message,
    detail: extractParsedErrorDetail(error) ?? extractRawErrorDetail(error),
  };
}

export function mapMiniappTransferErrorToMessage(t: TFunction, error: unknown, chainId: string): string {
  return resolveMiniappTransferErrorFeedback(t, error, chainId).message;
}
