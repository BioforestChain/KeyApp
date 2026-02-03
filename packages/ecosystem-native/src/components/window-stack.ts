/**
 * Ecosystem Window Stack - Lit Web Component
 *
 * Manages miniapp window slots synchronously to eliminate race conditions.
 * Replaces React's MiniappWindowStack with direct DOM control.
 *
 * NOTE: This component uses Light DOM (no Shadow DOM) to allow:
 * - React createPortal to work correctly with slot elements
 * - External CSS to style slot contents
 * - Proper event bubbling
 *
 * IMPORTANT: This component auto-registers with windowStackManager in connectedCallback
 * to ensure it's available before any launchApp() calls.
 */

import { LitElement, html } from 'lit';
import type { MiniappTargetDesktop } from './types';
import { windowStackManager } from './window-stack-manager';

export interface SlotInfo {
  appId: string;
  element: HTMLDivElement;
  desktop: MiniappTargetDesktop;
}

/**
 * Window stack component that manages miniapp slots synchronously.
 *
 * Usage:
 * ```html
 * <ecosystem-window-stack desktop="mine"></ecosystem-window-stack>
 * ```
 *
 * Key features:
 * - Synchronous slot creation via getOrCreateSlot()
 * - Direct DOM control without React rendering delays
 * - Eliminates race conditions in miniapp launch flow
 * - Uses Light DOM for React Portal compatibility
 * - Auto-registers with windowStackManager on connect
 */
export class WindowStack extends LitElement {
  static override properties = {
    desktop: { type: String },
  };

  /**
   * Disable Shadow DOM - render to Light DOM instead.
   * This is required for React createPortal compatibility.
   */
  override createRenderRoot() {
    return this;
  }

  /**
   * Which desktop this stack belongs to ('mine' or 'stack')
   */
  desktop: MiniappTargetDesktop = 'mine';

  /**
   * Internal map of slots by appId
   */
  private slots = new Map<string, SlotInfo>();

  /**
   * The container element for slots
   */
  private containerEl: HTMLDivElement | null = null;

  /**
   * Callback when a slot is created
   */
  private onSlotCreated?: (slot: SlotInfo) => void;

  /**
   * Callback when a slot is removed
   */
  private onSlotRemoved?: (appId: string, desktop: MiniappTargetDesktop) => void;

  /**
   * Auto-register with windowStackManager when connected to DOM.
   * This ensures the stack is available before any launchApp() calls.
   */
  override connectedCallback(): void {
    super.connectedCallback();
    // Register immediately when connected to DOM
    // The desktop attribute should already be set by React
    if (this.desktop) {
      windowStackManager.registerStack(this.desktop, this);
    }
  }

  /**
   * Unregister when disconnected from DOM.
   */
  override disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this.desktop) {
      windowStackManager.unregisterStack(this.desktop);
    }
  }

  /**
   * Re-register if desktop changes.
   */
  override updated(changedProperties: Map<string, unknown>): void {
    if (changedProperties.has('desktop')) {
      const oldDesktop = changedProperties.get('desktop') as MiniappTargetDesktop | undefined;
      if (oldDesktop) {
        windowStackManager.unregisterStack(oldDesktop);
      }
      if (this.desktop) {
        windowStackManager.registerStack(this.desktop, this);
      }
    }
  }

  /**
   * Get or create a slot for the given appId.
   * This is SYNCHRONOUS - the slot is immediately available in the DOM.
   */
  getOrCreateSlot(appId: string): HTMLDivElement {
    const existing = this.slots.get(appId);
    if (existing) {
      return existing.element;
    }

    // Create slot element synchronously
    const slot = document.createElement('div');
    slot.style.cssText = 'grid-area: 1 / 1; pointer-events: auto;';
    slot.dataset.miniappSlot = '';
    slot.dataset.appId = appId;
    slot.dataset.desktop = this.desktop;

    const slotInfo: SlotInfo = {
      appId,
      element: slot,
      desktop: this.desktop,
    };

    this.slots.set(appId, slotInfo);

    // Append to container
    const container = this.containerEl ?? this.querySelector('.stack-container');
    if (container) {
      container.appendChild(slot);
    }

    // Notify listeners
    this.onSlotCreated?.(slotInfo);

    return slot;
  }

  /**
   * Remove a slot for the given appId.
   */
  removeSlot(appId: string): void {
    const slotInfo = this.slots.get(appId);
    if (!slotInfo) return;

    slotInfo.element.remove();
    this.slots.delete(appId);

    this.onSlotRemoved?.(appId, this.desktop);
  }

  /**
   * Get an existing slot (returns null if not found).
   */
  getSlot(appId: string): HTMLDivElement | null {
    return this.slots.get(appId)?.element ?? null;
  }

  /**
   * Check if a slot exists for the given appId.
   */
  hasSlot(appId: string): boolean {
    return this.slots.has(appId);
  }

  /**
   * Set slot visibility.
   */
  setSlotHidden(appId: string, hidden: boolean): void {
    const slot = this.slots.get(appId)?.element;
    if (slot) {
      slot.dataset.hidden = String(hidden);
      slot.style.display = hidden ? 'none' : '';
    }
  }

  /**
   * Get all slot appIds.
   */
  getSlotIds(): string[] {
    return Array.from(this.slots.keys());
  }

  /**
   * Set callbacks for slot lifecycle events.
   */
  setCallbacks(callbacks: {
    onSlotCreated?: (slot: SlotInfo) => void;
    onSlotRemoved?: (appId: string, desktop: MiniappTargetDesktop) => void;
  }): void {
    this.onSlotCreated = callbacks.onSlotCreated;
    this.onSlotRemoved = callbacks.onSlotRemoved;
  }

  /**
   * Clear all slots.
   */
  clearAllSlots(): void {
    for (const appId of Array.from(this.slots.keys())) {
      this.removeSlot(appId);
    }
  }

  override firstUpdated() {
    // Cache the container reference
    this.containerEl = this.querySelector('.stack-container');
  }

  override render() {
    // Using Light DOM, so we use inline styles instead of css``
    return html`
      <div
        class="stack-container"
        style="
          display: grid;
          grid-template-columns: 1fr;
          grid-template-rows: 1fr;
          width: 100%;
          height: 100%;
          pointer-events: none;
        "
        aria-hidden="true"
        data-testid="ecosystem-window-stack"
      >
        <!-- Slots are added dynamically via getOrCreateSlot() -->
      </div>
    `;
  }
}

// Register the custom element
customElements.define('ecosystem-window-stack', WindowStack);

declare global {
  interface HTMLElementTagNameMap {
    'ecosystem-window-stack': WindowStack;
  }
}
