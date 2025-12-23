# 联系人服务

> 管理用户的联系人和地址簿

---

## 概述

联系人服务提供地址簿管理功能，支持：
- 一个联系人保存多个地址（不同链）
- 自动识别地址格式
- 地址输入时的联系人建议
- 联系人搜索和过滤

---

## 数据模型

### Contact（联系人）

```typescript
interface Contact {
  id: string                    // UUID
  name: string                  // 联系人名称
  avatar?: string               // 头像（可选，emoji 或图片URL）
  addresses: ContactAddress[]   // 多个地址
  memo?: string                 // 备注
  createdAt: number            // 创建时间
  updatedAt: number            // 更新时间
}
```

### ContactAddress（联系人地址）

```typescript
interface ContactAddress {
  id: string                    // UUID
  address: string               // 地址
  chainType: ChainType          // 链类型（自动检测或手动指定）
  label?: string                // 地址标签（如"主地址"、"交易所"）
  isDefault?: boolean           // 是否默认地址
}
```

---

## 地址格式识别

### 支持的格式

| 链类型 | 地址格式 | 示例 |
|-------|---------|------|
| Ethereum | 0x + 40位hex | `0x742d35Cc...` |
| BSC | 同 Ethereum | `0x742d35Cc...` |
| TRON | T + 33位base58 | `TJYs...` |
| Bitcoin Legacy | 1 + 25-34位base58 | `1A1zP1...` |
| Bitcoin P2SH | 3 + 25-34位base58 | `3J98t1...` |
| Bitcoin Bech32 | bc1 + 25-89位 | `bc1qar0...` |
| BFMeta | b + base58check | `b7ADmv...` |
| CCChain | c + base58check | `cXXXXX...` |
| PMChain | p + base58check | `pXXXXX...` |

### 检测算法

```typescript
function detectAddressFormat(address: string): AddressFormatInfo {
  // 1. 检查 0x 前缀 → Ethereum/BSC
  // 2. 检查 T 前缀 + 长度 → TRON
  // 3. 检查 1/3/bc1 前缀 → Bitcoin
  // 4. 检查 BioForest 前缀 (b/c/p/B/g/w/e/m) → 对应链
  // 5. 返回 unknown
}
```

---

## 服务接口

### IContactService

```typescript
interface IContactService {
  // 联系人 CRUD
  getContacts(): Contact[]
  getContactById(id: string): Contact | undefined
  addContact(contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>): Contact
  updateContact(id: string, updates: Partial<Contact>): void
  deleteContact(id: string): void
  
  // 地址操作
  addAddressToContact(contactId: string, address: ContactAddress): void
  removeAddressFromContact(contactId: string, addressId: string): void
  
  // 搜索和建议
  searchContacts(query: string): Contact[]
  suggestContacts(partialAddress: string): ContactSuggestion[]
  getContactByAddress(address: string): Contact | undefined
  
  // 导入导出
  importContacts(contacts: Contact[]): number
  exportContacts(): Contact[]
}
```

### ContactSuggestion（联系人建议）

```typescript
interface ContactSuggestion {
  contact: Contact
  matchedAddress: ContactAddress
  matchType: 'exact' | 'prefix' | 'name'
  score: number  // 匹配分数，用于排序
}
```

---

## 地址输入增强

### AddressInput 组件增强

```
┌─────────────────────────────────────────┐
│ [图标] 输入地址或选择联系人     [扫描] │
├─────────────────────────────────────────┤
│ 建议联系人:                              │
│ ┌─────────────────────────────────────┐ │
│ │ 👤 Alice                            │ │
│ │    b7ADmv... (BFMeta)              │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ 👤 Bob                              │ │
│ │    0x742d... (Ethereum)             │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### 交互流程

1. 用户开始输入地址
2. 实时搜索匹配的联系人（按名称或地址前缀）
3. 显示建议列表（最多5个）
4. 用户选择联系人后，自动填入对应地址
5. 根据当前选择的链，优先显示该链的地址

---

## 存储

使用 localStorage 持久化，key 为 `bfm_contacts`。

```typescript
// 存储格式
{
  version: 2,  // 数据版本，用于迁移
  contacts: Contact[]
}
```

### 数据迁移

从 v1（单地址）迁移到 v2（多地址）：

```typescript
function migrateV1ToV2(v1Contact: V1Contact): Contact {
  return {
    ...v1Contact,
    addresses: [{
      id: crypto.randomUUID(),
      address: v1Contact.address,
      chainType: v1Contact.chain ?? detectAddressFormat(v1Contact.address).chainType,
    }]
  }
}
```

---

## 与转账流程集成

### 发送页面

1. 地址输入框显示联系人建议
2. 选择联系人时，如果有多个地址，弹出地址选择器
3. 如果联系人只有一个地址，直接填入

### 交易历史

1. 显示交易对方时，优先显示联系人名称
2. 提供"添加到联系人"操作

---

## 安全考虑

- 联系人数据不加密（非敏感数据）
- 删除联系人需要密码确认（防止误操作）
- 导出功能可选加密

---

## 相关链接

- [08-钱包数据存储](../08-钱包数据存储/) - 数据存储规范
- [ITransactionService](../02-链服务/ITransactionService/) - 交易服务
