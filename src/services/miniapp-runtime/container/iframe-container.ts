import type { ContainerManager, ContainerHandle, ContainerCreateOptions } from './types';

const HIDDEN_CONTAINER_ID = 'miniapp-hidden-container';

class IframeContainerHandle implements ContainerHandle {
  readonly type = 'iframe' as const;
  readonly element: HTMLIFrameElement;
  private destroyed = false;

  constructor(
    private iframe: HTMLIFrameElement,
    private mountTarget: HTMLElement,
  ) {
    this.element = iframe;
  }

  setMountTarget(nextMountTarget: HTMLElement): void {
    this.mountTarget = nextMountTarget;
  }

  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    this.iframe.src = 'about:blank';
    this.iframe.remove();
  }

  moveToBackground(): void {
    if (this.destroyed) return;
    // 关键约束：后台运行时不能移出 DOM（避免 iframe 被浏览器释放）
    this.iframe.style.opacity = '0';
    this.iframe.style.pointerEvents = 'none';
  }

  moveToForeground(): void {
    if (this.destroyed) return;
    // 前台恢复只在「已脱离文档」时补挂，避免反复 re-parent 导致 iframe 重载
    if (!this.iframe.isConnected) {
      this.mountTarget.appendChild(this.iframe);
    }
    this.iframe.style.opacity = '1';
    this.iframe.style.pointerEvents = 'auto';
  }

  isConnected(): boolean {
    return this.iframe.isConnected && !this.destroyed;
  }

  getIframe(): HTMLIFrameElement {
    return this.iframe;
  }
}

export class IframeContainerManager implements ContainerManager {
  readonly type = 'iframe' as const;

  /**
   * Synchronous container creation.
   * Creates the iframe and appends it to the mount target immediately.
   */
  createSync(options: ContainerCreateOptions): IframeContainerHandle {
    const { appId, url, mountTarget, contextParams, onLoad, permissionsPolicyAllow } = options;

    const iframe = document.createElement('iframe');
    iframe.id = `miniapp-iframe-${appId}`;
    iframe.dataset.appId = appId;

    const iframeUrl = new URL(url, window.location.origin);
    if (contextParams) {
      Object.entries(contextParams).forEach(([key, value]) => {
        iframeUrl.searchParams.set(key, value);
      });
    }
    iframe.src = iframeUrl.toString();

    if (iframe.sandbox?.add) {
      iframe.sandbox.add('allow-scripts', 'allow-forms', 'allow-same-origin');
    } else {
      iframe.setAttribute('sandbox', 'allow-scripts allow-forms allow-same-origin');
    }
    if (permissionsPolicyAllow) {
      iframe.setAttribute('allow', permissionsPolicyAllow);
    }
    iframe.style.cssText = `
      width: 100%;
      height: 100%;
      border: none;
      background: transparent;
      opacity: 1;
      pointer-events: auto;
    `;

    if (onLoad) {
      iframe.addEventListener('load', onLoad, { once: true });
    }

    mountTarget.appendChild(iframe);

    return new IframeContainerHandle(iframe, mountTarget);
  }

  async create(options: ContainerCreateOptions): Promise<IframeContainerHandle> {
    // Delegate to sync version
    return this.createSync(options);
  }
}

export function cleanupAllIframeContainers(): void {
  const hiddenContainer = document.getElementById(HIDDEN_CONTAINER_ID);

  if (hiddenContainer) {
    hiddenContainer.innerHTML = '';
    hiddenContainer.remove();
  }
}
