# 第二十四章：Vitest 配置

> 单元测试、组件测试、Mock

---

## 24.1 配置文件

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin'
import { playwright } from '@vitest/browser-playwright'

export default defineConfig({
  test: {
    projects: [
      // 单元测试
      {
        extends: './vite.config.ts',
        test: {
          name: 'unit',
          globals: true,
          environment: 'jsdom',
          setupFiles: ['./src/test/setup.ts'],
          include: ['src/**/*.{test,spec}.{ts,tsx}'],
        },
      },
      // Storybook 组件测试
      {
        extends: './vite.config.ts',
        plugins: [storybookTest({ configDir: '.storybook' })],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            provider: playwright(),
            headless: true,
          },
        },
      },
    ],
  },
})
```

---

## 24.2 测试 Setup

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

afterEach(() => cleanup())

// Mock localStorage
vi.stubGlobal('localStorage', {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
})

// Mock crypto
vi.stubGlobal('crypto', {
  getRandomValues: (arr: Uint8Array) => {
    for (let i = 0; i < arr.length; i++) arr[i] = Math.floor(Math.random() * 256)
    return arr
  },
  subtle: globalThis.crypto?.subtle,
})
```

---

## 24.3 Store 测试

```typescript
// src/stores/wallet.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { walletStore, walletActions } from './wallet'

describe('WalletStore', () => {
  beforeEach(() => {
    walletStore.setState(() => ({ wallets: [], currentWalletId: null }))
  })
  
  it('should add wallet', () => {
    const wallet = { id: '1', name: 'Test' }
    walletActions.addWallet(wallet)
    
    expect(walletStore.state.wallets).toHaveLength(1)
    expect(walletStore.state.currentWalletId).toBe('1')
  })
})
```

---

## 24.4 组件测试

```typescript
// src/components/wallet/wallet-card.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { WalletCard } from './wallet-card'

describe('WalletCard', () => {
  const mockWallet = { id: '1', name: 'Test Wallet' }
  
  it('renders wallet name', () => {
    render(<WalletCard wallet={mockWallet} />)
    expect(screen.getByText('Test Wallet')).toBeInTheDocument()
  })
  
  it('calls onTransfer when transfer button clicked', async () => {
    const onTransfer = vi.fn()
    render(<WalletCard wallet={mockWallet} onTransfer={onTransfer} />)
    
    await userEvent.click(screen.getByRole('button', { name: /转账/ }))
    expect(onTransfer).toHaveBeenCalled()
  })
})
```

---

## 24.5 运行命令

```bash
# 运行单元测试
pnpm test

# 运行 Storybook 测试
pnpm test:storybook

# 运行所有测试
pnpm test:all

# 覆盖率报告
pnpm test:coverage
```

---

## 本章小结

- 双项目配置：unit + storybook
- Mock localStorage 和 crypto
- 使用 Testing Library 测试组件
