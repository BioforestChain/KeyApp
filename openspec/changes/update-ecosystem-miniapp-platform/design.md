## Context

本变更属于“生态（miniapp）平台”的第二阶段完善：
- 已有：iframe 容器、`window.bio` SDK、Host Provider、权限弹窗、可信源管理 UI、内置 miniapps 与 Vite 插件雏形
- 需要补齐：订阅式缓存闭环、评分精选、可扩展搜索、交易流水线、appId 安全规范、导航同步基础设施可维护性

## Goals / Non-Goals

### Goals
- 可信源配置与订阅数据形成单一闭环（SSR 订阅式）
- “生态页”按评分做部分列出，避免全量堆砌
- `createTransaction → signTransaction` 交易流水线 API 固化（不可省略）
- appId 反向域名规范落地，并确保导航/路由稳定支持 `.` 参数
- 自维护 navigation-sync 插件，替换停更依赖，未来可升级 Navigation API

### Non-Goals
- 不在本变更内完成“全站搜索”的后端实现（仅定义协议 + Host 适配入口）
- 不在本变更内完成所有链类型的完整广播能力（先保证接口与安全流程正确）

## Data Model

### Source Config (User)
- Store 只管理“可信源配置”（url/name/enabled），不直接存储完整 apps 列表。

### Source Cache (Device)
- IndexedDB 按 source URL 缓存：
  - `etag`（用于 304）
  - `lastUpdated`
  - `payload`（EcosystemSource）

### Ranking
- `officialScore`：官方推荐分（0-100）
- `communityScore`：社区热门分（0-100）
- `officialWeightPct`：按日期动态权重（初始 `0`，每天 `+15` 并对 `100` 取模循环：`15,30,45,60,75,90,5,...`）
- `communityWeightPct = 100 - officialWeightPct`
- `featuredScore = (officialScore * officialWeightPct + communityScore * communityWeightPct) / 100`（0-100）

> 若字段缺失：默认视为 0（保持来源可选，不强制所有源立刻支持）。

## API Design

### Bio Provider Transaction Pipeline

#### bio_createTransaction
- Input：`{ from, to, amount, chain, asset?, data? }`
- Output：`{ chain, data }`（chain-specific unsigned tx）
- Security：不需要用户确认，但必须校验 `from` 属于用户钱包（防构造恶意 from）。

#### bio_signTransaction
- Input：`{ from, chain, unsignedTx }`
- Output：`{ chain, raw, signature? }`
- Security：
  - 必须用户确认 + 钱包锁验证
  - 必须校验签名地址与 tx.from 一致

### Search

- Local search：基于已缓存 apps 做 fuzzy/contains（离线可用）
- Remote search：订阅源可选提供 `search.urlTemplate`（固定 GET，模板形如 `https://example.com/search?q=%s`）
- Remote search response：`{ version: string; data: MiniappManifest[] }`
- 合并策略：
  - 去重 key：`appId`
  - 优先级：本地缓存（可带评分字段）覆盖远程结果同 id 的缺失字段

## Navigation Sync Plugin

### Baseline
- 基于 Stackflow `plugin-history-sync` 行为对齐现有 app（hash routing + routes map）。

### Key Changes
- 使用 `urlpattern-polyfill`（URLPattern）替代 `url-pattern`
  - 解决已停更依赖
  - 更贴近浏览器未来标准
- 移除 `react18-use`（可用 React 原生 hooks 实现）

### Future
- 预留 transport 抽象，后续可切换到 Navigation API。
