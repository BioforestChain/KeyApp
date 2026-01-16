import { describe, it, expect, beforeEach, vi } from 'vitest'
import { userProfileStore, userProfileActions, userProfileSelectors } from './user-profile'

// Mock localStorage
const localStorageMock = (() => {
    let store: Record<string, string> = {}
    return {
        getItem: vi.fn((key: string) => store[key] ?? null),
        setItem: vi.fn((key: string, value: string) => { store[key] = value }),
        removeItem: vi.fn((key: string) => { delete store[key] }),
        clear: vi.fn(() => { store = {} }),
    }
})()

Object.defineProperty(global, 'localStorage', { value: localStorageMock })

describe('userProfileStore', () => {
    beforeEach(() => {
        localStorageMock.clear()
        vi.clearAllMocks()
        // Reset store to initial state
        userProfileActions.clear()
    })

    describe('initial state', () => {
        it('has empty username by default', () => {
            expect(userProfileStore.state.username).toBe('')
        })

        it('has empty avatar by default', () => {
            expect(userProfileStore.state.avatar).toBe('')
        })

        it('has empty selectedWalletIds by default', () => {
            expect(userProfileStore.state.selectedWalletIds).toEqual([])
        })
    })

    describe('setUsername', () => {
        it('sets username', () => {
            userProfileActions.setUsername('Alice')
            expect(userProfileStore.state.username).toBe('Alice')
        })

        it('trims whitespace', () => {
            userProfileActions.setUsername('  Bob  ')
            expect(userProfileStore.state.username).toBe('Bob')
        })

        it('persists to localStorage', () => {
            userProfileActions.setUsername('Charlie')
            expect(localStorageMock.setItem).toHaveBeenCalled()
            const stored = JSON.parse(localStorageMock.setItem.mock.calls.at(-1)?.[1] ?? '{}')
            expect(stored.username).toBe('Charlie')
        })
    })

    describe('randomizeAvatar', () => {
        it('generates avatar with avatar: prefix', () => {
            userProfileActions.randomizeAvatar()
            expect(userProfileStore.state.avatar).toMatch(/^avatar:.+$/)
        })

        it('generates different avatars on each call', () => {
            userProfileActions.randomizeAvatar()
            const first = userProfileStore.state.avatar
            userProfileActions.randomizeAvatar()
            const second = userProfileStore.state.avatar
            // Note: There's a small chance they could be the same, but very unlikely
            expect(first).not.toBe(second)
        })
    })

    describe('initializeDefaultAvatar', () => {
        it('sets avatar from address if not already set', () => {
            expect(userProfileStore.state.avatar).toBe('')
            userProfileActions.initializeDefaultAvatar('0x1234567890abcdef')
            expect(userProfileStore.state.avatar).toMatch(/^avatar:.+$/)
        })

        it('does not override existing avatar', () => {
            userProfileActions.randomizeAvatar()
            const existing = userProfileStore.state.avatar
            userProfileActions.initializeDefaultAvatar('0xabcdef1234567890')
            expect(userProfileStore.state.avatar).toBe(existing)
        })

        it('generates consistent avatar for same address', () => {
            userProfileActions.initializeDefaultAvatar('0x1234567890abcdef')
            const first = userProfileStore.state.avatar
            userProfileActions.clear()
            userProfileActions.initializeDefaultAvatar('0x1234567890abcdef')
            const second = userProfileStore.state.avatar
            expect(first).toBe(second)
        })
    })

    describe('toggleWalletSelection', () => {
        it('adds wallet to selection', () => {
            const added = userProfileActions.toggleWalletSelection('wallet-1')
            expect(added).toBe(true)
            expect(userProfileStore.state.selectedWalletIds).toContain('wallet-1')
        })

        it('removes wallet when already selected', () => {
            userProfileActions.toggleWalletSelection('wallet-1')
            const added = userProfileActions.toggleWalletSelection('wallet-1')
            expect(added).toBe(false)
            expect(userProfileStore.state.selectedWalletIds).not.toContain('wallet-1')
        })

        it('allows up to 3 wallets', () => {
            userProfileActions.toggleWalletSelection('wallet-1')
            userProfileActions.toggleWalletSelection('wallet-2')
            userProfileActions.toggleWalletSelection('wallet-3')
            expect(userProfileStore.state.selectedWalletIds).toHaveLength(3)
        })

        it('prevents adding more than 3 wallets', () => {
            userProfileActions.toggleWalletSelection('wallet-1')
            userProfileActions.toggleWalletSelection('wallet-2')
            userProfileActions.toggleWalletSelection('wallet-3')
            const added = userProfileActions.toggleWalletSelection('wallet-4')
            expect(added).toBe(false)
            expect(userProfileStore.state.selectedWalletIds).toHaveLength(3)
            expect(userProfileStore.state.selectedWalletIds).not.toContain('wallet-4')
        })
    })

    describe('setSelectedWalletIds', () => {
        it('sets wallet IDs directly', () => {
            userProfileActions.setSelectedWalletIds(['a', 'b'])
            expect(userProfileStore.state.selectedWalletIds).toEqual(['a', 'b'])
        })

        it('truncates to 3 wallets', () => {
            userProfileActions.setSelectedWalletIds(['a', 'b', 'c', 'd', 'e'])
            expect(userProfileStore.state.selectedWalletIds).toEqual(['a', 'b', 'c'])
        })
    })

    describe('selectors', () => {
        it('isWalletSelected returns true for selected wallet', () => {
            userProfileActions.toggleWalletSelection('wallet-1')
            expect(userProfileSelectors.isWalletSelected(userProfileStore.state, 'wallet-1')).toBe(true)
        })

        it('isWalletSelected returns false for unselected wallet', () => {
            expect(userProfileSelectors.isWalletSelected(userProfileStore.state, 'wallet-1')).toBe(false)
        })

        it('canAddMoreWallets returns true when under limit', () => {
            userProfileActions.toggleWalletSelection('wallet-1')
            expect(userProfileSelectors.canAddMoreWallets(userProfileStore.state)).toBe(true)
        })

        it('canAddMoreWallets returns false when at limit', () => {
            userProfileActions.toggleWalletSelection('wallet-1')
            userProfileActions.toggleWalletSelection('wallet-2')
            userProfileActions.toggleWalletSelection('wallet-3')
            expect(userProfileSelectors.canAddMoreWallets(userProfileStore.state)).toBe(false)
        })

        it('getSelectedWalletCount returns correct count', () => {
            userProfileActions.toggleWalletSelection('wallet-1')
            userProfileActions.toggleWalletSelection('wallet-2')
            expect(userProfileSelectors.getSelectedWalletCount(userProfileStore.state)).toBe(2)
        })
    })

    describe('clear', () => {
        it('resets all state to initial values', () => {
            userProfileActions.setUsername('Test')
            userProfileActions.randomizeAvatar()
            userProfileActions.toggleWalletSelection('wallet-1')

            userProfileActions.clear()

            expect(userProfileStore.state.username).toBe('')
            expect(userProfileStore.state.avatar).toBe('')
            expect(userProfileStore.state.selectedWalletIds).toEqual([])
        })
    })
})
