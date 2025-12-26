# Contact 联系人组件

> 联系人头像、名片、选择器等组件

---

## 功能概述

联系人系统包含以下组件：
- **ContactAvatar**: 联系人头像显示
- **ContactCard**: 联系人名片（用于分享）
- **ContactPickerJob**: 联系人选择器
- **AddressInput**: 地址输入（支持联系人匹配）

---

## ContactAvatar

### 属性规范

| 属性 | 类型 | 必需 | 默认值 | 说明 |
|-----|------|-----|-------|------|
| src | string | N | - | 头像 URL（avatar: 协议或图片 URL） |
| size | number | N | 40 | 头像尺寸（px） |
| className | string | N | - | 自定义样式类 |

### 头像协议

头像支持两种格式：

1. **avatar: 协议**: `avatar:XXXXXXXX`（8 字符 base64 编码的 Avataaars 参数）
2. **图片 URL**: 标准图片 URL

### 头像生成

```typescript
// 从地址生成头像
generateAvatarFromAddress(address: string, seed?: number): string

// 返回 avatar: 协议 URL
// 示例: "avatar:A2BxY3Dz"
```

---

## ContactCard

### 属性规范

| 属性 | 类型 | 必需 | 默认值 | 说明 |
|-----|------|-----|-------|------|
| name | string | Y | - | 联系人名称 |
| addresses | ContactAddressInfo[] | Y | - | 地址列表 |
| avatar | string | N | - | 头像 URL |
| address | string | N | - | 主地址（用于生成二维码） |

### 显示规则

- 名片宽度固定 320px
- 头像尺寸 64px
- 仅显示有自定义标签的地址徽章
- 二维码包含联系人协议数据

---

## ContactPickerJob

### 参数

| 参数 | 类型 | 必需 | 说明 |
|-----|------|-----|------|
| chainType | ChainType | N | 目标链类型，用于验证地址 |

### 显示规则

- 按联系人分组显示，每组包含：
  - 头像 + 名称（组头）
  - 该联系人的所有地址（可点击）
- 地址按钮最小高度 44px（移动端推荐触控区域）
- 无效地址（不匹配目标链）显示为禁用状态

### 地址兼容性

BioForest 链地址互相兼容（共享相同密钥体系）：
- bfmeta、ccchain、pmchain、bfchainv2 等

Ethereum 和 BSC 地址格式相同，互相兼容。

---

## AddressInput 联系人匹配

### 功能

当输入地址匹配已保存的联系人时：
- 左侧显示联系人头像
- 显示两行：用户名 + 地址
- 右侧显示清除按钮

### 建议下拉

聚焦时显示联系人建议：
- 按搜索词过滤（匹配名称或地址）
- 显示头像、名称、地址
- 无效地址显示为禁用状态

---

## 数据结构

### ContactAddress

```typescript
interface ContactAddress {
  id: string
  address: string
  label?: string      // 自定义标签，最多 10 字符
  isDefault?: boolean
}
```

### Contact

```typescript
interface Contact {
  id: string
  name: string
  avatar?: string     // avatar: 协议 URL
  addresses: ContactAddress[]  // 最多 3 个地址
  memo?: string       // 私有备注，不分享
  createdAt: number
  updatedAt: number
}
```

---

## 地址标签显示

### 规则

- **仅显示自定义标签**：没有设置标签时不显示任何内容
- **不回退到链类型**：不自动显示检测到的链类型
- **最大宽度**：4rem（约 10 字符），超出截断

### 示例

| 场景 | 标签字段 | 显示 |
|-----|---------|------|
| 有自定义标签 | "主账户" | 主账户 |
| 无标签 | undefined | （不显示） |
| 标签过长 | "我的交易所账户" | 我的交易所... |

---

## 存储规范

### 存储键

```
bfm_address_book
```

### 存储格式

```typescript
interface StorageData {
  version: 3          // 当前版本
  contacts: Contact[]
}
```

### 版本说明

- **v3**（当前）：移除 chainType，使用自定义 label
- **v2**：多地址支持
- **v1**：单地址格式

**注意**：v3 为破坏性更新，不兼容旧版本数据。

---

## 本节小结

- 头像使用 Avataaars，支持从地址生成
- 联系人最多 3 个地址
- 地址标签仅显示自定义内容
- BioForest 链地址互相兼容
- 存储版本 3，不迁移旧数据
