# KeyApp 白皮书丛书

KeyApp 的技术文档采用 **"技术丛书 (Technical Library)"** 的结构组织，分为 10 本独立的专著。

## 📚 丛书目录

### 📙 Book E1: The Manifesto (开发者手册)
> **[阅读本书](./00-Manifesto/README.md)**
>
> 适合所有开发者的入门指南。包含项目愿景、技术栈、开发工作流和编码规范。

### 📘 Book T1: The Kernel Reference (内核技术参考)
> **[阅读本书](./01-Kernel-Ref/README.md)**
>
> 深入解析 `miniapp-runtime` 核心机制。包含进程模型、窗口管理、沙箱隔离和 BioBridge 协议。

### 📘 Book T2: The Driver Reference (驱动技术参考)
> **[阅读本书](./02-Driver-Ref/README.md)**
>
> 多链适配层 (HAL) 的设计与实现。包含 Provider 接口规范、EVM/UTXO/TVM 驱动实现细节。

### 📘 Book T3: The UI Reference (组件技术参考)
> **[阅读本书](./03-UI-Ref/README.md)**
>
> 设计系统与组件库文档。包含 Design Tokens、基础组件 (Primitives) 和业务组件 (Composites)。

### 📘 Book T4: The Security Reference (安全技术参考)
> **[阅读本书](./08-Security-Ref/README.md)**
>
> 密钥管理、身份认证和授权协议。包含 BIP39/BIP44 规范、图案锁、DWEB 授权和安全审计清单。

### 📗 Book F1: The Wallet Guide (钱包业务指南)
> **[阅读本书](./10-Wallet-Guide/README.md)**
>
> 钱包核心业务的全链路实现指南。包含账户系统、资产管理和交易全生命周期。

### 📗 Book F2: The DApp Guide (生态接入指南)
> **[阅读本书](./11-DApp-Guide/README.md)**
>
> DApp 接入与开发指南。包含容器环境、Manifest 规范和连接协议 (WalletConnect)。

### 📗 Book F3: The Shell Guide (系统交互指南)
> **[阅读本书](./12-Shell-Guide/README.md)**
>
> 系统外壳 (Shell) 的架构与交互设计。包含路由配置、页面栈管理和系统级流程。

### 📙 Book E2: The DevOps (运维手册)
> **[阅读本书](./90-DevOps/README.md)**
>
> 工程化与发布流程。包含构建配置、测试策略和 CI/CD 流水线。

### 📙 Appendix (附录)
> **[阅读附录](./99-Appendix/README.md)**
>
> 参考资料和技术规范。包含术语表、链网络配置、状态机规范和边界条件目录。

---

## 🛠 快速命令

```bash
# 获取丛书索引
pnpm agent readme

# 查找相关文档
find docs/white-book -name "*keyword*"
```
