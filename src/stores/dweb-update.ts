import { Store } from '@tanstack/react-store'
import { useStore } from '@tanstack/react-store'
import type { DwebUpdateCheckResult, DwebUpdateStatus } from '@/lib/dweb-update'
import { checkDwebUpdate } from '@/lib/dweb-update'

export type DwebUpdateViewStatus = 'idle' | 'checking' | DwebUpdateStatus

export interface DwebUpdateState {
  status: DwebUpdateViewStatus
  currentVersion: string
  latestVersion?: string
  changeLog?: string
  metadataUrl?: string
  installUrl?: string
  error?: string
  lastCheckedAt?: number
  dialogOpen: boolean
}

const initialState: DwebUpdateState = {
  status: 'idle',
  currentVersion: __APP_VERSION__,
  dialogOpen: false,
}

export const dwebUpdateStore = new Store<DwebUpdateState>(initialState)

export const dwebUpdateActions = {
  openDialog: () => {
    dwebUpdateStore.setState((state) => ({ ...state, dialogOpen: true }))
  },
  closeDialog: () => {
    dwebUpdateStore.setState((state) => ({ ...state, dialogOpen: false }))
  },
  check: async (source: 'auto' | 'manual'): Promise<DwebUpdateCheckResult> => {
    const { status } = dwebUpdateStore.state
    if (status === 'checking') {
      return {
        status: 'error',
        currentVersion: __APP_VERSION__,
        metadataUrl: '',
        installUrl: '',
        error: 'already checking',
      }
    }
    dwebUpdateStore.setState((state) => ({ ...state, status: 'checking' }))

    const result = await checkDwebUpdate()
    dwebUpdateStore.setState((state) => ({
      ...state,
      status: result.status,
      currentVersion: result.currentVersion,
      latestVersion: result.latestVersion,
      changeLog: result.changeLog,
      metadataUrl: result.metadataUrl,
      installUrl: result.installUrl,
      error: result.error,
      lastCheckedAt: Date.now(),
      dialogOpen: result.status === 'update-available' ? true : state.dialogOpen,
    }))

    if (source === 'auto' && result.status !== 'update-available') {
      dwebUpdateStore.setState((state) => ({ ...state, dialogOpen: false }))
    }

    return result
  },
}

export function useDwebUpdateState(): DwebUpdateState {
  return useStore(dwebUpdateStore)
}
