/**
 * Transaction 服务 - Web 平台实现
 * TODO: 实现真实的 API 调用
 */

import { transactionServiceMeta } from './types'

export const transactionService = transactionServiceMeta.impl({
  async getHistory() {
    throw new Error('TransactionService.getHistory not implemented')
  },

  async getTransaction() {
    throw new Error('TransactionService.getTransaction not implemented')
  },

  async refresh() {
    throw new Error('TransactionService.refresh not implemented')
  },
})
