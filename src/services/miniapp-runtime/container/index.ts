import type { ContainerType, ContainerManager, ContainerHandle, ContainerCreateOptions } from './types';
import { IframeContainerManager, cleanupAllIframeContainers } from './iframe-container';
import { WujieContainerManager } from './wujie-container';

export type { ContainerType, ContainerManager, ContainerHandle, ContainerCreateOptions };
export { cleanupAllIframeContainers };

const managers: Record<ContainerType, ContainerManager> = {
  iframe: new IframeContainerManager(),
  wujie: new WujieContainerManager(),
};

export function getContainerManager(type: ContainerType): ContainerManager {
  return managers[type];
}

export async function createContainer(type: ContainerType, options: ContainerCreateOptions): Promise<ContainerHandle> {
  const manager = getContainerManager(type);
  return manager.create(options);
}
