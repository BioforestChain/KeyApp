export interface AndroidFocusBlurLoopGuardOptions {
  /**
   * Android 运行时检测（默认通过 UA 判断）
   */
  isAndroid?: () => boolean;
  /**
   * 是否将 iframe 元素视为需拦截目标（默认 true）
   */
  blockIframeElement?: boolean;
}

type GuardState = {
  restore: () => void;
};

type GuardWindow = Window &
  typeof globalThis & {
    __biochainAndroidFocusBlurLoopGuardState__?: GuardState;
  };

const GUARD_KEY = '__biochainAndroidFocusBlurLoopGuardState__' as const;

function isBlockedElement(element: Element | null, blockIframeElement: boolean): element is HTMLElement {
  if (!(element instanceof HTMLElement)) {
    return false;
  }

  if (element === document.body || element === document.documentElement) {
    return true;
  }

  if (blockIframeElement && element instanceof HTMLIFrameElement) {
    return true;
  }

  return false;
}

export function isAndroidUserAgent(userAgent: string): boolean {
  return /android/i.test(userAgent);
}

function isAndroidRuntime(): boolean {
  if (typeof navigator === 'undefined') {
    return false;
  }

  const nav = navigator as Navigator & {
    userAgentData?: {
      platform?: string;
    };
  };

  const platform = nav.userAgentData?.platform;
  if (platform && /android/i.test(platform)) {
    return true;
  }

  return isAndroidUserAgent(nav.userAgent);
}

/**
 * 在 Android WebView 环境为全局 focus/blur 死循环做止血补丁。
 * - 拦截 window blur/focus 事件在 body/html/iframe 激活时的传播
 * - 禁止对 body/html/iframe 执行 blur()
 * - 对 blur() 做最小重入保护
 */
export function installAndroidFocusBlurLoopGuard(
  options: AndroidFocusBlurLoopGuardOptions = {},
): () => void {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return () => {};
  }

  const guardWindow = window as GuardWindow;
  const existing = guardWindow[GUARD_KEY];
  if (existing) {
    return existing.restore;
  }

  const checkAndroid = options.isAndroid ?? isAndroidRuntime;
  if (!checkAndroid()) {
    return () => {};
  }

  const blockIframeElement = options.blockIframeElement ?? true;
  const nativeBlur = HTMLElement.prototype.blur;
  let blurring = false;

  const eventFirewall = (event: Event) => {
    if (!isBlockedElement(document.activeElement, blockIframeElement)) {
      return;
    }
    event.stopImmediatePropagation();
    event.stopPropagation();
  };

  window.addEventListener('blur', eventFirewall, true);
  window.addEventListener('focus', eventFirewall, true);

  HTMLElement.prototype.blur = function patchedBlur(this: HTMLElement): void {
    if (isBlockedElement(this, blockIframeElement)) {
      return;
    }

    if (blurring) {
      return;
    }

    blurring = true;
    try {
      nativeBlur.call(this);
    } finally {
      queueMicrotask(() => {
        blurring = false;
      });
    }
  };

  const restore = () => {
    window.removeEventListener('blur', eventFirewall, true);
    window.removeEventListener('focus', eventFirewall, true);
    HTMLElement.prototype.blur = nativeBlur;
    delete guardWindow[GUARD_KEY];
  };

  guardWindow[GUARD_KEY] = { restore };
  return restore;
}

export function uninstallAndroidFocusBlurLoopGuard(): void {
  if (typeof window === 'undefined') {
    return;
  }
  const guardWindow = window as GuardWindow;
  guardWindow[GUARD_KEY]?.restore();
}
