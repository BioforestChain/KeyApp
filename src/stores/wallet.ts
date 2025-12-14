import { Store } from '@tanstack/react-store'
import type { EncryptedData } from '@/lib/crypto'
import { type BioforestChainType } from '@/lib/crypto'

// 类型定义
// 外部链 (BIP44)
export type ExternalChainType = 'ethereum' | 'tron' | 'bitcoin' | 'binance'

// BioForest 链 (Ed25519)
export type { BioforestChainType }

// 所有链（来自 chain-config，可扩展）
export type ChainType = string

export interface Token {
  id: string
  symbol: string
  name: string
  balance: string
  fiatValue: number
  change24h: number
  icon?: string
  contractAddress?: string
  decimals: number
  /** 所属链 */
  chain: ChainType
}

/** 链地址信息 */
export interface ChainAddress {
  chain: ChainType
  address: string
  /** 该链上的代币 */
  tokens: Token[]
}

export interface Wallet {
  id: string
  name: string
  /**
   * Wallet secret type.
   * - `mnemonic`: BIP39 mnemonic (default for legacy wallets)
   * - `arbitrary`: arbitrary secret string (BioforestChain only)
   */
  keyType?: 'mnemonic' | 'arbitrary'
  /** 主地址（默认显示的地址，通常是以太坊） */
  address: string
  /** 主链类型 */
  chain: ChainType
  /** 多链地址 */
  chainAddresses: ChainAddress[]
  /** 加密后的助记词 */
  encryptedMnemonic?: EncryptedData
  createdAt: number
  /** @deprecated 使用 chainAddresses[].tokens */
  tokens: Token[]
}

export interface WalletState {
  wallets: Wallet[]
  currentWalletId: string | null
  /** 当前选中的链 */
  selectedChain: ChainType
  isLoading: boolean
  isInitialized: boolean
}

// 初始状态
const initialState: WalletState = {
  wallets: [],
  currentWalletId: null,
  selectedChain: 'ethereum',
  isLoading: false,
  isInitialized: false,
}

// 创建 Store
export const walletStore = new Store<WalletState>(initialState)

// Actions
export const walletActions = {
  /** 初始化钱包（从存储加载） */
  initialize: async () => {
    walletStore.setState((state) => ({ ...state, isLoading: true }))
    
    try {
      // TODO: 从 localStorage/IndexedDB 加载钱包数据
      const stored = localStorage.getItem('bfm_wallets')
      if (stored) {
        const data = JSON.parse(stored) as { wallets: Wallet[]; currentWalletId: string | null }
        // Backward compatible: legacy wallets may not have keyType
        const wallets = data.wallets.map((wallet) => ({
          ...wallet,
          keyType: wallet.keyType ?? 'mnemonic',
        }))
        walletStore.setState((state) => ({
          ...state,
          wallets,
          currentWalletId: data.currentWalletId,
          isInitialized: true,
          isLoading: false,
        }))
      } else {
        walletStore.setState((state) => ({
          ...state,
          isInitialized: true,
          isLoading: false,
        }))
      }
    } catch (error) {
      console.error('Failed to initialize wallets:', error)
      walletStore.setState((state) => ({
        ...state,
        isInitialized: true,
        isLoading: false,
      }))
    }
  },

  /** 创建新钱包 */
  createWallet: (wallet: Omit<Wallet, 'id' | 'createdAt' | 'tokens' | 'chainAddresses'> & { chainAddresses?: ChainAddress[] }) => {
    const newWallet: Wallet = {
      ...wallet,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      keyType: wallet.keyType ?? 'mnemonic',
      chainAddresses: wallet.chainAddresses || [
        { chain: wallet.chain, address: wallet.address, tokens: [] }
      ],
      tokens: [],
    }

    walletStore.setState((state) => {
      const wallets = [...state.wallets, newWallet]
      const currentWalletId = state.currentWalletId || newWallet.id
      
      // 持久化
      persistWallets(wallets, currentWalletId)
      
      return {
        ...state,
        wallets,
        currentWalletId,
      }
    })

    return newWallet
  },

  /** 导入钱包 */
  importWallet: (wallet: Omit<Wallet, 'id' | 'createdAt' | 'tokens' | 'chainAddresses'> & { chainAddresses?: ChainAddress[] }) => {
    return walletActions.createWallet(wallet)
  },

  /** 删除钱包 */
  deleteWallet: (walletId: string) => {
    walletStore.setState((state) => {
      const wallets = state.wallets.filter((w) => w.id !== walletId)
      const currentWalletId = state.currentWalletId === walletId
        ? wallets[0]?.id || null
        : state.currentWalletId
      
      persistWallets(wallets, currentWalletId)
      
      return {
        ...state,
        wallets,
        currentWalletId,
      }
    })
  },

  /** 切换当前钱包 */
  setCurrentWallet: (walletId: string) => {
    walletStore.setState((state) => {
      persistWallets(state.wallets, walletId)
      return {
        ...state,
        currentWalletId: walletId,
      }
    })
  },

  /** 切换当前链 */
  setSelectedChain: (chain: ChainType) => {
    walletStore.setState((state) => ({
      ...state,
      selectedChain: chain,
    }))
  },

  /** 更新钱包名称 */
  updateWalletName: (walletId: string, name: string) => {
    walletStore.setState((state) => {
      const wallets = state.wallets.map((w) =>
        w.id === walletId ? { ...w, name } : w
      )
      persistWallets(wallets, state.currentWalletId)
      return { ...state, wallets }
    })
  },

  /** 更新代币余额 */
  updateTokens: (walletId: string, tokens: Token[]) => {
    walletStore.setState((state) => {
      const wallets = state.wallets.map((w) =>
        w.id === walletId ? { ...w, tokens } : w
      )
      persistWallets(wallets, state.currentWalletId)
      return { ...state, wallets }
    })
  },

  /** 更新钱包加密助记词（密码修改时使用） */
  updateWalletEncryptedMnemonic: (walletId: string, encryptedMnemonic: EncryptedData) => {
    walletStore.setState((state) => {
      const wallets = state.wallets.map((w) =>
        w.id === walletId ? { ...w, encryptedMnemonic } : w
      )
      persistWallets(wallets, state.currentWalletId)
      return { ...state, wallets }
    })
  },

  /** 清除所有数据 */
  clearAll: () => {
    localStorage.removeItem('bfm_wallets')
    walletStore.setState(() => initialState)
  },
}

// 持久化辅助函数
function persistWallets(wallets: Wallet[], currentWalletId: string | null) {
  try {
    localStorage.setItem(
      'bfm_wallets',
      JSON.stringify({ wallets, currentWalletId })
    )
  } catch (error) {
    console.error('Failed to persist wallets:', error)
  }
}

// Selectors (派生状态)
export const walletSelectors = {
  /** 获取当前钱包 */
  getCurrentWallet: (state: WalletState): Wallet | null => {
    if (!state.currentWalletId) return null
    return state.wallets.find((w) => w.id === state.currentWalletId) || null
  },

  /** 获取当前链地址信息 */
  getCurrentChainAddress: (state: WalletState): ChainAddress | null => {
    const wallet = walletSelectors.getCurrentWallet(state)
    if (!wallet) return null
    return wallet.chainAddresses.find((ca) => ca.chain === state.selectedChain) || null
  },

  /** 获取当前链的代币列表 */
  getCurrentChainTokens: (state: WalletState): Token[] => {
    const chainAddress = walletSelectors.getCurrentChainAddress(state)
    return chainAddress?.tokens || []
  },

  /** 获取可用的链列表 */
  getAvailableChains: (state: WalletState): ChainType[] => {
    const wallet = walletSelectors.getCurrentWallet(state)
    if (!wallet) return []
    return wallet.chainAddresses.map((ca) => ca.chain)
  },

  /** 获取钱包总余额（法币） */
  getTotalFiatValue: (state: WalletState): number => {
    const currentWallet = walletSelectors.getCurrentWallet(state)
    if (!currentWallet) return 0
    // 汇总所有链的代币价值
    return currentWallet.chainAddresses.reduce((sum, ca) => 
      sum + ca.tokens.reduce((s, t) => s + t.fiatValue, 0), 0
    )
  },

  /** 是否有钱包 */
  hasWallet: (state: WalletState): boolean => {
    return state.wallets.length > 0
  },
}
