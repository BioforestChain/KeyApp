# Key UI 组件库

> 源码: [`packages/key-ui/`](https://github.com/BioforestChain/KeyApp/tree/main/packages/key-ui)

## 概述

`@biochain/key-ui` 是 KeyApp 的共享 UI 组件库，供主应用和 MiniApps 共同使用。

采用 [Base UI](https://base-ui.com) 风格的 headless 架构：
- **Compound Components** - 复合组件模式 (如 `TokenIcon.Root` / `TokenIcon.Image`)
- **useRenderElement** - 统一的渲染抽象，支持 `render` prop 自定义
- **State + Props 分离** - 组件暴露 `State` 类型供样式函数使用

## 安装

```bash
pnpm add @biochain/key-ui
```

## 组件列表

| 组件 | 路径 | 说明 |
|------|------|------|
| `AddressDisplay` | `@biochain/key-ui/address-display` | 地址显示 (智能截断 + 复制) |
| `AmountDisplay` | `@biochain/key-ui/amount-display` | 金额显示 (动画 + 紧凑模式) |
| `AmountWithFiat` | `@biochain/key-ui/amount-display` | 金额 + 法币复合显示 |
| `TokenIcon` | `@biochain/key-ui/token-icon` | Token 图标 (Compound) |

## 工具包

`@biochain/key-utils` 提供底层工具函数：

| 函数 | 说明 |
|------|------|
| `cn()` | className 合并 (clsx + tailwind-merge) |
| `formatAmount()` | 金额格式化 (紧凑模式、千分位) |
| `truncateAddress()` | 地址截断 (预设模式) |
| `measureText()` | Canvas 文字宽度测量 |
| `useCopyToClipboard()` | 复制到剪贴板 Hook |

## 架构

```
packages/
├── key-utils/          # @biochain/key-utils - 工具函数
│   └── src/
│       ├── cn.ts
│       ├── format-amount.ts
│       ├── truncate-address.ts
│       └── use-copy-to-clipboard.ts
│
└── key-ui/             # @biochain/key-ui - UI 组件
    └── src/
        ├── address-display/
        │   ├── AddressDisplay.tsx
        │   └── use-address-display.ts
        ├── amount-display/
        │   ├── AmountDisplay.tsx
        │   └── AmountWithFiat.tsx
        ├── token-icon/
        │   ├── root/
        │   ├── image/
        │   └── fallback/
        └── utils/
            ├── types.ts
            └── use-render-element.tsx
```

## 与 shadcn/ui 的关系

- shadcn/ui 基础组件 (Button, Card, Input) 由各项目独立维护
- key-ui 只提供**业务组件** (AddressDisplay, AmountDisplay, TokenIcon)
- 样式策略：默认 Tailwind class，可通过 `className` 函数覆盖
