# Contact 组件

> 源码: [`src/components/contact/`](https://github.com/BioforestChain/KeyApp/blob/main/src/components/contact/)

## 组件列表

| 组件 | 文件 | 说明 |
|------|------|------|
| `ContactCard` | `contact-card.tsx` | 联系人卡片 |

---

## ContactCard

联系人卡片组件，显示头像、名称、地址。

### Props

```typescript
interface ContactCardProps {
  contact: Contact
  onEdit?: () => void
  onDelete?: () => void
  onClick?: () => void
  showActions?: boolean
  className?: string
}

interface Contact {
  id: string
  name: string
  avatar?: string           // emoji 或 URL
  addresses: ContactAddress[]
  memo?: string
}

interface ContactAddress {
  id: string
  address: string
  label?: string
  isDefault?: boolean
}
```

### 渲染结构

```
┌─────────────────────────────────────────────┐
│ [👩]  Alice                          [...]  │
│       0x742d35Cc6634...                     │
│       Main (默认)                           │
│─────────────────────────────────────────────│
│       TRonAddress...                        │
│       Tron                                  │
└─────────────────────────────────────────────┘
```

### 使用示例

```tsx
<ContactCard
  contact={contact}
  onClick={() => navigate('ContactDetail', { id: contact.id })}
  showActions
  onEdit={() => openEditSheet(contact)}
  onDelete={() => confirmDelete(contact)}
/>
```

### 头像显示

- 如果 `avatar` 是 emoji，直接显示
- 如果 `avatar` 是 URL，作为图片加载
- 否则显示姓名首字母

```tsx
// 使用 ContactAvatar 组件
<ContactAvatar 
  avatar={contact.avatar} 
  name={contact.name} 
  size="md" 
/>
```

### 地址显示

- 显示所有地址 (最多 3 个)
- 默认地址标记 `(默认)`
- 地址带标签显示

---

## 联系人相关组件 (其他目录)

### ContactAvatar (common/)

联系人头像组件。

```tsx
<ContactAvatar avatar="👩" name="Alice" size="lg" />
```

### ContactPickerJob (sheets/)

联系人选择弹窗。

```tsx
<ContactPickerJob
  open={open}
  onSelect={(contact, address) => {
    setRecipient(address.address)
    setRecipientName(contact.name)
  }}
  chainType="evm"
/>
```

### ContactEditJob (sheets/)

联系人编辑弹窗。

```tsx
<ContactEditJob
  open={open}
  contact={editingContact}  // null 为新建
  onSave={(contact) => saveContact(contact)}
/>
```

### ContactShareJob (sheets/)

联系人分享弹窗 (二维码)。

```tsx
<ContactShareJob
  open={open}
  contact={contact}
/>
```

---

## 联系人数据流

```
AddressBook Store
    │
    ├── contacts: Contact[]
    │
    ├── selectors
    │   ├── getContactByAddress()
    │   ├── searchContacts()
    │   └── suggestContacts()
    │
    └── actions
        ├── addContact()
        ├── updateContact()
        ├── deleteContact()
        └── importContacts()

Components
    │
    ├── ContactCard (显示)
    ├── ContactAvatar (头像)
    ├── ContactPickerJob (选择)
    └── ContactEditJob (编辑)
```
