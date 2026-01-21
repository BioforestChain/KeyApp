import { startApp, destroyApp, bus } from 'wujie';
import type { ContainerManager, ContainerHandle, ContainerCreateOptions } from './types';

const VISIBLE_CONTAINER_ID = 'miniapp-iframe-container';

function getOrCreateVisibleContainer(): HTMLElement {
  let container = document.getElementById(VISIBLE_CONTAINER_ID);
  if (!container) {
    container = document.createElement('div');
    container.id = VISIBLE_CONTAINER_ID;
    document.body.appendChild(container);
  }
  return container;
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
}

export class WujieContainerManager implements ContainerManager {
  readonly type = 'wujie' as const;

  async create(options: ContainerCreateOptions): Promise<WujieContainerHandle> {
    const { appId, url, contextParams, onLoad } = options;

    const container = document.createElement('div');
    container.id = `miniapp-wujie-${appId}`;
    container.style.cssText = 'width: 100%; height: 100%;';

    const visibleContainer = getOrCreateVisibleContainer();
    visibleContainer.appendChild(container);

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

    return new WujieContainerHandle(appId, container);
  }
}

export { bus as wujieBus };
