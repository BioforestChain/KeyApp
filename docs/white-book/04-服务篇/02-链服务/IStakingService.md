# IStakingService 质押服务

> 代币质押操作（可选服务）

---

## 职责

管理代币质押、解除质押、领取奖励等操作。

**注意**：此服务为可选服务，仅支持质押功能的链需要实现。

---

## 接口定义

```
IStakingService {
  // 获取质押信息
  getStakingInfo(address: Address): StakingInfo
  
  // 获取可用验证者列表
  getValidators(options?: ValidatorOptions): Validator[]
  
  // 质押
  stake(params: StakeParams): UnsignedTransaction
  
  // 解除质押
  unstake(params: UnstakeParams): UnsignedTransaction
  
  // 领取奖励
  claimRewards(address: Address, validator?: Address): UnsignedTransaction
  
  // 重新委托（更换验证者）
  redelegate(params: RedelegateParams): UnsignedTransaction
  
  // 获取质押 APY
  getStakingAPY(): number
}
```

---

## 数据结构

### StakingInfo

```
StakingInfo {
  // 总览
  totalStaked: bigint           // 总质押量
  totalRewards: bigint          // 待领取奖励
  
  // 委托详情
  delegations: Delegation[]
  
  // 解绑中
  unbonding: UnbondingEntry[]
  
  // 汇总
  availableBalance: bigint      // 可用余额
  stakingRatio: number          // 质押占比
}

Delegation {
  validator: ValidatorInfo
  amount: bigint
  rewards: bigint
  startTime: number
}

UnbondingEntry {
  validator: ValidatorInfo
  amount: bigint
  completionTime: number        // 完成时间戳
  remainingTime: number         // 剩余秒数
}
```

### Validator

```
Validator {
  address: Address
  name: string
  description?: string
  website?: string
  logoUri?: string
  
  // 状态
  status: 'active' | 'inactive' | 'jailed'
  
  // 指标
  commission: number            // 佣金比例 (0-1)
  votingPower: bigint           // 投票权重
  delegatorCount: number        // 委托人数
  uptime: number                // 在线率 (0-1)
  
  // APY（扣除佣金后）
  estimatedAPY: number
}

ValidatorOptions {
  status?: 'active' | 'all'
  sortBy?: 'votingPower' | 'commission' | 'apy'
  limit?: number
}
```

### StakeParams

```
StakeParams {
  from: Address
  validator: Address
  amount: bigint
}

UnstakeParams {
  from: Address
  validator: Address
  amount: bigint
}

RedelegateParams {
  from: Address
  srcValidator: Address
  dstValidator: Address
  amount: bigint
}
```

---

## 质押流程

### 质押

```
1. 用户选择验证者
        │
        ▼
2. 输入质押金额
        │
        ▼
3. stake() 构建交易
        │
        ▼
4. 签名并广播
        │
        ▼
5. 等待确认
        │
        ▼
6. 质押生效（下一个 epoch）
```

### 解除质押

```
1. 选择要解除的委托
        │
        ▼
2. 输入解除金额
        │
        ▼
3. unstake() 构建交易
        │
        ▼
4. 签名并广播
        │
        ▼
5. 进入解绑期（通常 7-28 天）
        │
        ▼
6. 解绑完成，资金可用
```

---

## 解绑期规范

| 链 | 解绑期 | 说明 |
|---|-------|------|
| BFM | 7 天 | |
| Cosmos 系 | 21 天 | |
| Ethereum | 可变 | 取决于退出队列 |

---

## 验证者选择建议

向用户展示时 **SHOULD** 排序和过滤：

```
推荐验证者 = 
  status == 'active' &&
  commission < 10% &&
  uptime > 99% &&
  sortBy(estimatedAPY, desc)
```

---

## 风险提示

质押操作 **MUST** 向用户展示以下风险：

| 风险 | 说明 |
|-----|------|
| 解绑期 | 解除质押需等待 X 天 |
| 惩罚风险 | 验证者作恶可能导致本金损失 |
| 价格风险 | 质押期间代币价格可能波动 |

---

## 错误码

| 错误码 | 说明 |
|-------|------|
| VALIDATOR_NOT_FOUND | 验证者不存在 |
| VALIDATOR_INACTIVE | 验证者不活跃 |
| INSUFFICIENT_STAKE | 质押金额不足最小要求 |
| UNBONDING_LIMIT | 解绑数量达到上限 |
| ALREADY_DELEGATED | 已委托给该验证者 |
| REDELEGATE_COOLING | 重新委托冷却中 |
