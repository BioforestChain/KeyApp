# 附录 E: 状态机规范

> 定义核心业务流程的完整状态机

---

## 转账状态机

### 状态定义

| 状态 | 说明 | 可转换到 |
|-----|------|---------|
| idle | 初始状态 | inputting |
| inputting | 输入中 | validating, idle |
| validating | 验证中 | confirming, inputting |
| confirming | 等待确认 | authenticating, inputting |
| authenticating | 身份验证 | signing, confirming |
| signing | 签名中 | broadcasting, failed |
| broadcasting | 广播中 | pending, failed |
| pending | 等待确认 | confirmed, failed |
| confirmed | 已确认 | idle |
| failed | 失败 | inputting, idle |

### 状态转换图

```
                                    ┌─────────┐
                                    │  idle   │
                                    └────┬────┘
                                         │ 开始转账
                                         ▼
                                    ┌─────────┐
                            ┌───────│inputting│◄───────┐
                            │       └────┬────┘        │
                            │ 取消       │ 提交        │ 修改
                            │            ▼             │
                            │       ┌─────────┐        │
                            │       │validating│───────┘
                            │       └────┬────┘  验证失败
                            │            │ 验证通过
                            │            ▼
                            │       ┌─────────┐
                            │       │confirming│◄──────┐
                            │       └────┬────┘        │
                            │            │ 确认        │ 取消认证
                            │            ▼             │
                            │       ┌──────────────┐   │
                            │       │authenticating│───┘
                            │       └──────┬───────┘
                            │              │ 认证成功
                            │              ▼
                            │       ┌─────────┐
                            │       │ signing │
                            │       └────┬────┘
                            │            │ 签名成功
                            │            ▼
                            │       ┌──────────┐
                            │       │broadcasting│
                            │       └─────┬────┘
                            │             │ 广播成功
                            │             ▼
                            │       ┌─────────┐
                            │       │ pending │
                            │       └────┬────┘
                            │            │ 确认
                            ▼            ▼
                       ┌─────────┐  ┌─────────┐
                       │  idle   │◄─│confirmed│
                       └─────────┘  └─────────┘
                            ▲
                            │
                       ┌────┴────┐
                       │ failed  │◄── (任何步骤失败)
                       └─────────┘
```

### 状态数据

```
TransferState {
  status: TransferStatus
  
  // 输入数据
  from: Address
  to: Address
  amount: string
  chain: ChainId
  memo?: string
  
  // 验证结果
  validationErrors?: ValidationError[]
  estimatedFee?: Fee
  
  // 交易数据
  signedTx?: string
  txHash?: string
  
  // 确认数据
  confirmations?: number
  receipt?: TxReceipt
  
  // 错误
  error?: AppError
}
```

---

## 钱包创建状态机

### 状态定义

| 状态 | 说明 |
|-----|------|
| idle | 初始 |
| settingPassword | 设置密码 |
| generatingMnemonic | 生成助记词 |
| showingMnemonic | 显示助记词 |
| verifyingMnemonic | 验证助记词 |
| derivingAddresses | 派生地址 |
| savingWallet | 保存钱包 |
| completed | 完成 |
| failed | 失败 |

### 状态转换图

```
┌─────────┐
│  idle   │
└────┬────┘
     │ 开始创建
     ▼
┌──────────────┐
│settingPassword│
└──────┬───────┘
       │ 密码设置完成
       ▼
┌──────────────────┐
│generatingMnemonic│
└────────┬─────────┘
         │ 生成完成
         ▼
┌───────────────┐
│showingMnemonic│
└───────┬───────┘
        │ 用户确认已备份
        ▼
┌──────────────────┐
│verifyingMnemonic │◄────┐
└────────┬─────────┘     │
         │               │ 验证失败
         │ 验证成功      │
         ▼               │
┌──────────────────┐     │
│derivingAddresses │─────┘
└────────┬─────────┘
         │ 派生完成
         ▼
┌─────────────┐
│savingWallet │
└──────┬──────┘
       │ 保存成功
       ▼
┌──────────┐
│completed │
└──────────┘
```

---

## DWEB 授权状态机

### 状态定义

| 状态 | 说明 |
|-----|------|
| idle | 空闲 |
| receiving | 接收请求 |
| parsing | 解析请求 |
| showing | 显示授权详情 |
| authenticating | 身份验证 |
| signing | 签名中 |
| responding | 返回结果 |
| completed | 完成 |
| rejected | 已拒绝 |
| failed | 失败 |

### 状态转换图

```
┌─────────┐
│  idle   │
└────┬────┘
     │ 收到授权请求
     ▼
┌───────────┐
│ receiving │
└─────┬─────┘
      │ 请求有效
      ▼
┌──────────┐
│ parsing  │
└────┬─────┘
     │ 解析成功
     ▼
┌──────────┐
│ showing  │◄──────────────┐
└────┬─────┘               │
     │                     │
     ├── 用户拒绝 ──────────┼──► rejected ──► idle
     │                     │
     └── 用户确认          │
         │                 │
         ▼                 │
┌───────────────┐          │
│authenticating │──────────┘ 认证失败
└───────┬───────┘
        │ 认证成功
        ▼
┌──────────┐
│ signing  │
└────┬─────┘
     │ 签名成功
     ▼
┌────────────┐
│ responding │
└─────┬──────┘
      │
      ▼
┌───────────┐
│ completed │──► idle
└───────────┘
```

### 授权类型

| 类型 | 请求内容 | 用户确认 |
|-----|---------|---------|
| address | 获取钱包地址 | 选择地址 |
| sign | 签名消息/交易 | 查看内容并确认 |
| connect | 建立连接 | 确认连接 |

---

## 应用锁状态机

### 状态定义

| 状态 | 说明 |
|-----|------|
| locked | 已锁定 |
| unlocking | 解锁中 |
| unlocked | 已解锁 |
| locking | 锁定中 |

### 状态转换

```
┌──────────┐                    ┌───────────┐
│  locked  │◄───── 超时/手动 ────│  unlocked │
└────┬─────┘                    └─────┬─────┘
     │                                │
     │ 开始解锁                        │
     ▼                                │
┌───────────┐                         │
│ unlocking │                         │
└─────┬─────┘                         │
      │                               │
      ├── 成功 ──────────────────────►│
      │                               │
      └── 失败 ──► locked             │
                                      │
                                      ▼
                               ┌──────────┐
                               │ locking  │
                               └────┬─────┘
                                    │
                                    ▼
                               ┌──────────┐
                               │  locked  │
                               └──────────┘
```

### 锁定触发条件

| 条件 | 优先级 |
|-----|-------|
| 用户手动锁定 | 最高 |
| 应用切后台 N 秒 | 高 |
| 无操作超时 | 中 |
| 屏幕锁定 | 中 |

---

## 网络状态机

### 状态定义

```
┌─────────┐     连接成功     ┌──────────┐
│ offline │ ──────────────► │  online  │
└────┬────┘                 └────┬─────┘
     ▲                           │
     │                           │ 连接断开
     │         ┌─────────┐       │
     └─────────│ degraded│◄──────┘
               └─────────┘
                    │
                    │ 完全断开
                    ▼
               ┌─────────┐
               │ offline │
               └─────────┘
```

### 状态影响

| 状态 | 可用功能 | UI 提示 |
|-----|---------|--------|
| online | 全部 | 无 |
| degraded | 大部分 | 警告条 |
| offline | 离线功能 | 离线横幅 |

---

## 状态机实现规范

### 必须遵循

- **MUST** 每个状态有明确的入口和出口条件
- **MUST** 状态转换是原子操作
- **MUST** 每次转换记录日志
- **MUST** 处理所有可能的状态转换

### 应该遵循

- **SHOULD** 状态变化触发 UI 更新
- **SHOULD** 支持状态持久化（如需要）
- **SHOULD** 提供状态查询 API

### 可以考虑

- **MAY** 实现状态回退
- **MAY** 支持状态快照和恢复

---

## 本章小结

- 所有复杂流程都有明确的状态机定义
- 状态和转换条件清晰可追踪
- 每个状态都有对应的数据结构
- 状态机驱动 UI 和业务逻辑
