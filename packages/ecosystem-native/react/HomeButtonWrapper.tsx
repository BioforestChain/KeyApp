/**
 * React wrapper for ecosystem-home-button Web Component
 */

import { useEffect, useRef, useCallback, type ReactNode } from 'react';
import { ecosystemEvents } from '../src/events';
// Import to register the custom element
import '../src/components/home-button';

export interface HomeButtonWrapperProps {
  /** Whether there are running apps (enables swipe gesture) */
  hasRunningApps: boolean;
  /** Callback when swipe up is detected */
  onSwipeUp?: () => void;
  /** Callback when button is tapped */
  onTap?: () => void;
  /** Swipe threshold in pixels (default: 30) */
  swipeThreshold?: number;
  /** Velocity threshold in px/ms (default: 0.3) */
  velocityThreshold?: number;
  /** Children to render inside the button */
  children: ReactNode;
  /** Additional class name */
  className?: string;
}

/**
 * React wrapper for the native Home Button Web Component
 *
 * This component wraps the ecosystem-home-button custom element
 * and provides React-friendly props and callbacks.
 *
 * @example
 * ```tsx
 * <HomeButtonWrapper
 *   hasRunningApps={hasRunningApps}
 *   onSwipeUp={() => openStackView()}
 * >
 *   <TabButton icon={EcosystemIcon} />
 * </HomeButtonWrapper>
 * ```
 */
export function HomeButtonWrapper({
  hasRunningApps,
  onSwipeUp,
  onTap,
  swipeThreshold = 30,
  velocityThreshold = 0.3,
  children,
  className,
}: HomeButtonWrapperProps) {
  const ref = useRef<HTMLElement>(null);

  // Sync React props to Web Component attributes
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Set properties directly on the custom element
    // Using type assertion for Web Component properties
    const homeButton = element as HTMLElement & {
      hasRunningApps: boolean;
      swipeThreshold: number;
      velocityThreshold: number;
    };
    homeButton.hasRunningApps = hasRunningApps;
    homeButton.swipeThreshold = swipeThreshold;
    homeButton.velocityThreshold = velocityThreshold;
  }, [hasRunningApps, swipeThreshold, velocityThreshold]);

  // Handle swipe-up event from Web Component
  const handleSwipeUp = useCallback(() => {
    onSwipeUp?.();
  }, [onSwipeUp]);

  // Handle tap event from Web Component
  const handleTap = useCallback(() => {
    onTap?.();
  }, [onTap]);

  // Subscribe to events from the event bus
  useEffect(() => {
    const unsubscribeSwipe = ecosystemEvents.on('home:swipe-up', handleSwipeUp);
    const unsubscribeTap = ecosystemEvents.on('home:tap', handleTap);

    return () => {
      unsubscribeSwipe();
      unsubscribeTap();
    };
  }, [handleSwipeUp, handleTap]);

  return (
    <ecosystem-home-button
      ref={ref}
      className={className}
      has-running-apps={hasRunningApps || undefined}
      swipe-threshold={swipeThreshold}
      velocity-threshold={velocityThreshold}
    >
      {children}
    </ecosystem-home-button>
  );
}

// Extend JSX types for the custom element
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'ecosystem-home-button': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          'has-running-apps'?: boolean;
          'swipe-threshold'?: number;
          'velocity-threshold'?: number;
        },
        HTMLElement
      >;
    }
  }
}
