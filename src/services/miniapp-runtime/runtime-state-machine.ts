import type { MiniappTargetDesktop } from '../ecosystem/types';
import type {
  MiniappFlow,
  MiniappProcessStatus,
  MiniappReadinessState,
  MiniappRuntimeState,
  MiniappState,
} from './types';

export type RuntimeStateDomCommand = {
  type: 'slot:interactive';
  desktop: MiniappTargetDesktop;
  appId: string;
  interactive: boolean;
};

export type RuntimeStateTransitionResult = {
  nextState: MiniappRuntimeState;
  changed: boolean;
  domCommand: RuntimeStateDomCommand | null;
};

/**
 * 根据状态变化推导 flow（包含方向性）
 */
export function fsmDeriveFlow(prevState: MiniappState | null, nextState: MiniappState): MiniappFlow {
  if (!prevState || prevState === 'preparing') {
    if (nextState === 'launching') return 'opening';
    if (nextState === 'splash') return 'splash';
    if (nextState === 'active') return 'opened';
  }

  if (prevState === 'launching' && nextState === 'splash') return 'splash';

  if ((prevState === 'launching' || prevState === 'splash') && nextState === 'active') return 'opened';

  if (prevState === 'active' && nextState === 'background') return 'backgrounding';

  if (prevState === 'background' && nextState === 'active') return 'foregrounding';

  if (nextState === 'closing') return 'closing';

  if (nextState === 'preparing') return 'closed';
  if (nextState === 'launching') return 'opening';
  if (nextState === 'splash') return 'splash';
  if (nextState === 'active') return 'opened';
  if (nextState === 'background') return 'backgrounded';

  return 'closed';
}

function fsmResolveDesktop(state: MiniappRuntimeState, appId: string): MiniappTargetDesktop {
  const presentation = state.presentations.get(appId);
  const app = state.apps.get(appId);
  return presentation?.desktop ?? app?.manifest.targetDesktop ?? 'stack';
}

/**
 * 纯状态机：推进 app.state/flow，并输出 DOM 绑定命令（不直接操作 DOM）
 */
export function fsmTransitionAppState(
  state: MiniappRuntimeState,
  appId: string,
  nextAppState: MiniappState,
): RuntimeStateTransitionResult {
  const app = state.apps.get(appId);
  if (!app) {
    return { nextState: state, changed: false, domCommand: null };
  }

  const nextFlow = fsmDeriveFlow(app.state, nextAppState);
  const nextApps = new Map(state.apps);
  nextApps.set(appId, { ...app, state: nextAppState, flow: nextFlow });

  const nextState: MiniappRuntimeState = { ...state, apps: nextApps };
  const domCommand: RuntimeStateDomCommand = {
    type: 'slot:interactive',
    desktop: fsmResolveDesktop(state, appId),
    appId,
    interactive: nextAppState === 'active',
  };

  return { nextState, changed: true, domCommand };
}

/**
 * 纯状态机：更新 processStatus
 */
export function fsmTransitionProcessStatus(
  state: MiniappRuntimeState,
  appId: string,
  processStatus: MiniappProcessStatus,
): MiniappRuntimeState {
  const app = state.apps.get(appId);
  if (!app) return state;
  if (app.processStatus === processStatus) return state;

  const nextApps = new Map(state.apps);
  nextApps.set(appId, { ...app, processStatus });
  return { ...state, apps: nextApps };
}

/**
 * 纯状态机：更新 readiness
 */
export function fsmTransitionReadiness(
  state: MiniappRuntimeState,
  appId: string,
  readiness: MiniappReadinessState,
): MiniappRuntimeState {
  const app = state.apps.get(appId);
  if (!app) return state;
  if (app.readiness === readiness) return state;

  const nextApps = new Map(state.apps);
  nextApps.set(appId, { ...app, readiness });
  return { ...state, apps: nextApps };
}




/**
 * 纯状态机：将 allAppIds 按目标前台集合拆分为交集/差集
 */
export function fsmPartitionForegroundAppIds(
  allAppIds: readonly string[],
  targetForegroundAppIds: readonly string[],
): {
  foregroundAppIds: string[];
  backgroundAppIds: string[];
} {
  const targetSet = new Set(targetForegroundAppIds);
  const foregroundAppIds: string[] = [];
  const backgroundAppIds: string[] = [];

  allAppIds.forEach((appId) => {
    if (targetSet.has(appId)) {
      foregroundAppIds.push(appId);
    } else {
      backgroundAppIds.push(appId);
    }
  });

  return { foregroundAppIds, backgroundAppIds };
}
