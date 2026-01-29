/**
 * Hook for redemption (赎回) operations
 * 内链资产 → 外链资产
 */

import { useState, useCallback } from 'react'
import type { BioAccount } from '@biochain/bio-sdk'
import { normalizeChainId } from '@biochain/bio-sdk'
import { redemptionApi } from '@/api'
import type {
  ExternalChainName,
  RedemptionV2ReqDto,
  RedemptionTransRemark,
} from '@/api/types'
import { superjson } from '@biochain/chain-effect'

export type RedemptionStep = 
  | 'idle' 
  | 'creating_transaction' 
  | 'signing' 
  | 'submitting' 
  | 'success' 
  | 'error'

export interface RedemptionState {
  step: RedemptionStep
  orderId: string | null
  error: string | null
}

export interface RedemptionParams {
  /** 内链名称 */
  internalChain: string
  /** 内链资产类型 */
  internalAsset: string
  /** 内链账户 */
  internalAccount: BioAccount
  /** 赎回金额 (内链最小单位) */
  amount: string
  /** 目标外链名称 */
  externalChain: ExternalChainName
  /** 目标外链地址 */
  externalAddress: string
  /** 目标外链资产类型 */
  externalAsset: string
  /** 内链币发行地址 (recipientId for DestroyAsset) */
  applyAddress: string
}

function toJsonSafe(value: unknown): unknown {
  return superjson.serialize(value).json
}

export function useRedemption() {
  const [state, setState] = useState<RedemptionState>({
    step: 'idle',
    orderId: null,
    error: null,
  })

  const reset = useCallback(() => {
    setState({ step: 'idle', orderId: null, error: null })
  }, [])

  const redeem = useCallback(async (params: RedemptionParams) => {
    const {
      internalChain,
      internalAsset,
      internalAccount,
      amount,
      externalChain,
      externalAddress,
      externalAsset,
      applyAddress,
    } = params

    if (!window.bio) {
      setState({ step: 'error', orderId: null, error: 'Bio SDK not available' })
      return
    }

    try {
      // Step 1: Create DestroyAsset transaction
      setState({ step: 'creating_transaction', orderId: null, error: null })

      // Build remark with target external chain info
      const remark: RedemptionTransRemark = {
        chainName: externalChain,
        address: externalAddress,
        assetType: externalAsset,
      }

      // Create DestroyAsset transaction via Bio SDK
      const internalChainId = normalizeChainId(internalChain)

      const unsignedTx = await window.bio.request({
        method: 'bio_createTransaction',
        params: [{
          type: 'destroy',
          from: internalAccount.address,
          to: applyAddress,
          recipientId: applyAddress, // asset issuer
          amount,
          chain: internalChainId,
          asset: internalAsset,
          remark,
        }],
      })

      // Step 2: Sign transaction
      setState({ step: 'signing', orderId: null, error: null })

      const unsignedTxSafe = toJsonSafe(unsignedTx)

      const signedTx = await window.bio.request<{ trJson?: unknown; data?: unknown }>({
        method: 'bio_signTransaction',
        params: [{
          from: internalAccount.address,
          chain: internalChainId,
          unsignedTx: unsignedTxSafe,
        }],
      })

      // Step 3: Submit redemption request
      setState({ step: 'submitting', orderId: null, error: null })

      const reqData: RedemptionV2ReqDto = {
        fromTrJson: {
          bcf: {
            chainName: internalChain,
            trJson: signedTx.trJson ?? signedTx.data ?? signedTx,
          },
        },
      }

      const res = await redemptionApi.submitRedemption(reqData)

      setState({ step: 'success', orderId: res.orderId, error: null })
    } catch (err) {
      setState({
        step: 'error',
        orderId: null,
        error: err instanceof Error ? err.message : 'Redemption failed',
      })
    }
  }, [])

  return {
    ...state,
    redeem,
    reset,
  }
}
