import { Store } from '@tanstack/react-store'
import { type ChainType } from './wallet'
import { detectAddressFormat } from '@/lib/address-format'

/** 联系人地址（最多 3 个） */
export interface ContactAddress {
  id: string
  /** 地址 */
  address: string
  /** 地址标签，最多 10 字符，用于显示 */
  label?: string | undefined
  /** 是否默认地址 */
  isDefault?: boolean | undefined
}

/** 联系人类型 */
export interface Contact {
  id: string
  /** 名称 */
  name: string
  /** 头像（可选，emoji 或图片URL） */
  avatar?: string | undefined
  /** 多个地址（最多 3 个） */
  addresses: ContactAddress[]
  /** 备注 */
  memo?: string | undefined
  /** 创建时间 */
  createdAt: number
  /** 更新时间 */
  updatedAt: number
}

/** 存储格式 */
interface StorageData {
  version: number
  contacts: Contact[]
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
const CURRENT_VERSION = 3

/** 持久化辅助函数 */
function persistContacts(contacts: Contact[]) {
  try {
    const data: StorageData = {
      version: CURRENT_VERSION,
      contacts,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (error) {
    console.error('Failed to persist address book:', error)
  }
}

/** 加载数据（不兼容旧版） */
function loadContacts(): Contact[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return []

    const parsed = JSON.parse(stored)

    // 只加载当前版本
    if (parsed.version === CURRENT_VERSION && Array.isArray(parsed.contacts)) {
      return parsed.contacts as Contact[]
    }

    // 其他版本直接返回空（破坏性更新）
    return []
  } catch (error) {
    console.error('Failed to load address book:', error)
    return []
  }
}

// Actions
export const addressBookActions = {
  /** 初始化（从存储加载） */
  initialize: () => {
    const contacts = loadContacts()
    addressBookStore.setState(() => ({
      contacts,
      isInitialized: true,
    }))
  },

  /** 添加联系人（每个联系人最多 3 个地址） */
  addContact: (
    contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'> & {
      avatar?: string | undefined
      memo?: string | undefined
    }
  ): Contact => {
    // 验证地址数量限制
    if (contact.addresses.length > 3) {
      throw new Error('Maximum 3 addresses per contact')
    }

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
  updateContact: (
    id: string,
    updates: Partial<Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>> & {
      avatar?: string | undefined
      memo?: string | undefined
    }
  ) => {
    addressBookStore.setState((state) => {
      const contacts = state.contacts.map((c) =>
        c.id === id ? { ...c, ...updates, updatedAt: Date.now() } : c
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

  /** 添加地址到联系人（最多 3 个地址，超出将抛出错误） */
  addAddressToContact: (
    contactId: string,
    address: Omit<ContactAddress, 'id'> & { label?: string | undefined }
  ) => {
    const newAddress: ContactAddress = {
      ...address,
      id: crypto.randomUUID(),
    }

    addressBookStore.setState((state) => {
      const contacts = state.contacts.map((c) => {
        if (c.id !== contactId) return c
        // 限制每个联系人最多 3 个地址（QR 码容量限制）
        if (c.addresses.length >= 3) {
          throw new Error('Maximum 3 addresses per contact')
        }
        return {
          ...c,
          addresses: [...c.addresses, newAddress],
          updatedAt: Date.now(),
        }
      })
      persistContacts(contacts)
      return { ...state, contacts }
    })
  },

  /** 从联系人移除地址 */
  removeAddressFromContact: (contactId: string, addressId: string) => {
    addressBookStore.setState((state) => {
      const contacts = state.contacts.map((c) => {
        if (c.id !== contactId) return c
        return {
          ...c,
          addresses: c.addresses.filter((a) => a.id !== addressId),
          updatedAt: Date.now(),
        }
      })
      persistContacts(contacts)
      return { ...state, contacts }
    })
  },

  /** 设置默认地址 */
  setDefaultAddress: (contactId: string, addressId: string) => {
    addressBookStore.setState((state) => {
      const contacts = state.contacts.map((c) => {
        if (c.id !== contactId) return c
        return {
          ...c,
          addresses: c.addresses.map((a) => ({
            ...a,
            isDefault: a.id === addressId,
          })),
          updatedAt: Date.now(),
        }
      })
      persistContacts(contacts)
      return { ...state, contacts }
    })
  },

  /**
   * 批量导入联系人
   * 返回新增的联系人数量
   */
  importContacts: (contacts: Contact[]): number => {
    if (contacts.length === 0) return 0

    let importedCount = 0

    addressBookStore.setState((state) => {
      const existing = state.contacts
      // 按名称去重
      const existingNames = new Set(existing.map((c) => c.name.toLowerCase()))

      const newContacts = contacts.filter((c) => {
        const key = c.name.toLowerCase()
        if (existingNames.has(key)) return false
        existingNames.add(key)
        return true
      })

      importedCount = newContacts.length

      if (newContacts.length === 0) {
        return state
      }

      const merged = [...existing, ...newContacts]
      persistContacts(merged)

      return { ...state, contacts: merged }
    })

    return importedCount
  },

  /** 清除所有联系人 */
  clearAll: () => {
    localStorage.removeItem(STORAGE_KEY)
    addressBookStore.setState(() => initialState)
  },
}

/** 联系人建议 */
export interface ContactSuggestion {
  contact: Contact
  matchedAddress: ContactAddress
  matchType: 'exact' | 'prefix' | 'name'
  score: number
}

// Selectors
export const addressBookSelectors = {
  /** 根据地址查找联系人 */
  getContactByAddress: (
    state: AddressBookState,
    address: string
  ): { contact: Contact; matchedAddress: ContactAddress } | undefined => {
    const lowerAddress = address.toLowerCase()
    for (const contact of state.contacts) {
      const matchedAddress = contact.addresses.find(
        (a) => a.address.toLowerCase() === lowerAddress
      )
      if (matchedAddress) {
        return { contact, matchedAddress }
      }
    }
    return undefined
  },

  /** 搜索联系人（名称或地址） */
  searchContacts: (state: AddressBookState, query: string): Contact[] => {
    const lowerQuery = query.toLowerCase()
    return state.contacts.filter(
      (c) =>
        c.name.toLowerCase().includes(lowerQuery) ||
        c.addresses.some((a) => a.address.toLowerCase().includes(lowerQuery))
    )
  },

  /**
   * 获取联系人建议（用于地址输入）
   * @param state - 地址簿状态
   * @param partialAddress - 部分地址（可为空，空时返回所有联系人）
   * @param limit - 返回数量限制（默认 5）
   */
  suggestContacts: (
    state: AddressBookState,
    partialAddress: string,
    limit: number = 5
  ): ContactSuggestion[] => {
    const suggestions: ContactSuggestion[] = []
    const hasQuery = partialAddress && partialAddress.length > 0
    const lowerPartial = hasQuery ? partialAddress.toLowerCase() : ''

    // 按最近更新时间排序联系人
    const sortedContacts = [...state.contacts].sort(
      (a, b) => b.updatedAt - a.updatedAt
    )

    for (const contact of sortedContacts) {
      const relevantAddresses = contact.addresses

      if (relevantAddresses.length === 0) continue

      if (!hasQuery) {
        // 无查询：返回默认地址
        const defaultAddr =
          relevantAddresses.find((a) => a.isDefault) ?? relevantAddresses[0]
        if (defaultAddr) {
          suggestions.push({
            contact,
            matchedAddress: defaultAddr,
            matchType: 'name',
            score: 40, // 基础分数，靠 updatedAt 排序
          })
        }
        continue
      }

      // 有查询：匹配地址和名称
      for (const addr of relevantAddresses) {
        const lowerAddr = addr.address.toLowerCase()

        if (lowerAddr === lowerPartial) {
          suggestions.push({
            contact,
            matchedAddress: addr,
            matchType: 'exact',
            score: 100,
          })
        } else if (lowerAddr.startsWith(lowerPartial)) {
          suggestions.push({
            contact,
            matchedAddress: addr,
            matchType: 'prefix',
            score: 80,
          })
        } else if (lowerAddr.includes(lowerPartial)) {
          suggestions.push({
            contact,
            matchedAddress: addr,
            matchType: 'prefix',
            score: 50,
          })
        }
      }

      // 名称匹配
      if (contact.name.toLowerCase().includes(lowerPartial)) {
        const defaultAddr =
          relevantAddresses.find((a) => a.isDefault) ?? relevantAddresses[0]
        if (defaultAddr) {
          suggestions.push({
            contact,
            matchedAddress: defaultAddr,
            matchType: 'name',
            score: 60,
          })
        }
      }
    }

    // 去重（同一联系人+地址只保留最高分的）
    const seen = new Map<string, ContactSuggestion>()
    for (const s of suggestions) {
      const key = `${s.contact.id}:${s.matchedAddress.id}`
      const existing = seen.get(key)
      if (!existing || existing.score < s.score) {
        seen.set(key, s)
      }
    }

    // 排序：先按分数，再按最近更新时间
    return Array.from(seen.values())
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score
        return b.contact.updatedAt - a.contact.updatedAt
      })
      .slice(0, limit)
  },

  /** 按链类型过滤联系人（使用地址格式检测） */
  getContactsByChain: (state: AddressBookState, chain: ChainType): Contact[] => {
    return state.contacts.filter((c) =>
      c.addresses.some((a) => detectAddressFormat(a.address).chainType === chain)
    )
  },

  /** 获取联系人的默认地址 */
  getDefaultAddress: (contact: Contact, chainType?: ChainType): ContactAddress | undefined => {
    const relevantAddresses = chainType
      ? contact.addresses.filter((a) => detectAddressFormat(a.address).chainType === chainType)
      : contact.addresses

    return relevantAddresses.find((a) => a.isDefault) ?? relevantAddresses[0]
  },
}
