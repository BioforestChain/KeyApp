import { ChainConfigSubscriptionSchema } from './schema'
import type { ChainConfig, ChainConfigSource, ChainConfigSubscription } from './types'

const DB_NAME = 'bfm_chain_config'
const DB_VERSION = 1

const STORE_CONFIGS = 'chain_configs'
const STORE_PREFERENCES = 'chain_preferences'

type BaseChainConfig = Omit<ChainConfig, 'enabled' | 'source'>

interface ChainConfigRecord {
  key: string
  id: string
  source: ChainConfigSource
  config: BaseChainConfig
}

interface PreferenceRecord {
  key: string
  value: unknown
}

let dbInstance: IDBDatabase | null = null
let dbOpening: Promise<IDBDatabase> | null = null

function assertIndexedDbAvailable(): void {
  if (typeof indexedDB === 'undefined') {
    throw new Error('indexedDB is not available in this environment')
  }
}

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('IndexedDB request failed'))
  })
}

function transactionDone(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error ?? new Error('IndexedDB transaction failed'))
    tx.onabort = () => reject(tx.error ?? new Error('IndexedDB transaction aborted'))
  })
}

async function getDb(): Promise<IDBDatabase> {
  assertIndexedDbAvailable()

  if (dbInstance) return dbInstance
  if (dbOpening) return dbOpening

  dbOpening = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = () => {
      const db = request.result

      if (!db.objectStoreNames.contains(STORE_CONFIGS)) {
        const store = db.createObjectStore(STORE_CONFIGS, { keyPath: 'key' })
        store.createIndex('source', 'source', { unique: false })
      }

      if (!db.objectStoreNames.contains(STORE_PREFERENCES)) {
        db.createObjectStore(STORE_PREFERENCES, { keyPath: 'key' })
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('Failed to open IndexedDB'))
  })

  try {
    dbInstance = await dbOpening
    return dbInstance
  } finally {
    dbOpening = null
  }
}

async function listKeysBySource(store: IDBObjectStore, source: ChainConfigSource): Promise<IDBValidKey[]> {
  const index = store.index('source')
  const keys: IDBValidKey[] = []

  return new Promise((resolve, reject) => {
    const request = index.openCursor(IDBKeyRange.only(source))
    request.onsuccess = () => {
      const cursor = request.result
      if (!cursor) {
        resolve(keys)
        return
      }
      keys.push(cursor.primaryKey)
      cursor.continue()
    }
    request.onerror = () => reject(request.error ?? new Error('Failed to read IndexedDB cursor'))
  })
}

/**
 * Persist chain configs for a given source.
 *
 * Behavior: replaces all existing configs under the same source (prevents stale leftovers).
 */
export async function saveChainConfigs(options: {
  source: ChainConfigSource
  configs: readonly ChainConfig[]
}): Promise<void> {
  const db = await getDb()
  const tx = db.transaction([STORE_CONFIGS], 'readwrite')
  const store = tx.objectStore(STORE_CONFIGS)

  const keysToDelete = await listKeysBySource(store, options.source)
  for (const key of keysToDelete) {
    store.delete(key)
  }

  for (const config of options.configs) {
    const base: BaseChainConfig = {
      id: config.id,
      version: config.version,
      type: config.type,
      name: config.name,
      symbol: config.symbol,
      decimals: config.decimals,
      ...(config.icon !== undefined ? { icon: config.icon } : {}),
      ...(config.prefix !== undefined ? { prefix: config.prefix } : {}),
      ...(config.rpcUrl !== undefined ? { rpcUrl: config.rpcUrl } : {}),
      ...(config.explorerUrl !== undefined ? { explorerUrl: config.explorerUrl } : {}),
    }

    const record: ChainConfigRecord = {
      key: `${options.source}:${config.id}`,
      id: config.id,
      source: options.source,
      config: base,
    }

    store.put(record)
  }

  await transactionDone(tx)
}

export async function loadChainConfigs(): Promise<ChainConfig[]> {
  const db = await getDb()
  const tx = db.transaction([STORE_CONFIGS], 'readonly')
  const store = tx.objectStore(STORE_CONFIGS)

  const records = await requestToPromise(store.getAll())
  await transactionDone(tx)

  return records
    .filter((r): r is ChainConfigRecord => {
      return (
        typeof r === 'object' &&
        r !== null &&
        'source' in r &&
        'config' in r &&
        'id' in r
      )
    })
    .map((record) => ({
      ...record.config,
      source: record.source,
      enabled: true,
    }))
}

function isRecordOfBoolean(value: unknown): value is Record<string, boolean> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false
  for (const entry of Object.values(value as Record<string, unknown>)) {
    if (typeof entry !== 'boolean') return false
  }
  return true
}

export async function saveUserPreferences(preferences: Record<string, boolean>): Promise<void> {
  const db = await getDb()
  const tx = db.transaction([STORE_PREFERENCES], 'readwrite')
  const store = tx.objectStore(STORE_PREFERENCES)

  const record: PreferenceRecord = { key: 'enabledMap', value: preferences }
  store.put(record)

  await transactionDone(tx)
}

export async function loadUserPreferences(): Promise<Record<string, boolean>> {
  const db = await getDb()
  const tx = db.transaction([STORE_PREFERENCES], 'readonly')
  const store = tx.objectStore(STORE_PREFERENCES)

  const record = await requestToPromise(store.get('enabledMap'))
  await transactionDone(tx)

  if (!record || typeof record !== 'object') return {}
  const value = (record as PreferenceRecord).value
  return isRecordOfBoolean(value) ? value : {}
}

export async function saveSubscriptionMeta(meta: ChainConfigSubscription): Promise<void> {
  const db = await getDb()
  const tx = db.transaction([STORE_PREFERENCES], 'readwrite')
  const store = tx.objectStore(STORE_PREFERENCES)

  const record: PreferenceRecord = { key: 'subscriptionMeta', value: meta }
  store.put(record)

  await transactionDone(tx)
}

export async function loadSubscriptionMeta(): Promise<ChainConfigSubscription | null> {
  const db = await getDb()
  const tx = db.transaction([STORE_PREFERENCES], 'readonly')
  const store = tx.objectStore(STORE_PREFERENCES)

  const record = await requestToPromise(store.get('subscriptionMeta'))
  await transactionDone(tx)

  if (!record || typeof record !== 'object') return null
  const value = (record as PreferenceRecord).value
  const parsed = ChainConfigSubscriptionSchema.safeParse(value)
  return parsed.success ? parsed.data : null
}

export async function resetChainConfigStorageForTests(): Promise<void> {
  assertIndexedDbAvailable()

  if (dbInstance) {
    dbInstance.close()
    dbInstance = null
  }
  dbOpening = null

  await new Promise<void>((resolve, reject) => {
    const request = indexedDB.deleteDatabase(DB_NAME)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error ?? new Error('Failed to delete IndexedDB database'))
    request.onblocked = () => resolve()
  })
}
