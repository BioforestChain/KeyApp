# 术语表

> 技术术语和业务概念速查

---

## A. 区块链与密码学

| 术语 | 英文 | 定义 |
|------|------|------|
| **助记词** | Mnemonic | 由 12-24 个单词组成的人类可读密钥表示，遵循 BIP39 标准 |
| **私钥** | Private Key | 用于签署交易的 256 位密钥，必须安全保管 |
| **公钥** | Public Key | 从私钥派生，用于生成地址和验证签名 |
| **地址** | Address | 由公钥派生的账户标识符，用于接收资产 |
| **派生路径** | Derivation Path | BIP44 标准定义的密钥派生层级结构，如 `m/44'/60'/0'/0/0` |
| **签名** | Signature | 使用私钥对交易或消息进行的加密证明 |
| **哈希** | Hash | 数据的固定长度指纹，如 SHA-256、Keccak-256 |
| **Ed25519** | - | BFM 链使用的椭圆曲线签名算法 |
| **AES-GCM** | - | 用于加密存储的对称加密算法，提供认证加密 |

---

## B. 资产与交易

| 术语 | 英文 | 定义 |
|------|------|------|
| **原生代币** | Native Token | 区块链的主币，如 ETH、BTC、BFM |
| **代币标准** | Token Standard | 智能合约代币的接口规范，如 ERC20、TRC20 |
| **NFT** | Non-Fungible Token | 不可替代代币，每个代币唯一 |
| **Gas** | - | 交易执行所需的计算费用单位 |
| **Gas Price** | - | 每单位 Gas 的价格 |
| **Gas Limit** | - | 交易允许消耗的最大 Gas 量 |
| **Nonce** | - | 账户的交易序号，防止重放攻击 |
| **UTXO** | Unspent Transaction Output | 比特币系链的未花费输出模型 |
| **账户模型** | Account Model | 以太坊系链的余额状态模型 |

---

## C. BFM 生态特定

| 术语 | 英文 | 定义 |
|------|------|------|
| **BFM** | BioForest Meta | BFM 链的原生代币 |
| **DWEB** | Decentralized Web | 去中心化网页应用运行环境 |
| **Plaoc** | Platform of Chains | BFM 的多链应用平台框架 |
| **DeepLink** | - | 用于跨应用通信的 URL 协议 |
| **ChainConfig** | - | 链网络的配置信息，包含 RPC、浏览器等 |
| **订阅源** | Subscription URL | 链配置的远程订阅地址 |

---

## D. 架构与技术栈

| 术语 | 英文 | 定义 |
|------|------|------|
| **Stackflow** | - | 移动端原生体验的 React 导航框架 |
| **Activity** | - | Stackflow 中的页面单元 |
| **TanStack Query** | - | 数据获取和缓存库，原 React Query |
| **TanStack Store** | - | 轻量级响应式状态管理库 |
| **TanStack Form** | - | 类型安全的表单状态管理库 |
| **shadcn/ui** | - | 基于 Radix UI 的可复制组件库 |
| **Zod** | - | TypeScript 优先的模式验证库 |
| **Vite** | - | 下一代前端构建工具 |
| **Vitest** | - | Vite 原生的测试框架 |
| **Playwright** | - | 跨浏览器端到端测试框架 |
| **Storybook** | - | UI 组件开发和文档工具 |

---

## E. 服务层

| 术语 | 英文 | 定义 |
|------|------|------|
| **Adapter** | 适配器 | 实现特定链服务接口的类 |
| **Registry** | 注册表 | 管理和查找链适配器的容器 |
| **Service** | 服务 | 提供特定功能的接口模块 |
| **Provider** | 提供者 | 底层 RPC/API 客户端 |
| **Subscribable** | 可订阅 | 事件驱动的数据变更通知机制 |
| **Branded Type** | 品牌类型 | TypeScript 中通过类型标记防止混淆的技术 |

---

## F. 安全相关

| 术语 | 英文 | 定义 |
|------|------|------|
| **应用锁** | App Lock | 进入应用时的身份验证机制 |
| **生物识别** | Biometric | 指纹或面部识别认证 |
| **自动锁定** | Auto Lock | 应用后台超时自动锁定 |
| **安全存储** | Secure Storage | 加密的本地数据存储 |
| **盐值** | Salt | 密码派生时添加的随机数据 |
| **KDF** | Key Derivation Function | 密钥派生函数，如 PBKDF2 |

---

## G. 国际化

| 术语 | 英文 | 定义 |
|------|------|------|
| **i18n** | Internationalization | 国际化，使应用支持多语言 |
| **l10n** | Localization | 本地化，针对特定地区的适配 |
| **RTL** | Right-to-Left | 从右到左的文字排版方向 |
| **LTR** | Left-to-Right | 从左到右的文字排版方向 |
| **Locale** | 区域设置 | 语言和地区的组合标识 |
| **Namespace** | 命名空间 | i18next 中的翻译分组 |

---

## H. 测试相关

| 术语 | 英文 | 定义 |
|------|------|------|
| **单元测试** | Unit Test | 测试最小功能单元的测试 |
| **组件测试** | Component Test | 测试 React 组件的测试 |
| **集成测试** | Integration Test | 测试模块间交互的测试 |
| **E2E 测试** | End-to-End Test | 模拟用户操作的完整流程测试 |
| **快照测试** | Snapshot Test | 比对 UI 输出变化的测试 |
| **视觉回归** | Visual Regression | 检测 UI 视觉变化的测试 |
| **Mock** | 模拟 | 替代真实依赖的测试替身 |
| **Fixture** | 测试夹具 | 预设的测试数据 |

---

## 参考资料

- [BIP39 - 助记词标准](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki)
- [BIP44 - 派生路径标准](https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki)
- [Ed25519 签名算法](https://ed25519.cr.yp.to/)
- [ERC20 代币标准](https://eips.ethereum.org/EIPS/eip-20)
