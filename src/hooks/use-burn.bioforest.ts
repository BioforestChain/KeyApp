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
import { BroadcastError, translateBroadcastError } from '@/services/bioforest-sdk/errors'
import { pendingTxService } from '@/services/transaction'

export interface BioforestBurnFeeResult {
  amount: Amount
  symbol: string
}

function getBioforestApiUrl(chainConfig: ChainConfig): string | null {
  const biowallet = chainConfig.apis?.find((p) => p.type === 'biowallet-v1')
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

    return {
      amount: Amount.fromRaw('1000', chainConfig.decimals, chainConfig.symbol),
      symbol: chainConfig.symbol,
    }
  }
}

export type SubmitBioforestBurnResult =
  | { status: 'ok'; txHash: string; pendingTxId: string }
  | { status: 'password' }
  | { status: 'password_required'; secondPublicKey: string }
  | { status: 'error'; message: string; pendingTxId?: string }

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


    // Check if pay password is required but not provided
    const addressInfo = await getAddressInfo(apiUrl, fromAddress)


    if (addressInfo.secondPublicKey && !twoStepSecret) {

      return {
        status: 'password_required',
        secondPublicKey: addressInfo.secondPublicKey,
      }
    }

    // Verify pay password if provided
    if (twoStepSecret && addressInfo.secondPublicKey) {

      const isValid = await verifyTwoStepSecret(chainConfig.id, secret, twoStepSecret, addressInfo.secondPublicKey)

      if (!isValid) {
        return { status: 'error', message: '安全密码验证失败' }
      }
    }

    // Create destroy transaction using SDK

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


    // 存储到 pendingTxService（转换为 ChainProvider 标准格式）
    const pendingTx = await pendingTxService.create({
      walletId,
      chainId: chainConfig.id,
      fromAddress,
      rawTx: {
        chainId: chainConfig.id,
        data: transaction, // SDK 交易数据
        signature: transaction.signature,
      },
      meta: {
        type: 'destroy',
        displayAmount: amount.toFormatted(),
        displaySymbol: assetType,
        displayToAddress: recipientAddress,
      },
    })

    // Broadcast transaction

    await pendingTxService.updateStatus({ id: pendingTx.id, status: 'broadcasting' })

    try {
      const broadcastResult = await broadcastTransaction(apiUrl, transaction)


      // 如果交易已存在于链上，直接标记为 confirmed
      const newStatus = broadcastResult.alreadyExists ? 'confirmed' : 'broadcasted'
      await pendingTxService.updateStatus({
        id: pendingTx.id,
        status: newStatus,
        txHash,
      })
      return { status: 'ok', txHash, pendingTxId: pendingTx.id }
    } catch (err) {

      if (err instanceof BroadcastError) {
        await pendingTxService.updateStatus({
          id: pendingTx.id,
          status: 'failed',
          errorCode: err.code,
          errorMessage: translateBroadcastError(err),
        })
        return { status: 'error', message: translateBroadcastError(err), pendingTxId: pendingTx.id }
      }
      throw err
    }
  } catch (error) {


    // Handle BroadcastError
    if (error instanceof BroadcastError) {
      return { status: 'error', message: translateBroadcastError(error) }
    }

    const errorMessage = error instanceof Error ? error.message : String(error)

    return {
      status: 'error',
      message: errorMessage || '销毁失败，请稍后重试',
    }
  }
}
