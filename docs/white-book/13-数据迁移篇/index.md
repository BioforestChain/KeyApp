# 数据迁移篇

> 定义版本升级时的数据迁移策略和向后兼容规范

---

## 版本化存储

### 存储结构

```
StorageSchema {
  version: number        // Schema 版本号
  data: object           // 业务数据
  migratedAt?: number    // 迁移时间
  previousVersion?: number  // 迁移前版本
}
```

### 版本命名规则

| 版本类型 | 变更类型 | 是否需迁移 |
|---------|---------|-----------|
| Major (X.0) | 结构性变更 | 是 |
| Minor (x.Y) | 新增字段 | 可能 |
| Patch (x.y.Z) | 修复/优化 | 否 |

---

## 迁移架构

### 迁移流程

```
应用启动
    │
    ▼
读取存储版本号
    │
    ├── 版本相同 ──► 正常启动
    │
    └── 版本不同
         │
         ▼
    获取迁移路径
         │
         ▼
    依次执行迁移函数
         │
         ├── 成功 ──► 更新版本号 ──► 正常启动
         │
         └── 失败 ──► 回滚 ──► 显示错误
```

### 迁移管理器接口

```
IMigrationManager {
  // 获取当前存储版本
  getCurrentVersion(): number
  
  // 获取目标版本
  getTargetVersion(): number
  
  // 执行迁移
  migrate(): Promise<MigrationResult>
  
  // 回滚到指定版本
  rollback(version: number): Promise<void>
  
  // 注册迁移函数
  registerMigration(migration: Migration): void
}

Migration {
  fromVersion: number
  toVersion: number
  up: (data: any) => Promise<any>    // 升级
  down: (data: any) => Promise<any>  // 降级
  description: string
}

MigrationResult {
  success: boolean
  fromVersion: number
  toVersion: number
  migrationsRun: number
  error?: Error
}
```

---

## 迁移策略

### 增量迁移

```
v1 ──► v2 ──► v3 ──► v4
     m1    m2    m3

从 v1 到 v4 需依次执行: m1 → m2 → m3
```

**规范要求：**
- **MUST** 支持从任意旧版本迁移到最新版本
- **MUST** 迁移函数幂等（重复执行结果相同）
- **SHOULD** 每个迁移函数只做一件事

### 迁移超时

| 数据量级 | 超时时间 |
|---------|---------|
| < 100 条 | 5s |
| 100-1000 条 | 30s |
| > 1000 条 | 60s |

### 迁移进度

大数据量迁移 **SHOULD** 显示进度：

```
┌─────────────────────────────────────┐
│         正在更新数据...              │
│                                     │
│  ████████████░░░░░░░░  60%         │
│                                     │
│  请勿关闭应用                        │
└─────────────────────────────────────┘
```

---

## 数据备份

### 备份时机

| 时机 | 动作 |
|-----|------|
| 迁移前 | 自动备份当前数据 |
| 用户手动 | 导出到文件 |
| 定期 | 后台静默备份 |

### 备份数据结构

```
Backup {
  version: number
  timestamp: number
  data: EncryptedData
  checksum: string
}
```

### 备份存储

| 存储位置 | 用途 | 保留策略 |
|---------|------|---------|
| 本地存储 | 迁移回滚 | 保留最近 3 个版本 |
| 用户导出 | 手动恢复 | 用户管理 |

---

## Schema 变更规范

### 向后兼容变更（无需迁移）

| 变更类型 | 示例 |
|---------|------|
| 新增可选字段 | 添加 `nickname?: string` |
| 放宽类型约束 | `string` → `string \| null` |
| 新增枚举值 | 添加新的链类型 |

### 需要迁移的变更

| 变更类型 | 示例 | 迁移方式 |
|---------|------|---------|
| 字段重命名 | `addr` → `address` | 复制并删除旧字段 |
| 字段类型变更 | `string` → `number` | 类型转换 |
| 结构重组 | 扁平 → 嵌套 | 重新组织 |
| 删除字段 | 移除 `deprecated` | 清理旧字段 |
| 新增必填字段 | 添加 `createdAt` | 设置默认值 |

---

## 迁移示例

### 示例 1: 字段重命名

```
// v1 → v2: wallets.addr → wallets.address

Migration {
  fromVersion: 1,
  toVersion: 2,
  description: '重命名 addr 为 address',
  
  up: async (data) => {
    data.wallets = data.wallets.map(w => ({
      ...w,
      address: w.addr,
      addr: undefined  // 删除旧字段
    }))
    return data
  },
  
  down: async (data) => {
    data.wallets = data.wallets.map(w => ({
      ...w,
      addr: w.address,
      address: undefined
    }))
    return data
  }
}
```

### 示例 2: 结构重组

```
// v2 → v3: 扁平结构 → 嵌套结构
// { walletId, ethAddress, btcAddress } 
// → { walletId, addresses: { eth, btc } }

Migration {
  fromVersion: 2,
  toVersion: 3,
  description: '地址改为嵌套结构',
  
  up: async (data) => {
    data.wallets = data.wallets.map(w => ({
      walletId: w.walletId,
      addresses: {
        eth: w.ethAddress,
        btc: w.btcAddress
      }
    }))
    return data
  }
}
```

### 示例 3: 新增必填字段

```
// v3 → v4: 新增 createdAt 必填字段

Migration {
  fromVersion: 3,
  toVersion: 4,
  description: '添加创建时间字段',
  
  up: async (data) => {
    const now = Date.now()
    data.wallets = data.wallets.map(w => ({
      ...w,
      createdAt: w.createdAt || now  // 默认值
    }))
    return data
  }
}
```

---

## 错误处理

### 迁移失败处理

```
迁移失败
    │
    ▼
记录错误日志
    │
    ▼
尝试回滚
    │
    ├── 回滚成功 ──► 恢复旧版本数据
    │               │
    │               ▼
    │          显示"更新失败，请重试"
    │
    └── 回滚失败 ──► 从备份恢复
                    │
                    ├── 恢复成功 ──► 显示"已恢复"
                    │
                    └── 恢复失败 ──► 显示"数据损坏"
                                    │
                                    ▼
                              引导重新导入钱包
```

### 错误类型

| 错误 | 处理方式 |
|-----|---------|
| 迁移函数异常 | 回滚到迁移前 |
| 数据格式不匹配 | 尝试修复或跳过 |
| 存储空间不足 | 提示清理空间 |
| 超时 | 允许重试 |

---

## 测试规范

### 迁移测试要求

| 测试项 | 说明 |
|-------|------|
| 正向迁移 | v(n) → v(n+1) |
| 跨版本迁移 | v1 → v(latest) |
| 回滚测试 | v(n+1) → v(n) |
| 边界数据 | 空数据、极大数据 |
| 损坏数据 | 格式错误、缺失字段 |

### 测试数据准备

- **MUST** 为每个历史版本准备测试数据
- **MUST** 包含边界情况数据
- **SHOULD** 包含真实用户数据脱敏样本

---

## 版本兼容矩阵

### 支持的迁移路径

| 起始版本 | 目标版本 | 支持 |
|---------|---------|------|
| v1 | v2+ | ✓ |
| v2 | v3+ | ✓ |
| ... | latest | ✓ |

### 不再支持的版本

| 版本 | 废弃日期 | 处理方式 |
|-----|---------|---------|
| v0.x | 2024-01 | 提示重新导入 |

---

## 本章小结

- 所有存储数据必须带版本号
- 支持从任意旧版本增量迁移
- 迁移前自动备份，失败可回滚
- 每个迁移函数独立、幂等、可逆
- 完整的迁移测试覆盖
