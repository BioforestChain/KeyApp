import type { ContainerManager, ContainerHandle, ContainerCreateOptions } from './types';

const HIDDEN_CONTAINER_ID = 'miniapp-hidden-container';

function getOrCreateHiddenContainer(): HTMLElement {
  let container = document.getElementById(HIDDEN_CONTAINER_ID);
  if (!container) {
    container = document.createElement('div');
    container.id = HIDDEN_CONTAINER_ID;
    container.style.cssText = `
      position: fixed;
      top: -9999px;
      left: -9999px;
      width: 1px;
      height: 1px;
      overflow: hidden;
      visibility: hidden;
      pointer-events: none;
    `;
    document.body.appendChild(container);
  }
  return container;
}

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

  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    this.iframe.src = 'about:blank';
    this.iframe.remove();
  }

  moveToBackground(): void {
    if (this.destroyed) return;
    const container = getOrCreateHiddenContainer();
    container.appendChild(this.iframe);
  }

  moveToForeground(): void {
    if (this.destroyed) return;
    this.mountTarget.appendChild(this.iframe);
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
    const { appId, url, mountTarget, contextParams, onLoad } = options;

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
    iframe.style.cssText = `
      width: 100%;
      height: 100%;
      border: none;
      background: transparent;
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
