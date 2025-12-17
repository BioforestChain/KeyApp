# Design: Native App-like Navigation with Stackflow

## Context

### 背景

BFM Pay 是一个移动端钱包应用，用户期望获得接近原生 App 的导航体验。当前基于 TanStack Router 的实现缺乏：
- 页面过渡动画
- 手势返回支持
- 原生风格的 Header 动画

### 约束

1. **必须与 shadcn/ui 兼容**：现有 UI 组件不能被替换
2. **支持 PWA 和 DWEB**：需要在浏览器和 Plaoc 环境中运行
3. **保持类型安全**：路由参数需要 TypeScript 类型推断
4. **Bundle size 敏感**：目标 < 500KB gzipped

## Goals / Non-Goals

### Goals

1. 实现 iOS/Android 风格的页面堆栈导航动画
2. 支持边缘滑动返回手势
3. 提供底部 Tab Bar 导航
4. 保持与现有 shadcn/ui 组件的完全兼容
5. 支持 URL 历史同步（浏览器前进/后退）

### Non-Goals

1. 不追求 100% 原生体验（如 iOS Large Title 完整实现）
2. 不实现每个 Tab 独立导航栈（第一版）
3. 不替换 TanStack Router 的类型系统

## Stackflow 技术概览

### 什么是 Stackflow

Stackflow 是由韩国 Karrot（当当/당근마켓）开发的移动端风格导航库，专为 Web 应用设计。

**官方文档**: https://stackflow.so
**完整 LLM 文档**: https://stackflow.so/llms-full.txt

### 核心概念

```
┌─────────────────────────────────────────────────────────┐
│                      Stack                               │
│  ┌─────────────────────────────────────────────────┐    │
│  │ Activity 3 (当前显示)                             │    │
│  │ ┌─────────────────────────────────────────────┐ │    │
│  │ │ AppScreen (header + content container)      │ │    │
│  │ │ ┌─────────────────────────────────────────┐ │ │    │
│  │ │ │ 你的页面内容 (shadcn/ui 组件)            │ │ │    │
│  │ │ └─────────────────────────────────────────┘ │ │    │
│  │ └─────────────────────────────────────────────┘ │    │
│  └─────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────┐    │
│  │ Activity 2 (部分可见，带阴影)                    │    │
│  └─────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────┐    │
│  │ Activity 1 (不可见)                              │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

### 关键 API

```typescript
// 1. 配置 Stackflow
import { stackflow } from "@stackflow/react";
import { basicRendererPlugin } from "@stackflow/plugin-renderer-basic";
import { basicUIPlugin } from "@stackflow/plugin-basic-ui";

export const { Stack, useFlow, useStepFlow } = stackflow({
  transitionDuration: 350,
  plugins: [
    basicRendererPlugin(),
    basicUIPlugin({ theme: "cupertino" }), // iOS 风格
  ],
  activities: {
    HomeActivity,
    WalletDetailActivity,
    TransferActivity,
  },
  initialActivity: () => "HomeActivity",
});

// 2. 创建 Activity 组件
import type { ActivityComponentType } from "@stackflow/react";
import { AppScreen } from "@stackflow/plugin-basic-ui";

const WalletDetailActivity: ActivityComponentType<{
  walletId: string;
  walletName: string;
}> = ({ params }) => {
  const { push, pop } = useFlow();

  return (
    <AppScreen appBar={{ title: params.walletName }}>
      {/* shadcn/ui 组件正常使用 */}
      <Card>
        <CardContent>
          <Button onClick={() => push("TransferActivity", {})}>
            转账
          </Button>
        </CardContent>
      </Card>
    </AppScreen>
  );
};

// 3. 导航操作
const { push, pop, replace } = useFlow();

push("ActivityName", { param1: "value" });  // 入栈
pop();                                       // 出栈
replace("ActivityName", { param1: "value" }); // 替换

// 4. Step 导航（Activity 内部多步骤）
const { stepPush, stepPop, stepReplace } = useStepFlow("TransferActivity");

stepPush({ step: "confirm" });  // 进入下一步
stepPop();                       // 返回上一步
```

### 包结构

| 包 | 用途 | 是否必需 |
|---|------|---------|
| `@stackflow/core` | 核心状态机 | ✅ |
| `@stackflow/react` | React 绑定 | ✅ |
| `@stackflow/plugin-renderer-basic` | 基础渲染器 | ✅ |
| `@stackflow/plugin-basic-ui` | iOS/Android UI | ⚠️ 可选 |
| `@stackflow/plugin-history-sync` | URL 历史同步 | ⚠️ 推荐 |

### Safe Area 处理

```
┌──────────────────────────────────┐
│ ████████ 刘海屏 ████████         │ ← Stackflow AppBar 自动处理
│ ┌──────────────────────────────┐ │
│ │        AppBar (title)        │ │
│ ├──────────────────────────────┤ │
│ │                              │ │
│ │        页面内容               │ │ ← 开发者负责
│ │                              │ │
│ │                              │ │
│ ├──────────────────────────────┤ │
│ │        Tab Bar               │ │ ← 开发者负责
│ └──────────────────────────────┘ │
│ ████ Home Indicator ████        │ ← 开发者处理 safe-area-inset-bottom
└──────────────────────────────────┘
```

## Decisions

### Decision 1: 使用 Stackflow 而非其他方案

**选择**: Stackflow

**理由**:
- Headless 架构，样式污染最小
- 由 Karrot（月活千万级 C2C 平台）维护，生产验证
- 内置手势返回支持
- 与 shadcn/ui 完全兼容

**备选方案**:
| 方案 | 放弃理由 |
|------|----------|
| Ionic | 样式系统与 shadcn 冲突，需要大量适配 |
| Framer Motion 自研 | 需要自己实现页面栈、手势、Header 动画等，工作量巨大 |
| View Transitions API | 不支持手势返回，浏览器兼容性有限 |
| react-navigation (web) | 主要为 React Native 设计，Web 支持实验性 |

### Decision 2: 保留 TanStack Router

**选择**: TanStack Router + Stackflow 共存

**理由**:
- TanStack Router 提供类型安全的路由参数
- `plugin-history-sync` 可以同步 URL 状态
- 渐进式迁移，降低风险

**实现方式**:
```typescript
// TanStack Router 负责 URL 解析
const router = createRouter({
  routeTree,
  history: createHashHistory(),
});

// Stackflow 负责导航动画
const { Stack } = stackflow({
  plugins: [
    historySyncPlugin({
      routes: {
        HomeActivity: "/",
        WalletDetailActivity: "/wallet/:walletId",
      },
    }),
  ],
});
```

### Decision 3: Tab Bar 实现方式

**选择**: 单 Activity + State 切换

**理由**:
- Stackflow 没有内置 Tab Bar
- 多 Stack 实例复杂度高
- 单 Activity 方案更简单，满足当前需求

**结构**:
```typescript
const MainTabsActivity: ActivityComponentType<{ tab?: TabId }> = ({ params }) => {
  const [activeTab, setActiveTab] = useState(params.tab || "home");

  return (
    <AppScreen appBar={{ title: tabs[activeTab].label }}>
      <div className="flex-1 overflow-auto pb-20">
        {activeTab === "home" && <HomeTab />}
        {activeTab === "wallet" && <WalletTab />}
        {/* ... */}
      </div>

      {/* 底部 Tab Bar */}
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </AppScreen>
  );
};
```

### Decision 4: 使用 basicUIPlugin 还是自定义渲染器

**选择**: 初期使用 `basicUIPlugin`，后期可自定义

**理由**:
- `basicUIPlugin` 提供开箱即用的 iOS/Android 风格
- 样式可通过 CSS 变量覆盖
- 如果需要完全自定义，可以替换为自定义 render plugin

**自定义选项（未来）**:
```typescript
// 完全自定义渲染器
const customRendererPlugin = () => ({
  key: "custom-renderer",
  render({ stack }) {
    return (
      <div className="custom-stack">
        {stack.render().activities.map((activity) => (
          <div key={activity.id} className="custom-activity">
            {activity.render()}
          </div>
        ))}
      </div>
    );
  },
});
```

## Architecture

### 目录结构

```
src/
├── stackflow/
│   ├── stackflow.ts              # Stackflow 配置
│   ├── activities/               # Activity 组件
│   │   ├── MainTabsActivity.tsx  # 主页（含 Tab Bar）
│   │   ├── WalletDetailActivity.tsx
│   │   ├── TransferActivity.tsx
│   │   └── ...
│   └── components/               # 导航相关组件
│       └── TabBar.tsx
├── pages/                        # 保留，逐步迁移
├── routes/
│   └── index.tsx                 # 集成 Stackflow
└── styles/
    └── globals.css               # 引入 Stackflow CSS
```

### 数据流

```
用户点击 "钱包详情"
        │
        ▼
  useFlow().push("WalletDetailActivity", { walletId: "1" })
        │
        ▼
  Stackflow Core 更新状态
        │
        ├──▶ basicRendererPlugin 渲染新 Activity
        │           │
        │           ▼
        │    basicUIPlugin 应用过渡动画
        │
        └──▶ historySyncPlugin 同步 URL
                    │
                    ▼
             浏览器历史更新为 /wallet/1
```

## Risks / Trade-offs

### Risk 1: Bundle Size 增加

**风险**: Stackflow 全家桶约 40KB gzipped

**缓解**:
- 按需引入 plugin
- 使用 tree-shaking
- 与现有 bundle 合并评估总体影响

### Risk 2: 学习曲线

**风险**: 团队需要学习 Stackflow 的 Activity/Step 概念

**缓解**:
- 提供 demo 项目 (`.tmp/stackflow-demo/`)
- 编写详细的迁移指南
- 官方文档完善: https://stackflow.so/llms-full.txt

### Risk 3: 与现有代码冲突

**风险**: TanStack Router 和 Stackflow 同时管理导航可能冲突

**缓解**:
- 使用 `historySyncPlugin` 统一 URL 状态
- 分阶段迁移，每阶段充分测试
- 保留回滚能力

### Risk 4: Tab 状态不独立

**风险**: 当前方案每个 Tab 不维护独立导航栈

**缓解**:
- 第一版接受此限制
- 未来可升级为多 Stack 方案
- 用户习惯验证后再决定是否需要

## Migration Plan

### Phase 1: 基础集成（1-2 天）

1. 安装 Stackflow 依赖
2. 创建 `src/stackflow/stackflow.ts` 配置
3. 创建 `MainTabsActivity` 作为入口
4. 在 `src/routes/index.tsx` 渲染 Stack
5. 验证基础导航和动画

### Phase 2: 页面迁移（3-5 天）

1. 迁移首页相关 Activity
2. 迁移钱包相关 Activity
3. 迁移转账相关 Activity
4. 迁移设置相关 Activity
5. 迁移 DWEB 授权相关 Activity

### Phase 3: 清理和优化（1-2 天）

1. 移除冗余的 TanStack Router 配置
2. 统一导航 API 调用
3. 性能优化和测试
4. 文档更新

### 回滚计划

如果迁移过程中发现严重问题：
1. 保留原有 `src/pages/` 目录结构
2. 通过 feature flag 切换新旧导航
3. 必要时回退到纯 TanStack Router

## Open Questions

1. **是否需要每个 Tab 独立导航栈？**
   - 当前方案：否，单 Activity + State
   - 取决于用户反馈

2. **是否自定义渲染器替换 basicUIPlugin？**
   - 当前方案：使用 basicUIPlugin
   - 如果样式定制需求强烈可后期替换

3. **如何处理 DWEB 环境的特殊导航？**
   - 需要测试 Plaoc 环境下的行为
   - 可能需要条件判断或特殊适配

## References

- Stackflow 官方文档: https://stackflow.so
- Stackflow LLM 完整文档: https://stackflow.so/llms-full.txt
- Stackflow GitHub: https://github.com/daangn/stackflow
- Demo 项目: `.tmp/stackflow-demo/`
- Karrot 技术博客: https://medium.com/daangn
