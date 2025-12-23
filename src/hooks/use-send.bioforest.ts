import type { AssetInfo } from '@/types/asset'
import type { ChainConfig } from '@/services/chain-config'
import { Amount } from '@/types/amount'
import { walletStorageService, WalletStorageError, WalletStorageErrorCode } from '@/services/wallet-storage'
import { createBioforestAdapter } from '@/services/chain-adapter'
import {
  createTransferTransaction,
  broadcastTransaction,
  getAddressInfo,
  verifyPayPassword,
  setPayPassword,
  getSignatureTransactionMinFee,
} from '@/services/bioforest-sdk'

export interface BioforestFeeResult {
  amount: Amount
  symbol: string
}

export async function fetchBioforestFee(chainConfig: ChainConfig, fromAddress: string): Promise<BioforestFeeResult> {
  const adapter = createBioforestAdapter(chainConfig)
  const feeEstimate = await adapter.transaction.estimateFee({
    from: fromAddress,
    to: fromAddress,
    amount: Amount.zero(chainConfig.decimals, chainConfig.symbol),
  })

  return {
    amount: feeEstimate.standard.amount,
    symbol: chainConfig.symbol,
  }
}

export async function fetchBioforestBalance(chainConfig: ChainConfig, fromAddress: string): Promise<AssetInfo> {
  const adapter = createBioforestAdapter(chainConfig)
  const balance = await adapter.asset.getNativeBalance(fromAddress)

  return {
    assetType: balance.symbol,
    name: chainConfig.name,
    amount: balance.amount,
    decimals: balance.amount.decimals,
  }
}

export type SubmitBioforestResult =
  | { status: 'ok'; txHash: string }
  | { status: 'password' }
  | { status: 'password_required'; secondPublicKey: string }
  | { status: 'error'; message: string }

export interface SubmitBioforestParams {
  chainConfig: ChainConfig
  walletId: string
  password: string
  fromAddress: string
  toAddress: string
  amount: Amount
  payPassword?: string
}

/**
 * Check if address has pay password set
 */
export async function checkPayPasswordRequired(
  chainConfig: ChainConfig,
  address: string,
): Promise<{ required: boolean; secondPublicKey?: string }> {
  if (!chainConfig.rpcUrl) {
    return { required: false }
  }

  try {
    const info = await getAddressInfo(chainConfig.rpcUrl, chainConfig.id, address)
    if (info.secondPublicKey) {
      return { required: true, secondPublicKey: info.secondPublicKey }
    }
  } catch {
    // If we can't check, assume not required
  }

  return { required: false }
}

/**
 * Verify pay password for an address
 */
export async function verifyBioforestPayPassword(
  walletId: string,
  password: string,
  payPassword: string,
  secondPublicKey: string,
): Promise<boolean> {
  try {
    const secret = await walletStorageService.getMnemonic(walletId, password)
    const result = await verifyPayPassword(secret, payPassword, secondPublicKey)
    return result !== false
  } catch {
    return false
  }
}

export async function submitBioforestTransfer({
  chainConfig,
  walletId,
  password,
  fromAddress,
  toAddress,
  amount,
  payPassword,
}: SubmitBioforestParams): Promise<SubmitBioforestResult> {
  // Get mnemonic from wallet storage
  let secret: string
  try {
    secret = await walletStorageService.getMnemonic(walletId, password)
  } catch (error) {
    if (error instanceof WalletStorageError && error.code === WalletStorageErrorCode.DECRYPTION_FAILED) {
      return { status: 'password' }
    }
    return {
      status: 'error',
      message: error instanceof Error ? error.message : '未知错误',
    }
  }

  if (!amount.isPositive()) {
    return { status: 'error', message: '请输入有效金额' }
  }

  const rpcUrl = chainConfig.rpcUrl
  if (!rpcUrl) {
    return { status: 'error', message: 'RPC URL 未配置' }
  }

  try {
    // Check if pay password is required but not provided
    const addressInfo = await getAddressInfo(rpcUrl, chainConfig.id, fromAddress)
    if (addressInfo.secondPublicKey && !payPassword) {
      return {
        status: 'password_required',
        secondPublicKey: addressInfo.secondPublicKey,
      }
    }

    // Verify pay password if provided
    if (payPassword && addressInfo.secondPublicKey) {
      const isValid = await verifyPayPassword(secret, payPassword, addressInfo.secondPublicKey)
      if (!isValid) {
        return { status: 'error', message: '支付密码验证失败' }
      }
    }

    // Create transaction using SDK
    console.log('[submitBioforestTransfer] Creating transaction with SDK...')
    const transaction = await createTransferTransaction({
      rpcUrl,
      chainId: chainConfig.id,
      mainSecret: secret,
      paySecret: payPassword,
      from: fromAddress,
      to: toAddress,
      amount: amount.toRawString(),
      assetType: chainConfig.symbol,
    })

    console.log('[submitBioforestTransfer] Broadcasting transaction...')
    const txHash = await broadcastTransaction(rpcUrl, chainConfig.id, transaction)

    console.log('[submitBioforestTransfer] Transaction broadcasted:', txHash)
    return { status: 'ok', txHash }
  } catch (error) {
    console.error('[submitBioforestTransfer] Transaction failed:', error)

    const errorMessage = error instanceof Error ? error.message : String(error)

    // Handle specific error cases
    if (errorMessage.includes('insufficient') || errorMessage.includes('余额不足')) {
      return { status: 'error', message: '余额不足' }
    }

    if (errorMessage.includes('fee') || errorMessage.includes('手续费')) {
      return { status: 'error', message: '手续费不足' }
    }

    return {
      status: 'error',
      message: errorMessage || '交易失败，请稍后重试',
    }
  }
}

export type SetPayPasswordResult =
  | { status: 'ok'; txHash: string }
  | { status: 'password' }
  | { status: 'already_set' }
  | { status: 'error'; message: string }

export interface SetPayPasswordParams {
  chainConfig: ChainConfig
  walletId: string
  password: string
  fromAddress: string
  newPayPassword: string
}

/**
 * Set pay password (二次签名) for an account
 */
export async function submitSetPayPassword({
  chainConfig,
  walletId,
  password,
  fromAddress,
  newPayPassword,
}: SetPayPasswordParams): Promise<SetPayPasswordResult> {
  // Get mnemonic from wallet storage
  let secret: string
  try {
    secret = await walletStorageService.getMnemonic(walletId, password)
  } catch (error) {
    if (error instanceof WalletStorageError && error.code === WalletStorageErrorCode.DECRYPTION_FAILED) {
      return { status: 'password' }
    }
    return {
      status: 'error',
      message: error instanceof Error ? error.message : '未知错误',
    }
  }

  const rpcUrl = chainConfig.rpcUrl
  if (!rpcUrl) {
    return { status: 'error', message: 'RPC URL 未配置' }
  }

  try {
    // Check if already has pay password
    const addressInfo = await getAddressInfo(rpcUrl, chainConfig.id, fromAddress)
    if (addressInfo.secondPublicKey) {
      return { status: 'already_set' }
    }

    // Set pay password
    console.log('[submitSetPayPassword] Creating signature transaction...')
    const result = await setPayPassword({
      rpcUrl,
      chainId: chainConfig.id,
      mainSecret: secret,
      newPaySecret: newPayPassword,
    })

    console.log('[submitSetPayPassword] Pay password set successfully:', result.txHash)
    return { status: 'ok', txHash: result.txHash }
  } catch (error) {
    console.error('[submitSetPayPassword] Failed to set pay password:', error)

    const errorMessage = error instanceof Error ? error.message : String(error)

    if (errorMessage.includes('fee') || errorMessage.includes('手续费')) {
      return { status: 'error', message: '余额不足以支付手续费' }
    }

    return {
      status: 'error',
      message: errorMessage || '设置支付密码失败，请稍后重试',
    }
  }
}

/**
 * Get the minimum fee for setting pay password
 */
export async function getSetPayPasswordFee(
  chainConfig: ChainConfig,
): Promise<{ amount: Amount; symbol: string } | null> {
  const rpcUrl = chainConfig.rpcUrl
  if (!rpcUrl) {
    return null
  }

  try {
    const feeRaw = await getSignatureTransactionMinFee(rpcUrl, chainConfig.id)
    return {
      amount: Amount.fromRaw(feeRaw, chainConfig.decimals, chainConfig.symbol),
      symbol: chainConfig.symbol,
    }
  } catch (error) {
    console.error('[getSetPayPasswordFee] Failed to get fee:', error)
    return null
  }
}

/**
 * Check if address has pay password set
 */
export async function hasPayPasswordSet(
  chainConfig: ChainConfig,
  address: string,
): Promise<boolean> {
  const rpcUrl = chainConfig.rpcUrl
  if (!rpcUrl) {
    return false
  }

  try {
    const info = await getAddressInfo(rpcUrl, chainConfig.id, address)
    return !!info.secondPublicKey
  } catch {
    return false
  }
}
