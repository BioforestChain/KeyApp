/**
 * Hooks Module Exports
 */

// Recharge (充值)
export { useRechargeConfig, type ForgeOption, type RechargeConfigState } from './useRechargeConfig'
export { useForge, type ForgeParams, type ForgeState, type ForgeStep } from './useForge'
export { useContractPool, type ContractPoolState } from './useContractPool'
export {
  useRechargeRecords,
  useRechargeRecordDetail,
  type RechargeRecordsState,
  type FetchRecordsParams,
  type RecordDetailState,
} from './useRechargeRecords'

// Redemption (赎回)
export {
  useRedemption,
  type RedemptionParams,
  type RedemptionState,
  type RedemptionStep,
} from './useRedemption'
export {
  useRedemptionRecords,
  useRedemptionRecordDetail,
  type RedemptionRecordsState,
  type FetchRedemptionRecordsParams,
  type RedemptionRecordDetailState,
} from './useRedemptionRecords'
