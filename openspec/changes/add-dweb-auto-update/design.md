## Context
- DWEB 需要独立于 Web 的自动升级能力，且必须遵循当前 build 产物路径（stable: /dweb/metadata.json, dev: /dweb-dev/metadata.json）。
- 现有 set-secret 仅管理 secrets，缺少统一的 env/var 描述与本地+GitHub 同步。
- release 流程必须严格基于 origin/main，避免本地工作区干扰，并在分支保护下可用。

## Goals / Non-Goals
- Goals:
  - DWEB 自动升级：启动延迟检查 + 关于页手动检查 + 升级弹窗
  - 统一配置管理：本地 .env.local 与 GitHub Variables/Secrets
  - Release 仅基于 origin/main，必要时 admin 直提
- Non-Goals:
  - Web 端升级提示（仅 DWEB）
  - 改动现有更新路径与部署策略

## Decisions
- Decision: 通过 Vite define 注入 `__KEYAPP_SITE_ORIGIN__`（来源于 env.SITE_ORIGIN 或构建环境 vars），避免直接暴露 VITE_ 前缀。
- Decision: 更新检测仅在 DWEB 构建中启用（SERVICE_IMPL=dweb），使用 `__DEV_MODE__` 区分 dev/stable 访问路径。
- Decision: metadata.json 解析版本与 changelog（manifest 中 `change_log` 优先），作为弹窗内容来源。
- Decision: set-env 使用 JSON 配置描述字段（类型/显示/本地+GitHub），GitHub 同步分别走 `gh variable` 与 `gh secret`。
- Decision: release 脚本在临时目录 clone origin/main，校验本地与远端一致；如保护分支阻止 push，则允许 `--admin` 直提策略。

## Risks / Trade-offs
- Risk: metadata.json 结构变动导致解析失败 → 失败时仅提示“无法检查更新”，不阻断启动。
- Risk: admin 直提存在权限依赖 → 无权限时明确失败并提示使用管理员账户执行。

## Migration Plan
- 引入 set-env 后，set-secret 保持提示但不再新增字段。
- release 脚本加入 strict 校验；CI/手动流程保持不变。

## Open Questions
- 是否需要把 changelog 展示为可展开的完整内容（默认展示 3–5 行）？
