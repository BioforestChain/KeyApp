import { QueryClient } from '@tanstack/react-query'

/**
 * 全局 QueryClient 实例
 *
 * 配置说明：
 * - staleTime: 数据被认为"新鲜"的时间，在此期间不会自动重新请求
 * - gcTime: 数据在缓存中保留的时间（之前叫 cacheTime）
 * - refetchOnWindowFocus: 窗口聚焦时是否自动刷新
 * - retry: 请求失败时的重试次数
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000, // 30 秒内认为数据新鲜
      gcTime: 5 * 60 * 1000, // 5 分钟后清理缓存
      refetchOnWindowFocus: true, // 窗口聚焦时刷新
      refetchOnReconnect: true, // 网络重连时刷新
      retry: 2, // 失败重试 2 次
    },
  },
})
