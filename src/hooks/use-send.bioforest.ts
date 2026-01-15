import type { AssetInfo } from '@/types/asset'
import type { ChainConfig } from '@/services/chain-config'
import { Amount } from '@/types/amount'
import { walletStorageService, WalletStorageError, WalletStorageErrorCode } from '@/services/wallet-storage'
import { getChainProvider } from '@/services/chain-adapter/providers'
import { pendingTxService } from '@/services/transaction'

export interface BioforestFeeResult {
  amount: Amount
  symbol: string
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
  const provider = getChainProvider(chainConfig.id)
  if (!provider.bioGetAccountInfo) {
    return { required: false }
  }

  try {
    const info = await provider.bioGetAccountInfo(address)
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
  const provider = getChainProvider(chainConfig.id)
  if (!provider.bioVerifyPayPassword) {
    return false
  }

  try {
    const mainSecret = await walletStorageService.getMnemonic(walletId, password)
    return await provider.bioVerifyPayPassword({
      mainSecret,
      paySecret: twoStepSecret,
      publicKey: secondPublicKey,
    })
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
  fee: _fee,
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

  const provider = getChainProvider(chainConfig.id)

  // 检查 provider 是否支持完整交易流程
  if (!provider.supportsFullTransaction) {
    return { status: 'error', message: '该链不支持完整交易流程' }
  }

  try {
    // Check if pay password is required but not provided
    let secondPublicKey: string | null = null
    if (provider.bioGetAccountInfo) {
      const accountInfo = await provider.bioGetAccountInfo(fromAddress)
      secondPublicKey = accountInfo.secondPublicKey

      if (secondPublicKey && !twoStepSecret) {
        return {
          status: 'password_required',
          secondPublicKey,
        }
      }

      // Verify pay password if provided
      if (twoStepSecret && secondPublicKey && provider.bioVerifyPayPassword) {
        const isValid = await provider.bioVerifyPayPassword({
          mainSecret: secret,
          paySecret: twoStepSecret,
          publicKey: secondPublicKey,
        })

        if (!isValid) {
          return { status: 'error', message: '安全密码验证失败' }
        }
      }
    }

    // Build unsigned transaction using ChainProvider
    const unsignedTx = await provider.buildTransaction!({
      type: 'transfer',
      from: fromAddress,
      to: toAddress,
      amount,
      // BioChain 特有字段
      bioAssetType: assetType,
    })

    // Sign transaction
    const signedTx = await provider.signTransaction!(unsignedTx, {
      privateKey: new TextEncoder().encode(secret), // 助记词作为私钥
      bioSecret: secret,
      bioPaySecret: twoStepSecret,
    })

    // 存储到 pendingTxService（使用 ChainProvider 标准格式）
    const pendingTx = await pendingTxService.create({
      walletId,
      chainId: chainConfig.id,
      fromAddress,
      rawTx: signedTx,
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
      const broadcastTxHash = await provider.broadcastTransaction!(signedTx)

      await pendingTxService.updateStatus({
        id: pendingTx.id,
        status: 'broadcasted',
        txHash: broadcastTxHash,
      })
      return { status: 'ok', txHash: broadcastTxHash, pendingTxId: pendingTx.id }
    } catch (err) {
      const error = err as Error
      await pendingTxService.updateStatus({
        id: pendingTx.id,
        status: 'failed',
        errorCode: 'BROADCAST_FAILED',
        errorMessage: error.message,
      })
      return { status: 'error', message: error.message, pendingTxId: pendingTx.id }
    }
  } catch (error) {
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

  const provider = getChainProvider(chainConfig.id)

  // 检查 provider 是否支持完整交易流程
  if (!provider.supportsFullTransaction) {
    return { status: 'error', message: '该链不支持完整交易流程' }
  }

  try {
    // Check if already has pay password
    if (provider.bioGetAccountInfo) {
      const accountInfo = await provider.bioGetAccountInfo(fromAddress)
      if (accountInfo.secondPublicKey) {
        return { status: 'already_set' }
      }
    }

    // Build and sign setPayPassword transaction using ChainProvider
    const unsignedTx = await provider.buildTransaction!({
      type: 'setPayPassword',
      from: fromAddress,
    })

    const signedTx = await provider.signTransaction!(unsignedTx, {
      privateKey: new TextEncoder().encode(secret),
      bioSecret: secret,
      bioNewPaySecret: newTwoStepSecret,
    })

    // Broadcast transaction
    const txHash = await provider.broadcastTransaction!(signedTx)

    return { status: 'ok', txHash }
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
  const provider = getChainProvider(chainConfig.id)

  if (!provider.buildTransaction || !provider.estimateFee) {
    return null
  }

  try {
    // 使用一个伪地址构建交易估算费用
    const unsignedTx = await provider.buildTransaction({
      type: 'setPayPassword',
      from: '0x0000000000000000000000000000000000000000',
    })
    const feeEstimate = await provider.estimateFee(unsignedTx)

    return {
      amount: feeEstimate.standard.amount,
      symbol: chainConfig.symbol,
    }
  } catch {
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
  const provider = getChainProvider(chainConfig.id)

  if (!provider.bioGetAccountInfo) {
    return false
  }

  try {
    const info = await provider.bioGetAccountInfo(address)
    return !!info.secondPublicKey
  } catch {
    return false
  }
}

