# 状态管理

> 定义应用状态管理架构规范

---

## 状态分类

### 三类状态

| 类型 | 特点 | 来源 | 持久化 | 示例 |
|-----|------|------|--------|------|
| 客户端状态 | 本地产生 | 用户操作 | 是 | 钱包列表、偏好设置 |
| 服务端状态 | 远程获取 | API/链 | 缓存 | 余额、交易历史 |
| 临时状态 | 短期存在 | 交互 | 否 | 表单数据、UI 状态 |

### 状态层次

```
┌──────────────────────────────────────────┐
│            Temporary State               │
│         (表单级，组件生命周期内)            │
├──────────────────────────────────────────┤
│            Server State                  │
│          (应用级，自动缓存同步)             │
├──────────────────────────────────────────┤
│            Client State                  │
│          (应用级，持久化到本地)             │
└──────────────────────────────────────────┘
```

---

## 客户端状态规范

### Store 定义

每个 Store MUST 包含：

```
Store<T> {
  // 状态
  state: T
  
  // 读取
  getState(): T
  subscribe(listener: (state: T) => void): Unsubscribe
  
  // 更新
  setState(updater: (prev: T) => T): void
}
```

### 钱包状态 (WalletStore)

| 字段 | 类型 | 持久化 | 说明 |
|-----|------|--------|------|
| wallets | Wallet[] | 是 | 钱包列表 |
| currentWalletId | string | 是 | 当前钱包 ID |
| selectedChain | ChainId | 是 | 当前选中链 |

### 偏好状态 (PreferencesStore)

| 字段 | 类型 | 持久化 | 说明 |
|-----|------|--------|------|
| language | LanguageCode | 是 | 界面语言 |
| currency | CurrencyCode | 是 | 显示货币 |
| theme | 'light' \| 'dark' \| 'system' | 是 | 主题模式 |
| biometricEnabled | boolean | 是 | 生物识别开关 |

### UI 状态 (UIStore)

| 字段 | 类型 | 持久化 | 说明 |
|-----|------|--------|------|
| activeSheet | SheetType | 否 | 当前弹窗 |
| toastQueue | Toast[] | 否 | Toast 队列 |
| isLoading | boolean | 否 | 全局加载状态 |

### 地址簿状态 (AddressBookStore)

| 字段 | 类型 | 持久化 | 说明 |
|-----|------|--------|------|
| contacts | Contact[] | 是 | 联系人列表 |
| isInitialized | boolean | 否 | 是否已初始化 |

**Contact 结构：**

| 字段 | 类型 | 说明 |
|-----|------|------|
| id | string | 唯一 ID |
| name | string | 联系人名称 |
| avatar | string? | 头像（avatar: 协议） |
| addresses | ContactAddress[] | 地址列表（最多 3 个） |
| memo | string? | 私有备注 |
| createdAt | number | 创建时间 |
| updatedAt | number | 更新时间 |

**ContactAddress 结构：**

| 字段 | 类型 | 说明 |
|-----|------|------|
| id | string | 唯一 ID |
| address | string | 区块链地址 |
| label | string? | 自定义标签（最多 10 字符） |
| isDefault | boolean? | 是否默认地址 |

---

## 服务端状态规范

### 缓存策略

| 数据类型 | 缓存时长 | 刷新策略 |
|---------|---------|---------|
| 余额 | 30 秒 | 自动轮询 60s |
| 交易历史 | 1 分钟 | 新交易时刷新 |
| Token 元数据 | 1 小时 | 按需刷新 |
| 汇率 | 5 分钟 | 自动轮询 |
| 链配置 | 24 小时 | 手动刷新 |

### 查询键规范

查询键 MUST 遵循以下命名规则：

```
[domain, action, ...params]

示例：
['wallet', 'balances', address, chainId]
['transaction', 'history', address]
['token', 'metadata', tokenId]
['exchange', 'rates', baseCurrency]
```

### 查询状态

| 状态 | 说明 |
|-----|------|
| idle | 未开始 |
| loading | 加载中（首次） |
| success | 成功 |
| error | 失败 |
| fetching | 后台刷新中 |

---

## 状态操作规范

### Action 定义

每个状态域 SHOULD 定义对应的 Actions：

```
WalletActions {
  addWallet(wallet: Wallet): void
  removeWallet(walletId: string): void
  updateWallet(walletId: string, updates: Partial<Wallet>): void
  setCurrentWallet(walletId: string): void
  setSelectedChain(chain: ChainId): void
}
```

### Mutation 规范

服务端状态变更 MUST 通过 Mutation：

```
Mutation<TParams, TResult> {
  // 执行变更
  mutate(params: TParams): Promise<TResult>
  
  // 状态
  isPending: boolean
  isSuccess: boolean
  isError: boolean
  error: Error | null
  
  // 回调
  onSuccess?: (result: TResult) => void
  onError?: (error: Error) => void
  onSettled?: () => void
}
```

### 缓存失效

变更成功后 MUST 使相关缓存失效：

| 操作 | 失效的缓存 |
|-----|-----------|
| 转账 | 发送方余额、接收方余额、交易历史 |
| 创建钱包 | 钱包列表 |
| 质押/解质押 | 余额、质押状态 |

---

## 状态持久化规范

### 存储键命名

```
bfm_{domain}_{version}

示例：
bfm_wallets_v1
bfm_preferences_v1
bfm_cache_v1
```

### 持久化策略

| 状态 | 存储位置 | 加密 |
|-----|---------|------|
| 钱包列表 | 安全存储 | 是 |
| 用户偏好 | 本地存储 | 否 |
| 查询缓存 | 本地存储 | 否 |

### 版本迁移

- **MUST** 在存储数据中包含版本号
- **MUST** 支持旧版本数据迁移
- **SHOULD** 在迁移失败时保留原数据

```
迁移流程：
读取存储数据
    │
    ▼
检查版本号
    │
    ├── 当前版本 ──► 直接使用
    │
    └── 旧版本 ──► 执行迁移
                    │
                    ├── 成功 ──► 保存新版本
                    │
                    └── 失败 ──► 使用默认值 + 报告错误
```

---

## 状态订阅规范

### 细粒度订阅

- **MUST** 只订阅组件需要的状态片段
- **MUST NOT** 订阅整个 Store 状态
- **SHOULD** 使用选择器（Selector）提取状态

### 选择器规范

```
Selector<TState, TResult> = (state: TState) => TResult

示例：
// ✓ 好：细粒度选择
const currentWallet = useSelector(state => state.wallets.find(
  w => w.id === state.currentWalletId
))

// ✗ 差：订阅全部状态
const allState = useSelector(state => state)
```

### 派生状态

派生状态 SHOULD 通过选择器计算：

| 派生状态 | 依赖 | 计算 |
|---------|------|------|
| 当前钱包 | wallets, currentWalletId | wallets.find(w => w.id === currentWalletId) |
| 当前地址 | currentWallet, selectedChain | currentWallet.addresses[selectedChain] |
| 总资产 | balances, exchangeRates | sum(balances * rates) |

---

## 乐观更新规范

### 适用场景

| 操作 | 乐观更新 | 原因 |
|-----|---------|------|
| 切换钱包 | 是 | 本地操作，必定成功 |
| 修改昵称 | 是 | 失败概率低 |
| 转账 | 否 | 需等待链上确认 |
| 删除钱包 | 否 | 不可逆操作 |

### 乐观更新流程

```
用户操作
    │
    ▼
立即更新 UI（乐观）
    │
    ▼
发送请求
    │
    ├── 成功 ──► 保持状态
    │
    └── 失败 ──► 回滚状态 + 显示错误
```

---

## 错误处理规范

### 查询错误

- **MUST** 显示错误状态
- **MUST** 提供重试机制
- **SHOULD** 显示缓存数据（如有）
- **SHOULD** 自动重试网络错误

### 变更错误

- **MUST** 显示错误消息
- **MUST** 回滚乐观更新
- **SHOULD** 保留用户输入
- **MAY** 提供错误详情查看

---

## 本章小结

- 状态分为客户端、服务端、临时三类
- 客户端状态需持久化到本地
- 服务端状态需合理配置缓存
- 细粒度订阅避免过度渲染
- 支持乐观更新提升体验
- 版本迁移确保数据兼容
