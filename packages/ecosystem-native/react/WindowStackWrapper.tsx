/**
 * React wrapper for ecosystem-window-stack Web Component
 */

import type { MiniappTargetDesktop } from '../src/components/types';
// Import to register the custom element
import '../src/components/window-stack';

export interface WindowStackWrapperProps {
  /** Which desktop this stack belongs to ('mine' or 'stack') */
  desktop: MiniappTargetDesktop;
  /** Additional class name */
  className?: string;
  /** Additional styles */
  style?: React.CSSProperties;
}

/**
 * React wrapper for the native WindowStack Web Component
 *
 * This component wraps the ecosystem-window-stack custom element.
 * The WindowStack auto-registers with windowStackManager in its connectedCallback,
 * so no useEffect is needed here.
 *
 * @example
 * ```tsx
 * // In your desktop page component
 * <WindowStackWrapper desktop="mine" />
 * ```
 *
 * Then in the miniapp runtime:
 * ```ts
 * import { windowStackManager } from '@biochain/ecosystem-native';
 *
 * // Synchronously get or create a slot
 * const slot = windowStackManager.getOrCreateSlot('mine', appId);
 * ```
 */
export function WindowStackWrapper({ desktop, className, style }: WindowStackWrapperProps) {
  return (
    <ecosystem-window-stack
      desktop={desktop}
      class={className}
      style={style}
    />
  );
}

// Extend JSX types for the custom element
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'ecosystem-window-stack': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          desktop?: MiniappTargetDesktop;
          class?: string;
        },
        HTMLElement
      >;
    }
  }
}
