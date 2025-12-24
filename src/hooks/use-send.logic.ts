import type { AssetInfo } from '@/types/asset'
import { Amount } from '@/types/amount'
import { isValidBioforestAddress } from '@/lib/crypto'
import { isValidAddress } from '@/components/transfer/address-input'

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

export function validateAmountInput(amount: Amount | null, asset: AssetInfo | null): string | null {
  if (!amount) return '请输入金额'
  if (!asset) return null

  if (!amount.isPositive()) return '请输入有效金额'
  if (amount.gt(asset.amount)) return '余额不足'

  return null
}

export function canProceedToConfirm(options: {
  toAddress: string
  amount: Amount | null
  asset: AssetInfo | null
  isBioforestChain: boolean
  feeLoading?: boolean
}): boolean {
  const { toAddress, amount, asset, isBioforestChain, feeLoading } = options
  if (!asset || !amount || feeLoading) return false

  return (
    toAddress.trim() !== '' &&
    isValidRecipientAddress(toAddress, isBioforestChain) &&
    amount.isPositive() &&
    amount.lte(asset.amount)
  )
}

export type FeeAdjustResult =
  | { status: 'ok'; adjustedAmount?: Amount }
  | { status: 'error'; message: string }

export function adjustAmountForFee(
  amount: Amount | null,
  asset: AssetInfo,
  fee: Amount
): FeeAdjustResult {
  if (!amount) return { status: 'error', message: '请输入有效金额' }

  const balance = asset.amount

  if (amount.add(fee).lte(balance)) return { status: 'ok' }
  if (!amount.eq(balance)) return { status: 'error', message: '余额不足' }

  const maxSendable = balance.sub(fee)
  if (!maxSendable.isPositive()) return { status: 'error', message: '余额不足' }

  return {
    status: 'ok',
    adjustedAmount: maxSendable,
  }
}
