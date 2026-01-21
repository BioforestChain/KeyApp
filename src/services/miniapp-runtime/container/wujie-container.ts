import { startApp, destroyApp, bus } from 'wujie';
import type { ContainerManager, ContainerHandle, ContainerCreateOptions } from './types';

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

function rewriteHtmlAbsolutePaths(html: string, baseUrl: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const elements = doc.querySelectorAll('[href], [src]');
  elements.forEach((el) => {
    if (el.hasAttribute('href')) {
      const original = el.getAttribute('href')!;
      if (original.startsWith('/') && !original.startsWith('//')) {
        el.setAttribute('href', new URL(original.slice(1), baseUrl).href);
      }
    }
    if (el.hasAttribute('src')) {
      const original = el.getAttribute('src')!;
      if (original.startsWith('/') && !original.startsWith('//')) {
        el.setAttribute('src', new URL(original.slice(1), baseUrl).href);
      }
    }
  });

  return doc.documentElement.outerHTML;
}

const PLACEHOLDER_ORIGIN = 'https://placeholder.local';

function createAbsolutePathRewriter(baseUrl: string) {
  const parsedUrl = new URL(baseUrl);
  const targetBase = parsedUrl.origin + parsedUrl.pathname;

  return {
    fetch: (input: RequestInfo | URL, init?: RequestInit) => {
      const req = new Request(input, init);
      const parsedReqUrl = new URL(req.url);

      if (parsedReqUrl.origin === window.location.origin) {
        const normalized = new URL(
          parsedReqUrl.pathname + parsedReqUrl.search + parsedReqUrl.hash,
          PLACEHOLDER_ORIGIN + '/',
        );
        const rewrittenUrl = normalized.href.replace(PLACEHOLDER_ORIGIN + '/', targetBase);
        return window.fetch(rewrittenUrl, init);
      }
      return window.fetch(req);
    },
    plugins: [
      {
        htmlLoader: (html: string) => rewriteHtmlAbsolutePaths(html, baseUrl),
      },
    ],
  };
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
    const { appId, url, mountTarget, contextParams, onLoad, wujieConfig } = options;

    const container = document.createElement('div');
    container.id = `miniapp-wujie-${appId}`;
    container.className = 'size-full *:size-full *:block *:overflow-auto';

    mountTarget.appendChild(container);

    const urlWithParams = new URL(url, window.location.origin);
    if (contextParams) {
      Object.entries(contextParams).forEach(([key, value]) => {
        urlWithParams.searchParams.set(key, value);
      });
    }

    const startAppOptions: Parameters<typeof startApp>[0] = {
      name: appId,
      url: urlWithParams.toString(),
      el: container,
      alive: wujieConfig?.alive ?? true,
      fiber: wujieConfig?.fiber ?? true,
      sync: wujieConfig?.sync ?? false,
      afterMount: () => {
        onLoad?.();
      },
    };

    if (wujieConfig?.rewriteAbsolutePaths) {
      const rewriter = createAbsolutePathRewriter(urlWithParams.toString());
      startAppOptions.fetch = rewriter.fetch;
      startAppOptions.plugins = rewriter.plugins;
    }

    await startApp(startAppOptions);

    patchAdoptedStyleSheets(appId);

    return new WujieContainerHandle(appId, container);
  }
}

export { bus as wujieBus };
