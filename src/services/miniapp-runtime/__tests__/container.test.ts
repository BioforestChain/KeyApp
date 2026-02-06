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

    it('should set permissions policy allow attribute when provided', async () => {
      const options: ContainerCreateOptions = {
        appId: 'test-app',
        url: 'https://example.com',
        mountTarget,
        permissionsPolicyAllow: 'clipboard-write; camera',
      };

      const handle = await manager.create(options);
      const iframe = handle.element as HTMLIFrameElement;

      expect(iframe.getAttribute('allow')).toBe('clipboard-write; camera');
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

      expect(mountTarget.contains(handle.element)).toBe(true);
      expect((handle.element as HTMLIFrameElement).style.opacity).toBe('0');
      expect((handle.element as HTMLIFrameElement).style.pointerEvents).toBe('none');
    });

    it('should move to foreground', async () => {
      const handle = await manager.create({ appId: 'test-app', url: 'about:blank', mountTarget });

      handle.moveToBackground();
      handle.moveToForeground();

      expect(mountTarget.contains(handle.element)).toBe(true);
      expect((handle.element as HTMLIFrameElement).style.opacity).toBe('1');
      expect((handle.element as HTMLIFrameElement).style.pointerEvents).toBe('auto');
    });

    it('should not re-parent connected iframe after target changed', async () => {
      const handle = await manager.create({ appId: 'test-app', url: 'about:blank', mountTarget });
      const latestTarget = document.createElement('div');
      latestTarget.id = 'latest-target';
      document.body.appendChild(latestTarget);

      handle.moveToBackground();
      ;(
        handle as typeof handle & {
          setMountTarget: (target: HTMLElement) => void;
        }
      ).setMountTarget(latestTarget);
      handle.moveToForeground();

      expect(mountTarget.contains(handle.element)).toBe(true);
      expect(latestTarget.contains(handle.element)).toBe(false);
      expect((handle.element as HTMLIFrameElement).style.opacity).toBe('1');
      expect((handle.element as HTMLIFrameElement).style.pointerEvents).toBe('auto');
    });

    it('should recover disconnected iframe to latest mount target', async () => {
      const handle = await manager.create({ appId: 'test-app', url: 'about:blank', mountTarget });
      const latestTarget = document.createElement('div');
      latestTarget.id = 'latest-target';
      document.body.appendChild(latestTarget);

      ;(
        handle as typeof handle & {
          setMountTarget: (target: HTMLElement) => void;
        }
      ).setMountTarget(latestTarget);

      handle.element.remove();
      expect(handle.element.isConnected).toBe(false);

      handle.moveToForeground();

      expect(latestTarget.contains(handle.element)).toBe(true);
      expect((handle.element as HTMLIFrameElement).style.opacity).toBe('1');
      expect((handle.element as HTMLIFrameElement).style.pointerEvents).toBe('auto');
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
  it('should be safe when hidden container does not exist', async () => {
    const manager = new IframeContainerManager();
    const mountTarget = document.createElement('div');
    document.body.appendChild(mountTarget);

    const handle1 = await manager.create({ appId: 'app1', url: 'about:blank', mountTarget });
    const handle2 = await manager.create({ appId: 'app2', url: 'about:blank', mountTarget });

    handle1.moveToBackground();

    cleanupAllIframeContainers();

    expect(document.getElementById('miniapp-hidden-container')).toBeNull();
    expect(mountTarget.contains(handle1.element)).toBe(true);
    expect(mountTarget.contains(handle2.element)).toBe(true);
  });
});
