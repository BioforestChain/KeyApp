import { Store } from '@tanstack/react-store'
import type { EncryptedData } from '@/lib/crypto'
import { type BioforestChainType } from '@/lib/crypto'
import {
  walletStorageService,
  type WalletInfo,
  type ChainAddressInfo,
} from '@/services/wallet-storage'

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

// Helper: 将 WalletStorageService 数据转换为 UI Wallet
function walletInfoToWallet(info: WalletInfo, chainAddresses: ChainAddressInfo[]): Wallet {
  // Map keyType (service may have 'privateKey' which we treat as 'arbitrary')
  const keyType: 'mnemonic' | 'arbitrary' = 
    info.keyType === 'mnemonic' ? 'mnemonic' : 'arbitrary'

  const wallet: Wallet = {
    id: info.id,
    name: info.name,
    keyType,
    address: info.primaryAddress,
    chain: info.primaryChain,
    createdAt: info.createdAt,
    chainAddresses: chainAddresses.map((ca): ChainAddress => ({
      chain: ca.chain,
      address: ca.address,
      tokens: ca.assets.map((asset): Token => {
        const token: Token = {
          id: `${ca.chain}:${asset.assetType}`,
          symbol: asset.symbol,
          name: asset.symbol,
          balance: asset.balance,
          fiatValue: 0, // TODO: 从汇率服务获取
          change24h: 0,
          decimals: asset.decimals,
          chain: ca.chain,
        }
        if (asset.contractAddress) {
          token.contractAddress = asset.contractAddress
        }
        if (asset.logoUrl) {
          token.icon = asset.logoUrl
        }
        return token
      }),
    })),
    tokens: [], // deprecated
  }
  
  if (info.encryptedMnemonic) {
    wallet.encryptedMnemonic = info.encryptedMnemonic
  }
  
  return wallet
}

// Actions
export const walletActions = {
  /** 初始化钱包（从 IndexedDB 加载） */
  initialize: async () => {
    const currentState = walletStore.state
    if (currentState.isInitialized || currentState.isLoading) return

    walletStore.setState((state) => ({ ...state, isLoading: true }))
    
    try {
      // 初始化 WalletStorageService
      await walletStorageService.initialize()
      
      // 尝试从 localStorage 迁移旧数据
      await walletStorageService.migrateFromLocalStorage()
      
      // 从 IndexedDB 加载钱包
      const [walleterInfo, storedWallets] = await Promise.all([
        walletStorageService.getWalleterInfo(),
        walletStorageService.getAllWallets(),
      ])

      // 转换为 UI 状态
      const wallets: Wallet[] = await Promise.all(
        storedWallets.map(async (w) => {
          const chainAddresses = await walletStorageService.getWalletChainAddresses(w.id)
          return walletInfoToWallet(w, chainAddresses)
        })
      )

      walletStore.setState((state) => ({
        ...state,
        wallets,
        currentWalletId: walleterInfo?.activeWalletId ?? wallets[0]?.id ?? null,
        isInitialized: true,
        isLoading: false,
      }))
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
  createWallet: async (
    wallet: Omit<Wallet, 'id' | 'createdAt' | 'tokens' | 'chainAddresses'> & { chainAddresses?: ChainAddress[] },
    mnemonic: string,
    password: string
  ): Promise<Wallet> => {
    const walletId = crypto.randomUUID()
    const now = Date.now()

    // 保存到 IndexedDB
    const walletInfo: Omit<WalletInfo, 'encryptedMnemonic'> = {
      id: walletId,
      name: wallet.name,
      keyType: wallet.keyType ?? 'mnemonic',
      primaryChain: wallet.chain,
      primaryAddress: wallet.address,
      isBackedUp: false,
      createdAt: now,
      updatedAt: now,
    }

    const savedWalletInfo = await walletStorageService.createWallet(walletInfo, mnemonic, password)

    // 保存链地址
    const chainAddresses = wallet.chainAddresses || [
      { chain: wallet.chain, address: wallet.address, tokens: [] }
    ]
    
    for (const ca of chainAddresses) {
      await walletStorageService.saveChainAddress({
        addressKey: `${walletId}:${ca.chain}`,
        walletId,
        chain: ca.chain,
        address: ca.address,
        assets: [],
        isCustomAssets: false,
        isFrozen: false,
      })
    }

    // 更新 walleter info
    const walleterInfo = await walletStorageService.getWalleterInfo()
    await walletStorageService.saveWalleterInfo({
      name: walleterInfo?.name ?? 'User',
      activeWalletId: walletId,
      biometricEnabled: walleterInfo?.biometricEnabled ?? false,
      passwordLockEnabled: walleterInfo?.passwordLockEnabled ?? false,
      agreementAccepted: true,
      createdAt: walleterInfo?.createdAt ?? now,
      updatedAt: now,
    })

    const newWallet: Wallet = {
      id: walletId,
      name: wallet.name,
      keyType: wallet.keyType ?? 'mnemonic',
      address: wallet.address,
      chain: wallet.chain,
      createdAt: now,
      chainAddresses,
      tokens: [],
      ...(savedWalletInfo.encryptedMnemonic ? { encryptedMnemonic: savedWalletInfo.encryptedMnemonic } : {}),
    }

    walletStore.setState((state) => ({
      ...state,
      wallets: [...state.wallets, newWallet],
      currentWalletId: walletId,
    }))

    return newWallet
  },

  /** 导入钱包 */
  importWallet: async (
    wallet: Omit<Wallet, 'id' | 'createdAt' | 'tokens' | 'chainAddresses'> & { chainAddresses?: ChainAddress[] },
    mnemonic: string,
    password: string
  ): Promise<Wallet> => {
    return walletActions.createWallet(wallet, mnemonic, password)
  },

  /** 删除钱包 */
  deleteWallet: async (walletId: string): Promise<void> => {
    await walletStorageService.deleteWallet(walletId)
    
    walletStore.setState((state) => {
      const wallets = state.wallets.filter((w) => w.id !== walletId)
      const currentWalletId = state.currentWalletId === walletId
        ? wallets[0]?.id ?? null
        : state.currentWalletId
      
      return {
        ...state,
        wallets,
        currentWalletId,
      }
    })
  },

  /** 切换当前钱包 */
  setCurrentWallet: async (walletId: string): Promise<void> => {
    const walleterInfo = await walletStorageService.getWalleterInfo()
    if (walleterInfo) {
      await walletStorageService.saveWalleterInfo({
        ...walleterInfo,
        activeWalletId: walletId,
        updatedAt: Date.now(),
      })
    }
    
    walletStore.setState((state) => ({
      ...state,
      currentWalletId: walletId,
    }))
  },

  /** 切换当前链 */
  setSelectedChain: (chain: ChainType) => {
    walletStore.setState((state) => ({
      ...state,
      selectedChain: chain,
    }))
  },

  /** 更新钱包名称 */
  updateWalletName: async (walletId: string, name: string): Promise<void> => {
    await walletStorageService.updateWallet(walletId, { name })
    
    walletStore.setState((state) => ({
      ...state,
      wallets: state.wallets.map((w) =>
        w.id === walletId ? { ...w, name } : w
      ),
    }))
  },

  /** 更新链地址资产（用于余额更新） */
  updateChainAssets: async (
    walletId: string,
    chain: ChainType,
    tokens: Token[]
  ): Promise<void> => {
    const addressKey = `${walletId}:${chain}`
    
    // 更新 IndexedDB
    await walletStorageService.updateAssets(
      addressKey,
      tokens.map((t) => ({
        assetType: t.symbol,
        symbol: t.symbol,
        decimals: t.decimals,
        balance: t.balance,
        contractAddress: t.contractAddress,
        logoUrl: t.icon,
      }))
    )
    
    // 更新 store
    walletStore.setState((state) => ({
      ...state,
      wallets: state.wallets.map((w) => {
        if (w.id !== walletId) return w
        return {
          ...w,
          chainAddresses: w.chainAddresses.map((ca) =>
            ca.chain === chain ? { ...ca, tokens } : ca
          ),
        }
      }),
    }))
  },

  /** 更新钱包加密助记词（密码修改时使用） */
  updateWalletEncryptedMnemonic: async (
    walletId: string,
    oldPassword: string,
    newPassword: string
  ): Promise<void> => {
    await walletStorageService.updateMnemonicEncryption(walletId, oldPassword, newPassword)
    
    // 重新加载钱包以获取新的加密数据
    const updatedWallet = await walletStorageService.getWallet(walletId)
    if (updatedWallet?.encryptedMnemonic) {
      const encryptedMnemonic = updatedWallet.encryptedMnemonic
      walletStore.setState((state) => ({
        ...state,
        wallets: state.wallets.map((w) =>
          w.id === walletId ? { ...w, encryptedMnemonic } : w
        ),
      }))
    }
  },

  /** 获取解密的助记词 */
  getMnemonic: async (walletId: string, password: string): Promise<string> => {
    return walletStorageService.getMnemonic(walletId, password)
  },

  /** 清除所有数据 */
  clearAll: async (): Promise<void> => {
    await walletStorageService.clearAll()
    walletStore.setState(() => initialState)
  },

  // ==================== 测试辅助方法 ====================

  /**
   * 测试专用：直接添加钱包到 store（不经过 IndexedDB）
   * @internal 仅用于测试
   */
  _testAddWallet: (
    wallet: Omit<Wallet, 'id' | 'createdAt' | 'tokens'> & { 
      id?: string
      createdAt?: number
      chainAddresses?: ChainAddress[]
    }
  ): Wallet => {
    const newWallet: Wallet = {
      id: wallet.id ?? crypto.randomUUID(),
      name: wallet.name,
      keyType: wallet.keyType ?? 'mnemonic',
      address: wallet.address,
      chain: wallet.chain,
      createdAt: wallet.createdAt ?? Date.now(),
      chainAddresses: wallet.chainAddresses ?? [
        { chain: wallet.chain, address: wallet.address, tokens: [] }
      ],
      tokens: [],
      ...(wallet.encryptedMnemonic ? { encryptedMnemonic: wallet.encryptedMnemonic } : {}),
    }

    walletStore.setState((state) => ({
      ...state,
      wallets: [...state.wallets, newWallet],
      currentWalletId: state.currentWalletId ?? newWallet.id,
      isInitialized: true,
    }))

    return newWallet
  },

  /**
   * 测试专用：重置 store 状态
   * @internal 仅用于测试
   */
  _testReset: (): void => {
    walletStore.setState(() => initialState)
  },
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
