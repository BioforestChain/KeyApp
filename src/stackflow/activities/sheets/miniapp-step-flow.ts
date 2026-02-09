export type MiniappTransferFlowStep = 'review' | 'wallet_lock' | 'two_step_secret' | 'broadcasting';

export type MiniappSignFlowStep = 'review' | 'wallet_lock' | 'two_step_secret' | 'signing';

export interface MiniappFlowProgress {
  currentStep: number;
  totalSteps: number;
  percent: number;
}

const MINIAPP_TRANSFER_FLOW_WITHOUT_TWO_STEP: readonly MiniappTransferFlowStep[] = [
  'review',
  'wallet_lock',
  'broadcasting',
];

const MINIAPP_TRANSFER_FLOW_WITH_TWO_STEP: readonly MiniappTransferFlowStep[] = [
  'review',
  'wallet_lock',
  'two_step_secret',
  'broadcasting',
];

const MINIAPP_SIGN_FLOW_WITHOUT_TWO_STEP: readonly MiniappSignFlowStep[] = [
  'review',
  'wallet_lock',
  'signing',
];

const MINIAPP_SIGN_FLOW_WITH_TWO_STEP: readonly MiniappSignFlowStep[] = [
  'review',
  'wallet_lock',
  'two_step_secret',
  'signing',
];

function createFlowProgress(totalSteps: number, currentStep: number): MiniappFlowProgress {
  const safeTotalSteps = Math.max(1, totalSteps);
  const safeCurrentStep = Math.min(Math.max(currentStep, 1), safeTotalSteps);
  return {
    currentStep: safeCurrentStep,
    totalSteps: safeTotalSteps,
    percent: Math.round((safeCurrentStep / safeTotalSteps) * 100),
  };
}

export function deriveMiniappTransferFlowSteps(requiresTwoStepSecret: boolean): readonly MiniappTransferFlowStep[] {
  return requiresTwoStepSecret ? MINIAPP_TRANSFER_FLOW_WITH_TWO_STEP : MINIAPP_TRANSFER_FLOW_WITHOUT_TWO_STEP;
}

export function deriveMiniappSignFlowSteps(requiresTwoStepSecret: boolean): readonly MiniappSignFlowStep[] {
  return requiresTwoStepSecret ? MINIAPP_SIGN_FLOW_WITH_TWO_STEP : MINIAPP_SIGN_FLOW_WITHOUT_TWO_STEP;
}

export function deriveMiniappFlowProgress<TStep extends string>(
  flowSteps: readonly TStep[],
  currentStep: TStep,
): MiniappFlowProgress {
  const index = flowSteps.indexOf(currentStep);
  if (index < 0) {
    return createFlowProgress(flowSteps.length, 1);
  }
  return createFlowProgress(flowSteps.length, index + 1);
}

