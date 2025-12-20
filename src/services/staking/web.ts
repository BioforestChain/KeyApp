/**
 * Staking 服务 - Web 平台实现
 * TODO: 实现真实的 API 调用
 */

import { stakingServiceMeta } from './types'

export const stakingService = stakingServiceMeta.impl({
  async getRechargeConfig() {
    throw new Error('StakingService.getRechargeConfig not implemented')
  },

  async getLogoUrls() {
    throw new Error('StakingService.getLogoUrls not implemented')
  },

  async getOverview() {
    throw new Error('StakingService.getOverview not implemented')
  },

  async getTransactions() {
    throw new Error('StakingService.getTransactions not implemented')
  },

  async getTransaction() {
    throw new Error('StakingService.getTransaction not implemented')
  },

  async submitMint() {
    throw new Error('StakingService.submitMint not implemented')
  },

  async submitBurn() {
    throw new Error('StakingService.submitBurn not implemented')
  },
})
