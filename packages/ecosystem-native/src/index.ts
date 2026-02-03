/**
 * @biochain/ecosystem-native
 *
 * Native DOM components for Ecosystem desktop with Safari optimization.
 * Uses Lit Web Components for stable, framework-agnostic rendering.
 */

// Configuration
export {
  type AnimationLevel,
  type AnimationConfig,
  type PerformanceConfig,
  type EcosystemConfig,
  initConfig,
  getConfig,
  getAnimationLevel,
  getAutoAnimationLevel,
  setAnimationOverrides,
  setPerformanceOverrides,
  resetConfig,
  isAnimationEnabled,
} from './config';

// Platform detection
export {
  type PlatformInfo,
  detectPlatform,
  clearPlatformCache,
  needsOptimization,
} from './platform';

// Event bus
export {
  type EcosystemEventMap,
  type UnsubscribeFn,
  ecosystemEvents,
} from './events';

// Gestures
export {
  createSwipeDetector,
  createUpSwipeDetector,
  type SwipeConfig,
  type SwipeResult,
} from './gestures';

// Components
export { HomeButton } from './components/home-button';
export { WindowStack, type SlotInfo } from './components/window-stack';
export { windowStackManager } from './components/window-stack-manager';

// Component types
export { type MiniappTargetDesktop } from './components/types';
