# Change: DWEB 自动升级 + 配置工具 + Release 守卫

## Why
DWEB 需要自动检测更新并提供一键升级入口，同时需要统一本地/GitHub 环境配置与发布流程，降低发布心智负担与错误率。

## What Changes
- 新增 DWEB 自动升级：启动延迟检查 + 关于页手动检查 + 升级弹窗 + dweb://install 链接
- 注入 KeyApp 官网 Origin（可配置），根据稳定/测试模式拼接 metadata URL
- 新增 set-env 工具（替代 set-secret）：基于配置文件管理本地与 GitHub 的变量/Secrets
- 升级 release 工具：仅允许基于 origin/main 进行发布（必要时使用 admin 方式完成提交）

## Impact
- Affected specs: dweb-update, release-tooling
- Affected code: src/services/* (update service), src/pages/settings/* (About UI), vite.config.ts (define 注入), scripts/set-env.ts, scripts/release.ts
