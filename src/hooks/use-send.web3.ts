/**
 * Web3 Transfer Implementation
 * 
 * Handles transfers for EVM, Tron, and Bitcoin chains using chain adapters.
 */

import type { AssetInfo } from '@/types/asset'
import type { ChainConfig } from '@/services/chain-config'
import { Amount } from '@/types/amount'
import { walletStorageService, WalletStorageError, WalletStorageErrorCode } from '@/services/wallet-storage'
import { getAdapterRegistry, setupAdapters } from '@/services/chain-adapter'
import { mnemonicToSeedSync } from '@scure/bip39'

// Ensure adapters are registered
let adaptersInitialized = false
function ensureAdapters() {
  if (!adaptersInitialized) {
    setupAdapters()
    adaptersInitialized = true
  }
}

export interface Web3FeeResult {
  amount: Amount
  symbol: string
}

export async function fetchWeb3Fee(chainConfig: ChainConfig, fromAddress: string): Promise<Web3FeeResult> {
  ensureAdapters()
  
  const registry = getAdapterRegistry()
  registry.setChainConfigs([chainConfig])
  
  const adapter = registry.getAdapter(chainConfig.id)
  if (!adapter) {
    throw new Error(`No adapter found for chain: ${chainConfig.id}`)
  }

  const feeEstimate = await adapter.transaction.estimateFee({
    from: fromAddress,
    to: fromAddress,
    amount: Amount.fromRaw('1', chainConfig.decimals, chainConfig.symbol),
  })

  return {
    amount: feeEstimate.standard.amount,
    symbol: chainConfig.symbol,
  }
}

export async function fetchWeb3Balance(chainConfig: ChainConfig, fromAddress: string): Promise<AssetInfo> {
  ensureAdapters()
  
  const registry = getAdapterRegistry()
  registry.setChainConfigs([chainConfig])
  
  const adapter = registry.getAdapter(chainConfig.id)
  if (!adapter) {
    throw new Error(`No adapter found for chain: ${chainConfig.id}`)
  }

  const balance = await adapter.asset.getNativeBalance(fromAddress)

  return {
    assetType: balance.symbol,
    name: chainConfig.name,
    amount: balance.amount,
    decimals: balance.amount.decimals,
  }
}

export type SubmitWeb3Result =
  | { status: 'ok'; txHash: string }
  | { status: 'password' }
  | { status: 'error'; message: string }

export interface SubmitWeb3Params {
  chainConfig: ChainConfig
  walletId: string
  password: string
  fromAddress: string
  toAddress: string
  amount: Amount
}

export async function submitWeb3Transfer({
  chainConfig,
  walletId,
  password,
  fromAddress,
  toAddress,
  amount,
}: SubmitWeb3Params): Promise<SubmitWeb3Result> {
  ensureAdapters()

  // Get mnemonic from wallet storage
  let mnemonic: string
  try {
    mnemonic = await walletStorageService.getMnemonic(walletId, password)
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

  try {
    const registry = getAdapterRegistry()
    registry.setChainConfigs([chainConfig])
    
    const adapter = registry.getAdapter(chainConfig.id)
    if (!adapter) {
      return { status: 'error', message: `不支持的链: ${chainConfig.id}` }
    }

    console.log('[submitWeb3Transfer] Starting transfer:', { 
      chain: chainConfig.id, 
      type: chainConfig.type,
      fromAddress, 
      toAddress, 
      amount: amount.toRawString() 
    })

    // Derive private key from mnemonic
    const seed = mnemonicToSeedSync(mnemonic)
    
    // Build unsigned transaction
    console.log('[submitWeb3Transfer] Building transaction...')
    const unsignedTx = await adapter.transaction.buildTransaction({
      from: fromAddress,
      to: toAddress,
      amount,
    })

    // Sign transaction
    console.log('[submitWeb3Transfer] Signing transaction...')
    const signedTx = await adapter.transaction.signTransaction(unsignedTx, seed)

    // Broadcast transaction
    console.log('[submitWeb3Transfer] Broadcasting transaction...')
    const txHash = await adapter.transaction.broadcastTransaction(signedTx)

    console.log('[submitWeb3Transfer] SUCCESS! txHash:', txHash)
    return { status: 'ok', txHash }
  } catch (error) {
    console.error('[submitWeb3Transfer] FAILED:', error)

    const errorMessage = error instanceof Error ? error.message : String(error)

    // Handle specific error cases
    if (errorMessage.includes('insufficient') || errorMessage.includes('余额不足')) {
      return { status: 'error', message: '余额不足' }
    }

    if (errorMessage.includes('fee') || errorMessage.includes('手续费') || errorMessage.includes('gas')) {
      return { status: 'error', message: '手续费不足' }
    }

    if (errorMessage.includes('not yet implemented') || errorMessage.includes('not supported')) {
      return { status: 'error', message: '该链转账功能尚未完全实现' }
    }

    return {
      status: 'error',
      message: errorMessage || '交易失败，请稍后重试',
    }
  }
}

/**
 * Validate address for Web3 chains
 */
export function validateWeb3Address(chainConfig: ChainConfig, address: string): string | null {
  ensureAdapters()
  
  const registry = getAdapterRegistry()
  registry.setChainConfigs([chainConfig])
  
  const adapter = registry.getAdapter(chainConfig.id)
  if (!adapter) {
    return '不支持的链类型'
  }

  if (!address || address.trim() === '') {
    return '请输入收款地址'
  }

  if (!adapter.identity.isValidAddress(address)) {
    return '无效的地址格式'
  }

  return null
}
