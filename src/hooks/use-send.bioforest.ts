import type { AssetInfo } from '@/types/asset'
import type { ChainConfig } from '@/services/chain-config'
import { Amount } from '@/types/amount'
import { walletStorageService, WalletStorageError, WalletStorageErrorCode } from '@/services/wallet-storage'
import { createBioforestAdapter } from '@/services/chain-adapter'
import { deriveBioforestKeyFromChainConfig, hexToBytes } from '@/lib/crypto'

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
  | { status: 'error'; message: string }

export interface SubmitBioforestParams {
  chainConfig: ChainConfig
  walletId: string
  password: string
  fromAddress: string
  toAddress: string
  amount: Amount
}

export async function submitBioforestTransfer({
  chainConfig,
  walletId,
  password,
  fromAddress,
  toAddress,
  amount,
}: SubmitBioforestParams): Promise<SubmitBioforestResult> {
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

  const derived = deriveBioforestKeyFromChainConfig(secret, chainConfig)
  if (derived.address !== fromAddress) {
    return { status: 'error', message: '签名地址不匹配' }
  }

  if (!amount.isPositive()) {
    return { status: 'error', message: '请输入有效金额' }
  }

  try {
    const adapter = createBioforestAdapter(chainConfig)
    const unsignedTx = await adapter.transaction.buildTransaction({
      from: fromAddress,
      to: toAddress,
      amount,
    })
    const signedTx = await adapter.transaction.signTransaction(unsignedTx, hexToBytes(derived.privateKey))
    const txHash = await adapter.transaction.broadcastTransaction(signedTx)

    return { status: 'ok', txHash }
  } catch (error) {
    return {
      status: 'error',
      message: error instanceof Error ? error.message : '未知错误',
    }
  }
}
