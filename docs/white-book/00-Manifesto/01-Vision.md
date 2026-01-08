# 01. 项目愿景 (Vision)

## WebOS for Crypto

KeyApp 不仅仅是一个多链钱包，它是一个 **去中心化 DApp 运行时 (Decentralized DApp Runtime)**，即 **WebOS**。

### 核心理念

1.  **微内核 (Micro-Kernel)**:
    *   通过 `miniapp-runtime` 实现应用进程隔离。
    *   每个 DApp 运行在独立的 iframe 沙箱中。
    *   通过 `BioBridge` 进行受控的跨进程通信。

2.  **驱动分离 (Driver Abstraction)**:
    *   底层链的差异被封装在 `ChainAdapter` 层。
    *   上层应用通过统一的 `ApiProvider` 接口与链交互。
    *   支持动态加载新的链驱动。

3.  **沉浸式体验 (Immersive Shell)**:
    *   提供类似原生 OS 的多任务管理 (Stack View)。
    *   支持手势导航、FLIP 动画和系统级通知。

### 为什么这样做？

传统的 DApp 浏览器只是一个 WebView。KeyApp 试图在浏览器中重建操作系统的核心能力：**安全隔离**、**资源调度** 和 **统一交互**。这使得 KeyApp 能够成为连接 Web2 用户与 Web3 世界的终极网关。
