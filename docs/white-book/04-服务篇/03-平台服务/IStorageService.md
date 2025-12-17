# IStorageService 安全存储服务

> 加密的本地数据存储

---

## 职责

安全地存储敏感数据（如加密后的助记词、用户偏好）。

---

## 接口定义

```
IStorageService {
  // 存储数据
  setItem(key: string, value: string): void
  
  // 读取数据
  getItem(key: string): string | null
  
  // 删除数据
  removeItem(key: string): void
  
  // 检查是否存在
  hasItem(key: string): boolean
  
  // 获取所有键
  getAllKeys(): string[]
  
  // 清空所有数据
  clear(): void
}
```

---

## 存储分区

### 按敏感度分区

| 分区 | 前缀 | 加密 | 内容 |
|-----|------|-----|------|
| secure | `sec_` | 是 | 加密的助记词、私钥 |
| private | `prv_` | 否 | 用户偏好、设置 |
| cache | `cch_` | 否 | 临时缓存 |

### 存储键命名

```
{分区前缀}{模块}_{键名}

示例：
sec_wallet_encrypted_mnemonic
prv_settings_language
cch_balance_0x1234
```

---

## 安全要求

### 加密存储

对于 secure 分区：

```
存储流程：
plaintext → AES-256-GCM 加密 → Base64 编码 → 存储

读取流程：
存储值 → Base64 解码 → AES-256-GCM 解密 → plaintext
```

### 加密密钥管理

```
用户密码
    │
    ▼ PBKDF2 (100,000 iterations)
派生密钥 (256 bits)
    │
    ▼
AES-256-GCM 加密数据
```

### 密钥派生参数

| 参数 | 值 |
|-----|---|
| 算法 | PBKDF2 |
| 哈希 | SHA-256 |
| 迭代次数 | 100,000 |
| 输出长度 | 256 bits |
| 盐 | 随机 16 bytes，存储在 `sec_crypto_salt` |

---

## 数据持久化

### 存储位置

| 平台 | 存储方式 |
|-----|---------|
| Web | IndexedDB |
| DWEB | Plaoc Secure Storage |

### 同步策略

- **MUST** 写入后立即持久化
- **MUST NOT** 依赖内存缓存
- **SHOULD** 写入失败时抛出异常

---

## 错误处理

| 错误 | 说明 | 处理 |
|-----|------|------|
| STORAGE_FULL | 存储空间满 | 清理缓存 |
| QUOTA_EXCEEDED | 超出配额 | 清理缓存 |
| DECRYPT_FAILED | 解密失败 | 密码错误或数据损坏 |
| KEY_NOT_FOUND | 键不存在 | 返回 null |

---

## 数据迁移

### 版本升级

```
存储数据版本号：prv_storage_version

迁移流程：
1. 读取当前版本
2. 如果版本 < 目标版本
3. 执行迁移函数
4. 更新版本号
```

### 迁移示例

```
v1 → v2: 
  - 重命名 wallet_data → sec_wallet_encrypted_mnemonic
  - 删除 deprecated_key
```

---

## 安全审计点

- [ ] 敏感数据使用 secure 分区
- [ ] 加密密钥不明文存储
- [ ] 清理数据时覆写内存
- [ ] 不在日志中输出存储内容
- [ ] 导出功能需要身份验证
