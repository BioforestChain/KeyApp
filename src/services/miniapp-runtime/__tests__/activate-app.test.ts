import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { activateApp, miniappRuntimeStore } from '../index';
import { DEFAULT_MINIAPP_VISUAL_CONFIG } from '../visual-config';
import type { MiniappFlow, MiniappInstance, MiniappRuntimeState, MiniappState } from '../types';
import type { ContainerHandle } from '../container/types';

function cloneRuntimeState(state: MiniappRuntimeState): MiniappRuntimeState {
  return {
    ...state,
    apps: new Map(state.apps),
    presentations: new Map(state.presentations),
  };
}

type MockContainerHandle = ContainerHandle & {
  moveToBackground: ReturnType<typeof vi.fn>;
  moveToForeground: ReturnType<typeof vi.fn>;
};

function createMockContainerHandle(appId: string): MockContainerHandle {
  const iframe = document.createElement('iframe');
  iframe.dataset.appId = appId;

  const moveToBackground = vi.fn();
  const moveToForeground = vi.fn();

  return {
    type: 'iframe',
    element: iframe,
    destroy: vi.fn(),
    moveToBackground,
    moveToForeground,
    setMountTarget: vi.fn(),
    isConnected: vi.fn(() => true),
    getIframe: vi.fn(() => null),
  };
}

function createAppInstance(params: {
  appId: string;
  appState: MiniappState;
  flow: MiniappFlow;
  lastActiveAt: number;
  containerHandle: ContainerHandle;
}): MiniappInstance {
  return {
    appId: params.appId,
    manifest: {
      id: params.appId,
      name: params.appId,
      description: `${params.appId} description`,
      icon: `/icons/${params.appId}.png`,
      url: `https://example.com/${params.appId}`,
      version: '1.0.0',
      targetDesktop: 'mine',
    },
    state: params.appState,
    flow: params.flow,
    ctx: {
      capsuleTheme: 'auto',
    },
    processStatus: 'loaded',
    readiness: 'ready',
    launchedAt: 1,
    lastActiveAt: params.lastActiveAt,
    containerType: 'iframe',
    containerHandle: params.containerHandle,
    iframeRef: null,
    iconRef: null,
  };
}

describe('miniapp-runtime activateApp', () => {
  const initialState = cloneRuntimeState(miniappRuntimeStore.state);
  let appAHandle: MockContainerHandle;
  let appBHandle: MockContainerHandle;

  afterEach(() => {
    miniappRuntimeStore.setState(() => cloneRuntimeState(initialState));
  });

  beforeEach(() => {
    appAHandle = createMockContainerHandle('app-a');
    appBHandle = createMockContainerHandle('app-b');

    const appA = createAppInstance({
      appId: 'app-a',
      appState: 'background',
      flow: 'backgrounded',
      lastActiveAt: 1,
      containerHandle: appAHandle,
    });
    const appB = createAppInstance({
      appId: 'app-b',
      appState: 'active',
      flow: 'opened',
      lastActiveAt: 2,
      containerHandle: appBHandle,
    });

    miniappRuntimeStore.setState(() => ({
      apps: new Map([
        [appA.appId, appA],
        [appB.appId, appB],
      ]),
      visualConfig: DEFAULT_MINIAPP_VISUAL_CONFIG,
      activeAppId: appB.appId,
      focusedAppId: appB.appId,
      presentations: new Map([
        [
          appA.appId,
          {
            appId: appA.appId,
            desktop: 'mine',
            state: 'presented',
            zOrder: 2,
            transitionId: null,
            transitionKind: null,
          },
        ],
        [
          appB.appId,
          {
            appId: appB.appId,
            desktop: 'mine',
            state: 'presented',
            zOrder: 3,
            transitionId: null,
            transitionKind: null,
          },
        ],
      ]),
      zOrderSeed: 3,
      isStackViewOpen: true,
      maxBackgroundApps: 4,
    }));
  });

  it('should enforce single foreground app and promote zOrder when activating background app', () => {
    activateApp('app-a');

    const state = miniappRuntimeStore.state;
    const appA = state.apps.get('app-a');
    const appB = state.apps.get('app-b');

    expect(appA?.state).toBe('active');
    expect(appA?.flow).toBe('foregrounding');
    expect(appB?.state).toBe('background');
    expect(appB?.flow).toBe('backgrounding');

    expect(state.activeAppId).toBe('app-a');
    expect(state.focusedAppId).toBe('app-a');

    expect(state.presentations.get('app-a')?.zOrder).toBe(4);
    expect(state.presentations.get('app-b')?.zOrder).toBe(3);
    expect(state.zOrderSeed).toBe(4);

    expect(appAHandle.moveToForeground).toHaveBeenCalledTimes(1);
    expect(appBHandle.moveToBackground).toHaveBeenCalledTimes(1);
  });
});
