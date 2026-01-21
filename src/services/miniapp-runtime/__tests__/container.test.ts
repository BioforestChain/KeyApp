import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { IframeContainerManager, cleanupAllIframeContainers } from '../container/iframe-container';
import type { ContainerCreateOptions } from '../container/types';

describe('IframeContainerManager', () => {
  let manager: IframeContainerManager;
  let mountTarget: HTMLDivElement;

  beforeEach(() => {
    manager = new IframeContainerManager();
    document.body.innerHTML = '';
    mountTarget = document.createElement('div');
    mountTarget.id = 'test-mount-target';
    document.body.appendChild(mountTarget);
  });

  afterEach(() => {
    cleanupAllIframeContainers();
  });

  describe('create', () => {
    it('should create an iframe container', async () => {
      const options: ContainerCreateOptions = {
        appId: 'test-app',
        url: 'https://example.com',
        mountTarget,
      };

      const handle = await manager.create(options);

      expect(handle.type).toBe('iframe');
      expect(handle.element).toBeInstanceOf(HTMLIFrameElement);
      expect(handle.element.id).toBe('miniapp-iframe-test-app');
      expect(handle.isConnected()).toBe(true);
      expect(mountTarget.contains(handle.element)).toBe(true);
    });

    it('should append context params to URL', async () => {
      const options: ContainerCreateOptions = {
        appId: 'test-app',
        url: 'https://example.com',
        mountTarget,
        contextParams: { foo: 'bar', baz: 'qux' },
      };

      const handle = await manager.create(options);
      const iframe = handle.element as HTMLIFrameElement;

      expect(iframe.src).toContain('foo=bar');
      expect(iframe.src).toContain('baz=qux');
    });

    it('should call onLoad callback when iframe loads', async () => {
      const onLoad = vi.fn();
      const options: ContainerCreateOptions = {
        appId: 'test-app',
        url: 'about:blank',
        mountTarget,
        onLoad,
      };

      const handle = await manager.create(options);
      const iframe = handle.element as HTMLIFrameElement;

      iframe.dispatchEvent(new Event('load'));

      expect(onLoad).toHaveBeenCalledTimes(1);
    });

    it('should only call onLoad once', async () => {
      const onLoad = vi.fn();
      const options: ContainerCreateOptions = {
        appId: 'test-app',
        url: 'about:blank',
        mountTarget,
        onLoad,
      };

      const handle = await manager.create(options);
      const iframe = handle.element as HTMLIFrameElement;

      iframe.dispatchEvent(new Event('load'));
      iframe.dispatchEvent(new Event('load'));

      expect(onLoad).toHaveBeenCalledTimes(1);
    });
  });

  describe('ContainerHandle', () => {
    it('should destroy iframe correctly', async () => {
      const handle = await manager.create({ appId: 'test-app', url: 'about:blank', mountTarget });

      expect(handle.isConnected()).toBe(true);

      handle.destroy();

      expect(handle.isConnected()).toBe(false);
    });

    it('should not throw when destroy called multiple times', async () => {
      const handle = await manager.create({ appId: 'test-app', url: 'about:blank', mountTarget });

      handle.destroy();
      expect(() => handle.destroy()).not.toThrow();
    });

    it('should move to background', async () => {
      const handle = await manager.create({ appId: 'test-app', url: 'about:blank', mountTarget });

      handle.moveToBackground();

      const hiddenContainer = document.getElementById('miniapp-hidden-container');
      expect(hiddenContainer).not.toBeNull();
      expect(hiddenContainer?.contains(handle.element)).toBe(true);
    });

    it('should move to foreground', async () => {
      const handle = await manager.create({ appId: 'test-app', url: 'about:blank', mountTarget });

      handle.moveToBackground();
      handle.moveToForeground();

      expect(mountTarget.contains(handle.element)).toBe(true);
    });

    it('should not move after destroyed', async () => {
      const handle = await manager.create({ appId: 'test-app', url: 'about:blank', mountTarget });

      handle.destroy();

      expect(() => handle.moveToBackground()).not.toThrow();
      expect(() => handle.moveToForeground()).not.toThrow();
    });
  });
});

describe('cleanupAllIframeContainers', () => {
  it('should remove hidden container from DOM', async () => {
    const manager = new IframeContainerManager();
    const mountTarget = document.createElement('div');
    document.body.appendChild(mountTarget);

    const handle1 = await manager.create({ appId: 'app1', url: 'about:blank', mountTarget });
    const handle2 = await manager.create({ appId: 'app2', url: 'about:blank', mountTarget });

    handle1.moveToBackground();

    cleanupAllIframeContainers();

    expect(document.getElementById('miniapp-hidden-container')).toBeNull();
  });
});
