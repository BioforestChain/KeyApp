/**
 * Teleport API React Hooks
 * 使用 TanStack Query 管理 API 状态
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getTransmitAssetTypeList,
  transmit,
  getTransmitRecords,
  getTransmitRecordDetail,
  retryFromTxOnChain,
  retryToTxOnChain,
} from './client'
import type {
  TransmitRequest,
  TransmitRecordsRequest,
  DisplayAsset,
  ChainName,
} from './types'

// Query Keys
export const queryKeys = {
  assetTypeList: ['transmit', 'assetTypeList'] as const,
  records: (params: TransmitRecordsRequest) => ['transmit', 'records', params] as const,
  recordDetail: (orderId: string) => ['transmit', 'recordDetail', orderId] as const,
}

/**
 * 获取传送配置并转换为可展示的资产列表
 */
export function useTransmitAssetTypeList() {
  return useQuery({
    queryKey: queryKeys.assetTypeList,
    queryFn: getTransmitAssetTypeList,
    staleTime: 5 * 60 * 1000, // 5 minutes
    select: (data): DisplayAsset[] => {
      const assets: DisplayAsset[] = []
      const support = data.transmitSupport

      for (const [chainKey, chainAssets] of Object.entries(support)) {
        if (!chainAssets) continue
        
        for (const [assetKey, config] of Object.entries(chainAssets)) {
          if (!config.enable) continue
          
          // 检查传送时间是否有效
          const now = new Date()
          const startDate = new Date(config.transmitDate.startDate)
          const endDate = new Date(config.transmitDate.endDate)
          if (now < startDate || now > endDate) continue

          assets.push({
            id: `${chainKey}-${assetKey}`,
            chain: chainKey as ChainName,
            assetType: assetKey,
            symbol: assetKey,
            name: assetKey,
            balance: '0', // 余额需要从钱包获取
            decimals: 8, // 默认精度，实际需要从链上获取
            recipientAddress: config.recipientAddress,
            targetChain: config.targetChain,
            targetAsset: config.targetAsset,
            ratio: config.ratio,
            contractAddress: config.contractAddress,
            isAirdrop: config.isAirdrop,
          })
        }
      }

      return assets
    },
  })
}

/**
 * 发起传送
 */
export function useTransmit() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: TransmitRequest) => transmit(data),
    onSuccess: () => {
      // 传送成功后刷新记录列表
      queryClient.invalidateQueries({ queryKey: ['transmit', 'records'] })
    },
  })
}

/**
 * 获取传送记录列表
 */
export function useTransmitRecords(params: TransmitRecordsRequest) {
  return useQuery({
    queryKey: queryKeys.records(params),
    queryFn: () => getTransmitRecords(params),
    staleTime: 30 * 1000, // 30 seconds
  })
}

/**
 * 获取传送记录详情
 */
export function useTransmitRecordDetail(orderId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.recordDetail(orderId),
    queryFn: () => getTransmitRecordDetail(orderId),
    enabled: options?.enabled ?? !!orderId,
    refetchInterval: (query) => {
      // 如果订单还在处理中，每 5 秒刷新一次
      const data = query.state.data
      if (data && data.orderState < 4) {
        return 5000
      }
      return false
    },
  })
}

/**
 * 重试发送方交易上链
 */
export function useRetryFromTxOnChain() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: retryFromTxOnChain,
    onSuccess: (_, orderId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recordDetail(orderId) })
      queryClient.invalidateQueries({ queryKey: ['transmit', 'records'] })
    },
  })
}

/**
 * 重试接收方交易上链
 */
export function useRetryToTxOnChain() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: retryToTxOnChain,
    onSuccess: (_, orderId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recordDetail(orderId) })
      queryClient.invalidateQueries({ queryKey: ['transmit', 'records'] })
    },
  })
}
