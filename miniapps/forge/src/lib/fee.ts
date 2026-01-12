/**
 * Fee calculation utilities for redemption
 * 赎回手续费计算
 */

import type { RedemptionConfig, ExternalChainName } from '@/api/types'

export interface RedemptionFeeResult {
  /** 固定手续费 (内链最小单位) */
  fixedFee: bigint
  /** 比例手续费 (内链最小单位) */
  ratioFee: bigint
  /** 总手续费 */
  totalFee: bigint
  /** 预计到账金额 (内链最小单位) */
  receivable: bigint
  /** 是否有效 (receivable > 0) */
  isValid: boolean
}

/**
 * Calculate redemption fees
 * @param amount - 赎回金额 (内链最小单位)
 * @param chain - 目标外链
 * @param config - 赎回配置
 */
export function calculateRedemptionFee(
  amount: string | bigint,
  chain: ExternalChainName,
  config: RedemptionConfig
): RedemptionFeeResult {
  const amountBigInt = typeof amount === 'string' ? BigInt(amount || '0') : amount
  
  // Fixed fee for the target chain
  const fixedFee = BigInt(config.fee[chain] || '0')
  
  // Ratio fee (radioFee is a decimal string like "0.001" = 0.1%)
  const ratio = parseFloat(config.radioFee || '0')
  const ratioFee = BigInt(Math.floor(Number(amountBigInt) * ratio))
  
  // Total fee
  const totalFee = fixedFee + ratioFee
  
  // Receivable amount
  const receivable = amountBigInt > totalFee ? amountBigInt - totalFee : BigInt(0)
  
  return {
    fixedFee,
    ratioFee,
    totalFee,
    receivable,
    isValid: receivable > BigInt(0),
  }
}

/**
 * Format amount from internal units to display units
 * @param amount - Amount in internal units (bigint or string)
 * @param decimals - Number of decimals (default: 8 for BioChain)
 */
export function formatAmount(amount: string | bigint, decimals = 8): string {
  const amountBigInt = typeof amount === 'string' ? BigInt(amount || '0') : amount
  const divisor = BigInt(10 ** decimals)
  const integerPart = amountBigInt / divisor
  const fractionalPart = amountBigInt % divisor
  
  if (fractionalPart === BigInt(0)) {
    return integerPart.toString()
  }
  
  const fractionalStr = fractionalPart.toString().padStart(decimals, '0').replace(/0+$/, '')
  return `${integerPart}.${fractionalStr}`
}

/**
 * Parse display amount to internal units
 * @param displayAmount - Amount in display format (e.g., "100.5")
 * @param decimals - Number of decimals (default: 8 for BioChain)
 */
export function parseAmount(displayAmount: string, decimals = 8): bigint {
  if (!displayAmount || displayAmount === '') return BigInt(0)
  
  const [integerPart, fractionalPart = ''] = displayAmount.split('.')
  const paddedFractional = fractionalPart.padEnd(decimals, '0').slice(0, decimals)
  
  return BigInt(integerPart + paddedFractional)
}

/**
 * Check if amount is within redemption limits
 */
export function isAmountWithinLimits(
  amount: string | bigint,
  config: RedemptionConfig
): { valid: boolean; reason?: 'below_min' | 'above_max' } {
  const amountBigInt = typeof amount === 'string' ? BigInt(amount || '0') : amount
  const min = BigInt(config.min || '0')
  const max = BigInt(config.max || '0')
  
  if (amountBigInt < min) {
    return { valid: false, reason: 'below_min' }
  }
  
  if (max > BigInt(0) && amountBigInt > max) {
    return { valid: false, reason: 'above_max' }
  }
  
  return { valid: true }
}
