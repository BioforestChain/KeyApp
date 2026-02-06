/**
 * WindowStack Manager
 *
 * Singleton that manages WindowStack instances and provides
 * synchronous slot access for the miniapp runtime.
 */

import type { WindowStack, SlotInfo, MiniappTargetDesktop } from '../index';

type SlotCreatedCallback = (slot: SlotInfo) => void;
type SlotRemovedCallback = (appId: string, desktop: MiniappTargetDesktop) => void;

class WindowStackManager {
  private stacks = new Map<MiniappTargetDesktop, WindowStack>();
  private slotCreatedCallbacks = new Set<SlotCreatedCallback>();
  private slotRemovedCallbacks = new Set<SlotRemovedCallback>();

  /**
   * Register a WindowStack instance for a desktop.
   * Called by WindowStackWrapper when the component mounts.
   */
  registerStack(desktop: MiniappTargetDesktop, stack: WindowStack): void {
    this.stacks.set(desktop, stack);

    // Set up callbacks to forward events
    stack.setCallbacks({
      onSlotCreated: (slot) => {
        this.slotCreatedCallbacks.forEach((cb) => cb(slot));
      },
      onSlotRemoved: (appId, desktop) => {
        this.slotRemovedCallbacks.forEach((cb) => cb(appId, desktop));
      },
    });
  }

  /**
   * Unregister a WindowStack instance.
   * Called by WindowStackWrapper when the component unmounts.
   */
  unregisterStack(desktop: MiniappTargetDesktop): void {
    const stack = this.stacks.get(desktop);
    if (stack) {
      stack.setCallbacks({});
      this.stacks.delete(desktop);
    }
  }

  /**
   * Get the WindowStack for a desktop.
   */
  getStack(desktop: MiniappTargetDesktop): WindowStack | null {
    return this.stacks.get(desktop) ?? null;
  }

  /**
   * Get or create a slot for an app on a specific desktop.
   * This is SYNCHRONOUS - returns immediately.
   *
   * @throws Error if the WindowStack for the desktop is not registered
   */
  getOrCreateSlot(desktop: MiniappTargetDesktop, appId: string): HTMLDivElement {
    const stack = this.stacks.get(desktop);
    if (!stack) {
      throw new Error(`WindowStack for desktop "${desktop}" is not registered`);
    }
    return stack.getOrCreateSlot(appId);
  }

  /**
   * Get an existing slot (returns null if not found).
   */
  getSlot(desktop: MiniappTargetDesktop, appId: string): HTMLDivElement | null {
    const stack = this.stacks.get(desktop);
    return stack?.getSlot(appId) ?? null;
  }

  /**
   * Remove a slot.
   */
  removeSlot(desktop: MiniappTargetDesktop, appId: string): void {
    const stack = this.stacks.get(desktop);
    stack?.removeSlot(appId);
  }

  /**
   * Check if a slot exists.
   */
  hasSlot(desktop: MiniappTargetDesktop, appId: string): boolean {
    const stack = this.stacks.get(desktop);
    return stack?.hasSlot(appId) ?? false;
  }

  /**
   * Set slot visibility.
   */
  setSlotHidden(desktop: MiniappTargetDesktop, appId: string, hidden: boolean): void {
    const stack = this.stacks.get(desktop);
    stack?.setSlotHidden(appId, hidden);
  }

  /**
   * Set slot interactivity.
   */
  setSlotInteractive(desktop: MiniappTargetDesktop, appId: string, interactive: boolean): void {
    const stack = this.stacks.get(desktop);
    stack?.setSlotInteractive(appId, interactive);
  }

  /**
   * Check if a desktop's WindowStack is registered.
   */
  isStackRegistered(desktop: MiniappTargetDesktop): boolean {
    return this.stacks.has(desktop);
  }

  /**
   * Subscribe to slot created events.
   */
  onSlotCreated(callback: SlotCreatedCallback): () => void {
    this.slotCreatedCallbacks.add(callback);
    return () => this.slotCreatedCallbacks.delete(callback);
  }

  /**
   * Subscribe to slot removed events.
   */
  onSlotRemoved(callback: SlotRemovedCallback): () => void {
    this.slotRemovedCallbacks.add(callback);
    return () => this.slotRemovedCallbacks.delete(callback);
  }

  /**
   * Clear all slots on all desktops.
   */
  clearAll(): void {
    for (const stack of this.stacks.values()) {
      stack.clearAllSlots();
    }
  }
}

/**
 * Singleton instance of the WindowStack manager.
 * Use this to access slots synchronously from the miniapp runtime.
 */
export const windowStackManager = new WindowStackManager();
