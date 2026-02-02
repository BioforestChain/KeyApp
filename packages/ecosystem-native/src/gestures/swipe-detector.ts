/**
 * Swipe gesture detector for touch interactions
 */

export interface SwipeConfig {
  /** Minimum distance in pixels to trigger swipe (default: 30) */
  threshold?: number;
  /** Minimum velocity in px/ms to trigger swipe (default: 0.3) */
  velocityThreshold?: number;
  /** Direction to detect */
  direction: 'up' | 'down' | 'left' | 'right' | 'vertical' | 'horizontal' | 'all';
}

export interface SwipeResult {
  /** Whether swipe was detected */
  detected: boolean;
  /** Direction of swipe */
  direction: 'up' | 'down' | 'left' | 'right' | null;
  /** Distance traveled */
  distance: number;
  /** Velocity in px/ms */
  velocity: number;
  /** Duration in ms */
  duration: number;
}

interface TouchState {
  startX: number;
  startY: number;
  startTime: number;
}

const DEFAULT_THRESHOLD = 30;
const DEFAULT_VELOCITY = 0.3;

/**
 * Creates a swipe detector for an element
 */
export function createSwipeDetector(config: SwipeConfig) {
  const threshold = config.threshold ?? DEFAULT_THRESHOLD;
  const velocityThreshold = config.velocityThreshold ?? DEFAULT_VELOCITY;

  let touchState: TouchState | null = null;

  function handleTouchStart(e: TouchEvent): void {
    const touch = e.touches[0];
    if (touch) {
      touchState = {
        startX: touch.clientX,
        startY: touch.clientY,
        startTime: Date.now(),
      };
    }
  }

  function handleTouchEnd(e: TouchEvent): SwipeResult {
    const result: SwipeResult = {
      detected: false,
      direction: null,
      distance: 0,
      velocity: 0,
      duration: 0,
    };

    if (!touchState) return result;

    const touch = e.changedTouches[0];
    if (!touch) return result;

    const deltaX = touch.clientX - touchState.startX;
    const deltaY = touchState.startY - touch.clientY; // Inverted for natural "up" direction
    const duration = Date.now() - touchState.startTime;

    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    result.duration = duration;

    // Determine primary direction
    const isHorizontal = absX > absY;
    const distance = isHorizontal ? absX : absY;
    const velocity = distance / duration;

    result.distance = distance;
    result.velocity = velocity;

    // Check if swipe meets threshold
    const meetsThreshold = distance > threshold || velocity > velocityThreshold;

    if (!meetsThreshold) {
      touchState = null;
      return result;
    }

    // Determine direction
    if (isHorizontal) {
      result.direction = deltaX > 0 ? 'right' : 'left';
    } else {
      result.direction = deltaY > 0 ? 'up' : 'down';
    }

    // Check if direction matches config
    const directionMatches =
      config.direction === 'all' ||
      config.direction === result.direction ||
      (config.direction === 'vertical' && (result.direction === 'up' || result.direction === 'down')) ||
      (config.direction === 'horizontal' && (result.direction === 'left' || result.direction === 'right'));

    result.detected = directionMatches;

    touchState = null;
    return result;
  }

  function reset(): void {
    touchState = null;
  }

  return {
    handleTouchStart,
    handleTouchEnd,
    reset,
  };
}

/**
 * Simple upward swipe detector (optimized for Home button use case)
 */
export function createUpSwipeDetector(options?: { threshold?: number; velocityThreshold?: number }) {
  return createSwipeDetector({
    direction: 'up',
    threshold: options?.threshold,
    velocityThreshold: options?.velocityThreshold,
  });
}
