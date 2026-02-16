import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  installAndroidFocusBlurLoopGuard,
  isAndroidUserAgent,
  uninstallAndroidFocusBlurLoopGuard,
} from './index';

describe('android-focus-blur-guard', () => {
  beforeEach(() => {
    uninstallAndroidFocusBlurLoopGuard();
  });

  it('detects android user agent', () => {
    expect(isAndroidUserAgent('Mozilla/5.0 (Linux; Android 14; Pixel 8)')).toBe(true);
    expect(isAndroidUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)')).toBe(false);
  });

  it('suppresses blur for body/html/iframe elements', () => {
    const nativeSpy = vi.fn();
    const originalBlur = HTMLElement.prototype.blur;
    HTMLElement.prototype.blur = function mockNativeBlur(this: HTMLElement): void {
      nativeSpy(this.tagName);
    };

    const restore = installAndroidFocusBlurLoopGuard({
      isAndroid: () => true,
    });

    document.body.blur();
    document.documentElement.blur();
    const iframe = document.createElement('iframe');
    document.body.appendChild(iframe);
    iframe.blur();

    const input = document.createElement('input');
    document.body.appendChild(input);
    input.blur();

    expect(nativeSpy).toHaveBeenCalledTimes(1);
    expect(nativeSpy).toHaveBeenCalledWith('INPUT');

    restore();
    HTMLElement.prototype.blur = originalBlur;
  });

  it('blocks blur event propagation when active element is body-like', () => {
    installAndroidFocusBlurLoopGuard({
      isAndroid: () => true,
    });

    const listener = vi.fn();
    window.addEventListener('blur', listener);

    window.dispatchEvent(new Event('blur'));

    expect(listener).not.toHaveBeenCalled();
  });

  it('does not install on non-android runtime', () => {
    const nativeBlur = HTMLElement.prototype.blur;
    const restore = installAndroidFocusBlurLoopGuard({
      isAndroid: () => false,
    });

    expect(HTMLElement.prototype.blur).toBe(nativeBlur);
    restore();
  });
});
