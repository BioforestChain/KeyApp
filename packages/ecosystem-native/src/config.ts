/**
 * Animation configuration system with multi-level degradation
 */

import { detectPlatform } from './platform';

/** Animation level from full effects to none */
export type AnimationLevel = 'full' | 'reduced' | 'minimal' | 'none';

/** Animation feature flags */
export interface AnimationConfig {
  /** Swiper parallax effect */
  parallax: boolean;
  /** Framer Motion shared layout animations */
  sharedLayout: boolean;
  /** CSS backdrop-blur effects */
  blur: boolean;
  /** Splash screen glow animation */
  glow: boolean;
  /** Page transition animations */
  transitions: boolean;
  /** Context menu animations */
  menuAnimations: boolean;
  /** Icon hover/press effects */
  iconEffects: boolean;
}

/** Performance tuning options */
export interface PerformanceConfig {
  /** Lazy load app icons */
  lazyLoadIcons: boolean;
  /** Scroll event throttle (ms) */
  throttleScroll: number;
  /** Resize event debounce (ms) */
  debounceResize: number;
  /** Max concurrent animations */
  maxConcurrentAnimations: number;
}

/** Complete ecosystem configuration */
export interface EcosystemConfig {
  animation: AnimationConfig;
  performance: PerformanceConfig;
}

/** Preset configurations for each animation level */
const ANIMATION_PRESETS: Record<AnimationLevel, AnimationConfig> = {
  full: {
    parallax: true,
    sharedLayout: true,
    blur: true,
    glow: true,
    transitions: true,
    menuAnimations: true,
    iconEffects: true,
  },
  reduced: {
    parallax: true,
    sharedLayout: false, // Disable Framer Motion layoutId (main Safari issue)
    blur: true,
    glow: false, // Disable continuous glow animation
    transitions: true,
    menuAnimations: true,
    iconEffects: true,
  },
  minimal: {
    parallax: false, // Disable Swiper parallax
    sharedLayout: false,
    blur: false, // Disable backdrop-blur
    glow: false,
    transitions: true, // Keep simple fade transitions
    menuAnimations: false,
    iconEffects: false,
  },
  none: {
    parallax: false,
    sharedLayout: false,
    blur: false,
    glow: false,
    transitions: false,
    menuAnimations: false,
    iconEffects: false,
  },
};

/** Performance presets for each animation level */
const PERFORMANCE_PRESETS: Record<AnimationLevel, PerformanceConfig> = {
  full: {
    lazyLoadIcons: false,
    throttleScroll: 0,
    debounceResize: 100,
    maxConcurrentAnimations: 10,
  },
  reduced: {
    lazyLoadIcons: true,
    throttleScroll: 16, // ~60fps
    debounceResize: 150,
    maxConcurrentAnimations: 5,
  },
  minimal: {
    lazyLoadIcons: true,
    throttleScroll: 32, // ~30fps
    debounceResize: 200,
    maxConcurrentAnimations: 2,
  },
  none: {
    lazyLoadIcons: true,
    throttleScroll: 50,
    debounceResize: 300,
    maxConcurrentAnimations: 1,
  },
};

/** Current configuration state */
let currentConfig: EcosystemConfig | null = null;
let currentLevel: AnimationLevel | null = null;

/**
 * Get the recommended animation level based on platform
 */
export function getAutoAnimationLevel(): AnimationLevel {
  const platform = detectPlatform();

  // User preference takes highest priority
  if (platform.prefersReducedMotion) {
    return 'minimal';
  }

  // Safari/iOS gets reduced animations
  if (platform.isSafari || platform.isIOS) {
    return 'reduced';
  }

  // Low-end devices get minimal animations
  if (platform.isLowEndDevice) {
    return 'minimal';
  }

  return 'full';
}

/**
 * Initialize configuration with auto-detection or explicit level
 */
export function initConfig(level?: AnimationLevel): EcosystemConfig {
  const effectiveLevel = level ?? getAutoAnimationLevel();
  currentLevel = effectiveLevel;

  currentConfig = {
    animation: { ...ANIMATION_PRESETS[effectiveLevel] },
    performance: { ...PERFORMANCE_PRESETS[effectiveLevel] },
  };

  return currentConfig;
}

/**
 * Get current configuration (initializes with auto-detection if not set)
 */
export function getConfig(): EcosystemConfig {
  if (!currentConfig) {
    return initConfig();
  }
  return currentConfig;
}

/**
 * Get current animation level
 */
export function getAnimationLevel(): AnimationLevel {
  if (!currentLevel) {
    initConfig();
  }
  return currentLevel!;
}

/**
 * Override specific animation settings
 */
export function setAnimationOverrides(overrides: Partial<AnimationConfig>): void {
  const config = getConfig();
  currentConfig = {
    ...config,
    animation: { ...config.animation, ...overrides },
  };
}

/**
 * Override specific performance settings
 */
export function setPerformanceOverrides(overrides: Partial<PerformanceConfig>): void {
  const config = getConfig();
  currentConfig = {
    ...config,
    performance: { ...config.performance, ...overrides },
  };
}

/**
 * Reset configuration to defaults
 */
export function resetConfig(): void {
  currentConfig = null;
  currentLevel = null;
}

/**
 * Check if a specific animation feature is enabled
 */
export function isAnimationEnabled(feature: keyof AnimationConfig): boolean {
  return getConfig().animation[feature];
}
