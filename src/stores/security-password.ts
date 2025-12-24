/**
 * 安全密码状态管理
 * 
 * 管理每个地址的 secondPublicKey（安全密码公钥）
 * - 进入钱包/切换地址时查询并缓存
 * - 所有签名交易时使用缓存的公钥判断是否需要安全密码
 */
import { Store } from '@tanstack/react-store'

export interface SecurityPasswordState {
  /** 地址 -> secondPublicKey 映射 */
  publicKeys: Record<string, string | null>
  /** 地址 -> 是否正在加载 */
  loading: Record<string, boolean>
  /** 地址 -> 错误信息 */
  errors: Record<string, string | null>
}

const initialState: SecurityPasswordState = {
  publicKeys: {},
  loading: {},
  errors: {},
}

export const securityPasswordStore = new Store<SecurityPasswordState>(initialState)

export const securityPasswordActions = {
  /** 设置地址的安全密码公钥 */
  setPublicKey: (address: string, publicKey: string | null) => {
    securityPasswordStore.setState((state) => ({
      ...state,
      publicKeys: { ...state.publicKeys, [address]: publicKey },
      loading: { ...state.loading, [address]: false },
      errors: { ...state.errors, [address]: null },
    }))
  },

  /** 设置加载状态 */
  setLoading: (address: string, loading: boolean) => {
    securityPasswordStore.setState((state) => ({
      ...state,
      loading: { ...state.loading, [address]: loading },
    }))
  },

  /** 设置错误 */
  setError: (address: string, error: string | null) => {
    securityPasswordStore.setState((state) => ({
      ...state,
      errors: { ...state.errors, [address]: error },
      loading: { ...state.loading, [address]: false },
    }))
  },

  /** 清除地址的缓存 */
  clearAddress: (address: string) => {
    securityPasswordStore.setState((state) => {
      const { [address]: _pk, ...publicKeys } = state.publicKeys
      const { [address]: _ld, ...loading } = state.loading
      const { [address]: _er, ...errors } = state.errors
      return { publicKeys, loading, errors }
    })
  },

  /** 清除所有缓存 */
  clearAll: () => {
    securityPasswordStore.setState(() => initialState)
  },
}

export const securityPasswordSelectors = {
  /** 获取地址的安全密码公钥 */
  getPublicKey: (state: SecurityPasswordState, address: string): string | null | undefined => {
    return state.publicKeys[address]
  },

  /** 地址是否设置了安全密码 */
  hasSecurityPassword: (state: SecurityPasswordState, address: string): boolean => {
    return !!state.publicKeys[address]
  },

  /** 是否正在加载 */
  isLoading: (state: SecurityPasswordState, address: string): boolean => {
    return state.loading[address] ?? false
  },

  /** 获取错误 */
  getError: (state: SecurityPasswordState, address: string): string | null => {
    return state.errors[address] ?? null
  },

  /** 公钥是否已加载（包括确认没有安全密码的情况） */
  isLoaded: (state: SecurityPasswordState, address: string): boolean => {
    return address in state.publicKeys
  },
}
