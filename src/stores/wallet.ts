import { Store } from '@tanstack/react-store'
import type { EncryptedData } from '@/lib/crypto'
import { type BioforestChainType } from '@/lib/crypto'
import {
  walletStorageService,
  type WalletInfo,
  type ChainAddressInfo,
  WalletStorageMigrationError,
} from '@/services/wallet-storage'

/**
 * 基于助记词/密钥稳定派生主题色 hue
 */
function deriveThemeHue(secret: string): number {
  let hash = 0
  for (let i = 0; i < secret.length; i++) {
    const char = secret.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash) % 360
}

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
  /** 公钥（hex 编码） */
  publicKey: string
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
  /** 加密后的助记词（使用钱包锁加密） */
  encryptedMnemonic?: EncryptedData
  /** 加密后的钱包锁（使用助记词派生密钥加密） */
  encryptedWalletLock?: EncryptedData
  createdAt: number
  /** 主题色 hue (0-360) */
  themeHue: number
  /** @deprecated 使用 chainAddresses[].tokens */
  tokens: Token[]
}

export interface WalletState {
  wallets: Wallet[]
  currentWalletId: string | null
  /** 当前选中的链 */
  selectedChain: ChainType
  /** 每个钱包的链偏好设置 (walletId -> chainId) */
  chainPreferences: Record<string, ChainType>
  isLoading: boolean
  isInitialized: boolean
  /** 需要迁移数据库 */
  migrationRequired: boolean
}

// localStorage key for chain preferences
const CHAIN_PREFERENCES_KEY = 'wallet_chain_preferences'

// Helper: Load chain preferences from localStorage
function loadChainPreferences(): Record<string, ChainType> {
  try {
    const stored = localStorage.getItem(CHAIN_PREFERENCES_KEY)
    if (stored) {
      return JSON.parse(stored) as Record<string, ChainType>
    }
  } catch {
    // Ignore parse errors
  }
  return {}
}

// Helper: Save chain preferences to localStorage
function saveChainPreferences(preferences: Record<string, ChainType>): void {
  try {
    localStorage.setItem(CHAIN_PREFERENCES_KEY, JSON.stringify(preferences))
  } catch {
    // Ignore storage errors
  }
}

// 初始状态
const initialState: WalletState = {
  wallets: [],
  currentWalletId: null,
  selectedChain: 'ethereum',
  chainPreferences: {},
  isLoading: false,
  isInitialized: false,
  migrationRequired: false,
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
      publicKey: ca.publicKey ?? '',
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
    themeHue: info.themeHue ?? 0,
    tokens: [], // deprecated
  }
  
  if (info.encryptedMnemonic) {
    wallet.encryptedMnemonic = info.encryptedMnemonic
  }
  if (info.encryptedWalletLock) {
    wallet.encryptedWalletLock = info.encryptedWalletLock
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

      // 加载链偏好设置
      const chainPreferences = loadChainPreferences()
      const currentWalletId = walleterInfo?.activeWalletId ?? wallets[0]?.id ?? null
      
      // 获取当前钱包的偏好链，或使用钱包的主链，或默认
      const currentWallet = wallets.find(w => w.id === currentWalletId)
      const preferredChain = currentWalletId 
        ? (chainPreferences[currentWalletId] ?? currentWallet?.chain ?? 'bfmeta')
        : 'bfmeta'

      walletStore.setState((state) => ({
        ...state,
        wallets,
        currentWalletId,
        selectedChain: preferredChain,
        chainPreferences,
        isInitialized: true,
        isLoading: false,
      }))
    } catch (error) {
      // 检测版本不兼容错误
      if (error instanceof WalletStorageMigrationError) {
        walletStore.setState((state) => ({
          ...state,
          isInitialized: true,
          isLoading: false,
          migrationRequired: true,
        }))
        return
      }
      
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
    password: string,
    themeHue?: number
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
      themeHue: themeHue ?? deriveThemeHue(mnemonic),
      createdAt: now,
      updatedAt: now,
    }

    const savedWalletInfo = await walletStorageService.createWallet(walletInfo, mnemonic, password)

    // 保存链地址
    const chainAddresses = wallet.chainAddresses || [
      { chain: wallet.chain, address: wallet.address, publicKey: '', tokens: [] }
    ]
    
    for (const ca of chainAddresses) {
      await walletStorageService.saveChainAddress({
        addressKey: `${walletId}:${ca.chain}`,
        walletId,
        chain: ca.chain,
        address: ca.address,
        publicKey: ca.publicKey,
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
      walletLockEnabled: walleterInfo?.walletLockEnabled ?? false,
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
      themeHue: themeHue ?? deriveThemeHue(mnemonic),
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
      
      // 删除该钱包的链偏好
      const { [walletId]: _, ...remainingPreferences } = state.chainPreferences
      saveChainPreferences(remainingPreferences)
      
      // 如果切换到新钱包，使用其偏好链
      const newWallet = wallets.find(w => w.id === currentWalletId)
      const selectedChain = currentWalletId
        ? (remainingPreferences[currentWalletId] ?? newWallet?.chain ?? 'bfmeta')
        : state.selectedChain
      
      return {
        ...state,
        wallets,
        currentWalletId,
        selectedChain,
        chainPreferences: remainingPreferences,
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
    
    walletStore.setState((state) => {
      // 获取目标钱包的偏好链
      const targetWallet = state.wallets.find(w => w.id === walletId)
      const preferredChain = state.chainPreferences[walletId] ?? targetWallet?.chain ?? 'bfmeta'
      
      return {
        ...state,
        currentWalletId: walletId,
        selectedChain: preferredChain,
      }
    })
  },

  /** 切换当前链 */
  setSelectedChain: (chain: ChainType) => {
    walletStore.setState((state) => {
      const { currentWalletId, chainPreferences } = state
      
      // 保存当前钱包的链偏好
      if (currentWalletId) {
        const newPreferences = { ...chainPreferences, [currentWalletId]: chain }
        saveChainPreferences(newPreferences)
        
        return {
          ...state,
          selectedChain: chain,
          chainPreferences: newPreferences,
        }
      }
      
      return {
        ...state,
        selectedChain: chain,
      }
    })
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

  /** 更新钱包主题色 */
  updateWalletThemeHue: async (walletId: string, themeHue: number): Promise<void> => {
    await walletStorageService.updateWallet(walletId, { themeHue })
    
    walletStore.setState((state) => ({
      ...state,
      wallets: state.wallets.map((w) =>
        w.id === walletId ? { ...w, themeHue } : w
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

  /** 刷新钱包余额返回结果 */
  RefreshBalanceResult: undefined as unknown as { supported: boolean; fallbackReason?: string },

  /** 刷新钱包余额（从链上获取） */
  refreshBalance: async (walletId: string, chain: ChainType): Promise<{ supported: boolean; fallbackReason?: string }> => {
    const state = walletStore.state
    const wallet = state.wallets.find((w) => w.id === walletId)
    if (!wallet) return { supported: false, fallbackReason: 'Wallet not found' }

    const chainAddress = wallet.chainAddresses.find((ca) => ca.chain === chain)
    if (!chainAddress) return { supported: false, fallbackReason: 'Chain address not found' }

    try {
      // 动态导入避免循环依赖
      const { getChainProvider, isSupported } = await import('@/services/chain-adapter/providers')
      const chainProvider = getChainProvider(chain)
      
      // 1. 优先尝试 getTokenBalances（获取完整资产列表）
      if (chainProvider.supportsTokenBalances) {
        const tokensResult = await chainProvider.getTokenBalances(chainAddress.address)
        if (isSupported(tokensResult) && tokensResult.data.length > 0) {
          const tokens: Token[] = tokensResult.data.map((t) => ({
            id: `${chain}:${t.symbol}`,
            symbol: t.symbol,
            name: t.name,
            balance: t.amount.toFormatted(),
            fiatValue: 0,
            change24h: 0,
            decimals: t.amount.decimals,
            chain,
          }))
          await walletActions.updateChainAssets(walletId, chain, tokens)
          return { supported: true }
        }
      }
      
      // 2. Fallback: getNativeBalance（仅获取原生代币）
      const result = await chainProvider.getNativeBalance(chainAddress.address)
      
      if (!isSupported(result)) {
        if (import.meta.env.DEV) {
          console.debug(`[refreshBalance] Balance query failed for ${chain}: ${result.reason}`)
        }
        return { supported: false, fallbackReason: result.reason }
      }

      const balance = result.data
      
      const tokens: Token[] = [{
        id: `${chain}:${balance.symbol}`,
        symbol: balance.symbol,
        name: balance.symbol,
        balance: balance.amount.toFormatted(),
        fiatValue: 0,
        change24h: 0,
        decimals: balance.amount.decimals,
        chain,
      }]

      await walletActions.updateChainAssets(walletId, chain, tokens)
      return { supported: true }
    } catch (error) {
      console.error(`[refreshBalance] Failed to refresh balance for ${chain}:`, error)
      return { supported: false, fallbackReason: error instanceof Error ? error.message : 'Unknown error' }
    }
  },

  /** 刷新当前钱包所有链的余额 */
  refreshAllBalances: async (): Promise<void> => {
    const state = walletStore.state
    const wallet = walletSelectors.getCurrentWallet(state)
    if (!wallet) return

    // 并行刷新所有链的余额
    await Promise.all(
      wallet.chainAddresses.map((ca) => 
        walletActions.refreshBalance(wallet.id, ca.chain)
      )
    )
  },

  /** 更新钱包锁（使用旧钱包锁验证） */
  updateWalletLock: async (
    walletId: string,
    oldWalletLock: string,
    newWalletLock: string
  ): Promise<void> => {
    await walletStorageService.updateWalletLockEncryption(walletId, oldWalletLock, newWalletLock)
    
    // 重新加载钱包以获取新的加密数据
    const updatedWallet = await walletStorageService.getWallet(walletId)
    if (updatedWallet?.encryptedMnemonic && updatedWallet.encryptedWalletLock) {
      walletStore.setState((state) => ({
        ...state,
        wallets: state.wallets.map((w) =>
          w.id === walletId ? { 
            ...w, 
            encryptedMnemonic: updatedWallet.encryptedMnemonic!,
            encryptedWalletLock: updatedWallet.encryptedWalletLock!,
          } : w
        ),
      }))
    }
  },

  /** 验证助记词是否正确（不修改数据） */
  verifyMnemonic: async (
    walletId: string,
    mnemonic: string
  ): Promise<boolean> => {
    return walletStorageService.verifyMnemonic(walletId, mnemonic)
  },

  /** 使用助记词重置钱包锁 */
  resetWalletLockByMnemonic: async (
    walletId: string,
    mnemonic: string,
    newWalletLock: string
  ): Promise<void> => {
    await walletStorageService.resetWalletLockByMnemonic(walletId, mnemonic, newWalletLock)
    
    // 重新加载钱包以获取新的加密数据
    const updatedWallet = await walletStorageService.getWallet(walletId)
    if (updatedWallet?.encryptedMnemonic && updatedWallet.encryptedWalletLock) {
      walletStore.setState((state) => ({
        ...state,
        wallets: state.wallets.map((w) =>
          w.id === walletId ? { 
            ...w, 
            encryptedMnemonic: updatedWallet.encryptedMnemonic!,
            encryptedWalletLock: updatedWallet.encryptedWalletLock!,
          } : w
        ),
      }))
    }
  },

  /** 获取解密的助记词 */
  getMnemonic: async (walletId: string, password: string): Promise<string> => {
    return walletStorageService.getMnemonic(walletId, password)
  },

  /** 更新钱包链地址（添加/移除链） */
  updateWalletChainAddresses: async (
    walletId: string,
    newChainIds: string[],
    password: string,
    chainConfigs: import('@/services/chain-config').ChainConfig[]
  ): Promise<void> => {
    const state = walletStore.state
    const wallet = state.wallets.find((w) => w.id === walletId)
    if (!wallet) throw new Error('Wallet not found')

    // 先验证密码（无论是否有变化，都需要验证）
    const mnemonic = await walletStorageService.getMnemonic(walletId, password)

    // 获取现有链ID
    const existingChainIds = new Set(wallet.chainAddresses.map((ca) => ca.chain))
    const newChainIdSet = new Set(newChainIds)

    // 计算需要添加和移除的链
    const chainsToAdd = newChainIds.filter((id) => !existingChainIds.has(id))
    const chainsToRemove = [...existingChainIds].filter((id) => !newChainIdSet.has(id))

    // 如果没有变化，直接返回
    if (chainsToAdd.length === 0 && chainsToRemove.length === 0) {
      return
    }

    // 如果有需要添加的链，派生地址
    let newAddresses: Array<{ chain: string; address: string; publicKey: string }> = []
    if (chainsToAdd.length > 0) {
      // 动态导入避免循环依赖
      const { deriveWalletChainAddresses } = await import('@/services/chain-adapter')

      // 只派生需要添加的链
      const chainsToDerive = chainConfigs.filter((c) => chainsToAdd.includes(c.id))
      const derivedAddresses = await deriveWalletChainAddresses({
        mnemonic,
        chainConfigs: chainsToDerive,
        selectedChainIds: chainsToAdd,
      })

      newAddresses = derivedAddresses.map((a) => ({
        chain: a.chainId,
        address: a.address,
        publicKey: a.publicKey ?? '',
      }))
    }

    // 更新 IndexedDB - 添加新链地址
    for (const addr of newAddresses) {
      await walletStorageService.saveChainAddress({
        addressKey: `${walletId}:${addr.chain}`,
        walletId,
        chain: addr.chain,
        address: addr.address,
        publicKey: addr.publicKey,
        assets: [],
        isCustomAssets: false,
        isFrozen: false,
      })
    }

    // 更新 IndexedDB - 移除链地址
    for (const chainId of chainsToRemove) {
      await walletStorageService.deleteChainAddress(`${walletId}:${chainId}`)
    }

    // 构建新的链地址列表
    const updatedChainAddresses: ChainAddress[] = [
      // 保留未移除的现有链地址
      ...wallet.chainAddresses.filter((ca) => !chainsToRemove.includes(ca.chain)),
      // 添加新链地址
      ...newAddresses.map((addr) => ({
        chain: addr.chain,
        address: addr.address,
        publicKey: addr.publicKey,
        tokens: [],
      })),
    ]

    // 更新 store
    walletStore.setState((state) => ({
      ...state,
      wallets: state.wallets.map((w) =>
        w.id === walletId ? { ...w, chainAddresses: updatedChainAddresses } : w
      ),
    }))
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
        { chain: wallet.chain, address: wallet.address, publicKey: '', tokens: [] }
      ],
      themeHue: wallet.themeHue,
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
