import type { AssetInfo } from '@/types/asset'
import { formatAssetAmount } from '@/types/asset'
import { isValidBioforestAddress } from '@/lib/crypto'
import { isValidAddress } from '@/components/transfer/address-input'
import { parseAmountToBigInt } from './use-send.utils'

export function isValidRecipientAddress(address: string, isBioforestChain: boolean): boolean {
  if (!address.trim()) return false
  if (isBioforestChain) return isValidBioforestAddress(address)
  return isValidAddress(address)
}

export function validateAddressInput(address: string, isBioforestChain: boolean): string | null {
  if (!address.trim()) return '请输入收款地址'
  if (!isValidRecipientAddress(address, isBioforestChain)) return '无效的地址格式'
  return null
}

export function validateAmountInput(amount: string, asset: AssetInfo | null): string | null {
  if (!amount.trim()) return '请输入金额'
  if (!asset) return null
  const rawAmount = parseAmountToBigInt(amount, asset.decimals)
  if (rawAmount === null || rawAmount <= 0n) return '请输入有效金额'
  const balance = BigInt(asset.amount)
  if (rawAmount > balance) return '余额不足'
  return null
}

export function canProceedToConfirm(options: {
  toAddress: string
  amount: string
  asset: AssetInfo | null
  isBioforestChain: boolean
}): boolean {
  const { toAddress, amount, asset, isBioforestChain } = options
  if (!asset) return false
  const rawAmount = parseAmountToBigInt(amount, asset.decimals)
  const balance = BigInt(asset.amount)
  return (
    toAddress.trim() !== '' &&
    amount.trim() !== '' &&
    isValidRecipientAddress(toAddress, isBioforestChain) &&
    rawAmount !== null &&
    rawAmount > 0n &&
    rawAmount <= balance
  )
}

export type FeeAdjustResult =
  | { status: 'ok'; adjustedAmount?: string }
  | { status: 'error'; message: string }

export function adjustAmountForFee(amount: string, asset: AssetInfo, feeAmountRaw: string): FeeAdjustResult {
  const rawAmount = parseAmountToBigInt(amount, asset.decimals)
  if (rawAmount === null) return { status: 'error', message: '请输入有效金额' }

  const balance = BigInt(asset.amount)
  const feeRaw = BigInt(feeAmountRaw || '0')

  if (rawAmount + feeRaw <= balance) return { status: 'ok' }
  if (rawAmount !== balance) return { status: 'error', message: '余额不足' }

  const maxSendable = balance - feeRaw
  if (maxSendable <= 0n) return { status: 'error', message: '余额不足' }

  return {
    status: 'ok',
    adjustedAmount: formatAssetAmount(maxSendable.toString(), asset.decimals),
  }
}
