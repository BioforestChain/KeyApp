/**
 * User Profile Store
 * 
 * Stores global user profile for business card sharing:
 * - username: User-defined display name (default: empty)
 * - avatar: Avatar in avatar:HASH format (Avataaars encoding)
 * - selectedWalletIds: Up to 3 wallet IDs for business card QR
 */

import { Store } from '@tanstack/react-store'
import { useStore } from '@tanstack/react-store'
import { generateRandomAvatar, encodeAvatar, generateAvatarFromSeed } from '@/lib/avatar-codec'

// Types
export interface UserProfile {
    /** User-defined display name (default: empty) */
    username: string
    /** Avatar in avatar:HASH format */
    avatar: string
    /** Selected wallet IDs for business card (max 3) */
    selectedWalletIds: string[]
}

// Storage key
const STORAGE_KEY = 'bfm_user_profile'
const MAX_WALLETS = 3

// Initial state
const initialState: UserProfile = {
    username: '',
    avatar: '',
    selectedWalletIds: [],
}

// Load from localStorage
function loadFromStorage(): UserProfile {
    try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
            const parsed = JSON.parse(stored)
            return {
                username: parsed.username ?? '',
                avatar: parsed.avatar ?? '',
                selectedWalletIds: Array.isArray(parsed.selectedWalletIds)
                    ? parsed.selectedWalletIds.slice(0, MAX_WALLETS)
                    : [],
            }
        }
    } catch {
        // Ignore parse errors
    }
    return initialState
}

// Save to localStorage
function saveToStorage(state: UserProfile): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
        // Ignore storage errors
    }
}

// Create store
export const userProfileStore = new Store<UserProfile>(loadFromStorage())

// Actions
export const userProfileActions = {
    /**
     * Set username
     */
    setUsername(username: string): void {
        userProfileStore.setState((state) => {
            const newState = { ...state, username: username.trim() }
            saveToStorage(newState)
            return newState
        })
    },

    /**
     * Randomize avatar - generates a new random Avataaars avatar
     */
    randomizeAvatar(): void {
        const config = generateRandomAvatar()
        const avatar = `avatar:${encodeAvatar(config)}`
        userProfileStore.setState((state) => {
            const newState = { ...state, avatar }
            saveToStorage(newState)
            return newState
        })
    },

    /**
     * Initialize default avatar from address (only if not already set)
     */
    initializeDefaultAvatar(address: string): void {
        userProfileStore.setState((state) => {
            if (state.avatar) return state // Already has avatar

            const config = generateAvatarFromSeed(address.toLowerCase())
            const avatar = `avatar:${encodeAvatar(config)}`
            const newState = { ...state, avatar }
            saveToStorage(newState)
            return newState
        })
    },

    /**
     * Toggle wallet selection (add/remove from selectedWalletIds)
     * Maximum 3 wallets can be selected
     */
    toggleWalletSelection(walletId: string): boolean {
        let added = false
        userProfileStore.setState((state) => {
            const currentIds = state.selectedWalletIds
            const isSelected = currentIds.includes(walletId)

            let newIds: string[]
            if (isSelected) {
                // Remove
                newIds = currentIds.filter(id => id !== walletId)
            } else {
                // Add (if under limit)
                if (currentIds.length >= MAX_WALLETS) {
                    return state // Can't add more
                }
                newIds = [...currentIds, walletId]
                added = true
            }

            const newState = { ...state, selectedWalletIds: newIds }
            saveToStorage(newState)
            return newState
        })
        return added
    },

    /**
     * Set selected wallet IDs directly (for initialization)
     */
    setSelectedWalletIds(walletIds: string[]): void {
        userProfileStore.setState((state) => {
            const newState = {
                ...state,
                selectedWalletIds: walletIds.slice(0, MAX_WALLETS)
            }
            saveToStorage(newState)
            return newState
        })
    },

    /**
     * Clear all user profile data
     */
    clear(): void {
        userProfileStore.setState(() => {
            saveToStorage(initialState)
            return initialState
        })
    },
}

// Selectors
export const userProfileSelectors = {
    /**
     * Check if a wallet is selected
     */
    isWalletSelected(state: UserProfile, walletId: string): boolean {
        return state.selectedWalletIds.includes(walletId)
    },

    /**
     * Check if can add more wallets
     */
    canAddMoreWallets(state: UserProfile): boolean {
        return state.selectedWalletIds.length < MAX_WALLETS
    },

    /**
     * Get selected wallet count
     */
    getSelectedWalletCount(state: UserProfile): number {
        return state.selectedWalletIds.length
    },
}

// Hooks
export function useUserProfile(): UserProfile {
    return useStore(userProfileStore)
}

export function useUsername(): string {
    return useStore(userProfileStore, (state) => state.username)
}

export function useAvatar(): string {
    return useStore(userProfileStore, (state) => state.avatar)
}

export function useSelectedWalletIds(): string[] {
    return useStore(userProfileStore, (state) => state.selectedWalletIds)
}

export function useIsWalletSelected(walletId: string): boolean {
    return useStore(userProfileStore, (state) => state.selectedWalletIds.includes(walletId))
}

export function useCanAddMoreWallets(): boolean {
    return useStore(userProfileStore, (state) => state.selectedWalletIds.length < MAX_WALLETS)
}
