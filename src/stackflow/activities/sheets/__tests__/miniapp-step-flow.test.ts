import { describe, expect, it } from 'vitest';
import {
  deriveMiniappFlowProgress,
  deriveMiniappSignFlowSteps,
  deriveMiniappTransferFlowSteps,
} from '../miniapp-step-flow';

describe('miniapp-step-flow', () => {
  it('derives transfer flow without two-step secret', () => {
    expect(deriveMiniappTransferFlowSteps(false)).toEqual(['review', 'wallet_lock', 'broadcasting']);
  });

  it('derives transfer flow with two-step secret', () => {
    expect(deriveMiniappTransferFlowSteps(true)).toEqual(['review', 'wallet_lock', 'two_step_secret', 'broadcasting']);
  });

  it('derives sign flow without two-step secret', () => {
    expect(deriveMiniappSignFlowSteps(false)).toEqual(['review', 'wallet_lock', 'signing']);
  });

  it('derives sign flow with two-step secret', () => {
    expect(deriveMiniappSignFlowSteps(true)).toEqual(['review', 'wallet_lock', 'two_step_secret', 'signing']);
  });

  it('derives progress percent and current step', () => {
    const flow = deriveMiniappTransferFlowSteps(true);
    expect(deriveMiniappFlowProgress(flow, 'review')).toEqual({
      currentStep: 1,
      totalSteps: 4,
      percent: 25,
    });
    expect(deriveMiniappFlowProgress(flow, 'two_step_secret')).toEqual({
      currentStep: 3,
      totalSteps: 4,
      percent: 75,
    });
  });
});

