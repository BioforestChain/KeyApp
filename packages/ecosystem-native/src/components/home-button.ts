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
    }

    .home-button-wrapper {
      display: contents;
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

  override connectedCallback(): void {
    super.connectedCallback();
    // Update detector with current thresholds
    this.swipeDetector = createUpSwipeDetector({
      threshold: this.swipeThreshold,
      velocityThreshold: this.velocityThreshold,
    });
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
    this.swipeDetector.handleTouchStart(e);
  };

  private handleTouchEnd = (e: TouchEvent): void => {
    if (!this.hasRunningApps) return;

    const result = this.swipeDetector.handleTouchEnd(e);

    if (result.detected && result.direction === 'up') {
      e.preventDefault();
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
    ecosystemEvents.emit('home:tap', undefined);

    this.dispatchEvent(
      new CustomEvent('home-tap', {
        bubbles: true,
        composed: true,
      })
    );
  };

  override render() {
    return html`
      <div
        class="home-button-wrapper"
        @touchstart=${this.handleTouchStart}
        @touchend=${this.handleTouchEnd}
        @click=${this.handleClick}
      >
        <slot></slot>
      </div>
    `;
  }
}

// Register the custom element
customElements.define('ecosystem-home-button', HomeButton);

declare global {
  interface HTMLElementTagNameMap {
    'ecosystem-home-button': HomeButton;
  }
}
