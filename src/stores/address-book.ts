import { Store } from '@tanstack/react-store'
import { type ChainType } from './wallet'

// 联系人类型
export interface Contact {
  id: string
  /** 名称 */
  name: string
  /** 地址 */
  address: string
  /** 链类型（可选，用于区分不同链的地址） */
  chain?: ChainType
  /** 备注 */
  memo?: string
  /** 创建时间 */
  createdAt: number
  /** 更新时间 */
  updatedAt: number
}

export interface AddressBookState {
  contacts: Contact[]
  isInitialized: boolean
}

// 初始状态
const initialState: AddressBookState = {
  contacts: [],
  isInitialized: false,
}

// 创建 Store
export const addressBookStore = new Store<AddressBookState>(initialState)

// 持久化键
const STORAGE_KEY = 'bfm_address_book'

// 持久化辅助函数
function persistContacts(contacts: Contact[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts))
  } catch (error) {
    console.error('Failed to persist address book:', error)
  }
}

// Actions
export const addressBookActions = {
  /** 初始化（从存储加载） */
  initialize: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const contacts = JSON.parse(stored) as Contact[]
        addressBookStore.setState(() => ({
          contacts,
          isInitialized: true,
        }))
      } else {
        addressBookStore.setState((state) => ({
          ...state,
          isInitialized: true,
        }))
      }
    } catch (error) {
      console.error('Failed to initialize address book:', error)
      addressBookStore.setState((state) => ({
        ...state,
        isInitialized: true,
      }))
    }
  },

  /** 添加联系人 */
  addContact: (contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'> & { chain?: ChainType | undefined; memo?: string | undefined }) => {
    const now = Date.now()
    const newContact: Contact = {
      ...contact,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    }

    addressBookStore.setState((state) => {
      const contacts = [...state.contacts, newContact]
      persistContacts(contacts)
      return { ...state, contacts }
    })

    return newContact
  },

  /** 更新联系人 */
  updateContact: (id: string, updates: Partial<Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>> & { memo?: string | undefined; chain?: ChainType | undefined }) => {
    addressBookStore.setState((state) => {
      const contacts = state.contacts.map((c) =>
        c.id === id
          ? { ...c, ...updates, updatedAt: Date.now() }
          : c
      )
      persistContacts(contacts)
      return { ...state, contacts }
    })
  },

  /** 删除联系人 */
  deleteContact: (id: string) => {
    addressBookStore.setState((state) => {
      const contacts = state.contacts.filter((c) => c.id !== id)
      persistContacts(contacts)
      return { ...state, contacts }
    })
  },

  /** 清除所有联系人 */
  clearAll: () => {
    localStorage.removeItem(STORAGE_KEY)
    addressBookStore.setState(() => initialState)
  },
}

// Selectors
export const addressBookSelectors = {
  /** 根据地址查找联系人 */
  getContactByAddress: (state: AddressBookState, address: string): Contact | undefined => {
    return state.contacts.find(
      (c) => c.address.toLowerCase() === address.toLowerCase()
    )
  },

  /** 搜索联系人（名称或地址） */
  searchContacts: (state: AddressBookState, query: string): Contact[] => {
    const lowerQuery = query.toLowerCase()
    return state.contacts.filter(
      (c) =>
        c.name.toLowerCase().includes(lowerQuery) ||
        c.address.toLowerCase().includes(lowerQuery)
    )
  },

  /** 按链类型过滤 */
  getContactsByChain: (state: AddressBookState, chain: ChainType): Contact[] => {
    return state.contacts.filter((c) => c.chain === chain)
  },
}
