# Architecture Map

KeyApp follows a **Layered Architecture** inspired by Operating System design.

```mermaid
graph TD
    subgraph "App Layer (DApps)"
        DApp1[Uniswap]
        Miniapp[System Miniapps]
    end

    subgraph "Shell Layer (System UI)"
        Router[Stackflow Router]
        SystemApps[Wallet / Settings]
    end

    subgraph "Kernel Layer (Runtime)"
        Process[Process Manager]
        Window[Window Manager]
        Sandbox[Iframe Sandbox]
    end

    subgraph "State Layer (Reactive)"
        Stores[TanStack Store]
        Queries[TanStack Query]
    end

    subgraph "Service Layer (Logic)"
        WalletCore[Wallet Core]
        Identity[Biometric / Auth]
        Platform[Platform Adapters]
    end

    subgraph "Driver Layer (Chain)"
        HAL[ApiProvider Interface]
        EVM[EVM Driver]
        UTXO[BTC Driver]
        TVM[Tron Driver]
    end

    DApp1 --> Sandbox
    Sandbox --> ServiceLayer
    SystemApps --> StateLayer
    StateLayer --> ServiceLayer
    ServiceLayer --> DriverLayer
    ServiceLayer --> Platform
```

## Directory Mapping

The documentation structure strictly mirrors the codebase:

| Architecture Layer | Code Path | Documentation Book |
| :--- | :--- | :--- |
| **Kernel** | `src/services/miniapp-runtime` | [`01-Kernel-Ref`](../01-Kernel-Ref) |
| **Drivers** | `src/services/chain-adapter` | [`02-Driver-Ref`](../02-Driver-Ref) |
| **UI System** | `src/components/ui`, `src/styles` | [`03-UI-Ref`](../03-UI-Ref) |
| **Platform** | `src/services/{biometric,camera,...}` | [`04-Platform-Ref`](../04-Platform-Ref) |
| **State** | `src/stores`, `src/queries` | [`05-State-Ref`](../05-State-Ref) |
| **Wallet Logic** | `src/services/wallet`, `src/services/transaction` | [`10-Wallet-Guide`](../10-Wallet-Guide) |
| **DApps** | `src/components/ecosystem` | [`11-DApp-Guide`](../11-DApp-Guide) |
| **Shell** | `src/stackflow` | [`12-Shell-Guide`](../12-Shell-Guide) |
| **DevOps** | `vite.config.ts`, `.github` | [`90-DevOps`](../90-DevOps) |
