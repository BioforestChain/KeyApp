import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react'
import { useStore } from '@tanstack/react-store'
import { addressBookStore, addressBookActions, addressBookSelectors, type ChainType, type ContactSuggestion } from '@/stores'

interface ContactSuggestionContextValue {
  /** 根据查询获取建议 */
  getSuggestions: (query: string, chainType?: ChainType, limit?: number) => ContactSuggestion[]
  /** 是否有联系人 */
  hasContacts: boolean
}

const ContactSuggestionContext = createContext<ContactSuggestionContextValue | null>(null)

/**
 * 地址簿联系人建议 Provider
 * 确保 store 已初始化，并提供联系人查询能力
 */
export function AddressBookSuggestionProvider({ children }: { children: ReactNode }) {
  const addressBookState = useStore(addressBookStore)

  // 确保 store 已初始化
  useEffect(() => {
    if (!addressBookState.isInitialized) {
      addressBookActions.initialize()
    }
  }, [addressBookState.isInitialized])

  const value = useMemo<ContactSuggestionContextValue>(() => ({
    getSuggestions: (query, chainType, limit = 5) => 
      addressBookSelectors.suggestContacts(addressBookState, query, chainType, limit),
    hasContacts: addressBookState.contacts.length > 0,
  }), [addressBookState])

  return (
    <ContactSuggestionContext.Provider value={value}>
      {children}
    </ContactSuggestionContext.Provider>
  )
}

/**
 * 获取联系人建议 context
 * 如果不在 Provider 内，返回空实现（不报错，保持组件可独立使用）
 */
export function useContactSuggestions() {
  const context = useContext(ContactSuggestionContext)
  
  // 返回默认空实现，让组件可以独立工作
  if (!context) {
    return {
      getSuggestions: () => [],
      hasContacts: false,
    }
  }
  
  return context
}
