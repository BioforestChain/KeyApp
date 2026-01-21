import type { ContainerManager, ContainerHandle, ContainerCreateOptions } from './types';

const VISIBLE_CONTAINER_ID = 'miniapp-iframe-container';
const HIDDEN_CONTAINER_ID = 'miniapp-hidden-container';

function getOrCreateContainer(id: string, hidden: boolean): HTMLElement {
  let container = document.getElementById(id);
  if (!container) {
    container = document.createElement('div');
    container.id = id;
    if (hidden) {
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
    }
    document.body.appendChild(container);
  }
  return container;
}

class IframeContainerHandle implements ContainerHandle {
  readonly type = 'iframe' as const;
  readonly element: HTMLIFrameElement;
  private destroyed = false;

  constructor(private iframe: HTMLIFrameElement) {
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
    const container = getOrCreateContainer(HIDDEN_CONTAINER_ID, true);
    container.appendChild(this.iframe);
  }

  moveToForeground(): void {
    if (this.destroyed) return;
    const container = getOrCreateContainer(VISIBLE_CONTAINER_ID, false);
    container.appendChild(this.iframe);
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

  async create(options: ContainerCreateOptions): Promise<IframeContainerHandle> {
    const { appId, url, contextParams, onLoad } = options;

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

    const container = getOrCreateContainer(VISIBLE_CONTAINER_ID, false);
    container.appendChild(iframe);

    return new IframeContainerHandle(iframe);
  }
}

export function cleanupAllIframeContainers(): void {
  const visibleContainer = document.getElementById(VISIBLE_CONTAINER_ID);
  const hiddenContainer = document.getElementById(HIDDEN_CONTAINER_ID);

  if (visibleContainer) {
    visibleContainer.innerHTML = '';
    visibleContainer.remove();
  }

  if (hiddenContainer) {
    hiddenContainer.innerHTML = '';
    hiddenContainer.remove();
  }
}
