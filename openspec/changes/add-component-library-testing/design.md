# Design: 组件库与测试环境

## Context

BFM Pay 是移动端钱包应用的技术重构项目。需要建立现代化的组件开发和测试基础设施，支持：
- 组件可视化开发与文档
- 移动端优先的响应式设计
- 高质量的自动化测试
- 支持后续的 TanStack 生态集成

## Goals / Non-Goals

### Goals
- 建立 Storybook 10.x 组件开发环境，支持移动端视口
- 建立 Vitest 4.x 测试环境，达到覆盖率目标
- 集成 shadcn/ui 作为基础组件库
- 配置 Tailwind CSS 4.x CSS-first 模式
- 开发 6 个基础 UI 组件

### Non-Goals
- 本阶段不涉及路由系统 (TanStack Router)
- 本阶段不涉及状态管理 (TanStack Store/Query)
- 本阶段不涉及业务功能实现
- 本阶段不涉及 E2E 测试 (Playwright)

## Decisions

### D1: 使用 Tailwind CSS 4.x CSS-first 配置

**决策**: 采用 Tailwind 4.x 的 CSS-first 配置，不使用 `tailwind.config.js`。

**理由**:
- CSS 原生配置更符合现代 CSS 标准
- 更好的 IDE 支持和类型提示
- OKLCH 色彩空间提供更好的颜色一致性
- 减少配置文件数量

**替代方案**:
- JS 配置 (tailwind.config.js): 传统方式，更多文档支持，但不符合 CSS-first 趋势

### D2: 使用 shadcn/ui 而非完整组件库

**决策**: 使用 shadcn/ui 的"复制代码"模式，而非安装完整组件库。

**理由**:
- 完全控制组件代码，可按需定制
- 无运行时依赖，减少 bundle size
- 与 Tailwind 无缝集成
- 组件代码透明，便于理解和修改

**替代方案**:
- Radix UI: 只提供无样式组件，需要更多样式工作
- Material UI: 体积大，风格固定，难以定制
- Ant Design Mobile: 体积大，风格与设计语言不符

### D3: Vitest 替代 Jest

**决策**: 使用 Vitest 4.x 作为测试框架。

**理由**:
- 与 Vite 无缝集成，共享配置
- ESM 原生支持，无需额外配置
- 更快的测试执行速度
- 内置 UI 和覆盖率支持

**替代方案**:
- Jest: 需要额外配置 ESM，与 Vite 集成复杂

### D4: Storybook 10.x 新 API

**决策**: 使用 Storybook 10.x 的新 API 模式。

**理由**:
- 内置 Vitest 集成
- 更好的 TypeScript 支持
- 简化的插件系统
- 性能改进

**注意**: Storybook 10.x 已正式发布，与 Vitest 集成良好。

### D5: 容器查询 (Container Queries) 用于组件响应式

**决策**: 组件级响应式使用 CSS Container Queries (`@container`)，页面级响应式使用 Media Queries。

**理由**:
- 组件真正的自包含：组件响应自身容器尺寸，而非视口尺寸
- 复用性更强：同一组件可放入不同宽度的容器（侧边栏、弹窗、主内容区）
- 折叠屏适配：设备展开/折叠时组件自动适应新容器尺寸
- Tailwind 4.x 原生支持：`@container`、`@xs:`、`@md:` 等前缀

**实现方式**:
```tsx
// 父组件定义容器
<div className="@container">
  {/* 子组件响应容器尺寸 */}
  <Card className="flex-col @sm:flex-row" />
</div>
```

**替代方案**:
- 纯 Media Queries: 传统方式，但组件无法真正自适应不同上下文
- CSS-in-JS 动态样式: 运行时计算，性能开销大

**Storybook 集成**:
- 提供可调整宽度的容器 Decorator
- 预设多种容器尺寸选项 (280px / 320px / 360px / 480px / 600px)
- 支持拖拽调整容器宽度进行实时预览

## Risks / Trade-offs

| 风险 | 影响 | 缓解措施 |
|-----|------|---------|
| Tailwind 4.x 生态不完善 | 插件兼容性问题 | 手动实现缺失功能 |
| shadcn/ui 组件更新困难 | 需要手动合并更新 | 记录修改，谨慎更新 |

## File Structure

```
src/
├── components/
│   └── ui/
│       ├── button.tsx             # shadcn/ui 基础
│       ├── gradient-button.tsx    # 自定义渐变按钮
│       ├── gradient-button.stories.tsx
│       ├── gradient-button.test.tsx
│       ├── password-input.tsx
│       ├── password-input.stories.tsx
│       ├── password-input.test.tsx
│       ├── bottom-sheet.tsx
│       ├── bottom-sheet.stories.tsx
│       ├── bottom-sheet.test.tsx
│       ├── page-header.tsx
│       ├── page-header.stories.tsx
│       ├── page-header.test.tsx
│       ├── loading-spinner.tsx
│       ├── loading-spinner.stories.tsx
│       └── loading-spinner.test.tsx
├── lib/
│   └── utils.ts                   # cn() 等工具函数
├── styles/
│   └── globals.css                # Tailwind 4.x 配置
├── test/
│   └── setup.ts                   # 测试 setup
└── main.tsx

.storybook/
├── main.ts
├── preview.tsx
└── vitest.setup.ts

vitest.config.ts
```

## Migration Plan

N/A - 这是新项目初始化，无迁移需求。

## Open Questions

1. ~~**Storybook 10.x 稳定性**: 如果遇到严重问题，是否立即降级到 8.x？~~
   - ✅ 已解决: Storybook 10.x 工作正常，与 Vitest 集成良好

2. **shadcn/ui 组件选择**: 是否需要安装所有组件还是按需安装？
   - 建议: 按需安装，只安装当前阶段需要的组件

3. **测试覆盖率阈值**: 初始阶段是否强制覆盖率？
   - 建议: 初始阶段不强制，当前覆盖率为 86%
