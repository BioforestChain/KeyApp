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

/**
 * Synchronous container creation (iframe only).
 * Use this when you need the container handle immediately without Promise delay.
 *
 * @throws Error if the container type doesn't support sync creation (e.g., wujie)
 */
export function createContainerSync(type: ContainerType, options: ContainerCreateOptions): ContainerHandle {
  const manager = getContainerManager(type);
  if (!manager.createSync) {
    throw new Error(`Container type "${type}" does not support synchronous creation`);
  }
  return manager.createSync(options);
}
