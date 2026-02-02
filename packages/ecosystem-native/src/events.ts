/**
 * Event bus for communication between Web Components and React
 */

/** Event type definitions */
export interface EcosystemEventMap {
  /** App open request */
  'app:open': { appId: string; targetDesktop: 'mine' | 'stack' };
  /** App close request */
  'app:close': { appId: string };
  /** App launched (splash showing) */
  'app:launched': { appId: string };
  /** App ready (splash hidden) */
  'app:ready': { appId: string };
  /** Page change in desktop */
  'page:change': { page: 'discover' | 'mine' | 'stack'; index: number };
  /** Swiper progress update */
  'page:progress': { progress: number };
  /** Stack view open request */
  'stack-view:open': undefined;
  /** Stack view close request */
  'stack-view:close': undefined;
  /** Home button swipe up gesture */
  'home:swipe-up': undefined;
  /** Home button tap */
  'home:tap': undefined;
  /** Long press on app icon */
  'icon:long-press': { appId: string; rect: DOMRect };
  /** Icon tap */
  'icon:tap': { appId: string };
  /** Search activated */
  'search:activate': undefined;
  /** Configuration changed */
  'config:change': { level: string };
}

type EventHandler<T> = (data: T) => void;
type UnsubscribeFn = () => void;

/**
 * Type-safe event bus for ecosystem components
 */
class EcosystemEventBus {
  private listeners = new Map<string, Set<EventHandler<unknown>>>();
  private debugMode = false;

  /**
   * Enable debug logging
   */
  setDebug(enabled: boolean): void {
    this.debugMode = enabled;
  }

  /**
   * Subscribe to an event
   */
  on<K extends keyof EcosystemEventMap>(
    event: K,
    handler: EventHandler<EcosystemEventMap[K]>
  ): UnsubscribeFn {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.add(handler as EventHandler<unknown>);
    }

    // Return unsubscribe function
    return () => {
      const currentHandlers = this.listeners.get(event);
      if (currentHandlers) {
        currentHandlers.delete(handler as EventHandler<unknown>);
        if (currentHandlers.size === 0) {
          this.listeners.delete(event);
        }
      }
    };
  }

  /**
   * Subscribe to an event (one-time)
   */
  once<K extends keyof EcosystemEventMap>(
    event: K,
    handler: EventHandler<EcosystemEventMap[K]>
  ): UnsubscribeFn {
    const unsubscribe = this.on(event, (data) => {
      unsubscribe();
      handler(data);
    });
    return unsubscribe;
  }

  /**
   * Emit an event
   */
  emit<K extends keyof EcosystemEventMap>(
    event: K,
    data: EcosystemEventMap[K]
  ): void {
    if (this.debugMode && typeof globalThis !== 'undefined' && 'console' in globalThis) {
      // Debug logging - only in development
      globalThis.console.log(`[EcosystemEvents] ${event}`, data);
    }

    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(data);
        } catch (error) {
          // Error handling - log to console in development
          if (typeof globalThis !== 'undefined' && 'console' in globalThis) {
            globalThis.console.error(`[EcosystemEvents] Error in handler for ${event}:`, error);
          }
        }
      });
    }
  }

  /**
   * Remove all listeners for an event
   */
  off<K extends keyof EcosystemEventMap>(event: K): void {
    this.listeners.delete(event);
  }

  /**
   * Remove all listeners
   */
  clear(): void {
    this.listeners.clear();
  }

  /**
   * Get listener count for an event
   */
  listenerCount<K extends keyof EcosystemEventMap>(event: K): number {
    return this.listeners.get(event)?.size ?? 0;
  }
}

/** Singleton event bus instance */
export const ecosystemEvents = new EcosystemEventBus();

/**
 * React hook helper - creates a subscription that auto-cleans on unmount
 * Usage in React:
 * ```
 * useEffect(() => ecosystemEvents.on('home:swipe-up', handler), []);
 * ```
 */
export { type UnsubscribeFn };
