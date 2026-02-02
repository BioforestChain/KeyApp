/**
 * Platform detection utilities for Safari/iOS optimization
 */

export interface PlatformInfo {
  /** Safari browser (desktop or mobile) */
  isSafari: boolean;
  /** iOS device (iPhone, iPad, iPod) */
  isIOS: boolean;
  /** WebKit-based browser */
  isWebKit: boolean;
  /** User prefers reduced motion */
  prefersReducedMotion: boolean;
  /** Low-end device (based on hardware concurrency) */
  isLowEndDevice: boolean;
}

let cachedPlatform: PlatformInfo | null = null;

/**
 * Detect current platform characteristics
 * Results are cached for performance
 */
export function detectPlatform(): PlatformInfo {
  if (cachedPlatform) return cachedPlatform;

  // SSR safety
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return {
      isSafari: false,
      isIOS: false,
      isWebKit: false,
      prefersReducedMotion: false,
      isLowEndDevice: false,
    };
  }

  const ua = navigator.userAgent;

  cachedPlatform = {
    // Safari detection: has Safari but not Chrome/Android
    isSafari: /^((?!chrome|android).)*safari/i.test(ua),
    // iOS detection (including iPad with desktop UA)
    isIOS: /iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1),
    // WebKit detection
    isWebKit: 'WebkitAppearance' in document.documentElement.style,
    // Reduced motion preference
    prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    // Low-end device heuristic
    isLowEndDevice: navigator.hardwareConcurrency ? navigator.hardwareConcurrency <= 4 : false,
  };

  return cachedPlatform;
}

/**
 * Clear cached platform info (useful for testing)
 */
export function clearPlatformCache(): void {
  cachedPlatform = null;
}

/**
 * Check if current platform needs performance optimization
 */
export function needsOptimization(): boolean {
  const platform = detectPlatform();
  return platform.isSafari || platform.isIOS || platform.prefersReducedMotion || platform.isLowEndDevice;
}
