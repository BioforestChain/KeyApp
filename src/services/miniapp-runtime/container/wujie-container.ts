import { startApp, destroyApp, bus } from 'wujie';
import type { ContainerManager, ContainerHandle, ContainerCreateOptions } from './types';

/**
 * Patch document.adoptedStyleSheets to proxy to shadowRoot.adoptedStyleSheets
 * Must be called after shadowRoot is created (e.g., in afterMount)
 * TODO: Submit PR to wujie upstream and remove this workaround
 */
function patchAdoptedStyleSheets(appId: string) {
  const iframe = document.querySelector<HTMLIFrameElement>(`iframe[name="${appId}"]`);
  if (!iframe?.contentWindow) return;

  const iframeWindow = iframe.contentWindow;
  const sandbox = (iframeWindow as Window & { __WUJIE?: { degrade?: boolean; shadowRoot?: ShadowRoot } }).__WUJIE;
  if (!sandbox?.shadowRoot || sandbox.degrade) return;

  const { shadowRoot } = sandbox;
  const descriptor: PropertyDescriptor = {
    configurable: true,
    enumerable: true,
    get() {
      return shadowRoot.adoptedStyleSheets;
    },
    set(sheets: CSSStyleSheet[]) {
      shadowRoot.adoptedStyleSheets = Array.isArray(sheets) ? [...sheets] : sheets;
    },
  };

  try {
    Object.defineProperty(
      (iframeWindow as Window & { Document: typeof Document }).Document.prototype,
      'adoptedStyleSheets',
      descriptor,
    );
  } catch {
    /* empty */
  }

  try {
    Object.defineProperty(iframeWindow.document, 'adoptedStyleSheets', descriptor);
  } catch {
    /* empty */
  }
}

class WujieContainerHandle implements ContainerHandle {
  readonly type = 'wujie' as const;
  readonly element: HTMLElement;
  private destroyed = false;

  constructor(
    private appId: string,
    private container: HTMLElement,
  ) {
    this.element = container;
  }

  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    destroyApp(this.appId);
    this.container.remove();
  }

  moveToBackground(): void {
    if (this.destroyed) return;
    this.container.style.visibility = 'hidden';
    this.container.style.pointerEvents = 'none';
  }

  moveToForeground(): void {
    if (this.destroyed) return;
    this.container.style.visibility = 'visible';
    this.container.style.pointerEvents = 'auto';
  }

  isConnected(): boolean {
    return this.container.isConnected && !this.destroyed;
  }

  getIframe(): HTMLIFrameElement | null {
    return document.querySelector(`iframe[name="${this.appId}"]`);
  }
}

export class WujieContainerManager implements ContainerManager {
  readonly type = 'wujie' as const;

  async create(options: ContainerCreateOptions): Promise<WujieContainerHandle> {
    const { appId, url, mountTarget, contextParams, onLoad } = options;

    const container = document.createElement('div');
    container.id = `miniapp-wujie-${appId}`;
    // container.style.cssText = 'width: 100%; height: 100%;';
    container.className = 'size-full *:size-full *:block *:overflow-auto';

    mountTarget.appendChild(container);

    const urlWithParams = new URL(url, window.location.origin);
    if (contextParams) {
      Object.entries(contextParams).forEach(([key, value]) => {
        urlWithParams.searchParams.set(key, value);
      });
    }

    await startApp({
      name: appId,
      url: urlWithParams.toString(),
      el: container,
      alive: true,
      fiber: true,
      sync: false,
      afterMount: () => {
        onLoad?.();
      },
    });

    patchAdoptedStyleSheets(appId);

    return new WujieContainerHandle(appId, container);
  }
}

export { bus as wujieBus };
