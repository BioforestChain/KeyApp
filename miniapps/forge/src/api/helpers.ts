/**
 * Recharge Helper Functions
 * Based on @bnqkl/cotcore helper.js
 */

import type { RechargeV2ToTrInfoData } from './types'

/**
 * Encode timestamp message for signing
 */
export function encodeTimestampMessage(params: { timestamp: number }): string {
  return JSON.stringify({ timestamp: params.timestamp })
}

/**
 * Encode recharge V2 message for signing
 * This is the message that needs to be signed by the internal chain account
 */
export function encodeRechargeV2ToTrInfoData(params: {
  chainName: string
  address: string
  timestamp: number
}): string {
  return JSON.stringify({
    chainName: params.chainName,
    address: params.address,
    timestamp: params.timestamp,
  })
}

/**
 * Create RechargeV2ToTrInfoData from params
 */
export function createRechargeMessage(params: {
  chainName: string
  address: string
  assetType: string
}): RechargeV2ToTrInfoData {
  return {
    chainName: params.chainName as RechargeV2ToTrInfoData['chainName'],
    address: params.address,
    assetType: params.assetType,
    timestamp: Date.now(),
  }
}
