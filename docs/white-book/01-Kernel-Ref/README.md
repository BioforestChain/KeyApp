# 📘 Book T1: The Kernel Reference (内核技术参考)

> **Core of the WebOS**
> 
> 本书深入解析 `miniapp-runtime` 的内部机制，解释 KeyApp 如何在浏览器中实现进程隔离、窗口管理和跨进程通信。

## 📖 目录

*   [00-Overview.md](./00-Overview.md) - 内核架构全景
*   **01-Process (进程管理)**
    *   [01-State-Machine.md](./01-Process/01-State-Machine.md) - 进程状态机
    *   [02-Scheduling.md](./01-Process/02-Scheduling.md) - 调度与保活
*   **02-Window (窗口管理)**
    *   [01-Presentation-Model.md](./02-Window/01-Presentation-Model.md) - 窗口模型
    *   [02-FLIP-Animation.md](./02-Window/02-FLIP-Animation.md) - 动画引擎
*   **03-Sandbox (沙箱隔离)**
    *   [01-Iframe-Manager.md](./03-Sandbox/01-Iframe-Manager.md) - Iframe 管理
    *   [02-BioBridge-Protocol.md](./03-Sandbox/02-BioBridge-Protocol.md) - BioBridge 协议
