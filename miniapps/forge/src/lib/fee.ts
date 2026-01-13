/**
 * Fee calculation utilities for redemption
 * 赎回手续费计算
 */

import Big from 'big.js'
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
 * Calculate redemption fees using big.js for precision
 * @param amount - 赎回金额 (内链最小单位)
 * @param chain - 目标外链
 * @param config - 赎回配置
 */
export function calculateRedemptionFee(
  amount: string | bigint,
  chain: ExternalChainName,
  config: RedemptionConfig
): RedemptionFeeResult {
  const amountBig = new Big(amount.toString())
  
  // Fixed fee for the target chain
  const fixedFeeBig = new Big(config.fee[chain] || '0')
  
  // Ratio fee (radioFee is a decimal string like "0.001" = 0.1%)
  const ratioBig = new Big(config.radioFee || '0')
  const ratioFeeBig = amountBig.times(ratioBig).round(0, Big.roundDown)
  
  // Total fee
  const totalFeeBig = fixedFeeBig.plus(ratioFeeBig)
  
  // Receivable amount
  const receivableBig = amountBig.gt(totalFeeBig) 
    ? amountBig.minus(totalFeeBig) 
    : new Big(0)
  
  return {
    fixedFee: BigInt(fixedFeeBig.toFixed(0)),
    ratioFee: BigInt(ratioFeeBig.toFixed(0)),
    totalFee: BigInt(totalFeeBig.toFixed(0)),
    receivable: BigInt(receivableBig.toFixed(0)),
    isValid: receivableBig.gt(0),
  }
}

/**
 * Format amount from internal units to display units
 * @param amount - Amount in internal units (bigint or string)
 * @param decimals - Number of decimals (default: 8 for BioChain)
 */
export function formatAmount(amount: string | bigint, decimals = 8): string {
  const amountBig = new Big(amount.toString())
  const divisor = new Big(10).pow(decimals)
  const formatted = amountBig.div(divisor)
  
  // Remove trailing zeros
  const fixed = formatted.toFixed(decimals)
  return fixed.replace(/\.?0+$/, '') || '0'
}

/**
 * Parse display amount to internal units
 * @param displayAmount - Amount in display format (e.g., "100.5")
 * @param decimals - Number of decimals (default: 8 for BioChain)
 */
export function parseAmount(displayAmount: string, decimals = 8): bigint {
  if (!displayAmount || displayAmount === '') return BigInt(0)
  
  try {
    const parsed = new Big(displayAmount)
    const multiplier = new Big(10).pow(decimals)
    const raw = parsed.times(multiplier).round(0, Big.roundDown)
    return BigInt(raw.toFixed(0))
  } catch {
    return BigInt(0)
  }
}

/**
 * Check if amount is within redemption limits
 */
export function isAmountWithinLimits(
  amount: string | bigint,
  config: RedemptionConfig
): { valid: boolean; reason?: 'below_min' | 'above_max' } {
  const amountBig = new Big(amount.toString())
  const min = new Big(config.min || '0')
  const max = new Big(config.max || '0')
  
  if (amountBig.lt(min)) {
    return { valid: false, reason: 'below_min' }
  }
  
  if (max.gt(0) && amountBig.gt(max)) {
    return { valid: false, reason: 'above_max' }
  }
  
  return { valid: true }
}
