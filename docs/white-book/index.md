---
title: KeyApp 白皮书丛书
description: KeyApp 多链钱包的完整技术文档，采用技术丛书结构组织
---

# KeyApp 白皮书丛书

KeyApp 的技术文档采用 **"技术丛书 (Technical Library)"** 的结构组织，分为 **16 本**独立的专著。

## 📚 丛书目录

### 📙 Book E1: The Manifesto (开发者手册)
> **[阅读本书](./00-Manifesto/)**
>
> 适合所有开发者的入门指南。包含项目愿景、技术栈、开发工作流和编码规范。

### 📘 Book T1: The Kernel Reference (内核技术参考)
> **[阅读本书](./01-Kernel-Ref/)**
>
> 深入解析 `miniapp-runtime` 核心机制。包含进程模型、窗口管理、沙箱隔离和 BioBridge 协议。

### 📘 Book T2: The Driver Reference (驱动技术参考)
> **[阅读本书](./02-Driver-Ref/)**
>
> 多链适配层 (HAL) 的设计与实现。包含 Provider 接口规范、EVM/UTXO/TVM 驱动实现细节。

### 📘 Book T3: The UI Reference (组件技术参考)
> **[阅读本书](./03-UI-Ref/)**
>
> 设计系统与组件库文档。包含 Design Tokens、基础组件 (Primitives) 和业务组件 (Composites)。

### 📘 Book T4: The Platform Reference (平台服务参考)
> **[阅读本书](./04-Platform-Ref/)**
>
> 硬件与系统集成服务。包含生物识别、相机、触觉反馈等跨平台能力适配。

### 📘 Book T5: The State Reference (状态管理参考)
> **[阅读本书](./05-State-Ref/)**
>
> 应用状态管理层。包含 TanStack Store (Client State) 和 TanStack Query (Server State)。

### 📘 Book T6: The Service Reference (服务层参考)
> **[阅读本书](./06-Service-Ref/)**
>
> 核心业务服务层。包含 35 个服务目录、160+ 源文件，覆盖钱包、链适配、生态系统等。

### 📘 Book T7: The Types Reference (类型系统参考)
> **[阅读本书](./07-Types-Ref/)**
>
> 核心类型定义。包含 Amount (精确金额)、Asset (资产信息)、Staking (跨链质押) 等。

### 📘 Book T8: The Security Reference (安全技术参考)
> **[阅读本书](./08-Security-Ref/)**
>
> 密钥管理、身份认证和授权协议。包含 BIP39/BIP44 规范、图案锁、DWEB 授权和安全审计清单。

### 📘 Book T9: The i18n Reference (国际化技术参考)
> **[阅读本书](./09-i18n-Ref/)**
>
> 多语言支持和本地化规范。包含 6 种语言支持、RTL 布局、翻译资源管理和数字/日期格式化。

### 📗 Book F1: The Wallet Guide (钱包业务指南)
> **[阅读本书](./10-Wallet-Guide/)**
>
> 钱包核心业务的全链路实现指南。包含账户系统、资产管理和交易全生命周期。

### 📗 Book F2: The DApp Guide (生态接入指南)
> **[阅读本书](./11-DApp-Guide/)**
>
> DApp 接入与开发指南。包含容器环境、Manifest 规范和连接协议 (WalletConnect)。

### 📗 Book F3: The Shell Guide (系统交互指南)
> **[阅读本书](./12-Shell-Guide/)**
>
> 系统外壳 (Shell) 的架构与交互设计。包含路由配置、页面栈管理和系统级流程。

### 📙 Book E2: The DevOps (运维手册)
> **[阅读本书](./90-DevOps/)**
>
> 工程化与发布流程。包含构建配置、测试策略和 CI/CD 流水线。

### 📙 Appendix (附录)
> **[阅读附录](./99-Appendix/)**
>
> 参考资料和技术规范。包含术语表、链网络配置、状态机规范和边界条件目录。

### 📓 Book E3: The Documentation Guide (文档编辑规范)
> **[阅读本书](./99-Documentation-Guide/)**
>
> 白皮书编写标准和审稿依据。包含结构规范、内容标准、交叉引用规则。

---

## 🛠 快速命令

```bash
# 获取丛书索引
pnpm agent readme

# 查找相关文档
find docs/white-book -name "*keyword*"
```
