# 📙 Appendix (附录)

> 参考资料、术语表、配置清单和技术规范

## 📖 目录

| 文档 | 说明 |
|------|------|
| [01-Glossary](./01-Glossary.md) | 术语表（区块链、技术栈、安全） |
| [02-Chain-Networks](./02-Chain-Networks.md) | 链网络配置清单 |
| [03-State-Machines](./03-State-Machines.md) | 核心业务状态机 |
| [04-Edge-Cases](./04-Edge-Cases.md) | 边界条件目录 |
| [05-API-Providers](./05-API-Providers.md) | 外部服务提供商 API |
| [06-Network-Faults](./06-Network-Faults.md) | 网络故障矩阵 |

---

## 🔤 快速术语参考

### 区块链

| 术语 | 说明 |
|------|------|
| 助记词 | 12-24 个单词组成的密钥表示 (BIP39) |
| 私钥 | 用于签署交易的 256 位密钥 |
| Gas | 交易执行所需的计算费用单位 |
| Nonce | 账户的交易序号，防止重放攻击 |

### 技术栈

| 术语 | 说明 |
|------|------|
| Stackflow | 移动端原生体验的 React 导航框架 |
| Activity | Stackflow 中的页面单元 |
| TanStack Query | 数据获取和缓存库 |
| TanStack Store | 轻量级响应式状态管理库 |

### BFM 生态

| 术语 | 说明 |
|------|------|
| DWEB | 去中心化网页应用运行环境 |
| Plaoc | BFM 的多链应用平台框架 |
| BFM | BioForest Meta 链的原生代币 |

---

## ⛓️ 支持的链网络

| 链 | 类型 | 主网 | 测试网 |
|----|------|------|--------|
| BFMeta | BFM | ✅ | ✅ |
| Ethereum | EVM | ✅ | Sepolia |
| BSC | EVM | ✅ | ✅ |
| Tron | TVM | ✅ | Nile |
| Bitcoin | UTXO | ✅ | Signet |

---

## 🔄 核心状态机

| 流程 | 状态数 | 关键状态 |
|------|--------|----------|
| 转账 | 10 | idle → signing → pending → confirmed |
| 钱包创建 | 8 | settingPattern → generatingMnemonic → completed |
| DWEB 授权 | 9 | receiving → showing → signing → responding |
| 应用锁 | 4 | locked ↔ unlocked |

---

## 相关文档

- [Security Reference](../08-Security-Ref/README.md) - 安全规范
- [Driver Reference](../02-Driver-Ref/README.md) - 链适配器
- [Platform Reference](../04-Platform-Ref/README.md) - 平台服务
