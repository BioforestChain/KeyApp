import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { IframeContainerManager, cleanupAllIframeContainers } from '../container/iframe-container';
import type { ContainerCreateOptions } from '../container/types';

describe('IframeContainerManager', () => {
  let manager: IframeContainerManager;

  beforeEach(() => {
    manager = new IframeContainerManager();
    document.body.innerHTML = '';
  });

  afterEach(() => {
    cleanupAllIframeContainers();
  });

  describe('create', () => {
    it('should create an iframe container', async () => {
      const options: ContainerCreateOptions = {
        appId: 'test-app',
        url: 'https://example.com',
      };

      const handle = await manager.create(options);

      expect(handle.type).toBe('iframe');
      expect(handle.element).toBeInstanceOf(HTMLIFrameElement);
      expect(handle.element.id).toBe('miniapp-iframe-test-app');
      expect(handle.isConnected()).toBe(true);
    });

    it('should append context params to URL', async () => {
      const options: ContainerCreateOptions = {
        appId: 'test-app',
        url: 'https://example.com',
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
      const handle = await manager.create({ appId: 'test-app', url: 'about:blank' });

      expect(handle.isConnected()).toBe(true);

      handle.destroy();

      expect(handle.isConnected()).toBe(false);
    });

    it('should not throw when destroy called multiple times', async () => {
      const handle = await manager.create({ appId: 'test-app', url: 'about:blank' });

      handle.destroy();
      expect(() => handle.destroy()).not.toThrow();
    });

    it('should move to background', async () => {
      const handle = await manager.create({ appId: 'test-app', url: 'about:blank' });

      handle.moveToBackground();

      const hiddenContainer = document.getElementById('miniapp-hidden-container');
      expect(hiddenContainer).not.toBeNull();
      expect(hiddenContainer?.contains(handle.element)).toBe(true);
    });

    it('should move to foreground', async () => {
      const handle = await manager.create({ appId: 'test-app', url: 'about:blank' });

      handle.moveToBackground();
      handle.moveToForeground();

      const visibleContainer = document.getElementById('miniapp-iframe-container');
      expect(visibleContainer?.contains(handle.element)).toBe(true);
    });

    it('should not move after destroyed', async () => {
      const handle = await manager.create({ appId: 'test-app', url: 'about:blank' });

      handle.destroy();

      expect(() => handle.moveToBackground()).not.toThrow();
      expect(() => handle.moveToForeground()).not.toThrow();
    });
  });
});

describe('cleanupAllIframeContainers', () => {
  it('should remove all containers from DOM', async () => {
    const manager = new IframeContainerManager();
    await manager.create({ appId: 'app1', url: 'about:blank' });
    await manager.create({ appId: 'app2', url: 'about:blank' });

    cleanupAllIframeContainers();

    expect(document.getElementById('miniapp-iframe-container')).toBeNull();
    expect(document.getElementById('miniapp-hidden-container')).toBeNull();
  });
});
