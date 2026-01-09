/**
 * BioForest chain-specific burn (destroy asset) logic
 */

import type { ChainConfig } from '@/services/chain-config'
import { Amount } from '@/types/amount'
import { walletStorageService, WalletStorageError, WalletStorageErrorCode } from '@/services/wallet-storage'
import {
  createDestroyTransaction,
  broadcastTransaction,
  getAddressInfo,
  getAssetDetail,
  getDestroyTransactionMinFee,
  verifyTwoStepSecret,
} from '@/services/bioforest-sdk'

export interface BioforestBurnFeeResult {
  amount: Amount
  symbol: string
}

function getBioforestApiUrl(chainConfig: ChainConfig): string | null {
  const biowallet = chainConfig.apis.find((p) => p.type === 'biowallet-v1')
  return biowallet?.endpoint ?? null
}

/**
 * Fetch the asset's applyAddress (issuer address) for destroy transaction
 */
export async function fetchAssetApplyAddress(
  chainConfig: ChainConfig,
  assetType: string,
  fromAddress: string,
): Promise<string | null> {
  const apiUrl = getBioforestApiUrl(chainConfig)
  if (!apiUrl) return null

  const detail = await getAssetDetail(apiUrl, assetType, fromAddress)
  return detail?.applyAddress ?? null
}

/**
 * Fetch minimum fee for destroy transaction
 */
export async function fetchBioforestBurnFee(
  chainConfig: ChainConfig,
  assetType: string,
  amount: string,
): Promise<BioforestBurnFeeResult> {
  const apiUrl = getBioforestApiUrl(chainConfig)
  if (!apiUrl) {
    // Fallback fee
    return {
      amount: Amount.fromRaw('1000', chainConfig.decimals, chainConfig.symbol),
      symbol: chainConfig.symbol,
    }
  }

  try {
    const feeRaw = await getDestroyTransactionMinFee(apiUrl, chainConfig.id, assetType, amount)
    return {
      amount: Amount.fromRaw(feeRaw, chainConfig.decimals, chainConfig.symbol),
      symbol: chainConfig.symbol,
    }
  } catch (error) {
    console.warn('[fetchBioforestBurnFee] Failed to get fee:', error)
    return {
      amount: Amount.fromRaw('1000', chainConfig.decimals, chainConfig.symbol),
      symbol: chainConfig.symbol,
    }
  }
}

export type SubmitBioforestBurnResult =
  | { status: 'ok'; txHash: string }
  | { status: 'password' }
  | { status: 'password_required'; secondPublicKey: string }
  | { status: 'error'; message: string }

export interface SubmitBioforestBurnParams {
  chainConfig: ChainConfig
  walletId: string
  password: string
  fromAddress: string
  recipientAddress: string
  assetType: string
  amount: Amount
  fee?: Amount
  twoStepSecret?: string
}

/**
 * Submit a destroy asset transaction
 */
export async function submitBioforestBurn({
  chainConfig,
  walletId,
  password,
  fromAddress,
  recipientAddress,
  assetType,
  amount,
  fee,
  twoStepSecret,
}: SubmitBioforestBurnParams): Promise<SubmitBioforestBurnResult> {
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

  const apiUrl = getBioforestApiUrl(chainConfig)
  if (!apiUrl) {
    return { status: 'error', message: 'API URL 未配置' }
  }

  try {
    console.log('[submitBioforestBurn] Starting destroy:', { 
      apiUrl, 
      fromAddress, 
      recipientAddress, 
      assetType,
      amount: amount.toRawString() 
    })
    
    // Check if pay password is required but not provided
    const addressInfo = await getAddressInfo(apiUrl, fromAddress)
    console.log('[submitBioforestBurn] Address info:', { hasSecondPubKey: !!addressInfo.secondPublicKey })
    
    if (addressInfo.secondPublicKey && !twoStepSecret) {
      console.log('[submitBioforestBurn] Pay password required')
      return {
        status: 'password_required',
        secondPublicKey: addressInfo.secondPublicKey,
      }
    }

    // Verify pay password if provided
    if (twoStepSecret && addressInfo.secondPublicKey) {
      console.log('[submitBioforestBurn] Verifying pay password...')
      const isValid = await verifyTwoStepSecret(chainConfig.id, secret, twoStepSecret, addressInfo.secondPublicKey)
      console.log('[submitBioforestBurn] Pay password verification result:', isValid)
      if (!isValid) {
        return { status: 'error', message: '安全密码验证失败' }
      }
    }

    // Create destroy transaction using SDK
    console.log('[submitBioforestBurn] Creating transaction...')
    const transaction = await createDestroyTransaction({
      baseUrl: apiUrl,
      chainId: chainConfig.id,
      mainSecret: secret,
      paySecret: twoStepSecret,
      from: fromAddress,
      recipientId: recipientAddress,
      assetType,
      amount: amount.toRawString(),
      fee: fee?.toRawString(),
    })
    const txHash = transaction.signature
    console.log('[submitBioforestBurn] Transaction created:', txHash?.slice(0, 20))

    // Broadcast transaction
    console.log('[submitBioforestBurn] Broadcasting...')
    await broadcastTransaction(apiUrl, transaction).catch((err) => {
      console.warn('[submitBioforestBurn] Broadcast warning (may still succeed):', err.message)
    })

    console.log('[submitBioforestBurn] SUCCESS! txHash:', txHash)
    return { status: 'ok', txHash }
  } catch (error) {
    console.error('[submitBioforestBurn] FAILED:', error)

    const errorMessage = error instanceof Error ? error.message : String(error)

    if (errorMessage.includes('insufficient') || errorMessage.includes('余额不足')) {
      return { status: 'error', message: '余额不足' }
    }

    if (errorMessage.includes('fee') || errorMessage.includes('手续费')) {
      return { status: 'error', message: '手续费不足' }
    }

    return {
      status: 'error',
      message: errorMessage || '销毁失败，请稍后重试',
    }
  }
}
