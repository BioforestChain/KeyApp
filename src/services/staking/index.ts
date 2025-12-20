/**
 * Staking 服务
 *
 * 通过 Vite alias 在编译时选择实现：
 * - web: Web 平台
 * - dweb: DWEB 平台
 * - mock: Mock 实现
 */

export type {
  IStakingService,
  IStakingMockController,
  RechargeConfig,
  StakingTransaction,
  StakingOverviewItem,
  MintRequest,
  BurnRequest,
  LogoUrlMap,
} from './types'
export { stakingServiceMeta } from './types'
export { stakingService } from '#staking-impl'
