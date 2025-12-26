import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { useStore } from '@tanstack/react-store'
import { addressBookStore, addressBookSelectors, type ChainType, type ContactSuggestion } from '@/stores'

interface ContactSuggestionContextValue {
  /** 根据查询获取建议 */
  getSuggestions: (query: string, chainType?: ChainType, limit?: number) => ContactSuggestion[]
  /** 是否有联系人 */
  hasContacts: boolean
}

const ContactSuggestionContext = createContext<ContactSuggestionContextValue | null>(null)

/**
 * 地址簿联系人建议 Provider
 * 提供联系人查询能力（store 已由 StoreProvider 在 App 级别初始化）
 */
export function AddressBookSuggestionProvider({ children }: { children: ReactNode }) {
  const addressBookState = useStore(addressBookStore)

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
