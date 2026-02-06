import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MiniappStackView } from './miniapp-stack-view'
import { TestI18nProvider } from '@/test/i18n-mock'

type MockMiniappInstance = {
  appId: string
  manifest: { name: string; icon: string; description: string }
  lastActiveAt: number
}

type MockRuntimeState = {
  apps: Map<string, MockMiniappInstance>
  focusedAppId: string | null
}

const {
  activateAppMock,
  closeAppMock,
  closeStackViewMock,
  mockRuntimeState,
  mockRuntimeStore,
  emitStoreChange,
} = vi.hoisted(() => {
  const state: MockRuntimeState = {
    apps: new Map(),
    focusedAppId: null,
  }
  const listeners = new Set<() => void>()

  return {
    activateAppMock: vi.fn(),
    closeAppMock: vi.fn(),
    closeStackViewMock: vi.fn(),
    mockRuntimeState: state,
    mockRuntimeStore: {
      get state() {
        return state
      },
      subscribe(listener: () => void) {
        listeners.add(listener)
        return () => listeners.delete(listener)
      },
    },
    emitStoreChange: () => {
      listeners.forEach((listener) => listener())
    },
  }
})

vi.mock('@/services/miniapp-runtime', () => ({
  miniappRuntimeStore: mockRuntimeStore,
  miniappRuntimeSelectors: {
    getApps: (state: MockRuntimeState) => Array.from(state.apps.values()),
    getFocusedAppId: (state: MockRuntimeState) => state.focusedAppId,
  },
  activateApp: (...args: unknown[]) => activateAppMock(...args),
  closeApp: (...args: unknown[]) => closeAppMock(...args),
  closeStackView: (...args: unknown[]) => closeStackViewMock(...args),
}))

function renderWithProviders(ui: React.ReactElement) {
  return render(<TestI18nProvider>{ui}</TestI18nProvider>)
}

describe('MiniappStackView', () => {
  beforeEach(() => {
    mockRuntimeState.apps = new Map([
      [
        'app-a',
        {
          appId: 'app-a',
          manifest: {
            name: 'App A',
            icon: 'https://example.com/a.png',
            description: 'A desc',
          },
          lastActiveAt: 10,
        },
      ],
      [
        'app-b',
        {
          appId: 'app-b',
          manifest: {
            name: 'App B',
            icon: 'https://example.com/b.png',
            description: 'B desc',
          },
          lastActiveAt: 20,
        },
      ],
    ])
    mockRuntimeState.focusedAppId = 'app-a'
    emitStoreChange()

    activateAppMock.mockReset()
    closeAppMock.mockReset()
    closeStackViewMock.mockReset()
  })

  it('renders list items sorted by lastActiveAt desc', () => {
    renderWithProviders(<MiniappStackView visible={true} />)

    const items = screen.getAllByTestId(/stack-item-/)
    expect(items).toHaveLength(2)
    expect(items[0]).toHaveAttribute('data-app-id', 'app-b')
    expect(items[1]).toHaveAttribute('data-app-id', 'app-a')
  })

  it('activates app and closes stack view when item clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<MiniappStackView visible={true} />)

    await user.click(screen.getByTestId('stack-item-app-b'))

    expect(activateAppMock).toHaveBeenCalledWith('app-b')
    expect(closeStackViewMock).toHaveBeenCalledTimes(1)
  })

  it('closes single app when close button clicked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<MiniappStackView visible={true} />)

    await user.click(screen.getByTestId('stack-close-app-a'))

    expect(closeAppMock).toHaveBeenCalledWith('app-a')
    expect(activateAppMock).not.toHaveBeenCalled()
    expect(closeStackViewMock).not.toHaveBeenCalled()
  })
})
