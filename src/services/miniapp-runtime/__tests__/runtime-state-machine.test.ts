import { describe, expect, it } from 'vitest';
import { DEFAULT_MINIAPP_VISUAL_CONFIG } from '../visual-config';
import {
  fsmDeriveFlow,
  fsmPartitionForegroundAppIds,
  fsmTransitionAppState,
  fsmTransitionProcessStatus,
  fsmTransitionReadiness,
} from '../runtime-state-machine';
import type { MiniappRuntimeState, MiniappInstance, MiniappState } from '../types';

function createApp(appState: MiniappState): MiniappInstance {
  return {
    appId: 'demo-app',
    manifest: {
      id: 'demo-app',
      name: 'Demo App',
      description: 'Demo',
      icon: '/demo.png',
      url: 'https://example.com',
      version: '1.0.0',
      targetDesktop: 'mine',
    },
    state: appState,
    flow: 'closed',
    ctx: { capsuleTheme: 'auto' },
    processStatus: 'loading',
    readiness: 'notReady',
    launchedAt: 0,
    lastActiveAt: 0,
    containerType: 'iframe',
    containerHandle: null,
    iframeRef: null,
    iconRef: null,
  };
}

function createRuntimeState(appState: MiniappState): MiniappRuntimeState {
  const app = createApp(appState);
  return {
    apps: new Map([[app.appId, app]]),
    visualConfig: DEFAULT_MINIAPP_VISUAL_CONFIG,
    activeAppId: null,
    focusedAppId: null,
    presentations: new Map([
      [
        app.appId,
        {
          appId: app.appId,
          desktop: 'mine',
          state: 'presented',
          zOrder: 1,
          transitionId: null,
          transitionKind: null,
        },
      ],
    ]),
    zOrderSeed: 1,
    isStackViewOpen: false,
    maxBackgroundApps: 4,
  };
}

describe('runtime-state-machine', () => {
  it('fsmDeriveFlow should map active -> background to backgrounding', () => {
    expect(fsmDeriveFlow('active', 'background')).toBe('backgrounding');
  });

  it('fsmTransitionAppState should return dom command and updated flow', () => {
    const runtimeState = createRuntimeState('background');

    const transition = fsmTransitionAppState(runtimeState, 'demo-app', 'active');

    expect(transition.changed).toBe(true);
    expect(transition.domCommand).toEqual({
      type: 'slot:interactive',
      desktop: 'mine',
      appId: 'demo-app',
      interactive: true,
    });

    const updatedApp = transition.nextState.apps.get('demo-app');
    expect(updatedApp?.state).toBe('active');
    expect(updatedApp?.flow).toBe('foregrounding');
  });

  it('fsmTransitionProcessStatus and fsmTransitionReadiness should be pure and idempotent', () => {
    const runtimeState = createRuntimeState('launching');

    const nextStatusState = fsmTransitionProcessStatus(runtimeState, 'demo-app', 'loaded');
    expect(nextStatusState).not.toBe(runtimeState);
    expect(nextStatusState.apps.get('demo-app')?.processStatus).toBe('loaded');

    const idempotentStatusState = fsmTransitionProcessStatus(nextStatusState, 'demo-app', 'loaded');
    expect(idempotentStatusState).toBe(nextStatusState);

    const nextReadyState = fsmTransitionReadiness(nextStatusState, 'demo-app', 'ready');
    expect(nextReadyState).not.toBe(nextStatusState);
    expect(nextReadyState.apps.get('demo-app')?.readiness).toBe('ready');

    const idempotentReadyState = fsmTransitionReadiness(nextReadyState, 'demo-app', 'ready');
    expect(idempotentReadyState).toBe(nextReadyState);
  });

  it('fsmTransitionAppState should return unchanged state when app missing', () => {
    const runtimeState = createRuntimeState('active');

    const transition = fsmTransitionAppState(runtimeState, 'missing-app', 'background');

    expect(transition.changed).toBe(false);
    expect(transition.nextState).toBe(runtimeState);
    expect(transition.domCommand).toBeNull();
  });


  it('fsmPartitionForegroundAppIds should split by intersection and difference', () => {
    const allAppIds = ['app-a', 'app-b', 'app-c'];
    const targetForegroundIds = ['app-b'];

    const result = fsmPartitionForegroundAppIds(allAppIds, targetForegroundIds);

    expect(result.foregroundAppIds).toEqual(['app-b']);
    expect(result.backgroundAppIds).toEqual(['app-a', 'app-c']);
  });
});
