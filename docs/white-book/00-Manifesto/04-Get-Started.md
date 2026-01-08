# 04. 快速开始 (Get Started)

## 环境要求
*   **Node.js**: v20+
*   **pnpm**: v9+ (推荐 v10)
*   **Git**: v2.40+

## 启动流程

1.  **安装依赖**
    ```bash
    pnpm install
    ```

2.  **启动开发服务器**
    ```bash
    pnpm dev
    ```
    这将启动 Vite 服务，默认访问地址为 `http://localhost:5173`。

3.  **运行测试**
    *   单元测试: `pnpm test`
    *   类型检查: `pnpm typecheck`

4.  **构建**
    ```bash
    pnpm build
    ```

## 常用命令别名 (Agent)

我们封装了一套 `pnpm agent` 工具链，辅助 AI 开发：

*   `pnpm agent readme`: 获取项目索引和上下文。
*   `pnpm agent worktree create <name>`: 创建隔离开发环境。
*   `pnpm agent claim <issue-id>`: 领取任务。
