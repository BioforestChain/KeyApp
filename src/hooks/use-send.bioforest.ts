import type { AssetInfo } from '@/types/asset'
import type { ChainConfig } from '@/services/chain-config'
import { Amount } from '@/types/amount'
import { walletStorageService, WalletStorageError, WalletStorageErrorCode } from '@/services/wallet-storage'
import { getChainProvider } from '@/services/chain-adapter/providers'
import {
  createTransferTransaction,
  broadcastTransaction,
  getAddressInfo,
  verifyTwoStepSecret,
  setTwoStepSecret,
  getSignatureTransactionMinFee,
} from '@/services/bioforest-sdk'
import { BroadcastError, translateBroadcastError } from '@/services/bioforest-sdk/errors'
import { pendingTxService } from '@/services/transaction'

export interface BioforestFeeResult {
  amount: Amount
  symbol: string
}

function getBioforestApiUrl(chainConfig: ChainConfig): string | null {
  const biowallet = chainConfig.apis?.find((p) => p.type === 'biowallet-v1')
  return biowallet?.endpoint ?? null
}

export async function fetchBioforestFee(chainConfig: ChainConfig, fromAddress: string): Promise<BioforestFeeResult> {
  const provider = getChainProvider(chainConfig.id)
  if (!provider.estimateFee || !provider.buildTransaction) {
    // Fallback to zero fee if provider doesn't support estimateFee
    return {
      amount: Amount.fromRaw('0', chainConfig.decimals, chainConfig.symbol),
      symbol: chainConfig.symbol,
    }
  }

  // 新流程：先构建交易，再估算手续费
  const unsignedTx = await provider.buildTransaction({
    type: 'transfer',
    from: fromAddress,
    to: fromAddress,
    // SDK requires amount > 0 for fee calculation, use 1 unit as placeholder
    amount: Amount.fromRaw('1', chainConfig.decimals, chainConfig.symbol),
  })

  const feeEstimate = await provider.estimateFee(unsignedTx)

  return {
    amount: feeEstimate.standard.amount,
    symbol: chainConfig.symbol,
  }
}

export async function fetchBioforestBalance(chainConfig: ChainConfig, fromAddress: string): Promise<AssetInfo> {
  const provider = getChainProvider(chainConfig.id)
  const balance = await provider.nativeBalance.fetch({ address: fromAddress })

  return {
    assetType: balance.symbol,
    name: chainConfig.name,
    amount: balance.amount,
    decimals: balance.amount.decimals,
  }
}

export type SubmitBioforestResult =
  | { status: 'ok'; txHash: string; pendingTxId: string }
  | { status: 'password' }
  | { status: 'password_required'; secondPublicKey: string }
  | { status: 'error'; message: string; pendingTxId?: string }

export interface SubmitBioforestParams {
  chainConfig: ChainConfig
  walletId: string
  password: string
  fromAddress: string
  toAddress: string
  amount: Amount
  assetType: string
  fee?: Amount
  twoStepSecret?: string
}

/**
 * Check if address has pay password set
 */
export async function checkTwoStepSecretRequired(
  chainConfig: ChainConfig,
  address: string,
): Promise<{ required: boolean; secondPublicKey?: string }> {
  const apiUrl = getBioforestApiUrl(chainConfig)
  if (!apiUrl) {
    return { required: false }
  }

  try {
    const info = await getAddressInfo(apiUrl, address)
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
export async function verifyBioforestTwoStepSecret(
  chainConfig: ChainConfig,
  walletId: string,
  password: string,
  twoStepSecret: string,
  secondPublicKey: string,
): Promise<boolean> {
  try {
    const secret = await walletStorageService.getMnemonic(walletId, password)
    const result = await verifyTwoStepSecret(chainConfig.id, secret, twoStepSecret, secondPublicKey)
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
  assetType,
  fee,
  twoStepSecret,
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

    // Create transaction using SDK

    const transaction = await createTransferTransaction({
      baseUrl: apiUrl,
      chainId: chainConfig.id,
      mainSecret: secret,
      paySecret: twoStepSecret,
      from: fromAddress,
      to: toAddress,
      amount: amount.toRawString(),
      assetType,
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
        type: 'transfer',
        displayAmount: amount.toFormatted(),
        displaySymbol: assetType,
        displayToAddress: toAddress,
      },
    })

    // 广播交易

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
      message: errorMessage || '交易失败，请稍后重试',
    }
  }
}

export type SetTwoStepSecretResult =
  | { status: 'ok'; txHash: string }
  | { status: 'password' }
  | { status: 'already_set' }
  | { status: 'error'; message: string }

export interface SetTwoStepSecretParams {
  chainConfig: ChainConfig
  walletId: string
  password: string
  fromAddress: string
  newTwoStepSecret: string
}

/**
 * Set pay password (二次签名) for an account
 */
export async function submitSetTwoStepSecret({
  chainConfig,
  walletId,
  password,
  fromAddress,
  newTwoStepSecret,
}: SetTwoStepSecretParams): Promise<SetTwoStepSecretResult> {
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

  const apiUrl = getBioforestApiUrl(chainConfig)
  if (!apiUrl) {
    return { status: 'error', message: 'API URL 未配置' }
  }

  try {
    // Check if already has pay password
    const addressInfo = await getAddressInfo(apiUrl, fromAddress)
    if (addressInfo.secondPublicKey) {
      return { status: 'already_set' }
    }

    // Set pay password

    const result = await setTwoStepSecret({
      baseUrl: apiUrl,
      chainId: chainConfig.id,
      mainSecret: secret,
      newPaySecret: newTwoStepSecret,
    })


    return { status: 'ok', txHash: result.txHash }
  } catch (error) {


    const errorMessage = error instanceof Error ? error.message : String(error)

    if (errorMessage.includes('fee') || errorMessage.includes('手续费')) {
      return { status: 'error', message: '余额不足以支付手续费' }
    }

    return {
      status: 'error',
      message: errorMessage || '设置安全密码失败，请稍后重试',
    }
  }
}

/**
 * Get the minimum fee for setting pay password
 */
export async function getSetTwoStepSecretFee(
  chainConfig: ChainConfig,
): Promise<{ amount: Amount; symbol: string } | null> {
  const apiUrl = getBioforestApiUrl(chainConfig)
  if (!apiUrl) {
    return null
  }

  try {
    const feeRaw = await getSignatureTransactionMinFee(apiUrl, chainConfig.id)
    return {
      amount: Amount.fromRaw(feeRaw, chainConfig.decimals, chainConfig.symbol),
      symbol: chainConfig.symbol,
    }
  } catch (error) {

    return null
  }
}

/**
 * Check if address has pay password set
 */
export async function hasTwoStepSecretSet(
  chainConfig: ChainConfig,
  address: string,
): Promise<boolean> {
  const apiUrl = getBioforestApiUrl(chainConfig)
  if (!apiUrl) {
    return false
  }

  try {
    const info = await getAddressInfo(apiUrl, address)
    return !!info.secondPublicKey
  } catch {
    return false
  }
}
