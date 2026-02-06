import type { WujieRuntimeConfig } from '@/services/ecosystem/types';

export type ContainerType = 'iframe' | 'wujie';

export interface ContainerHandle {
  readonly type: ContainerType;
  readonly element: HTMLElement;
  destroy(): void;
  moveToBackground(): void;
  moveToForeground(): void;
  /**
   * 更新挂载目标（可选，仅在支持重新挂载的容器中实现）
   */
  setMountTarget?(mountTarget: HTMLElement): void;
  isConnected(): boolean;
  getIframe(): HTMLIFrameElement | null;
}

export interface ContainerCreateOptions {
  appId: string;
  url: string;
  mountTarget: HTMLElement;
  contextParams?: Record<string, string>;
  onLoad?: () => void;
  wujieConfig?: WujieRuntimeConfig;
  permissionsPolicyAllow?: string;
}

export interface ContainerManager {
  readonly type: ContainerType;
  create(options: ContainerCreateOptions): Promise<ContainerHandle>;
  /**
   * Synchronous container creation (for iframe type only).
   * Returns the handle immediately without Promise wrapping.
   */
  createSync?(options: ContainerCreateOptions): ContainerHandle;
}
