# WalletCard 钱包卡片

Code: `src/components/wallet/wallet-card.tsx`

展示钱包概览信息（名称、地址、余额）的核心业务组件。通常用于首页或钱包列表。

## Features

*   **自动脱敏**: 自动隐藏/显示地址中间部分。
*   **复制功能**: 点击地址自动复制到剪贴板。
*   **余额展示**: 整合多链余额显示。
*   **视觉反馈**: 支持按下缩放 (Active Scale) 动画。

## Usage

```tsx
import { WalletCard } from "@/components/wallet/wallet-card"

export function WalletList({ wallet }) {
  return (
    <WalletCard 
      wallet={wallet}
      onClick={() => openDetail(wallet.id)} 
    />
  )
}
```
