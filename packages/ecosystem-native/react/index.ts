/**
 * React wrappers for ecosystem-native Web Components
 */

// Wrappers
export { HomeButtonWrapper, type HomeButtonWrapperProps } from './HomeButtonWrapper';
export { WindowStackWrapper, type WindowStackWrapperProps } from './WindowStackWrapper';
// export { EcosystemDesktopWrapper } from './EcosystemDesktopWrapper';
// export { SplashScreenWrapper } from './SplashScreenWrapper';

// Re-export core utilities for convenience
export {
  ecosystemEvents,
  getConfig,
  getAnimationLevel,
  isAnimationEnabled,
  initConfig,
  windowStackManager,
  type MiniappTargetDesktop,
  type SlotInfo,
} from '../src/index';
