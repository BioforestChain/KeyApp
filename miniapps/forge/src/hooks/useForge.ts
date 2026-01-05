/**
 * Hook for forge (recharge) operations
 */

import { useState, useCallback } from 'react'
import type { BioAccount, BioSignedTransaction } from '@biochain/bio-sdk'
import { normalizeChainId } from '@biochain/bio-sdk'
import { rechargeApi } from '@/api'
import { encodeRechargeV2ToTrInfoData, createRechargeMessage } from '@/api/helpers'
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

/**
 * Build FromTrJson from signed transaction
 */
function buildFromTrJson(chain: ExternalChainName, signedTx: BioSignedTransaction): FromTrJson {
  const signTransData = typeof signedTx.data === 'string'
    ? signedTx.data
    : JSON.stringify(signedTx.data)

  switch (chain) {
    case 'ETH':
      return { eth: { signTransData } }
    case 'BSC':
      return { bsc: { signTransData } }
    case 'TRON':
      return { tron: signedTx.data }
    default:
      throw new Error(`Unsupported chain: ${chain}`)
  }
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

      const externalKeyAppChainId = normalizeChainId(externalChain)

      const unsignedTx = await window.bio.request({
        method: 'bio_createTransaction',
        params: [{
          from: externalAccount.address,
          to: depositAddress,
          amount,
          chain: externalKeyAppChainId,
          asset: externalAsset,
        }],
      })

      const signedTx = await window.bio.request<BioSignedTransaction>({
        method: 'bio_signTransaction',
        params: [{
          from: externalAccount.address,
          chain: externalKeyAppChainId,
          unsignedTx,
        }],
      })

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
