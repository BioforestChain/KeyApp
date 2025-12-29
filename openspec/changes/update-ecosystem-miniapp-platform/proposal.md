# Change: Update Ecosystem Miniapp Platform (Subscription v2 + Tx Pipeline + AppId + Navigation Sync)

## Status

**PROPOSAL** - Pending review and approval

## Why

当前 “生态（miniapp）” 平台已经完成了 iframe 容器、`window.bio` SDK、Host Provider、可信源管理 UI 与基础注册表，但存在以下关键问题：

1. **可信源配置与数据拉取割裂**：设置页的可信源与运行时 registry 未形成单一真相（store/registry 分离），无法形成“SSR 订阅式”的缓存闭环。
2. **订阅源能力过于基础**：当前倾向“全量列出”，缺少“部分列出 + 评分精选（官方/社区）”的产品化展示策略。
3. **交易能力缺口**：仅 `sendTransaction` 不足以支撑真实 DApp 需求；必须提供 “createTransaction → signTransaction” 的交易流水线能力。
4. **AppId 安全规范落地**：需要统一 `xxx.xx.xx` 反向域名命名，并确保路由/导航系统对包含 `.` 的参数稳定支持。
5. **基础设施可维护性**：`@stackflow/plugin-history-sync` 依赖 `url-pattern`（停更），需要自维护插件版本以便未来升级到 Navigation API。

## What Changes

### 1) 订阅系统 v2（SSR 订阅原理）
- 设置页维护多可信源 URL（可启用/禁用）。
- 订阅源数据拉取后缓存到本地（IndexedDB + ETag/304 支持）。
- “生态页”仅消费统一聚合结果（单一真相），避免 UI 层重复逻辑（DRY）。

### 2) 展示策略：部分列出 + 评分精选
- 引入评分字段：
  - `officialScore`（官方推荐分）
  - `communityScore`（社区热门分）
  - `featuredScore`：按日期动态权重计算（官方/社区权重每日 +15 循环）
- 生态页按评分生成：
  - 精选（Top N）
  - 推荐（Top N）
  - 热门（Top N）

### 3) 搜索接口：订阅列表以外的应用
- 支持本地缓存内搜索（离线可用）。
- 支持订阅源提供远程搜索 `search.urlTemplate`（固定 GET，形如 `https://example.com/search?q=%s`），用于“订阅列表以外”的应用搜索。
- 远程搜索响应格式：`{ version: string; data: MiniappManifest[] }`。

### 4) 交易流水线：createTransaction + signTransaction（不可省略）
- SDK：补齐 `bio_createTransaction` 与 `bio_signTransaction` 方法与类型定义。
- Host：补齐对应 handler（需要用户确认 + 钱包锁验证）。

### 5) AppId 命名规范（反向域名）
- 内置小程序与注册表数据必须遵守 `com.domain.app`（反向域名）命名。
- Host 侧对 appId 做基础校验并避免冲突覆盖。

### 6) 自维护 Navigation Sync 插件
- 新增 `packages/plugin-navigation-sync`：
  - 使用 `urlpattern-polyfill` 替代 `url-pattern`
  - 逐步移除 `react18-use`
  - 为未来升级 Navigation API 预留扩展点

### 7) Build 闭环（Vite 插件）
- 在 KeyApp 的 `vite.config.ts` 内通过插件系统完成：构建 miniapps → 生成 `ecosystem.json` → KeyApp 直接消费。

## Impact

### Affected Code (expected)
- `src/services/ecosystem/*`：订阅缓存/评分/搜索能力
- `src/stores/ecosystem.ts`：可信源配置作为单一真相
- `packages/bio-sdk/*`：补齐交易流水线 API
- `src/services/ecosystem/provider.ts` + `handlers/*`：新增方法注册与实现
- `packages/plugin-navigation-sync/*`：新包（替代 `@stackflow/plugin-history-sync`）
- `src/stackflow/stackflow.ts`：切换到自维护插件
- `scripts/vite-plugin-miniapps.ts` / `vite.config.ts`：构建闭环与注册表生成

## Success Criteria

1. 设置页新增/启用/禁用可信源后，生态页刷新能稳定命中本地缓存与远程更新（ETag/304）。
2. 生态页不再默认全量列出，而是按评分生成“精选/推荐/热门”的 Top 列表。
3. `bio_createTransaction` 与 `bio_signTransaction` 在 SDK 与 Host 侧完整可用（含用户确认与钱包锁验证）。
4. 内置小程序 appId 统一为反向域名格式，并且路由/导航对包含 `.` 的参数稳定解析。
5. `packages/plugin-navigation-sync` 替代现有 history-sync 插件并通过测试（至少覆盖路由 parse/fill）。
