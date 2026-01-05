/**
 * Hook for forge (recharge) operations
 */

import { useState, useCallback } from 'react'
import type { BioAccount, BioSignedTransaction } from '@biochain/bio-sdk'
import { rechargeApi } from '@/api'
import { encodeRechargeV2ToTrInfoData, createRechargeMessage } from '@/api/helpers'
import { getChainType } from '@/lib/chain'
import type {
  ExternalChainName,
  FromTrJson,
  RechargeV2ReqDto,
  SignatureInfo,
} from '@/api/types'

export type ForgeStep = 'idle' | 'signing_external' | 'signing_internal' | 'submitting' | 'success' | 'error'

export interface ForgeState {
  step: ForgeStep
  orderId: string | null
  error: string | null
}

export interface ForgeParams {
  /** 外链名称 */
  externalChain: ExternalChainName
  /** 外链资产类型 */
  externalAsset: string
  /** 外链转账地址（depositAddress） */
  depositAddress: string
  /** 转账金额 */
  amount: string
  /** 外链账户（已连接） */
  externalAccount: BioAccount
  /** 内链名称 */
  internalChain: string
  /** 内链资产类型 */
  internalAsset: string
  /** 内链账户（接收锻造产物） */
  internalAccount: BioAccount
}

/** EVM signed transaction result */
interface EvmSignedTransaction {
  txHash: string
  signedData: string
}

/** TRON signed transaction result */
interface TronSignedTransaction {
  txID: string
  signature: string[]
  raw_data: unknown
}

/** Union type for signed transactions */
type SignedTransactionResult = BioSignedTransaction | EvmSignedTransaction | TronSignedTransaction

/**
 * Build FromTrJson from signed transaction
 */
function buildFromTrJson(chain: ExternalChainName, signedTx: SignedTransactionResult): FromTrJson {
  switch (chain) {
    case 'ETH': {
      const evmTx = signedTx as EvmSignedTransaction
      return { eth: { signTransData: evmTx.signedData } }
    }
    case 'BSC': {
      const evmTx = signedTx as EvmSignedTransaction
      return { bsc: { signTransData: evmTx.signedData } }
    }
    case 'TRON': {
      const tronTx = signedTx as TronSignedTransaction
      return { tron: tronTx }
    }
    default:
      throw new Error(`Unsupported chain: ${chain}`)
  }
}

/**
 * Sign EVM transaction using window.ethereum
 */
async function signEvmTransaction(
  from: string,
  to: string,
  amount: string,
  _asset: string
): Promise<EvmSignedTransaction> {
  if (!window.ethereum) {
    throw new Error('Ethereum provider not available')
  }

  // Convert amount to wei (assuming 18 decimals for native token)
  // For USDT, we'd need to handle ERC20 transfer differently
  const valueInWei = BigInt(Math.floor(parseFloat(amount) * 1e18)).toString(16)

  const txHash = await window.ethereum.request<string>({
    method: 'eth_sendTransaction',
    params: [{
      from,
      to,
      value: `0x${valueInWei}`,
    }],
  })

  if (!txHash) {
    throw new Error('Transaction failed')
  }

  return {
    txHash,
    signedData: txHash, // For EVM, txHash is returned after broadcast
  }
}

/**
 * Sign TRON transaction using window.tronLink
 */
async function signTronTransaction(
  from: string,
  to: string,
  amount: string,
  _asset: string
): Promise<TronSignedTransaction> {
  if (!window.tronWeb || !window.tronLink) {
    throw new Error('TronLink provider not available')
  }

  // Convert amount to SUN (1 TRX = 1,000,000 SUN)
  const amountInSun = Math.floor(parseFloat(amount) * 1e6)

  // Create unsigned transaction via tronWeb
  // Note: In real implementation, we'd use tronWeb.transactionBuilder
  // For now, we'll use the simplified tron_signTransaction method
  const unsignedTx = {
    to_address: to,
    owner_address: from,
    amount: amountInSun,
  }

  const signedTx = await window.tronLink.request({
    method: 'tron_signTransaction',
    params: unsignedTx,
  })

  return signedTx as TronSignedTransaction
}

export function useForge() {
  const [state, setState] = useState<ForgeState>({
    step: 'idle',
    orderId: null,
    error: null,
  })

  const reset = useCallback(() => {
    setState({ step: 'idle', orderId: null, error: null })
  }, [])

  const forge = useCallback(async (params: ForgeParams) => {
    const {
      externalChain,
      externalAsset,
      depositAddress,
      amount,
      externalAccount,
      internalChain,
      internalAsset,
      internalAccount,
    } = params

    if (!window.bio) {
      setState({ step: 'error', orderId: null, error: 'Bio SDK not available' })
      return
    }

    try {
      // Step 1: Create and sign external chain transaction
      setState({ step: 'signing_external', orderId: null, error: null })

      const chainType = getChainType(externalChain)
      let signedTx: SignedTransactionResult

      if (chainType === 'evm') {
        // Use window.ethereum for EVM chains (ETH, BSC)
        signedTx = await signEvmTransaction(
          externalAccount.address,
          depositAddress,
          amount,
          externalAsset
        )
      } else if (chainType === 'tron') {
        // Use window.tronLink for TRON
        signedTx = await signTronTransaction(
          externalAccount.address,
          depositAddress,
          amount,
          externalAsset
        )
      } else {
        // Use bio_createTransaction + bio_signTransaction for BioChain
        const unsignedTx = await window.bio.request({
          method: 'bio_createTransaction',
          params: [{
            from: externalAccount.address,
            to: depositAddress,
            amount,
            chain: externalChain.toLowerCase(),
            asset: externalAsset,
          }],
        })

        signedTx = await window.bio.request<BioSignedTransaction>({
          method: 'bio_signTransaction',
          params: [{
            from: externalAccount.address,
            chain: externalChain.toLowerCase(),
            unsignedTx,
          }],
        })
      }

      // Step 2: Sign internal chain message
      setState({ step: 'signing_internal', orderId: null, error: null })

      const rechargeMessage = createRechargeMessage({
        chainName: internalChain,
        address: internalAccount.address,
        assetType: internalAsset,
      })

      const messageToSign = encodeRechargeV2ToTrInfoData({
        chainName: rechargeMessage.chainName,
        address: rechargeMessage.address,
        timestamp: rechargeMessage.timestamp,
      })

      // bio_signMessage 返回 { signature, publicKey }，publicKey 为 hex 格式
      const signResult = await window.bio.request<{ signature: string; publicKey: string }>({
        method: 'bio_signMessage',
        params: [{
          message: messageToSign,
          address: internalAccount.address,
        }],
      })

      const signatureInfo: SignatureInfo = {
        timestamp: rechargeMessage.timestamp,
        signature: signResult.signature,
        publicKey: signResult.publicKey,
      }

      // Step 3: Submit recharge request
      setState({ step: 'submitting', orderId: null, error: null })

      const fromTrJson = buildFromTrJson(externalChain, signedTx)

      const reqData: RechargeV2ReqDto = {
        fromTrJson,
        message: rechargeMessage,
        signatureInfo,
      }

      const res = await rechargeApi.submitRecharge(reqData)

      setState({ step: 'success', orderId: res.orderId, error: null })
    } catch (err) {
      setState({
        step: 'error',
        orderId: null,
        error: err instanceof Error ? err.message : 'Forge failed',
      })
    }
  }, [])

  return {
    ...state,
    forge,
    reset,
  }
}
