import { useStore } from '@tanstack/react-store'
import { walletStore, walletSelectors } from './wallet'

/** 获取完整钱包状态 */
export function useWalletState() {
  return useStore(walletStore)
}

/** 获取钱包列表 */
export function useWallets() {
  return useStore(walletStore, (state) => state.wallets)
}

/** 获取当前钱包 */
export function useCurrentWallet() {
  return useStore(walletStore, (state) => walletSelectors.getCurrentWallet(state))
}

/** 获取当前选中的链 */
export function useSelectedChain() {
  return useStore(walletStore, (state) => state.selectedChain)
}

/** 获取当前链的地址信息 */
export function useCurrentChainAddress() {
  return useStore(walletStore, (state) => walletSelectors.getCurrentChainAddress(state))
}

/** 获取当前链的代币列表 */
export function useCurrentChainTokens() {
  return useStore(walletStore, (state) => walletSelectors.getCurrentChainTokens(state))
}

/** 获取可用的链列表 */
export function useAvailableChains() {
  return useStore(walletStore, (state) => walletSelectors.getAvailableChains(state))
}

/** 获取当前钱包的代币列表 (兼容旧代码) */
export function useCurrentTokens() {
  return useStore(walletStore, (state) => walletSelectors.getCurrentChainTokens(state))
}

/** 获取当前钱包总资产（法币） */
export function useTotalFiatValue() {
  return useStore(walletStore, (state) => walletSelectors.getTotalFiatValue(state))
}

/** 是否有钱包 */
export function useHasWallet() {
  return useStore(walletStore, (state) => walletSelectors.hasWallet(state))
}

/** 钱包加载状态 */
export function useWalletLoading() {
  return useStore(walletStore, (state) => state.isLoading)
}

/** 钱包是否已初始化 */
export function useWalletInitialized() {
  return useStore(walletStore, (state) => state.isInitialized)
}
