import { Effect } from 'effect';
import { createEventBusService, type EventBusService } from '@biochain/chain-effect';

let sharedEventBus: EventBusService | null = null;

/**
 * 获取共享的 Wallet EventBus（单例）
 * - pendingTx 确认事件与 txHistory 更新共用同一条总线
 */
export const getWalletEventBus = (): Effect.Effect<EventBusService> => {
  if (sharedEventBus) {
    return Effect.succeed(sharedEventBus);
  }

  return createEventBusService.pipe(
    Effect.tap((bus) =>
      Effect.sync(() => {
        sharedEventBus = bus;
      }),
    ),
  );
};
