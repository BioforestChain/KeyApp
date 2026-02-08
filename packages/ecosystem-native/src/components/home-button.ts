/**
 * Home Button Web Component
 *
 * A native DOM component that detects upward swipe gestures
 * to open the stack view. Designed for Safari stability.
 */

import { LitElement, html, css } from 'lit';
import { ecosystemEvents } from '../events';
import { createUpSwipeDetector } from '../gestures/swipe-detector';

export class HomeButton extends LitElement {
  static override styles = css`
    :host {
      display: contents;
      touch-action: pan-x;
      -webkit-touch-callout: none;
      -webkit-user-select: none;
      user-select: none;
    }

    slot {
      display: contents;
    }

    ::slotted(*) {
      touch-action: pan-x;
      -webkit-touch-callout: none;
      -webkit-user-select: none;
      user-select: none;
    }
  `;

  static override properties = {
    hasRunningApps: { type: Boolean, attribute: 'has-running-apps' },
    swipeThreshold: { type: Number, attribute: 'swipe-threshold' },
    velocityThreshold: { type: Number, attribute: 'velocity-threshold' },
  };

  /**
   * Whether there are running apps (enables swipe gesture)
   */
  hasRunningApps = false;

  /**
   * Swipe threshold in pixels
   */
  swipeThreshold = 30;

  /**
   * Velocity threshold in px/ms
   */
  velocityThreshold = 0.3;

  private swipeDetector = createUpSwipeDetector();
  private ignoreNextClick = false;
  private ignoreClickTimeoutId: ReturnType<typeof globalThis.setTimeout> | null = null;

  override connectedCallback(): void {
    super.connectedCallback();

    // Update detector with current thresholds
    this.swipeDetector = createUpSwipeDetector({
      threshold: this.swipeThreshold,
      velocityThreshold: this.velocityThreshold,
    });

    // NOTE: Listen on host element instead of shadow DOM.
    // Touch events are not reliably delivered through shadow boundaries in Safari,
    // which may cause swipe-up to silently fail.
    // Capture phase: avoid child components (e.g. Swiper) stopping propagation.
    this.addEventListener('touchstart', this.handleTouchStart, { capture: true });
    this.addEventListener('touchend', this.handleTouchEnd, { capture: true });
    this.addEventListener('touchcancel', this.handleTouchCancel, { capture: true });
    this.addEventListener('click', this.handleClick);
  }

  override disconnectedCallback(): void {
    if (this.ignoreClickTimeoutId !== null) {
      globalThis.clearTimeout(this.ignoreClickTimeoutId);
      this.ignoreClickTimeoutId = null;
    }

    this.removeEventListener('touchstart', this.handleTouchStart, { capture: true });
    this.removeEventListener('touchend', this.handleTouchEnd, { capture: true });
    this.removeEventListener('touchcancel', this.handleTouchCancel, { capture: true });
    this.removeEventListener('click', this.handleClick);

    super.disconnectedCallback();
  }

  override updated(changedProperties: Map<string, unknown>): void {
    if (changedProperties.has('swipeThreshold') || changedProperties.has('velocityThreshold')) {
      this.swipeDetector = createUpSwipeDetector({
        threshold: this.swipeThreshold,
        velocityThreshold: this.velocityThreshold,
      });
    }
  }

  private handleTouchStart = (e: TouchEvent): void => {
    if (!this.hasRunningApps) {
      this.swipeDetector.reset();
      return;
    }

    this.swipeDetector.handleTouchStart(e);
  };

  private handleTouchCancel = (): void => {
    this.swipeDetector.reset();
  };

  private handleTouchEnd = (e: TouchEvent): void => {
    if (!this.hasRunningApps) {
      this.swipeDetector.reset();
      return;
    }

    const result = this.swipeDetector.handleTouchEnd(e);

    if (result.detected && result.direction === 'up') {
      e.preventDefault();

      // Some browsers still fire a click after touchend.
      // Suppress that tap so swipe-up doesn't immediately trigger the tap path.
      this.ignoreNextClick = true;
      if (this.ignoreClickTimeoutId !== null) {
        globalThis.clearTimeout(this.ignoreClickTimeoutId);
      }
      this.ignoreClickTimeoutId = globalThis.setTimeout(() => {
        this.ignoreNextClick = false;
        this.ignoreClickTimeoutId = null;
      }, 400);

      ecosystemEvents.emit('home:swipe-up', undefined);

      // Dispatch custom event for React integration
      this.dispatchEvent(
        new CustomEvent('swipe-up', {
          bubbles: true,
          composed: true,
          detail: result,
        })
      );
    }
  };

  private handleClick = (): void => {
    if (this.ignoreNextClick) {
      this.ignoreNextClick = false;
      return;
    }

    ecosystemEvents.emit('home:tap', undefined);

    this.dispatchEvent(
      new CustomEvent('home-tap', {
        bubbles: true,
        composed: true,
      })
    );
  };

  override render() {
    return html`<slot></slot>`;
  }
}

// Register the custom element
customElements.define('ecosystem-home-button', HomeButton);

declare global {
  interface HTMLElementTagNameMap {
    'ecosystem-home-button': HomeButton;
  }
}
