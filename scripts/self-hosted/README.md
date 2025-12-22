# Self-hosted Runner 配置指南

配置 GitHub Actions self-hosted runner，加速 CI/CD。

## 快速开始

```bash
# 1. 配置环境 (Node.js, pnpm, bun, Playwright)
./scripts/self-hosted/env-setup.sh

# 2. 获取 GitHub Runner 注册 token
TOKEN=$(gh api -X POST repos/BioforestChain/KeyApp/actions/runners/registration-token --jq '.token')

# 3. 配置多个 runner (推荐 4 个)
./scripts/self-hosted/setup-runners.sh 4 "$TOKEN"

# 4. 启动 runners
~/actions-runners/start-all.sh
```

## 脚本说明

| 脚本 | 说明 |
|------|------|
| `env-setup.sh` | 安装 Node.js, pnpm, bun, Playwright |
| `setup-runners.sh` | 配置多个 GitHub Actions runner |

## CI 工作流程

**Self-hosted 可用时 (快速模式):**
- 跳过环境安装 (预装)
- 直接: checkout → pnpm install → run
- 多个 runner 并行执行

**Self-hosted 不可用时 (Fallback):**
- 自动切换到 GitHub-hosted ubuntu-latest
- 完整安装流程
- 确保 CI 不中断

## Runner 管理

脚本生成在 `~/actions-runners/`:

```bash
~/actions-runners/start-all.sh   # 启动
~/actions-runners/stop-all.sh    # 停止
~/actions-runners/status.sh      # 状态
~/actions-runners/restart-all.sh # 重启
```

## 开机自启动 (macOS)

```bash
# 创建 LaunchAgent
cat > ~/Library/LaunchAgents/com.github.actions-runner.plist << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.github.actions-runner</string>
    <key>ProgramArguments</key>
    <array>
        <string>sh</string>
        <string>-c</string>
        <string>$HOME/actions-runners/start-all.sh</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
</dict>
</plist>
EOF

# 加载
launchctl load ~/Library/LaunchAgents/com.github.actions-runner.plist
```

## 系统要求

- macOS (M1/M2) 或 Linux (x64/arm64)
- 8GB+ RAM (推荐 16GB)
- 稳定网络
