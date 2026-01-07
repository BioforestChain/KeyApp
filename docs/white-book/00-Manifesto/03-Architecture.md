# 03. 宏观架构图 (Architecture Map)

KeyApp 遵循典型的 **分层架构 (Layered Architecture)**，模仿操作系统的设计。

```mermaid
graph TD
    subgraph "App Layer (DApps)"
        DApp1[Uniswap]
        DApp2[AAVE]
        Miniapp[System Miniapps]
    end

    subgraph "Shell Layer (System UI)"
        Router[Stackflow Router]
        TaskManager[Task View]
        SystemApps[Wallet / Settings]
    end

    subgraph "Kernel Layer (Miniapp Runtime)"
        Process[Process Manager]
        Window[Window Manager]
        Sandbox[Iframe Sandbox]
        Bridge[BioBridge IPC]
    end

    subgraph "Service Layer (Business Logic)"
        WalletCore[Wallet Core]
        Store[State Store]
        Identity[Biometric / Auth]
    end

    subgraph "Driver Layer (Chain Adapters)"
        HAL[ApiProvider Interface]
        EVM[EVM Driver]
        UTXO[BTC Driver]
        TVM[Tron Driver]
    end

    DApp1 --> Sandbox
    Sandbox --> Bridge
    Bridge --> ServiceLayer
    SystemApps --> ServiceLayer
    ServiceLayer --> HAL
    HAL --> EVM & UTXO & TVM
```

## 目录映射

| 架构层级 | 对应代码目录 | 对应文档 |
| :--- | :--- | :--- |
| **Kernel** | `src/services/miniapp-runtime` | `01-Kernel-Ref` |
| **Shell** | `src/stackflow` | `03-Shell-Guide` |
| **Service** | `src/services/*`, `src/stores` | `10-Wallet-Guide` |
| **Driver** | `src/services/chain-adapter` | `02-Driver-Ref` |
| **UI** | `src/components`, `src/styles` | `03-UI-Ref` |
