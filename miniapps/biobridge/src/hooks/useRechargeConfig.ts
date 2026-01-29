/**
 * Hook for fetching recharge configuration
 */

import { useState, useEffect, useCallback } from 'react'
import { rechargeApi } from '@/api'
import type { RechargeConfig, ExternalChainName, ExternalAssetInfoItem } from '@/api/types'

export interface RechargeConfigState {
  config: RechargeConfig | null
  isLoading: boolean
  error: string | null
}

export interface ForgeOption {
  /** 外链名称 */
  externalChain: ExternalChainName
  /** 外链资产类型 */
  externalAsset: string
  /** 外链资产信息 */
  externalInfo: ExternalAssetInfoItem
  /** 内链名称 */
  internalChain: string
  /** 内链资产类型 */
  internalAsset: string
  /** 外链 Logo */
  externalLogo?: string
  /** 内链 Logo */
  internalLogo?: string
}

/** Chain display order: BSC -> TRON -> ETH */
const CHAIN_ORDER: Record<string, number> = { BSC: 1, TRON: 2, ETH: 3 }

function normalizeDecimals(value: number | undefined): number | undefined {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) return undefined
  return value
}

/**
 * Parse recharge config to forge options
 */
function parseForgeOptions(config: RechargeConfig): ForgeOption[] {
  const options: ForgeOption[] = []

  for (const [internalChain, assets] of Object.entries(config)) {
    for (const [internalAsset, item] of Object.entries(assets)) {
      if (!item.enable) continue

      for (const [externalChain, externalInfo] of Object.entries(item.supportChain)) {
        if (!externalInfo?.enable) continue
        const normalizedDecimals = normalizeDecimals(externalInfo.decimals)

        options.push({
          externalChain: externalChain as ExternalChainName,
          externalAsset: externalInfo.assetType,
          externalInfo: { ...externalInfo, decimals: normalizedDecimals },
          internalChain,
          internalAsset,
          externalLogo: externalInfo.logo,
          internalLogo: item.logo,
        })
      }
    }
  }

  // Sort by chain order: BSC -> TRON -> ETH
  options.sort((a, b) => (CHAIN_ORDER[a.externalChain] ?? 99) - (CHAIN_ORDER[b.externalChain] ?? 99))

  return options
}

export function useRechargeConfig() {
  const [state, setState] = useState<RechargeConfigState>({
    config: null,
    isLoading: true,
    error: null,
  })

  const fetchConfig = useCallback(async () => {
    setState((s) => ({ ...s, isLoading: true, error: null }))
    try {
      const res = await rechargeApi.getSupport()
      setState({ config: res.recharge, isLoading: false, error: null })
    } catch (err) {
      setState({
        config: null,
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to load config',
      })
    }
  }, [])

  useEffect(() => {
    fetchConfig()
  }, [fetchConfig])

  const forgeOptions = state.config ? parseForgeOptions(state.config) : []

  return {
    ...state,
    forgeOptions,
    refetch: fetchConfig,
  }
}
