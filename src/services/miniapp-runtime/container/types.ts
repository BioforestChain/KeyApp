export type ContainerType = 'iframe' | 'wujie';

export interface ContainerHandle {
  readonly type: ContainerType;
  readonly element: HTMLElement;
  destroy(): void;
  moveToBackground(): void;
  moveToForeground(): void;
  isConnected(): boolean;
  getIframe(): HTMLIFrameElement | null;
}

export interface ContainerCreateOptions {
  appId: string;
  url: string;
  mountTarget: HTMLElement;
  contextParams?: Record<string, string>;
  onLoad?: () => void;
}

export interface ContainerManager {
  readonly type: ContainerType;
  create(options: ContainerCreateOptions): Promise<ContainerHandle>;
}
