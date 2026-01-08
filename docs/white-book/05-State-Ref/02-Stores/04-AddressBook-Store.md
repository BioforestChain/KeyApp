# Address Book Store

> 源码: [`src/stores/address-book.ts`](https://github.com/AInewsAPP/KeyApp/blob/main/src/stores/address-book.ts)

## 概述

Address Book Store 管理用户联系人地址簿。每个联系人支持多地址（最多 3 个），支持地址格式自动检测。

## 数据结构

```typescript
interface Contact {
  id: string
  name: string
  avatar?: string           // emoji 或图片 URL
  addresses: ContactAddress[]  // 最多 3 个
  memo?: string
  createdAt: number
  updatedAt: number
}

interface ContactAddress {
  id: string
  address: string
  label?: string            // 最多 10 字符
  isDefault?: boolean
}

interface AddressBookState {
  contacts: Contact[]
  isInitialized: boolean
}
```

## Actions

```typescript
import { addressBookActions } from '@/stores/address-book'

// 初始化（App 启动时）
addressBookActions.initialize()

// 添加联系人
const contact = addressBookActions.addContact({
  name: 'Alice',
  avatar: '👩',
  addresses: [{ address: '0x...', label: 'Main' }],
  memo: 'Friend',
})

// 更新联系人
addressBookActions.updateContact(id, { name: 'Alice Wang' })

// 删除联系人
addressBookActions.deleteContact(id)

// 添加地址（每联系人最多 3 个）
addressBookActions.addAddressToContact(contactId, {
  address: 'TRX...',
  label: 'Tron',
})

// 移除地址
addressBookActions.removeAddressFromContact(contactId, addressId)

// 设置默认地址
addressBookActions.setDefaultAddress(contactId, addressId)

// 批量导入（按名称去重）
const imported = addressBookActions.importContacts(contacts)

// 清除所有
addressBookActions.clearAll()
```

## Selectors

```typescript
import { addressBookSelectors, addressBookStore } from '@/stores/address-book'
import { useStore } from '@tanstack/react-store'

function useAddressBook() {
  const state = useStore(addressBookStore)
  
  // 根据地址查找联系人
  const found = addressBookSelectors.getContactByAddress(state, '0x...')
  // { contact, matchedAddress }
  
  // 搜索联系人
  const results = addressBookSelectors.searchContacts(state, 'alice')
  
  // 联系人建议（用于转账地址输入）
  const suggestions = addressBookSelectors.suggestContacts(state, '0x1', 5)
  // ContactSuggestion[]
  
  // 按链类型过滤
  const evmContacts = addressBookSelectors.getContactsByChain(state, 'evm')
  
  // 获取默认地址
  const defaultAddr = addressBookSelectors.getDefaultAddress(contact, 'evm')
}
```

## 联系人建议算法

```typescript
interface ContactSuggestion {
  contact: Contact
  matchedAddress: ContactAddress
  matchType: 'exact' | 'prefix' | 'name'
  score: number  // 100=精确匹配, 80=前缀, 60=名称, 50=包含
}
```

```
suggestContacts('0x1a', 5)
    │
    ├── 无查询 → 返回所有联系人的默认地址
    │
    ├── 有查询 → 匹配地址和名称
    │       │
    │       ├── 精确匹配: score=100
    │       ├── 前缀匹配: score=80
    │       ├── 包含匹配: score=50
    │       └── 名称匹配: score=60
    │
    ├── 去重（同联系人+地址保留最高分）
    │
    └── 排序: score DESC → updatedAt DESC
```

## 地址格式检测

```typescript
import { detectAddressFormat } from '@/lib/address-format'

// 自动识别链类型
detectAddressFormat('0x742d35Cc6634C0532925a3b844Bc9e7595f...')
// { chainType: 'evm', format: 'ethereum' }

detectAddressFormat('TRonAddRess...')
// { chainType: 'tron', format: 'tron' }

detectAddressFormat('bc1q...')
// { chainType: 'bitcoin', format: 'bech32' }
```

## 持久化

| Key | 版本 | 说明 |
|-----|------|------|
| `bfm_address_book` | v3 | 仅兼容当前版本，旧版自动清空 |

```typescript
// 存储格式
{
  "version": 3,
  "contacts": [...]
}
```

## 限制

- 每个联系人最多 **3 个地址**（QR 码容量限制）
- 地址标签最多 **10 字符**
- 批量导入按名称去重
