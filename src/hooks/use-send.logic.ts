import type { AssetInfo } from '@/types/asset'
import { Amount, amountFromAsset } from '@/types/amount'
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

export function validateAmountInput(amount: string, asset: AssetInfo | null): string | null {
  if (!amount.trim()) return '请输入金额'
  if (!asset) return null

  const inputAmount = Amount.tryFromFormatted(amount, asset.decimals)
  if (!inputAmount || !inputAmount.isPositive()) return '请输入有效金额'

  const balance = amountFromAsset(asset)
  if (inputAmount.gt(balance)) return '余额不足'

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

  const inputAmount = Amount.tryFromFormatted(amount, asset.decimals)
  if (!inputAmount) return false

  const balance = amountFromAsset(asset)

  return (
    toAddress.trim() !== '' &&
    amount.trim() !== '' &&
    isValidRecipientAddress(toAddress, isBioforestChain) &&
    inputAmount.isPositive() &&
    inputAmount.lte(balance)
  )
}

export type FeeAdjustResult =
  | { status: 'ok'; adjustedAmount?: string }
  | { status: 'error'; message: string }

export function adjustAmountForFee(
  amount: string,
  asset: AssetInfo,
  feeAmountRaw: string
): FeeAdjustResult {
  const inputAmount = Amount.tryFromFormatted(amount, asset.decimals)
  if (!inputAmount) return { status: 'error', message: '请输入有效金额' }

  const balance = amountFromAsset(asset)
  const fee = Amount.fromRaw(feeAmountRaw || '0', asset.decimals)

  if (inputAmount.add(fee).lte(balance)) return { status: 'ok' }
  if (!inputAmount.eq(balance)) return { status: 'error', message: '余额不足' }

  const maxSendable = balance.sub(fee)
  if (!maxSendable.isPositive()) return { status: 'error', message: '余额不足' }

  return {
    status: 'ok',
    adjustedAmount: maxSendable.toFormatted(),
  }
}
